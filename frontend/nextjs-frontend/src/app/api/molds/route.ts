import { NextResponse } from "next/server";
import { supabase } from "../..../../../lib/supabaseClient";

// What the UI needs for each mold
type MoldDto = {
  id: number;
  name: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.max(1, Number(searchParams.get("pageSize") ?? 9));
  const debug = searchParams.get("debug") === "1";

  // 1) Discover molds used in production (both columns)
  const { data: prod, error: prodErr } = await supabase
    .from("production_data")
    .select("treeview_id, treeview2_id")
    .limit(10000);

  if (prodErr) {
    return NextResponse.json({ error: prodErr.message }, { status: 500 });
  }

  const ids = new Set<number>();
  for (const r of prod ?? []) {
    const a = Number(r.treeview_id);
    const b = Number(r.treeview2_id);
    if (Number.isFinite(a) && a > 0) ids.add(a);
    if (Number.isFinite(b) && b > 0) ids.add(b);
  }

  const uniqueIds = Array.from(ids);
  if (uniqueIds.length === 0) {
    return NextResponse.json({
      page,
      pageSize,
      totalItems: 0,
      totalPages: 1,
      items: [] as MoldDto[],
      ...(debug && { debug: { prodCount: prod?.length ?? 0, uniqueIds } }),
    });
  }

  // 2) Fetch names from treeview
  const { data: tv, error: tvErr } = await supabase
    .from("treeview")
    .select("id, naam")
    .in("id", uniqueIds);

  if (tvErr) {
    return NextResponse.json({ error: tvErr.message }, { status: 500 });
  }

  const molds: MoldDto[] =
    (tv ?? [])
      .map((t: any) => ({
        id: Number(t.id),
        name: t.naam ?? `MO${t.id}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

  // 3) Pagination
  const totalItems = molds.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;
  const items = molds.slice(start, start + pageSize);

  return NextResponse.json({
    page,
    pageSize,
    totalItems,
    totalPages,
    items,
    ...(debug && {
      debug: {
        envUrlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        envKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        prodCount: prod?.length ?? 0,
        uniqueIdsCount: uniqueIds.length,
        tvCount: tv?.length ?? 0,
      },
    }),
  });
}
