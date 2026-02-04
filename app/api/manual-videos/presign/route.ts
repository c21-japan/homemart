import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const MAX_VIDEO_SIZE = 200 * 1024 * 1024
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v'
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { fileName, fileType, fileSize } = await request.json()

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'ファイル名とファイルタイプは必須です' }, { status: 400 })
    }

    if (fileSize && fileSize > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: 'ファイルサイズは200MB以下にしてください' }, { status: 400 })
    }

    if (!ALLOWED_VIDEO_TYPES.includes(fileType)) {
      return NextResponse.json({ error: '許可されていないファイルタイプです' }, { status: 400 })
    }

    const timestamp = Date.now()
    const filePath = `manuals/${user.id}/${timestamp}-${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('manual-videos')
      .createSignedUploadUrl(filePath)

    if (uploadError) {
      console.error('Error creating signed upload URL:', uploadError)
      return NextResponse.json({ error: 'アップロードURLの生成に失敗しました' }, { status: 500 })
    }

    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('manual-videos')
      .createSignedUrl(filePath, 60 * 60 * 24 * 7)

    if (downloadError) {
      console.error('Error creating signed download URL:', downloadError)
    }

    return NextResponse.json({
      uploadUrl: uploadData.signedUrl,
      downloadUrl: downloadData?.signedUrl,
      filePath
    })
  } catch (error) {
    console.error('Error in manual video presign API:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json({ error: 'ファイルパスは必須です' }, { status: 400 })
    }

    const { data, error } = await supabase.storage
      .from('manual-videos')
      .createSignedUrl(filePath, 60 * 60)

    if (error) {
      console.error('Error creating signed download URL:', error)
      return NextResponse.json({ error: 'ダウンロードURLの生成に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ downloadUrl: data.signedUrl })
  } catch (error) {
    console.error('Error in manual video presign GET API:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
