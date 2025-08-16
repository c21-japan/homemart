'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        // モックデータ
        const mockDocuments = [
          { 
            id: 1, 
            name: '物件契約書_田中様.pdf', 
            category: '契約書', 
            uploadDate: '2025-08-10',
            size: '2.3MB',
            status: '承認済み'
          },
          { 
            id: 2, 
            name: '重要事項説明書_佐藤様.pdf', 
            category: '重要事項説明書', 
            uploadDate: '2025-08-12',
            size: '1.8MB',
            status: '確認中'
          },
          { 
            id: 3, 
            name: '物件図面_マンション101.pdf', 
            category: '図面', 
            uploadDate: '2025-08-14',
            size: '5.2MB',
            status: '承認済み'
          }
        ];
        setDocuments(mockDocuments);
      } catch (error) {
        console.error('書類取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const categories = ['all', '契約書', '重要事項説明書', '図面', 'その他'];
  
  const filteredDocuments = categoryFilter === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === categoryFilter);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">書類管理</h1>
        <Link
          href="/admin/documents/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          書類アップロード
        </Link>
      </div>

      <div className="mb-4 flex space-x-4">
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'すべてのカテゴリ' : category}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  書類名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カテゴリ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アップロード日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  サイズ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((document) => (
                <tr key={document.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {document.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.uploadDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      document.status === '承認済み' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {document.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">ダウンロード</button>
                    <button className="text-red-600 hover:text-red-900">削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredDocuments.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">書類が見つかりません</p>
        </div>
      )}

      {/* フッター */}
      <footer className="bg-[#121212] text-white py-28 mt-16" id="footer">
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
                <li><a className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300" href="/about">会社概要</a></li>
                <li><a href="/access" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">アクセス</a></li>
                <li><a href="/recruit" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">採用情報</a></li>
                <li><a href="/news" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">お知らせ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6 text-[#BEAF87]">お問い合わせ</h4>
              <ul className="space-y-3">
                <li className="flex items-center text-white/70">
                  <i className="fas fa-phone mr-2 text-[#BEAF87]"></i>0120-43-8639
                </li>
                <li className="flex items-center text-white/70">
                  <i className="fas fa-envelope mr-2 text-[#BEAF87]"></i>info@homemart-nara.com
                </li>
                <li className="flex items-start text-white/70">
                  <i className="fas fa-map-marker-alt mr-2 mt-1 text-[#BEAF87]"></i>奈良県北葛城郡広陵町笠287-1
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[#BEAF87]/20 flex justify-between items-center flex-wrap gap-4">
            <p className="text-white/50 text-sm">© 2025 ホームマート（CENTURY 21加盟店）. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a className="text-white/50 hover:text-[#BEAF87] transition-colors duration-300" href="/privacy">プライバシーポリシー</a>
              <a className="text-white/50 hover:text-[#BEAF87] transition-colors duration-300" href="/terms">利用規約</a>
              <a className="text-white/50 hover:text-[#BEAF87] transition-colors duration-300" href="/disclaimer">免責事項</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
