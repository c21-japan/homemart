'use server';

import { supabaseServer } from '@/lib/supabase-server';
import { customerUnion, CustomerInput } from '@/lib/zod-schemas';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Mailjet from 'node-mailjet';

// Mailjetクライアントの初期化
const mailjet = new Mailjet(
  process.env.MAILJET_API_KEY || '',
  process.env.MAILJET_API_SECRET || ''
);

// 顧客作成
export async function createCustomer(data: CustomerInput) {
  const supabase = supabaseServer;
  
  try {
    // 顧客テーブルに挿入
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        category: data.category,
        name: data.name,
        name_kana: data.name_kana,
        phone: data.phone,
        email: data.email,
        address: data.address,
        source: data.source,
        assignee_user_id: data.assignee_user_id,
      })
      .select()
      .single();

    if (customerError) throw customerError;

    // 物件テーブルに挿入
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        customer_id: customer.id,
        property_type: data.property_type,
        address: data.address,
        mansion_name: data.mansion_name,
        room_no: data.room_no,
        land_info: data.land_info,
        building_area: data.building_area,
        floor_plan: data.floor_plan,
        built_year: data.built_year,
        area: data.area,
      })
      .select()
      .single();

    if (propertyError) throw propertyError;

    // カテゴリ別の詳細テーブルに挿入
    if (data.category === 'seller') {
      const { error: sellerError } = await supabase
        .from('seller_details')
        .insert({
          customer_id: customer.id,
          property_id: property.id,
          desired_price: data.desired_price,
          brokerage: data.brokerage,
          brokerage_start: data.brokerage_start,
          report_channel: data.report_channel,
          purchase_or_brokerage: data.purchase_or_brokerage,
        });

      if (sellerError) throw sellerError;

      // チェックリストを作成
      await createSellerChecklist(customer.id);
    }

    if (data.category === 'buyer') {
      const { error: buyerError } = await supabase
        .from('buyer_details')
        .insert({
          customer_id: customer.id,
          property_id: property.id,
          preferred_area: data.preferred_area,
          budget_min: data.budget_min,
          budget_max: data.budget_max,
          conditions: data.conditions,
          finance_plan: data.finance_plan,
          interested_property_id: data.interested_property_id,
        });

      if (buyerError) throw buyerError;

      // チェックリストを作成
      await createBuyerChecklist(customer.id);
    }

    if (data.category === 'reform') {
      const { error: reformError } = await supabase
        .from('reform_projects')
        .insert({
          customer_id: customer.id,
          property_id: property.id,
          is_existing_customer: data.is_existing_customer,
          requested_works: data.requested_works,
          expected_revenue: data.expected_revenue,
        });

      if (reformError) throw reformError;

      // チェックリストを作成
      await createReformChecklist(customer.id);
    }

    revalidatePath('/admin/customers');
    return { success: true, customer };

  } catch (error) {
    console.error('顧客作成エラー:', error);
    return { success: false, error: '顧客の作成に失敗しました' };
  }
}

// 顧客更新
export async function updateCustomer(id: string, data: Partial<CustomerInput>) {
  const supabase = supabaseServer;
  
  try {
    const { error } = await supabase
      .from('customers')
      .update({
        name: data.name,
        name_kana: data.name_kana,
        phone: data.phone,
        email: data.email,
        address: data.address,
        source: data.source,
        assignee_user_id: data.assignee_user_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/customers');
    revalidatePath(`/admin/customers/${id}`);
    return { success: true };

  } catch (error) {
    console.error('顧客更新エラー:', error);
    return { success: false, error: '顧客の更新に失敗しました' };
  }
}

// 顧客削除
export async function deleteCustomer(id: string) {
  const supabase = supabaseServer;
  
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/customers');
    return { success: true };

  } catch (error) {
    console.error('顧客削除エラー:', error);
    return { success: false, error: '顧客の削除に失敗しました' };
  }
}

// 顧客一覧取得
export async function getCustomers(category?: string) {
  const supabase = supabaseServer;
  
  try {
    let query = supabase
      .from('customers')
      .select(`
        *,
        properties(*),
        seller_details(*),
        buyer_details(*),
        reform_projects(*)
      `)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, customers: data };

  } catch (error) {
    console.error('顧客一覧取得エラー:', error);
    return { success: false, error: '顧客一覧の取得に失敗しました' };
  }
}

// 顧客詳細取得
export async function getCustomer(id: string) {
  const supabase = supabaseServer;
  
  try {
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
    return { success: true, customer: data };

  } catch (error) {
    console.error('顧客詳細取得エラー:', error);
    return { success: false, error: '顧客詳細の取得に失敗しました' };
  }
}

