import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // ブラウザから送られてきたファイルを取得
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルがありません' },
        { status: 400 }
      )
    }

    // Cloudinaryに送信する準備
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', file)
    cloudinaryFormData.append('upload_preset', 'homemart')
    
    // Cloudinaryにアップロード
    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dowleg3za/image/upload',
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Cloudinary error:', data)
      throw new Error('アップロードに失敗しました')
    }

    // 成功！画像URLを返す
    return NextResponse.json({ 
      url: data.secure_url
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'アップロードに失敗しました' },
      { status: 500 }
    )
  }
}
