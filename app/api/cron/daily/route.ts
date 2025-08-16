import { NextResponse } from 'next/server';
import { runDaily } from '@/server/actions/customers';

export async function POST() {
  try {
    console.log('日次運用タスク開始:', new Date().toISOString());
    
    const result = await runDaily();
    
    if (result.success) {
      console.log('日次運用タスク完了:', new Date().toISOString());
      return NextResponse.json({ 
        success: true, 
        message: '日次運用タスクが正常に完了しました',
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('日次運用タスクエラー:', result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    console.error('日次運用タスク実行エラー:', error);
    return NextResponse.json({ 
      success: false, 
      error: '日次運用タスクの実行中にエラーが発生しました',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GETリクエストでも実行可能（テスト用）
export async function GET() {
  return POST();
}
