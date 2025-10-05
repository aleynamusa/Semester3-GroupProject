'use client';
import { useEffect, useState } from 'react';

interface ActivityRow {
  id: number;
  name: string;
  activity: boolean;
}

export default function ActivityComponent() {

    const TODAYS_DATE = '2020-09-30';
    const [activeRows, setActiveRows] = useState<ActivityRow[]>([]);
    const [showActiveTable, setShowActiveTable] = useState(true);
    const [activeLoading, setActiveLoading] = useState(false);
    const [activeError, setActiveError] = useState<string | null>(null);

  const fetchActiveToday = async () => {
    setActiveLoading(true);
    setActiveError(null);
    try {
      const params = new URLSearchParams({
        endpoint: 'machines-activity',
        date: TODAYS_DATE,
      });
      const res = await fetch(`./machine-activity/api/activity?${params}`);
      const json = await res.json();

      if (!json.success) {
        setActiveError('Failed to fetch active-on-date data');
        setActiveRows([]);
        return;
      }
      const rows: ActivityRow[] = (json.machines ?? []).sort((a: ActivityRow, b: ActivityRow) =>
        a.name.localeCompare(b.name)
      );
      setActiveRows(rows);
    } catch (e: any) {
      setActiveError(e?.message ?? 'Unknown error');
      setActiveRows([]);
    } finally {
      setActiveLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveToday();
  }, []);

  return (
  <>
  
    {/* Activity */}
      {showActiveTable && (
          <div className="mb-6">
    <h2 className="text-xl font-semibold mb-4">Active Machines on {TODAYS_DATE}</h2>

    {activeLoading && (
        <div className="flex justify-center items-center p-6 text-gray-200">
        Loading machine-activity data…
      </div>
    )}

    {activeError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{activeError}</span>
      </div>
    )}

    {!activeLoading && !activeError && (
        <div className="overflow-x-auto border border-gray-300 rounded-lg bg-black">
        <table className="min-w-full">
          <thead className="bg-[#222523]">
            <tr>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                ID (production_data)
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Machine
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status on {TODAYS_DATE}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {activeRows.length > 0 ? (
                activeRows.map((row) => (
                    <tr key={`${row.id}-${row.name}`} className="hover:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{row.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{row.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {row.activity ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
                <tr>
                <td colSpan={3} className="px-6 py-6 text-center text-sm text-gray-400">
                  No rows for {TODAYS_DATE}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}
</>      
  );

}