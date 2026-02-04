import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF6DE]/80 px-6">
      <div className="max-w-md w-full rounded-3xl border border-[#EAD8A6] bg-white p-8 text-center shadow-[0_18px_40px_rgba(21,19,13,0.08)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F4C84B]/30">
          <svg className="h-6 w-6 text-[#15130D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-xl font-display text-[#15130D] mb-2">権限がありません</h1>
        <p className="text-sm text-[#6E5B2E] mb-6">
          このページにアクセスする権限がありません。<br />
          管理者に連絡してください。
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full inline-flex justify-center items-center rounded-full bg-[#15130D] px-4 py-2 text-sm font-semibold text-[#F4C84B] hover:bg-[#2A2418]"
          >
            ホームに戻る
          </Link>
          <Link
            href="/contact"
            className="w-full inline-flex justify-center items-center rounded-full border border-[#EAD8A6] px-4 py-2 text-sm font-semibold text-[#6E5B2E] hover:bg-[#F4C84B] hover:text-[#15130D]"
          >
            お問い合わせ
          </Link>
        </div>
      </div>
    </div>
  );
}