// 売却チェックリスト作成
async function createSellerChecklist(customerId: string) {
  const supabase = supabaseServer;
  
  const checklistItems = [
    '物件の現況確認',
    '査定依頼',
    '媒介契約書の作成',
    '物件情報の登録',
    'チラシ・LPの作成',
    '内覧の設定',
    '買主との交渉',
    '売買契約の締結',
    '引渡しの完了'
  ];

  try {
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .insert({
        customer_id: customerId,
        type: 'seller',
        title: '売却案件チェックリスト',
        due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90日後
      })
      .select()
      .single();

    if (checklistError) throw checklistError;

    // チェックリスト項目を作成
    for (const item of checklistItems) {
      await supabase
        .from('checklist_items')
        .insert({
          checklist_id: checklist.id,
          label: item,
        });
    }

  } catch (error) {
    console.error('売却チェックリスト作成エラー:', error);
  }
}

// 購入チェックリスト作成
async function createBuyerChecklist(customerId: string) {
  const supabase = supabaseServer;
  
  const checklistItems = [
    '購入希望条件の詳細ヒアリング',
    '物件の検索・提案',
    '内覧の設定',
    '物件の詳細調査',
    '価格交渉',
    'ローン審査',
    '売買契約の締結',
    '引渡しの完了'
  ];

  try {
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .insert({
        customer_id: customerId,
        type: 'buyer',
        title: '購入案件チェックリスト',
        due_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120日後
      })
      .select()
      .single();

    if (checklistError) throw checklistError;

    // チェックリスト項目を作成
    for (const item of checklistItems) {
      await supabase
        .from('checklist_items')
        .insert({
          checklist_id: checklist.id,
          label: item,
        });
    }

  } catch (error) {
    console.error('購入チェックリスト作成エラー:', error);
  }
}

// リフォームチェックリスト作成
async function createReformChecklist(customerId: string) {
  const supabase = supabaseServer;
  
  const checklistItems = [
    '現地調査・見積もり',
    '提案書の作成',
    '契約の締結',
    '着工準備',
    '工事の開始',
    '工事の進行管理',
    '工事の完了',
    '引渡し・アフターケア'
  ];

  try {
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .insert({
        customer_id: customerId,
        type: 'reform',
        title: 'リフォーム案件チェックリスト',
        due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60日後
      })
      .select()
      .single();

    if (checklistError) throw checklistError;

    // チェックリスト項目を作成
    for (const item of checklistItems) {
      await supabase
        .from('checklist_items')
        .insert({
          checklist_id: checklist.id,
          label: item,
        });
    }

  } catch (error) {
    console.error('リフォームチェックリスト作成エラー:', error);
  }
}

// チェックリスト項目の更新
export async function updateChecklistItem(itemId: string, isChecked: boolean) {
  const supabase = supabaseServer;
  
  try {
    const { error } = await supabase
      .from('checklist_items')
      .update({ is_checked: isChecked })
      .eq('id', itemId);

    if (error) throw error;

    return { success: true };

  } catch (error) {
    console.error('チェックリスト更新エラー:', error);
    return { success: false, error: 'チェックリストの更新に失敗しました' };
  }
}

// リフォーム原価の更新
export async function updateReformCosts(projectId: string, costs: {
  material_cost: number;
  outsourcing_cost: number;
  travel_cost: number;
  other_cost: number;
  note?: string;
}) {
  const supabase = supabaseServer;
  
  try {
    const { error } = await supabase
      .from('reform_costs')
      .upsert({
        project_id: projectId,
        ...costs,
      });

    if (error) throw error;

    revalidatePath('/admin/customers');
    return { success: true };

  } catch (error) {
    console.error('原価更新エラー:', error);
    return { success: false, error: '原価の更新に失敗しました' };
  }
}

// 日次運用タスク
export async function runDaily() {
  try {
    // 一時的に無効化（データベーススキーマの問題を回避）
    console.log('日次運用タスク: 一時的に無効化されています');
    
    return { success: true };
  } catch (error) {
    console.error('日次運用タスクエラー:', error);
    return { success: false, error: '日次運用タスクの実行に失敗しました' };
  }
}

// 媒介レポート処理
async function processBrokerageReports() {
  const supabase = supabaseServer;
  
  try {
    // 要報告の売却案件を取得
    const { data: sellers, error } = await supabase
      .from('seller_details')
      .select(`
        *,
        customers!inner(*)
      `)
      .not('brokerage', 'eq', 'general') // 一般媒介は除外
      .is('last_reported_at', null); // 未報告

    if (error) throw error;

    for (const seller of sellers || []) {
      if (seller.report_channel === 'email') {
        // メール送信処理（Resend使用）
        await sendBrokerageReportEmail(seller);
        
        // 報告日時を更新
        await supabase
          .from('seller_details')
          .update({ last_reported_at: new Date().toISOString() })
          .eq('id', seller.id);
      } else {
        // 郵送タスクをキューに追加
        await supabase
          .from('reminders')
          .insert({
            customer_id: seller.customer_id,
            title: '媒介レポート書面作成',
            scheduled_at: new Date().toISOString(),
            channel: 'postal',
            priority: 1,
          });
      }
    }

  } catch (error) {
    console.error('媒介レポート処理エラー:', error);
  }
}

