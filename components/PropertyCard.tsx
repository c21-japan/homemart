'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

interface PropertyCardProps {
  property: {
    id: string
    name: string
    price: number
    property_type: string
    address: string
    image_url?: string
    created_at: string
  }
  showFavoriteButton?: boolean
}

export default function PropertyCard({ property, showFavoriteButton = true }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

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

  const toggleFavorite = async () => {
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
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
            <div className="absolute inset-0 w-full h-48 bg-gray-200 flex items-center justify-center" style={{ display: 'none' }}>
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
        
        {showFavoriteButton && (
          <button
            onClick={toggleFavorite}
            disabled={isLoading}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all ${
              isFavorite
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
          >
            {isFavorite ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
        )}

        <div className="absolute top-3 left-3">
          <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            {property.property_type}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {property.name}
        </h3>
        
        <p className="text-2xl font-bold text-orange-600 mb-2">
          {property.price.toLocaleString()}万円
        </p>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-1">
          {property.address}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {new Date(property.created_at).toLocaleDateString('ja-JP')}
          </span>
          
          <Link
            href={`/properties/${property.id}`}
            className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            詳細を見る
          </Link>
        </div>
      </div>
    </div>
  )
}
