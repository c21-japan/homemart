import { supabase } from '@/lib/supabase'
import PropertyCard from '@/components/PropertyCard'

interface Property {
  id: string
  name: string
  price: number
  prefecture: string
  city: string
  address: string
  station?: string
  walking_time?: number
  property_type: string
  land_area?: number
  building_area?: number
  layout?: string
  building_age?: number
  image_url?: string
  images?: string[]
  is_new?: boolean
  staff_comment?: string
  created_at: string
}

export default async function PropertiesPage() {
  // プロパティデータを取得
  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching properties:', error)
    return <div>エラーが発生しました</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">物件一覧</h1>
          <p className="text-gray-600">お客様に最適な物件をご紹介します</p>
        </div>
      </div>

      {/* 物件一覧 */}
      <div className="container mx-auto px-4 py-8">
        {properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: Property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">物件が見つかりません</h3>
            <p className="text-gray-500">現在、表示可能な物件がありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
