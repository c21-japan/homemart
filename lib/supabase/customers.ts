// 顧客管理用のSupabase直接接続ライブラリ
// 勤怠管理と同じパターンで実装
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const customersAPI = {
  // 全顧客取得
  async getAllCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        properties(*),
        seller_details(*),
        buyer_details(*),
        reform_projects(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 顧客詳細取得
  async getCustomer(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        properties(*),
        seller_details(*),
        buyer_details(*),
        reform_projects(*),
        reform_costs(*),
        checklists(
          *,
          checklist_items(*)
        ),
        documents(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // 顧客作成
  async createCustomer(customer: any) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 顧客更新
  async updateCustomer(id: string, updates: any) {
    const { data, error } = await supabase
      .from('customers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 顧客削除
  async deleteCustomer(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // 顧客検索
  async searchCustomers(query: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${query}%,name_kana.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // カテゴリ別顧客取得
  async getCustomersByCategory(category: 'seller' | 'buyer' | 'reform') {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        properties(*),
        seller_details(*),
        buyer_details(*),
        reform_projects(*)
      `)
      .eq('category', category)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
