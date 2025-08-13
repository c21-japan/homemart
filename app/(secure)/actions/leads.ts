'use server';

import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { leadFormSchema, LeadFormData, Lead, LeadFilter, LeadStats } from '@/types/schemas';
import { revalidatePath } from 'next/cache';

// Supabaseクライアントの初期化
async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(cookieStore);
}

// 顧客情報の作成
export async function createLead(formData: LeadFormData): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // バリデーション
    const validatedData = leadFormSchema.parse(formData);
    
    const supabase = await getSupabaseClient();
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: '認証が必要です' };
    }

    // 画像のアップロード処理
    let attachmentPaths: string[] = [];
    if (formData.attachments && formData.attachments.length > 0) {
      attachmentPaths = await uploadAttachments(formData.attachments, user.id);
    }

    // 位置情報の取得（クライアント側で取得済みの場合）
    let locationData = null;
    if (formData.extra?.location) {
      locationData = formData.extra.location;
    }

    // データベースに保存
    const { data, error } = await supabase
      .from('customer_leads')
      .insert({
        type: validatedData.type,
        source: validatedData.source,
        last_name: validatedData.last_name,
        first_name: validatedData.first_name,
        last_name_kana: validatedData.last_name_kana,
        first_name_kana: validatedData.first_name_kana,
        email: validatedData.email || null,
        phone: validatedData.phone,
        postal_code: validatedData.postal_code,
        prefecture: validatedData.prefecture,
        city: validatedData.city,
        address1: validatedData.address1,
        address2: validatedData.address2,
        residence_structure: validatedData.residence_structure,
        household: validatedData.household,
        note: validatedData.note,
        extra: { ...validatedData.extra, location: locationData },
        attachments: attachmentPaths,
        created_by: user.id,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      console.error('Lead creation error:', error);
      return { success: false, error: 'データの保存に失敗しました' };
    }

    // 社内通知メールの送信
    await sendNotificationEmail(data);

    // キャッシュの再検証
    revalidatePath('/admin/leads');
    revalidatePath('/admin');

    return { success: true, id: data.id };
  } catch (error) {
    console.error('Create lead error:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: '不明なエラーが発生しました' };
  }
}

// 顧客情報の更新
export async function updateLead(id: string, updates: Partial<Lead>): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseClient();
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: '認証が必要です' };
    }

    // 権限チェック
    const { data: existingLead } = await supabase
      .from('customer_leads')
      .select('created_by, assigned_to')
      .eq('id', id)
      .single();

    if (!existingLead) {
      return { success: false, error: '指定された顧客情報が見つかりません' };
    }

    // 管理者または作成者/担当者のみ更新可能
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser?.user_metadata?.role !== 'admin' && 
        existingLead.created_by !== currentUser?.id && 
        existingLead.assigned_to !== currentUser?.id) {
      return { success: false, error: '更新権限がありません' };
    }

    const { error } = await supabase
      .from('customer_leads')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Lead update error:', error);
      return { success: false, error: '更新に失敗しました' };
    }

    revalidatePath('/admin/leads');
    revalidatePath(`/admin/leads/${id}`);

    return { success: true };
  } catch (error) {
    console.error('Update lead error:', error);
    return { success: false, error: '更新に失敗しました' };
  }
}

// 顧客情報の取得（単体）
export async function getLead(id: string): Promise<{ success: boolean; data?: Lead; error?: string }> {
  try {
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('customer_leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get lead error:', error);
      return { success: false, error: 'データの取得に失敗しました' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Get lead error:', error);
    return { success: false, error: 'データの取得に失敗しました' };
  }
}

// 顧客情報一覧の取得
export async function listLeads(filter: LeadFilter = {}): Promise<{ success: boolean; data?: Lead[]; error?: string }> {
  try {
    const supabase = await getSupabaseClient();
    
    let query = supabase
      .from('customer_leads')
      .select('*')
      .order('created_at', { ascending: false });

    // フィルターの適用
    if (filter.type) {
      query = query.eq('type', filter.type);
    }
    if (filter.status) {
      query = query.eq('status', filter.status);
    }
    if (filter.assigned_to) {
      query = query.eq('assigned_to', filter.assigned_to);
    }
    if (filter.search) {
      query = query.or(`last_name.ilike.%${filter.search}%,first_name.ilike.%${filter.search}%,building_name.ilike.%${filter.search}%,phone.ilike.%${filter.search}%`);
    }
    if (filter.start_date) {
      query = query.gte('created_at', filter.start_date);
    }
    if (filter.end_date) {
      query = query.lte('created_at', filter.end_date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('List leads error:', error);
      return { success: false, error: 'データの取得に失敗しました' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('List leads error:', error);
    return { success: false, error: 'データの取得に失敗しました' };
  }
}

// 統計情報の取得
export async function getLeadStats(): Promise<{ success: boolean; data?: LeadStats; error?: string }> {
  try {
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('customer_leads')
      .select('type, status');

    if (error) {
      console.error('Get lead stats error:', error);
      return { success: false, error: '統計情報の取得に失敗しました' };
    }

    const stats: LeadStats = {
      total: data.length,
      new: data.filter(lead => lead.status === 'new').length,
      in_progress: data.filter(lead => lead.status === 'in_progress').length,
      won: data.filter(lead => lead.status === 'won').length,
      lost: data.filter(lead => lead.status === 'lost').length,
      by_type: {
        purchase: data.filter(lead => lead.type === 'purchase').length,
        sell: data.filter(lead => lead.type === 'sell').length,
        reform: data.filter(lead => lead.type === 'reform').length,
      }
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Get lead stats error:', error);
    return { success: false, error: '統計情報の取得に失敗しました' };
  }
}

// 画像のアップロード処理
async function uploadAttachments(files: File[], userId: string): Promise<string[]> {
  const supabase = await getSupabaseClient();
  const paths: string[] = [];

  for (const file of files) {
    try {
      const fileName = `${userId}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('lead-attachments')
        .upload(fileName, file);

      if (error) {
        console.error('File upload error:', error);
        continue;
      }

      if (data) {
        paths.push(data.path);
      }
    } catch (error) {
      console.error('File upload error:', error);
    }
  }

  return paths;
}

// 社内通知メールの送信
async function sendNotificationEmail(lead: Lead): Promise<void> {
  try {
    const typeLabels = {
      purchase: '購入',
      sell: '売却',
      reform: 'リフォーム'
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'システム',
        email: 'system@homemart.com',
        phone: '0120-43-8639',
        message: `新規顧客情報が登録されました。

用途: ${typeLabels[lead.type]}
氏名: ${lead.last_name} ${lead.first_name}
電話: ${lead.phone}
メール: ${lead.email || '未入力'}
住所: ${lead.prefecture}${lead.city}${lead.address1}
備考: ${lead.note || 'なし'}

管理画面で詳細を確認してください:
${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/leads/${lead.id}`,
        propertyName: `新規顧客情報 - ${typeLabels[lead.type]}`
      }),
    });

    if (!response.ok) {
      console.error('Notification email failed:', response.status);
    }
  } catch (error) {
    console.error('Send notification email error:', error);
  }
}
