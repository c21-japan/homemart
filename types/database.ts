export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          name: string
          price: number
          property_type: string
          prefecture: string
          city: string
          staff_comment?: string
          image_url?: string
          status: string
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          property_type: string
          prefecture: string
          city: string
          staff_comment?: string
          image_url?: string
          status?: string
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          property_type?: string
          prefecture?: string
          city?: string
          staff_comment?: string
          image_url?: string
          status?: string
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      inquiries: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          property_type: string
          message: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          property_type: string
          message: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          property_type?: string
          message?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
