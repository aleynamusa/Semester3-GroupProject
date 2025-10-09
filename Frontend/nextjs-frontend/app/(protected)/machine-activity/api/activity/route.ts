
import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

type OutRow = {
  MachineName: string;
  MoldName: string | null;
  Status: "operational" | "standby" | "inactive";
};

const VIEW = "machineactivity";

type ViewRow = {
  machine_name: string | null;
  mold_name: string | null;
  status: "operational" | "standby" | "inactive" | null;
};

export async function GET() {
  try {
    const supabase = await createServerSupabase();

    const { data, error } = await supabase
      .from(VIEW)                                      
      .select("machine_name, mold_name, status")
      .returns<ViewRow[]>();                           

    if (error) throw new Error(error.message ?? String(error));

    const items: OutRow[] = (data ?? [])
      .map((r) => ({
        MachineName: r.machine_name ?? "Unknown machine",
        MoldName: r.mold_name ?? null,
        Status: (r.status ?? "inactive") as OutRow["Status"],
      }))
      .sort((a, b) => a.MachineName.localeCompare(b.MachineName));

    return NextResponse.json({
      success: true,
      total: items.length,
      items, 
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}

