'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PropertySearch from '@/components/PropertySearch'
import PropertyCard from '@/components/PropertyCard'

export default function HomePage() {
  const router = useRouter()
  const [showSearch, setShowSearch] = useState(false)

  const handleSearch = (filters: any) => {
    const params = new URLSearchParams()
    if (filters.area) params.set('area', filters.area)
    if (filters.types && filters.types.length > 0) params.set('types', filters.types.join(','))
    if (filters.priceMin) params.set('priceMin', filters.priceMin)
    if (filters.priceMax) params.set('priceMax', filters.priceMax)
    if (filters.landAreaMin) params.set('landAreaMin', filters.landAreaMin)
    if (filters.landAreaMax) params.set('landAreaMax', filters.landAreaMax)
    if (filters.buildingAreaMin) params.set('buildingAreaMin', filters.buildingAreaMin)
    if (filters.buildingAreaMax) params.set('buildingAreaMax', filters.buildingAreaMax)
    if (filters.nearStation) params.set('nearStation', filters.nearStation)
    router.push(`/properties?${params.toString()}`)
  }

  const handleQuickSearch = (area: string) => {
    router.push(`/properties?area=${encodeURIComponent(area)}`)
  }

  const handlePropertyTypeSearch = (type: string) => {
    router.push(`/properties?types=${encodeURIComponent(type)}`)
  }

  const featuredProperties = [
    {
      id: 'featured-1',
      name: '広陵町の新築戸建',
      price: 28800000,
      property_type: '新築戸建',
      address: '奈良県北葛城郡広陵町',
      city: '広陵町',
      image_url: '/kitchen_after.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: 'featured-2',
      name: '香芝市の中古戸建',
      price: 22000000,
      property_type: '中古戸建',
      address: '奈良県香芝市',
      city: '香芝市',
      image_url: '/bathroom_after.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: 'featured-3',
      name: '大和高田市の土地',
      price: 15000000,
      property_type: '土地',
      address: '奈良県大和高田市',
      city: '大和高田市',
      image_url: '/bathroom_before.jpg',
      created_at: new Date().toISOString()
    }
  ]

  const popularAreas = [
    { name: '広陵町', count: 45 },
    { name: '香芝市', count: 38 },
    { name: '大和高田市', count: 32 },
    { name: '橿原市', count: 28 },
    { name: '田原本町', count: 24 },
    { name: '王寺町', count: 22 }
  ]

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-[#15130D] text-[#FFF6DE]">
        <div className="absolute -left-10 top-10 h-56 w-56 rounded-full bg-[#F4C84B]/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#E6B62F]/40 blur-3xl" />
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.4em] text-[#F4C84B]">HomeMart Real Estate</p>
            <h1 className="text-4xl font-display leading-tight md:text-5xl">
              奈良・大阪の暮らしを、<br />
              “資産”として設計する。
            </h1>
            <p className="mt-6 text-base text-[#F6EBD2]/80">
              住まい探しから売却、リフォームまで。地元密着の視点で、
              将来価値を見据えた選択肢を提供します。
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => setShowSearch(true)}
                className="rounded-full bg-[#F4C84B] px-6 py-3 text-sm font-semibold text-[#15130D] shadow-[0_16px_30px_rgba(244,200,75,0.45)] transition hover:-translate-y-0.5 hover:bg-[#E6B62F]"
              >
                物件を検索する
              </button>
              <Link
                href="/contact"
                className="rounded-full border border-[#F4C84B]/50 px-6 py-3 text-sm font-semibold text-[#F4C84B] transition hover:bg-[#F4C84B] hover:text-[#15130D]"
              >
                相談してみる
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-[#F4C84B]/30 bg-white/10 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.35)] backdrop-blur">
            <h2 className="text-lg font-display text-[#F4C84B]">今日の注目エリア</h2>
            <div className="mt-6 grid gap-4 text-sm">
              {popularAreas.slice(0, 4).map((area) => (
                <button
                  key={area.name}
                  onClick={() => handleQuickSearch(area.name)}
                  className="flex items-center justify-between rounded-2xl border border-[#F6EBD2]/30 px-4 py-3 text-left text-[#FFF6DE] transition hover:border-[#F4C84B] hover:bg-[#F4C84B]/15"
                >
                  <span>{area.name}</span>
                  <span className="text-xs text-[#F4C84B]">{area.count}件</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSearch(true)}
              className="mt-6 w-full rounded-2xl bg-[#FFF6DE] px-4 py-3 text-sm font-semibold text-[#15130D] transition hover:bg-[#F4C84B]"
            >
              詳細検索へ
            </button>
          </div>
        </div>
      </section>

      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-[#FFF6DE] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-display text-[#15130D]">物件検索</h2>
              <button
                onClick={() => setShowSearch(false)}
                className="rounded-full border border-[#D9C48A] px-4 py-2 text-sm text-[#6E5B2E] transition hover:bg-[#F4C84B] hover:text-[#15130D]"
              >
                閉じる
              </button>
            </div>
            <PropertySearch
              onSearch={(filters) => {
                handleSearch(filters)
                setShowSearch(false)
              }}
            />
          </div>
        </div>
      )}

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#8C7A4C]">Property Type</p>
            <h2 className="text-3xl font-display">物件種別から探す</h2>
          </div>
          <Link href="/properties" className="text-sm font-semibold text-[#8C7A4C] hover:text-[#15130D]">
            物件一覧へ →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {['新築戸建', '中古戸建', '土地', 'マンション', '収益物件'].map((type) => (
            <button
              key={type}
              onClick={() => handlePropertyTypeSearch(type)}
              className="rounded-2xl border border-[#EAD8A6] bg-white px-4 py-4 text-sm font-semibold text-[#15130D] shadow-[0_10px_20px_rgba(21,19,13,0.08)] transition hover:-translate-y-1 hover:border-[#F4C84B]"
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-[#FFF6DE]/70 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#8C7A4C]">Featured</p>
              <h2 className="text-3xl font-display">おすすめ物件</h2>
            </div>
            <Link href="/properties" className="text-sm font-semibold text-[#8C7A4C] hover:text-[#15130D]">
              すべて見る →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                showFavoriteButton={false}
                linkTo="/properties"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {[
            {
              title: '地域密着の情報網',
              body: '地元だからこそ集まる未公開情報や地域ニーズを反映した提案を行います。'
            },
            {
              title: '資産価値まで逆算',
              body: '住んだ後の価値や出口戦略まで見据えたプランニングを重視します。'
            },
            {
              title: 'ワンストップ支援',
              body: '購入・売却・リフォーム・相続まで、専門チームで一貫サポート。'
            }
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-[#EAD8A6] bg-white p-6 shadow-[0_12px_24px_rgba(21,19,13,0.08)]">
              <h3 className="text-xl font-display text-[#15130D]">{item.title}</h3>
              <p className="mt-4 text-sm text-[#5B4E37]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-[#15130D] px-8 py-10 text-[#FFF6DE] shadow-[0_40px_80px_rgba(21,19,13,0.25)]">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#F4C84B]">Consultation</p>
              <h2 className="mt-2 text-2xl font-display">住まいの相談、まずは無料で。</h2>
              <p className="mt-3 text-sm text-[#F6EBD2]/80">
                来店・オンライン・現地同行。状況に合わせて最適な進め方をご提案します。
              </p>
            </div>
            <Link
              href="/contact"
              className="rounded-full bg-[#F4C84B] px-6 py-3 text-sm font-semibold text-[#15130D] shadow-[0_16px_30px_rgba(244,200,75,0.35)] transition hover:-translate-y-0.5 hover:bg-[#E6B62F]"
            >
              無料相談を予約する
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
