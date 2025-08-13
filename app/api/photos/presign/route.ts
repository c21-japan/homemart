import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { PHOTO_CATEGORIES } from '@/types/leads'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { leadId, slot, category, fileName, fileType, fileSize } = await request.json()

    if (!leadId || !slot || !category || !fileName || !fileType) {
      return NextResponse.json({ error: '必要なパラメータが不足しています' }, { status: 400 })
    }

    // スロット番号の検証（1-30）
    if (slot < 1 || slot > 30) {
      return NextResponse.json({ error: 'スロット番号は1-30の範囲で指定してください' }, { status: 400 })
    }

    // カテゴリの検証
    if (!PHOTO_CATEGORIES[slot as keyof typeof PHOTO_CATEGORIES]) {
      return NextResponse.json({ error: '無効なカテゴリです' }, { status: 400 })
    }

    // ファイルサイズチェック（10MB制限）
    if (fileSize && fileSize > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'ファイルサイズは10MB以下にしてください' }, { status: 400 })
    }

    // 許可されたファイルタイプチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ error: '許可されていないファイルタイプです' }, { status: 400 })
    }

    // ファイルパスの生成
    const timestamp = Date.now()
    const filePath = `lead-photos/${leadId}/${slot}-${category}/${timestamp}-${fileName}`

    // 署名付きURLの生成（PUT用）
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lead-photos')
      .createSignedUploadUrl(filePath)

    if (uploadError) {
      console.error('Error creating signed upload URL:', uploadError)
      return NextResponse.json({ error: 'アップロードURLの生成に失敗しました' }, { status: 500 })
    }

    // 署名付きURLの生成（GET用 - アップロード後の確認用）
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('lead-photos')
      .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7日間有効

    if (downloadError) {
      console.error('Error creating signed download URL:', downloadError)
    }

    return NextResponse.json({
      uploadUrl: uploadData.signedUrl,
      downloadUrl: downloadData?.signedUrl,
      filePath,
      slot,
      category
    })
  } catch (error) {
    console.error('Error in photos presign API:', error)
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
      .from('lead-photos')
      .createSignedUrl(filePath, 60 * 60) // 1時間有効

    if (error) {
      console.error('Error creating signed download URL:', error)
      return NextResponse.json({ error: 'ダウンロードURLの生成に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({
      downloadUrl: data.signedUrl
    })
  } catch (error) {
    console.error('Error in photos presign GET API:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
