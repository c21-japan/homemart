'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

interface ReformProject {
  id: string
  title: string
  before_image_url: string
  after_image_url: string
  description?: string
  created_at: string
}

export default function ReformPage() {
  const [projects, setProjects] = useState<ReformProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReformProjects()
  }, [])

  const fetchReformProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('reform_projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching reform projects:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              リフォームで理想の住まいを
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              センチュリー21 ホームマートが、あなたの住まいをより快適で美しくリフォームいたします
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                無料相談・お見積り
              </a>
              <a
                href="tel:0120-43-8639"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                📞 0120-43-8639
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* サービス紹介 */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              リフォームサービス
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              住まいの様々なニーズに対応するリフォームサービスをご提供いたします
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">内装リフォーム</h3>
              <p className="text-gray-600">
                壁紙、床材、天井材の張り替えから、キッチン、浴室、トイレの設備更新まで
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">外装リフォーム</h3>
              <p className="text-gray-600">
                外壁塗装、屋根塗装、サイディング張り替えなど、外観の美しさと耐久性を向上
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">設備更新</h3>
              <p className="text-gray-600">
                給排水設備、電気設備、空調設備の更新で、快適性と安全性を向上
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">断熱・遮熱</h3>
              <p className="text-gray-600">
                断熱材の施工、窓の二重化などで、省エネ性と快適性を大幅に向上
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">耐震・制震</h3>
              <p className="text-gray-600">
                耐震補強工事、制震装置の設置で、地震に対する安全性を向上
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">バリアフリー</h3>
              <p className="text-gray-600">
                手すりの設置、段差の解消などで、高齢者や障がい者に配慮した住まいに
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 施工実績 */}
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              施工実績
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              お客様のご要望に応じて、数多くのリフォーム工事を手がけてまいりました
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {/* 施工前後の画像を横並びで表示 */}
                  <div className="grid grid-cols-2 gap-0">
                    <div className="relative h-64">
                      <Image
                        src={project.before_image_url}
                        alt={`${project.title} - 施工前`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        施工前
                      </div>
                    </div>
                    <div className="relative h-64">
                      <Image
                        src={project.after_image_url}
                        alt={`${project.title} - 施工後`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        施工後
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-gray-600 mb-4">
                        {project.description}
                      </p>
                    )}
                    <div className="text-sm text-gray-500">
                      施工完了: {new Date(project.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">施工実績の準備中です</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA セクション */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            リフォームで理想の住まいを実現しませんか？
          </h2>
          <p className="text-xl mb-8 opacity-90">
            無料相談・お見積りを承っております。お気軽にお問い合わせください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              無料相談・お見積り
            </a>
            <a
              href="tel:0120-43-8639"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              📞 0120-43-8639
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
