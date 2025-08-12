'use client'
import Link from 'next/link'

export default function SellPage() {
  return (
    <div className="min-h-screen bg-gray-50">


      {/* メインビジュアル */}
      <div className="bg-gradient-to-r from-[#87CEEB] to-[#E0FFFF] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-[#36454F]">家を売る</h1>
          <p className="text-xl text-[#36454F]">安心・確実な不動産売却をサポート</p>
        </div>
      </div>

      {/* 3つの強み */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-[#36454F]">
          センチュリー21ホームマートの3つの強み
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-32 h-32 bg-[#36454F] rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-[#FFD700] text-4xl font-bold">C21</span>
            </div>
            <h3 className="font-bold text-xl mb-2">CENTURY21</h3>
            <p className="text-gray-600">
              全国No.1の店舗数<br />
              豊富な物件情報と実績
            </p>
          </div>

          <div className="text-center">
            <div className="w-32 h-32 bg-white border-4 border-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">🔨</span>
            </div>
            <h3 className="font-bold text-xl mb-2">職人の技</h3>
            <p className="text-gray-600">
              自社職人による<br />
              高品質リフォーム
            </p>
          </div>

          <div className="text-center">
            <div className="w-32 h-32 bg-[#8B4513] rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-4xl">🏠</span>
            </div>
            <h3 className="font-bold text-xl mb-2">地元密着</h3>
            <p className="text-gray-600">
              奈良・大阪の<br />
              地域ネットワーク
            </p>
          </div>
        </div>
      </div>

      {/* 対話形式の説明 */}
      <div className="bg-[#F5F5DC] py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-[#36454F]">
            よくあるご質問
          </h2>

          <div className="space-y-6">
            {/* 質問1 */}
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🐕</span>
              </div>
              <div className="bg-[#E6F3FF] rounded-lg p-4 flex-1">
                <p className="font-bold mb-2">みるくちゃん</p>
                <p>こんにちは、ゆうきくん！センチュリー21ホームマートについて教えてくれる？</p>
              </div>
            </div>

            <div className="flex gap-4 flex-row-reverse">
              <div className="w-16 h-16 bg-[#8B4513] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl">👔</span>
              </div>
              <div className="bg-[#E6FFE6] rounded-lg p-4 flex-1">
                <p className="font-bold mb-2">ゆうきくん</p>
                <p>
                  もちろん、みるくちゃん。センチュリー21グループだから安心して、
                  全国No.1の店舗数と豊富な物件情報を活かして、お客様に最適な物件を提供できるよ。
                </p>
              </div>
            </div>

            {/* 質問2 */}
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🐕</span>
              </div>
              <div className="bg-[#E6F3FF] rounded-lg p-4 flex-1">
                <p className="font-bold mb-2">みるくちゃん</p>
                <p>それはすごいね！他にもセンチュリー21ホームマートならではの強みってあるの？</p>
              </div>
            </div>

            <div className="flex gap-4 flex-row-reverse">
              <div className="w-16 h-16 bg-[#8B4513] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl">👔</span>
              </div>
              <div className="bg-[#E6FFE6] rounded-lg p-4 flex-1">
                <p className="font-bold mb-2">ゆうきくん</p>
                <p>
                  そうだよ。リフォームも自社の職人が行っているんだ。
                  これにより、高品質なリフォームを適正な価格で提供できるんだ。
                  お客様の要望に応じた細かな対応も可能だから、リフォーム後の満足度も高いよ。
                </p>
              </div>
            </div>

            {/* 質問3 */}
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🐕</span>
              </div>
              <div className="bg-[#E6F3FF] rounded-lg p-4 flex-1">
                <p className="font-bold mb-2">みるくちゃん</p>
                <p>なるほど、それは安心できるね。他にも強みはあるの？</p>
              </div>
            </div>

            <div className="flex gap-4 flex-row-reverse">
              <div className="w-16 h-16 bg-[#8B4513] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl">👔</span>
              </div>
              <div className="bg-[#E6FFE6] rounded-lg p-4 flex-1">
                <p className="font-bold mb-2">ゆうきくん</p>
                <p>
                  実は、僕は奈良県宅建協会会員で、大阪維新の会の方達と交流があるんだ。
                  このネットワークを活かして、地元の情報収集や協力を得ることができるんだ。
                  これも大阪・奈良でセンチュリー21ホームマートが強い理由だよ。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 売却の流れ */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-[#36454F]">売却の流れ</h2>
        <div className="grid md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-6 shadow text-center">
            <div className="text-3xl mb-4">📞</div>
            <h3 className="font-bold mb-2">STEP 1</h3>
            <p className="text-sm">お問い合わせ</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow text-center">
            <div className="text-3xl mb-4">🏠</div>
            <h3 className="font-bold mb-2">STEP 2</h3>
            <p className="text-sm">物件査定</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow text-center">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="font-bold mb-2">STEP 3</h3>
            <p className="text-sm">媒介契約</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow text-center">
            <div className="text-3xl mb-4">📢</div>
            <h3 className="font-bold mb-2">STEP 4</h3>
            <p className="text-sm">販売活動</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow text-center">
            <div className="text-3xl mb-4">🎉</div>
            <h3 className="font-bold mb-2">STEP 5</h3>
            <p className="text-sm">売買契約・引渡し</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#FFD700] py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#36454F]">無料査定実施中！</h2>
          <p className="text-lg mb-8 text-[#36454F]">
            まずはお気軽にご相談ください。経験豊富なスタッフが対応いたします。
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a 
              href="tel:0120438639" 
              className="bg-[#FF0000] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors"
            >
              📞 今すぐ電話で相談
            </a>
            <Link 
              href="/contact" 
              className="bg-white text-[#36454F] px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              📧 メールで問い合わせ
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}