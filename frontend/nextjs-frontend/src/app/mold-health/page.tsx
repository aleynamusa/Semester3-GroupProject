"use client";

import { useEffect, useState } from "react";

type Mold = { id: number; label: string };
type MoldsPage = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: Mold[];
};

const COLORS = [
  "bg-amber-200",
  "bg-yellow-200",
  "bg-green-200",
  "bg-emerald-200",
  "bg-sky-300",
  "bg-rose-300",
];

export default function MoldHealthPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<MoldsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | { title: string; body: React.ReactNode }>(null);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 9;

  // Normalize any API shape into MoldsPage
  function normalize(payload: unknown): MoldsPage {
    // Case A: already in {items, totalPages, ...} shape
    if (
      payload &&
      typeof payload === "object" &&
      "items" in payload &&
      Array.isArray((payload as any).items)
    ) {
      const p = payload as any;
      return {
        page: Number(p.page ?? 1),
        pageSize: Number(p.pageSize ?? pageSize),
        totalItems: Number(p.totalItems ?? (p.items as Mold[]).length ?? 0),
        totalPages: Number(p.totalPages ?? 1),
        items: p.items as Mold[],
      };
    }

    // Case B: server returned a plain array of molds
    if (Array.isArray(payload)) {
      const items = payload as Mold[];
      const totalItems = items.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      const start = (page - 1) * pageSize;
      return {
        page,
        pageSize,
        totalItems,
        totalPages,
        items: items.slice(start, start + pageSize),
      };
    }

    // Fallback: empty page
    return { page: 1, pageSize, totalItems: 0, totalPages: 1, items: [] };
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/molds?page=${page}&pageSize=${pageSize}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const raw = await res.json().catch(() => null);
      const normalized = normalize(raw);
      setData(normalized);
    } catch (e: any) {
      console.error("load molds failed:", e);
      setError(e?.message ?? "Failed to load molds");
      setData({ page: 1, pageSize, totalItems: 0, totalPages: 1, items: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function colorAt(i: number) {
    return COLORS[i % COLORS.length];
  }

  async function onTotalOps(m: Mold) {
    const res = await fetch(`/api/molds/${m.id}/total-ops`, { cache: "no-store" });
    const p = await res.json().catch(() => ({}));
    setModal({
      title: `${m.label} — Total number of operations`,
      body: <p className="text-2xl font-semibold">{p?.totalOps ?? 0}</p>,
    });
  }

  async function onHistory(m: Mold) {
    const res = await fetch(`/api/molds/${m.id}/history?limit=20`, { cache: "no-store" });
    const p = await res.json().catch(() => ({}));
    const items = Array.isArray(p?.items) ? p.items : [];
    setModal({
      title: `${m.label} — Historical overview`,
      body: (
        <div className="max-h-80 overflow-auto text-sm">
          {items.map((r: any) => (
            <div key={r.id} className="flex justify-between border-b py-1">
              <span>{r.start_date ?? "—"} → {r.end_date ?? "—"}</span>
              <span className="font-medium">{r.amount ?? "—"}</span>
            </div>
          ))}
          {items.length === 0 && <p>No data.</p>}
        </div>
      ),
    });
  }

  const totalPages = data?.totalPages ?? 1;
  const items: Mold[] = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-3xl font-semibold">Mold Health</h1>

      <div className="mt-4">
        <button className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium" aria-current="page">
          Molds in Production
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-500">Loading molds…</p>
      ) : error ? (
        <p className="mt-6 text-sm text-red-600">Error: {error}</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No molds found.</p>
      ) : (
        <section className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m, i) => (
            <article key={m.id} className={`rounded-2xl ${colorAt(i)} p-5 shadow-sm`}>
              <div className={`rounded-xl bg-white py-6 text-center text-2xl font-semibold ${i === 0 ? "ring-2 ring-blue-500" : ""}`}>
                {m.label}
              </div>

              <div className="mt-4 space-y-3">
                <button
                  className="w-full rounded-lg bg-white/70 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white"
                  onClick={() => onTotalOps(m)}
                >
                  Total number of operations
                </button>
                <button
                  className="w-full rounded-lg bg-white/70 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white"
                  onClick={() => onHistory(m)}
                >
                  Historical overview
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          className="rounded-full bg-gray-300/80 px-5 py-2 text-sm font-medium disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <span className="text-sm">{page}/{totalPages}</span>
        <button
          className="rounded-full bg-gray-300/80 px-5 py-2 text-sm font-medium disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{modal.title}</h2>
              <button className="rounded-md bg-gray-200 px-2 py-1 text-xs" onClick={() => setModal(null)}>Close</button>
            </div>
            {modal.body}
          </div>
        </div>
      )}
    </div>
  );
}
