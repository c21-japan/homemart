import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">ページが見つかりません</h1>
        <p className="text-gray-600 mb-6">お探しのページは存在しないか、移動された可能性があります</p>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition-colors font-medium"
          >
            ホームに戻る
          </Link>
          
          <Link
            href="/contact"
            className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            お問い合わせ
          </Link>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>エラーコード: 404</p>
          <p>ページが見つかりませんでした</p>
        </div>
      </div>
    </div>
  )
}
