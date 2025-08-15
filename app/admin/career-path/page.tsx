'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CareerGoal {
  id: string
  title: string
  description: string
  targetDate: string
  requiredSales: number
  requiredLeads: number
  requiredProperties: number
  status: 'not_started' | 'in_progress' | 'completed'
  progress: number
}

interface SalesPerson {
  id: string
  name: string
  currentLevel: string
  currentSales: number
  currentLeads: number
  currentProperties: number
  nextGoal: string
  estimatedPromotionDate: string
}

export default function CareerPathPage() {
  const [careerGoals, setCareerGoals] = useState<CareerGoal[]>([
    {
      id: '1',
      title: '営業マン（初級）',
      description: '基本的な営業スキルを習得し、月間売上100万円を達成',
      targetDate: '2024-12-31',
      requiredSales: 1000000,
      requiredLeads: 50,
      requiredProperties: 10,
      status: 'in_progress',
      progress: 75
    },
    {
      id: '2',
      title: '営業マン（中級）',
      description: '月間売上300万円を達成し、チームリーダーとしての素質を発揮',
      targetDate: '2025-06-30',
      requiredSales: 3000000,
      requiredLeads: 100,
      requiredProperties: 25,
      status: 'not_started',
      progress: 0
    },
    {
      id: '3',
      title: '営業マネージャー',
      description: 'チーム全体の売上目標達成と後輩の育成を担う',
      targetDate: '2025-12-31',
      requiredSales: 10000000,
      requiredLeads: 300,
      requiredProperties: 80,
      status: 'not_started',
      progress: 0
    },
    {
      id: '4',
      title: '子会社社長候補',
      description: '新規事業の立ち上げと子会社の経営を担う',
      targetDate: '2026-12-31',
      requiredSales: 50000000,
      requiredLeads: 1000,
      requiredProperties: 200,
      status: 'not_started',
      progress: 0
    }
  ])

  const [salesPeople, setSalesPeople] = useState<SalesPerson[]>([
    {
      id: '1',
      name: '田中太郎',
      currentLevel: '営業マン（初級）',
      currentSales: 750000,
      currentLeads: 38,
      currentProperties: 8,
      nextGoal: '営業マン（中級）',
      estimatedPromotionDate: '2024-12-31'
    },
    {
      id: '2',
      name: '佐藤花子',
      currentLevel: '営業マン（中級）',
      currentSales: 2800000,
      currentLeads: 95,
      currentProperties: 23,
      nextGoal: '営業マネージャー',
      estimatedPromotionDate: '2025-06-30'
    }
  ])

  const [selectedGoal, setSelectedGoal] = useState<CareerGoal | null>(null)
  const [showGoalModal, setShowGoalModal] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '完了'
      case 'in_progress': return '進行中'
      default: return '未開始'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          キャリアパス管理
        </h1>
        <p className="text-gray-600">
          営業マンの成長と子会社社長への道筋を管理し、モチベーション向上を図ります
        </p>
      </div>

      {/* インスピレーションメッセージ */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-2">🚀 夢は必ず叶う！</h2>
        <p className="text-lg mb-4">
          頑張れば必ず子会社の社長になれる！それがホームマートの約束です。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-3xl font-bold">1000+</div>
            <div className="text-sm">リード獲得</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-3xl font-bold">5000万+</div>
            <div className="text-sm">月間売上</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-3xl font-bold">200+</div>
            <div className="text-sm">物件成約</div>
          </div>
        </div>
      </div>

      {/* キャリアゴール一覧 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            キャリアゴール設定
          </h2>
          <div className="space-y-4">
            {careerGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedGoal(goal)
                  setShowGoalModal(true)
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                    {getStatusText(goal.status)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{goal.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>目標売上: {goal.requiredSales.toLocaleString()}円</span>
                    <span>目標日: {goal.targetDate}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-gray-500">{goal.progress}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 営業マン進捗状況 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            営業マン進捗状況
          </h2>
          <div className="space-y-4">
            {salesPeople.map((person) => (
              <div key={person.id} className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{person.name}</h3>
                    <p className="text-sm text-gray-600">{person.currentLevel}</p>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">
                    次の目標: {person.nextGoal}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {person.currentSales.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">月間売上</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {person.currentLeads}
                    </div>
                    <div className="text-xs text-gray-500">リード数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {person.currentProperties}
                    </div>
                    <div className="text-xs text-gray-500">物件数</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  推定昇進予定: {person.estimatedPromotionDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex space-x-4 mb-8">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          新しいキャリアゴールを追加
        </button>
        <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
          営業マンを追加
        </button>
        <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
          進捗レポート出力
        </button>
      </div>

      {/* モチベーション向上のヒント */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">
          💡 モチベーション向上のヒント
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
          <ul className="space-y-1">
            <li>• 毎日の小さな成功を記録しよう</li>
            <li>• 先輩の成功事例を参考にしよう</li>
            <li>• 定期的な目標見直しで軌道修正</li>
          </ul>
          <ul className="space-y-1">
            <li>• チームメンバーと目標を共有しよう</li>
            <li>• スキルアップ研修に積極参加</li>
            <li>• 顧客からの感謝の声を大切に</li>
          </ul>
        </div>
      </div>

      {/* ゴール詳細モーダル */}
      {showGoalModal && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {selectedGoal.title}
            </h3>
            <p className="text-gray-600 mb-4">{selectedGoal.description}</p>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>目標売上:</span>
                <span className="font-semibold">{selectedGoal.requiredSales.toLocaleString()}円</span>
              </div>
              <div className="flex justify-between">
                <span>目標リード数:</span>
                <span className="font-semibold">{selectedGoal.requiredLeads}件</span>
              </div>
              <div className="flex justify-between">
                <span>目標物件数:</span>
                <span className="font-semibold">{selectedGoal.requiredProperties}件</span>
              </div>
              <div className="flex justify-between">
                <span>目標日:</span>
                <span className="font-semibold">{selectedGoal.targetDate}</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowGoalModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                閉じる
              </button>
              <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                編集
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
