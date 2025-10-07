import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const moldId = Number(params.id);
  if (!Number.isFinite(moldId) || moldId <= 0) {
    return NextResponse.json({ error: "Missing or invalid mold ID" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mold_daily_summary")
    .select("mold_id, mold_name, operation_date, total_products")
    .eq("mold_id", moldId)
    .order("operation_date", { ascending: true });

  if (error) {
    console.error("Supabase error (daily):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const days = (data ?? []).map((r) => ({
    date: (r.operation_date as unknown as string)?.slice(0, 10), 
    total: r.total_products ?? 0,
  }));

  const moldName = data?.[0]?.mold_name ?? null;

  return NextResponse.json({
    moldId,
    moldName,
    days, 
  });
}
