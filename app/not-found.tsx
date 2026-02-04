import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF6DE]/80 px-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#EAD8A6] shadow-[0_18px_40px_rgba(21,19,13,0.08)] p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F4C84B]/30">
          <svg className="w-8 h-8 text-[#15130D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-display text-[#15130D] mb-2">ページが見つかりません</h1>
        <p className="text-sm text-[#6E5B2E] mb-6">お探しのページは存在しないか、移動された可能性があります</p>
        <div className="space-y-3">
          <Link className="block w-full rounded-full bg-[#15130D] text-[#F4C84B] px-6 py-3 text-sm font-semibold hover:bg-[#2A2418] transition-colors" href="/">
            ホームに戻る
          </Link>
          <Link className="block w-full rounded-full border border-[#EAD8A6] text-[#6E5B2E] px-6 py-3 text-sm font-semibold hover:bg-[#F4C84B] hover:text-[#15130D] transition-colors" href="/admin/customers">
            顧客管理に戻る
          </Link>
        </div>
        <div className="mt-6 text-xs text-[#9B8856]">
          <p>エラーコード: 404</p>
          <p>ページが見つかりませんでした</p>
        </div>
      </div>
    </div>
  );
}
