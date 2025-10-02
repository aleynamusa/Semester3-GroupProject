import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

type MachineInfo = {
  id: number;
  board: number;
  port: number;
  name: string;
  volgorde: number;
  visible: boolean;
  current_mold?: {
    mold_name: string | null;
    mold_description: string | null;
    is_swapped: boolean;
    swap_color: string;
    last_seen: string;
  } | null;
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






async function fetchMachinePortsMap(includeMolds: boolean = false) {
  const { data, error } = await createClient()
    .from('machine_monitoring_poorten')
    .select('id, board, port, name, volgorde, visible');
  
  if (error) {
    console.error('fetchMachinePortsMap error', error);
    return new Map<string, MachineInfo>();
  }
  
  const map = new Map<string, MachineInfo>();
  
  // Fetch current mold info if requested
  let moldMap = new Map<string, any>();
  if (includeMolds) {
    const { data: moldData, error: moldError } = await createClient()
      .from('v_daily_shots')
      .select('board, port, mold_name, mold_description, is_swapped, swap_color, shot_date')
      .order('shot_date', { ascending: false });
    
    if (!moldError && moldData) {
      // Get the latest mold for each machine
      moldData.forEach(row => {
        const key = `${row.board}-${row.port}`;
        if (!moldMap.has(key)) {
          moldMap.set(key, {
            mold_name: row.mold_name,
            mold_description: row.mold_description,
            is_swapped: row.is_swapped,
            swap_color: row.swap_color,
            last_seen: row.shot_date
          });
        }
      });
    }
  }
  
  for (const row of data ?? []) {
    const key = `${row.board}-${row.port}`;
    map.set(key, {
      id: row.id,
      board: row.board,
      port: row.port,
      name: row.name ?? `Machine ${row.board}-${row.port}`,
      volgorde: row.volgorde ?? 0,
      visible: row.visible ?? true,
      current_mold: includeMolds ? (moldMap.get(key) || null) : undefined
    });
  }
  
  return map;
}

async function getMachineMonitoringData(
  startDate: string, 
  endDate: string, 
  selectedMachines?: string[], 
  granularity: 'day' | 'hour' | 'minute' = 'day'
): Promise<MachineDataPoint[]> {
  try {
    console.log(`Fetching machine monitoring data with mold info for date range ${startDate} to ${endDate}`);
    
    if (!selectedMachines || selectedMachines.length === 0) {
      console.log('No machines selected');
      return [];
    }

    const startDateOnly = startDate.split('T')[0];
    const endDateOnly = endDate.split('T')[0];

    // Use the materialized views that include mold data
    const viewName = granularity === 'minute' ? 'v_minute_shots' : 
                     granularity === 'hour' ? 'v_hour_shots' : 
                     'v_daily_shots';
    
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
        mold_name,
        mold_description,
        is_swapped,
        swap_color
      `)
      .gte(timeColumn, granularity === 'day' ? startDateOnly : `${startDateOnly}T00:00:00`)
      .lte(timeColumn, granularity === 'day' ? endDateOnly : `${endDateOnly}T23:59:59`)
      .in('machine_key', selectedMachines)
      .order(timeColumn, { ascending: true })
      .order('board', { ascending: true })
      .order('port', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error querying materialized view:', error);
      return [];
    }

    console.log(`Retrieved ${(data || []).length} records with mold info from view`);

    // Get machine info for names and IDs
    const machinesMap = await fetchMachinePortsMap(false);

    const result: MachineDataPoint[] = (data || []).map(row => {
      const timeValue = (row as Record<string, unknown>)[timeColumn] as string;
      const timestamp = granularity === 'day' 
        ? `${timeValue}T12:00:00.000Z`
        : `${timeValue}.000Z`;
      
      const machineKey = `${row.board}-${row.port}`;
      const machineInfo = machinesMap.get(machineKey);
      
      return {
        timestamp,
        machine_name: machineInfo?.name || `Machine ${row.board}-${row.port}`,
        machine_id: machineInfo?.id || 0,
        board: row.board,
        port: row.port,
        shot_count: row.shot_count,
        mold_info: row.mold_name ? {
          name: row.mold_name,
          description: row.mold_description,
          is_swapped: row.is_swapped,
          swap_color: row.swap_color
        } : undefined
      };
    });

    console.log(`Generated ${result.length} machine data points with mold info`);
    console.log('Sample with mold info:', result.filter(r => r.mold_info).slice(0, 2));
    
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
    const includeMolds = params.get('include_molds') === 'true';

    const endDate = parseDate(params.get('end') ?? undefined) ?? new Date('2020-09-07');
    const startDate = parseDate(params.get('start') ?? undefined) ?? new Date('2020-09-07');

    if (endpoint === 'machines') {
      const machinesOnly = params.get('machines_only') === 'true';

      if (machinesOnly) {
        try {
          const machinesMap = await fetchMachinePortsMap(includeMolds);
          const machinesList = Array.from(machinesMap.values());
          
          console.log(`Returning ${machinesList.length} machines${includeMolds ? ' with mold info' : ''}`);
          
          return NextResponse.json({
            success: true,
            machines: machinesList,
            total_machines: machinesList.length,
            note: `Machine list retrieved from machine_monitoring_poorten table${includeMolds ? ' with current mold info' : ''}`
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
          machines_count: new Set(machineData.map(d => d.machine_id)).size,
          records_with_mold_info: machineData.filter(d => d.mold_info).length
        }
      });
    }

    // New endpoint for machine active status
    if (endpoint === 'active-status') {
      const boardPortParam = params.get('board_port_pairs');
      const checkDate = params.get('date');
      
      if (!boardPortParam || !checkDate) {
        return NextResponse.json({
          success: false,
          error: 'Missing required parameters: board_port_pairs and date'
        }, { status: 400 });
      }
      
      try {
        // Parse board_port_pairs from JSON string like: [{"board":1,"port":1},{"board":1,"port":2}]
        const boardPortPairs = JSON.parse(boardPortParam);
        const activeStatus = await getMachineActiveStatus(boardPortPairs, checkDate);
        
        return NextResponse.json({
          success: true,
          active_status: activeStatus,
          check_date: checkDate,
          machines_checked: Object.keys(activeStatus).length
        });
      } catch {
        return NextResponse.json({
          success: false,
          error: 'Invalid board_port_pairs format. Expected JSON array like: [{"board":1,"port":1},{"board":1,"port":2}]'
        }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Legacy endpoint not supported' }, { status: 400 });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

async function getMachineActiveStatus(
  boardPortPairs: Array<{board: number, port: number}>, 
  checkDate: string
): Promise<{[machineName: string]: boolean}> {
  try {
    // Get machine names from machine_monitoring_poorten table
    const machinesMap = await fetchMachinePortsMap(false);

    // Use v_daily_shots view instead of production_data table since that's where the actual data is
    const { data: shotData, error } = await supabase
      .from('v_daily_shots')
      .select('board, port, shot_date')
      .in('board', boardPortPairs.map(pair => pair.board))
      .in('port', boardPortPairs.map(pair => pair.port))
      .order('shot_date', { ascending: false }); // Get most recent dates first
    
    if (error) {
      console.error('Error fetching shot data:', error);
      return {};
    }
    
    const result: {[machineName: string]: boolean} = {};
    const checkDateObj = new Date(checkDate);
    
    // Process each board/port pair
    for (const pair of boardPortPairs) {
      const machineKey = `${pair.board}-${pair.port}`;
      const machineInfo = machinesMap.get(machineKey);
      const machineName = machineInfo?.name || `Machine ${pair.board}-${pair.port}`;
      
      // Find the most recent shot data for this machine
      const machineShots = shotData
        ?.filter(sd => sd.board === pair.board && sd.port === pair.port)
        ?.sort((a, b) => new Date(b.shot_date).getTime() - new Date(a.shot_date).getTime())[0];
      
      if (machineShots && machineShots.shot_date) {
        const lastShotDate = new Date(machineShots.shot_date);
        result[machineName] = lastShotDate >= checkDateObj;
      } else {
        result[machineName] = false;
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('Error in getMachineActiveStatus:', error);
    return {};
  }
}