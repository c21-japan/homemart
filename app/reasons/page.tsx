'use client'
import Link from 'next/link'

export default function ReasonsPage() {
  const reasons = [
    {
      number: '01',
      title: 'CENTURY21の安心感',
      description: '世界68の国と地域、8,400店舗、全国964店舗のネットワーク',
      icon: '🌍'
    },
    {
      number: '02',
      title: '三位一体型サービス',
      description: '売買・リフォーム・買取再販を一貫して提供',
      icon: '🔄'
    },
    {
      number: '03',
      title: '自社職人による施工',
      description: '高品質なリフォームを適正価格で提供',
      icon: '🔨'
    },
    {
      number: '04',
      title: '地域密着10年以上',
      description: '2014年創業、奈良・大阪の地域ネットワーク',
      icon: '🏘️'
    },
    {
      number: '05',
      title: '年間25,000件の実績',
      description: '豊富な取引実績による確かな経験',
      icon: '📊'
    },
    {
      number: '06',
      title: 'URICO制度',
      description: '買取再販で利益の80%をお客様に還元',
      icon: '💰'
    },
    {
      number: '07',
      title: 'スマートホーム対応',
      description: 'IoT機器連携による最新の住環境提案',
      icon: '🏠'
    },
    {
      number: '08',
      title: '22時まで対応',
      description: 'お客様専用ダイヤルで夜遅くまで相談可能',
      icon: '📞'
    },
    {
      number: '09',
      title: 'モデルルーム見学',
      description: '159.8㎡の分譲マンション風モデルルーム',
      icon: '🏢'
    },
    {
      number: '10',
      title: '若い経営者の情熱',
      description: '20歳で創業、お客様の人生の転機を支える',
      icon: '🔥'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">


      {/* メインビジュアル */}
      <div className="bg-[#36454F] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">選ばれる10の理由</h1>
          <p className="text-xl">なぜセンチュリー21ホームマートが選ばれるのか</p>
        </div>
      </div>

      {/* 免責事項 */}
      <div className="bg-[#F5F5DC] py-4">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs text-gray-600">
            ※店舗数No.1表記について：売買・賃貸の両方を取り扱う不動産仲介フランチャイズ業としての全国における店舗数（2024年7月時点／東京商工リサーチ調べ）
          </p>
        </div>
      </div>

      {/* 10の理由 */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {reasons.map((reason) => (
            <div key={reason.number} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-[#FFD700] text-[#36454F] rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-xl">{reason.number}</span>
                </div>
                <div className="flex-1">
                  <div className="text-3xl mb-2">{reason.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-[#36454F]">{reason.title}</h3>
                  <p className="text-gray-600">{reason.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 特別セクション */}
      <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#36454F]">
            Global Group #1 CENTURY21の安心感
          </h2>
          <p className="text-lg mb-8 text-[#36454F]">
            世界最大級の不動産ネットワークと地域密着サービスの融合
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6">
              <p className="text-4xl font-bold text-[#FFD700] mb-2">68</p>
              <p className="text-sm">国と地域</p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <p className="text-4xl font-bold text-[#FFD700] mb-2">8,400</p>
              <p className="text-sm">世界の店舗数</p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <p className="text-4xl font-bold text-[#FFD700] mb-2">964</p>
              <p className="text-sm">日本の店舗数</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#36454F]">
            選ばれる理由を実感してください
          </h2>
          <p className="text-lg mb-8 text-gray-600">
            まずはお気軽にご相談ください。違いを体感していただけます。
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a 
              href="tel:0120438639" 
              className="bg-[#FF0000] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors"
            >
              📞 今すぐ相談する
            </a>
            <Link 
              href="/contact" 
              className="bg-[#36454F] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-700 transition-colors"
            >
              来店予約をする
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}