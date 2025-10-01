'use client';
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
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

// --- Popup Component ---
interface ProductionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  machineName?: string;
  data: MachineDataPoint[];
}

interface MoldGroup {
  name?: string;
  description?: string;
  is_swapped: boolean;
  count: number;
  startTimestamp: string;
  endTimestamp: string;
}

const ProductionPopup: React.FC<ProductionPopupProps> = ({ isOpen, onClose, machineName, data }) => {
  if (!isOpen) return null;

  const groupConsecutiveMolds = (data: MachineDataPoint[]): MoldGroup[] => {
    const groups: MoldGroup[] = [];
    console.log("ADSDSDFSA");
    console.log(data[1].mold_info?.name);
    console.log("ADSDSD1FSA");

    if (data.length === 0) return groups;

    const sortedData = data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let current = {
      name: sortedData[0].mold_info?.name,
      description: sortedData[0].mold_info?.description,
      is_swapped: sortedData[0].mold_info?.is_swapped ?? false,
      count: sortedData[0].shot_count,
      startTimestamp: sortedData[0].timestamp,
      endTimestamp: sortedData[0].timestamp,
    };

    for (let i = 1; i < sortedData.length; i++) {
      const currentPoint = sortedData[i];
      const mold = currentPoint.mold_info;
      const moldName = mold?.name;
      const moldSwapped = mold?.is_swapped ?? false;

      if (moldName === current.name && moldSwapped === current.is_swapped) {
        current.count += currentPoint.shot_count;
        current.endTimestamp = currentPoint.timestamp;
      } else {
        groups.push({ ...current });
        current = {
          name: moldName,
          description: mold?.description,
          is_swapped: moldSwapped,
          count: currentPoint.shot_count,
          startTimestamp: currentPoint.timestamp,
          endTimestamp: currentPoint.timestamp,
        };
      }
    }
    groups.push({ ...current });
    return groups.filter(g => g.count > 0);
  };

  const groupedMolds = groupConsecutiveMolds(data);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-11/12 md:w-3/4 max-h-[80vh] overflow-y-auto relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold"
          onClick={onClose}
        >
          ✖
        </button>
        <h2 className="text-xl font-bold mb-4">Mold History for Machine: {machineName}</h2>
        {groupedMolds.map((group, index) => (
          <div
            key={index}
            className={`p-2 mb-2 border rounded ${group.is_swapped ? 'bg-red-100 border-red-500' : 'bg-green-100 border-green-500'}`}
          >
            <div><strong>Mold:</strong> {group.name || 'Unassigned/Unknown Mold'}</div>
            {group.description && <div>{group.description}</div>}
            <div><strong>Total Shots:</strong> {group.count}</div>
            <div><strong>From:</strong> {new Date(group.startTimestamp).toLocaleString()}</div>
            <div><strong>To:</strong> {new Date(group.endTimestamp).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Table Component ---
export default function MachineMonitoringTable() {
  const [data, setData] = useState<MachineDataPoint[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const SEPT_2020_START = '2020-09-01';
  const SEPT_2020_END = '2020-09-30';
  
  const [startDate, setStartDate] = useState(SEPT_2020_START);
  const [endDate, setEndDate] = useState(SEPT_2020_END);
  
  const [showTable, setShowTable] = useState(true);
  const [showCharts, setShowCharts] = useState(true);
  
  const [granularity, setGranularity] = useState<'minute' | 'hour' | 'day'>('day');

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMachine, setPopupMachine] = useState<string | undefined>();
  const [popupData, setPopupData] = useState<MachineDataPoint[]>([]);

  // --- New function to fetch all machines with their molds ---
const fetchMachinesWithMolds = async () => {
  try {
    // 1️⃣ Fetch all machines
    const response = await fetch('/machine-dashboard/api/monitoring?endpoint=machines&machines_only=true');
    const result: { success: boolean; machines: Machine[]; total_machines: number } = await response.json();

    if (!result.success) throw new Error('Failed to fetch machines');

    const sortedMachines = result.machines.sort((a, b) => {
      const nameA = (a.name || `${a.board}-${a.port}`).toLowerCase();
      const nameB = (b.name || `${b.board}-${b.port}`).toLowerCase();
      return nameA.localeCompare(nameB);
    });

    setMachines(sortedMachines);

    // 2️⃣ Prepare all machine keys for fetching mold data
    const machineKeys = sortedMachines.map(m => `${m.board}-${m.port}`);

    if (machineKeys.length > 0) {
      const params = new URLSearchParams({
        endpoint: 'machines',
        machines: machineKeys.join(','),
      });

      const dataResponse = await fetch(`/machine-dashboard/api/monitoring?${params}`);
      const dataResult: MachineMonitoringResponse = await dataResponse.json();

      if (!dataResult.success) throw new Error('Failed to fetch machine data with molds');

      setData(dataResult.data); // ✅ contains mold_info for all machines
    }
  } catch (err) {
    console.error('Error fetching machines with molds:', err);
    setError(`Error fetching machines with molds: ${err instanceof Error ? err.message : String(err)}`);
  }
};

useEffect(() => {
  const fetchMachines = async () => {
    try {
      const response = await fetch('/machine-dashboard/api/monitoring?endpoint=machines&machines_only=true');
      const result: { success: boolean; machines: Machine[]; total_machines: number } = await response.json();

      if (result.success) {
        // Sort machines by name (or board-port fallback)
        const sortedMachines = result.machines.sort((a, b) => {
          const nameA = (a.name || `${a.board}-${a.port}`).toLowerCase();
          const nameB = (b.name || `${b.board}-${b.port}`).toLowerCase();
          return nameA.localeCompare(nameB);
        });
        setMachines(sortedMachines);

        // Default visible machines (first 3 visible machines)
        const visibleMachines = sortedMachines
          .filter(m => m.visible)
          .slice(0, 3)
          .map(m => `${m.board}-${m.port}`);
        setSelectedMachines(visibleMachines);
      }
    } catch (err) {
      console.error('Failed to fetch machines:', err);
      setError('Failed to fetch machines');
    }
  };

  fetchMachines();
}, []);
    
  const getDayDifference = (start: string, end: string) => {
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    const diffTime = endMs - startMs;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return Math.ceil(diffDays) + 1;
  }

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    if (!startDate || !endDate) {
        setError('Start and end dates must be selected to fetch data.');
        setLoading(false);
        return;
    }
    
    if (endDate < startDate) {
        setError('End date cannot be before start date.');
        setLoading(false);
        return;
    }

    const diffDays = getDayDifference(startDate, endDate);
    
    if (granularity === 'minute' && diffDays > 1) {
        setError('For "Per Minute" granularity, the date range cannot exceed 1 day to prevent unresponsiveness.');
        setLoading(false);
        return;
    }
    
    if (granularity === 'hour' && diffDays > 7) {
        setError('For "Hourly" granularity, the date range cannot exceed 7 days to maintain performance.');
        setLoading(false);
        return;
    }

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

      const response = await fetch(`/machine-dashboard/api/monitoring?${params}`);
      const result: MachineMonitoringResponse = await response.json();

      if (result.success) {
        setData(result.data);
        console.log("Fetched Machine Monitoring Data:", result.data);
        console.log("Example Mold Info (First Item):", result.data[0]?.mold_info);
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
    if (selectedMachines.length > 0) fetchData();
  }, [selectedMachines, startDate, endDate, granularity]);

  const handleRefresh = async () => {
    if (selectedMachines.length === 0) {
      setError('Please select at least one machine before refreshing');
      return;
    }
    
    await fetchData();
  };
    
  const parseTimestamp = (ts: string): Date => new Date(ts);

  const prepareChartData = () => {
    const machineColors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];

    const allTimestamps = Array.from(new Set(data.map(item => item.timestamp)))
      .sort((a, b) => parseTimestamp(a).getTime() - parseTimestamp(b).getTime());
    
    const labels = allTimestamps.map(ts => {
      const date = parseTimestamp(ts);
      if (isNaN(date.getTime())) return 'Invalid Date';
      const options: Intl.DateTimeFormatOptions = { timeZone: 'UTC' };
      if (granularity === 'day') { options.month = 'short'; options.day = 'numeric'; }
      else if (granularity === 'hour') { options.month = 'short'; options.day = 'numeric'; options.hour='2-digit'; options.minute='2-digit'; options.hour12=false; }
      else if (granularity === 'minute') { options.month = 'short'; options.day='numeric'; options.hour='2-digit'; options.minute='2-digit'; options.second='2-digit'; options.hour12=false; }
      return date.toLocaleString('en-US', options);  
    });

    const machineMap = new Map<string, Record<string, number>>();
    
    data.forEach(item => {
      const machineKey = `${item.machine_name} (${item.board}-${item.port})`;
      if (!machineMap.has(machineKey)) machineMap.set(machineKey, {});
      machineMap.get(machineKey)![item.timestamp] = item.shot_count;
    });

    const datasets = Array.from(machineMap.entries()).map(([machineName, shotCountsByTimestamp], index) => ({
      label: machineName,
      data: allTimestamps.map(ts => shotCountsByTimestamp[ts] ?? null),
      borderColor: machineColors[index % machineColors.length],
      backgroundColor: machineColors[index % machineColors.length] + '20',
      tension: 0.1,
      fill: false,
      stepped: true,
      spanGaps: true,
    }));

    return { labels, datasets };
  };

  // Log popupData when popup opens
  useEffect(() => {
    if (popupOpen) {
      console.log('Popup opened for machine:', popupMachine);
      console.log('Popup Data:', popupData);
    }
  }, [popupOpen, popupData, popupMachine]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen font-inter">
      <h1 className="text-3xl font-bold text-white mb-6">Machine Production Dashboard</h1>
      
      {/* ... Machine selection, filters, and refresh controls ... */}
      
      {showCharts && data.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Machine Shot Count Trends (Click Legend for Mold History)</h2>
          <div className="bg-white p-6 rounded-lg border shadow-xl" style={{ minHeight: '400px' }}>
            <Line
              data={prepareChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                    onClick: (e: any, legendItem: any, legend: any) => {
                      const datasetIndex = legendItem.datasetIndex;
                      if (datasetIndex === undefined) return;
                      const machineLabel = legend.chart.data.datasets[datasetIndex].label;
                      const filteredData = data.filter(
                        item => `${item.machine_name} (${item.board}-${item.port})` === machineLabel
                      );
                      setPopupMachine(machineLabel);
                      setPopupData(filteredData);
                      setPopupOpen(true);
                    }
                  },
                  title: {
                    display: true,
                    text: 'Machine Shot Counts Over Time'
                  }
                },
                scales: {
                  x: { type: 'category' as const, title: { display: true, text: 'Time Period (UTC)', color: '#333' } },
                  y: { beginAtZero: true, title: { display: true, text: 'Shot Count', color: '#333' } }
                }
              }}
            />
          </div>
        </div>
      )}

      {showTable && data.length > 0 && (
        <div className="overflow-x-auto rounded-lg shadow-xl border border-gray-700">
          <table className="min-w-full bg-gray-800 border-collapse">
            <tbody className="bg-gray-800">
              <tr className="bg-gray-700 sticky top-0">
                <th className="px-4 py-3 border border-gray-700 text-white text-left text-sm font-semibold">Timestamp</th>
                <th className="px-4 py-3 border border-gray-700 text-white text-left text-sm font-semibold">Machine</th>
                <th className="px-4 py-3 border border-gray-700 text-white text-left text-sm font-semibold">Board-Port</th>
                <th className="px-4 py-3 border border-gray-700 text-white text-right text-sm font-semibold">Shot Count</th>
                <th className="px-4 py-3 border border-gray-700 text-white text-left text-sm font-semibold">Mold Info</th>
              </tr>
              {data.map((item, index) => (
                <tr key={index} className={`transition-colors duration-150 ${item.mold_info?.is_swapped ? 'bg-red-900/50 hover:bg-red-900/70' : 'bg-green-900/50 hover:bg-green-900/70'}`}>
                  <td className="px-4 py-2 border-b border-gray-700 text-sm text-gray-200">{new Date(item.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-2 border-b border-gray-700 text-gray-100 font-medium">{item.machine_name}</td>
                  <td className="px-4 py-2 border-b border-gray-700 text-gray-300">{item.board}-{item.port}</td>
                  <td className="px-4 py-2 border-b border-gray-700 text-right text-yellow-400 font-mono">{item.shot_count}</td>
                  <td className="px-4 py-2 border-b border-gray-700 text-sm text-gray-300">
                    {item.mold_info ? (
                      <div>
                        <div className="font-bold text-white">{item.mold_info.name || 'Unassigned Mold'}</div>
                        {item.mold_info.description && <div className="text-xs text-gray-400">{item.mold_info.description}</div>}
                        {item.mold_info.is_swapped && <span className="font-semibold text-red-400">⚠ SWAPPED</span>}
                      </div>
                    ) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup */}
      <ProductionPopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} machineName={popupMachine} data={popupData} />
    </div>
  );
}
