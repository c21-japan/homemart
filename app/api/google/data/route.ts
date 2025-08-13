import { NextRequest, NextResponse } from 'next/server'
import { 
  getDriveFiles, 
  getGmailMessages, 
  getCalendarEvents, 
  getSpreadsheets 
} from '@/lib/google-api'

export async function POST(request: NextRequest) {
  try {
    const { type, accessToken, maxResults = 10 } = await request.json()
    
    if (!type || !accessToken) {
      return NextResponse.json(
        { error: 'タイプとアクセストークンが必要です' },
        { status: 400 }
      )
    }

    let data
    switch (type) {
      case 'drive':
        data = await getDriveFiles(accessToken, maxResults)
        break
      case 'gmail':
        data = await getGmailMessages(accessToken, maxResults)
        break
      case 'calendar':
        data = await getCalendarEvents(accessToken, maxResults)
        break
      case 'sheets':
        data = await getSpreadsheets(accessToken, maxResults)
        break
      default:
        return NextResponse.json(
          { error: '無効なタイプです' },
          { status: 400 }
        )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Google data fetch error:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}
