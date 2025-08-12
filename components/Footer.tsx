import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">センチュリー21 ホームマート</h3>
            <p className="text-sm text-gray-400">
              〒635-0821<br />
              奈良県北葛城郡広陵町笠287-1<br />
              TEL: 0120-43-8639<br />
              FAX: 050-3183-9576
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">サービス</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/properties" className="hover:text-white">物件検索</Link></li>
              <li><Link href="/sell" className="hover:text-white">売却査定</Link></li>
              <li><Link href="/about" className="hover:text-white">会社概要</Link></li>
              <li><Link href="/contact" className="hover:text-white">お問い合わせ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">営業時間</h3>
            <p className="text-sm text-gray-400">
              平日: 9:00〜22:00<br />
              土日祝: 9:00〜22:00<br />
              定休日: なし（年末年始除く）
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2024 CENTURY 21 HomeMart. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
