'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// 管理者のメールアドレスリスト
const ADMIN_EMAILS = [
  'y-inui@century21.group',  // 乾代表
  'm-yasuda@century21.group', // 安田実加
  'info@century21.group',     // 山尾妃奈
  't-toyoda@century21.group', // 豊田
  'm-imadu@century21.group'   // 今津
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        // 未認証の場合はログインページにリダイレクト
        router.push('/member/login')
        return
      }

      if (isSignedIn && user) {
        // 管理者権限チェック
        const userEmail = user.emailAddresses[0]?.emailAddress
        const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail)
        
        if (!isAdmin) {
          // 管理者権限がない場合はトップページにリダイレクト
          router.push('/')
          return
        }
        
        // 管理者権限がある場合はチェック完了
        setIsChecking(false)
      }
    }
  }, [isLoaded, isSignedIn, user, router])

  // ローディング中または権限チェック中
  if (!isLoaded || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証中...</p>
        </div>
      </div>
    )
  }

  // 管理者権限チェック
  const userEmail = user?.emailAddresses[0]?.emailAddress
  const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail)
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">アクセス拒否</h1>
          <p className="text-gray-600 mb-4">このページにアクセスする権限がありません。</p>
          <Link
            href="/"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">
                ホームマート管理画面
              </h1>
              <nav className="flex space-x-4">
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ダッシュボード
                </Link>
                <Link
                  href="/admin/leads"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/leads'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                >
                  リード管理
                </Link>
                <Link
                  href="/admin/properties"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/properties'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                >
                  物件管理
                </Link>
                <Link
                  href="/admin/internal-applications"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/internal-applications'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                >
                  社内申請
                </Link>
                <Link
                  href="/admin/part-time-attendance"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/part-time-attendance'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                >
                  アルバイト勤怠
                </Link>
                <Link
                  href="/admin/users"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/users'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                >
                  ユーザー管理
                </Link>
                <Link
                  href="/admin/documents"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/documents'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                >
                  書類管理
                </Link>
                <Link
                  href="/admin/attendance"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/attendance'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                >
                  勤怠管理
                </Link>
                <Link
                  href="/admin/career-path"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/career-path'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                >
                  キャリアパス管理
                </Link>
                <Link
                  href="/admin/team-performance"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/team-performance'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                >
                  チーム成績管理
                </Link>
                <Link
                  href="/admin/reform-workers"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/reform-workers'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                >
                  リフォーム職人管理
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                ようこそ、{user?.firstName || user?.emailAddresses[0]?.emailAddress}
              </span>
              <SignOutButton>
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                  ログアウト
                </button>
              </SignOutButton>
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
              >
                トップページへ
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="py-8">
        {children}
      </main>
    </div>
  )
}
