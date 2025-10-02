'use client';
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Types matching the materialized views
interface MoldInfo {
  name?: string;
  description?: string;
  is_swapped: boolean;
  swap_color?: string;
}

interface MachineDataPoint {
  timestamp: string;
  machine_name: string;
  machine_id: number;
  board: number;
  port: number;
  shot_count: number;
  mold_info?: MoldInfo;
}

// New types for materialized views
interface DailyShotsView {
  machine_key: string;
  board: string;
  port: string;
  shot_date: string;
  shot_count: number;
  mold_name: string | null;
  mold_description: string | null;
  is_swapped: boolean;
  swap_color: string;
}

interface HourShotsView {
  machine_key: string;
  board: string;
  port: string;
  shot_hour: string;
  shot_count: number;
  mold_name: string | null;
  mold_description: string | null;
  is_swapped: boolean;
  swap_color: string;
}

interface MinuteShotsView {
  machine_key: string;
  board: string;
  port: string;
  shot_minute: string;
  shot_count: number;
  mold_name: string | null;
  mold_description: string | null;
  is_swapped: boolean;
  swap_color: string;
}

interface MachineMonitoringResponse {
  success: boolean;
  data: MachineDataPoint[];
  meta: {
    start_date: string;
    end_date: string;
    total_records: number;
    machines_count: number;
  };
}

interface Machine {
  id: number;
  board: number;
  port: number;
  name: string;
  volgorde: number;
  visible: boolean;
  current_mold?: {
    mold_name: string | null;
    mold_description: string | null;
    is_swapped: boolean;
    swap_color: string;
    last_seen: string;
  } | null;
}

