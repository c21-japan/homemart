import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { PHOTO_CATEGORIES } from '@/types/leads'

// カテゴリ別のAI処理プリセット
const AI_PRESETS = {
  '外観': {
    enhancement: 'コントラスト最適化、垂直補正、電線の軽微リタッチ、曇天の場合は自然な明るさ補正。看板や車ナンバーは自動ぼかし。',
    staging: '外観の清潔感を向上させ、建物の特徴を際立たせる。'
  },
  '間取り': {
    enhancement: '紙の歪み補正、コントラスト強調、黄ばみ除去。注記テキストはそのまま保持。',
    staging: '間取り図の可読性を向上させる。'
  },
  'リビング': {
    enhancement: '露出/WB調整、床・壁のディテール強調、生活感の強い小物を軽微に整理。',
    staging: '観葉植物とブック、クッション等の小物のみ追加。'
  },
  '室内1': {
    enhancement: '露出/WB調整、床・壁のディテール強調、生活感の強い小物を軽微に整理。',
    staging: '観葉植物とブック、クッション等の小物のみ追加。'
  },
  '室内2': {
    enhancement: '露出/WB調整、床・壁のディテール強調、生活感の強い小物を軽微に整理。',
    staging: '観葉植物とブック、クッション等の小物のみ追加。'
  },
  '室内3': {
    enhancement: '露出/WB調整、床・壁のディテール強調、生活感の強い小物を軽微に整理。',
    staging: '観葉植物とブック、クッション等の小物のみ追加。'
  },
  'キッチン': {
    enhancement: '金属のハイライト抑制、天板の映り込み軽減。',
    staging: 'カッティングボード・小瓶・マグ2点を整然と配置。'
  },
  '洗面所': {
    enhancement: 'ミラーの反射内の人物・紙類を自動マスキング。',
    staging: 'ハンドソープ/タオルを清潔感のある配置で。'
  },
  '洗面台': {
    enhancement: 'ミラーの反射内の人物・紙類を自動マスキング。',
    staging: 'ハンドソープ/タオルを清潔感のある配置で。'
  },
  'トイレ': {
    enhancement: '清潔感の強調、黄ばみ・ノイズ低減。',
    staging: '消臭スティックや小さなグリーンを1点のみ。'
  },
  '浴室': {
    enhancement: '水滴・くもり除去、タイルの目地クリーニング風の強調。',
    staging: 'シャンプー/コンディショナー/ボディソープのボトルを統一感あるラベルで3本、コーナーに整列。'
  },
  '玄関': {
    enhancement: '露出調整、清潔感の向上。',
    staging: '靴の整理、小物の配置。'
  },
  'バルコニー/眺望': {
    enhancement: '外光の調整、景色の鮮明化。',
    staging: '観葉植物の配置。'
  },
  '共用部/駐車場': {
    enhancement: '明度調整、清潔感の向上。',
    staging: '駐車場の整理、共用部の清潔感。'
  }
}

