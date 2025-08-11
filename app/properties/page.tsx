'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Property {
  id: string
  name: string
  price: number
  prefecture: string
  city: string
  station: string
  walking_time: number
  land_area: number
  building_area: number
  layout: string
  property_type: string
  image_url: string
  is_new: boolean
  staff_comment: string
  features: any
  created_at: string
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    property_type: '',
    prefecture: '',
    city: '',
    min_price: '',
    max_price: '',
    layout: ''
  })

  useEffect(() => {
    fetchProperties()
  }, [filter])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      // フィルター適用
      if (filter.property_type) {
        query = query.eq('property_type', filter.property_type)
      }
      if (filter.prefecture) {
        query = query.eq('prefecture', filter.prefecture)
      }
      if (filter.city) {
        query = query.eq('city', filter.city)
      }
      if (filter.min_price) {
        query = query.gte('price', parseInt(filter.min_price))
      }
      if (filter.max_price) {
        query = query.lte('price', parseInt(filter.max_price))
      }
      if (filter.layout) {
        query = query.like('layout', `%${filter.layout}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setProperties(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 新着物件かどうかを判定（created_atから30日以内）
  const isNewProperty = (property: Property) => {
    const createdAt = new Date(property.created_at)
    const now = new Date()
    const diffTime = now.getTime() - createdAt.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays <= 30
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">物件一覧</h1>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <select
              value={filter.property_type}
              onChange={(e) => setFilter({...filter, property_type: e.target.value})}
              className="border rounded px-3 py-2"
            >
              <option value="">物件種別</option>
              <option value="新築戸建">新築戸建</option>
              <option value="中古戸建">中古戸建</option>
              <option value="中古マンション">中古マンション</option>
              <option value="土地">土地</option>
            </select>

            <select
              value={filter.prefecture}
              onChange={(e) => setFilter({...filter, prefecture: e.target.value})}
              className="border rounded px-3 py-2"
            >
              <option value="">都道府県</option>
              <option value="奈良県">奈良県</option>
              <option value="大阪府">大阪府</option>
            </select>

            <input
              type="number"
              placeholder="最低価格（万円）"
              value={filter.min_price}
              onChange={(e) => setFilter({...filter, min_price: e.target.value})}
              className="border rounded px-3 py-2"
            />

            <input
              type="number"
              placeholder="最高価格（万円）"
              value={filter.max_price}
              onChange={(e) => setFilter({...filter, max_price: e.target.value})}
              className="border rounded px-3 py-2"
            />

            <input
              type="text"
              placeholder="間取り（例：3LDK）"
              value={filter.layout}
              onChange={(e) => setFilter({...filter, layout: e.target.value})}
              className="border rounded px-3 py-2"
            />

            <button
              onClick={() => setFilter({
                property_type: '',
                prefecture: '',
                city: '',
                min_price: '',
                max_price: '',
                layout: ''
              })}
              className="bg-gray-500 text-white rounded px-4 py-2 hover:bg-gray-600"
            >
              クリア
            </button>
          </div>
        </div>
      </div>

      {/* 物件一覧 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">読み込み中...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">該当する物件が見つかりませんでした</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  {property.image_url ? (
                    <img
                      src={property.image_url}
                      alt={property.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  
                  {/* バッジ */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    {isNewProperty(property) && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        NEW
                      </span>
                    )}
                    {property.staff_comment && (
                      <span className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold animate-pulse">
                        スタッフおすすめ！
                      </span>
                    )}
                  </div>

                  {/* 物件種別 */}
                  <div className="absolute top-2 right-2">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      {property.property_type}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h2 className="font-bold text-lg mb-2">{property.name}</h2>
                  
                  <p className="text-2xl font-bold text-red-600 mb-2">
                    {property.price.toLocaleString()}万円
                  </p>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📍 {property.prefecture}{property.city}</p>
                    {property.station && (
                      <p>🚃 {property.station} 徒歩{property.walking_time}分</p>
                    )}
                    {property.layout && (
                      <p>🏠 {property.layout}</p>
                    )}
                    {property.land_area && (
                      <p>📐 土地面積: {property.land_area}㎡</p>
                    )}
                    {property.building_area && (
                      <p>🏗️ 建物面積: {property.building_area}㎡</p>
                    )}
                  </div>

                  {/* スタッフコメント */}
                  {property.staff_comment && (
                    <div className="mt-3 p-2 bg-yellow-50 border-l-4 border-yellow-400">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {property.staff_comment}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
