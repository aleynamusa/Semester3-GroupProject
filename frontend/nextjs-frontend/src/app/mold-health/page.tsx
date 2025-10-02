'use client';
import { useEffect, useState } from 'react';

type Mold = { id: number; name: string | null; };

export default function MoldsPage() {
  const [molds, setMolds] = useState<Mold[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/molds', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Mold[] = await res.json();
        setMolds(data);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load');
      }
    })();
  }, []);

  if (error) return <p style={{ color: 'crimson' }}>Error: {error}</p>;
  if (!molds.length) return <p>No molds yet.</p>;

 return (
  <ul>
    {molds.map(m => (
      <li key={m.id}>{m.name ?? 'Unnamed'}</li>
    ))}
  </ul>
);
}
