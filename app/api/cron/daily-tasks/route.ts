import { NextRequest, NextResponse } from 'next/server'
import { sendIncompleteReminders, sendAgreementDeadlineAlerts } from '@/app/(secure)/actions/notifications'

// Vercel Cron設定
export const runtime = 'edge'

// 毎日午前9時に実行
export async function GET(request: NextRequest) {
  try {
    // 認証チェック（Vercel Cronからの呼び出し）
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    console.log('定期実行タスクを開始: ', new Date().toISOString())

    // 1. 未完了チェックリストのリマインド送信
    console.log('チェックリストリマインド送信を開始...')
    const reminderResult = await sendIncompleteReminders()
    console.log('リマインド送信結果:', reminderResult)

    // 2. 媒介契約期限切れアラート送信
    console.log('媒介契約期限アラート送信を開始...')
    const alertResult = await sendAgreementDeadlineAlerts()
    console.log('アラート送信結果:', alertResult)

    // 3. 統計データの更新（必要に応じて）
    console.log('統計データ更新を開始...')
    // ここで統計データの更新処理を実行

    const summary = {
      timestamp: new Date().toISOString(),
      reminders_sent: reminderResult.reminderCount || 0,
      alerts_sent: alertResult.alertCount || 0,
      status: 'completed'
    }

    console.log('定期実行タスク完了:', summary)

    return NextResponse.json({
      success: true,
      message: '定期実行タスクが完了しました',
      data: summary
    })

  } catch (error) {
    console.error('定期実行タスクエラー:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 手動実行用（テスト・デバッグ）
export async function POST(request: NextRequest) {
  try {
    const { task } = await request.json()

    console.log('手動実行タスク開始:', task)

    let result: any = {}

    switch (task) {
      case 'reminders':
        result = await sendIncompleteReminders()
        break
      case 'alerts':
        result = await sendAgreementDeadlineAlerts()
        break
      case 'all':
        const [reminderResult, alertResult] = await Promise.all([
          sendIncompleteReminders(),
          sendAgreementDeadlineAlerts()
        ])
        result = { reminders: reminderResult, alerts: alertResult }
        break
      default:
        throw new Error('無効なタスクが指定されました')
    }

    return NextResponse.json({
      success: true,
      task,
      result
    })

  } catch (error) {
    console.error('手動実行タスクエラー:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    }, { status: 500 })
  }
}
