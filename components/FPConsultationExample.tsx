'use client'

import { useState } from 'react'
import FPConsultation from './FPConsultation'

export default function FPConsultationExample() {
  const [inquiries] = useState([
    {
      id: 1,
      name: '田中太郎',
      email: 'tanaka@example.com',
      phone: '090-1234-5678',
      message: '住宅購入について相談したいです',
      fp_consultation_requested: true,
      fp_info: {
        consultationDate: '2024-01-15T10:00',
        consultation_topics: ['住宅ローン', 'ライフプラン'],
        financial_goals: ['住宅購入'],
        monthly_income: 500000,
        fp_status: 'scheduled'
      }
    },
    {
      id: 2,
      name: '佐藤花子',
      email: 'sato@example.com',
      phone: '080-9876-5432',
      message: 'リフォームの見積もりをお願いします',
      fp_consultation_requested: false
    },
    {
      id: 3,
      name: '山田次郎',
      email: 'yamada@example.com',
      phone: '070-5555-1111',
      message: 'FP相談を希望します',
      fp_consultation_requested: true,
      fp_info: {
        consultationDate: '2024-01-20T14:00',
        consultation_topics: ['資産運用', '老後資金準備'],
        financial_goals: ['資産運用', '老後資金準備'],
        monthly_income: 800000,
        monthly_expenses: 400000,
        current_savings: 20000000,
        fp_status: 'pending'
      }
    }
  ])

  const handleFPUpdate = (inquiryId: number, data: any) => {
    console.log(`FP相談情報が更新されました - 問い合わせID: ${inquiryId}`, data)
    // ここで親コンポーネントの状態を更新する処理を追加
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">FP相談管理システム</h1>
      
      <div className="grid gap-6">
        {inquiries.map((inquiry) => (
          <div key={inquiry.id} className="border border-gray-200 rounded-lg">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{inquiry.name}</h3>
                  <p className="text-sm text-gray-600">{inquiry.email} | {inquiry.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">問い合わせID: {inquiry.id}</p>
                  <p className="text-sm text-gray-600">
                    {inquiry.fp_consultation_requested ? 'FP相談希望' : 'FP相談なし'}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mt-2">{inquiry.message}</p>
            </div>
            
            {inquiry.fp_consultation_requested && (
              <FPConsultation
                inquiryId={inquiry.id}
                initialData={inquiry.fp_info}
                onUpdate={(data) => handleFPUpdate(inquiry.id, data)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
