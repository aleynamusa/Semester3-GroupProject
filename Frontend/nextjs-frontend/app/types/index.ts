// app/types/index.ts
export interface Treeview {
  id: number;
  name: string;
  description: string;
}

export interface MachineMonitoringPoort {
  id: number;
  name: string;
  visible: boolean;
}

export interface ProductionData {
  id: number;
  start_date: string;
  end_date: string;
  amount: number;
  board: number;
  port: number;
  treeview_id: Treeview[];  // ✅ now matches array
  treeview2_id: Treeview[]; // ✅ now matches array
  machine_monitoring_poorten: MachineMonitoringPoort[];
}
