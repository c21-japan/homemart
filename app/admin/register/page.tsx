'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    department: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // バリデーション
    if (!formData.email.endsWith('@century21.group')) {
      setError('センチュリー21のメールアドレスを使用してください')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('パスワードは8文字以上で設定してください')
      setLoading(false)
      return
    }

    try {
      // Supabaseに登録申請を保存
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          department: formData.department
        })
      })

      if (response.ok) {
        setSuccess(true)
        
        // 管理者にメール通知（実装予定）
        await fetch('/api/notifications/new-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name
          })
        })
        
        setTimeout(() => {
          router.push('/admin')
        }, 3000)
      } else {
        setError('登録に失敗しました。もう一度お試しください。')
      }
    } catch (err) {
      setError('エラーが発生しました')
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">登録申請完了</h2>
              <p className="text-gray-600 mb-4">
                管理者の承認をお待ちください。<br />
                承認後、メールで通知いたします。
              </p>
              <p className="text-sm text-gray-500">
                3秒後にログイン画面に戻ります...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="text-4xl font-bold text-blue-600">C21</div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">新規アカウント登録</h1>
            <p className="text-sm text-gray-600 mt-2">
              センチュリー21広陵店 管理画面
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="例: 山田太郎"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="例: t-yamada@century21.group"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                @century21.groupのメールアドレスのみ登録可能
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                部署・役職
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                placeholder="例: 営業部"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="8文字以上で設定"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード（確認） <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="もう一度パスワードを入力"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? '登録中...' : '登録申請'}
            </button>
            
            <Link
              href="/admin"
              className="block w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              管理画面に戻る
            </Link>
          </form>
        </div>
        
        <div className="text-center mt-4 text-sm text-gray-600">
          © 2024 株式会社ホームマート・センチュリー21広陵店
        </div>
      </div>
    </div>
  )
}
