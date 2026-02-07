import fs from 'fs/promises'
import path from 'path'
import Link from 'next/link'
import Image from 'next/image'

interface SuumoItem {
  id: string
  title: string
  price: string
  address: string
  property_type: string
  image_url: string
  company_name: string
  company_tel: string
}

async function getSuumoData(): Promise<{ items: SuumoItem[]; fetched_at?: string } | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'suumo', 'properties.json')
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

export default async function PropertiesPage() {
  const data = await getSuumoData()
  const items = data?.items || []

  return (
    <div className="min-h-screen bg-[#FFF6DE]/60">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#8C7A4C]">PROPERTIES</p>
            <h1 className="text-3xl font-display text-[#15130D]">物件検索</h1>
            <p className="mt-2 text-sm text-[#5B4E37]">
              {data?.fetched_at ? `最終更新: ${new Date(data.fetched_at).toLocaleString('ja-JP')}` : '準備中'}
            </p>
          </div>
          <div className="text-sm text-[#5B4E37]">
            {items.length}件
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-[#EAD8A6] bg-white p-10 text-center text-[#5B4E37]">
            物件情報を準備中です。
          </div>
        ) : (
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/properties-new/${item.id}`}
                className="group rounded-3xl border border-[#EAD8A6] bg-white shadow-[0_14px_30px_rgba(21,19,13,0.08)] transition hover:-translate-y-1"
              >
                <div className="relative h-48 w-full overflow-hidden rounded-t-3xl bg-[#F8E7B8]/40">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#9B8856]">画像準備中</div>
                  )}
                </div>
                <div className="p-6">
                  <div className="text-xs uppercase tracking-[0.25em] text-[#B8A265]">
                    {item.property_type || '物件'}
                  </div>
                  <h2 className="mt-2 line-clamp-2 text-lg font-display text-[#15130D]">
                    {item.title}
                  </h2>
                  <div className="mt-3 text-xl font-semibold text-[#15130D]">
                    {item.price || '価格要相談'}
                  </div>
                  <p className="mt-2 text-sm text-[#5B4E37] line-clamp-2">{item.address}</p>
                  <div className="mt-4 text-xs text-[#9B8856]">
                    {item.company_name} / TEL: {item.company_tel}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
