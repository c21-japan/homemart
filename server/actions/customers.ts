'use server';

import { supabaseServer } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Mailjet from 'node-mailjet';

// 顧客作成（自動チェックリスト・リマインド生成付き）
export async function createCustomer(data: any) {
  const supabase = supabaseServer;
  
  try {
    // 1. 顧客テーブルに挿入
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
        assignee_name: data.assignee_name,
        is_vip: data.is_vip || false,
        priority: data.priority || 'medium',
        notes: data.notes,
        status: 'active'
      })
      .select()
      .single();

    if (customerError) throw customerError;

    // 2. 物件テーブルに挿入
    if (data.property_type && data.address) {
      const { error: propertyError } = await supabase
        .from('properties')
        .insert({
          customer_id: customer.id,
          property_type: data.property_type,
          address: data.address,
          mansion_name: data.mansion_name,
          room_number: data.room_number,
          land_number: data.land_number,
          land_type: data.land_type,
          boundary_status: data.boundary_status,
          building_area: data.building_area,
          floor_plan: data.floor_plan,
          built_year: data.built_year,
          area: data.area,
          reform_history: data.reform_history
        });

      if (propertyError) throw propertyError;
    }

    // 3. カテゴリ別の詳細テーブルに挿入
    if (data.category === 'seller') {
      const { error: sellerError } = await supabase
        .from('seller_details')
        .insert({
          customer_id: customer.id,
          desired_price: data.desired_price,
          brokerage: data.brokerage || 'general',
          brokerage_start: data.brokerage_start || new Date().toISOString().split('T')[0],
          contact_method: data.contact_method || 'email',
          deal_type: data.deal_type || 'brokerage'
        });

      if (sellerError) throw sellerError;

      // 売却チェックリストを自動生成
      await createSellerChecklist(customer.id);
      
      // 媒介開始日のリマインドを自動生成
      await createBrokerageReminders(customer.id, data.brokerage_start);
    }

    if (data.category === 'buyer') {
      const { error: buyerError } = await supabase
        .from('buyer_details')
        .insert({
          customer_id: customer.id,
          preferred_area: data.preferred_area,
          budget_min: data.budget_min,
          budget_max: data.budget_max,
          conditions: data.conditions,
          finance_plan: data.finance_plan,
          interested_property_id: data.interested_property_id
        });

      if (buyerError) throw buyerError;

      // 購入チェックリストを自動生成
      await createBuyerChecklist(customer.id);
    }

    if (data.category === 'reform') {
      const { error: reformError } = await supabase
        .from('reform_projects')
        .insert({
          customer_id: customer.id,
          is_existing_customer: data.is_existing_customer || false,
          existing_customer_id: data.existing_customer_id,
          work_types: data.work_types || [],
          estimated_budget: data.estimated_budget,
          desired_period: data.desired_period,
          survey_date: data.survey_date,
          status: 'estimate',
          progress_percentage: 0
        });

      if (reformError) throw reformError;

      // リフォームチェックリストを自動生成
      await createReformChecklist(customer.id);
      
      // 現地調査日のリマインドを自動生成
      if (data.survey_date) {
        await createSurveyReminder(customer.id, data.survey_date);
      }
    }

    revalidatePath('/admin/customers');
    return { success: true, customer };

  } catch (error) {
    console.error('顧客作成エラー:', error);
    return { success: false, error: '顧客の作成に失敗しました' };
  }
}

// 売却チェックリスト作成
async function createSellerChecklist(customerId: string) {
  const supabase = supabaseServer;
  
  try {
    // テンプレートからチェックリストをコピー
    const { data: template, error: templateError } = await supabase
      .from('checklists')
      .select('*')
      .eq('type', 'seller')
      .is('customer_id', null)
      .single();

    if (templateError) throw templateError;

    // 顧客用のチェックリストを作成
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .insert({
        customer_id: customerId,
        type: 'seller',
        title: template.title,
        due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90日後
      })
      .select()
      .single();

    if (checklistError) throw checklistError;

    // チェックリスト項目をコピー
    const { data: templateItems, error: itemsError } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('checklist_id', template.id)
      .order('order_index');

    if (itemsError) throw itemsError;

    // 各項目を顧客用にコピー
    for (const item of templateItems || []) {
      await supabase
        .from('checklist_items')
        .insert({
          checklist_id: checklist.id,
          label: item.label,
          order_index: item.order_index
        });
    }

  } catch (error) {
    console.error('売却チェックリスト作成エラー:', error);
  }
}

// 購入チェックリスト作成
async function createBuyerChecklist(customerId: string) {
  const supabase = supabaseServer;
  
  try {
    // テンプレートからチェックリストをコピー
    const { data: template, error: templateError } = await supabase
      .from('checklists')
      .select('*')
      .eq('type', 'buyer')
      .is('customer_id', null)
      .single();

    if (templateError) throw templateError;

    // 顧客用のチェックリストを作成
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .insert({
        customer_id: customerId,
        type: 'buyer',
        title: template.title,
        due_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 120日後
      })
      .select()
      .single();

    if (checklistError) throw checklistError;

    // チェックリスト項目をコピー
    const { data: templateItems, error: itemsError } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('checklist_id', template.id)
      .order('order_index');

    if (itemsError) throw itemsError;

    // 各項目を顧客用にコピー
    for (const item of templateItems || []) {
      await supabase
        .from('checklist_items')
        .insert({
          checklist_id: checklist.id,
          label: item.label,
          order_index: item.order_index
        });
    }

  } catch (error) {
    console.error('購入チェックリスト作成エラー:', error);
  }
}

