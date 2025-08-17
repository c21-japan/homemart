'use client'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* メインビジュアル */}
      <div className="bg-gradient-to-br from-[#121212] to-[#252526] text-white py-28 relative overflow-hidden">
        <div className="absolute top-0 right-[-20%] w-[60%] h-full bg-gradient-to-br from-transparent to-[rgba(190,175,135,0.1)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="text-sm font-medium text-[#BEAF87] uppercase tracking-widest mb-6 font-['Barlow_Semi_Condensed']">
            ABOUT HOMEMART
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight font-['Poppins']">
            会社概要
          </h1>
          <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
            お客様の悩みや不安を解決し、人生の転機を支える存在でありたい。<br />
            この理念のもと、地域密着×全国ネットワークで最高のサービスを提供しています。
          </p>
        </div>
      </div>

      {/* 会社情報 */}
      <div className="max-w-7xl mx-auto px-6 py-28">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#121212] font-['Poppins']">企業情報</h2>
          <div className="w-20 h-0.5 bg-[#BEAF87] mx-auto mb-6"></div>
          <p className="text-lg text-[#727273] max-w-2xl mx-auto">
            信頼と実績を積み重ねてきたホームマートの企業情報をご紹介いたします
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-6 px-8 bg-[#F8F7F2] font-semibold w-1/3 text-[#121212]">会社名</td>
                  <td className="py-6 px-8">株式会社ホームマート</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-6 px-8 bg-[#F8F7F2] font-semibold text-[#121212]">ブランド名</td>
                  <td className="py-6 px-8">センチュリー21ホームマート</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-6 px-8 bg-[#F8F7F2] font-semibold text-[#121212]">代表取締役</td>
                  <td className="py-6 px-8">乾 佑企（いぬい ゆうき）</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-6 px-8 bg-[#F8F7F2] font-semibold text-[#121212]">設立</td>
                  <td className="py-6 px-8">
                    2014年6月19日（個人事業創業）<br />
                    2025年5月7日（法人設立）
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-6 px-8 bg-[#F8F7F2] font-semibold text-[#121212]">所在地</td>
                  <td className="py-6 px-8">
                    〒635-0821<br />
                    奈良県北葛城郡広陵町笠287-1<br />
                    <span className="text-sm text-red-600 font-medium">※2025年3月移転</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-6 px-8 bg-[#F8F7F2] font-semibold text-[#121212]">連絡先</td>
                  <td className="py-6 px-8">
                    フリーダイヤル：0120-43-8639<br />
                    代表番号：050-7117-7107<br />
                    FAX：050-3183-9576
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-6 px-8 bg-[#F8F7F2] font-semibold text-[#121212]">営業時間</td>
                  <td className="py-6 px-8">
                    平日：9:00〜18:00<br />
                    土日祝：10:00〜17:00<br />
                    お客様専用ダイヤル：9:00〜22:00
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-6 px-8 bg-[#F8F7F2] font-semibold text-[#121212]">定休日</td>
                  <td className="py-6 px-8">水曜日</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-6 px-8 bg-[#F8F7F2] font-semibold text-[#121212]">事業内容</td>
                  <td className="py-6 px-8">
                    • 不動産売買仲介業<br />
                    • 不動産買取再販<br />
                    • リフォーム設計・施工<br />
                    • スマートホーム提案・施工
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-6 px-8 bg-[#F8F7F2] font-semibold text-[#121212]">加盟団体</td>
                  <td className="py-6 px-8">
                    • センチュリー21（伊藤忠グループ）<br />
                    • 奈良県宅建協会会員
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-6 px-8 bg-[#F8F7F2] font-semibold text-[#121212]">取引実績</td>
                  <td className="py-6 px-8">年間約25,000件</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 沿革 */}
      <div className="bg-[#F4F4F6] py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#121212] font-['Poppins']">沿革</h2>
            <div className="w-20 h-0.5 bg-[#BEAF87] mx-auto mb-6"></div>
            <p className="text-lg text-[#727273] max-w-2xl mx-auto">
              ホームマートの歩みと成長の歴史をご紹介いたします
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="space-y-8">
              <div className="flex gap-8 items-start">
                <div className="w-28 flex-shrink-0">
                  <span className="font-bold text-[#BEAF87] text-lg">2013年9月</span>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-lg">乾佑企、20歳で不動産業界へ</p>
                </div>
              </div>
              
              <div className="flex gap-8 items-start">
                <div className="w-28 flex-shrink-0">
                  <span className="font-bold text-[#BEAF87] text-lg">2014年6月</span>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-lg">個人事業として「ホームマート」創業</p>
                </div>
              </div>
              
              <div className="flex gap-8 items-start">
                <div className="w-28 flex-shrink-0">
                  <span className="font-bold text-[#BEAF87] text-lg">2022年5月</span>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-lg">代表・乾佑企が結婚</p>
                </div>
              </div>
              
              <div className="flex gap-8 items-start">
                <div className="w-28 flex-shrink-0">
                  <span className="font-bold text-[#BEAF87] text-lg">2022年9月</span>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-lg">分譲マンション風モデルルームオープン（159.8㎡）</p>
                </div>
              </div>
              
              <div className="flex gap-8 items-start">
                <div className="w-28 flex-shrink-0">
                  <span className="font-bold text-[#BEAF87] text-lg">2025年5月</span>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-lg">株式会社ホームマート設立</p>
                </div>
              </div>
              
              <div className="flex gap-8 items-start">
                <div className="w-28 flex-shrink-0">
                  <span className="font-bold text-[#BEAF87] text-lg">2025年3月</span>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-lg">センチュリー21広陵店グランドオープン（予定）</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ビジョン */}
      <div className="max-w-7xl mx-auto px-6 py-28">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#121212] font-['Poppins']">ビジョン・目標</h2>
          <div className="w-20 h-0.5 bg-[#BEAF87] mx-auto mb-6"></div>
          <p className="text-lg text-[#727273] max-w-2xl mx-auto">
            未来を見据えた明確な目標と戦略で、お客様により良いサービスを提供します
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#F8F7F2] rounded-2xl p-8 border border-[#BEAF87]/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <h3 className="text-2xl font-bold mb-6 text-[#121212] font-['Poppins']">2030年ビジョン</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-[#BEAF87] mr-3 text-xl">●</span>
                <span className="text-lg">年商100億円の達成</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#BEAF87] mr-3 text-xl">●</span>
                <span className="text-lg">M&Aによる10億円以上での売却目標</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#BEAF87] mr-3 text-xl">●</span>
                <span className="text-lg">奈良・大阪No.1の不動産会社へ</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-[#F4F4F6] rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <h3 className="text-2xl font-bold mb-6 text-[#121212] font-['Poppins']">経営戦略</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-[#121212] mr-3 text-xl">●</span>
                <span className="text-lg">ポスティングを主軸とした集客</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#121212] mr-3 text-xl">●</span>
                <span className="text-lg">自社リフォームによる高収益型買取再販</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#121212] mr-3 text-xl">●</span>
                <span className="text-lg">AI・IT技術の積極活用</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* アクセス */}
      <div className="bg-[#F4F4F6] py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#121212] font-['Poppins']">アクセス</h2>
            <div className="w-20 h-0.5 bg-[#BEAF87] mx-auto mb-6"></div>
            <p className="text-lg text-[#727273] max-w-2xl mx-auto">
              お客様に便利な立地でサービスを提供しています
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <h3 className="font-bold text-xl mb-6 text-[#BEAF87]">本店（2025年3月〜）</h3>
              <p className="mb-6 text-lg">
                〒635-0821<br />
                奈良県北葛城郡広陵町笠287-1
              </p>
              <div className="bg-gray-200 h-48 rounded-xl flex items-center justify-center">
                <span className="text-gray-500">地図</span>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <h3 className="font-bold text-xl mb-6 text-[#BEAF87]">リフォーム施工専門部署</h3>
              <p className="mb-6 text-lg">
                〒635-0813<br />
                奈良県北葛城郡広陵町百済1700-1
              </p>
              <div className="bg-gray-200 h-48 rounded-xl flex items-center justify-center">
                <span className="text-gray-500">地図</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* お問い合わせCTA */}
      <div className="bg-gradient-to-br from-[#121212] to-[#252526] py-28">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white font-['Poppins']">お気軽にご相談ください</h2>
          <div className="w-20 h-0.5 bg-[#BEAF87] mx-auto mb-6"></div>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
            不動産のプロが親身になってお応えします
          </p>
          
          <div className="flex gap-6 justify-center flex-wrap">
            <a href="tel:0120-43-8639" className="inline-flex items-center justify-center px-8 py-4 bg-[#517394] text-white rounded-full transition-all duration-300 hover:bg-[#6E8FAF] hover:-translate-y-1 min-h-12 font-semibold">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              0120-43-8639
            </a>
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border-2 border-[#BEAF87] rounded-full transition-all duration-300 hover:bg-[#BEAF87]/20 hover:-translate-y-1 min-h-12 font-semibold">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              お問い合わせフォーム
            </Link>
          </div>
          
          <p className="mt-8 text-white/80 text-sm">
            営業時間: 9:00〜22:00 | 土日祝も対応
          </p>
        </div>
      </div>

    </div>
  )
}