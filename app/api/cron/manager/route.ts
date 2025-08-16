import { NextResponse } from 'next/server';
import { runManagerEscalation } from '@/server/actions/customers';

export async function POST() {
  try {
    console.log('管理者エスカレーション処理開始:', new Date().toISOString());
    
    const result = await runManagerEscalation();
    
    if (result.success) {
      console.log('管理者エスカレーション処理完了:', new Date().toISOString());
      return NextResponse.json({ 
        success: true, 
        message: '管理者エスカレーション処理が正常に完了しました',
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('管理者エスカレーション処理エラー:', result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    console.error('管理者エスカレーション処理実行エラー:', error);
    return NextResponse.json({ 
      success: false, 
      error: '管理者エスカレーション処理の実行中にエラーが発生しました',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GETリクエストでも実行可能（テスト用）
export async function GET() {
  return POST();
}
