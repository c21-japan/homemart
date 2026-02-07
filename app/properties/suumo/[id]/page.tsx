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

export default async function SuumoPropertyPage({ params }: { params: { id: string } }) {
  const item = await getSuumoItem(params.id)

  if (!item) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#FFF6DE]/60">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <Link href="/properties" className="text-sm font-semibold text-[#8C7A4C] hover:text-[#15130D]">
          ← 物件一覧へ戻る
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-[#EAD8A6] bg-white p-6 shadow-[0_18px_40px_rgba(21,19,13,0.08)]">
            <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-[#F8E7B8]/40">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[#9B8856]">画像準備中</div>
              )}
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[#B8A265]">
                {item.property_type || '物件'}
              </p>
              <h1 className="mt-2 text-2xl font-display text-[#15130D]">{item.title}</h1>
              <div className="mt-4 text-3xl font-semibold text-[#15130D]">
                {item.price || '価格要相談'}
              </div>
              <p className="mt-4 text-sm text-[#5B4E37]">{item.address}</p>
              {item.description ? (
                <p className="mt-4 text-sm leading-7 text-[#6E5B2E]">
                  {item.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-[#EAD8A6] bg-white p-6 shadow-[0_14px_30px_rgba(21,19,13,0.08)]">
              <h2 className="text-lg font-display text-[#15130D]">会社情報</h2>
              <dl className="mt-4 space-y-3 text-sm text-[#5B4E37]">
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#8C7A4C]">会社名</dt>
                  <dd className="mt-1 font-semibold text-[#15130D]">{item.company_name}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#8C7A4C]">TEL</dt>
                  <dd className="mt-1 font-semibold text-[#15130D]">{item.company_tel}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#8C7A4C]">住所</dt>
                  <dd className="mt-1">{item.company_address}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border border-[#EAD8A6] bg-white p-6 shadow-[0_14px_30px_rgba(21,19,13,0.08)]">
              <h2 className="text-lg font-display text-[#15130D]">関連リンク</h2>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[#15130D] px-4 py-2 text-center font-semibold text-[#F4C84B] transition hover:bg-[#2A2419]"
                >
                  SUUMO掲載ページを見る
                </a>
                <a
                  href={item.video_url}
                  className="rounded-full border border-[#EAD8A6] px-4 py-2 text-center font-semibold text-[#6E5B2E] hover:border-[#F4C84B] hover:text-[#15130D]"
                >
                  公式サイトを見る
                </a>
              </div>
              <p className="mt-4 text-xs text-[#9B8856]">
                最終更新: {new Date(item.fetched_at).toLocaleString('ja-JP')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
