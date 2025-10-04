'use client';

type Mold = { id: number; name: string | null };

const COLORS = [
  'bg-slate-200',   
  'bg-stone-200',
  'bg-zinc-200',
  'bg-slate-300',
  'bg-stone-300',
  'bg-zinc-300',
];


export default function MoldCard({
  mold,
  index,
  onTotals,
  onHistory,
  onWeeklyGraph,
}: {
  mold: Mold;
  index: number;          
  onTotals: (id: number) => void;
  onHistory: (id: number) => void;
  onWeeklyGraph: (id: number) => void;
}) {
  const color = COLORS[index % COLORS.length];

  return (
    <article className={`${color} rounded-3xl p-4 shadow-sm`}>
      { /* “Tag” with the mold label */ }
      <div className="mx-auto w-32 rounded-2xl bg-white text-center py-6 text-3xl font-semibold tracking-wide shadow">
        {mold.name ?? `M${mold.id}`}
      </div>

      <div className="mt-6 grid gap-3">
        <button
          onClick={() => onTotals(mold.id)}
          className="rounded-xl bg-white/70 px-4 py-3 text-left text-sm font-medium hover:bg-white transition shadow-sm"
        >
          Total Number of Operations
        </button>

        <button
          onClick={() => onHistory(mold.id)}
          className="rounded-xl bg-white/70 px-4 py-3 text-left text-sm font-medium hover:bg-white transition shadow-sm"
        >
          Historical Overview
        </button>

        <button
          onClick={() => onWeeklyGraph(mold.id)}
          className="rounded-xl bg-white/70 px-4 py-3 text-left text-sm font-medium hover:bg-white transition shadow-sm"
        >
          Current Week Production Graph
        </button>
      </div>
    </article>
  );
}