// リフォームチェックリスト作成
async function createReformChecklist(customerId: string) {
  const supabase = supabaseServer;
  
  try {
    // テンプレートからチェックリストをコピー
    const { data: template, error: templateError } = await supabase
      .from('checklists')
      .select('*')
      .eq('type', 'reform')
      .is('customer_id', null)
      .single();

    if (templateError) throw templateError;

    // 顧客用のチェックリストを作成
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .insert({
        customer_id: customerId,
        type: 'reform',
        title: template.title,
        due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 60日後
      })
      .select()
      .single();

    if (checklistError) throw checklistError;

    // チェックリスト項目をコピー
    const { data: templateItems, error: itemsError } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('checklist_id', template.id)
      .order('order_index');

    if (itemsError) throw itemsError;

    // 各項目を顧客用にコピー
    for (const item of templateItems || []) {
      await supabase
        .from('checklist_items')
        .insert({
          checklist_id: checklist.id,
          label: item.label,
          order_index: item.order_index
        });
    }

  } catch (error) {
    console.error('リフォームチェックリスト作成エラー:', error);
  }
}

// 媒介開始日のリマインド作成
async function createBrokerageReminders(customerId: string, brokerageStart: string) {
  const supabase = supabaseServer;
  
  try {
    const startDate = new Date(brokerageStart);
    
    // 媒介開始日のリマインド
    await supabase
      .from('reminders')
      .insert({
        customer_id: customerId,
        title: '媒介開始',
        scheduled_at: startDate.toISOString(),
        channel: 'email',
        priority: 'medium'
      });

    // 媒介開始1週間後のリマインド
    const weekLater = new Date(startDate);
    weekLater.setDate(weekLater.getDate() + 7);
    
    await supabase
      .from('reminders')
      .insert({
        customer_id: customerId,
        title: '媒介開始1週間経過',
        scheduled_at: weekLater.toISOString(),
        channel: 'email',
        priority: 'medium'
      });

    // 媒介開始1ヶ月後のリマインド
    const monthLater = new Date(startDate);
    monthLater.setMonth(monthLater.getMonth() + 1);
    
    await supabase
      .from('reminders')
      .insert({
        customer_id: customerId,
        title: '媒介開始1ヶ月経過',
        scheduled_at: monthLater.toISOString(),
        channel: 'email',
        priority: 'high'
      });

  } catch (error) {
    console.error('媒介リマインド作成エラー:', error);
  }
}

// 現地調査日のリマインド作成
async function createSurveyReminder(customerId: string, surveyDate: string) {
  const supabase = supabaseServer;
  
  try {
    const survey = new Date(surveyDate);
    
    // 現地調査前日のリマインド
    const dayBefore = new Date(survey);
    dayBefore.setDate(dayBefore.getDate() - 1);
    
    await supabase
      .from('reminders')
      .insert({
        customer_id: customerId,
        title: '現地調査前日リマインド',
        scheduled_at: dayBefore.toISOString(),
        channel: 'email',
        priority: 'high'
      });

    // 現地調査当日のリマインド
    await supabase
      .from('reminders')
      .insert({
        customer_id: customerId,
        title: '現地調査当日',
        scheduled_at: survey.toISOString(),
        channel: 'email',
        priority: 'urgent'
      });

  } catch (error) {
    console.error('現地調査リマインド作成エラー:', error);
  }
}

// 打ち合わせ記録の保存
export async function saveMeetingRecord(customerId: string, meetingData: any) {
  const supabase = supabaseServer;
  
  try {
    // ミーティングを保存
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        customer_id: customerId,
        started_at: meetingData.meeting_date,
        summary: meetingData.title,
        source: 'manual'
      })
      .select()
      .single();

    if (meetingError) throw meetingError;

    // ミーティングノートを保存
    if (meetingData.content) {
      const { error: noteError } = await supabase
        .from('meeting_notes')
        .insert({
          meeting_id: meeting.id,
          raw_text: meetingData.content
        });

      if (noteError) throw noteError;
    }

    // 写真があれば文書テーブルに保存
    if (meetingData.photos && meetingData.photos.length > 0) {
      for (const photo of meetingData.photos) {
        // 実際の実装では、ファイルをSupabase Storageにアップロード
        // ここではファイル名のみ保存
        await supabase
          .from('documents')
          .insert({
            customer_id: customerId,
            type: 'meeting_photo',
            filename: photo.name,
            file_path: `meetings/${meeting.id}/${photo.name}`,
            file_size: photo.size,
            mime_type: photo.type,
            uploaded_by: 'current_user' // 実際の実装では現在のユーザーID
          });
      }
    }

    revalidatePath(`/admin/customers/${customerId}`);
    return { success: true, meeting };

  } catch (error) {
    console.error('打ち合わせ記録保存エラー:', error);
    return { success: false, error: '打ち合わせ記録の保存に失敗しました' };
  }
}

// 顧客更新
export async function updateCustomer(id: string, data: any) {
  const supabase = supabaseServer;
  
  try {
    const { error } = await supabase
      .from('customers')
      .update({
        ...data,
        updated_at: new Date().toISOString()
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
        documents(*),
        meetings(
          *,
          meeting_notes(*)
        ),
        tasks(*),
        reminders(*)
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

    // Mailjetクライアントの初期化
    const mailjet = new Mailjet({
      apiKey: process.env.MAILJET_API_KEY || '',
      apiSecret: process.env.MAILJET_API_SECRET || ''
    });
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

    // Mailjetクライアントの初期化
    const mailjet = new Mailjet({
      apiKey: process.env.MAILJET_API_KEY || '',
      apiSecret: process.env.MAILJET_API_SECRET || ''
    });
    await mailjet.post('send', { version: 'v3.1' }).request(emailData);
    console.log('管理者エスカレーションメール送信完了:', assigneeId);
  } catch (error) {
    console.error('管理者エスカレーションメール送信エラー:', error);
  }
}
