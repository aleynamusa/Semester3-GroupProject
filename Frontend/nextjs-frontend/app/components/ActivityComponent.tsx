'use client';
import { useEffect, useState } from 'react';

type Status = 'operational' | 'standby' | 'inactive';
type Item = {
  MachineName: string;
  MoldName: string | null;
  Status: Status;
};

export default function MachinesActivity() {
  const [rows, setRows] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams({
        endpoint: 'machines-activity',
        // If you later add a ref time in the API, you could pass ?ref=...
      });
      const res = await fetch(`machine-activity/api/activity?${params}`, { cache: 'no-store' });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(json?.error ?? 'Request failed');
      }

      const items: Item[] = (json.items ?? []).sort((a: Item, b: Item) =>
        a.MachineName.localeCompare(b.MachineName),
      );
      setRows(items);
    } catch (e: any) {
      setErr(e?.message ?? 'Unknown error');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const pill = (s: Status) => {
    const base = 'inline-flex px-2 py-1 text-[0.9rem] font-semibold rounded-full';
    if (s === 'operational') return <span className={`${base} bg-green-500 text-white`}>operational</span>;
    if (s === 'standby')     return <span className={`${base} bg-yellow-400 text-black`}>standby</span>;
    return <span className={`${base} bg-gray-400 text-white`}>inactive</span>;
  };

  return (
    <div className="mb-6"  style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', border: 'var(--border)' }}>
      <h2 className="text-xl font-semibold mb-4 ml-5">(mock: 2020-09-30 12:00)</h2>

      {loading && (
        <div className="flex justify-center items-center p-6">
          Loading machine activity…
        </div>
      )}

      {err && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{err}</span>
        </div>
      )}

      {!loading && !err && (
         <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg shadow-md text-center">
            <thead className="bg-gray-100 dark:bg-[var(--background)]">
              <tr>
                <th className="px-6 py-3 text-sm font-medium uppercase tracking-wider">Machine</th>
                <th className="px-6 py-3 text-sm font-medium uppercase tracking-wider">Mold</th>
                <th className="px-6 py-3 text-sm font-medium uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((r, idx) => (
                  <tr
                    key={`${r.MachineName}-${r.MoldName ?? 'none'}`}
                    className={`text-[1rem] hover:bg-gray-100 dark:hover:bg-gray-900 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-[var(--background)]'}`}
                  >
                    <td className="px-6 py-4 text-center font-medium">{r.MachineName}</td>
                    <td className="px-6 py-4 text-center">{r.MoldName ?? '—'}</td>
                    <td className="px-6 py-4 text-center">{pill(r.Status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-6 text-center text-sm text-gray-500">
                    No data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
