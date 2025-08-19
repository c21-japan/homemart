export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  notes?: Array<{
    content: string;
    created_at: string;
    created_by: string;
  }>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  budget?: number;
  timeline?: string;
  location?: string;
  company?: string;
}
