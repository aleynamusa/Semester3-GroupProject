import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';



type MachineInfo = {
  id: number;
  board: number;
  port: number;
  name: string;
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
  mold_info?: {
    name?: string;
    description?: string;
    is_swapped: boolean;
    swap_color?: string;
  };
};



function parseDate(s?: string) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}






async function fetchMachinePortsMap() {
  const { data, error } = await createClient()
    .from('machine_monitoring_poorten')
    .select('id, board, port, name, volgorde, visible');
  if (error) {
    console.error('fetchMachinePortsMap error', error);
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
      volgorde: row.volgorde ?? 0,
      visible: row.visible ?? true
    });
  }
  return map;
}





async function getMachineMonitoringData(startDate: string, endDate: string, selectedMachines?: string[], granularity: 'day' | 'hour' | 'minute' = 'day'): Promise<MachineDataPoint[]> {
  try {
    console.log(`Fetching machine monitoring data using views for date range ${startDate} to ${endDate}`);
    
    if (!selectedMachines || selectedMachines.length === 0) {
      console.log('No machines selected');
      return [];
    }

    const startDateOnly = startDate.split('T')[0];
    const endDateOnly = endDate.split('T')[0];

    // Select the appropriate view based on granularity
    const viewName = granularity === 'minute' ? 'v_machine_monitoring_minute' : 
                     granularity === 'hour' ? 'v_machine_monitoring_hour' : 
                     'v_machine_monitoring';
    
    const timeColumn = granularity === 'minute' ? 'shot_minute' : 
                       granularity === 'hour' ? 'shot_hour' : 
                       'shot_date';

    console.log(`Querying ${viewName} view for machines: ${selectedMachines.join(',')}, date range: ${startDateOnly} to ${endDateOnly}, granularity: ${granularity}`);

    // Query the appropriate pre-aggregated view - much faster!
    const query = createClient()
      .from(viewName)
      .select(`
        ${timeColumn},
        machine_key,
        board,
        port,
        shot_count,
        machine_name,
        machine_id,
        visible
      `)
      .gte(timeColumn, granularity === 'day' ? startDateOnly : `${startDateOnly}T00:00:00`)
      .lte(timeColumn, granularity === 'day' ? endDateOnly : `${endDateOnly}T23:59:59`)
      .in('machine_key', selectedMachines)
      .eq('visible', true)
      .order(timeColumn, { ascending: true })
      .order('board', { ascending: true })
      .order('port', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error querying v_machine_monitoring view:', error);
      return [];
    }

    console.log(`Retrieved ${(data || []).length} pre-aggregated records from view`);

    // Convert to result format
    const result: MachineDataPoint[] = (data || []).map(row => {
      // Get the timestamp from the appropriate column
      const timeValue = (row as Record<string, unknown>)[timeColumn] as string;
      const timestamp = granularity === 'day' 
        ? `${timeValue}T12:00:00.000Z` // Use noon for daily data
        : `${timeValue}.000Z`; // Use exact time for hour/minute data
      
      return {
        timestamp,
        machine_name: row.machine_name || `Machine ${row.board}-${row.port}`,
        machine_id: row.machine_id,
        board: row.board,
        port: row.port,
        shot_count: row.shot_count,
        mold_info: undefined // Will add production data later if needed
      };
    });

    console.log(`Generated ${result.length} machine data points from view`);
    return result;

  } catch (error) {
    console.error('Error in getMachineMonitoringData:', error);
    return [];
  }
}



export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;
    const endpoint = params.get('endpoint') ?? 'legacy';
    const machinesParam = params.get('machines');
    const machines = machinesParam ? machinesParam.split(',') : undefined;
    const granularity = (params.get('granularity') as 'day' | 'hour' | 'minute') ?? 'day';

    const endDate = parseDate(params.get('end') ?? undefined) ?? new Date('2020-09-07');
    const startDate = parseDate(params.get('start') ?? undefined) ?? new Date('2020-09-07');

    if (endpoint === 'machines') {
      const machinesOnly = params.get('machines_only') === 'true';

      if (machinesOnly) {
        try {
          const machinesMap = await fetchMachinePortsMap();
          const machines = Array.from(machinesMap.values());
          return NextResponse.json({
            success: true,
            machines: machines,
            total_machines: machines.length,
            note: "Machine list retrieved from machine_monitoring_poorten table"
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: `Failed to fetch machines: ${error}`,
            machines: [],
            total_machines: 0
          });
        }
      }

      const selectedMachines = machines;

      const machineData = await getMachineMonitoringData(
        startDate.toISOString(),
        endDate.toISOString(),
        selectedMachines,
        granularity
      );

      return NextResponse.json({
        success: true,
        data: machineData,
        meta: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          total_records: machineData.length,
          machines_count: new Set(machineData.map(d => d.machine_id)).size
        }
      });
    }

    return NextResponse.json({ error: 'Legacy endpoint not supported' }, { status: 400 });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
