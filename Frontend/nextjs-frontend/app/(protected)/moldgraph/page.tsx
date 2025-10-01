import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

type MachineInfo = {
  id: number;
  board: number;
  port: number;
  name: string;
  description?: string;
  volgorde: number;
  visible: boolean;
};

type MachineDataPoint = {
  timestamp: string;
  machine_name: string;
  machine_id: number;
  board: number;
  port: number;
  shot_count: number;
  mold_info: {
    name: string;
    description?: string;
    is_swapped: boolean;
    swap_color?: string;
  };
};

async function fetchMachinePortsMap() {
  const { data, error } = await supabase
    .from("machine_monitoring_poorten")
    .select("id, board, port, name, description, volgorde, visible");

  if (error) {
    console.error("fetchMachinePortsMap error", error);
    return new Map<string, MachineInfo>();
  }

  const map = new Map<string, MachineInfo>();
  for (const row of data ?? []) {
    const key = `${row.board}-${row.port}`;
    map.set(key, {
      id: row.id,
      board: row.board,
      port: row.port,
      name: row.name ?? `Machine ${row.board}-${row.port}`,
      description: row.description,
      volgorde: row.volgorde ?? 0,
      visible: row.visible ?? true,
    });
  }
  return map;
}

async function fetchFromView(
  viewName: string,
  timeColumn: string,
  selectedMachines?: string[]
): Promise<MachineDataPoint[]> {
  if (!selectedMachines || selectedMachines.length === 0) return [];

  const machinesMap = await fetchMachinePortsMap();

  const { data, error } = await supabase
    .from(viewName)
    .select("*")
    .in("machine_key", selectedMachines)
    .order(timeColumn, { ascending: true })
    .order("board", { ascending: true })
    .order("port", { ascending: true });

  if (error) {
    console.error(`Error querying ${viewName}:`, error);
    return [];
  }

  return (data || []).map((row: any) => {
    const machineInfo = machinesMap.get(row.machine_key);
    const timestamp = new Date(row[timeColumn]).toISOString();

    const moldInfo = row.mold_name || row.mold_description || row.is_swapped !== null
      ? {
          name: row.mold_name ?? "Unknown Mold",
          description: row.mold_description ?? "",
          is_swapped: Boolean(row.is_swapped),
          swap_color: row.swap_color ?? undefined,
        }
      : { name: "Unknown Mold", is_swapped: false };

    return {
      timestamp,
      machine_name: machineInfo?.name || `Machine ${row.board}-${row.port}`,
      machine_id: machineInfo?.id || 0,
      board: row.board,
      port: row.port,
      shot_count: row.shot_count ?? 0,
      mold_info: moldInfo,
    };
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;
    const endpoint = params.get("endpoint") ?? "legacy";
    const machinesParam = params.get("machines");
    const machines = machinesParam ? machinesParam.split(",") : undefined;

    if (endpoint === "machines") {
      const machinesOnly = params.get("machines_only") === "true";

      if (machinesOnly) {
        const machinesMap = await fetchMachinePortsMap();
        const machinesList = Array.from(machinesMap.values());
        return NextResponse.json({
          success: true,
          machines: machinesList,
          total_machines: machinesList.length,
        });
      }

      // Fetch all granularities
      const [daily, hourly, minute] = await Promise.all([
        fetchFromView("v_daily_shots", "shot_date", machines),
        fetchFromView("v_hour_shots", "shot_hour", machines),
        fetchFromView("v_minute_shots", "shot_minute", machines),
      ]);

      // ✅ Merge all data to a single array
      const allData = [...daily, ...hourly, ...minute];

      return NextResponse.json({
        success: true,
        data: allData,
        meta: {
          total_records: allData.length,
          machines_count: new Set(allData.map(d => d.machine_id)).size,
        },
      });
    }

    return NextResponse.json(
      { error: "Legacy endpoint not supported" },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error("API error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
