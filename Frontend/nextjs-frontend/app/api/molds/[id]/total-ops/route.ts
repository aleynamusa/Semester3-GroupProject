import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { create } from "domain";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);

  // count occurrences as primary
  const supabase = await createClient();
  const { count: c1, error: e1 } = await supabase
    .from("production_data")
    .select("id", { count: "exact", head: true })
    .eq("treeview_id", id);

  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  // count occurrences as secondary
  const { count: c2, error: e2 } = await supabase
    .from("production_data")
    .select("id", { count: "exact", head: true })
    .eq("treeview2_id", id);

  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

  return NextResponse.json({ totalOps: (c1 ?? 0) + (c2 ?? 0) });
}
