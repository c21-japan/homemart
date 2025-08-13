// 顧客情報管理の型定義

export type LeadType = 'purchase' | 'sell' | 'reform';

export type LeadStatus = 'new' | 'in_progress' | 'won' | 'lost';

export interface LeadBase {
  id?: string;
  type: LeadType;
  source?: string;
  last_name: string;
  first_name: string;
  last_name_kana?: string;
  first_name_kana?: string;
  email?: string;
  phone?: string;
  postal_code?: string;
  prefecture?: string;
  city?: string;
  address1?: string;
  address2?: string;
  residence_structure?: string;
  household?: string;
  note?: string;
  attachments?: string[];
  status?: LeadStatus;
  assigned_to?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface PurchaseLead extends LeadBase {
  type: 'purchase';
  extra: {
    budget?: number;
    desired_area?: string;
    layout?: string;
    move_in_timing?: string;
    loan_preapproved?: boolean;
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
  };
}

export interface SellLead extends LeadBase {
  type: 'sell';
  extra: {
    property_type?: string;
    building_name?: string;
    room_no?: string;
    land_size?: number;
    floor_area?: number;
    year_built?: string;
    remaining_loan?: number;
    expected_price?: number;
    psychological_defect?: boolean;
    parking_state?: string;
    hoa_fee?: number;
    reason?: string;
    current_status?: 'vacant' | 'occupied';
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
  };
}

export interface ReformLead extends LeadBase {
  type: 'reform';
  extra: {
    target_rooms?: string[];
    wish_items?: string[];
    rough_budget?: number;
    desired_deadline?: string;
    visit_request?: boolean;
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
  };
}

export type Lead = PurchaseLead | SellLead | ReformLead;

export interface LeadFormData {
  type: LeadType;
  source?: string;
  last_name: string;
  first_name: string;
  last_name_kana?: string;
  first_name_kana?: string;
  email?: string;
  phone?: string;
  postal_code?: string;
  prefecture?: string;
  city?: string;
  address1?: string;
  address2?: string;
  residence_structure?: string;
  household?: string;
  note?: string;
  attachments?: File[];
  extra: Record<string, any>;
}

export interface LeadFilter {
  type?: LeadType;
  status?: LeadStatus;
  assigned_to?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface LeadStats {
  total: number;
  new: number;
  in_progress: number;
  won: number;
  lost: number;
  by_type: Record<LeadType, number>;
}
