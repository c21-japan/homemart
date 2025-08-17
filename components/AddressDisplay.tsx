import { AddressData } from '@/hooks/useCurrentAddress'

interface AddressDisplayProps {
  address: AddressData
  showProvider?: boolean
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({ 
  address, 
  showProvider = false 
}) => {
  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'nominatim':
        return 'OpenStreetMap'
      case 'gsi':
        return '国土地理院'
      default:
        return provider
    }
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-sm text-green-800 font-semibold mb-2">
        ✅ 位置情報を取得しました
      </p>
      
      {/* 郵便番号 */}
      {address.postalCode && (
        <p className="text-xs text-green-700 mb-1">
          郵便番号: {address.postalCode}
        </p>
      )}
      
      {/* 都道府県 */}
      {address.prefecture && (
        <p className="text-xs text-green-700 mb-1">
          都道府県: {address.prefecture}
        </p>
      )}
      
      {/* 市区町村 */}
      {address.city && (
        <p className="text-xs text-green-700 mb-1">
          市区町村: {address.city}
        </p>
      )}
      
      {/* 町字 */}
      {address.town && (
        <p className="text-xs text-green-700 mb-1">
          町字: {address.town}
        </p>
      )}
      
      {/* 番地 */}
      {address.block && (
        <p className="text-xs text-green-700 mb-1">
          番地: {address.block}
        </p>
      )}
      
      {/* 完全な住所 */}
      <p className="text-xs text-green-700 mb-1 font-medium">
        住所: {address.full}
      </p>
      
      {/* データ提供元 */}
      {showProvider && (
        <p className="text-xs text-gray-500 mt-2">
          データ提供元: {getProviderLabel(address.provider)}
        </p>
      )}
    </div>
  )
}
