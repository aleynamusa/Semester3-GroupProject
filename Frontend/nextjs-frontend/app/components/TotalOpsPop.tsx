"use client";
import React from "react";

export type TotalsByName = {
  moldName: string | null;
  totalOperations: number;
  avgCycleMs: number | null;
  firstOperationAt: string | null;
  lastOperationAt: string | null;
};

export default function TotalOpsPop({
  totals,
  onClose,
}: {
  totals: TotalsByName;
  onClose: () => void;
}) {
  const displayName = totals.moldName ?? "Unknown mold";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end">
          <button onClick={onClose} className="rounded-md px-2 py-1 text-sm hover:bg-neutral-100">✕</button>
        </div>

        <h3 className="text-xl font-semibold mb-4">
          Total Operations — {displayName}
        </h3>
        <ul className="space-y-2 text-sm">
          <li>Operations: <b>{totals.totalOperations}</b></li>
          <li>First op: {totals.firstOperationAt ? new Date(totals.firstOperationAt).toLocaleDateString() : "—"}</li>
          <li>Last op: {totals.lastOperationAt ? new Date(totals.lastOperationAt).toLocaleDateString() : "—"}</li>
          {/* avgCycleMs left */}
        </ul>
      </div>
    </div>
  );
}
