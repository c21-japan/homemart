'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Footer() {
  useEffect(() => {
    // フッターへのスムーズスクロール機能
    const handleSmoothScroll = () => {
      // スクロールイベントの最適化
      let ticking = false;
      
      const updateScroll = () => {
        ticking = false;
      };
      
      const requestTick = () => {
        if (!ticking) {
          requestAnimationFrame(updateScroll);
          ticking = true;
        }
      };
      
      window.addEventListener('scroll', requestTick, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', requestTick);
      };
    };
    
    handleSmoothScroll();
  }, []);

  // フッターへのスムーズスクロール関数
  const scrollToFooter = () => {
    const footer = document.getElementById('footer');
    if (footer) {
      footer.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <footer className="bg-[#121212] text-white py-28" id="footer">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2 pr-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#BEAF87] rounded-lg flex items-center justify-center">
                <i className="fas fa-home text-[#121212]"></i>
              </div>
              <div>
                <div className="text-xl font-bold">ホームマート</div>
                <div className="text-sm text-[#BEAF87]">CENTURY 21</div>
              </div>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              奈良県で10年間、お客様の不動産に関するあらゆるニーズにお応えしてまいりました。
              これからもCENTURY 21のネットワークを活かし、最高のサービスを提供いたします。
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-[#BEAF87] hover:text-[#121212]">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-[#BEAF87] hover:text-[#121212]">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-[#BEAF87] hover:text-[#121212]">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6 text-[#BEAF87]">サービス</h4>
            <ul className="space-y-3">
              <li><a href="#catalog" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">物件検索</a></li>
              <li><a href="#comparison" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">売却査定</a></li>
              <li><a href="#features" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">リフォーム</a></li>
              <li><a href="#process" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">買取再販</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6 text-[#BEAF87]">会社情報</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">会社概要</Link></li>
              <li><a href="/access" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">アクセス</a></li>
              <li><a href="/recruit" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">採用情報</a></li>
              <li><a href="/news" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">お知らせ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6 text-[#BEAF87]">お問い合わせ</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-white/70">
                <i className="fas fa-phone mr-2 text-[#BEAF87]"></i>
                0120-43-8639
              </li>
              <li className="flex items-center text-white/70">
                <i className="fas fa-envelope mr-2 text-[#BEAF87]"></i>
                info@homemart-nara.com
              </li>
              <li className="flex items-start text-white/70">
                <i className="fas fa-map-marker-alt mr-2 mt-1 text-[#BEAF87]"></i>
                奈良県北葛城郡広陵町笠287-1
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[#BEAF87]/20 flex justify-between items-center flex-wrap gap-4">
          <p className="text-white/50 text-sm">
            &copy; {new Date().getFullYear()} ホームマート（CENTURY 21加盟店）. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-white/50 hover:text-[#BEAF87] transition-colors duration-300">プライバシーポリシー</Link>
            <Link href="/terms" className="text-white/50 hover:text-[#BEAF87] transition-colors duration-300">利用規約</Link>
            <Link href="/disclaimer" className="text-white/50 hover:text-[#BEAF87] transition-colors duration-300">免責事項</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
