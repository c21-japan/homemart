'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function MemberLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // 社員アカウントの特別処理
      if (email.includes('@century21.group')) {
        console.log('社員ログイン試行:', email)
        
        // 社員用の認証（ハードコード）
        if (email === 'y-inui@century21.group' && password === 'Inui2024!') {
          setMessage('社員ログインに成功しました。管理画面にリダイレクトしています...')
          localStorage.setItem('isAdmin', 'true')
          localStorage.setItem('adminName', '乾佑企')
          localStorage.setItem('userRole', 'owner')
          localStorage.setItem('userPermissions', JSON.stringify(['all']))
          setTimeout(() => {
            router.push('/admin')
          }, 1000)
          return
        } else if (email === 'm-yasuda@century21.group' && password === 'Yasuda2024!') {
          setMessage('社員ログインに成功しました。管理画面にリダイレクトしています...')
          localStorage.setItem('isAdmin', 'true')
          localStorage.setItem('adminName', '安田実加')
          localStorage.setItem('userRole', 'admin')
          localStorage.setItem('userPermissions', JSON.stringify(['leads', 'customers', 'reports']))
          setTimeout(() => {
            router.push('/admin')
          }, 1000)
          return
        } else if (email === 'info@century21.group' && password === 'Yamao2024!') {
          setMessage('社員ログインに成功しました。管理画面にリダイレクトしています...')
          localStorage.setItem('isAdmin', 'true')
          localStorage.setItem('adminName', '山尾妃奈')
          localStorage.setItem('userRole', 'staff')
          localStorage.setItem('userPermissions', JSON.stringify(['leads']))
          setTimeout(() => {
            router.push('/admin')
          }, 1000)
          return
        } else {
          setError('社員アカウントの認証に失敗しました')
          return
        }
      }

      // 一般会員のログイン処理
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        setMessage('ログインに成功しました。リダイレクトしています...')
        setTimeout(() => {
          router.push('/member')
        }, 1000)
      }
    } catch (error) {
      setError('ログイン中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">ホームマート</h1>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">ログイン</h2>
          <p className="mt-2 text-sm text-gray-600">
            会員ログインまたは社員ログインができます
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{message}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="example@email.com または @century21.group"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="パスワード"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/member/forgot-password" className="font-medium text-orange-600 hover:text-orange-500">
                  パスワードを忘れた方
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </button>

              <Link
                href="/member/register"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '作成中...' : '新規アカウント作成'}
              </Link>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">または</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                ゲストとして物件を探す
              </Link>
            </div>
          </div>

          {/* 社員用アカウント情報 */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-semibold text-sm mb-2 text-blue-800">社員アカウント情報:</p>
            <div className="space-y-1 text-xs text-blue-700">
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
