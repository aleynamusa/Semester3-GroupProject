// app/api/machines-activity/route.ts
import { NextResponse } from 'next/server';
import { createClient as createServerSupabase } from '@/lib/supabase/server';

type ActivityRow = {
  id: number;      // production_data.id
  name: string;    // machine name
  activity: boolean;
};

// --- kis diagnosztikai helper ---
async function diagnostics(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  dateStr: string
) {
  const { error: machinesErr, count: machinesCount } = await supabase
    .from('machine_monitoring_poorten')
    .select('id', { head: true, count: 'exact' })
    .eq('visible', true);

  console.log('visible machines count:', machinesCount ?? 0, 'err:', machinesErr ?? null);

  const { error: prodErr, count: prodCount } = await supabase
    .from('production_data')
    .select('id', { head: true, count: 'exact' })
    .lte('start_date', dateStr) // ha TIMESTAMP: dateStrISO
    .or(`end_date.is.null,end_date.gte.${dateStr}`); // ha TIMESTAMP: ...gte.${dateStrISO}

  console.log('production filtered count:', prodCount ?? 0, 'err:', prodErr ?? null);

  return {
    machinesErr: machinesErr ? String(machinesErr.message ?? machinesErr) : null,
    machinesCount: machinesCount ?? 0,
    prodErr: prodErr ? String(prodErr.message ?? prodErr) : null,
    prodCount: prodCount ?? 0,
  };
}

async function getMachineActivity(): Promise<{ rows: ActivityRow[]; diag: any }> {
  // mock "today" (DATE típushoz)
  const dateStr = '2020-09-30';
  // TIMESTAMP esetén használd inkább: const dateStrISO = '2020-09-30T00:00:00Z';

  // SSR Supabase kliens (auth cookie-val, ha van)
  const supabase = await createServerSupabase();

  // --- diagnosztika ---
  const diag = await diagnostics(supabase, dateStr /* v. dateStrISO */);

  // 1) látható gépek
  const { data: machines, error: machinesErr } = await supabase
    .from('machine_monitoring_poorten')
    .select('id, board, port, name')
    .eq('visible', true);

  if (machinesErr) {
    console.error('machine_monitoring_poorten error:', machinesErr);
    return { rows: [], diag: { ...diag, machinesFetchError: String(machinesErr.message ?? machinesErr) } };
  }

  const machineMap = new Map<string, { id: number; name: string }>();
  for (const m of machines ?? []) {
    machineMap.set(`${m.board}-${m.port}`, {
      id: m.id,
      name: m.name ?? `Machine ${m.board}-${m.port}`,
    });
  }

  if (machineMap.size === 0) {
    console.warn('No visible machines found.');
    return { rows: [], diag };
  }

  // 2) production_data: csak az adott napon aktív sorok
  const { data: prod, error: prodErr } = await supabase
    .from('production_data')
    .select('id, start_date, end_date, board, port')
    .lte('start_date', dateStr)                      // ha TIMESTAMP: dateStrISO vagy `${dateStr}T23:59:59`
    .or(`end_date.gte.${dateStr}`); // ha TIMESTAMP: ...gte.${dateStrISO}

  if (prodErr) {
    console.error('production_data error:', prodErr);
    return { rows: [], diag: { ...diag, prodFetchError: String(prodErr.message ?? prodErr) } };
  }

  // CÉLDÁTUM milliszekundumban (DATE esetén éjfél UTC)
  const targetTime = new Date(`${dateStr}T00:00:00Z`).getTime(); // TIMESTAMP esetén: new Date(dateStrISO).getTime()

  const rows: ActivityRow[] = [];
  for (const pd of prod ?? []) {
    const m = machineMap.get(`${pd.board}-${pd.port}`);
    if (!m) continue;

    // aktív, ha nincs end_date VAGY end_date >= cél nap
    const isActive =
      !pd.end_date ||
      new Date(`${pd.end_date}T00:00:00Z`).getTime() >= targetTime; // TIMESTAMP esetén: new Date(pd.end_date).getTime()

    // itt a DB-szűrés miatt amúgy is true lesz; megtartjuk a mezőt konzisztencia miatt
    rows.push({ id: pd.id, name: m.name, activity: isActive });
  }

  rows.sort((a, b) => a.name.localeCompare(b.name));
  return { rows, diag };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const endpoint = url.searchParams.get('endpoint') ?? 'legacy';
    const debug = url.searchParams.get('debug') === '1';

    if (endpoint !== 'machines-activity') {
      return NextResponse.json({ error: 'Legacy endpoint not supported' }, { status: 400 });
    }

    const { rows, diag } = await getMachineActivity();

    return NextResponse.json({
      success: true,
      total: rows.length,
      machines: rows,           // [{ id, name, activity: true }]
      ...(debug ? { diagnostics: diag } : {}),
    });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
