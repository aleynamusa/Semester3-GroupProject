import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ProductionRow = {
  id: number;
  start_date: string;
  end_date: string | null;
  board: string | number | null;
  port: string | number | null;
  treeview_id?: number | null;
  treeview2_id?: number | null;
};

type MachineRow = {
  id: number;
  name: string | null;
  board: string | number | null;
  port: string | number | null;
};

type ResponseItem = {
  prodId: number;
  prodStart_date: string;
  prodEnd_date: string | null;
  moldName: string | null;
  machineName: string | null;
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const moldId = Number(params.id);
  if (!Number.isFinite(moldId) || moldId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const url = new URL(req.url);
  const limit = Math.max(1, Number(url.searchParams.get("limit") ?? 30));
  const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0));

  const supabase = await createClient();

  // 1) Mold (treeview)
  const { data: moldRow, error: moldErr } = await supabase
    .from("treeview")
    .select("id,name")
    .eq("id", moldId)
    .maybeSingle();

  if (moldErr) return NextResponse.json({ error: moldErr.message }, { status: 500 });
  if (!moldRow) return NextResponse.json({ error: "Mold not found" }, { status: 404 });

  // 2) Production rows (paged)
  const { data: pd, error: pdErr } = await supabase
    .from("production_data")
    .select("id,start_date,end_date,board,port,treeview_id,treeview2_id")
    .or(`treeview_id.eq.${moldId},treeview2_id.eq.${moldId}`)
    .order("start_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (pdErr) return NextResponse.json({ error: pdErr.message }, { status: 500 });

  // 3) Machines (index by board-port)
  const { data: machines, error: machErr } = await supabase
    .from("machine_monitoring_poorten") 
    .select("id,name,board,port");

  if (machErr) return NextResponse.json({ error: machErr.message }, { status: 500 });

  const byBoardPort = new Map<string, MachineRow>();
  for (const m of (machines ?? [])) {
    const key = `${m.board}-${m.port}`;
    byBoardPort.set(key, m);
  }

  // Merge → package
  const items: ResponseItem[] = (pd ?? []).map((row: ProductionRow) => {
    const key = row.board != null && row.port != null ? `${row.board}-${row.port}` : null;
    const machine = key ? byBoardPort.get(key) : undefined;

    return {
      prodId: row.id,
      prodStart_date: row.start_date,
      prodEnd_date: row.end_date,
      moldName: moldRow?.name ?? null,
      machineName: machine?.name ?? (key ? `Machine ${key}` : null),
    };
  });

  return NextResponse.json({
    moldId,
    items,
    offset,
    limit,
  });
}
