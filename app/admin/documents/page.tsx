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
    </div>
  );
}
