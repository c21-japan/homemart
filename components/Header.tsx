import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b-4 border-[#FFD700]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] p-3 rounded-lg shadow-lg">
              <span className="text-black font-bold text-2xl">C21</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">ホームマート</h1>
              <p className="text-xs text-gray-600">センチュリー21加盟店 | 奈良県北葛城郡</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-6">
              <Link href="/properties" className="text-gray-700 hover:text-[#FFD700] font-medium transition">
                物件検索
              </Link>
              <Link href="/sell" className="text-gray-700 hover:text-[#FFD700] font-medium transition">
                売却査定
              </Link>
              <Link href="/reform" className="text-gray-700 hover:text-[#FFD700] font-medium transition">
                リフォーム
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-[#FFD700] font-medium transition">
                会社案内
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-[#FFD700] font-medium transition">
                お問い合わせ
              </Link>
            </nav>
            <div className="border-l pl-6">
              <p className="text-xs text-gray-600">お電話でのお問い合わせ</p>
              <a href="tel:0120-43-8639" className="text-2xl font-bold text-[#FF6B00] hover:text-[#FF8C00] transition">
                📞 0120-43-8639
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
