'use client';

import { useEffect, useMemo, useState } from 'react';
import MoldCard from "@/app/components/MoldCard";
import Pagination from '@/app/components/Pagination';
import Sidebar from '@/app/components/sidebar';
import SearchBar from '@/app/components/SearchBar';
import TotalOpsPop from "@/app/components/TotalOpsPop";

//stupid time zones
const fmtDateTimeUTC = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  dateStyle: 'medium',
  timeStyle: 'short',
});

const fmtDateUTC = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  dateStyle: 'medium',
});

function formatDateTimeUTC(value?: string | null) {
  if (!value) return '—';
  return fmtDateTimeUTC.format(new Date(value));
}

function formatDateUTC(value?: string | null) {
  if (!value) return '—';
  return fmtDateUTC.format(new Date(value));
}


type Mold = { id: number; name: string | null };
type Totals = {
  moldId: number;
  moldName: string | null;
  totalOperations: number;
  avgCycleMs: number | null;
  firstOperationAt: string | null;
  lastOperationAt: string | null;
};
type HistoryItem = { id: number; cycle_time_ms: number | null; status: string | null; created_at: string };
type HistoryResp = { moldId: number; items: HistoryItem[]; limit: number; offset: number };

export default function MoldsPage() {
  const PAGE_SIZE = 9;

  const [molds, setMolds] = useState<Mold[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState<Mold | null>(null);
  const [searchMsg, setSearchMsg] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil((molds.length ?? 0) / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return molds.slice(start, start + PAGE_SIZE);
  }, [molds, page]);

  const [open, setOpen] = useState<'totals' | 'history' | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [history, setHistory] = useState<HistoryResp | null>(null);

  useEffect(() => {
    const loadMolds = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/molds', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const items: Mold[] = Array.isArray(json) ? json : (json?.items ?? []);
        setMolds(items);
        setPage(1);
        setError(null);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load');
        setMolds([]);
      } finally {
        setLoading(false);
      }
    };
    loadMolds();
  }, []);

  const handleSearch = (term: string) => {
    const t = term.toLowerCase();
    const match = molds.find((m) => (m.name ?? '').toLowerCase() === t);
    if (match) {
      setSelected(match);
      setSearchMsg(null);
    } else {
      setSelected(null);
      setSearchMsg(`No molds found with the name "${term}".`);
    }
  };
  const clearSearch = () => {
    setSelected(null);
    setSearchMsg(null);
  };

  const openTotals = async (id: number) => {
    try {
      const r = await fetch(`/api/molds/${id}/total-ops`, { cache: 'no-store' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json: Totals = await r.json();
      setTotals(json);
      setOpen('totals');
    } catch (err) {
      console.error(err);
    }
  };

  const openHistory = async (id: number) => {
    try {
      const r = await fetch(`/api/molds/${id}/history?limit=30`, { cache: 'no-store' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json: HistoryResp = await r.json();
      setHistory(json);
      setOpen('history');
    } catch (err) {
      console.error(err);
    }
  };

  if (error) {
    return <p className="mt-6 text-red-600">Error: {error}</p>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-60">
        <header className="top-0 left-0 md:left-10 w-full bg-[#00A527] text-white p-2.5 z-50">
          <p className="text-center font-medium"></p>
        </header>

        <div className="p-4 pt-6">
          <div className="flex justify-end mb-4">
            <SearchBar onSearch={handleSearch} onClear={clearSearch} />
          </div>
          <h2 className="text-[1.5rem] ml-5 font-semibold mb-4">Mold Production Chart</h2>
        </div>

        <main className="mx-auto max-w-6xl px-4 py-8 text-black">
          <h1 className="text-4xl font-semibold">Mold Health</h1>
          <div className="mt-4 inline-block rounded-xl bg-neutral-200 px-4 py-2 text-lg font-medium">
            Molds in Production
          </div>

          {loading && <p className="mt-6">Loading…</p>}
          {!loading && pageItems.length === 0 && <p className="mt-6">No molds yet.</p>}

          {selected ? (
            <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <MoldCard
                key={selected.id}
                mold={selected}
                index={0}
                onTotals={openTotals}
                onHistory={openHistory}
              />
            </section>
          ) : (
            <>
              {searchMsg && <p className="mt-6 text-neutral-700">{searchMsg}</p>}
              {!searchMsg && (
                <>
                  <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {pageItems.map((m, idx) => (
                      <MoldCard
                        key={m.id}
                        mold={m}
                        index={(page - 1) * PAGE_SIZE + idx}
                        onTotals={openTotals}
                        onHistory={openHistory}
                      />
                    ))}
                  </section>
                  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                </>
              )}
            </>
          )}

          {open === 'totals' && totals && (
            <TotalOpsPop totals={totals} onClose={() => setOpen(null)} />
          )}

          {open === 'history' && history && (
            <Modal onClose={() => setOpen(null)}>
              <h3 className="text-xl font-semibold mb-3">History for mold {history.moldId}</h3>
              <div className="max-h-80 overflow-auto">
                <ul className="space-y-1 text-sm">
                  {history.items.map((x) => (
                   <li key={x.id} className="border-b py-1">
                     {formatDateTimeUTC(x.created_at)} — {x.status ?? 'ok'} — {x.cycle_time_ms ?? '—'} ms
                  </li>
                  ))}
                </ul>
              </div>
            </Modal>
          )}
        </main>
      </div>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button onClick={onClose} className="rounded-md px-2 py-1 text-sm hover:bg-neutral-100">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
