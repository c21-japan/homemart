import { google } from 'googleapis'

// Google APIの設定
const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/spreadsheets.readonly'
]

// 環境変数から認証情報を取得
const getAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Google API認証情報が設定されていません')
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

// Googleドライブのファイル一覧を取得
export const getDriveFiles = async (accessToken: string, pageSize: number = 10) => {
  try {
    const auth = getAuthClient()
    auth.setCredentials({ access_token: accessToken })

    const drive = google.drive({ version: 'v3', auth })
    
    const response = await drive.files.list({
      pageSize,
      fields: 'nextPageToken, files(id, name, mimeType, webViewLink, thumbnailLink, modifiedTime, size)',
      orderBy: 'modifiedTime desc'
    })

    return response.data.files || []
  } catch (error) {
    console.error('Drive API error:', error)
    throw new Error('ドライブファイルの取得に失敗しました')
  }
}

// Gmailのメール一覧を取得
export const getGmailMessages = async (accessToken: string, maxResults: number = 10) => {
  try {
    const auth = getAuthClient()
    auth.setCredentials({ access_token: accessToken })

    const gmail = google.gmail({ version: 'v1', auth })
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: 'is:unread OR is:important'
    })

    const messages = response.data.messages || []
    const detailedMessages = await Promise.all(
      messages.map(async (message) => {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!
        })
        return detail.data
      })
    )

    return detailedMessages
  } catch (error) {
    console.error('Gmail API error:', error)
    throw new Error('メールの取得に失敗しました')
  }
}

// Googleカレンダーのイベント一覧を取得
export const getCalendarEvents = async (accessToken: string, maxResults: number = 10) => {
  try {
    const auth = getAuthClient()
    auth.setCredentials({ access_token: accessToken })

    const calendar = google.calendar({ version: 'v3', auth })
    
    const now = new Date()
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: oneWeekLater.toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime'
    })

    return response.data.items || []
  } catch (error) {
    console.error('Calendar API error:', error)
    throw new Error('カレンダーイベントの取得に失敗しました')
  }
}

// スプレッドシートの一覧を取得
export const getSpreadsheets = async (accessToken: string, pageSize: number = 10) => {
  try {
    const auth = getAuthClient()
    auth.setCredentials({ access_token: accessToken })

    const drive = google.drive({ version: 'v3', auth })
    
    const response = await drive.files.list({
      pageSize,
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'nextPageToken, files(id, name, mimeType, webViewLink, modifiedTime)',
      orderBy: 'modifiedTime desc'
    })

    return response.data.files || []
  } catch (error) {
    console.error('Drive API error (spreadsheets):', error)
    throw new Error('スプレッドシートの取得に失敗しました')
  }
}

// 認証URLを生成
export const getAuthUrl = () => {
  const auth = getAuthClient()
  return auth.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  })
}

// アクセストークンを取得
export const getTokensFromCode = async (code: string) => {
  try {
    const auth = getAuthClient()
    const { tokens } = await auth.getToken(code)
    return tokens
  } catch (error) {
    console.error('Token exchange error:', error)
    throw new Error('アクセストークンの取得に失敗しました')
  }
}

// アクセストークンを更新
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const auth = getAuthClient()
    auth.setCredentials({ refresh_token: refreshToken })
    
    const { credentials } = await auth.refreshAccessToken()
    return credentials
  } catch (error) {
    console.error('Token refresh error:', error)
    throw new Error('アクセストークンの更新に失敗しました')
  }
}
