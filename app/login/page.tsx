'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // ハードコーディングで一時的にログイン
    if (email === 'inui@homemart.co.jp' && password === 'HomeM@rt2024') {
      localStorage.setItem('token', 'logged-in')
      localStorage.setItem('user', JSON.stringify({
        email: 'inui@homemart.co.jp',
        name: '乾佑企',
        role: 'admin'
      }))
      
      // ダッシュボードへ
      window.location.href = '/dashboard'
    } else {
      setError('メールアドレスまたはパスワードが正しくありません')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            ホームマート管理システム
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="inui@homemart.co.jp"
          />
          
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="HomeM@rt2024"
          />

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ログイン
          </button>
        </form>
        
        <div className="text-center text-sm text-gray-600">
          テスト用：<br/>
          Email: inui@homemart.co.jp<br/>
          Password: HomeM@rt2024
        </div>
      </div>
    </div>
  )
}
