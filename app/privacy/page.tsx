'use client'

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.4em] text-[#8C7A4C]">Privacy</p>
      <h1 className="mt-3 text-3xl font-display">プライバシーポリシー</h1>
      <div className="mt-8 space-y-6 rounded-3xl border border-[#EAD8A6] bg-white p-8 text-sm text-[#5B4E37] shadow-[0_18px_40px_rgba(21,19,13,0.08)]">
        <p>
          株式会社ホームマート（以下「当社」）は、個人情報の重要性を認識し、
          以下の方針に基づき適切な保護と管理に努めます。
        </p>
        <div>
          <h2 className="text-lg font-display text-[#15130D]">1. 取得する情報</h2>
          <p className="mt-2">お問い合わせ・資料請求などで提供いただく氏名、連絡先、相談内容等。</p>
        </div>
        <div>
          <h2 className="text-lg font-display text-[#15130D]">2. 利用目的</h2>
          <p className="mt-2">ご相談対応、物件情報の提供、サービス改善に利用します。</p>
        </div>
        <div>
          <h2 className="text-lg font-display text-[#15130D]">3. 第三者提供</h2>
          <p className="mt-2">法令に基づく場合を除き、本人同意なく第三者に提供しません。</p>
        </div>
        <div>
          <h2 className="text-lg font-display text-[#15130D]">4. お問い合わせ</h2>
          <p className="mt-2">個人情報の開示・訂正・削除は当社窓口までご連絡ください。</p>
        </div>
      </div>
    </div>
  )
}
