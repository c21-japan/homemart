'use client'

export const dynamic = 'force-dynamic'

import { useCurrentAddress } from '@/hooks/useCurrentAddress'
import { AddressDisplay } from '@/components/AddressDisplay'

export default function TestGeocodingPage() {
  const { address, loading, error, getCurrentAddress, clearAddress } = useCurrentAddress()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            住所取得機能テスト
          </h1>
          
          <div className="space-y-6">
            {/* 位置情報取得ボタン */}
            <button
              type="button"
              onClick={getCurrentAddress}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  位置情報を取得中...
                </div>
              ) : (
                '現在地の位置情報を取得'
              )}
            </button>

            {/* クリアボタン */}
            {address && (
              <button
                type="button"
                onClick={clearAddress}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                住所情報をクリア
              </button>
            )}

            {/* エラー表示 */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-semibold">❌ エラー</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            )}

            {/* 住所情報表示 */}
            {address && (
              <AddressDisplay address={address} showProvider={true} />
            )}

            {/* 使用方法の説明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">使用方法</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 「現在地の位置情報を取得」ボタンをクリック</li>
                <li>• ブラウザで位置情報の使用を許可</li>
                <li>• 住所情報が表示されます</li>
                <li>• データ提供元も確認できます</li>
              </ul>
            </div>

            {/* 技術仕様 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">技術仕様</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 1位: Google Maps API (最高精度、有料)</li>
                <li>• 2位: Nominatim API (OpenStreetMap、無料)</li>
                <li>• 3位: 国土地理院 API (基本情報、無料)</li>
                <li>• 取得項目: 郵便番号、都道府県、市区町村、町字、番地</li>
                <li>• 完全な住所形式: 〒郵便番号 都道府県市区町村町字番地</li>
              </ul>
            </div>

            {/* Google Maps API設定状況 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Google Maps API設定</h3>
              <p className="text-sm text-yellow-700 mb-2">
                Google Maps APIを使用するには、環境変数 <code className="bg-yellow-100 px-1 rounded">GOOGLE_MAPS_API_KEY</code> を設定してください。
              </p>
              <div className="text-xs text-yellow-600">
                <p>• Google Cloud ConsoleでGeocoding APIを有効化</p>
                <p>• APIキーを作成して環境変数に設定</p>
                <p>• 設定後は最高精度の住所情報が取得可能</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
