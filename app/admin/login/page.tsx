'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // ハードコードされた認証情報（開発用）
  // 本番環境では環境変数を使用してください
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'homemart2024'
  }

  // デバッグモード（開発環境でのみ有効）
  const DEBUG_MODE = process.env.NODE_ENV === 'development'

  const addDebugInfo = (info: string) => {
    if (DEBUG_MODE) {
      setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
      console.log('[DEBUG]', info)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // エラーをクリア
    if (error) setError('')
  }

  const validateForm = (): boolean => {
    addDebugInfo('フォームバリデーション開始')
    
    if (!formData.username.trim()) {
      setError('ユーザー名を入力してください')
      addDebugInfo('エラー: ユーザー名が空')
      return false
    }
    if (!formData.password) {
      setError('パスワードを入力してください')
      addDebugInfo('エラー: パスワードが空')
      return false
    }
    
    addDebugInfo('バリデーション成功')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    addDebugInfo('ログイン処理開始')
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      addDebugInfo(`入力されたユーザー名: ${formData.username}`)
      addDebugInfo(`パスワード長: ${formData.password.length}文字`)
      
      // 認証チェック（シンプルな比較）
      const isValidUsername = formData.username === ADMIN_CREDENTIALS.username
      const isValidPassword = formData.password === ADMIN_CREDENTIALS.password
      
      addDebugInfo(`ユーザー名チェック: ${isValidUsername ? '成功' : '失敗'}`)
      addDebugInfo(`パスワードチェック: ${isValidPassword ? '成功' : '失敗'}`)
      
      if (isValidUsername && isValidPassword) {
        // 認証成功
        addDebugInfo('認証成功！')
        
        const authData = {
          isAuthenticated: true,
          username: formData.username,
          expires: new Date().getTime() + 86400000, // 24時間後
          loginTime: new Date().toISOString()
        }
        
        // ローカルストレージに保存
        localStorage.setItem('admin-auth', JSON.stringify(authData))
        addDebugInfo('認証情報をローカルストレージに保存')
        
        // 少し待機してからリダイレクト（UX向上のため）
        setTimeout(() => {
          addDebugInfo('ダッシュボードへリダイレクト')
          router.push('/admin')
        }, 500)
      } else {
        // 認証失敗
        addDebugInfo('認証失敗')
        setError('ユーザー名またはパスワードが正しくありません')
        
        // デバッグモードの場合、正しい認証情報をヒントとして表示
        if (DEBUG_MODE) {
          setError(
            `認証失敗（デバッグ情報: ユーザー名 '${ADMIN_CREDENTIALS.username}', パスワード '${ADMIN_CREDENTIALS.password}'）`
          )
        }
      }
    } catch (err) {
      console.error('ログインエラー:', err)
      addDebugInfo(`エラー発生: ${err}`)
      setError('ログイン処理中にエラーが発生しました')
    } finally {
      setLoading(false)
      addDebugInfo('ログイン処理完了')
    }
  }

  // デモログイン（開発用）
  const handleDemoLogin = () => {
    setFormData({
      username: ADMIN_CREDENTIALS.username,
      password: ADMIN_CREDENTIALS.password
    })
    addDebugInfo('デモ認証情報を自動入力')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">管理画面</h1>
            <p className="mt-2 text-gray-600">ログインしてください</p>
            
            {/* 開発環境でのデモログインボタン */}
            {DEBUG_MODE && (
              <button
                type="button"
                onClick={handleDemoLogin}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700 underline"
              >
                デモ認証情報を入力
              </button>
            )}
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* デバッグ情報 */}
          {DEBUG_MODE && debugInfo.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md max-h-32 overflow-y-auto">
              <p className="text-xs font-semibold text-gray-600 mb-1">デバッグ情報:</p>
              {debugInfo.map((info, index) => (
                <p key={index} className="text-xs text-gray-500">{info}</p>
              ))}
            </div>
          )}

          {/* ログインフォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ユーザー名 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                ユーザー名
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ユーザー名を入力"
                autoComplete="username"
                disabled={loading}
              />
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="パスワードを入力"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ログイン中...
                </span>
              ) : (
                'ログイン'
              )}
            </button>
          </form>

          {/* フッター */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              © 2024 株式会社ホームマート
            </p>
            {DEBUG_MODE && (
              <p className="text-xs text-gray-400 mt-2">
                開発モード有効
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
