'use client'
import Link from 'next/link'

export default function StaffPage() {
  const staffMembers = [
    {
      name: '乾 佑企',
      furigana: 'いぬい ゆうき',
      position: '代表取締役',
      birthYear: '1993年2月24日生まれ',
      message: '2013年9月、20歳で創業して以来、「お客様の悩みや不安を解決し、人生の転機を支える存在でありたい」との強い信念を持ち、不動産・リフォーム事業を通じて地域社会に貢献してまいりました。',
      achievements: [
        '2013年 ホームマートを創業（20歳）',
        '2024年 株式会社ホームマート設立',
        '2025年 センチュリー21広陵店オープン',
        '全日本不動産協会',
        'CENTURY21グループ年間取引実績 約25,000件'
      ]
    },
    {
      name: '安田',
      furigana: 'やすだ',
      position: '全社管理・経理・人事担当',
      birthYear: '',
      message: '会社の管理部門を統括しています。お客様に安心してご利用いただけるよう、社内体制の整備に努めています。',
      achievements: [
        '経理・財務管理',
        '人事・労務管理',
        '社内システム管理',
        '顧客データ管理'
      ]
    },
    {
      name: '豊田',
      furigana: 'とよだ',
      position: 'リフォーム現場作業員',
      birthYear: '',
      message: '自社職人として、高品質なリフォームをお届けします。お客様の理想の住まいづくりを技術でサポートいたします。',
      achievements: [
        'リフォーム施工',
        '現場管理',
        '品質管理',
        '安全管理'
      ]
    },
    {
      name: '今津',
      furigana: 'いまづ',
      position: '広告担当',
      birthYear: '',
      message: '広告活動を通じて、地域の皆様に当社のサービスをお届けしています。',
      achievements: [
        '広告戦略立案',
        'エリアマーケティング',
        '広告管理',
        '効果測定'
      ]
    },
    {
      name: '山尾',
      furigana: 'やまお',
      position: '総務',
      birthYear: '',
      message: '会社の動きを止めないように努めています。',
      achievements: [
        '総務',
        '現場管理',
        'スケジュール管理',
        '書類管理'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">


      {/* メインビジュアル */}
      <div className="bg-gradient-to-r from-[#32CD32] to-[#90EE90] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">責任者紹介</h1>
          <p className="text-xl text-white">私たちがお客様の不動産取引をサポートします</p>
        </div>
      </div>

      {/* 代表挨拶 */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#36454F]">代表挨拶</h2>
          
          <div className="md:flex gap-8">
            <div className="md:w-1/3 mb-6 md:mb-0">
              <div className="bg-[#F5F5DC] rounded-lg p-6 text-center">
                <div className="w-40 h-40 bg-[#8B4513] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-6xl">👔</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{staffMembers[0].name}</h3>
                <p className="text-sm text-gray-600 mb-1">{staffMembers[0].furigana}</p>
                <p className="font-bold text-[#FFD700]">{staffMembers[0].position}</p>
                <p className="text-sm text-gray-600 mt-2">{staffMembers[0].birthYear}</p>
              </div>
            </div>
            
            <div className="md:w-2/3">
              <p className="text-gray-700 leading-relaxed mb-4">
                {staffMembers[0].message}
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                センチュリー21の全国ネットワークと、地元奈良・大阪での密着したサービスを融合させ、
                お客様一人ひとりに最適なご提案をさせていただきます。
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                2030年までに年商100億円を目指し、M&Aによる10億円以上での売却を目標に、
                日々成長を続けてまいります。
              </p>
              
              <h4 className="font-bold mb-3 text-[#36454F]">経歴・実績</h4>
              <ul className="space-y-2">
                {staffMembers[0].achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-[#FFD700] mr-2">✓</span>
                    <span className="text-gray-700">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* その他のスタッフ */}
      <div className="bg-[#F5F5DC] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#36454F]">スタッフ紹介</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {staffMembers.slice(1).map((staff, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-[#36454F] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-2xl">👤</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{staff.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{staff.furigana}</p>
                    <p className="font-bold text-[#FFD700] mb-3">{staff.position}</p>
                    <p className="text-gray-700 text-sm mb-3">{staff.message}</p>
                    <ul className="space-y-1">
                      {staff.achievements.map((achievement, idx) => (
                        <li key={idx} className="text-xs text-gray-600">
                          • {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* チーム紹介 */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#36454F]">チーム一丸となってサポート</h2>
          <p className="text-lg text-gray-700 mb-8">
            経験豊富なスタッフが、お客様の大切な不動産取引を全力でサポートいたします。
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="font-bold mb-2">チームワーク</h3>
              <p className="text-sm text-gray-600">各部門が連携し最高のサービスを提供</p>
            </div>
            <div>
              <div className="text-4xl mb-4">💡</div>
              <h3 className="font-bold mb-2">専門知識</h3>
              <p className="text-sm text-gray-600">各分野のプロフェッショナルが在籍</p>
            </div>
            <div>
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="font-bold mb-2">お客様第一</h3>
              <p className="text-sm text-gray-600">常にお客様の立場で考え行動</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
