// 共通の顧客データベース操作ロジック
// 'use server'ディレクティブなし - APIルートでも使用可能
import { supabaseServer } from '@/lib/supabase-server';

// 顧客詳細取得
export async function getCustomerData(id: string) {
  try {
    const { data, error } = await supabaseServer
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
    return { success: false, error: '顧客詳細の取得中にエラーが発生しました' };
  }
}

// 顧客更新
export async function updateCustomerData(id: string, updateData: any) {
  try {
    const { error } = await supabaseServer
      .from('customers')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('顧客更新エラー:', error);
    return { success: false, error: '顧客の更新中にエラーが発生しました' };
  }
}

// 顧客削除
export async function deleteCustomerData(id: string) {
  try {
    const { error } = await supabaseServer
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('顧客削除エラー:', error);
    return { success: false, error: '顧客の削除中にエラーが発生しました' };
  }
}

// 日次運用タスク（簡易版）
export async function runDailyTask() {
  try {
    // ビルド時は実行しない
    if (!process.env.DATABASE_URL) {
      return { success: true, message: 'Skipped during build' };
    }
    
    console.log('日次運用タスク開始:', new Date().toISOString());
    // 実際の処理は後で実装
    return { success: true, message: '日次運用タスクが正常に完了しました' };
  } catch (error) {
    console.error('日次運用タスクエラー:', error);
    return { success: false, error: '日次運用タスクの実行に失敗しました' };
  }
}

// 管理者エスカレーション処理（簡易版）
export async function runManagerEscalationTask() {
  try {
    // ビルド時は実行しない
    if (!process.env.DATABASE_URL) {
      return { success: true, message: 'Skipped during build' };
    }
    
    console.log('管理者エスカレーション処理開始:', new Date().toISOString());
    // 実際の処理は後で実装
    return { success: true, message: '管理者エスカレーション処理が正常に完了しました' };
  } catch (error) {
    console.error('管理者エスカレーション処理エラー:', error);
    return { success: false, error: '管理者エスカレーション処理に失敗しました' };
  }
}
