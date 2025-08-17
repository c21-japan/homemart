import { NextResponse } from 'next/server';
import { runDailyTask } from '@/lib/db/customers';

export async function POST(request: Request) {
  // ビルド時のスキップ
  if (process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL) {
    return NextResponse.json({ 
      message: 'Skipped during build',
      buildTime: true 
    });
  }

  try {
    console.log('日次運用タスク開始:', new Date().toISOString());
    
    const result = await runDailyTask();
    
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
export async function GET(request: Request) {
  // ビルド時のスキップ
  if (process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL) {
    return NextResponse.json({ 
      message: 'Skipped during build',
      buildTime: true 
    });
  }
  return POST(request);
}
