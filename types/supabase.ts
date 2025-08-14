// Supabaseのテーブル構造に基づいた型定義

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  lead_type: 'purchase' | 'sell' | 'reform';
  status: 'new' | 'in_progress' | 'won' | 'lost';
  source: string;
  budget_min?: number;
  budget_max?: number;
  preferred_area: string;
  property_type: string;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  notes: string;
  assigned_staff: string;
  next_action: string;
  next_action_date: string;
  fp_info?: {
    fp_assigned?: string;
    fp_company?: string;
    fp_contact_date?: string;
    monthly_income?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  description?: string;
  image_url?: string;
  featured: boolean;
  status: 'available' | 'contracted' | 'sold';
  created_at: string;
  updated_at: string;
}

export interface ReformProject {
  id: string;
  title: string;
  before_image_url: string;
  after_image_url: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PartTimeEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartTimeAttendance {
  id: string;
  employee_id: string;
  date: string;
  clock_in_time: string;
  clock_out_time?: string;
  total_hours?: number;
  notes?: string;
  clock_in_location?: string;
  clock_out_location?: string;
  clock_in_address?: string;
  clock_out_address?: string;
  created_at: string;
  updated_at: string;
}

export interface ShiftRequest {
  id: string;
  employee_id: string;
  request_type: 'shift_request' | 'availability' | 'time_off';
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InternalApplication {
  id: string;
  employee_name: string;
  application_type: 'paid_leave' | 'sick_leave' | 'expense' | 'other';
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  start_date?: string;
  end_date?: string;
  days?: number;
  reason?: string;
  symptoms?: string;
  doctor_note_file?: string;
  expense_date?: string;
  amount?: string;
  category?: string;
  receipt_file?: string;
  payment_method?: string;
  urgency?: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface ListingAgreement {
  id: string;
  lead_id: string;
  contract_type: '専属専任' | '専任' | '一般';
  signed_at: string;
  property_id?: string;
  reins_required_by: string;
  reins_registered_at?: string;
  report_interval_days: number;
  next_report_date: string;
  status: 'active' | 'suspended' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface CustomerChecklist {
  id: string;
  lead_id: string;
  type: 'seller' | 'buyer' | 'reform';
  items: ChecklistItem[];
  progress_percentage: number;
  total_items: number;
  completed_items: number;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  item_key: string;
  label: string;
  checked: boolean;
  required: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface SalaryCalculation {
  id: string;
  employee_id: string;
  year: number;
  month: number;
  total_regular_hours: number;
  total_overtime_hours: number;
  total_holiday_hours: number;
  regular_pay: number;
  overtime_pay: number;
  holiday_pay: number;
  total_pay: number;
  created_at: string;
  updated_at: string;
}

export interface SalarySetting {
  id: string;
  employee_id: string;
  hourly_rate: number;
  overtime_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 共通の型定義
export type LeadType = 'purchase' | 'sell' | 'reform';
export type LeadStatus = 'new' | 'in_progress' | 'won' | 'lost';
export type ContractType = '専属専任' | '専任' | '一般';
export type ChecklistType = 'seller' | 'buyer' | 'reform';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type AttendanceType = 'clock_in' | 'clock_out';
export type UrgencyLevel = 'low' | 'normal' | 'high' | 'urgent';