// デフォルトプリセット
const DEFAULT_PRESET = {
  enhancement: '露出調整、コントラスト最適化、ノイズ軽減。',
  staging: '清潔感のある小物を軽微に配置。'
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { leadId, slot, category, originalPath, processType = 'enhance' } = await request.json()

    if (!leadId || !slot || !category || !originalPath) {
      return NextResponse.json({ error: '必要なパラメータが不足しています' }, { status: 400 })
    }

    // OpenAI APIキーの確認
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json({ error: 'OpenAI APIキーが設定されていません' }, { status: 500 })
    }

    // カテゴリに基づくプリセットを取得
    const preset = AI_PRESETS[category as keyof typeof AI_PRESETS] || DEFAULT_PRESET

    try {
      let processedImagePath = ''
      let processingStatus = 'enhanced'

      if (processType === 'enhance') {
        // 画像の自動補正
        processedImagePath = await enhanceImage(originalPath, preset.enhancement, openaiApiKey)
      } else if (processType === 'stage') {
        // バーチャル演出
        processedImagePath = await stageImage(originalPath, preset.staging, openaiApiKey)
        processingStatus = 'staged'
      }

      // 処理結果をデータベースに保存
      const { error: updateError } = await supabase
        .from('lead_photos')
        .upsert([{
          lead_id: leadId,
          slot,
          category,
          original_path: originalPath,
          enhanced_path: processType === 'enhance' ? processedImagePath : undefined,
          staged_path: processType === 'stage' ? processedImagePath : undefined,
          processing_status: processingStatus
        }], {
          onConflict: 'lead_id,slot'
        })

      if (updateError) {
        console.error('Error updating photo record:', updateError)
        return NextResponse.json({ error: '画像情報の更新に失敗しました' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        processedImagePath,
        processingStatus
      })

    } catch (processingError) {
      console.error('Image processing error:', processingError)
      
      // エラー状態をデータベースに記録
      await supabase
        .from('lead_photos')
        .upsert([{
          lead_id: leadId,
          slot,
          category,
          original_path: originalPath,
          processing_status: 'error'
        }], {
          onConflict: 'lead_id,slot'
        })

      return NextResponse.json({ 
        error: '画像処理に失敗しました',
        details: processingError instanceof Error ? processingError.message : '不明なエラー'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in photos process API:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

// 画像の自動補正
async function enhanceImage(originalPath: string, enhancementPrompt: string, apiKey: string): Promise<string> {
  try {
    // 元画像をダウンロード
    const imageResponse = await fetch(originalPath)
    if (!imageResponse.ok) {
      throw new Error('元画像の取得に失敗しました')
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const imageBlob = new Blob([imageBuffer])

    // OpenAI APIで画像補正
    const formData = new FormData()
    formData.append('image', imageBlob, 'original.jpg')
    formData.append('prompt', `画像の品質を向上させてください。${enhancementPrompt}`)
    formData.append('n', '1')
    formData.append('size', '1024x1024')

    const openaiResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      throw new Error(`OpenAI API エラー: ${errorData.error?.message || '不明なエラー'}`)
    }

    const result = await openaiResponse.json()
    const processedImageUrl = result.data[0].url

    // 処理済み画像をSupabase Storageに保存
    const processedImageResponse = await fetch(processedImageUrl)
    const processedImageBuffer = await processedImageResponse.arrayBuffer()
    
    // ファイル名を生成
    const timestamp = Date.now()
    const processedImagePath = `lead-photos/processed/${timestamp}-enhanced.jpg`

    // Supabase Storageに保存
    const supabase = await createClient()

    const { error: uploadError } = await supabase.storage
      .from('lead-photos')
      .upload(processedImagePath, processedImageBuffer, {
        contentType: 'image/jpeg'
      })

    if (uploadError) {
      throw new Error(`処理済み画像の保存に失敗: ${uploadError.message}`)
    }

    return processedImagePath

  } catch (error) {
    console.error('Image enhancement error:', error)
    throw error
  }
}

// バーチャル演出
async function stageImage(originalPath: string, stagingPrompt: string, apiKey: string): Promise<string> {
  try {
    // 元画像をダウンロード
    const imageResponse = await fetch(originalPath)
    if (!imageResponse.ok) {
      throw new Error('元画像の取得に失敗しました')
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const imageBlob = new Blob([imageBuffer])

    // OpenAI APIでバーチャル演出
    const formData = new FormData()
    formData.append('image', imageBlob, 'original.jpg')
    formData.append('prompt', `この画像に軽微な小物の演出を追加してください。${stagingPrompt} 構造や広さは変更せず、小物の配置のみ行ってください。`)
    formData.append('n', '1')
    formData.append('size', '1024x1024')

    const openaiResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      throw new Error(`OpenAI API エラー: ${errorData.error?.message || '不明なエラー'}`)
    }

    const result = await openaiResponse.json()
    const stagedImageUrl = result.data[0].url

    // 演出済み画像をSupabase Storageに保存
    const stagedImageResponse = await fetch(stagedImageUrl)
    const stagedImageBuffer = await stagedImageResponse.arrayBuffer()
    
    // ファイル名を生成
    const timestamp = Date.now()
    const stagedImagePath = `lead-photos/staged/${timestamp}-staged.jpg`

    // Supabase Storageに保存
    const supabase = await createClient()

    const { error: uploadError } = await supabase.storage
      .from('lead-photos')
      .upload(stagedImagePath, stagedImageBuffer, {
        contentType: 'image/jpeg'
      })

    if (uploadError) {
      throw new Error(`演出済み画像の保存に失敗: ${uploadError.message}`)
    }

    return stagedImagePath

  } catch (error) {
    console.error('Image staging error:', error)
    throw error
  }
}

// 画像処理の進捗確認
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')
    const slot = searchParams.get('slot')

    if (!leadId || !slot) {
      return NextResponse.json({ error: 'leadIdとslotは必須です' }, { status: 400 })
    }

    // 画像の処理状況を取得
    const { data: photo, error } = await supabase
      .from('lead_photos')
      .select('*')
      .eq('lead_id', leadId)
      .eq('slot', slot)
      .single()

    if (error) {
      return NextResponse.json({ error: '画像情報の取得に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({
      processingStatus: photo.processing_status,
      originalPath: photo.original_path,
      enhancedPath: photo.enhanced_path,
      stagedPath: photo.staged_path
    })

  } catch (error) {
    console.error('Error in photos process GET API:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