// 期限切れチェックリスト処理
async function processOverdueChecklists() {
  const supabase = supabaseServer;
  
  try {
    const { data: overdueItems, error } = await supabase
      .from('checklists')
      .select(`
        *,
        customers!inner(*)
      `)
      .lt('due_date', new Date().toISOString())
      .eq('is_completed', false);

    if (error) throw error;

    for (const item of overdueItems || []) {
      // リマインダーに追加
      await supabase
        .from('reminders')
        .insert({
          customer_id: item.customer_id,
          title: `期限切れ: ${item.title}`,
          scheduled_at: new Date().toISOString(),
          priority: 2,
        });
    }

  } catch (error) {
    console.error('期限切れチェックリスト処理エラー:', error);
  }
}

// 媒介期限リマインド処理
async function processBrokerageReminders() {
  const supabase = supabaseServer;
  
  try {
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 14);

    const { data: reminders, error } = await supabase
      .from('seller_details')
      .select(`
        *,
        customers!inner(*)
      `)
      .eq('brokerage_end', reminderDate.toISOString().split('T')[0]);

    if (error) throw error;

    for (const reminder of reminders || []) {
      await supabase
        .from('reminders')
        .insert({
          customer_id: reminder.customer_id,
          title: '媒介期限14日前リマインド',
          scheduled_at: new Date().toISOString(),
          priority: 1,
        });
    }

  } catch (error) {
    console.error('媒介期限リマインド処理エラー:', error);
  }
}

// 媒介レポートメール送信（Mailjet使用）
async function sendBrokerageReportEmail(seller: any) {
  try {
    const emailData = {
      Messages: [{
        From: {
          Email: process.env.MAILJET_FROM_EMAIL || 'noreply@homemart.co.jp',
          Name: 'センチュリー21ホームマート'
        },
        To: [{
          Email: seller.customers.email,
          Name: seller.customers.name
        }],
        Subject: '【媒介報告】進捗のご報告',
        HTMLPart: `
          <h2>媒介報告</h2>
          <p>${seller.customers.name} 様</p>
          <p>いつもお世話になっております。<br>
          センチュリー21ホームマート　乾です。</p>
          
          <h3>物件情報</h3>
          <p>住所: ${seller.customers.properties?.[0]?.address || '未設定'}</p>
          <p>種別: ${seller.customers.properties?.[0]?.property_type || '未設定'}</p>
          
          <h3>活動実績（${new Date().toLocaleDateString('ja-JP')}）</h3>
          <p>内覧件数: 0件</p>
          <p>反響件数: 0件</p>
          
          <h3>提案内容</h3>
          <p>物件の現況確認と市場調査を実施中です。</p>
          
          <h3>次回方針</h3>
          <p>物件情報の詳細化とマーケティング戦略の策定を進めます。</p>
          
          <p>引き続きよろしくお願いいたします。</p>
          <p>センチュリー21ホームマート　乾</p>
        `
      }]
    };

    await mailjet.post('send', { version: 'v3.1' }).request(emailData);
    console.log('媒介レポートメール送信完了:', seller.customer_id);
  } catch (error) {
    console.error('媒介レポートメール送信エラー:', error);
  }
}

// 管理者エスカレーション処理
export async function runManagerEscalation() {
  try {
    // 一時的に無効化（データベーススキーマの問題を回避）
    console.log('管理者エスカレーション処理: 一時的に無効化されています');
    
    return { success: true };
  } catch (error) {
    console.error('管理者エスカレーション処理エラー:', error);
    return { success: false, error: '管理者エスカレーション処理に失敗しました' };
  }
}

// 管理者エスカレーションメール送信
async function sendManagerEscalationEmail(assigneeId: string, reminders: any[]) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@homemart.co.jp';
    
    const emailData = {
      Messages: [{
        From: {
          Email: process.env.MAILJET_FROM_EMAIL || 'noreply@homemart.co.jp',
          Name: 'センチュリー21ホームマート'
        },
        To: [{
          Email: adminEmail,
          Name: '管理者'
        }],
        Subject: '【エスカレーション】未対応通知の件',
        HTMLPart: `
          <h2>未対応通知のエスカレーション</h2>
          <p>担当者ID: ${assigneeId}</p>
          <p>未対応の通知が ${reminders.length} 件あります。</p>
          
          <h3>未対応通知一覧</h3>
          <ul>
            ${reminders.map(reminder => `
              <li>${reminder.title} - ${reminder.customers?.name || '顧客名不明'}</li>
            `).join('')}
          </ul>
          
          <p>担当者へのフォローアップをお願いいたします。</p>
          <p>センチュリー21ホームマート</p>
        `
      }]
    };

    await mailjet.post('send', { version: 'v3.1' }).request(emailData);
    console.log('管理者エスカレーションメール送信完了:', assigneeId);
  } catch (error) {
    console.error('管理者エスカレーションメール送信エラー:', error);
  }
}
