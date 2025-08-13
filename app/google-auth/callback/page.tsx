'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function GoogleAuthCallback() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      // エラーが発生した場合
      window.opener?.postMessage(
        { type: 'GOOGLE_AUTH_ERROR', error },
        window.location.origin
      )
      window.close()
      return
    }

    if (code) {
      // 認証コードを取得した場合、トークンを交換
      exchangeCodeForTokens(code)
    }
  }, [searchParams])

  const exchangeCodeForTokens = async (code: string) => {
    try {
      const response = await fetch('/api/google/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        throw new Error('トークンの取得に失敗しました')
      }

      const tokens = await response.json()

      // 親ウィンドウに成功メッセージを送信
      window.opener?.postMessage(
        { type: 'GOOGLE_AUTH_SUCCESS', tokens },
        window.location.origin
      )

      // ウィンドウを閉じる
      window.close()
    } catch (err) {
      console.error('Token exchange error:', err)
      
      // 親ウィンドウにエラーメッセージを送信
      window.opener?.postMessage(
        { 
          type: 'GOOGLE_AUTH_ERROR', 
          error: err instanceof Error ? err.message : 'トークンの取得に失敗しました' 
        },
        window.location.origin
      )
      
      window.close()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            認証中...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Googleアカウントへの認証を完了しています
          </p>
        </div>
      </div>
    </div>
  )
}
