'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface FavoriteProperty {
  id: string
  property_id: string
  property_name: string
  price: number
  property_type: string
  address: string
  image_url?: string
  created_at: string
}

interface SearchHistory {
  id: string
  search_query: string
  search_type: string
  created_at: string
}

interface InquiryHistory {
  id: string
  property_name?: string
  inquiry_type: string
  status: string
  created_at: string
}

export default function MemberPage() {
  const [user, setUser] = useState<any>(null)
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([])
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [inquiryHistory, setInquiryHistory] = useState<InquiryHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'inquiries' | 'profile'>('favorites')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await fetchUserData(user.id)
      } else {
        // 未ログインの場合はログインページにリダイレクト
        window.location.href = '/member/login'
      }
    } catch (error) {
      console.error('ユーザー認証エラー:', error)
      window.location.href = '/member/login'
    } finally {
      setLoading(false)
    }
  }

  const fetchUserData = async (userId: string) => {
    try {
      // お気に入り物件を取得
      const { data: favoritesData } = await supabase
        .from('favorite_properties')
        .select(`
          *,
          properties (
            id,
            name,
            price,
            property_type,
            address,
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (favoritesData) {
        setFavorites(favoritesData.map(fav => ({
          id: fav.id,
          property_id: fav.property_id,
          property_name: fav.properties?.name || '不明な物件',
          price: fav.properties?.price || 0,
          property_type: fav.properties?.property_type || '不明',
          address: fav.properties?.address || '住所不明',
          image_url: fav.properties?.image_url,
          created_at: fav.created_at
        })))
      }

      // 検索履歴を取得
      const { data: historyData } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (historyData) {
        setSearchHistory(historyData)
      }

      // お問い合わせ履歴を取得
      const { data: inquiryData } = await supabase
        .from('inquiries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (inquiryData) {
        setInquiryHistory(inquiryData)
      }
    } catch (error) {
      console.error('ユーザーデータ取得エラー:', error)
    }
  }

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorite_properties')
        .delete()
        .eq('id', favoriteId)

      if (!error) {
        setFavorites(favorites.filter(fav => fav.id !== favoriteId))
      }
    } catch (error) {
      console.error('お気に入り削除エラー:', error)
    }
  }

  const clearSearchHistory = async () => {
    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', user.id)

      if (!error) {
        setSearchHistory([])
      }
    } catch (error) {
      console.error('検索履歴削除エラー:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">マイページ</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                ようこそ、{user.email}さん
              </span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = '/'
                }}
                className="text-sm text-orange-600 hover:text-orange-700"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'favorites', name: 'お気に入り物件', count: favorites.length },
                { id: 'history', name: '検索履歴', count: searchHistory.length },
                { id: 'inquiries', name: 'お問い合わせ履歴', count: inquiryHistory.length },
                { id: 'profile', name: 'プロフィール', count: 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* タブコンテンツ */}
          <div className="p-6">
            {activeTab === 'favorites' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">お気に入り物件</h2>
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">お気に入り物件がありません</h3>
                    <p className="mt-1 text-sm text-gray-500">物件検索でお気に入りの物件を見つけてください</p>
                    <div className="mt-6">
                      <Link
                        href="/properties"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                      >
                        物件を探す
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((favorite) => (
                      <div key={favorite.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        {favorite.image_url && (
                          <div className="aspect-w-16 aspect-h-9">
                            <img
                              src={favorite.image_url}
                              alt={favorite.property_name}
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {favorite.property_name}
                          </h3>
                          <p className="text-2xl font-bold text-orange-600 mb-2">
                            {favorite.price.toLocaleString()}万円
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            {favorite.property_type} • {favorite.address}
                          </p>
                          <div className="flex space-x-2">
                            <Link
                              href={`/properties/${favorite.property_id}`}
                              className="flex-1 bg-orange-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
                            >
                              詳細を見る
                            </Link>
                            <button
                              onClick={() => removeFavorite(favorite.id)}
                              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">検索履歴</h2>
                  {searchHistory.length > 0 && (
                    <button
                      onClick={clearSearchHistory}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      履歴をクリア
                    </button>
                  )}
                </div>
                {searchHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">検索履歴がありません</h3>
                    <p className="mt-1 text-sm text-gray-500">物件検索を行うと履歴が表示されます</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchHistory.map((history) => (
                      <div key={history.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{history.search_query}</p>
                          <p className="text-sm text-gray-600">{history.search_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(history.created_at).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inquiries' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">お問い合わせ履歴</h2>
                {inquiryHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">お問い合わせ履歴がありません</h3>
                    <p className="mt-1 text-sm text-gray-500">物件についてお問い合わせを行うと履歴が表示されます</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inquiryHistory.map((inquiry) => (
                      <div key={inquiry.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">
                            {inquiry.property_name || inquiry.inquiry_type}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            inquiry.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inquiry.status === 'pending' ? '対応中' :
                             inquiry.status === 'completed' ? '完了' : '新規'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{inquiry.inquiry_type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(inquiry.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">プロフィール</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">アカウント作成日</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">最終ログイン</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(user.last_sign_in_at || user.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
