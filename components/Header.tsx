'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)
  const pathname = usePathname()
  
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const isActive = (path: string) => pathname === path
  const isHomePage = pathname === '/'

  // ヘッダーの高さを計算し、CSS変数として設定
  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('header')
      if (header) {
        const height = header.offsetHeight
        setHeaderHeight(height)
        document.documentElement.style.setProperty('--header-height', `${height}px`)
      }
    }

    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)
    
    return () => window.removeEventListener('resize', updateHeaderHeight)
  }, [isMobileMenuOpen])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerHeight = document.documentElement.style.getPropertyValue('--header-height')
      const offset = parseInt(headerHeight) || 0
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
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
              {isHomePage ? (
                // トップページの場合はセクション間ナビゲーション
                <>
                  <li>
                    <button 
                      onClick={() => scrollToSection('catalog')}
                      className="text-white font-medium relative pb-1 transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BEAF87] after:transition-all after:duration-300 hover:after:w-full hover:text-[#BEAF87]"
                    >
                      物件検索
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('comparison')}
                      className="text-white font-medium relative pb-1 transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BEAF87] after:transition-all after:duration-300 hover:after:w-full hover:text-[#BEAF87]"
                    >
                      売却査定
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('features')}
                      className="text-white font-medium relative pb-1 transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BEAF87] after:transition-all after:duration-300 hover:after:w-full hover:text-[#BEAF87]"
                    >
                      リフォーム
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('contact')}
                      className="text-white font-medium relative pb-1 transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BEAF87] after:transition-all after:duration-300 hover:after:w-full hover:text-[#BEAF87]"
                    >
                      お問い合わせ
                    </button>
                  </li>
                </>
              ) : (
                // 他のページの場合は通常のナビゲーション
                <>
                  <li>
                    <Link 
                      href="/properties" 
                      className={`font-medium relative pb-1 transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BEAF87] after:transition-all after:duration-300 hover:after:w-full ${
                        isActive('/properties') ? 'text-[#BEAF87] after:w-full' : 'text-white hover:text-[#BEAF87]'
                      }`}
                    >
                      物件検索
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/sell" 
                      className={`font-medium relative pb-1 transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BEAF87] after:transition-all after:duration-300 hover:after:w-full ${
                        isActive('/sell') ? 'text-[#BEAF87] after:w-full' : 'text-white hover:text-[#BEAF87]'
                      }`}
                    >
                      売却査定
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/reform" 
                      className={`font-medium relative pb-1 transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BEAF87] after:transition-all after:duration-300 hover:after:w-full ${
                        isActive('/reform') ? 'text-[#BEAF87] after:w-full' : 'text-white hover:text-[#BEAF87]'
                      }`}
                    >
                      リフォーム
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/about" 
                      className={`font-medium relative pb-1 transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BEAF87] after:transition-all after:duration-300 hover:after:w-full ${
                        isActive('/about') ? 'text-[#BEAF87] after:w-full' : 'text-white hover:text-[#BEAF87]'
                      }`}
                    >
                      会社概要
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/contact" 
                      className={`font-medium relative pb-1 transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BEAF87] after:transition-all after:duration-300 hover:after:w-full ${
                        isActive('/contact') ? 'text-[#BEAF87] after:w-full' : 'text-white hover:text-[#BEAF87]'
                      }`}
                    >
                      お問い合わせ
                    </Link>
                  </li>
                </>
              )}
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-24 left-0 right-0 bg-[#121212] flex flex-col p-6 shadow-xl">
            <ul className="flex flex-col gap-6 mb-6">
              {isHomePage ? (
                // トップページの場合はセクション間ナビゲーション
                <>
                  <li>
                    <button 
                      onClick={() => { scrollToSection('catalog'); toggleMobileMenu(); }}
                      className="text-white font-medium"
                    >
                      物件検索
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => { scrollToSection('comparison'); toggleMobileMenu(); }}
                      className="text-white font-medium"
                    >
                      売却査定
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => { scrollToSection('features'); toggleMobileMenu(); }}
                      className="text-white font-medium"
                    >
                      リフォーム
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => { scrollToSection('contact'); toggleMobileMenu(); }}
                      className="text-white font-medium"
                    >
                      お問い合わせ
                    </button>
                  </li>
                </>
              ) : (
                // 他のページの場合は通常のナビゲーション
                <>
                  <li>
                    <Link 
                      href="/properties" 
                      className={`font-medium ${isActive('/properties') ? 'text-[#BEAF87]' : 'text-white'}`} 
                      onClick={toggleMobileMenu}
                    >
                      物件検索
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/sell" 
                      className={`font-medium ${isActive('/sell') ? 'text-[#BEAF87]' : 'text-white'}`} 
                      onClick={toggleMobileMenu}
                    >
                      売却査定
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/reform" 
                      className={`font-medium ${isActive('/reform') ? 'text-[#BEAF87]' : 'text-white'}`} 
                      onClick={toggleMobileMenu}
                    >
                      リフォーム
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/about" 
                      className={`font-medium ${isActive('/about') ? 'text-[#BEAF87]' : 'text-white'}`} 
                      onClick={toggleMobileMenu}
                    >
                      会社概要
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/contact" 
                      className={`font-medium ${isActive('/contact') ? 'text-[#BEAF87]' : 'text-white'}`} 
                      onClick={toggleMobileMenu}
                    >
                      お問い合わせ
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}
