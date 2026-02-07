'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-20 bg-[#15130D] text-[#FFF6DE]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#F4C84B] text-center text-2xl font-bold leading-[3rem] text-[#15130D]">
                HM
              </div>
              <div>
                <p className="text-xl font-display">ホームマート</p>
                <p className="text-xs tracking-[0.3em] text-[#F4C84B]">CENTURY 21</p>
              </div>
            </div>
            <p className="mt-6 max-w-xl text-sm text-[#F6EBD2]/80">
              奈良・大阪を中心に、住まいの購入・売却・リフォームまでワンストップでご提案。
              地域密着の目線で、暮らしに合う選択肢を丁寧にお届けします。
            </p>
            <div className="mt-6 space-y-2 text-sm text-[#F6EBD2]/80">
              <p>〒635-0834 奈良県北葛城郡広陵町笠287-1</p>
              <p>TEL: 0120-43-8639</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#F4C84B]">サイト</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/properties-new" className="hover:text-[#F4C84B]">新築戸建</Link></li>
              <li><Link href="/properties-used" className="hover:text-[#F4C84B]">中古戸建</Link></li>
              <li><Link href="/properties-land" className="hover:text-[#F4C84B]">土地</Link></li>
              <li><Link href="/properties-mansion" className="hover:text-[#F4C84B]">マンション</Link></li>
              <li><Link href="/properties" className="hover:text-[#F4C84B]">物件検索</Link></li>
              <li><Link href="/sell" className="hover:text-[#F4C84B]">売る</Link></li>
              <li><Link href="/reform" className="hover:text-[#F4C84B]">リフォーム</Link></li>
              <li><Link href="/contact" className="hover:text-[#F4C84B]">お問い合わせ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#F4C84B]">会社情報</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-[#F4C84B]">会社概要</Link></li>
              <li><Link href="/recruit" className="hover:text-[#F4C84B]">採用情報</Link></li>
              <li><Link href="/staff" className="hover:text-[#F4C84B]">スタッフ</Link></li>
              <li><Link href="/reasons" className="hover:text-[#F4C84B]">選ばれる理由</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[#F4C84B]/20 pt-6 text-xs text-[#F6EBD2]/70">
          <p>&copy; {new Date().getFullYear()} HomeMart (Century 21). All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#F4C84B]">プライバシーポリシー</Link>
            <Link href="/terms" className="hover:text-[#F4C84B]">利用規約</Link>
            <Link href="/disclaimer" className="hover:text-[#F4C84B]">免責事項</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
