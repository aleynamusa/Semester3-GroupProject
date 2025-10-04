'use client';
import { useEffect, useMemo, useState } from 'react';
import MoldCard from "@/app/components/MoldCard"
import Pagination from '@/app/components/Pagination';
import Sidebar from '@/app/components/sidebar';
import SingleMoldChart from '@/app/components/SingleMoldChart';


type Mold = { id: number; name: string | null };
type Totals = { moldId: number; totalOperations: number; avgCycleMs: number | null; firstOperationAt: string | null; lastOperationAt: string | null };
type HistoryItem = { id: number; cycle_time_ms: number | null; status: string | null; created_at: string };
type HistoryResp = { moldId: number; items: HistoryItem[]; limit: number; offset: number };
type WeeklyGraph = { moldId: number; moldName: string; data: any[] };

export default function MoldsPage() {
  const PAGE_SIZE = 9;

  const [molds, setMolds] = useState<Mold[]>([]);         // same as your code
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // pagination (client-side)
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil((molds?.length ?? 0) / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return (molds ?? []).slice(start, start + PAGE_SIZE);
  }, [molds, page]);

  // modals
  const [open, setOpen] = useState<'totals'|'history'| 'weeklyGraph'| null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [history, setHistory] = useState<HistoryResp | null>(null);
  const [weeklyGraph, setWeeklyGraph] = useState<WeeklyGraph | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/molds', { cache: 'no-store' }); // returns array
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const items: Mold[] = Array.isArray(json) ? json : (json?.items ?? []); // safe either way
        setMolds(items);
        setPage(1); // reset to first page when data changes
        setError(null);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load');
        setMolds([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // const openTotals = async (id: number) => {
  //   const r = await fetch(`/api/molds/${id}/total-ops`, { cache: 'no-store' });
  //   setTotals(await r.json());
  //   setOpen('totals');
  // };

  // const openHistory = async (id: number) => {
  //   const r = await fetch(`/api/molds/${id}/history?limit=30`, { cache: 'no-store' });
  //   setHistory(await r.json());
  //   setOpen('history');
  // };

  const openWeeklyGraph = (id: number) => {
    const mold = molds.find(m => m.id === id);
    if (!mold) return;
    setWeeklyGraph({ 
      moldId: id, 
      moldName: mold.name ?? `M${mold.id}`, 
      data: [] 
    });
    setOpen('weeklyGraph');
  }

  if (error) return <p className="mt-6 text-red-600">Error: {error}</p>;

  return (
  <div className="flex">
    <Sidebar />
    <div className="flex-1 ml-0 md:ml-60">
        <div className="top-0 left-0 md:left-10 w-full bg-[#00A527] text-white p-2.5 z-50">
                <p className="text-center font-medium"></p>
        </div>
        <div className="p-4 pt-6">
            <h2 className="text-[1.5rem] ml-5 font-semibold mb-4">Mold Production Chart</h2>
        </div>
        
         <main className="mx-auto max-w-6xl px-4 py-8 text-black">
              <h1 className="text-4xl font-semibold text-white">Mold Health</h1>
              <div className="mt-4 inline-block rounded-xl bg-neutral-200 px-4 py-2 text-lg font-medium">
                Molds in Production
              </div>
        
              {loading && <p className="mt-6">Loading…</p>}
              {!loading && pageItems.length === 0 && <p className="mt-6">No molds yet.</p>}
        
              <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pageItems.map((m, idx) => (
                  <MoldCard
                  key={m.id}
                  mold={m}
                  index={(page - 1) * PAGE_SIZE + idx}   // keeps color cycle stable across pages
                  onTotals={() => {}}
                  onHistory={() => {}}
                  onWeeklyGraph={openWeeklyGraph}
                  />
                ))}
              </section>
        
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        
              {open === 'totals' && totals && (
                <Modal onClose={() => setOpen(null)}>
                  <h3 className="text-xl font-semibold mb-2">Totals for mold {totals.moldId}</h3>
                  <ul className="space-y-1 text-sm">
                    <li>Operations: <b>{totals.totalOperations}</b></li>
                    <li>Avg cycle (ms): <b>{totals.avgCycleMs ?? '—'}</b></li>
                    <li>First op: {totals.firstOperationAt ? new Date(totals.firstOperationAt).toLocaleString() : '—'}</li>
                    <li>Last op: {totals.lastOperationAt ? new Date(totals.lastOperationAt).toLocaleString() : '—'}</li>
                  </ul>
                </Modal>
              )}
        
              {open === 'history' && history && (
                <Modal onClose={() => setOpen(null)}>
                  <h3 className="text-xl font-semibold mb-3">History for mold {history.moldId}</h3>
                  <div className="max-h-80 overflow-auto">
                    <ul className="space-y-1 text-sm">
                      {history.items.map((x) => (
                        <li key={x.id} className="border-b py-1">
                          {new Date(x.created_at).toLocaleString()} — {x.status ?? 'ok'} — {x.cycle_time_ms ?? '—'} ms
                        </li>
                      ))}
                    </ul>
                  </div>
                </Modal>
              )}

              {open === 'weeklyGraph' && weeklyGraph && (
                <Modal onClose={() => setOpen(null)}>
                  <h3 className="text-xl font-semibold mb-3">Current Week Production Graph for Mold {weeklyGraph.moldName}</h3>
                  <SingleMoldChart 
                  moldName={weeklyGraph.moldName} 
                  startDate="2020-09-24"
                 endDate="2020-09-30"
                   />
                </Modal>
              )}
            </main>


    </div>
          
</div>);
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end">
          <button onClick={onClose} className="rounded-md px-2 py-1 text-sm hover:bg-neutral-100">✕</button>
        </div>
        {children}
      </div>
    </div>
  
  );
}
