'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // ログイン処理（APIエンドポイントを使用）
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // これがないとページがリロードされる！
    
    console.log('=== ログイン処理開始 ===')
    console.log('フォームデータ:', { email, password })
    console.log('入力値の長さ:', { emailLength: email.length, passwordLength: password.length })
    console.log('入力値の型:', { emailType: typeof email, passwordType: typeof password })
    
    setError('')
    setLoading(true)
    
    try {
      // APIエンドポイントにPOSTリクエストを送信
      console.log('APIエンドポイントにリクエスト送信中...')
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('APIレスポンス:', data);

      if (response.ok && data.success) {
        console.log('✅ 認証成功:', data.user.name, `(${data.user.role})`)
        
        // LocalStorageに保存
        localStorage.setItem('isAdmin', 'true')
        localStorage.setItem('adminName', data.user.name)
        localStorage.setItem('userRole', data.user.role)
        localStorage.setItem('userPermissions', JSON.stringify(data.user.permissions))
        console.log('localStorage保存完了')
        
        // 管理画面へ遷移
        console.log('管理画面へリダイレクト中...')
        window.location.href = '/admin'
      } else {
        console.log('❌ 認証失敗:', data.error)
        setError(data.error || 'ログインに失敗しました')
      }
    } catch (err) {
      console.error('🚨 ネットワークエラーが発生:', err)
      setError('ネットワークエラーが発生しました。インターネット接続を確認してください。')
    } finally {
      setLoading(false)
      console.log('=== ログイン処理終了 ===')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="text-4xl font-bold text-blue-600">C21</div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">センチュリー21 広陵店</h1>
            <h2 className="text-lg text-gray-600 mt-2">管理画面ログイン</h2>
          </div>
          
          {/* 重要：onSubmitを必ず設定！ */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="例: y-inui@century21.group"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? '隠す' : '表示'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-semibold text-sm mb-2">テスト用アカウント:</p>
            <div className="space-y-1 text-xs">
              <p>オーナー: y-inui@century21.group / Inui2024!</p>
              <p>管理者: m-yasuda@century21.group / Yasuda2024!</p>
              <p>スタッフ: info@century21.group / Yamao2024!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
