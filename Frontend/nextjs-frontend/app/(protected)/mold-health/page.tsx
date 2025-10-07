'use client';

import { useEffect, useMemo, useState } from 'react';
import MoldCard from "@/app/components/MoldCard";
import Pagination from '@/app/components/MoldHealthPagination';
import Sidebar from '@/app/components/sidebar';
import DailyMoldChart from '@/app/components/DailyMoldChart';
import WeeklyMoldChart from '@/app/components/WeeklyMoldChart';
import SearchBar from '@/app/components/SearchBar';

// stupid time zones
const fmtDateTimeUTC = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatDateTimeUTC(value?: string | null) {
  if (!value) return '—';
  return fmtDateTimeUTC.format(new Date(value));
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

type CurrentWeekGraphPerDay = { moldId: number; moldName: string; data: any[] };
type TotalGraphPerWeek = { moldId: number; moldName: string; data: any[] };

export default function MoldsPage() {
  const [molds, setMolds] = useState<Mold[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // search state
  const [selected, setSelected] = useState<Mold | null>(null);
  const [searchMsg, setSearchMsg] = useState<string | null>(null);

  // pagination (client-side)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // modals
  const [open, setOpen] = useState<'totals' | 'history' | 'currentWeekGraph' | 'totalGraph' | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [history, setHistory] = useState<HistoryResp | null>(null);
  const [currentWeekGraph, setCurrentWeekGraph] = useState<CurrentWeekGraphPerDay | null>(null);
  const [totalGraph, setTotalGraph] = useState<TotalGraphPerWeek | null>(null);

  useEffect(() => {
    const loadMolds = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/molds', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const items: Mold[] = Array.isArray(json) ? json : (json?.items ?? []);
        setMolds(items);
        setCurrentPage(1); // reset to first page when data changes
        setSelected(null); // reset search selection
        setSearchMsg(null);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load');
        setMolds([]);
      } finally {
        setLoading(false);
      }
    };
    loadMolds();
  }, []);

  // computed list (search-aware)
  const visibleMolds = useMemo(() => {
    if (selected) return [selected];
    return molds;
  }, [molds, selected]);

  // pagination for visible list
  const totalPages = Math.max(1, Math.ceil((visibleMolds.length ?? 0) / itemsPerPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return visibleMolds.slice(start, start + itemsPerPage);
  }, [visibleMolds, currentPage, itemsPerPage]);

  // search handlers
  const handleSearch = (term: string) => {
    const t = term.trim().toLowerCase();
    if (!t) {
      setSelected(null);
      setSearchMsg(null);
      setCurrentPage(1);
      return;
    }
    const match = molds.find((m) => (m.name ?? '').toLowerCase() === t);
    if (match) {
      setSelected(match);
      setSearchMsg(null);
      setCurrentPage(1);
    } else {
      setSelected(null);
      setSearchMsg(`No molds found with the name "${term}".`);
      setCurrentPage(1);
    }
  };
  const clearSearch = () => {
    setSelected(null);
    setSearchMsg(null);
    setCurrentPage(1);
  };

  // modals openers
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

  const openCurrentWeekGraph = (id: number) => {
    const mold = molds.find(m => m.id === id);
    if (!mold) return;
    setCurrentWeekGraph({
      moldId: id,
      moldName: mold.name ?? `M${mold.id}`,
      data: [],
    });
    setOpen('currentWeekGraph');
  };

  const openTotalGraph = (id: number) => {
    const mold = molds.find(m => m.id === id);
    if (!mold) return;
    setTotalGraph({
      moldId: id,
      moldName: mold.name ?? `M${mold.id}`,
      data: [],
    });
    setOpen('totalGraph');
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

      <div className="flex-1 ml-0 md:ml-60" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', border: 'var(--border)' }}>
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

          <div className="mt-4 inline-block rounded-xl bg-neutral-200 px-4 py-2 text-lg font-medium text-black">
            Molds in Production
          </div>

          {searchMsg && <p className="mt-4 text-sm text-neutral-600">{searchMsg}</p>}
          {loading && <p className="mt-6">Loading…</p>}
          {!loading && visibleMolds.length === 0 && <p className="mt-6">No molds yet.</p>}

          <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((m, idx) => (
              <MoldCard
                key={m.id}
                mold={m}
                index={(currentPage - 1) * itemsPerPage + idx} // keeps color cycle stable across pages
                onTotals={() => openTotals(m.id)}
                onHistory={() => openHistory(m.id)}
                onCurrentWeekGraphPerDay={() => openCurrentWeekGraph(m.id)}
                onTotalGraphPerWeek={() => openTotalGraph(m.id)}
              />
            ))}
          </section>

          <div className="mt-6" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', border: 'var(--border)' }}>
            <Pagination
              currentPage={currentPage}
              totalItems={visibleMolds.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
              onItemsPerPageChange={(count) => {
                setItemsPerPage(count);
                setCurrentPage(1); // reset to first page when page size changes
              }}
            />
          </div>

          {/* Totals modal */}
          {open === 'totals' && totals && (
            <Modal onClose={() => setOpen(null)}>
              <h3 className="text-xl font-semibold mb-2">
                Totals for mold {totals.moldName ?? totals.moldId}
              </h3>
              <ul className="space-y-1 text-sm">
                <li>Operations: <b>{totals.totalOperations}</b></li>
                {/* <li>Avg cycle (ms): <b>{totals.avgCycleMs ?? '—'}</b></li> */}
                <li>First op: {totals.firstOperationAt ? formatDateTimeUTC(totals.firstOperationAt) : '—'}</li>
                <li>Last op: {totals.lastOperationAt ? formatDateTimeUTC(totals.lastOperationAt) : '—'}</li>
              </ul>
            </Modal>
          )}

          {/* History modal */}
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

          {/* Current week per-day graph */}
          {open === 'currentWeekGraph' && currentWeekGraph && (
            <Modal onClose={() => setOpen(null)}>
              <h3 className="text-xl font-semibold mb-3">
                Current Week Production Graph per Day for Mold {currentWeekGraph.moldName}
              </h3>
              <DailyMoldChart
                moldName={currentWeekGraph.moldName}
                startDate="2020-09-24"
                endDate="2020-09-30"
              />
            </Modal>
          )}

          {/* Total per-week graph */}
          {open === 'totalGraph' && totalGraph && (
            <Modal onClose={() => setOpen(null)}>
              <h3 className="text-xl font-semibold mb-3">
                Total Production Graph per Week for Mold {totalGraph.moldName}
              </h3>
              <WeeklyMoldChart
                moldName={totalGraph.moldName}
                startDate="2020-09-24"
                endDate="2020-09-30"
              />
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
