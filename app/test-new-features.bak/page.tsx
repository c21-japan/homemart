'use client'

import Link from 'next/link'

export default function TestNewFeaturesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          新機能テストページ
        </h1>
        <p className="text-gray-600">
          新しく追加された機能のテスト用ページです
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* チーム成績管理 */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🏆 チーム成績管理
          </h2>
          <p className="text-gray-600 mb-4">
            店舗・チーム・個人の成績を管理し、切磋琢磨を促進するシステム
          </p>
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-yellow-800">
                1
              </div>
              <div className="flex-1">
                <div className="font-medium">奈良県店舗</div>
                <div className="text-sm text-gray-600">達成率: 84%</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">
                2
              </div>
              <div className="flex-1">
                <div className="font-medium">南大阪店舗</div>
                <div className="text-sm text-gray-600">達成率: 80%</div>
              </div>
            </div>
          </div>
          <Link
            href="/admin/team-performance"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            詳細を見る
          </Link>
        </div>

        {/* リフォーム職人管理 */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            👷 リフォーム職人管理
          </h2>
          <p className="text-gray-600 mb-4">
            職人のモチベーション向上と品質向上を図る管理システム
          </p>
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-yellow-800">
                1
              </div>
              <div className="flex-1">
                <div className="font-medium">田中大工</div>
                <div className="text-sm text-gray-600">インセンティブ: 120万円</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">
                2
              </div>
              <div className="flex-1">
                <div className="font-medium">佐藤電気</div>
                <div className="text-sm text-gray-600">インセンティブ: 85万円</div>
              </div>
            </div>
          </div>
          <Link
            href="/admin/reform-workers"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            詳細を見る
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">🚀 新機能の特徴</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">毎日更新</div>
            <div className="text-sm">朝8時に自動更新</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">ランキング</div>
            <div className="text-sm">店舗・チーム・個人</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">インセンティブ</div>
            <div className="text-sm">納期短縮で収入アップ</div>
          </div>
        </div>
      </div>
    </div>
  )
}
