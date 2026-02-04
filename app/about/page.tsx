'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-[#15130D] text-[#FFF6DE]">
        <div className="absolute -left-12 top-16 h-56 w-56 rounded-full bg-[#F4C84B]/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#E6B62F]/40 blur-3xl" />
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs uppercase tracking-[0.4em] text-[#F4C84B]">Company</p>
          <h1 className="mt-4 text-4xl font-display md:text-5xl">会社概要</h1>
          <p className="mt-6 max-w-2xl text-sm text-[#F6EBD2]/80">
            ホームマートは奈良・大阪エリアに根差した不動産パートナーとして、
            住まいの意思決定を“資産設計”に変えるための提案を行います。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-[#EAD8A6] bg-white p-8 shadow-[0_18px_40px_rgba(21,19,13,0.08)]">
            <h2 className="text-2xl font-display">ビジョン</h2>
            <p className="mt-4 text-sm text-[#5B4E37]">
              地域の住環境を守り、次世代に価値ある資産として引き継げる住まいを増やすこと。
              お客様一人ひとりの暮らし方に寄り添い、情報と戦略を丁寧に届けます。
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { title: '地元密着', body: '奈良・大阪の情報網を深く把握し、適切な選択肢を提案。' },
                { title: '資産設計', body: '購入後の価値や出口戦略までを視野に入れる。' },
                { title: '一貫支援', body: '購入・売却・リフォームまで専任チームで対応。' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-[#EAD8A6] bg-[#FFF6DE]/60 p-4">
                  <h3 className="text-lg font-display text-[#15130D]">{item.title}</h3>
                  <p className="mt-2 text-xs text-[#6B5B33]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#EAD8A6] bg-[#FFF6DE] p-8">
            <h2 className="text-xl font-display">会社情報</h2>
            <dl className="mt-6 space-y-4 text-sm text-[#4A402B]">
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-[#8C7A4C]">会社名</dt>
                <dd className="mt-1 text-base text-[#15130D]">株式会社ホームマート</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-[#8C7A4C]">所在地</dt>
                <dd className="mt-1">奈良県北葛城郡広陵町笠287-1</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-[#8C7A4C]">TEL</dt>
                <dd className="mt-1">0120-43-8639</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-[#8C7A4C]">事業内容</dt>
                <dd className="mt-1">不動産売買・仲介 / リフォーム / 収益物件コンサル</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-[#8C7A4C]">加盟</dt>
                <dd className="mt-1">CENTURY 21</dd>
              </div>
            </dl>
            <Link
              href="/contact"
              className="mt-8 inline-flex rounded-full bg-[#15130D] px-6 py-3 text-sm font-semibold text-[#F4C84B] transition hover:bg-[#2A2418]"
            >
              相談予約へ
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-[#15130D] px-8 py-10 text-[#FFF6DE] shadow-[0_40px_80px_rgba(21,19,13,0.25)]">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#F4C84B]">Contact</p>
              <h2 className="mt-2 text-2xl font-display">住まいの意思決定を、もっと戦略的に。</h2>
              <p className="mt-3 text-sm text-[#F6EBD2]/80">
                物件探し・売却・相続など、状況を教えてください。専門スタッフが整理します。
              </p>
            </div>
            <Link
              href="/contact"
              className="rounded-full bg-[#F4C84B] px-6 py-3 text-sm font-semibold text-[#15130D] shadow-[0_16px_30px_rgba(244,200,75,0.35)] transition hover:-translate-y-0.5 hover:bg-[#E6B62F]"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
