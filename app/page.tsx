'use client'

import Link from 'next/link'
import PropertySearch from '@/components/PropertySearch'
import NewFeature from '@/components/NewFeature'

export default function Home() {
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヒーローセクション */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            理想の住まいを
            <span className="text-homemart-blue ml-2">見つけよう</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            センチュリー21 ホームマートで、あなたに最適な不動産を見つけませんか？
            豊富な物件情報と専門的なサポートで、理想の住まいへの第一歩を踏み出しましょう。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/properties"
              className="bg-homemart-blue text-white px-8 py-3 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
            >
              物件を探す
            </Link>
            <Link
              href="/sell"
              className="bg-white text-homemart-blue px-8 py-3 rounded-lg text-lg font-semibold border-2 border-homemart-blue hover:bg-blue-50 transition-colors"
            >
              売却相談
            </Link>
          </div>
        </section>

        {/* 物件検索セクション */}
        <section className="mb-16">
          <PropertySearch 
            selectedArea=""
            onClose={() => {}}
            areaOptions={[]}
            onReturnToSearch={() => {}}
          />
        </section>

        {/* サービス紹介 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: '物件検索',
              description: '豊富な物件情報から最適な住まいを見つけましょう',
              icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
              color: 'blue'
            },
            {
              title: '売却サポート',
              description: '専門知識を活かした売却サポートで、適正価格での売却を実現',
              icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
              color: 'green'
            },
            {
              title: 'リフォーム',
              description: '住まいの価値を高めるリフォームプランをご提案',
              icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z',
              color: 'purple'
            }
          ].map((service, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
              <div className={`w-16 h-16 bg-${service.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg className={`w-8 h-8 text-${service.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={service.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </section>

        {/* CTAセクション */}
        <section className="text-center bg-homemart-blue text-white p-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">今すぐ始めませんか？</h2>
          <p className="text-xl mb-8 opacity-90">
            理想の住まいへの第一歩を踏み出しましょう
          </p>
          <Link
            href="/contact"
            className="inline-block bg-white text-homemart-blue px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            お問い合わせ
          </Link>
        </section>
      </div>
    </div>
  )
}