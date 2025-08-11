'use client'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4">
              <span className="text-3xl font-bold text-[#FFD700]">C21</span>
              <h1 className="text-xl font-bold">センチュリー21ホームマート</h1>
            </Link>
            <a href="tel:0120438639" className="text-xl font-bold text-[#FF0000]">
              📞 0120-43-8639
            </a>
          </div>
        </div>
      </header>

      {/* メインビジュアル */}
      <div className="bg-gradient-to-r from-[#0000FF] to-[#4169E1] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">会社概要</h1>
          <p className="text-xl">Company Profile</p>
        </div>
      </div>

      {/* 会社情報 */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-8 text-[#36454F]">企業情報</h2>
          
          <table className="w-full">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-4 px-4 bg-[#F5F5DC] font-bold w-1/3">会社名</td>
                <td className="py-4 px-4">株式会社ホームマート</td>
              </tr>
              <tr>
                <td className="py-4 px-4 bg-[#F5F5DC] font-bold">ブランド名</td>
                <td className="py-4 px-4">センチュリー21ホームマート</td>
              </tr>
              <tr>
                <td className="py-4 px-4 bg-[#F5F5DC] font-bold">代表取締役</td>
                <td className="py-4 px-4">乾 佑企（いぬい ゆうき）</td>
              </tr>
              <tr>
                <td className="py-4 px-4 bg-[#F5F5DC] font-bold">設立</td>
                <td className="py-4 px-4">
                  2014年6月19日（個人事業創業）<br />
                  2024年5月7日（法人設立）
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 bg-[#F5F5DC] font-bold">所在地</td>
                <td className="py-4 px-4">
                  〒635-0821<br />
                  奈良県北葛城郡広陵町笠287-1<br />
                  <span className="text-sm text-[#FF0000]">※2025年3月移転</span>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 bg-[#F5F5DC] font-bold">連絡先</td>
                <td className="py-4 px-4">
                  フリーダイヤル：0120-43-8639<br />
                  代表番号：050-7117-7107<br />
                  FAX：050-3183-9576
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 bg-[#F5F5DC] font-bold">営業時間</td>
                <td className="py-4 px-4">
                  平日：9:00〜18:00<br />
                  土日祝：10:00〜17:00<br />
                  お客様専用ダイヤル：9:00〜22:00
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 bg-[#F5F5DC] font-bold">定休日</td>
                <td className="py-4 px-4">水曜日</td>
              </tr>
              <tr>
                <td className="py-4 px-4 bg-[#F5F5DC] font-bold">事業内容</td>
                <td className="py-4 px-4">
                  • 不動産売買仲介業<br />
                  • 不動産買取再販<br />
                  • リフォーム設計・施工<br />
                  • スマートホーム提案・施工
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 bg-[#F5F5DC] font-bold">加盟団体</td>
                <td className="py-4 px-4">
                  • センチュリー21（伊藤忠グループ）<br />
                  • 奈良県宅建協会会員
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 bg-[#F5F5DC] font-bold">取引実績</td>
                <td className="py-4 px-4">年間約25,000件</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 沿革 */}
      <div className="bg-[#F5F5DC] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#36454F]">沿革</h2>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-24 flex-shrink-0">
                  <span className="font-bold text-[#FFD700]">2013年9月</span>
                </div>
                <div className="flex-1">
                  <p>乾佑企、20歳で不動産業界へ</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-24 flex-shrink-0">
                  <span className="font-bold text-[#FFD700]">2014年6月</span>
                </div>
                <div className="flex-1">
                  <p>個人事業として「ホームマート」創業</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-24 flex-shrink-0">
                  <span className="font-bold text-[#FFD700]">2022年5月</span>
                </div>
                <div className="flex-1">
                  <p>代表・乾佑企が結婚</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-24 flex-shrink-0">
                  <span className="font-bold text-[#FFD700]">2022年9月</span>
                </div>
                <div className="flex-1">
                  <p>分譲マンション風モデルルームオープン（159.8㎡）</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-24 flex-shrink-0">
                  <span className="font-bold text-[#FFD700]">2024年5月</span>
                </div>
                <div className="flex-1">
                  <p>株式会社ホームマート設立</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-24 flex-shrink-0">
                  <span className="font-bold text-[#FFD700]">2025年3月</span>
                </div>
                <div className="flex-1">
                  <p>センチュリー21広陵店グランドオープン（予定）</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ビジョン */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#36454F]">ビジョン・目標</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#FFD700] bg-opacity-10 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-[#36454F]">2030年ビジョン</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-[#FFD700] mr-2">●</span>
                  <span>年商100億円の達成</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#FFD700] mr-2">●</span>
                  <span>M&Aによる10億円以上での売却目標</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#FFD700] mr-2">●</span>
                  <span>奈良・大阪No.1の不動産会社へ</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-[#36454F] bg-opacity-10 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-[#36454F]">経営戦略</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-[#36454F] mr-2">●</span>
                  <span>ポスティングを主軸とした集客</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#36454F] mr-2">●</span>
                  <span>自社リフォームによる高収益型買取再販</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#36454F] mr-2">●</span>
                  <span>AI・IT技術の積極活用</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* アクセス */}
      <div className="bg-[#F5F5DC] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#36454F]">アクセス</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4 text-[#FFD700]">本店（2025年3月〜）</h3>
              <p className="mb-4">
                〒635-0821<br />
                奈良県北葛城郡広陵町笠287-1
              </p>
              <div className="bg-gray-200 h-48 rounded flex items-center justify-center">
                <span className="text-gray-500">地図</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4 text-[#FFD700]">リフォーム施工専門部署</h3>
              <p className="mb-4">
                〒635-0813<br />
                奈良県北葛城郡広陵町百済1700-1
              </p>
              <div className="bg-gray-200 h-48 rounded flex items-center justify-center">
                <span className="text-gray-500">地図</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-[#36454F] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Link href="/" className="text-[#FFD700] hover:underline">
            トップページに戻る
          </Link>
          <p className="mt-4 text-sm">© 2024 CENTURY21 HOMEMART. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}