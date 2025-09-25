export interface Treeview {
  id: number
  name: string
  description: string
}

export interface ProductionData {
  id: number
  start_date: string
  end_date: string | null
  amount: number
  port: number
  board: number
  treeview_id: Treeview | null
  treeview2_id: Treeview | null
}
