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
}

export default function MachineMonitoringTable() {
  const [data, setData] = useState<MachineDataPoint[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('2020-09-07');
  const [endDate, setEndDate] = useState('2020-09-07');

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
        const response = await fetch('/api/monitoring?endpoint=machines&machines_only=true');
        const result = await response.json();

        if (result.success) {
          const sortedMachines = (result.machines || []).sort((a: Machine, b: Machine) => {
            const nameA = (a.name || `${a.board}-${a.port}`).toLowerCase();
            const nameB = (b.name || `${b.board}-${b.port}`).toLowerCase();
            return nameA.localeCompare(nameB);
          });
          setMachines(sortedMachines);
          const visibleMachines = sortedMachines
            .filter((m: Machine) => m.visible)
            .slice(0, 3)
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

      const response = await fetch(`/api/monitoring?${params}`);
      const result: MachineMonitoringResponse = await response.json();

      if (result.success) {
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
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const getRowStyle = (moldInfo?: MoldInfo) => {
    if (!moldInfo) return {};

    if (moldInfo.is_swapped) {
      return {
        backgroundColor: '#ffebee',
        borderLeft: '4px solid #f44336'
      };
    }

    return {
      backgroundColor: '#e8f5e8',
      borderLeft: '4px solid #4caf50'
    };
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

    const datasets = Object.entries(groupedData).map(([machineName, points], index) => ({
      label: machineName,
      data: points.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime()),
      borderColor: machineColors[index % machineColors.length],
      backgroundColor: machineColors[index % machineColors.length] + '20',
      tension: 0.1,
    }));

    return {
      datasets
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Select Machines
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-32 overflow-y-auto border rounded p-2">
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
                  <span>{machine.name || `${machine.board}-${machine.port}`}</span>
                </label>
              );
            })}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {selectedMachines.length} of {machines.filter(m => m.visible).length} machines selected
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-white">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-300 mt-1">Selected: {toEuropean(startDate)}</div>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-white">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-300 mt-1">Selected: {toEuropean(endDate)}</div>
          </div>
          <div>
            <label htmlFor="granularity" className="block text-sm font-medium text-white">
              Time Granularity
            </label>
            <select
              id="granularity"
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as 'minute' | 'hour' | 'day')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="day">Daily</option>
              <option value="hour">Hourly</option>
              <option value="minute">Per Minute</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleRefresh}
              disabled={selectedMachines.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {showCharts ? 'Hide' : 'Show'} Charts
            </button>
            <button
              onClick={() => setShowTable(!showTable)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          <div className="bg-white p-4 rounded-lg border">
            <Line
              data={prepareChartData()}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Machine Shot Counts Over Time'
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
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Machine
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Board/Port
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shot Count
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mold Info
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} style={getRowStyle(item.mold_info)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTimestamp(item.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.machine_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.board}-{item.port}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.shot_count}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.mold_info ? (
                    <div>
                      <div className="font-medium">{item.mold_info.name || 'Unknown'}</div>
                      {item.mold_info.description && (
                        <div className="text-gray-500 text-xs">{item.mold_info.description}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">No mold data</span>
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
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      No Data
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No machine monitoring data available for the selected date range.
          </div>
        )}
          </div>

          {data.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Records:</span> {data.length}
                </div>
                <div>
                  <span className="font-medium">Unique Machines:</span> {new Set(data.map(d => d.machine_id)).size}
                </div>
                <div>
                  <span className="font-medium">Total Shots:</span> {data.reduce((sum, d) => sum + d.shot_count, 0)}
                </div>
                <div>
                  <span className="font-medium">Swapped Molds:</span> {data.filter(d => d.mold_info?.is_swapped).length}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}