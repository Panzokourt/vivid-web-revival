export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          meta: Json
          model_slug: string | null
          path: string | null
          session_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          meta?: Json
          model_slug?: string | null
          path?: string | null
          session_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          meta?: Json
          model_slug?: string | null
          path?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      configurator_presets: {
        Row: {
          canopy_color: string
          created_at: string
          description: string | null
          description_en: string | null
          engine_hp: number
          equipment: Json
          featured: boolean
          hull_color: string
          id: string
          model_slug: string
          name: string
          name_en: string | null
          published: boolean
          slug: string
          sort_order: number
          tagline: string | null
          tube_color: string
          updated_at: string
        }
        Insert: {
          canopy_color: string
          created_at?: string
          description?: string | null
          description_en?: string | null
          engine_hp: number
          equipment?: Json
          featured?: boolean
          hull_color: string
          id?: string
          model_slug: string
          name: string
          name_en?: string | null
          published?: boolean
          slug: string
          sort_order?: number
          tagline?: string | null
          tube_color: string
          updated_at?: string
        }
        Update: {
          canopy_color?: string
          created_at?: string
          description?: string | null
          description_en?: string | null
          engine_hp?: number
          equipment?: Json
          featured?: boolean
          hull_color?: string
          id?: string
          model_slug?: string
          name?: string
          name_en?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
          tagline?: string | null
          tube_color?: string
          updated_at?: string
        }
        Relationships: []
      }
      dealers: {
        Row: {
          active: boolean
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          order_index: number
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          active?: boolean
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          order_index?: number
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          active?: boolean
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          order_index?: number
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      model_gallery: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          model_id: string
          order_index: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          model_id: string
          order_index?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          model_id?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "model_gallery_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      model_series: {
        Row: {
          created_at: string
          description: string | null
          description_en: string | null
          hero_image: string | null
          hull_material: string
          id: string
          name: string
          name_en: string | null
          published: boolean
          slug: string
          sort_order: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          hero_image?: string | null
          hull_material: string
          id?: string
          name: string
          name_en?: string | null
          published?: boolean
          slug: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          hero_image?: string | null
          hull_material?: string
          id?: string
          name?: string
          name_en?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      models: {
        Row: {
          beam_m: number | null
          code: string
          created_at: string
          description: string | null
          description_en: string | null
          fuel_l: number | null
          hero_image: string | null
          hull_material: string | null
          hull_type: string | null
          id: string
          length_m: number | null
          max_hp: number | null
          name: string
          name_en: string | null
          number: string
          order_index: number
          overview_en: string | null
          pax: number | null
          series_slug: string | null
          slug: string
          tag: string | null
          tagline: string | null
          tagline_en: string | null
          tube_material: string | null
          weight_kg: number | null
        }
        Insert: {
          beam_m?: number | null
          code: string
          created_at?: string
          description?: string | null
          description_en?: string | null
          fuel_l?: number | null
          hero_image?: string | null
          hull_material?: string | null
          hull_type?: string | null
          id?: string
          length_m?: number | null
          max_hp?: number | null
          name: string
          name_en?: string | null
          number: string
          order_index?: number
          overview_en?: string | null
          pax?: number | null
          series_slug?: string | null
          slug: string
          tag?: string | null
          tagline?: string | null
          tagline_en?: string | null
          tube_material?: string | null
          weight_kg?: number | null
        }
        Update: {
          beam_m?: number | null
          code?: string
          created_at?: string
          description?: string | null
          description_en?: string | null
          fuel_l?: number | null
          hero_image?: string | null
          hull_material?: string | null
          hull_type?: string | null
          id?: string
          length_m?: number | null
          max_hp?: number | null
          name?: string
          name_en?: string | null
          number?: string
          order_index?: number
          overview_en?: string | null
          pax?: number | null
          series_slug?: string | null
          slug?: string
          tag?: string | null
          tagline?: string | null
          tagline_en?: string | null
          tube_material?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "models_series_slug_fkey"
            columns: ["series_slug"]
            isOneToOne: false
            referencedRelation: "model_series"
            referencedColumns: ["slug"]
          },
        ]
      }
      page_block_versions: {
        Row: {
          block_id: string
          block_key: string
          content: Json
          created_at: string
          created_by: string | null
          id: string
          locale: string
          page_slug: string
          published: boolean
          version: number
        }
        Insert: {
          block_id: string
          block_key: string
          content: Json
          created_at?: string
          created_by?: string | null
          id?: string
          locale?: string
          page_slug: string
          published: boolean
          version: number
        }
        Update: {
          block_id?: string
          block_key?: string
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          locale?: string
          page_slug?: string
          published?: boolean
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "page_block_versions_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "page_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      page_blocks: {
        Row: {
          block_key: string
          content: Json
          id: string
          locale: string
          page_slug: string
          published: boolean
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          block_key: string
          content?: Json
          id?: string
          locale?: string
          page_slug: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          block_key?: string
          content?: Json
          id?: string
          locale?: string
          page_slug?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          assigned_to: string | null
          canopy_color: string
          country: string | null
          created_at: string
          email: string
          engine_brand: string | null
          engine_hp: number
          equipment: Json
          finance_down_payment: number | null
          finance_months: number | null
          full_name: string
          hull_color: string
          id: string
          message: string | null
          model_slug: string
          notes: string | null
          phone: string | null
          price_breakdown: Json | null
          status: string
          total_price_eur: number | null
          trailer_id: string | null
          tube_color: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          canopy_color: string
          country?: string | null
          created_at?: string
          email: string
          engine_brand?: string | null
          engine_hp: number
          equipment?: Json
          finance_down_payment?: number | null
          finance_months?: number | null
          full_name: string
          hull_color: string
          id?: string
          message?: string | null
          model_slug: string
          notes?: string | null
          phone?: string | null
          price_breakdown?: Json | null
          status?: string
          total_price_eur?: number | null
          trailer_id?: string | null
          tube_color: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          canopy_color?: string
          country?: string | null
          created_at?: string
          email?: string
          engine_brand?: string | null
          engine_hp?: number
          equipment?: Json
          finance_down_payment?: number | null
          finance_months?: number | null
          full_name?: string
          hull_color?: string
          id?: string
          message?: string | null
          model_slug?: string
          notes?: string | null
          phone?: string | null
          price_breakdown?: Json | null
          status?: string
          total_price_eur?: number | null
          trailer_id?: string | null
          tube_color?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_boats: {
        Row: {
          available_from: string | null
          condition: string
          created_at: string
          description: string | null
          description_en: string | null
          engine: string | null
          gallery: Json
          hero_image: string | null
          highlights: Json
          hours: number | null
          id: string
          length_m: number | null
          location: string | null
          model_id: string | null
          model_name: string
          price_eur: number | null
          price_note: string | null
          series_slug: string | null
          slug: string
          sort_order: number
          status: string
          test_drive_available: boolean
          title_en: string | null
          updated_at: string
          year: number | null
        }
        Insert: {
          available_from?: string | null
          condition: string
          created_at?: string
          description?: string | null
          description_en?: string | null
          engine?: string | null
          gallery?: Json
          hero_image?: string | null
          highlights?: Json
          hours?: number | null
          id?: string
          length_m?: number | null
          location?: string | null
          model_id?: string | null
          model_name: string
          price_eur?: number | null
          price_note?: string | null
          series_slug?: string | null
          slug: string
          sort_order?: number
          status?: string
          test_drive_available?: boolean
          title_en?: string | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          available_from?: string | null
          condition?: string
          created_at?: string
          description?: string | null
          description_en?: string | null
          engine?: string | null
          gallery?: Json
          hero_image?: string | null
          highlights?: Json
          hours?: number | null
          id?: string
          length_m?: number | null
          location?: string | null
          model_id?: string | null
          model_name?: string
          price_eur?: number | null
          price_note?: string | null
          series_slug?: string | null
          slug?: string
          sort_order?: number
          status?: string
          test_drive_available?: boolean
          title_en?: string | null
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_boats_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      dealers_public: {
        Row: {
          active: boolean | null
          city: string | null
          country: string | null
          created_at: string | null
          id: string | null
          lat: number | null
          lng: number | null
          name: string | null
          order_index: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          active?: boolean | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          order_index?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          active?: boolean | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          order_index?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "editor"
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
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "editor"],
    },
  },
} as const
