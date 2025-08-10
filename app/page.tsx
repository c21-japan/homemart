import { supabase } from '@/lib/supabase'

export const revalidate = 60

export default async function Home() {
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'published')
    .order('featured', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">株式会社ホームマート</h1>
            <a href="tel:0120438639" className="bg-green-600 text-white px-4 py-2 rounded">
              📞 0120-43-8639
            </a>
          </div>
        </div>
      </header>

      {/* メインビジュアル */}
      <div className="bg-blue-600 text-white py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">
          奈良・大阪の不動産ならお任せください
        </h2>
        <p className="text-xl">センチュリー21加盟店</p>
      </div>

      {/* 物件一覧 */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">物件情報</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {properties?.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {property.featured && (
                <div className="bg-red-600 text-white text-center py-1">
                  おすすめ
                </div>
              )}
              <img 
                src={property.image_url || 'https://via.placeholder.com/400x300'} 
                alt={property.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-xl mb-2">{property.name}</h3>
                <p className="text-2xl text-red-600 font-bold mb-2">
                  {(property.price / 10000).toLocaleString()}万円
                </p>
                <p className="text-gray-600 mb-2">{property.address}</p>
                <p className="text-sm mb-4">{property.description}</p>
                <a 
                  href={`tel:${property.phone}`}
                  className="block bg-green-600 text-white text-center py-2 rounded"
                >
                  お問い合わせ
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>株式会社ホームマート</p>
          <p>〒635-0821 奈良県北葛城郡広陵町笠287-1</p>
          <p>© 2024 Homemart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}