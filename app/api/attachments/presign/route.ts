import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { fileName, fileType, fileSize } = await request.json()

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'ファイル名とファイルタイプは必須です' }, { status: 400 })
    }

    // ファイルサイズチェック（10MB制限）
    if (fileSize && fileSize > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'ファイルサイズは10MB以下にしてください' }, { status: 400 })
    }

    // 許可されたファイルタイプチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ error: '許可されていないファイルタイプです' }, { status: 400 })
    }

    // ファイルパスの生成
    const timestamp = Date.now()
    const filePath = `lead-attachments/${user.id}/${timestamp}-${fileName}`

    // 署名付きURLの生成（PUT用）
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lead-attachments')
      .createSignedUploadUrl(filePath)

    if (uploadError) {
      console.error('Error creating signed upload URL:', uploadError)
      return NextResponse.json({ error: 'アップロードURLの生成に失敗しました' }, { status: 500 })
    }

    // 署名付きURLの生成（GET用 - アップロード後の確認用）
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('lead-attachments')
      .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7日間有効

    if (downloadError) {
      console.error('Error creating signed download URL:', downloadError)
    }

    return NextResponse.json({
      uploadUrl: uploadData.signedUrl,
      downloadUrl: downloadData?.signedUrl,
      filePath
    })
  } catch (error) {
    console.error('Error in presign API:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json({ error: 'ファイルパスは必須です' }, { status: 400 })
    }

    // 署名付きURLの生成（GET用）
    const { data, error } = await supabase.storage
      .from('lead-attachments')
      .createSignedUrl(filePath, 60 * 60) // 1時間有効

    if (error) {
      console.error('Error creating signed download URL:', error)
      return NextResponse.json({ error: 'ダウンロードURLの生成に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({
      downloadUrl: data.signedUrl
    })
  } catch (error) {
    console.error('Error in presign GET API:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
