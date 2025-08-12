'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Property {
  id: string
  name: string
  price: number
  property_type: string
  prefecture: string
  city: string
  staff_comment?: string
  image_url?: string
}

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchFeaturedProperties()
  }, [])

  const fetchFeaturedProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .order('featured', { ascending: false })
        .limit(6)

      if (error) throw error
      
      const sortedProperties = (data || []).sort((a, b) => {
        if (a.image_url && !b.image_url) return -1
        if (!a.image_url && b.image_url) return 1
        return 0
      })
      
      setProperties(sortedProperties)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#121212] z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-6">
            <Link href="/" className="flex items-center gap-4 text-decoration-none">
              <div className="w-12 h-12 bg-[#BEAF87] rounded-lg flex items-center justify-center">
                <i className="fas fa-home text-[#121212]"></i>
              </div>
              <div>
                <div className="text-xl font-bold text-white mb-0">ホームマート</div>
                <div className="text-sm text-[#BEAF87] font-medium">CENTURY 21</div>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-12">
              <ul className="flex list-none gap-8">
                <li><a href="#catalog" className="text-white font-medium relative pb-1 hover:text-[#BEAF87] transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BEAF87] after:transition-all after:duration-300 hover:after:w-full">物件検索</a></li>
                <li><a href="#comparison" className="text-white font-medium relative pb-1 hover:text-[#BEAF87] transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BEAF87] after:transition-all after:duration-300 hover:after:w-full">売却査定</a></li>
                <li><a href="#features" className="text-white font-medium relative pb-1 hover:text-[#BEAF87] transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BEAF87] after:transition-all after:duration-300 hover:after:w-full">リフォーム</a></li>
                <li><a href="#footer" className="text-white font-medium relative pb-1 hover:text-[#BEAF87] transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BEAF87] after:transition-all after:duration-300 hover:after:w-full">会社概要</a></li>
              </ul>
              
              <div className="flex gap-4">
                <a href="tel:0120-43-8639" className="inline-flex items-center justify-center px-8 py-3 bg-[#517394] text-white font-semibold rounded-full transition-all duration-300 hover:bg-[#6E8FAF] hover:-translate-y-0.5 hover:shadow-lg min-h-12">
                  <i className="fas fa-phone mr-2"></i>
                  無料相談
                </a>
              </div>
            </nav>
            
            <button 
              className="md:hidden bg-none border-none text-white cursor-pointer p-2"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-24 left-0 right-0 bg-[#121212] flex flex-col p-6 shadow-xl">
            <ul className="flex flex-col gap-6 mb-6">
              <li><a href="#catalog" className="text-white font-medium" onClick={toggleMobileMenu}>物件検索</a></li>
              <li><a href="#comparison" className="text-white font-medium" onClick={toggleMobileMenu}>売却査定</a></li>
              <li><a href="#features" className="text-white font-medium" onClick={toggleMobileMenu}>リフォーム</a></li>
                              <li><Link href="/about" className="text-white font-medium" onClick={toggleMobileMenu}>会社概要</Link></li>
            </ul>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-[#121212] to-[#252526] flex items-center relative mt-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 max-w-4xl">
          <div className="text-[#BEAF87] text-sm font-medium uppercase tracking-widest mb-6">CENTURY 21 HOMEMART</div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            奈良・大阪の不動産、<br />社長直結で最適解へ。
          </h1>
          <p className="text-xl text-white/90 mb-12 leading-relaxed">
            買取再販×仲介×自社施工の一気通貫。<br />
            高く、速く、安心を、ブランド基準で。
          </p>
          
          <div className="flex flex-wrap gap-6 mb-16">
            <button 
              onClick={openModal}
              className="inline-flex items-center justify-center px-8 py-4 bg-[#517394] text-white font-semibold rounded-full transition-all duration-300 hover:bg-[#6E8FAF] hover:-translate-y-1 hover:shadow-xl min-h-12"
            >
              無料相談（最短30秒）
            </button>
            <a href="https://lin.ee/xxxxx" className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border-2 border-[#BEAF87] rounded-full transition-all duration-300 hover:bg-[#BEAF87]/20 hover:-translate-y-1 min-h-12">
              <i className="fab fa-line mr-2"></i>
              LINEで相談
            </a>
          </div>
          
          <div className="grid grid-cols-3 gap-8 pt-16 border-t border-[#BEAF87]/30">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#BEAF87] mb-2">964</div>
              <div className="text-sm text-white/70 uppercase tracking-wider">全国店舗数</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#BEAF87] mb-2">10年</div>
              <div className="text-sm text-white/70 uppercase tracking-wider">地域実績</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#BEAF87] mb-2">100%</div>
              <div className="text-sm text-white/70 uppercase tracking-wider">満足度</div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 -right-20 w-3/5 h-full bg-gradient-to-br from-transparent to-[#BEAF87]/10 pointer-events-none"></div>
      </section>

      {/* Property Catalog Section */}
      <section className="py-28 bg-white" id="catalog">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-[#121212] mb-6">物件を探す</h2>
            <div className="w-20 h-0.5 bg-[#BEAF87] mx-auto mb-6"></div>
            <p className="text-lg text-[#727273] max-w-2xl mx-auto">ご希望の条件から理想の物件をお探しください</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
            <Link href="/properties?type=新築戸建" className="bg-white border border-[#F4F4F6] rounded-xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-[#BEAF87] text-[#121212]">
              <div className="text-4xl mb-4">🏡</div>
              <h3 className="text-lg font-semibold mb-2">新築戸建</h3>
              <p className="text-[#727273]">最新設備の家</p>
            </Link>
            <Link href="/properties?type=中古戸建" className="bg-white border border-[#F4F4F6] rounded-xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-[#BEAF87] text-[#121212]">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-lg font-semibold mb-2">中古戸建</h3>
              <p className="text-[#727273]">リフォーム済み</p>
            </Link>
            <Link href="/properties?type=マンション" className="bg-white border border-[#F4F4F6] rounded-xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-[#BEAF87] text-[#121212]">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-lg font-semibold mb-2">マンション</h3>
              <p className="text-[#727273]">便利な立地</p>
            </Link>
            <Link href="/properties?type=土地" className="bg-white border border-[#F4F4F6] rounded-xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-[#BEAF87] text-[#121212]">
              <div className="text-4xl mb-4">🏞️</div>
              <h3 className="text-lg font-semibold mb-2">売り土地</h3>
              <p className="text-[#727273]">理想の場所</p>
            </Link>
          </div>

          <div className="text-center">
            <Link href="/properties" className="inline-flex items-center justify-center px-8 py-4 bg-[#517394] text-white font-semibold rounded-full transition-all duration-300 hover:bg-[#6E8FAF] hover:-translate-y-1 hover:shadow-xl min-h-12">
              すべての物件を見る →
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-28 bg-[#F4F4F6]" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-[#121212] mb-6">ホームマートの強み</h2>
            <div className="w-20 h-0.5 bg-[#BEAF87] mx-auto mb-6"></div>
            <p className="text-lg text-[#727273] max-w-3xl mx-auto">
              CENTURY 21の全国ネットワークと地域密着型サービスで、<br />
              お客様の不動産取引を成功へ導きます。
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#F4F4F6] rounded-xl p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-[#BEAF87]">
              <div className="w-16 h-16 bg-[#F8F7F2] rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-globe text-2xl text-[#BEAF87]"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">全国964店舗のネットワーク</h3>
              <p className="text-[#727273]">
                CENTURY 21の強力なネットワークを活用し、お客様の物件を全国規模で広く紹介。より多くの購入希望者へアプローチが可能です。
              </p>
            </div>
            
            <div className="bg-white border border-[#F4F4F6] rounded-xl p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-[#BEAF87]">
              <div className="w-16 h-16 bg-[#F8F7F2] rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-tachometer-alt text-2xl text-[#BEAF87]"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">社長直結の迅速対応</h3>
              <p className="text-[#727273]">
                意思決定が速く、お客様のニーズに即座に対応。従来の不動産会社では実現できない柔軟な提案と価格交渉が可能です。
              </p>
            </div>
            
            <div className="bg-white border border-[#F4F4F6] rounded-xl p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-[#BEAF87]">
              <div className="w-16 h-16 bg-[#F8F7F2] rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-tools text-2xl text-[#BEAF87]"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">自社施工でコスト削減</h3>
              <p className="text-[#727273]">
                水回り4点セットから全面改装まで、自社職人による確かな技術で対応。中間マージンをカットし、高品質を適正価格で提供します。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-28 bg-white" id="featured">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-[#121212] mb-6">おすすめ物件</h2>
            <div className="w-20 h-0.5 bg-[#BEAF87] mx-auto mb-6"></div>
            <p className="text-lg text-[#727273]">スタッフが厳選した今週のおすすめ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {properties.slice(0, 3).map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`} className="bg-white border border-[#F4F4F6] rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
                <div className="h-48 overflow-hidden rounded-t-lg mb-6 bg-gradient-to-br from-gray-200 to-gray-300">
                  {property.image_url ? (
                    <img
                      src={property.image_url}
                      alt={property.name}
                      className="w-full h-full object-contain object-center"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl text-gray-400">🏠</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#BEAF87] text-[#121212] text-xs px-2 py-1 rounded-full font-semibold">おすすめ</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{property.name}</h3>
                  <p className="text-2xl font-bold text-[#FF6B00] mb-2">
                    {property.price.toLocaleString()}万円
                  </p>
                  <p className="text-sm text-[#727273]">
                    {property.prefecture} {property.city}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/properties" className="inline-flex items-center justify-center px-8 py-4 bg-[#517394] text-white font-semibold rounded-full transition-all duration-300 hover:bg-[#6E8FAF] hover:-translate-y-1 hover:shadow-xl min-h-12">
              もっと見る →
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-28 bg-[#F4F4F6]" id="comparison">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-[#121212] mb-6">サービス比較</h2>
            <div className="w-20 h-0.5 bg-[#BEAF87] mx-auto mb-6"></div>
            <p className="text-lg text-[#727273] max-w-2xl mx-auto">
              一括査定サイトとホームマートの違いをご確認ください
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 relative border-2 border-transparent">
              <h3 className="text-xl font-semibold text-center mb-6">一括査定サイト</h3>
              <ul className="space-y-4 mb-6">
                <li className="flex items-center">
                  <span className="text-[#727273] mr-3">✕</span>
                  <span>多数の営業電話</span>
                </li>
                <li className="flex items-center">
                  <span className="text-[#727273] mr-3">✕</span>
                  <span>査定額のばらつき</span>
                </li>
                <li className="flex items-center">
                  <span className="text-[#727273] mr-3">✕</span>
                  <span>個人情報の拡散リスク</span>
                </li>
                <li className="flex items-center">
                  <span className="text-[#727273] mr-3">✕</span>
                  <span>対応窓口が不明確</span>
                </li>
                <li className="flex items-center">
                  <span className="text-[#727273] mr-3">✕</span>
                  <span>アフターフォローなし</span>
                </li>
              </ul>
              <button className="w-full inline-flex items-center justify-center px-6 py-3 bg-transparent text-[#121212] border-2 border-[#BEAF87] rounded-full font-semibold transition-all duration-300 hover:bg-[#F8F7F2] hover:-translate-y-1">
                詳細を見る
              </button>
            </div>
            
            <div className="bg-white rounded-xl p-8 relative border-2 border-[#BEAF87]">
              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#BEAF87] text-[#121212] px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                おすすめ
              </span>
              <h3 className="text-xl font-semibold text-center mb-6">ホームマート</h3>
              <ul className="space-y-4 mb-6">
                <li className="flex items-center">
                  <span className="text-[#BEAF87] mr-3">✓</span>
                  <span>専任担当制で安心</span>
                </li>
                <li className="flex items-center">
                  <span className="text-[#BEAF87] mr-3">✓</span>
                  <span>適正な査定価格</span>
                </li>
                <li className="flex items-center">
                  <span className="text-[#BEAF87] mr-3">✓</span>
                  <span>個人情報保護の徹底</span>
                </li>
                <li className="flex items-center">
                  <span className="text-[#BEAF87] mr-3">✓</span>
                  <span>社長直結の迅速対応</span>
                </li>
                <li className="flex items-center">
                  <span className="text-[#BEAF87] mr-3">✓</span>
                  <span>売却後もサポート継続</span>
                </li>
              </ul>
              <button 
                onClick={openModal}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-[#517394] text-white rounded-full font-semibold transition-all duration-300 hover:bg-[#6E8FAF] hover:-translate-y-1 hover:shadow-lg"
              >
                無料相談する
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-28 bg-white" id="process">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-[#121212] mb-6">ご相談から売却まで</h2>
            <div className="w-20 h-0.5 bg-[#BEAF87] mx-auto mb-6"></div>
            <p className="text-lg text-[#727273] max-w-2xl mx-auto">
              シンプルな4ステップで、スムーズな不動産取引を実現
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-5xl mx-auto">
            <div className="text-center relative">
              <div className="w-20 h-20 bg-[#121212] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 relative z-10">1</div>
              <h3 className="text-xl font-semibold mb-4">無料相談</h3>
              <p className="text-sm text-[#727273]">
                お電話・LINE・フォームから<br />
                お気軽にご相談ください
              </p>
            </div>
            
            <div className="text-center relative">
              <div className="w-20 h-20 bg-[#121212] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 relative z-10">2</div>
              <h3 className="text-xl font-semibold mb-4">査定・ご提案</h3>
              <p className="text-sm text-[#727273]">
                現地調査と市場分析により<br />
                適正価格をご提示
              </p>
            </div>
            
            <div className="text-center relative">
              <div className="w-20 h-20 bg-[#121212] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 relative z-10">3</div>
              <h3 className="text-xl font-semibold mb-4">販売活動</h3>
              <p className="text-sm text-[#727273]">
                全国ネットワークを活用し<br />
                効果的な販売戦略を実施
              </p>
            </div>
            
            <div className="text-center relative">
              <div className="w-20 h-20 bg-[#121212] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 relative z-10">4</div>
              <h3 className="text-xl font-semibold mb-4">成約・引渡し</h3>
              <p className="text-sm text-[#727273]">
                契約から引渡しまで<br />
                専任担当が完全サポート
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-28 bg-[#F4F4F6]" id="testimonials">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-[#121212] mb-6">お客様の声</h2>
            <div className="w-20 h-0.5 bg-[#BEAF87] mx-auto mb-6"></div>
            <p className="text-lg text-[#727273]">実際にご利用いただいたお客様からの評価</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 relative">
              <p className="text-xl leading-relaxed mb-6 text-[#121212] relative">
                <span className="text-5xl text-[#BEAF87] leading-none mr-2">"</span>
                他社より300万円高く売却できました。社長直結の交渉力と、CENTURY 21のブランド力の組み合わせが決め手でした。
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#F8F7F2] rounded-full flex items-center justify-center font-bold text-[#746649]">T.K</div>
                <div>
                  <div className="font-semibold">T.K様</div>
                  <div className="text-sm text-[#727273]">奈良市・戸建て売却</div>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fas fa-star text-[#BEAF87] w-4 h-4"></i>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-8 relative">
              <p className="text-xl leading-relaxed mb-6 text-[#121212] relative">
                <span className="text-5xl text-[#BEAF87] leading-none mr-2">"</span>
                リフォームから売却まで一貫してお任せできたので、とても楽でした。自社施工なので費用も抑えられて満足です。
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#F8F7F2] rounded-full flex items-center justify-center font-bold text-[#746649]">M.S</div>
                <div>
                  <div className="font-semibold">M.S様</div>
                  <div className="text-sm text-[#727273]">大阪市・マンション売却</div>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fas fa-star text-[#BEAF87] w-4 h-4"></i>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-8 relative">
              <p className="text-xl leading-relaxed mb-6 text-[#121212] relative">
                <span className="text-5xl text-[#BEAF87] leading-none mr-2">"</span>
                急な転勤で時間がない中、1ヶ月で売却完了。社長直結の意思決定の速さに助けられました。
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#F8F7F2] rounded-full flex items-center justify-center font-bold text-[#746649]">Y.N</div>
                <div>
                  <div className="font-semibold">Y.N様</div>
                  <div className="text-sm text-[#727273]">生駒市・土地売却</div>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fas fa-star text-[#BEAF87] w-4 h-4"></i>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 bg-gradient-to-br from-[#121212] to-[#252526] text-white text-center relative overflow-hidden" id="contact">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">まずは無料相談から</h2>
          <p className="text-xl mb-12 opacity-90">
            不動産のプロが親身になってお応えします。<br />
            お気軽にご相談ください。
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <a href="tel:0120-43-8639" className="inline-flex items-center justify-center px-8 py-4 bg-[#517394] text-white font-semibold rounded-full transition-all duration-300 hover:bg-[#6E8FAF] hover:-translate-y-1 hover:shadow-xl min-h-12">
              <i className="fas fa-phone mr-2"></i>
              0120-43-8639
            </a>
            <button 
              onClick={openModal}
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border-2 border-[#BEAF87] rounded-full font-semibold transition-all duration-300 hover:bg-[#BEAF87]/20 hover:-translate-y-1 min-h-12"
            >
              <i className="fas fa-envelope mr-2"></i>
              お問い合わせフォーム
            </button>
          </div>
          
          <p className="text-white/80 text-sm">
            営業時間: 9:00〜22:00 | 土日祝も対応
          </p>
        </div>
      </section>



      {/* Contact Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">無料査定・ご相談フォーム</h3>
            <form onSubmit={(e) => { e.preventDefault(); closeModal(); }}>
              <div className="mb-4">
                <label htmlFor="name" className="block mb-2 font-semibold">
                  お名前 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#517394] focus:outline-none focus:ring-2 focus:ring-[#517394]/20"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block mb-2 font-semibold">
                  メールアドレス <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#517394] focus:outline-none focus:ring-2 focus:ring-[#517394]/20"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="phone" className="block mb-2 font-semibold">
                  電話番号 <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#517394] focus:outline-none focus:ring-2 focus:ring-[#517394]/20"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="property-type" className="block mb-2 font-semibold">物件種別</label>
                <select
                  id="property-type"
                  name="property-type"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#517394] focus:outline-none focus:ring-2 focus:ring-[#517394]/20"
                >
                  <option value="">選択してください</option>
                  <option value="house">戸建て</option>
                  <option value="apartment">マンション</option>
                  <option value="land">土地</option>
                  <option value="other">その他</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block mb-2 font-semibold">ご相談内容</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#517394] focus:outline-none focus:ring-2 focus:ring-[#517394]/20 resize-vertical"
                ></textarea>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-[#517394] text-white font-semibold rounded-full transition-all duration-300 hover:bg-[#6E8FAF] hover:-translate-y-1 hover:shadow-lg"
                >
                  送信する
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-transparent text-[#121212] border-2 border-[#BEAF87] rounded-full font-semibold transition-all duration-300 hover:bg-[#F8F7F2] hover:-translate-y-1"
                >
                  閉じる
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Font Awesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </>
  )
}
