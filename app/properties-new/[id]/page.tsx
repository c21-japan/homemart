import fs from 'fs/promises'
import path from 'path'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'

interface SuumoItem {
  id: string
  title: string
  price: string
  address: string
  property_type: string
  description: string
  layout: string
  land_area: string
  building_area: string
  traffic: string
  transportation: Array<{
    line: string
    station: string
    walk_time: string
  }>
  event_info: string
  features: string[]
  overview?: Record<string, string>
  equipment_notes?: string[]
  surroundings?: Array<{
    category: string
    name: string
    distance: string
    walk_time: string
  }>
  images: string[]
  site_plan_image: string
  units: Array<{
    name: string
    price: string
    layout: string
    land_area: string
    building_area: string
    floor_plan_image: string
  }>
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

export default async function PropertiesNewDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolved = await params
  const item = await getSuumoItem(resolved.id)

  if (!item) {
    notFound()
  }

  const images = Array.isArray(item.images) && item.images.length > 0 ? item.images : item.image_url ? [item.image_url] : []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/properties-new" className="text-blue-600 hover:underline">
            ← 新築戸建一覧に戻る
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {images.length > 0 ? (
                <div>
                  <div className="relative w-full h-[400px] bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={images[0]}
                      alt={item.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 66vw"
                      priority
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {images.slice(0, 8).map((img, index) => (
                        <div key={`${img}-${index}`} className="relative h-20 bg-gray-100 rounded overflow-hidden">
                          <Image
                            src={img}
                            alt={`${item.title} ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 25vw, 10vw"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-[400px] bg-gray-200 rounded flex items-center justify-center text-gray-500">
                  画像なし
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="inline-block rounded bg-[#C5A04F] px-3 py-1 text-xs font-semibold text-white">
                {item.property_type || '新築戸建'}
              </div>
              <h1 className="mt-3 text-2xl font-bold">{item.title}</h1>
              <div className="mt-2 text-3xl font-bold text-[#C5A04F]">
                {item.price || '価格要相談'}
              </div>
              <p className="mt-2 text-sm text-gray-600">{item.address}</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">基本情報</h2>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <span className="text-gray-500">所在地</span>
                  <p className="font-medium">{item.address}</p>
                </div>
                <div>
                  <span className="text-gray-500">間取り</span>
                  <p className="font-medium">{item.layout || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">土地面積</span>
                  <p className="font-medium">{item.land_area || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">建物面積</span>
                  <p className="font-medium">{item.building_area || '-'}</p>
                </div>
                {(item.transportation?.length ?? 0) > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-500">交通</span>
                    <ul className="mt-1 space-y-1">
                      {item.transportation.map((t, idx) => (
                        <li key={`${t.station}-${idx}`}>
                          {t.line ? `${t.line}「${t.station}」` : t.station}
                          {t.walk_time ? ` ${t.walk_time}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.traffic && (item.transportation?.length ?? 0) === 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-500">交通</span>
                    <p className="mt-1">{item.traffic}</p>
                  </div>
                )}
              </div>
            </div>

            {item.features && item.features.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">物件の特徴</h2>
                <div className="flex flex-wrap gap-2">
                  {item.features.map((feature) => (
                    <span key={feature} className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {item.equipment_notes && item.equipment_notes.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">設備・構造</h2>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                  {item.equipment_notes.map((note, idx) => (
                    <li key={`${note}-${idx}`}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {item.overview && Object.keys(item.overview).length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">物件概要</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  {Object.entries(item.overview).map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {item.surroundings && item.surroundings.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">周辺環境</h2>
                <ul className="space-y-2 text-sm text-gray-700">
                  {item.surroundings.map((s, idx) => (
                    <li key={`${s.name}-${idx}`} className="flex flex-wrap gap-2">
                      <span className="font-medium">{s.category}</span>
                      <span>{s.name}</span>
                      {s.distance && <span>{s.distance}</span>}
                      {s.walk_time && <span>徒歩{s.walk_time}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item.event_info && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">イベント情報</h2>
                <p className="whitespace-pre-wrap text-gray-700">{item.event_info}</p>
              </div>
            )}

            {(item.site_plan_image || (item.units && item.units.length > 0)) && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">区画・住戸情報</h2>
                {item.site_plan_image && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">区画図</p>
                    <div className="relative w-full h-[360px] bg-gray-100 rounded overflow-hidden">
                      <Image
                        src={item.site_plan_image}
                        alt="区画図"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 66vw"
                      />
                    </div>
                  </div>
                )}
                {item.units && item.units.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {item.units.map((unit, idx) => (
                      <div key={`${unit.name}-${idx}`} className="border border-gray-200 rounded-lg p-4 text-sm">
                        <p className="font-semibold mb-2">{unit.name}</p>
                        {unit.floor_plan_image && (
                          <div className="relative w-full h-32 bg-gray-100 rounded mb-2 overflow-hidden">
                            <Image
                              src={unit.floor_plan_image}
                              alt={`${unit.name} 間取り図`}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, 20vw"
                            />
                          </div>
                        )}
                        <dl className="space-y-1 text-gray-700">
                          <div className="flex justify-between">
                            <dt>価格</dt>
                            <dd>{unit.price}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>間取り</dt>
                            <dd>{unit.layout}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>土地面積</dt>
                            <dd>{unit.land_area}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>建物面積</dt>
                            <dd>{unit.building_area}</dd>
                          </div>
                        </dl>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky" style={{ top: 'calc(var(--public-header-height) + 1rem)' }}>
              <h2 className="text-xl font-bold mb-4">お問い合わせ</h2>
              <div className="space-y-4">
                <a
                  href={`tel:${item.company_tel}`}
                  className="block w-full bg-[#C5A04F] text-white text-center py-3 rounded-lg hover:bg-[#B08E3E] font-bold"
                >
                  お電話でお問い合わせ
                  <br />
                  {item.company_tel}
                </a>
                <Link
                  href={`/contact?property=${encodeURIComponent(item.title)}`}
                  className="block w-full border border-[#C5A04F] text-[#C5A04F] text-center py-3 rounded-lg hover:bg-[#FFF6DE] font-bold"
                >
                  メールで問い合わせる
                </Link>
                <Link
                  href="/contact"
                  className="block w-full border border-gray-300 text-center py-3 rounded-lg hover:bg-gray-50"
                >
                  見学予約する
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t text-sm text-gray-600">
                <p className="font-semibold text-gray-800">{item.company_name}</p>
                <p>{item.company_address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
