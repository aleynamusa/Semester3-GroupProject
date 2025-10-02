'use client';

import React, { useState, useEffect } from 'react';
import ActiveMachines from './ActiveMachines';

interface BoardPortPair {
  board: number;
  port: number;
}

interface MachineStatusContainerProps {
  boardPortPairs: BoardPortPair[];
  checkDate: string;
}

interface ApiResponse {
  success: boolean;
  active_status: { [machineName: string]: boolean };
  check_date: string;
  machines_checked: number;
  error?: string;
}

export default function MachineStatusContainer({ 
  boardPortPairs, 
  checkDate 
}: MachineStatusContainerProps) {
  const [machineStatus, setMachineStatus] = useState<{ [machineName: string]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMachineStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construct the API URL
        const boardPortParam = encodeURIComponent(JSON.stringify(boardPortPairs));
        const url = `/machine-dashboard/api/monitoring?endpoint=active-status&board_port_pairs=${boardPortParam}&date=${checkDate}`;

        const response = await fetch(url);
        const data: ApiResponse = await response.json();

        if (data.success) {
          setMachineStatus(data.active_status);
        } else {
          setError(data.error || 'Failed to fetch machine status');
        }
      } catch (err) {
        setError('Error fetching machine status: ' + String(err));
        console.error('Error fetching machine status:', err);
      } finally {
        setLoading(false);
      }
    };

    if (boardPortPairs.length > 0) {
      fetchMachineStatus();
    } else {
      setLoading(false);
    }
  }, [boardPortPairs, checkDate]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading machine status...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (Object.keys(machineStatus).length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600">No machines found for the specified criteria.</p>
        </div>
      </div>
    );
  }

  return <ActiveMachines machineStatus={machineStatus} />;
}