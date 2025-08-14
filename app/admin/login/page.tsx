'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // ローカル認証（Supabase不要）
    const validUsers = [
      { email: 'y-inui@century21.group', password: 'Inui2024!', name: '乾佑企', role: 'owner' },
      { email: 'm-yasuda@century21.group', password: 'Yasuda2024!', name: '安田実加', role: 'admin' },
      { email: 'info@century21.group', password: 'Yamao2024!', name: '山尾妃奈', role: 'staff' },
    ]
    
    const user = validUsers.find(u => u.email === email && u.password === password)
    
    if (user) {
      // LocalStorageに保存
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('userEmail', user.email)
        localStorage.setItem('userName', user.name)
        localStorage.setItem('userRole', user.role)
      }
      
      // 管理画面へ
      router.push('/admin')
    } else {
      setError('メールアドレスまたはパスワードが正しくありません')
      setTimeout(() => setError(''), 3000)
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
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="例: y-inui@century21.group"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              ログイン
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
            <p className="font-semibold mb-2">アカウント情報:</p>
            <div className="space-y-1">
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
