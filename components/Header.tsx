'use client'

import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-30">
      <div className="bg-[#15130D] text-[#FFF6DE]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 text-xs tracking-[0.3em] uppercase">
          <span>Century 21 HomeMart</span>
          <span className="text-[#F4C84B]">Nara • Osaka</span>
        </div>
      </div>
      <div className="border-b border-[#EAD8A6]/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="text-2xl font-display font-semibold text-[#15130D]">ホームマート</span>
            <span className="text-xs tracking-[0.35em] text-[#7C6A3F]">REAL ESTATE</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden text-sm text-[#514737] md:block">
              TEL <span className="font-semibold text-[#15130D]">0120-43-8639</span>
            </div>
            <Link
              href="/contact"
              className="rounded-full bg-[#F4C84B] px-5 py-2 text-sm font-semibold text-[#15130D] shadow-[0_10px_24px_rgba(244,200,75,0.45)] transition hover:-translate-y-0.5 hover:bg-[#E6B62F]"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
