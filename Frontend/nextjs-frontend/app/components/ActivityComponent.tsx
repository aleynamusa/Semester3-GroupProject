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
    const base = 'inline-flex px-2 py-1 text-xs font-semibold rounded-full';
    if (s === 'operational') return <span className={`${base} bg-green-100 text-green-800`}>operational</span>;
    if (s === 'standby')     return <span className={`${base} bg-yellow-100 text-yellow-800`}>standby</span>;
    return <span className={`${base} bg-gray-200 text-gray-800`}>inactive</span>;
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Machine activity (mock: 2020-09-30 12:00)</h2>

      {loading && (
        <div className="flex justify-center items-center p-6 text-gray-400">
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
        <div className="overflow-x-auto border border-gray-300 rounded-lg bg-black">
          <table className="min-w-full">
            <thead className="bg-[#222523]">
              <tr>
                <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Machine
                </th>
                <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Mold
                </th>
                <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {rows.length > 0 ? (
                rows.map((r) => (
                  <tr key={`${r.MachineName}-${r.MoldName ?? 'none'}`} className="hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {r.MachineName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {r.MoldName ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {pill(r.Status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-6 text-center text-sm text-gray-400">
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
