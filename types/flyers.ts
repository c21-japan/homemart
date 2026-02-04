export interface FlyerDesign {
  id: string;
  design_id: string;
  design_name: string;
  design_image_url?: string;
  designer_name?: string;
  designer_source?: 'crowdworks' | 'internal' | 'ai-generated' | 'other';
  appeal_point?: string;
  adopted_at?: string;
  start_date?: string;
  end_date?: string;
  total_distributed: number;
  total_inquiries: number;
  response_rate?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FlyerDistribution {
  id: string;
  distribution_date: string;
  design_id: string;
  area: string;
  start_point?: string;
  end_point?: string;
  undistributed_buildings?: string;
  communication_notes?: string;
  quantity: number;
  distributor_name?: string;
  print_date?: string;
  print_quantity?: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FlyerPrintJob {
  id: string;
  print_date: string;
  design_id: string;
  printer_name: string;
  range_start: number;
  range_end: number;
  printed_quantity: number;
  status: 'planned' | 'in_progress' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FlyerInquiry {
  id: string;
  inquiry_datetime: string;
  inquiry_channel: 'phone' | 'line' | 'web' | 'visit' | 'other';
  inquiry_type: string;
  design_id?: string;
  distribution_area?: string;
  lead_id?: string;
  conversion_possibility?: 'high' | 'medium' | 'low';
  handler_name?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FlyerAIAnalysis {
  id: string;
  analysis_week: string;
  week_start: string;
  week_end: string;
  total_distributed: number;
  total_inquiries: number;
  overall_response_rate?: number;
  top_performing_designs?: any;
  top_performing_areas?: any;
  recommendations?: string;
  next_week_schedule?: any;
  analysis_data?: any;
  created_at: string;
}

export interface WeeklySummary {
  week_start: string;
  distribution_count: number;
  total_distributed: number;
  unique_designs: number;
  unique_areas: number;
}

export interface DesignPerformance {
  design_id: string;
  design_name: string;
  total_distributed: number;
  total_inquiries: number;
  response_rate: number;
  areas_distributed: number;
  last_distribution_date: string;
}

export interface AreaPerformance {
  area: string;
  total_distributed: number;
  total_inquiries: number;
  response_rate: number;
  unique_designs_used: number;
}
