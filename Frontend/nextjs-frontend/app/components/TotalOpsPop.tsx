"use client";
import React, { useMemo, useState } from "react";

export type TotalsByName = {
  moldId: number;
  moldName: string | null;
  totalOperations: number;
  avgCycleMs: number | null;
  firstOperationAt: string | null;
  lastOperationAt: string | null;
};

type DayRow = { date: string; total: number };

const fmtDateTimeUTC = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTimeUTC(value?: string | null) {
  if (!value) return "—";
  return fmtDateTimeUTC.format(new Date(value));
}

export default function TotalOpsPop({
  totals,
  onClose,
}: {
  totals: TotalsByName;
  onClose: () => void;
}) {
  const displayName = totals.moldName ?? `M${totals.moldId}`;

  const [showPicker, setShowPicker] = useState(false);
  const [days, setDays] = useState<DayRow[] | null>(null);
  const [loadingDays, setLoadingDays] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const minDate = useMemo(() => (days && days[0]?.date) || null, [days]);
  const maxDate = useMemo(() => (days && days.length ? days[days.length - 1].date : null), [days]);
  const pickedTotal = useMemo(() => {
    if (!picked || !days) return null;
    const row = days.find((d) => d.date === picked);
    return row ? row.total : 0;
  }, [picked, days]);

  const togglePicker = async () => {
    setShowPicker((s) => !s);
    if (days || showPicker) return; // already loaded or just closing

    try {
      setLoadingDays(true);
      setErr(null);
      const r = await fetch(`/api/molds/${totals.moldId}/daily`, { cache: "no-store" });
      if (!r.ok) {
        const text = await r.text();
        throw new Error(`HTTP ${r.status}: ${text}`);
      }
      const json: { days: DayRow[] } = await r.json();
      const list = json.days || [];
      setDays(list);
      if (list.length) setPicked(list[list.length - 1].date); 
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Failed to load days");
      setDays([]);
    } finally {
      setLoadingDays(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end">
          <button onClick={onClose} className="rounded-md px-2 py-1 text-sm hover:bg-neutral-100">✕</button>
        </div>

        <h3 className="text-xl font-semibold mb-4">Total Operations — {displayName}</h3>

        <ul className="space-y-2 text-sm mb-4">
          <li>Operations (all time): <b>{totals.totalOperations}</b></li>
          <li>First op: {formatDateTimeUTC(totals.firstOperationAt)}</li>
          <li>Last op: {formatDateTimeUTC(totals.lastOperationAt)}</li>
        </ul>

       
        <div className="border-t pt-4">
          <button
            onClick={togglePicker}
            className="rounded-xl bg-black text-white px-3 py-2 text-sm hover:opacity-90"
          >
            {showPicker ? "Hide day filter" : "Filter by day"}
          </button>

          {showPicker && (
            <div className="mt-3 space-y-3">
              {loadingDays && <p className="text-sm text-neutral-600">Loading available days…</p>}
              {err && <p className="text-sm text-red-600">{err}</p>}

              {!loadingDays && days && days.length > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Pick a day:</label>
                    <input
                      type="date"
                      className="rounded-md border px-2 py-1 text-sm"
                      value={picked ?? ""}
                      min={minDate ?? undefined}
                      max={maxDate ?? undefined}
                      onChange={(e) => setPicked(e.target.value || null)}
                    />
                  </div>

                  {picked && (
                    <div className="rounded-lg bg-neutral-100 px-3 py-2 text-sm">
                      <div className="font-medium">
                        {new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", dateStyle: "medium" }).format(new Date(picked))}
                      </div>
                      <div>Operations that day: <b>{pickedTotal ?? 0}</b></div>
                    </div>
                  )}
                </>
              )}

              {!loadingDays && days && days.length === 0 && !err && (
                <p className="text-sm text-neutral-600">No daily data found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
