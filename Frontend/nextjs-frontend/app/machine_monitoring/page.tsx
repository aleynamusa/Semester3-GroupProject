'use client';
import React from 'react';

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
      const point = sortedData[i];
      const mold = point.mold_info;
      const moldName = mold?.name;
      const moldSwapped = mold?.is_swapped ?? false;

      if (moldName === current.name && moldSwapped === current.is_swapped) {
        current.count += point.shot_count;
        current.endTimestamp = point.timestamp;
      } else {
        groups.push({ ...current });
        current = {
          name: moldName,
          description: mold?.description,
          is_swapped: moldSwapped,
          count: point.shot_count,
          startTimestamp: point.timestamp,
          endTimestamp: point.timestamp,
        };
      }
    }

    groups.push({ ...current });
    return groups.filter(g => g.count > 0);
  };

  const groupedMolds = groupConsecutiveMolds(data);

  console.log('Popup opened for machine:', machineName);
  console.log('Popup data:', data);

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
            className={`p-2 mb-2 border rounded ${
              group.is_swapped ? 'bg-red-100 border-red-500' : 'bg-green-100 border-green-500'
            }`}
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

export default ProductionPopup;
