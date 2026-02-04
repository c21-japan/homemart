'use client'

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.4em] text-[#8C7A4C]">Disclaimer</p>
      <h1 className="mt-3 text-3xl font-display">免責事項</h1>
      <div className="mt-8 space-y-6 rounded-3xl border border-[#EAD8A6] bg-white p-8 text-sm text-[#5B4E37] shadow-[0_18px_40px_rgba(21,19,13,0.08)]">
        <p>当社は本サイトに掲載する情報の正確性に十分配慮しますが、その内容を保証するものではありません。</p>
        <div>
          <h2 className="text-lg font-display text-[#15130D]">情報の更新</h2>
          <p className="mt-2">予告なく情報を変更・削除する場合があります。</p>
        </div>
        <div>
          <h2 className="text-lg font-display text-[#15130D]">外部リンク</h2>
          <p className="mt-2">外部サイトの内容について当社は責任を負いません。</p>
        </div>
      </div>
    </div>
  )
}
