// app/api/molds/[id]/total-ops/route.ts
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
    .eq("mold_id", moldId);

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({
      moldId,
      moldName: null,
      totalOperations: 0,
      firstOperationAt: null,
      lastOperationAt: null,
      avgCycleMs: null,
    });
  }

  const totalOperations = data.reduce((acc, r) => acc + (r.total_products ?? 0), 0);

  let firstOperationAt: string | null = null;
  let lastOperationAt: string | null = null;
  for (const row of data) {
    const d = new Date(row.operation_date as any);
    if (!firstOperationAt || d < new Date(firstOperationAt)) firstOperationAt = d.toISOString();
    if (!lastOperationAt || d > new Date(lastOperationAt)) lastOperationAt = d.toISOString();
  }

  const moldName = data[0]?.mold_name ?? null;

  return NextResponse.json({
    moldId,
    moldName,
    totalOperations,
    firstOperationAt,
    lastOperationAt,
    avgCycleMs: null,
  });
}
