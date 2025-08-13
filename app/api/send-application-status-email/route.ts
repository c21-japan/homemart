import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, applicationId, status, message } = await request.json();
    
    // メール送信の代わりにログ出力（開発用）
    console.log('メール送信（仮）:', {
      to: email,
      applicationId,
      status,
      message
    });
    
    // 成功レスポンスを返す
    return NextResponse.json({ 
      success: true, 
      message: 'メール送信機能は準備中です' 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'エラーが発生しました' },
      { status: 500 }
    );
  }
}
