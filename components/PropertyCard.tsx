'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface PropertyCardProps {
  property: {
    id: string
    name: string
    price: number
    price_text?: string
    property_type: string
    address: string
    image_url?: string
    created_at: string
  }
  showFavoriteButton?: boolean
  linkTo?: string
}

export default function PropertyCard({
  property,
  showFavoriteButton = true,
  linkTo
}: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user && showFavoriteButton) {
      checkFavoriteStatus()
    }
  }, [user, property.id, showFavoriteButton])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('ユーザー認証チェックエラー:', error)
    }
  }

  const checkFavoriteStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('favorite_properties')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', property.id)
        .single()

      if (!error && data) {
        setIsFavorite(true)
      }
    } catch (error) {
      // エラーは無視（お気に入りに登録されていない場合）
    }
  }

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      // 未ログインの場合はログインページにリダイレクト
      window.location.href = '/member/login'
      return
    }

    setIsLoading(true)
    try {
      if (isFavorite) {
        // お気に入りから削除
        const { error } = await supabase
          .from('favorite_properties')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', property.id)

        if (!error) {
          setIsFavorite(false)
        }
      } else {
        // お気に入りに追加
        const { error } = await supabase
          .from('favorite_properties')
          .insert({
            user_id: user.id,
            property_id: property.id
          })

        if (!error) {
          setIsFavorite(true)
        }
      }
    } catch (error) {
      console.error('お気に入り操作エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = () => {
    if (linkTo) {
      if (linkTo.startsWith('http')) {
        window.open(linkTo, '_blank', 'noopener,noreferrer')
        return
      }
      router.push(linkTo)
      return
    }
    router.push(`/properties/${property.id}`)
  }

  const isLinkEnabled = Boolean(linkTo) || Boolean(property.id)

  return (
    <div className="group overflow-hidden rounded-3xl border border-[#EAD8A6] bg-white shadow-[0_14px_30px_rgba(21,19,13,0.08)] transition hover:-translate-y-1 hover:border-[#F4C84B]">
      <div
        className={`relative ${isLinkEnabled ? 'cursor-pointer' : ''}`}
        onClick={isLinkEnabled ? handleCardClick : undefined}
      >
        {property.image_url ? (
          <div className="relative w-full h-48">
            <Image
              src={property.image_url}
              alt={property.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              onError={(e) => {
                // 画像読み込みエラー時のフォールバック
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
            {/* フォールバック用のプレースホルダー */}
            <div className="absolute inset-0 flex h-48 w-full items-center justify-center bg-[#FFF6DE]" style={{ display: 'none' }}>
              <svg className="h-16 w-16 text-[#B9A26B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-[#FFF6DE]">
            <svg className="h-16 w-16 text-[#B9A26B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
        
        {showFavoriteButton && (
          <button
            onClick={toggleFavorite}
            disabled={isLoading}
            className={`absolute right-3 top-3 z-10 rounded-full border border-white/70 bg-white/90 p-2 text-sm shadow-md transition-all ${
              isFavorite
                ? 'text-[#15130D]'
                : 'text-[#8C7A4C]'
            } ${isLoading ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#F4C84B]'}`}
            title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        )}

        <div className="absolute top-3 left-3 z-10">
          <span className="rounded-full bg-[#15130D]/90 px-3 py-1 text-xs font-semibold text-[#F4C84B]">
            {property.property_type}
          </span>
        </div>
      </div>

      <div
        className={`${isLinkEnabled ? 'cursor-pointer' : ''} p-5`}
        onClick={isLinkEnabled ? handleCardClick : undefined}
      >
        <h3 className="mb-2 line-clamp-2 text-lg font-display text-[#15130D]">
          {property.name}
        </h3>
        
        <p className="mb-2 text-2xl font-semibold text-[#15130D]">
          {property.price_text ?? `${property.price.toLocaleString()}万円`}
        </p>
        
        <p className="mb-3 line-clamp-1 text-sm text-[#5B4E37]">
          {property.address}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#9B8856]">
            {new Date(property.created_at).toLocaleDateString('ja-JP')}
          </span>
          
          {isLinkEnabled && (
            <button
              onClick={handleCardClick}
              className="rounded-full bg-[#F4C84B] px-4 py-2 text-xs font-semibold text-[#15130D] transition hover:bg-[#E6B62F]"
            >
              詳細を見る
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
