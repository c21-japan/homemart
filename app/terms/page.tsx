'use client'

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.4em] text-[#8C7A4C]">Terms</p>
      <h1 className="mt-3 text-3xl font-display">利用規約</h1>
      <div className="mt-8 space-y-6 rounded-3xl border border-[#EAD8A6] bg-white p-8 text-sm text-[#5B4E37] shadow-[0_18px_40px_rgba(21,19,13,0.08)]">
        <p>本サイトのご利用にあたり、以下の条件に同意いただいたものとみなします。</p>
        <div>
          <h2 className="text-lg font-display text-[#15130D]">1. 掲載情報について</h2>
          <p className="mt-2">物件情報は最新性に努めますが、状況により変更・成約済みの場合があります。</p>
        </div>
        <div>
          <h2 className="text-lg font-display text-[#15130D]">2. 免責</h2>
          <p className="mt-2">当社は本サイトの利用による損害について一切の責任を負いません。</p>
        </div>
        <div>
          <h2 className="text-lg font-display text-[#15130D]">3. 禁止事項</h2>
          <p className="mt-2">不正アクセス、営業妨害、情報の不正取得などの行為を禁止します。</p>
        </div>
      </div>
    </div>
  )
}
