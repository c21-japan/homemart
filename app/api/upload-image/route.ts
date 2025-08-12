import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  console.log('画像アップロードAPI開始')
  
  // 環境変数が設定されていない場合はエラーレスポンスを返す
  if (!supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEYが設定されていません')
    return NextResponse.json(
      { error: '画像アップロード機能は現在利用できません。環境変数の設定が必要です。' },
      { status: 503 }
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    console.log('ファイル情報:', {
      name: file?.name,
      size: file?.size,
      type: file?.type
    })
    
    if (!file) {
      console.error('ファイルが提供されていません')
      return NextResponse.json(
        { error: 'ファイルが提供されていません' },
        { status: 400 }
      )
    }

    // ファイルサイズチェック（5MB制限）
    if (file.size > 5 * 1024 * 1024) {
      console.error('ファイルサイズが大きすぎます:', file.size)
      return NextResponse.json(
        { error: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      )
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      console.error('画像ファイルではありません:', file.type)
      return NextResponse.json(
        { error: '画像ファイルのみアップロード可能です' },
        { status: 400 }
      )
    }

    // ファイル名を生成（重複を避けるため）
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `reform-projects/${timestamp}.${fileExtension}`
    
    console.log('アップロードファイル名:', fileName)

    // Supabase Storageにアップロード
    console.log('Supabase Storageにアップロード開始')
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json(
        { error: '画像のアップロードに失敗しました' },
        { status: 500 }
      )
    }

    console.log('Storageアップロード成功:', data)

    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    console.log('公開URL取得:', urlData)

    const response = {
      success: true,
      url: urlData.publicUrl,
      fileName: fileName
    }
    
    console.log('最終レスポンス:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
