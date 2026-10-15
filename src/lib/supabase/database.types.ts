
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "assemblies": {
                  Row: {
                    "created_at": string,"district_id": string,"id": string,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"district_id": string,"id"?: string,"name": string
                  }
                  Update: {
                    "created_at"?: string,"district_id"?: string,"id"?: string,"name"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "assemblies_district_id_fkey"
      columns: ["district_id"]
isOneToOne: false
      referencedRelation: "districts"
      referencedColumns: ["id"]
    }
                  ]
                },"booths": {
                  Row: {
                    "assembly_id": string,"created_at": string,"id": string,"name": string,"number": string,"updated_at": string,"voters": number
                  }
                  ComputedFields: never
                  Insert: {
                    "assembly_id": string,"created_at"?: string,"id"?: string,"name": string,"number": string,"updated_at"?: string,"voters": number
                  }
                  Update: {
                    "assembly_id"?: string,"created_at"?: string,"id"?: string,"name"?: string,"number"?: string,"updated_at"?: string,"voters"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "booths_assembly_id_fkey"
      columns: ["assembly_id"]
isOneToOne: false
      referencedRelation: "assemblies"
      referencedColumns: ["id"]
    }
                  ]
                },"castes": {
                  Row: {
                    "id": number,"name": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: never,"name": string,"sort_order": number
                  }
                  Update: {
                    "id"?: never,"name"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    
                  ]
                },"districts": {
                  Row: {
                    "created_at": string,"id": string,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"survey_caste_counts": {
                  Row: {
                    "caste": string,"count": number,"submission_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "caste": string,"count": number,"submission_id": string
                  }
                  Update: {
                    "caste"?: string,"count"?: number,"submission_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "survey_caste_counts_submission_id_fkey"
      columns: ["submission_id"]
isOneToOne: false
      referencedRelation: "survey_submissions"
      referencedColumns: ["id"]
    }
                  ]
                },"survey_submissions": {
                  Row: {
                    "booth_id": string,"comment": string | null,"device_id": string | null,"id": string,"revision": number,"submitted_at": string,"submitter_name": string | null,"submitter_phone": string | null,"total_voters": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "booth_id": string,"comment"?: string | null,"device_id"?: string | null,"id"?: string,"revision"?: number,"submitted_at"?: string,"submitter_name"?: string | null,"submitter_phone"?: string | null,"total_voters": number,"updated_at"?: string
                  }
                  Update: {
                    "booth_id"?: string,"comment"?: string | null,"device_id"?: string | null,"id"?: string,"revision"?: number,"submitted_at"?: string,"submitter_name"?: string | null,"submitter_phone"?: string | null,"total_voters"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "survey_submissions_booth_id_fkey"
      columns: ["booth_id"]
isOneToOne: true
      referencedRelation: "booths"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "admin_overview":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"export_assemblies":
{ Args: { "p_assembly_id"?: string,"p_district_id"?: string }; Returns: {
              "assembly_id": string,"assembly_name": string,"district_name": string,"submissions": number
            }[]
                           },
"import_booths":
{ Args: { "p_rows": Json }; Returns: Json
                           },
"submit_survey":
{ Args: { "p_booth_id": string,"p_comment": string,"p_counts": Json,"p_device_id": string,"p_total_voters": number }; Returns: string
                           } |
{ Args: { "p_booth_id": string,"p_comment": string,"p_counts": Json,"p_device_id": string,"p_submitter_name": string,"p_submitter_phone": string,"p_total_voters": number }; Returns: string
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
