'use client';

import React, { useState } from 'react';
import MachineStatusContainer from './MachineStatusContainer';

interface BoardPortPair {
  board: number;
  port: number;
}

export default function MachineStatusExample() {
  // Example board/port pairs - replace with your actual data
  const [boardPortPairs] = useState<BoardPortPair[]>([
    { board: 1, port: 1 },
    { board: 1, port: 2 },
    { board: 2, port: 1 },
    { board: 2, port: 2 },
    { board: 3, port: 1 }
  ]);

  // Example check date - you can make this dynamic
  const [checkDate] = useState<string>('2025-10-02');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Machine Active Status</h1>
        <p className="text-gray-600">
          Checking machines for date: <strong>{checkDate}</strong>
        </p>
        <div className="mt-2 text-sm text-gray-500">
          Board/Port pairs: {boardPortPairs.map(pair => `${pair.board}-${pair.port}`).join(', ')}
        </div>
      </div>

      <MachineStatusContainer 
        boardPortPairs={boardPortPairs}
        checkDate={checkDate}
      />
    </div>
  );
}