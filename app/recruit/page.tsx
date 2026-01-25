'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RecruitPage() {
  const [salarySimulator, setSalarySimulator] = useState({
    propertyPrice: 2000,
    reformProfit: 200,
    dealType: 'both',
    monthlyDeals: 2
  })

  const calculateMonthlySalary = () => {
    const base = 25
    const propertyCommission = (salarySimulator.propertyPrice * 0.03 * 0.5) * salarySimulator.monthlyDeals
    const reformCommission = salarySimulator.reformProfit * 0.3 * salarySimulator.monthlyDeals
    const total = base + propertyCommission + reformCommission
    return Math.round(total)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#F8F6F3] via-white to-[#F8F6F3] py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#B8A265] text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
              🏆 センチュリー21加盟店
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              <span className="text-[#B8A265]">自分たちで作る</span><br />
              自分たちの会社
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-4">
              ルールは与えられるものじゃない。<br />
              <strong>自分たちで決めて、自分たちで作る。</strong><br />
              だから、仕事が楽しくなる。
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-5xl font-black mb-3 bg-gradient-to-r from-[#B8A265] to-[#D4C299] bg-clip-text text-transparent">
                100%
              </div>
              <h3 className="text-xl font-bold mb-2">完全週休2日制</h3>
              <p className="text-gray-600 text-sm">
                シフト制で希望も考慮。<br />プライベートも大切に。
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-5xl font-black mb-3 bg-gradient-to-r from-[#B8A265] to-[#D4C299] bg-clip-text text-transparent">
                3ヶ月
              </div>
              <h3 className="text-xl font-bold mb-2">充実の研修期間</h3>
              <p className="text-gray-600 text-sm">
                センチュリー21研修＋<br />現場研修で確実に成長。
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-5xl font-black mb-3 bg-gradient-to-r from-[#B8A265] to-[#D4C299] bg-clip-text text-transparent">
                100万
              </div>
              <h3 className="text-xl font-bold mb-2">月収プレイヤーも実現</h3>
              <p className="text-gray-600 text-sm">
                インセンティブで<br />月収100万円プレイヤーも実現！
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://form.run/@c21-member"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#B8A265] to-[#D4C299] text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <span>📝</span>
              <span>応募する</span>
            </a>
            <a
              href="tel:0120438639"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#B8A265] border-2 border-[#B8A265] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#F8F6F3] transition-all"
            >
              <span>📞</span>
              <span>0120-43-8639</span>
            </a>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              なぜ<span className="text-[#B8A265]">ホームマート</span>なのか？
            </h2>
            <p className="text-lg text-gray-600">
              他社にはない、4つの<strong>強み</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#F8F6F3] rounded-2xl p-8 hover:-translate-y-2 hover:shadow-xl transition-all">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl mb-6 mx-auto">
                🏆
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">センチュリー21 × 自社施工</h3>
              <p className="text-gray-700 mb-4 text-center">
                大手ブランドの信頼性と、自社施工の提案力。この掛け算が最強の武器に。
              </p>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-sm text-gray-500 mb-1">実績</div>
                <div className="text-lg font-bold text-[#B8A265]">施工実績豊富</div>
              </div>
            </div>

            <div className="bg-[#F8F6F3] rounded-2xl p-8 hover:-translate-y-2 hover:shadow-xl transition-all">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl mb-6 mx-auto">
                💰
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">社員が社長より稼げる文化</h3>
              <p className="text-gray-700 mb-4 text-center">
                &quot;社長が決めるより社員の声を大事に&quot;。32歳社長（20歳で創業）の下、フェアな評価で高収入を実現。
              </p>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-sm text-gray-500 mb-1">実績</div>
                <div className="text-lg font-bold text-[#B8A265]">年収1,000万円超え多数</div>
              </div>
            </div>

            <div className="bg-[#F8F6F3] rounded-2xl p-8 hover:-translate-y-2 hover:shadow-xl transition-all">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl mb-6 mx-auto">
                🔨
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">現場でもインセンティブ</h3>
              <p className="text-gray-700 mb-4 text-center">
                センチュリー21グループ×施工店だから実現。現場職も高収入を狙える独自制度。
              </p>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-sm text-gray-500 mb-1">実績</div>
                <div className="text-lg font-bold text-[#B8A265]">年収700万円以上輩出</div>
              </div>
            </div>

            <div className="bg-[#F8F6F3] rounded-2xl p-8 hover:-translate-y-2 hover:shadow-xl transition-all">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl mb-6 mx-auto">
                🚀
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">社内独立制度</h3>
              <p className="text-gray-700 mb-4 text-center">
                C21ブランドを活かした社内独立制度あり。自社で不動産を積極的に買って売る実践型。
              </p>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-sm text-gray-500 mb-1">将来性</div>
                <div className="text-lg font-bold text-[#B8A265]">安定した起業の道</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Salary Simulator */}
      <section className="py-20 bg-gradient-to-br from-[#1A1A1A] to-[#2a2a2a] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(184,162,101,0.3),transparent)]"></div>
        </div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              <span className="text-[#B8A265]">月収シミュレーター</span>
            </h2>
            <p className="text-lg opacity-90">
              あなたの実力次第で、どれだけ稼げるか確認してみよう
            </p>
          </div>

          <div className="bg-[rgba(184,162,101,0.1)] border-3 border-[#B8A265] rounded-3xl p-8 md:p-12">
            {/* 物件価格 */}
            <div className="mb-8">
              <label className="block text-xl font-black text-[#B8A265] mb-3">
                💰 物件価格（万円）
              </label>
              <input
                type="range"
                min="1000"
                max="5000"
                step="100"
                value={salarySimulator.propertyPrice}
                onChange={(e) => setSalarySimulator({ ...salarySimulator, propertyPrice: Number(e.target.value) })}
                className="w-full h-3 bg-[#B8A265] rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center text-4xl font-black text-[#D4C299] mt-3">
                {salarySimulator.propertyPrice.toLocaleString()}万円
              </div>
            </div>

            {/* リフォーム利益 */}
            <div className="mb-8">
              <label className="block text-xl font-black text-[#B8A265] mb-3">
                🔧 リフォーム利益（万円）
              </label>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={salarySimulator.reformProfit}
                onChange={(e) => setSalarySimulator({ ...salarySimulator, reformProfit: Number(e.target.value) })}
                className="w-full h-3 bg-[#B8A265] rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center text-4xl font-black text-[#D4C299] mt-3">
                {salarySimulator.reformProfit.toLocaleString()}万円
              </div>
            </div>

            {/* 月間成約数 */}
            <div className="mb-8">
              <label className="block text-xl font-black text-[#B8A265] mb-3">
                📊 月間成約数
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={salarySimulator.monthlyDeals}
                onChange={(e) => setSalarySimulator({ ...salarySimulator, monthlyDeals: Number(e.target.value) })}
                className="w-full h-3 bg-[#B8A265] rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center text-4xl font-black text-[#D4C299] mt-3">
                {salarySimulator.monthlyDeals}件
              </div>
            </div>

            {/* 結果表示 */}
            <div className="bg-gradient-to-r from-[#B8A265] to-[#D4C299] rounded-2xl p-8 text-center mt-12">
              <div className="text-sm mb-2 opacity-90">あなたの予想月収</div>
              <div className="text-5xl md:text-6xl font-black mb-2">
                {calculateMonthlySalary().toLocaleString()}万円
              </div>
              <div className="text-sm opacity-90">
                基本給25万円 + インセンティブ
              </div>
            </div>

            <div className="mt-8 p-6 bg-white/10 rounded-xl">
              <p className="text-sm leading-relaxed opacity-90">
                💡 <strong>社長からのメッセージ:</strong><br />
                「この数字は夢じゃない。実際に当社で働く社員が達成している実績です。
                努力した分だけ正当に評価される環境があります。一緒に稼ぎましょう！」
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              募集<span className="text-[#B8A265]">職種</span>
            </h2>
            <p className="text-lg text-gray-600">
              あなたに合った働き方を選べます
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 不動産営業 */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#B8A265] hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="text-4xl mb-4">🏠</div>
                  <h3 className="text-2xl font-bold mb-2">不動産営業</h3>
                  <div className="flex gap-2 mb-4">
                    <span className="bg-[#B8A265] text-white text-xs px-3 py-1 rounded-full">正社員</span>
                    <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">未経験OK</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">💰 給与</h4>
                  <p className="text-2xl font-black text-[#B8A265]">月給25万円〜 + インセンティブ</p>
                  <p className="text-sm text-gray-600 mt-1">年収例: 500万円〜1,200万円</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">📝 業務内容</h4>
                  <p className="text-gray-700">不動産の売買仲介、買取再販、リフォーム提案まで幅広く対応</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">✓ 求めるスキル</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-center"><span className="text-[#B8A265] mr-2">•</span>普通自動車免許</li>
                    <li className="flex items-center"><span className="text-[#B8A265] mr-2">•</span>向上心と行動力</li>
                    <li className="flex items-center"><span className="text-[#B8A265] mr-2">•</span>コミュニケーション能力</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* リフォーム施工管理 */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#B8A265] hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="text-4xl mb-4">🔨</div>
                  <h3 className="text-2xl font-bold mb-2">リフォーム施工管理</h3>
                  <div className="flex gap-2 mb-4">
                    <span className="bg-[#B8A265] text-white text-xs px-3 py-1 rounded-full">正社員</span>
                    <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">経験者優遇</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">💰 給与</h4>
                  <p className="text-2xl font-black text-[#B8A265]">月給28万円〜 + インセンティブ</p>
                  <p className="text-sm text-gray-600 mt-1">年収例: 450万円〜800万円</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">📝 業務内容</h4>
                  <p className="text-gray-700">リフォーム工事の施工管理・品質管理・顧客対応</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">✓ 求めるスキル</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-center"><span className="text-[#B8A265] mr-2">•</span>建築・土木関連資格歓迎</li>
                    <li className="flex items-center"><span className="text-[#B8A265] mr-2">•</span>施工管理経験</li>
                    <li className="flex items-center"><span className="text-[#B8A265] mr-2">•</span>安全管理知識</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href="https://form.run/@c21-member"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#B8A265] to-[#D4C299] text-white px-10 py-5 rounded-full font-bold text-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <span>📝</span>
              <span>今すぐ応募する</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-r from-[#B8A265] to-[#D4C299] text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            まずは気軽に相談してください
          </h2>
          <p className="text-lg mb-8 opacity-90">
            応募前の質問・相談も大歓迎です。お電話またはフォームからお気軽にどうぞ。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:0120438639"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#B8A265] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all"
            >
              <span>📞</span>
              <span>0120-43-8639</span>
            </a>
            <a
              href="https://form.run/@c21-member"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#1A1A1A] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-black transition-all"
            >
              <span>✉️</span>
              <span>問い合わせフォーム</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
