import { useState, useEffect, useCallback } from 'react'

interface GoogleTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

interface UseGoogleAuthReturn {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  tokens: GoogleTokens | null
  authenticate: () => Promise<void>
  logout: () => void
  refreshTokens: () => Promise<void>
}

export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokens, setTokens] = useState<GoogleTokens | null>(null)

  // ローカルストレージからトークンを復元
  useEffect(() => {
    const savedTokens = localStorage.getItem('google-tokens')
    if (savedTokens) {
      try {
        const parsedTokens = JSON.parse(savedTokens)
        const now = Date.now()
        
        if (parsedTokens.expiresIn > now) {
          setTokens(parsedTokens)
          setIsAuthenticated(true)
        } else {
          // トークンが期限切れの場合、リフレッシュを試行
          refreshTokens()
        }
      } catch (err) {
        console.error('Failed to parse saved tokens:', err)
        localStorage.removeItem('google-tokens')
      }
    }
  }, [])

  // 認証プロセスを開始
  const authenticate = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 認証URLを取得
      const response = await fetch('/api/google/auth')
      if (!response.ok) {
        throw new Error('認証URLの取得に失敗しました')
      }

      const { authUrl } = await response.json()

      // ポップアップウィンドウで認証を開始
      const popup = window.open(
        authUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        throw new Error('ポップアップがブロックされました。ポップアップを許可してください。')
      }

      // 認証完了を待機
      const tokens = await new Promise<GoogleTokens>((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            reject(new Error('認証がキャンセルされました'))
          }
        }, 1000)

        // メッセージリスナーを設定
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return

          if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
            clearInterval(checkClosed)
            window.removeEventListener('message', messageListener)
            popup.close()
            resolve(event.data.tokens)
          } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
            clearInterval(checkClosed)
            window.removeEventListener('message', messageListener)
            popup.close()
            reject(new Error(event.data.error))
          }
        }

        window.addEventListener('message', messageListener)
      })

      // トークンを保存
      setTokens(tokens)
      setIsAuthenticated(true)
      localStorage.setItem('google-tokens', JSON.stringify(tokens))

    } catch (err) {
      setError(err instanceof Error ? err.message : '認証に失敗しました')
      console.error('Authentication error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ログアウト
  const logout = useCallback(() => {
    setTokens(null)
    setIsAuthenticated(false)
    localStorage.removeItem('google-tokens')
  }, [])

  // トークンをリフレッシュ
  const refreshTokens = useCallback(async () => {
    if (!tokens?.refreshToken) return

    try {
      const response = await fetch('/api/google/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: tokens.refreshToken,
        }),
      })

      if (!response.ok) {
        throw new Error('トークンの更新に失敗しました')
      }

      const newTokens = await response.json()
      setTokens(newTokens)
      localStorage.setItem('google-tokens', JSON.stringify(newTokens))
    } catch (err) {
      console.error('Token refresh error:', err)
      logout()
    }
  }, [tokens, logout])

  return {
    isAuthenticated,
    isLoading,
    error,
    tokens,
    authenticate,
    logout,
    refreshTokens,
  }
}
