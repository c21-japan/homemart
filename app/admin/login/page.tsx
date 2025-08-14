'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()



  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('パスワード入力:', e.target.value ? '***' : '空')
    setPassword(e.target.value)
  }

  const handleButtonClick = () => {
    console.log('ボタンクリックイベント発火')
    
    // パスワードが入力されているかチェック
    if (!password) {
      setError('パスワードを入力してください')
      return
    }
    
    // ログイン処理を実行
    handleLogin()
  }

  const handleLogin = async () => {
    console.log('ログイン処理開始:', { password: password ? '***' : '空' })
    
    setIsLoading(true)
    setError('')

    try {
      // パスワードをチェック
      if (password === 'homemart2024') {
        console.log('パスワード認証成功')
        
        // 認証成功：セッションストレージに保存
        sessionStorage.setItem('admin-auth', 'authenticated')
        sessionStorage.setItem('admin-timestamp', Date.now().toString())
        
        console.log('認証情報保存完了、管理画面にリダイレクト')
        
        // 管理画面にリダイレクト
        router.push('/admin')
      } else {
        console.log('パスワード認証失敗')
        setError('パスワードが正しくありません')
      }
    } catch (err) {
      console.error('ログイン処理エラー:', err)
      setError('ログイン処理中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('フォーム送信イベント発火')
    handleButtonClick()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ホームマート</h1>
          <h2 className="text-xl font-semibold text-gray-600">管理画面ログイン</h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleFormSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#BEAF87] focus:border-[#BEAF87] sm:text-sm"
                  placeholder="パスワードを入力してください"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                onClick={handleButtonClick}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#BEAF87] hover:bg-[#BEAF87]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BEAF87] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              パスワード: homemart2024
            </p>
          </div>

          {/* デバッグ情報 */}
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
            <p>デバッグ情報:</p>
            <p>パスワード長: {password.length}</p>
            <p>ローディング状態: {isLoading ? 'true' : 'false'}</p>
            <p>エラー: {error || 'なし'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
