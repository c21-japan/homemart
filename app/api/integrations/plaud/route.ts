import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { updateChecklistItem } from '@/app/(secure)/actions/checklists'

// PLAUD note AI設定
const PLAUD_CONFIG = {
  apiKey: process.env.PLAUD_API_KEY,
  baseUrl: process.env.PLAUD_API_URL || 'https://api.plaud.ai'
}

// PLAUD音声記録の処理
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { audioFile, leadId, context } = await request.json()

    if (!audioFile || !leadId) {
      return NextResponse.json({ error: '必要なパラメータが不足しています' }, { status: 400 })
    }

    // 音声ファイルをPLAUD APIに送信
    const transcriptionResult = await transcribeAudio(audioFile)
    
    if (!transcriptionResult.success) {
      throw new Error(transcriptionResult.error)
    }

    // 音声記録をデータベースに保存
    const audioRecord = await saveAudioRecord(leadId, audioFile, transcriptionResult.text, context)

    // 音声内容を分析してチェックリストを自動更新
    const checklistUpdates = await analyzeAndUpdateChecklist(leadId, transcriptionResult.text)

    return NextResponse.json({
      success: true,
      audioRecord,
      transcription: transcriptionResult.text,
      checklistUpdates
    })

  } catch (error) {
    console.error('Error in PLAUD integration:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    }, { status: 500 })
  }
}

// 音声ファイルの文字起こし
async function transcribeAudio(audioFile: any) {
  try {
    if (!PLAUD_CONFIG.apiKey) {
      throw new Error('PLAUD APIキーが設定されていません')
    }

    // 音声ファイルをBase64エンコード
    const base64Audio = await fileToBase64(audioFile)

    // PLAUD APIに音声認識リクエスト
    const response = await fetch(`${PLAUD_CONFIG.baseUrl}/transcribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PLAUD_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio: base64Audio,
        language: 'ja',
        model: 'whisper-1'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`PLAUD音声認識エラー: ${errorData.message || response.statusText}`)
    }

    const result = await response.json()

    return {
      success: true,
      text: result.text,
      confidence: result.confidence
    }

  } catch (error) {
    console.error('PLAUD transcription error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー'
    }
  }
}

// ファイルをBase64エンコード
async function fileToBase64(file: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result as string
      // data:audio/wav;base64, の部分を除去
      resolve(base64.split(',')[1])
    }
    reader.onerror = error => reject(error)
  })
}

// 音声記録をデータベースに保存
async function saveAudioRecord(leadId: string, audioFile: any, transcription: string, context: string) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // 音声ファイルをSupabase Storageに保存
    const fileName = `${Date.now()}-${audioFile.name}`
    const filePath = `audio-records/${leadId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('audio-records')
      .upload(filePath, audioFile)

    if (uploadError) throw uploadError

    // 音声記録情報をデータベースに保存
    const { data: record, error: insertError } = await supabase
      .from('audio_records')
      .insert([{
        lead_id: leadId,
        file_path: filePath,
        file_name: audioFile.name,
        file_size: audioFile.size,
        transcription: transcription,
        context: context,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (insertError) throw insertError

    return record

  } catch (error) {
    console.error('Audio record save error:', error)
    throw error
  }
}

// 音声内容を分析してチェックリストを自動更新
async function analyzeAndUpdateChecklist(leadId: string, transcription: string) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // 顧客のチェックリストを取得
    const { data: checklists, error: fetchError } = await supabase
      .from('customer_checklists')
      .select(`
        *,
        checklist_items (*)
      `)
      .eq('lead_id', leadId)

    if (fetchError) throw fetchError

    const updates: any[] = []

    for (const checklist of checklists || []) {
      for (const item of checklist.checklist_items || []) {
        // 音声内容とチェックリスト項目のマッチング
        const matchResult = analyzeContentMatch(transcription, item)
        
        if (matchResult.shouldUpdate) {
          try {
            // チェックリスト項目を更新
            await updateChecklistItem(item.id, {
              checked: matchResult.checked,
              note: matchResult.note
            })

            updates.push({
              item_id: item.id,
              label: item.label,
              action: matchResult.action,
              note: matchResult.note
            })
          } catch (updateError) {
            console.error('Checklist item update error:', updateError)
          }
        }
      }
    }

    return updates

  } catch (error) {
    console.error('Checklist analysis error:', error)
    return []
  }
}

// 音声内容とチェックリスト項目のマッチング分析
function analyzeContentMatch(transcription: string, item: any) {
  const text = transcription.toLowerCase()
  const label = item.label.toLowerCase()

  // 完了を示すキーワード
  const completionKeywords = [
    '完了', '終了', '終わった', '済み', '確認済み', '提出済み', '受け取り済み',
    'done', 'finished', 'completed', 'submitted', 'received'
  ]

  // 進行中を示すキーワード
  const progressKeywords = [
    '進行中', '作業中', '準備中', '検討中', '調整中',
    'in progress', 'working on', 'preparing', 'considering'
  ]

  // 問題を示すキーワード
  const problemKeywords = [
    '問題', 'トラブル', '遅延', '延期', 'キャンセル', '中止',
    'problem', 'trouble', 'delay', 'postponed', 'cancelled'
  ]

  let shouldUpdate = false
  let checked = item.checked
  let action = ''
  let note = ''

  // 完了キーワードのチェック
  if (completionKeywords.some(keyword => text.includes(keyword))) {
    if (!item.checked) {
      shouldUpdate = true
      checked = true
      action = '完了'
      note = `音声記録により自動完了: ${transcription}`
    }
  }

  // 進行中キーワードのチェック
  if (progressKeywords.some(keyword => text.includes(keyword))) {
    shouldUpdate = true
    action = '進行中'
    note = `音声記録により進行中: ${transcription}`
  }

  // 問題キーワードのチェック
  if (problemKeywords.some(keyword => text.includes(keyword))) {
    shouldUpdate = true
    action = '問題発生'
    note = `音声記録により問題確認: ${transcription}`
  }

  // 特定の項目とのマッチング
  if (label.includes('物件資料') && text.includes('資料')) {
    shouldUpdate = true
    action = '資料関連'
    note = `音声記録により資料関連の進捗確認: ${transcription}`
  }

  if (label.includes('見積') && (text.includes('見積') || text.includes('金額'))) {
    shouldUpdate = true
    action = '見積関連'
    note = `音声記録により見積関連の進捗確認: ${transcription}`
  }

  if (label.includes('契約') && text.includes('契約')) {
    shouldUpdate = true
    action = '契約関連'
    note = `音声記録により契約関連の進捗確認: ${transcription}`
  }

  return {
    shouldUpdate,
    checked,
    action,
    note
  }
}

// 音声記録の取得
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json({ error: 'leadIdは必須です' }, { status: 400 })
    }

    // 顧客の音声記録を取得
    const { data: records, error: fetchError } = await supabase
      .from('audio_records')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (fetchError) throw fetchError

    return NextResponse.json({
      success: true,
      data: records
    })

  } catch (error) {
    console.error('Error fetching audio records:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    }, { status: 500 })
  }
}
