'use client';

import React from 'react';

interface MachineStatusMap {
  [machineName: string]: boolean;
}

interface ActiveMachinesProps {
  machineStatus: MachineStatusMap;
}

export default function ActiveMachines({ machineStatus }: ActiveMachinesProps) {
  return (
    <div className="w-full p-4">
      <div className="bg-[#222523] rounded-lg shadow border border-gray-600">
        <div className="p-4 border-b border-gray-600">
          <h2 className="text-lg font-semibold text-white">Machine Status</h2>
          <p className="text-sm text-gray-300 mt-1">Based on production end dates</p>
        </div>
        
        <div className="p-4 space-y-2">
          {Object.entries(machineStatus).map(([machineName, isActive]) => (
            <div key={machineName} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg bg-gray-800">
              <span className="font-medium text-gray-100">{machineName}</span>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isActive ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}