export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
 
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      machine_monitoring_poorten: {
        Row: {
          board: number
          id: number
          name: string | null
          port: number
          visible: boolean
          volgorde: number
        }
        Insert: {
          board?: number
          id?: number
          name?: string | null
          port?: number
          visible?: boolean
          volgorde?: number
        }
        Update: {
          board?: number
          id?: number
          name?: string | null
          port?: number
          visible?: boolean
          volgorde?: number
        }
        Relationships: []
      }
      monitoring_data_202009: {
        Row: {
          board: number
          code: number
          code2: number
          com: number
          datum: string | null
          id: number
          mac_address: string
          port: number
          previous_shot_id: number | null
          shot_time: number
          timestamp: string | null
        }
        Insert: {
          board?: number
          code?: number
          code2?: number
          com?: number
          datum?: string | null
          id?: number
          mac_address?: string
          port?: number
          previous_shot_id?: number | null
          shot_time?: number
          timestamp?: string | null
        }
        Update: {
          board?: number
          code?: number
          code2?: number
          com?: number
          datum?: string | null
          id?: number
          mac_address?: string
          port?: number
          previous_shot_id?: number | null
          shot_time?: number
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_monitoring_board_port"
            columns: ["board", "port"]
            isOneToOne: false
            referencedRelation: "machine_monitoring_poorten"
            referencedColumns: ["board", "port"]
          },
        ]
      }
      production_data: {
        Row: {
          amount: number
          board: number
          description: string
          end_date: string | null
          end_time: string
          id: number
          name: string
          port: number
          start_date: string
          start_time: string
          treeview_id: number | null
          treeview2_id: number
        }
        Insert: {
          amount?: number
          board?: number
          description: string
          end_date?: string | null
          end_time?: string
          id?: number
          name?: string
          port?: number
          start_date: string
          start_time?: string
          treeview_id?: number | null
          treeview2_id?: number
        }
        Update: {
          amount?: number
          board?: number
          description?: string
          end_date?: string | null
          end_time?: string
          id?: number
          name?: string
          port?: number
          start_date?: string
          start_time?: string
          treeview_id?: number | null
          treeview2_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_production_board_port"
            columns: ["board", "port"]
            isOneToOne: false
            referencedRelation: "machine_monitoring_poorten"
            referencedColumns: ["board", "port"]
          },
          {
            foreignKeyName: "production_data_treeview_id_fkey"
            columns: ["treeview_id"]
            isOneToOne: false
            referencedRelation: "mold_names"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_data_treeview_id_fkey"
            columns: ["treeview_id"]
            isOneToOne: false
            referencedRelation: "treeview"
            referencedColumns: ["id"]
          },
        ]
      }
      tellerbasis: {
        Row: {
          abbreviation: string
          active: number
          description: string
          id: number
          max_value: number
          name: string
          option: number
        }
        Insert: {
          abbreviation: string
          active: number
          description?: string
          id?: number
          max_value: number
          name?: string
          option?: number
        }
        Update: {
          abbreviation?: string
          active?: number
          description?: string
          id?: number
          max_value?: number
          name?: string
          option?: number
        }
        Relationships: []
      }
      tellerstanden: {
        Row: {
          datum: number
          id: number
          tellerbasis_id: number
          totaal: number
          treeview_id: number
          waarde: number
        }
        Insert: {
          datum?: number
          id?: number
          tellerbasis_id?: number
          totaal?: number
          treeview_id?: number
          waarde?: number
        }
        Update: {
          datum?: number
          id?: number
          tellerbasis_id?: number
          totaal?: number
          treeview_id?: number
          waarde?: number
        }
        Relationships: []
      }
      treeview: {
        Row: {
          accepted: boolean
          access_type_id: number
          active: number
          address: string
          barcode: string
          budget_current: number
          budget_previous: number
          cabinet_number: number | null
          carrier_number: string | null
          city: string
          compartment: number | null
          corrective: boolean
          cost_center_id: number
          created_at: string | null
          created_by: string
          delivery_date: string | null
          deliveryaddress_name: string | null
          deliveryaddress_number: number | null
          depreciation: number
          depreciation_unit: number
          description: string
          description_id: number
          edit_active: number
          employee_id: number
          encoded: string
          external_access_policy: boolean
          id: number
          inactive_id: number
          included_in_budget: number
          included_in_budget_date: string | null
          inspection_agency_id: number
          inspection_required: number
          installation_date: number
          is_lent_out: number
          last_counted: string | null
          last_meter_reading: number
          last_scan_date: string | null
          last_service: number
          last_service_date: string | null
          last_service_id: number | null
          last_wash_date: string | null
          lendable: number
          lending_date: string | null
          lending_status: number
          lending_treeview_kind_id: number
          lending_warehouse_id: number
          license_plate: string
          location_id: number
          machine_monitoring_target_cycle_time: number
          machine_monitoring_timeout_sec: number
          main_process_id: number
          maintenance: number
          maintenance_company_id: number
          maintenance_template: boolean
          manufacturer_id: number
          meter_reading_recorded: boolean
          name: string
          new_id: number
          nlsfb2_id: number
          object: string
          object_template_id: number
          old_date: string | null
          owner_id: number
          parent: number
          person_id: number | null
          person2_id: number | null
          planned_receipt_date: string | null
          postal_code: string
          process_step_id: number
          processing_date: string | null
          purchase_value: number
          real_estate_amount: number
          real_estate_units_id: number
          record_card: string
          record_card_old: string | null
          record_cards_id: number | null
          relation_id: number
          relation2_id: number | null
          released: number
          report: number
          rie_number: number
          serial_number: string
          show_visual: boolean
          size: string | null
          supplier_id: number
          sweep_api: boolean
          tree_order: number
          treeview_kind_id: number
          treeview_type: string
          treeviewtype_id: number
          warranty_until: number
          work_order: boolean
          year_built: string
          yearly_depreciation: number
        }
        Insert: {
          accepted?: boolean
          access_type_id?: number
          active?: number
          address?: string
          barcode: string
          budget_current?: number
          budget_previous?: number
          cabinet_number?: number | null
          carrier_number?: string | null
          city?: string
          compartment?: number | null
          corrective?: boolean
          cost_center_id?: number
          created_at?: string | null
          created_by: string
          delivery_date?: string | null
          deliveryaddress_name?: string | null
          deliveryaddress_number?: number | null
          depreciation?: number
          depreciation_unit?: number
          description?: string
          description_id: number
          edit_active?: number
          employee_id: number
          encoded?: string
          external_access_policy?: boolean
          id?: number
          inactive_id: number
          included_in_budget: number
          included_in_budget_date?: string | null
          inspection_agency_id?: number
          inspection_required: number
          installation_date?: number
          is_lent_out: number
          last_counted?: string | null
          last_meter_reading: number
          last_scan_date?: string | null
          last_service: number
          last_service_date?: string | null
          last_service_id?: number | null
          last_wash_date?: string | null
          lendable: number
          lending_date?: string | null
          lending_status: number
          lending_treeview_kind_id: number
          lending_warehouse_id: number
          license_plate: string
          location_id?: number
          machine_monitoring_target_cycle_time?: number
          machine_monitoring_timeout_sec?: number
          main_process_id?: number
          maintenance?: number
          maintenance_company_id: number
          maintenance_template?: boolean
          manufacturer_id?: number
          meter_reading_recorded: boolean
          name?: string
          new_id?: number
          nlsfb2_id: number
          object?: string
          object_template_id: number
          old_date?: string | null
          owner_id: number
          parent?: number
          person_id?: number | null
          person2_id?: number | null
          planned_receipt_date?: string | null
          postal_code?: string
          process_step_id?: number
          processing_date?: string | null
          purchase_value?: number
          real_estate_amount: number
          real_estate_units_id: number
          record_card: string
          record_card_old?: string | null
          record_cards_id?: number | null
          relation_id: number
          relation2_id?: number | null
          released?: number
          report?: number
          rie_number?: number
          serial_number?: string
          show_visual?: boolean
          size?: string | null
          supplier_id?: number
          sweep_api?: boolean
          tree_order?: number
          treeview_kind_id?: number
          treeview_type?: string
          treeviewtype_id?: number
          warranty_until?: number
          work_order?: boolean
          year_built?: string
          yearly_depreciation?: number
        }
        Update: {
          accepted?: boolean
          access_type_id?: number
          active?: number
          address?: string
          barcode?: string
          budget_current?: number
          budget_previous?: number
          cabinet_number?: number | null
          carrier_number?: string | null
          city?: string
          compartment?: number | null
          corrective?: boolean
          cost_center_id?: number
          created_at?: string | null
          created_by?: string
          delivery_date?: string | null
          deliveryaddress_name?: string | null
          deliveryaddress_number?: number | null
          depreciation?: number
          depreciation_unit?: number
          description?: string
          description_id?: number
          edit_active?: number
          employee_id?: number
          encoded?: string
          external_access_policy?: boolean
          id?: number
          inactive_id?: number
          included_in_budget?: number
          included_in_budget_date?: string | null
          inspection_agency_id?: number
          inspection_required?: number
          installation_date?: number
          is_lent_out?: number
          last_counted?: string | null
          last_meter_reading?: number
          last_scan_date?: string | null
          last_service?: number
          last_service_date?: string | null
          last_service_id?: number | null
          last_wash_date?: string | null
          lendable?: number
          lending_date?: string | null
          lending_status?: number
          lending_treeview_kind_id?: number
          lending_warehouse_id?: number
          license_plate?: string
          location_id?: number
          machine_monitoring_target_cycle_time?: number
          machine_monitoring_timeout_sec?: number
          main_process_id?: number
          maintenance?: number
          maintenance_company_id?: number
          maintenance_template?: boolean
          manufacturer_id?: number
          meter_reading_recorded?: boolean
          name?: string
          new_id?: number
          nlsfb2_id?: number
          object?: string
          object_template_id?: number
          old_date?: string | null
          owner_id?: number
          parent?: number
          person_id?: number | null
          person2_id?: number | null
          planned_receipt_date?: string | null
          postal_code?: string
          process_step_id?: number
          processing_date?: string | null
          purchase_value?: number
          real_estate_amount?: number
          real_estate_units_id?: number
          record_card?: string
          record_card_old?: string | null
          record_cards_id?: number | null
          relation_id?: number
          relation2_id?: number | null
          released?: number
          report?: number
          rie_number?: number
          serial_number?: string
          show_visual?: boolean
          size?: string | null
          supplier_id?: number
          sweep_api?: boolean
          tree_order?: number
          treeview_kind_id?: number
          treeview_type?: string
          treeviewtype_id?: number
          warranty_until?: number
          work_order?: boolean
          year_built?: string
          yearly_depreciation?: number
        }
        Relationships: []
      }
    }
    Views: {
      mold_daily_summary: {
        Row: {
          mold_id: number | null
          mold_name: string | null
          operation_date: string | null
          total_products: number | null
        }
        Relationships: []
      }
      mold_names: {
        Row: {
          id: number | null
          name: string | null
        }
        Relationships: []
      }
      monitoring_data_visible_mat: {
        Row: {
          id: number | null
          poorten_name: string | null
          shot_time: number | null
          timestamp: string | null
        }
        Relationships: []
      }
      v_daily_shots: {
        Row: {
          board: number | null
          is_swapped: boolean | null
          machine_key: string | null
          mold_description: string | null
          mold_name: string | null
          port: number | null
          shot_count: number | null
          shot_date: string | null
          swap_color: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_monitoring_board_port"
            columns: ["board", "port"]
            isOneToOne: false
            referencedRelation: "machine_monitoring_poorten"
            referencedColumns: ["board", "port"]
          },
        ]
      }
      v_hour_shots: {
        Row: {
          board: number | null
          is_swapped: boolean | null
          machine_key: string | null
          mold_description: string | null
          mold_name: string | null
          port: number | null
          shot_count: number | null
          shot_hour: string | null
          swap_color: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_monitoring_board_port"
            columns: ["board", "port"]
            isOneToOne: false
            referencedRelation: "machine_monitoring_poorten"
            referencedColumns: ["board", "port"]
          },
        ]
      }
      v_machine_monitoring: {
        Row: {
          board: number | null
          machine_id: number | null
          machine_key: string | null
          machine_name: string | null
          port: number | null
          shot_count: number | null
          shot_date: string | null
          visible: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_monitoring_board_port"
            columns: ["board", "port"]
            isOneToOne: false
            referencedRelation: "machine_monitoring_poorten"
            referencedColumns: ["board", "port"]
          },
        ]
      }
      v_machine_monitoring_hour: {
        Row: {
          board: number | null
          machine_id: number | null
          machine_key: string | null
          machine_name: string | null
          port: number | null
          shot_count: number | null
          shot_hour: string | null
          visible: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_monitoring_board_port"
            columns: ["board", "port"]
            isOneToOne: false
            referencedRelation: "machine_monitoring_poorten"
            referencedColumns: ["board", "port"]
          },
        ]
      }
      v_machine_monitoring_minute: {
        Row: {
          board: number | null
          machine_id: number | null
          machine_key: string | null
          machine_name: string | null
          port: number | null
          shot_count: number | null
          shot_minute: string | null
          visible: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_monitoring_board_port"
            columns: ["board", "port"]
            isOneToOne: false
            referencedRelation: "machine_monitoring_poorten"
            referencedColumns: ["board", "port"]
          },
        ]
      }
      v_minute_shots: {
        Row: {
          board: number | null
          is_swapped: boolean | null
          machine_key: string | null
          mold_description: string | null
          mold_name: string | null
          port: number | null
          shot_count: number | null
          shot_minute: string | null
          swap_color: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_monitoring_board_port"
            columns: ["board", "port"]
            isOneToOne: false
            referencedRelation: "machine_monitoring_poorten"
            referencedColumns: ["board", "port"]
          },
        ]
      }
    }
    Functions: {
      get_sampled_monitoring_data: {
        Args: {
          end_date: string
          interval_minutes?: number
          start_date: string
        }
        Returns: {
          poorten_name: string
          shot_time: number
          timestamp: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const