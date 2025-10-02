import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  const { searchParams } = new URL(req.url);
  const limit = Math.max(1, Number(searchParams.get("limit") ?? 20));

    const supabase = await createClient();
    const { data, error } = await supabase
    .from("production_data")
    .select("id, start_date, end_date, amount")
    .or(`treeview_id.eq.${id},treeview2_id.eq.${id}`)
    .order("start_date", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    items: data ?? [],
  });
}