export default function MachineMonitoringTable() {
  const [data, setData] = useState<MachineDataPoint[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('2020-09-01');
  const [endDate, setEndDate] = useState('2020-09-30');

  const toEuropean = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };
  const [showTable, setShowTable] = useState(true);
  const [showCharts, setShowCharts] = useState(true);
  const [granularity, setGranularity] = useState<'minute' | 'hour' | 'day'>('day');

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        // Fetch machines with mold information
        const response = await fetch('./machine-dashboard/api/monitoring?endpoint=machines&machines_only=true&include_molds=true');
        const result = await response.json();

        if (result.success) {
          console.log('Machines with molds:', result);
          
          const sortedMachines = (result.machines || []).sort((a: Machine, b: Machine) => {
            const nameA = (a.name || `${a.board}-${a.port}`).toLowerCase();
            const nameB = (b.name || `${b.board}-${b.port}`).toLowerCase();
            return nameA.localeCompare(nameB);
          });
          setMachines(sortedMachines);
          
          const visibleMachines = sortedMachines
            .filter((m: Machine) => m.visible)
            .slice(0, 1)
            .map((m: Machine) => `${m.board}-${m.port}`);
          setSelectedMachines(visibleMachines);
      }
      } catch (err) {
        console.error('Failed to fetch machines:', err);
      }
    };

    fetchMachines();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        endpoint: 'machines',
        start: startDate + 'T00:00:00.000Z',
        end: endDate + 'T23:59:59.999Z',
        granularity: granularity
      });

      if (selectedMachines.length > 0) {
        params.set('machines', selectedMachines.join(','));
      }

      const response = await fetch(`./machine-dashboard/api/monitoring?${params}`);
      const result: MachineMonitoringResponse = await response.json();

      if (result.success) {
        console.log('API Response data sample:', result.data.slice(0, 3));
        
        // Log mold info to verify it's coming through
        console.log('Mold info sample:', result.data
          .filter(d => d.mold_info)
          .slice(0, 3)
          .map(d => ({
            machine: d.machine_name,
            mold: d.mold_info?.name,
            description: d.mold_info?.description,
            swapped: d.mold_info?.is_swapped
          }))
        );
        
        setData(result.data);
      } else {
        setError('Failed to fetch machine monitoring data');
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleRefresh = async () => {
    if (selectedMachines.length === 0) {
      setError('Please select at least one machine before refreshing');
      return;
    }
    if (endDate < startDate) {
      window.alert('End date cannot be before start date. Please select a valid date range.');
      return;
    }
    await fetchData();
  };

    const formatTimestamp = (timestamp: string) => {
    if (!timestamp) {
      return 'Invalid timestamp';
    }

    let cleanedTimestamp = timestamp;
    
    // Handle various timestamp formats
    // Remove +00:00 before .000Z
    cleanedTimestamp = cleanedTimestamp.replace('+00:00.000Z', '.000Z');
    // Remove +00:00 and add .000Z if not present
    if (cleanedTimestamp.includes('+00:00')) {
      cleanedTimestamp = cleanedTimestamp.replace('+00:00', '');
      if (!cleanedTimestamp.endsWith('Z')) {
        cleanedTimestamp += 'Z';
      }
    }
    
    const date = new Date(cleanedTimestamp);

    if (isNaN(date.getTime())) {
      console.error('Invalid timestamp:', timestamp, 'cleaned:', cleanedTimestamp);
      return `Raw: ${timestamp}`;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const getRowStyle = (moldInfo?: MoldInfo) => {
    // Return empty object to use default table styling
    return {};
  };

  const prepareChartData = () => {
    const machineColors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];

    const groupedData = data.reduce((acc, item) => {
      const machineKey = `${item.machine_name} (${item.board}-${item.port})`;
      if (!acc[machineKey]) {
        acc[machineKey] = [];
      }
      acc[machineKey].push({
        x: item.timestamp,
        y: item.shot_count
      });
      return acc;
    }, {} as Record<string, Array<{x: string, y: number}>>);

    const addGapBreaks = (points: Array<{x: string, y: number}>) => {
      if (points.length <= 1) return points;
      
      const sortedPoints = points.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());
      const result: Array<{x: string, y: number | null}> = [];
      
      let expectedInterval: number;
      switch (granularity) {
        case 'minute':
          expectedInterval = 60 * 1000;
          break;
        case 'hour':
          expectedInterval = 60 * 60 * 1000;
          break;
        case 'day':
          expectedInterval = 24 * 60 * 60 * 1000;
          break;
        default:
          expectedInterval = 24 * 60 * 60 * 1000;
      }
      
      for (let i = 0; i < sortedPoints.length; i++) {
        result.push(sortedPoints[i]);
        
        if (i < sortedPoints.length - 1) {
          const currentTime = new Date(sortedPoints[i].x).getTime();
          const nextTime = new Date(sortedPoints[i + 1].x).getTime();
          const timeDiff = nextTime - currentTime;
          
          if (timeDiff > expectedInterval * 2) {
            result.push({
              x: sortedPoints[i].x,
              y: null
            });
          }
        }
      }
      
      return result;
    };

    const datasets = Object.entries(groupedData).map(([machineName, points], index) => ({
      label: machineName,
      data: addGapBreaks(points),
      borderColor: machineColors[index % machineColors.length],
      backgroundColor: machineColors[index % machineColors.length] + '20',
      tension: 0.1,
      spanGaps: false,
    }));

    return {
      datasets
    };
  };

  // Calculate statistics with mold information
  const getMoldStatistics = () => {
    const uniqueMolds = new Set(
      data
        .filter(d => d.mold_info?.name)
        .map(d => d.mold_info!.name)
    );
    
    const swappedCount = data.filter(d => d.mold_info?.is_swapped).length;
    const normalCount = data.filter(d => d.mold_info && !d.mold_info.is_swapped).length;
    
    return {
      uniqueMolds: uniqueMolds.size,
      swappedCount,
      normalCount,
      moldCoverage: data.filter(d => d.mold_info).length
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading machine monitoring data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (selectedMachines.length === 0 && !loading) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <strong className="font-bold">No machines selected: </strong>
        <span className="block sm:inline">Please select at least one machine to view monitoring data. The dataset contains 1.7M rows, so machine selection is required for performance.</span>
      </div>
    );
  }

  const moldStats = getMoldStatistics();

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="mb-4">
          <label className="block text-[1rem] font-medium text-white mb-2">
            Select Machines
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-40 overflow-y-auto border rounded p-2">
            {machines.filter(m => m.visible).map((machine) => {
              const machineKey = `${machine.board}-${machine.port}`;
              return (
                <label key={machineKey} className="flex items-center space-x-1 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedMachines.includes(machineKey)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMachines(prev => [...prev, machineKey]);
                      } else {
                        setSelectedMachines(prev => prev.filter(m => m !== machineKey));
                      }
                    }}
                    className="rounded"
                  />
                  <div className="flex flex-col">
                    <span>{machine.name || `${machine.board}-${machine.port}`}</span>
                    {machine.current_mold?.mold_name && (
                      <span className="text-xs text-gray-400">
                        {machine.current_mold.mold_name}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {selectedMachines.length} of {machines.filter(m => m.visible).length} machines selected
          </div>
        </div>

        <div className="flex gap-4 mb-4 items-center">
          <div className="flex flex-col">
            <label htmlFor="startDate" className="block text-sm font-medium text-white">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full border border-white rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-300 mt-1">Selected: {toEuropean(startDate)}</div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="endDate" className="block text-sm font-medium text-white">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full border border-white rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-300 mt-1">Selected: {toEuropean(endDate)}</div>
          </div>
          <div className="mb-5 flex flex-col justify-between">
            <label htmlFor="granularity" className="block text-sm font-medium text-white">
              Time Granularity
            </label>
            <select
              id="granularity"
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as 'minute' | 'hour' | 'day')}
              className="mt-1 block w-full border border-white p-0.5 rounded-md shadow-sm bg-black text-white"
            >
              <option value="day">Daily</option>
              <option value="hour">Hourly</option>
              <option value="minute">Per Minute</option>
            </select>
          </div>
          <div className="ml-20 flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={selectedMachines.length === 0}
              className="px-4 py-2 bg-[#00A527] text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="px-4 py-2 bg-[#222523] text-white rounded-md hover:bg-gray-500"
            >
              {showCharts ? 'Hide' : 'Show'} Charts
            </button>
            <button
              onClick={() => setShowTable(!showTable)}
              className="px-4 py-2 bg-[#222523] text-white rounded-md hover:bg-gray-500"
            >
              {showTable ? 'Hide' : 'Show'} Table
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-l-4 border-green-500"></div>
            <span>Normal Operation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-l-4 border-red-500"></div>
            <span>Mold Swapped</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {showCharts && data.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Shot Count Trends</h2>
          <div className="bg-black p-4 rounded-lg border border-[#222523]">
            <Line
              data={prepareChartData()}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                  title: {
                    display: true,
                    text: 'Machine Shot Counts Over Time'
                  },
                  tooltip: {
                    callbacks: {
                      afterLabel: function(context) {
                        // Find the corresponding data point with mold info
                        const timestamp = context.parsed.x;
                        const datasetLabel = context.dataset.label;
                        
                        // Extract board-port from label (e.g., "Machine Name (1-2)")
                        const match = datasetLabel?.match(/\((\d+-\d+)\)/);
                        if (!match) return '';
                        
                        const [board, port] = match[1].split('-').map(Number);
                        
                        // Find matching data point - normalize timestamps for comparison
                        const dataPoint = data.find(d => {
                          if (d.board !== board || d.port !== port) return false;
                          
                          // Normalize both timestamps to compare
                          const normalizeTimestamp = (ts: string) => {
                            let cleaned = ts.replace('+00:00.000Z', '.000Z')
                                           .replace('+00:00', '')
                                           .replace(/Z.*$/, 'Z');
                            if (!cleaned.endsWith('Z')) cleaned += 'Z';
                            return new Date(cleaned).getTime();
                          };
                          
                          const dataTime = normalizeTimestamp(d.timestamp);
                          const contextTime = timestamp;
                          
                          // Allow small time difference (1 second) to account for rounding
                          return Math.abs(dataTime - contextTime) < 1000;
                        });
                        
                        if (dataPoint?.mold_info) {
                          const lines = [];
                          lines.push('─────────────────');
                          lines.push(`Mold: ${dataPoint.mold_info.name || 'Unknown'}`);
                          if (dataPoint.mold_info.description) {
                            lines.push(`Description: ${dataPoint.mold_info.description}`);
                          }
                          lines.push(`Status: ${dataPoint.mold_info.is_swapped ? 'Swapped' : 'Normal Operation'}`);
                          return lines;
                        }
                        
                        return ['─────────────────', 'No mold data'];
                      }
                    },
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    padding: 12,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#666',
                    borderWidth: 1
                  }
                },
                scales: {
                  x: {
                    type: 'time',
                    time: {
                      unit: granularity === 'minute' ? 'minute' : granularity === 'hour' ? 'hour' : 'day',
                      displayFormats: {
                        minute: 'HH:mm',
                        hour: 'MMM dd HH:mm',
                        day: 'MMM dd'
                      }
                    },
                    title: {
                      display: true,
                      text: granularity === 'minute' ? 'Time (minutes)' : granularity === 'hour' ? 'Time (hours)' : 'Date'
                    }
                  },
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Shot Count'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Data Table Section */}
      {showTable && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Machine Monitoring Data</h2>
          <div className="overflow-x-auto border border-gray-300 rounded-lg bg-black">
            <table className="min-w-full">
          <thead className="bg-[#222523]">
            <tr>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Machine
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Board/Port
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Shot Count
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Mold Info
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-900">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {formatTimestamp(item.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                  {item.machine_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {item.board}-{item.port}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {item.shot_count}
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  {item.mold_info ? (
                    <div>
                      <div className="font-medium">{item.mold_info.name || 'Unknown'}</div>
                      {item.mold_info.description && (
                        <div className="text-gray-400 text-xs">{item.mold_info.description}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500">No mold data</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {item.mold_info ? (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.mold_info.is_swapped 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.mold_info.is_swapped ? 'Swapped' : 'Normal'}
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-200">
                      No Data
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No machine monitoring data available for the selected date range.
          </div>
        )}
          </div>

          {data.length > 0 && (
            <div className="mt-6 p-4 bg-[#222523] rounded-lg text-gray-200">
              <h3 className="text-lg font-medium mb-2 text-white">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Records:</span> {data.length}
                </div>
                <div>
                  <span className="font-medium">Unique Machines:</span> {new Set(data.map(d => d.machine_id)).size}
                </div>
                <div>
                  <span className="font-medium">Total Shots:</span> {data.reduce((sum, d) => sum + d.shot_count, 0).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Unique Molds:</span> {moldStats.uniqueMolds}
                </div>
                <div>
                  <span className="font-medium">Swapped Records:</span> {moldStats.swappedCount} / {moldStats.moldCoverage}
                </div>
              </div>
              
              {/* Additional mold statistics */}
              <div className="mt-4 pt-4 border-t border-gray-600">
                <h4 className="font-medium mb-2 text-white">Mold Status Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Normal: {moldStats.normalCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Swapped: {moldStats.swappedCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span>No Data: {data.length - moldStats.moldCoverage}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}