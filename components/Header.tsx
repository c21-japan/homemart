'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              株式会社ホームマート
            </Link>
          </div>

          {/* デスクトップメニュー */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              ホーム
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-gray-900">
              サービス
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900">
              会社概要
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-gray-900">
              お問い合わせ
            </Link>
            <Link href="/recruit" className="text-gray-700 hover:text-gray-900">
              採用情報
            </Link>
          </nav>

          {/* モバイルメニューボタン */}
          <div className="md:hidden">
            <button
              className="p-2 text-gray-700 hover:text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900"
              >
                ホーム
              </Link>
              <Link
                href="/services"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900"
              >
                サービス
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900"
              >
                会社概要
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900"
              >
                お問い合わせ
              </Link>
              <Link
                href="/recruit"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900"
              >
                採用情報
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
