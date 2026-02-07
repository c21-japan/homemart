import fs from 'fs/promises'
import path from 'path'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface SuumoItem {
  id: string
  title: string
  price: string
  address: string
  property_type: string
  description: string
  image_url: string
  source_url: string
  company_name: string
  company_tel: string
  company_address: string
  video_url: string
  fetched_at: string
}

async function getSuumoItem(id: string): Promise<SuumoItem | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'suumo', 'properties.json')
    const content = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(content)
    const items: SuumoItem[] = Array.isArray(data?.items) ? data.items : []
    return items.find((item) => item.id === id) || null
  } catch {
    return null
  }
}

export default async function SuumoPropertyPage({ params }: any) {
  const item = await getSuumoItem(params.id)

  if (!item) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/properties" className="text-blue-600 hover:underline">
            ← 物件一覧に戻る
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              {item.image_url ? (
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-[400px] object-contain bg-gray-100 rounded"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const fallback = target.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                  <div
                    className="w-full h-[400px] bg-gray-100 rounded flex items-center justify-center text-8xl text-gray-400"
                    style={{ display: 'none' }}
                  >
                    🏠
                  </div>
                </div>
              ) : (
                <div className="w-full h-[400px] bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-400">画像なし</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h1 className="text-2xl font-bold mb-4">{item.title}</h1>
              <div className="text-3xl font-bold text-red-600 mb-4">
                {item.price || '価格要相談'}
              </div>
              {item.description && (
                <div className="mb-4">
                  <h3 className="font-bold mb-2">セールスポイント</h3>
                  <p className="whitespace-pre-wrap">{item.description}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">基本情報</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">物件種別</span>
                  <p className="font-medium">{item.property_type || '物件'}</p>
                </div>
                <div>
                  <span className="text-gray-600">所在地</span>
                  <p className="font-medium">{item.address}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">その他の情報</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">最終更新</span>
                  <p className="font-medium">{new Date(item.fetched_at).toLocaleString('ja-JP')}</p>
                </div>
                <div>
                  <span className="text-gray-600">情報提供元</span>
                  <p className="font-medium">
                    <a href={item.source_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      SUUMO掲載ページ
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div
              className="bg-white rounded-lg shadow-lg p-6 sticky"
              style={{ top: 'calc(var(--public-header-height) + 1rem)' }}
            >
              <h2 className="text-xl font-bold mb-4">お問い合わせ</h2>
              <div className="space-y-4">
                <a
                  href={`tel:${item.company_tel}`}
                  className="block w-full bg-red-600 text-white text-center py-3 rounded-lg hover:bg-red-700 font-bold"
                >
                  <span className="text-sm">お電話でのお問い合わせ</span>
                  <br />
                  {item.company_tel}
                </a>
                <Link
                  href={`/contact?property=${encodeURIComponent(item.title)}`}
                  className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 font-bold"
                >
                  メールで問い合わせる
                </Link>
                <Link
                  href="/contact"
                  className="block w-full border border-gray-300 text-center py-3 rounded-lg hover:bg-gray-50"
                >
                  見学予約する
                </Link>
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full border border-gray-300 text-center py-3 rounded-lg hover:bg-gray-50"
                >
                  SUUMO掲載ページを見る
                </a>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  {item.company_name}
                  <br />
                  {item.company_address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
