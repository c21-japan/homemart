import Link from 'next/link'

interface PropertyCardProps {
  property: {
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
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const mainImage = property.images?.[0] || property.image_url

  // 新着判定（30日以内）
  const isNew = () => {
    if (property.is_new) return true
    const created = new Date(property.created_at)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30
  }

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
        {/* 画像部分 */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage}
              alt={property.name}
              className="w-full h-full object-cover object-center"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span>No Image</span>
            </div>
          )}
          
          {/* フォールバック用の絵文字 */}
          <div className="absolute inset-0 flex items-center justify-center text-6xl text-gray-400" style={{ display: 'none' }}>
            🏠
          </div>

          {/* バッジ */}
          <div className="absolute top-2 left-2 flex gap-2">
            {isNew() && (
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                NEW
              </span>
            )}
            {property.staff_comment && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                おすすめ
              </span>
            )}
          </div>

          {/* 物件種別 */}
          <div className="absolute bottom-2 right-2">
            <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {property.property_type}
            </span>
          </div>
        </div>

        {/* 情報部分 */}
        <div className="p-4">
          {/* 価格 */}
          <div className="text-2xl font-bold text-red-600 mb-2">
            {property.price.toLocaleString()}万円
          </div>

          {/* 物件名 */}
          <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
            {property.name}
          </h3>

          {/* 住所 */}
          <p className="text-sm text-gray-600 mb-2">
            {property.address}
          </p>

          {/* 駅情報 */}
          {property.station && (
            <p className="text-sm text-gray-600 mb-2">
              {property.station}
              {property.walking_time && ` 徒歩${property.walking_time}分`}
            </p>
          )}

          {/* 詳細情報 */}
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            {property.layout && (
              <div>間取り: {property.layout}</div>
            )}
            {property.building_area && (
              <div>建物: {property.building_area}㎡</div>
            )}
            {property.land_area && (
              <div>土地: {property.land_area}㎡</div>
            )}
            {property.building_age !== undefined && (
              <div>築年数: {property.building_age}年</div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
