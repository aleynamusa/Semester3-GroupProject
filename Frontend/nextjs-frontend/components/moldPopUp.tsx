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

export function ProductionPopup({ isOpen, onClose, machineName, data }: ProductionPopupProps) {
  if (!isOpen) return null;

  const getRowStyle = (moldInfo?: MoldInfo) => {
    if (!moldInfo) return {};
    if (moldInfo.is_swapped) {
      return { backgroundColor: '#ffebee', borderLeft: '4px solid #f44336' }; // Red for swapped
    }
    return { backgroundColor: '#e8f5e8', borderLeft: '4px solid #4caf50' }; // Green for normal
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB'); // DD/MM/YYYY HH:mm:ss
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-11/12 max-w-2xl mx-auto overflow-y-auto max-h-[80vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-black">
            Production Data {machineName ? `- ${machineName}` : ''}
          </h2>
          <button onClick={onClose} className="text-black hover:text-gray-800 transition-colors">
            ✕
          </button>
        </div>

        <ul className="space-y-4">
          {data.map((item, index) => (
            <li
              key={index}
              className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow text-black"
              style={getRowStyle(item.mold_info)}
            >
              <div className="flex justify-between items-center mb-2 text-black">
                <span className="font-medium text-black">
                  {formatTimestamp(item.timestamp)}
                </span>
                <span className="text-sm text-black">Shots: {item.shot_count}</span>
              </div>
              <p className="text-black mb-1">
                <strong>Mold:</strong> {item.mold_info?.name || 'Unknown'}
              </p>
              <p className="text-black">
                <strong>Swapped:</strong> {item.mold_info?.is_swapped ? 'Yes' : 'No'}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
