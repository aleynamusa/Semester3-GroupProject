import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

type MonthlyRow = {
  timestamp: string;
  shot_time?: number | null;
  board?: number | string;
  port?: number | string;
  value?: number | null;
  machine_id?: number | string;
};

type MonthlyResult = { timestamp: string; value: number | null; board: number | string; port: number | string; machine_id?: number | string };

function parseDate(s?: string) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function floorDateToUnit(d: Date, unit: 'minute' | 'hour' | 'day') {
  const t = new Date(d);
  if (unit === 'minute') {
    t.setSeconds(0, 0);
  } else if (unit === 'hour') {
    t.setMinutes(0, 0, 0);
  } else {
    t.setHours(0, 0, 0, 0);
  }
  return t.toISOString();
}

function monthsBetween(start: Date, end: Date) {
  const arr: string[] = [];
  const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  while (cur <= last) {
    const y = cur.getUTCFullYear();
    const m = String(cur.getUTCMonth() + 1).padStart(2, '0');
    arr.push(`${y}${m}`);
    cur.setUTCMonth(cur.getUTCMonth() + 1);
  }
  return arr;
}

async function getBoardsForComponent(component?: string) {
  if (!component) return undefined;
  try {
    const { data, error } = await supabase
      .from('production_data')
      .select('board, port, start_date, start_time, end_date, end_time, treeview_id, treeview2_id')
      .or(`treeview_id.eq.${component},treeview2_id.eq.${component}`);
    if (error) {
      console.error('Error fetching production_data mapping', error);
      return undefined;
    }
    // Normalize into array of { board, port, from: Date, to: Date }
    const ranges: Array<{ board: number; port: number; from: Date; to: Date }> = [];
    for (const r of data ?? []) {
      const board = Number(r.board);
      const port = Number(r.port);
      const from = r.start_date && r.start_time ? new Date(`${r.start_date} ${r.start_time}`) : new Date(0);
      const to = r.end_date && r.end_time ? new Date(`${r.end_date} ${r.end_time}`) : new Date('2030-01-01');
      ranges.push({ board, port, from, to });
    }
    return ranges;
  } catch (err) {
    console.error('production_data lookup failed', err);
    return undefined;
  }
}

async function fetchFromMonthlyTables(component?: string, start?: string, end?: string, machines?: string[]): Promise<MonthlyResult[]> {
  const startDate = start ? new Date(start) : new Date();
  const endDate = end ? new Date(end) : new Date();
  const months = monthsBetween(startDate, endDate);

  const boardRanges = await getBoardsForComponent(component);

  const results: MonthlyResult[] = [];
  for (const ym of months) {
    const table = `monitoring_data_${ym}`;
    try {
      let q = supabase.from(table).select('timestamp, shot_time, board, port').order('timestamp', { ascending: true }).limit(500000);

      if (start) q = q.gte('timestamp', start);
      if (end) q = q.lte('timestamp', end);

      // If machines list provided (boardport strings like '11'), try to split into board/port and filter
      if (machines && machines.length) {
        // not all tables support composite filtering; fetch then filter client-side
      }

      const { data, error } = await q;
      if (error) {
        console.warn(`Skipping table ${table} due to error:`, error.message ?? error);
        continue;
      }
      for (const row of (data ?? []) as MonthlyRow[]) {
        try {
          const ts = new Date(row.timestamp);
          if (isNaN(ts.getTime())) continue;
          // if we have boardRanges for the component, filter rows that fall into any active range
          if (boardRanges && boardRanges.length) {
            const match = boardRanges.some((br) => br.board === Number(row.board) && br.port === Number(row.port) && ts >= br.from && ts <= br.to);
            if (!match) continue;
          }
          // if machines filter provided, interpret machines as board+port strings
          if (machines && machines.length) {
            const key = String(row.board) + String(row.port);
            if (!machines.includes(key)) continue;
          }

          results.push({ timestamp: ts.toISOString(), value: row.shot_time == null ? null : Number(row.shot_time), board: row.board ?? '', port: row.port ?? '', machine_id: ('machine_id' in row ? row.machine_id : undefined) });
        } catch {
          // ignore bad row
        }
      }
    } catch (err) {
      console.warn(`Error querying ${table}:`, err);
      continue;
    }
  }

  // sort by timestamp
  results.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return results;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;
    const component = params.get('component') ?? undefined;
    const machinesParam = params.get('machines');
    const machines = machinesParam ? machinesParam.split(',') : undefined;
    const agg = (params.get('agg') ?? 'none') as 'none' | 'minute' | 'hour' | 'day';

    const endDate = parseDate(params.get('end') ?? undefined) ?? new Date();
    const startDate = parseDate(params.get('start') ?? undefined) ?? new Date(Date.now() - 7 * 24 * 3600 * 1000);

    const maxRangeMs = 365 * 24 * 3600 * 1000;
    if (endDate.getTime() - startDate.getTime() > maxRangeMs && agg === 'none') {
      return NextResponse.json({ error: 'Range too large; request aggregation using agg=hour or day' }, { status: 400 });
    }

    let rows: MonthlyResult[] = [];
    try {
      rows = await fetchFromMonthlyTables(component, startDate.toISOString(), endDate.toISOString(), machines);
    } catch (err) {
      console.error('Monthly-table query failed, falling back to sample data', err);
      const sample: MonthlyResult[] = [];
      const now = Date.now();
      for (let i = 0; i < 500; i++) {
        sample.push({ timestamp: new Date(now - (500 - i) * 60000).toISOString(), value: 4 + Math.random() * 4, board: 1, port: 1 });
      }
      rows = sample;
    }

    // Normalize and optionally aggregate
    const normalized = (rows || []).map((r) => ({
      timestamp: new Date(r.timestamp).toISOString(),
      value: (r.value == null ? null : Number(r.value)),
      component_id: component ?? null,
      machine_id: r.board != null && r.port != null ? String(r.board) + String(r.port) : (r.machine_id != null ? String(r.machine_id) : null),
    }));

    if (agg === 'none') {
      return NextResponse.json({ data: normalized, aggregated: false });
    }

    // aggregate in-js by unit
    const groups: Record<string, { sum: number; count: number; min: number; max: number }> = {};
    for (const row of normalized) {
      if (row.value == null || isNaN(row.value)) continue;
      const key = floorDateToUnit(new Date(row.timestamp), agg);
      if (!groups[key]) groups[key] = { sum: 0, count: 0, min: row.value, max: row.value };
      groups[key].sum += row.value;
      groups[key].count += 1;
      if (row.value < groups[key].min) groups[key].min = row.value;
      if (row.value > groups[key].max) groups[key].max = row.value;
    }

    const out = Object.keys(groups)
      .sort()
      .map((k) => ({ timestamp: k, avg: groups[k].sum / groups[k].count, count: groups[k].count, min: groups[k].min, max: groups[k].max }));

    return NextResponse.json({ data: out, aggregated: true });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
