'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const EMPLOYEE_NAMES = ['豊田', '今津', '山尾']

export default function NewApplication() {
  const router = useRouter()
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedType, setSelectedType] = useState('')

  const handleCreateApplication = () => {
    if (!selectedEmployee || !selectedType) {
      alert('申請者と申請種別を選択してください')
      return
    }

    // 選択された申請種別に基づいて適切なフォームページにリダイレクト
    const formPath = `/admin/internal-applications/forms/${selectedType}?employee=${encodeURIComponent(selectedEmployee)}`
    router.push(formPath)
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ paddingTop: 'var(--header-height, 0px)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">新規申請作成</h1>
              <p className="text-gray-600 mt-2">新しい申請を作成します</p>
            </div>
            <Link
              href="/admin/internal-applications"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              戻る
            </Link>
          </div>
        </div>

        {/* 申請者選択 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">申請者を選択</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">申請者名</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">申請者を選択してください</option>
              {EMPLOYEE_NAMES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 申請種別選択 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">申請種別を選択</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedType('paid_leave')}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                selectedType === 'paid_leave'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">有給申請</h3>
                  <p className="text-sm text-gray-600">有給休暇の申請</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedType('sick_leave')}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                selectedType === 'sick_leave'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">病気休暇</h3>
                  <p className="text-sm text-gray-600">病気休暇の申請</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedType('expense')}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                selectedType === 'expense'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">経費申請</h3>
                  <p className="text-sm text-gray-600">経費の申請</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedType('other')}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                selectedType === 'other'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">その他申請</h3>
                  <p className="text-sm text-gray-600">その他の申請</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 作成ボタン */}
        {selectedEmployee && selectedType && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                <span className="font-semibold">{selectedEmployee}</span> の
                <span className="font-semibold">
                  {selectedType === 'paid_leave' && '有給申請'}
                  {selectedType === 'sick_leave' && '病気休暇'}
                  {selectedType === 'expense' && '経費申請'}
                  {selectedType === 'other' && 'その他申請'}
                </span>
                を作成します
              </p>
              <button
                onClick={handleCreateApplication}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg"
              >
                申請フォームを作成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
