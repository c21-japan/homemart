import Link from 'next/link'

export default async function ForbiddenPage({
  searchParams
}: {
  searchParams: Promise<{ feature?: string; permission?: string }>
}) {
  const params = await searchParams
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-lg">
        <h1 className="text-2xl font-bold text-red-600 mb-4">アクセス拒否</h1>
        <p className="text-gray-600 mb-4">このページを閲覧する権限がありません。</p>
        {(params.feature || params.permission) && (
          <div className="text-sm text-gray-500 mb-6">
            必要権限: {params.feature} / {params.permission}
          </div>
        )}
        <div className="flex items-center justify-center gap-4">
          <Link href="/admin" className="text-orange-600 hover:text-orange-700 font-medium">
            管理画面に戻る
          </Link>
          <Link href="/admin/logout" className="text-gray-600 hover:text-gray-700 font-medium">
            ログアウト
          </Link>
        </div>
      </div>
    </div>
  )
}
