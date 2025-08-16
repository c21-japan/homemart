'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">ホームマート</span>
            </Link>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/properties" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors">
              物件検索
            </Link>
            <Link href="/buy" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors">
              購入
            </Link>
            <Link href="/sell" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors">
              売却
            </Link>
            <Link href="/reform" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors">
              リフォーム
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors">
              お問い合わせ
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors">
              会社概要
            </Link>
          </nav>

          {/* ユーザーメニュー */}
          <div className="hidden md:flex items-center space-x-4">
            <SignedIn>
              <div className="flex items-center space-x-4">
                <Link
                  href="/attendance"
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  勤怠管理
                </Link>
                <Link
                  href="/admin"
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  管理画面
                </Link>
                <UserButton />
              </div>
            </SignedIn>
            <SignedOut>
              <div className="flex items-center space-x-4">
                {/* 社員ログインボタンを非表示 - 一般ユーザーには見られたくない */}
                <Link
                  href="/contact"
                  className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  無料相談
                </Link>
              </div>
            </SignedOut>
          </div>

          {/* モバイルメニューボタン */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-orange-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/properties"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                物件検索
              </Link>
              <Link
                href="/buy"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                購入
              </Link>
              <Link
                href="/sell"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                売却
              </Link>
              <Link
                href="/reform"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                リフォーム
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                お問い合わせ
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                会社概要
              </Link>
              
              {/* モバイル用ユーザーメニュー */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <SignedIn>
                  <div className="space-y-1">
                    <Link
                      href="/attendance"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      勤怠管理
                    </Link>
                    <Link
                      href="/admin"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      管理画面
                    </Link>
                    <div className="px-3 py-2">
                      <UserButton />
                    </div>
                  </div>
                </SignedIn>
                <SignedOut>
                  <div className="space-y-1">
                    {/* 社員ログインボタンを非表示 - 一般ユーザーには見られたくない */}
                    <Link
                      href="/contact"
                      className="block w-full px-3 py-2 text-base font-medium bg-orange-600 text-white hover:bg-orange-700 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      無料相談
                    </Link>
                  </div>
                </SignedOut>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
