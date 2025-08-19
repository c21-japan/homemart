import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './supabase-config';

// サーバーサイド用のSupabaseクライアント
export const supabaseServer = createClient(
  supabaseConfig.url,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseConfig.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// 顧客関連のデータベース操作
export const customerService = {
  // 顧客一覧取得
  async getCustomers(filters?: {
    category?: 'seller' | 'buyer' | 'reform';
    property_type?: 'mansion' | 'land' | 'house';
    assignee_user_id?: string;
    source?: string;
    query?: string;
  }) {
    let query = supabaseServer
      .from('customers')
      .select(`
        *,
        properties(*),
        seller_details(*),
        buyer_details(*),
        reform_projects(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.property_type) {
      query = query.eq('property_type', filters.property_type);
    }
    if (filters?.assignee_user_id) {
      query = query.eq('assignee_user_id', filters.assignee_user_id);
    }
    if (filters?.source) {
      query = query.eq('source', filters.source);
    }
    if (filters?.query) {
      query = query.or(`name.ilike.%${filters.query}%,name_kana.ilike.%${filters.query}%,phone.ilike.%${filters.query}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // 顧客詳細取得
  async getCustomer(id: string) {
    const { data, error } = await supabaseServer
      .from('customers')
      .select(`
        *,
        properties(*),
        seller_details(*),
        buyer_details(*),
        reform_projects(
          *,
          reform_costs(*)
        ),
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
  async createCustomer(customerData: any) {
    const { data, error } = await supabaseServer
      .from('customers')
      .insert(customerData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 顧客更新
  async updateCustomer(id: string, updateData: any) {
    const { data, error } = await supabaseServer
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 顧客削除
  async deleteCustomer(id: string) {
    const { error } = await supabaseServer
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// 物件関連のデータベース操作
export const propertyService = {
  // 物件作成
  async createProperty(propertyData: any) {
    const { data, error } = await supabaseServer
      .from('properties')
      .insert(propertyData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 物件更新
  async updateProperty(id: string, updateData: any) {
    const { data, error } = await supabaseServer
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// 売却詳細関連のデータベース操作
export const sellerDetailService = {
  // 売却詳細作成
  async createSellerDetail(sellerData: any) {
    const { data, error } = await supabaseServer
      .from('seller_details')
      .insert(sellerData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 売却詳細更新
  async updateSellerDetail(id: string, updateData: any) {
    const { data, error } = await supabaseServer
      .from('seller_details')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 媒介報告が必要な顧客を取得
  async getCustomersNeedingReport() {
    const { data, error } = await supabaseServer
      .from('seller_details')
      .select(`
        *,
        customers(*)
      `)
      .not('brokerage', 'eq', 'general')
      .not('last_reported_at', 'is', null);

    if (error) throw error;
    return data;
  },

  // 媒介期限が14日以内の顧客を取得
  async getCustomersExpiringSoon() {
    const { data, error } = await supabaseServer
      .from('seller_details')
      .select(`
        *,
        customers(*)
      `)
      .not('brokerage_end', 'is', null)
      .gte('brokerage_end', new Date().toISOString().split('T')[0])
      .lte('brokerage_end', new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (error) throw error;
    return data;
  }
};

// 購入詳細関連のデータベース操作
export const buyerDetailService = {
  // 購入詳細作成
  async createBuyerDetail(buyerData: any) {
    const { data, error } = await supabaseServer
      .from('buyer_details')
      .insert(buyerData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 購入詳細更新
  async updateBuyerDetail(id: string, updateData: any) {
    const { data, error } = await supabaseServer
      .from('buyer_details')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// リフォーム案件関連のデータベース操作
export const reformProjectService = {
  // リフォーム案件作成
  async createReformProject(projectData: any) {
    const { data, error } = await supabaseServer
      .from('reform_projects')
      .insert(projectData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // リフォーム案件更新
  async updateReformProject(id: string, updateData: any) {
    const { data, error } = await supabaseServer
      .from('reform_projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // リフォーム原価更新
  async updateReformCosts(projectId: string, costData: any) {
    const { data, error } = await supabaseServer
      .from('reform_costs')
      .upsert({
        project_id: projectId,
        ...costData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// チェックリスト関連のデータベース操作
export const checklistService = {
  // チェックリスト作成
  async createChecklist(checklistData: any) {
    const { data, error } = await supabaseServer
      .from('checklists')
      .insert(checklistData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // チェックリスト項目作成
  async createChecklistItems(checklistId: string, items: string[]) {
    const itemsData = items.map(label => ({
      checklist_id: checklistId,
      label
    }));

    const { data, error } = await supabaseServer
      .from('checklist_items')
      .insert(itemsData)
      .select();

    if (error) throw error;
    return data;
  },

  // 期日超過のチェックリストを取得
  async getOverdueChecklists() {
    const { data, error } = await supabaseServer
      .from('checklists')
      .select(`
        *,
        customers(*)
      `)
      .lt('due_date', new Date().toISOString().split('T')[0])
      .eq('is_completed', false);

    if (error) throw error;
    return data;
  }
};

// 通知関連のデータベース操作
export const reminderService = {
  // 通知作成
  async createReminder(reminderData: any) {
    const { data, error } = await supabaseServer
      .from('reminders')
      .insert(reminderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 送信予定の通知を取得
  async getScheduledReminders() {
    const { data, error } = await supabaseServer
      .from('reminders')
      .select(`
        *,
        customers(*)
      `)
      .lte('scheduled_at', new Date().toISOString())
      .is('sent_at', null)
      .order('scheduled_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // 通知を送信済みにマーク
  async markReminderAsSent(id: string) {
    const { data, error } = await supabaseServer
      .from('reminders')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// 書類関連のデータベース操作
export const documentService = {
  // 書類作成
  async createDocument(documentData: any) {
    const { data, error } = await supabaseServer
      .from('documents')
      .insert(documentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 顧客の書類一覧取得
  async getCustomerDocuments(customerId: string) {
    const { data, error } = await supabaseServer
      .from('documents')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// 統計情報取得
export const statsService = {
  // 今月の統計を取得
  async getMonthlyStats() {
    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // 媒介取得数
    const { data: brokerageCount, error: brokerageError } = await supabaseServer
      .from('seller_details')
      .select('id', { count: 'exact' })
      .gte('brokerage_start', monthStart.toISOString().split('T')[0])
      .lte('brokerage_start', monthEnd.toISOString().split('T')[0]);

    if (brokerageError) throw brokerageError;

    // 報告達成率
    const { data: reportData, error: reportError } = await supabaseServer
      .from('seller_details')
      .select('id, last_reported_at, brokerage')
      .not('brokerage', 'eq', 'general')
      .gte('brokerage_start', monthStart.toISOString().split('T')[0])
      .lte('brokerage_start', monthEnd.toISOString().split('T')[0]);

    if (reportError) throw reportError;

    // 期日超過件数
    const { data: overdueCount, error: overdueError } = await supabaseServer
      .from('checklists')
      .select('id', { count: 'exact' })
      .lt('due_date', new Date().toISOString().split('T')[0])
      .eq('is_completed', false);

    if (overdueError) throw overdueError;

    // リフォーム見込み粗利合計
    const { data: reformData, error: reformError } = await supabaseServer
      .from('reform_projects')
      .select(`
        expected_revenue,
        reform_costs(material_cost, outsourcing_cost, travel_cost, other_cost)
      `)
      .eq('status', 'estimating');

    if (reformError) throw reformError;

    let totalExpectedProfit = 0;
    if (reformData) {
      reformData.forEach(project => {
        const totalCost = project.reform_costs?.[0] 
          ? (project.reform_costs[0].material_cost || 0) +
            (project.reform_costs[0].outsourcing_cost || 0) +
            (project.reform_costs[0].travel_cost || 0) +
            (project.reform_costs[0].other_cost || 0)
          : 0;
        totalExpectedProfit += (project.expected_revenue || 0) - totalCost;
      });
    }

    return {
      brokerageCount: brokerageCount?.length || 0,
      reportAchievementRate: this.calculateReportAchievementRate(reportData),
      overdueCount: overdueCount?.length || 0,
      totalExpectedProfit
    };
  },

  // 報告達成率を計算
  calculateReportAchievementRate(reportData: any[]): number {
    if (!reportData || reportData.length === 0) return 0;

    const currentDate = new Date();
    let achievedCount = 0;
    let totalRequired = 0;

    reportData.forEach(item => {
      if (item.brokerage === 'exclusive_right') {
        // 専属専任：週1回
        totalRequired += Math.ceil((currentDate.getTime() - new Date(item.brokerage_start).getTime()) / (7 * 24 * 60 * 60 * 1000));
      } else if (item.brokerage === 'exclusive') {
        // 専任：2週に1回
        totalRequired += Math.ceil((currentDate.getTime() - new Date(item.brokerage_start).getTime()) / (14 * 24 * 60 * 60 * 1000));
      }

      if (item.last_reported_at) {
        achievedCount++;
      }
    });

    return totalRequired > 0 ? Math.round((achievedCount / totalRequired) * 100) : 0;
  }
};
