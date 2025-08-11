'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import AreaSearch from '@/components/AreaSearch'

interface Property {
  id: number
  name: string
  price: number
  address: string
  description: string
  image_url: string
  featured: boolean
  phone: string
  status: string
}

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  async function fetchProperties() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .order('featured', { ascending: false })

      if (error) throw error
      setProperties(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-[#FFD700]">C21</span>
              <h1 className="text-2xl font-bold">センチュリー21ホームマート</h1>
            </div>
            <div className="flex gap-4 items-center">
              <a 
                href="tel:0120438639" 
                className="bg-[#FF0000] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors font-bold"
              >
                📞 0120-43-8639
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* メインビジュアル - CENTURY21仕様 */}
      <div className="relative bg-gradient-to-b from-[#F5F5DC] to-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          {/* CENTURY21ロゴ */}
          <div className="mb-8">
            <span className="text-6xl font-bold text-[#FFD700]">C21</span>
            <h1 className="text-4xl font-bold mt-4 text-[#36454F]">
              センチュリー21 ホームマート
            </h1>
          </div>
          
          {/* メインキャッチコピー */}
          <h2 className="text-3xl font-bold mb-4 text-[#36454F]">
            地元に強い、不動産ネットワーク。
          </h2>
          <p className="text-xl mb-8 text-gray-700">
            実際に見て体感しよう！お近くのモデルルームへご来店ください
          </p>
          
          {/* 3つの強み */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="w-20 h-20 bg-[#36454F] rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-[#FFD700] text-2xl font-bold">C21</span>
              </div>
              <h3 className="font-bold text-lg mb-2">CENTURY21</h3>
              <p className="text-sm text-gray-600">全国No.1の店舗数と豊富な物件情報</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="w-20 h-20 bg-white border-2 border-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🔨</span>
              </div>
              <h3 className="font-bold text-lg mb-2">職人の技</h3>
              <p className="text-sm text-gray-600">自社職人による高品質リフォーム</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="w-20 h-20 bg-[#8B4513] rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">🏠</span>
              </div>
              <h3 className="font-bold text-lg mb-2">地元密着</h3>
              <p className="text-sm text-gray-600">奈良・大阪の地域ネットワーク</p>
            </div>
          </div>
          
          {/* CTAボタン */}
          <div className="flex justify-center gap-4 mt-12">
            <a 
              href="#properties" 
              className="bg-[#FFD700] text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#DAA520] transition-all transform hover:scale-105 shadow-lg"
            >
              物件を探す
            </a>
            <a 
              href="tel:0120438639" 
              className="bg-[#FF0000] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg"
            >
              📞 今すぐ相談
            </a>
          </div>
        </div>
      </div>

      {/* エリア検索セクション */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AreaSearch />
      </div>

      {/* 物件一覧 */}
      <div id="properties" className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">物件情報</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto"></div>
            <p className="mt-4">読み込み中...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {properties?.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {property.featured && (
                  <div className="bg-[#FF0000] text-white text-center py-1 font-bold">
                    おすすめ
                  </div>
                )}
                <Link href={`/properties/${property.id}`}>
                  <div className="cursor-pointer">
                    <div className="relative overflow-hidden">
                      <img 
                        src={property.image_url || 'https://via.placeholder.com/400x300'} 
                        alt={property.name}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-xl mb-2 hover:text-[#FFD700] transition-colors">
                        {property.name}
                      </h3>
                      <p className="text-2xl text-[#FF0000] font-bold mb-2">
                        {(property.price / 10000).toLocaleString()}万円
                      </p>
                      <p className="text-gray-600 mb-2">{property.address}</p>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {property.description}
                      </p>
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4 flex gap-2">
                  <Link 
                    href={`/properties/${property.id}`}
                    className="flex-1 bg-[#FFD700] text-black text-center py-2 rounded hover:bg-[#DAA520] transition-colors font-bold"
                  >
                    詳細を見る
                  </Link>
                  <a 
                    href={`tel:${property.phone || '0120438639'}`}
                    className="bg-[#32CD32] text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    📞
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (!properties || properties.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">現在、公開中の物件はありません</p>
            <Link 
              href="/admin" 
              className="text-[#FFD700] hover:underline font-bold"
            >
              管理画面から物件を登録
            </Link>
          </div>
        )}
      </div>

      {/* 会社情報 - CENTURY21仕様 */}
      <div className="bg-[#F5F5DC] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#36454F]">
            センチュリー21ホームマートの強み
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-xl font-bold mb-4 text-[#FFD700]">サービス</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#FFD700] mr-2">✓</span>
                  <span>不動産売買仲介（年間約25,000件の実績）</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#FFD700] mr-2">✓</span>
                  <span>買取再販（URICO制度）</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#FFD700] mr-2">✓</span>
                  <span>リフォーム・リノベーション（自社職人施工）</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#FFD700] mr-2">✓</span>
                  <span>無料査定・相談</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-xl font-bold mb-4 text-[#FFD700]">営業時間</h3>
              <ul className="space-y-2 text-gray-700">
                <li><strong>平日：</strong>9:00〜18:00</li>
                <li><strong>土日祝：</strong>10:00〜17:00</li>
                <li><strong>定休日：</strong>水曜日</li>
                <li className="pt-4 border-t">
                  <strong className="text-[#FF0000] text-xl">
                    0120-43-8639
                  </strong>
                  <br />
                  <span className="text-sm">お客様専用ダイヤル</span>
                  <br />
                  <span className="text-sm">受付時間 9:00〜22:00</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-xl font-bold mb-4 text-[#FFD700]">アクセス</h3>
              <p className="text-gray-700 mb-4">
                <strong>本店</strong><br />
                〒635-0821<br />
                奈良県北葛城郡広陵町笠287-1
              </p>
              <div className="bg-[#FFD700] bg-opacity-20 p-3 rounded">
                <span className="text-sm font-bold text-[#36454F]">
                  🎉 2025年3月<br />
                  センチュリー21広陵店<br />
                  グランドオープン！
                </span>
              </div>
            </div>
          </div>
          
          {/* 代表者メッセージ */}
          <div className="mt-12 bg-white rounded-lg p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-[#36454F]">代表ご挨拶</h3>
            <div className="md:flex gap-8">
              <div className="md:w-1/3 mb-4 md:mb-0">
                <div className="bg-[#F5F5DC] rounded-lg p-4 text-center">
                  <div className="w-32 h-32 bg-[#8B4513] rounded-full mx-auto mb-4"></div>
                  <p className="font-bold">代表取締役</p>
                  <p className="text-xl font-bold">乾 佑企</p>
                  <p className="text-sm text-gray-600">いぬい ゆうき</p>
                </div>
              </div>
              <div className="md:w-2/3">
                <p className="text-gray-700 leading-relaxed">
                  2014年6月19日、20歳で創業して以来、「お客様の悩みや不安を解決し、
                  人生の転機を支える存在でありたい」との強い信念を持ち、
                  不動産・リフォーム事業を通じて地域社会に貢献してまいりました。
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  センチュリー21の全国ネットワークと、地元奈良・大阪での密着した
                  サービスを融合させ、お客様一人ひとりに最適なご提案をさせていただきます。
                  三位一体型サービス（売買・リフォーム・買取再販）で、
                  お客様の大切な不動産取引を全力でサポートいたします。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* フッター - CENTURY21仕様 */}
      <footer className="bg-[#36454F] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-[#FFD700] mb-4">C21</div>
            <p className="text-2xl font-bold mb-2">CENTURY 21</p>
            <p className="text-xl mb-4">ホームマート</p>
            <p className="text-sm text-gray-300">
              センチュリー21の加盟店は、すべて独立・自営です
            </p>
          </div>
          
          <div className="border-t border-gray-600 pt-8">
            <div className="grid md:grid-cols-4 gap-8 text-sm">
              <div>
                <h4 className="font-bold mb-2 text-[#FFD700]">店舗一覧</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>本店（広陵町）</li>
                  <li>R21広陵</li>
                  <li>R21神宮前</li>
                  <li>R21奈良</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-2 text-[#FFD700]">サービス</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>不動産売買</li>
                  <li>リフォーム</li>
                  <li>買取再販</li>
                  <li>無料査定</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-2 text-[#FFD700]">会社情報</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>会社概要</li>
                  <li>代表挨拶</li>
                  <li>アクセス</li>
                  <li>採用情報</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-2 text-[#FFD700]">お問い合わせ</h4>
                <p className="text-2xl font-bold text-[#FFD700] mb-2">
                  0120-43-8639
                </p>
                <p className="text-xs text-gray-300">
                  受付時間: 9:00〜22:00
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8 pt-8 border-t border-gray-600">
            <p className="text-sm text-gray-400">
              © 2024 CENTURY21 HOMEMART. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
