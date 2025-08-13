import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, bucketName = 'lead-attachments' } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName と fileType は必須です' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 署名付きURLの生成
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUploadUrl(`${user.id}/${fileName}`);

    if (error) {
      console.error('Signed URL generation error:', error);
      return NextResponse.json(
        { error: '署名付きURLの生成に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      path: data.path
    });

  } catch (error) {
    console.error('Presign URL error:', error);
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    const bucketName = searchParams.get('bucket') || 'lead-attachments';

    if (!filePath) {
      return NextResponse.json(
        { error: 'path パラメータは必須です' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 署名付きダウンロードURLの生成
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 3600); // 1時間有効

    if (error) {
      console.error('Signed download URL generation error:', error);
      return NextResponse.json(
        { error: '署名付きURLの生成に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      signedUrl: data.signedUrl
    });

  } catch (error) {
    console.error('Presign download URL error:', error);
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
    );
  }
}
