'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('property-report')

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">事務書類管理</h1>
        <p className="text-gray-600">各種事務書類の確認・管理を行います</p>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('property-report')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'property-report'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            物件状況等報告書・付帯設備表
          </button>
          <button
            onClick={() => setActiveTab('other-documents')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'other-documents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            その他の書類
          </button>
        </nav>
      </div>

      {/* 物件状況等報告書・付帯設備表 */}
      {activeTab === 'property-report' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              物件状況等報告書・付帯設備表
            </h2>
            <p className="text-gray-600">
              売買契約に必要な物件の状況報告書と付帯設備の確認表です
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">📋 基本情報</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 物件名・部屋番号</li>
                  <li>• 売主様情報</li>
                  <li>• 使用状況</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">🏠 物件状況</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• 雨漏り・水漏れ</li>
                  <li>• シロアリ被害</li>
                  <li>• 給排水管の状況</li>
                  <li>• 火災・事故履歴</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">🚿 付帯設備</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• キッチン設備</li>
                  <li>• 浴室・トイレ設備</li>
                  <li>• 空調・収納設備</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-2">🏘️ 周辺環境</h3>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• 騒音・振動・臭気</li>
                  <li>• 事件・事故履歴</li>
                  <li>• 建築計画</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/admin/documents/property-report-form"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                新規作成
              </Link>
              
              <Link
                href="/admin/documents/property-report-list"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                一覧表示
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* その他の書類 */}
      {activeTab === 'other-documents' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">その他の事務書類</h2>
          <p className="text-gray-600 mb-6">
            今後追加予定の書類がここに表示されます
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>追加予定</p>
            </div>
          </div>
        </div>
      )}

      {/* 戻るボタン */}
      <div className="mt-6">
        <Link
          href="/admin"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          管理画面に戻る
        </Link>
      </div>
    </div>
  )
}
