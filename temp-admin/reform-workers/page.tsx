'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ReformProject {
  id: string
  name: string
  clientName: string
  startDate: string
  plannedEndDate: string
  actualEndDate?: string
  budget: number
  status: 'planning' | 'in_progress' | 'completed' | 'delayed'
  workers: string[]
  location: string
  projectType: string
}

interface Worker {
  id: string
  name: string
  specialty: string
  hourlyRate: number
  currentProjects: string[]
  completedProjects: number
  totalEarnings: number
  averageCompletionTime: number
  qualityRating: number
  incentiveEarnings: number
  rank: number
}

interface WorkerPerformance {
  workerId: string
  projectId: string
  projectName: string
  plannedDays: number
  actualDays: number
  daysSaved: number
  incentiveEarned: number
  qualityScore: number
  clientSatisfaction: number
}

export default function ReformWorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: 'W001',
      name: '田中大工',
      specialty: '内装工事',
      hourlyRate: 2500,
      currentProjects: ['P001', 'P003'],
      completedProjects: 45,
      totalEarnings: 8500000,
      averageCompletionTime: 0.85,
      qualityRating: 4.8,
      incentiveEarnings: 1200000,
      rank: 1
    },
    {
      id: 'W002',
      name: '佐藤電気',
      specialty: '電気工事',
      hourlyRate: 2800,
      currentProjects: ['P002'],
      completedProjects: 38,
      totalEarnings: 7200000,
      averageCompletionTime: 0.92,
      qualityRating: 4.6,
      incentiveEarnings: 850000,
      rank: 2
    },
    {
      id: 'W003',
      name: '鈴木配管',
      specialty: '配管工事',
      hourlyRate: 2600,
      currentProjects: ['P001', 'P004'],
      completedProjects: 42,
      totalEarnings: 7800000,
      averageCompletionTime: 0.88,
      qualityRating: 4.7,
      incentiveEarnings: 950000,
      rank: 3
    },
    {
      id: 'W004',
      name: '高橋左官',
      specialty: '左官工事',
      hourlyRate: 2400,
      currentProjects: ['P003'],
      completedProjects: 35,
      totalEarnings: 6500000,
      averageCompletionTime: 0.95,
      qualityRating: 4.5,
      incentiveEarnings: 650000,
      rank: 4
    },
    {
      id: 'W005',
      name: '渡辺塗装',
      specialty: '塗装工事',
      hourlyRate: 2200,
      currentProjects: ['P002', 'P004'],
      completedProjects: 32,
      totalEarnings: 5800000,
      averageCompletionTime: 0.98,
      qualityRating: 4.4,
      incentiveEarnings: 520000,
      rank: 5
    }
  ])

  const [projects, setProjects] = useState<ReformProject[]>([
    {
      id: 'P001',
      name: '奈良県民家リフォーム',
      clientName: '山田様',
      startDate: '2024-08-01',
      plannedEndDate: '2024-09-15',
      actualEndDate: '2024-09-10',
      budget: 2500000,
      status: 'completed',
      workers: ['W001', 'W003'],
      location: '奈良県',
      projectType: '住宅リフォーム'
    },
    {
      id: 'P002',
      name: '南大阪マンション改修',
      clientName: '佐藤様',
      startDate: '2024-08-10',
      plannedEndDate: '2024-09-30',
      budget: 1800000,
      status: 'in_progress',
      workers: ['W002', 'W005'],
      location: '南大阪',
      projectType: 'マンション改修'
    },
    {
      id: 'P003',
      name: '京都古民家修復',
      clientName: '田中様',
      startDate: '2024-08-15',
      plannedEndDate: '2024-10-15',
      budget: 3200000,
      status: 'in_progress',
      workers: ['W001', 'W004'],
      location: '京都',
      projectType: '古民家修復'
    },
    {
      id: 'P004',
      name: '神戸オフィス改装',
      clientName: '株式会社ABC',
      startDate: '2024-08-20',
      plannedEndDate: '2024-10-20',
      budget: 4100000,
      status: 'in_progress',
      workers: ['W003', 'W005'],
      location: '神戸',
      projectType: 'オフィス改装'
    }
  ])

  const [workerPerformance, setWorkerPerformance] = useState<WorkerPerformance[]>([
    {
      workerId: 'W001',
      projectId: 'P001',
      projectName: '奈良県民家リフォーム',
      plannedDays: 45,
      actualDays: 40,
      daysSaved: 5,
      incentiveEarned: 150000,
      qualityScore: 4.9,
      clientSatisfaction: 5.0
    },
    {
      workerId: 'W002',
      projectId: 'P002',
      projectName: '南大阪マンション改修',
      plannedDays: 50,
      actualDays: 46,
      daysSaved: 4,
      incentiveEarned: 120000,
      qualityScore: 4.7,
      clientSatisfaction: 4.8
    }
  ])

  const [selectedWorker, setSelectedWorker] = useState<string>('W001')
  const [lastUpdated, setLastUpdated] = useState<string>('2024-08-15 09:00:00')

  // 職人ランキング（インセンティブ獲得額順）
  const workerRanking = [...workers].sort((a, b) => b.incentiveEarnings - a.incentiveEarnings)

  // 選択された職人の詳細
  const selectedWorkerData = workers.find(worker => worker.id === selectedWorker)
  const selectedWorkerProjects = projects.filter(project => 
    project.workers.includes(selectedWorker)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'planning': return 'bg-gray-100 text-gray-800'
      case 'delayed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '完了'
      case 'in_progress': return '進行中'
      case 'planning': return '計画中'
      case 'delayed': return '遅延'
      default: return '不明'
    }
  }

  const calculateIncentive = (daysSaved: number, budget: number) => {
    // 納期短縮1日につき予算の1%をインセンティブとして支給
    return Math.floor(daysSaved * budget * 0.01)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          リフォーム職人管理
        </h1>
        <p className="text-gray-600">
          職人のモチベーション向上と品質向上を図る管理システム
        </p>
        <div className="mt-4 text-sm text-gray-500">
          最終更新: {lastUpdated} (毎日朝9時に自動更新)
        </div>
      </div>

      {/* インセンティブ制度の説明 */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-2">💰 インセンティブ制度</h2>
        <p className="text-lg mb-4">
          納期を早く終わらせれば、現場数が増えて売上に直結！頑張った分だけ収入アップ！
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-3xl font-bold">1日短縮</div>
            <div className="text-sm">予算の1%</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-3xl font-bold">品質向上</div>
            <div className="text-sm">評価アップ</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-3xl font-bold">現場増加</div>
            <div className="text-sm">収入アップ</div>
          </div>
        </div>
      </div>

      {/* 職人ランキング */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🏆 職人ランキング（インセンティブ獲得額）
          </h2>
          <div className="space-y-3">
            {workerRanking.map((worker, index) => (
              <div
                key={worker.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedWorker === worker.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedWorker(worker.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-800' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-400 text-orange-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{worker.name}</div>
                    <div className="text-sm text-gray-600">{worker.specialty}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {worker.incentiveEarnings.toLocaleString()}円
                    </div>
                    <div className="text-xs text-gray-500">インセンティブ</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 選択された職人の詳細 */}
        {selectedWorkerData && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              👷 {selectedWorkerData.name} - 詳細情報
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">専門分野</div>
                  <div className="font-medium">{selectedWorkerData.specialty}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">時給</div>
                  <div className="font-medium">{selectedWorkerData.hourlyRate?.toLocaleString() || '0'}円</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">完了プロジェクト数</div>
                  <div className="font-medium">{selectedWorkerData.completedProjects || 0}件</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">総収入</div>
                  <div className="font-medium">{selectedWorkerData.totalEarnings?.toLocaleString() || '0'}円</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">平均納期短縮率</div>
                  <div className="font-medium">{selectedWorkerData.averageCompletionTime ? ((1 - selectedWorkerData.averageCompletionTime) * 100).toFixed(1) : '0'}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">品質評価</div>
                  <div className="font-medium">{selectedWorkerData.qualityRating || 0}/5.0</div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedWorkerData.incentiveEarnings?.toLocaleString() || '0'}円
                  </div>
                  <div className="text-sm text-blue-600">累計インセンティブ獲得額</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 現在進行中のプロジェクト */}
      {selectedWorkerData && (
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔨 {selectedWorkerData.name} - 現在のプロジェクト
          </h3>
          <div className="space-y-4">
            {selectedWorkerProjects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-600">{project.clientName} - {project.location}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">開始日: </span>
                    <span className="font-medium">{project.startDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">予定完了: </span>
                    <span className="font-medium">{project.plannedEndDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">予算: </span>
                    <span className="font-medium">{project.budget.toLocaleString()}円</span>
                  </div>
                  <div>
                    <span className="text-gray-600">種別: </span>
                    <span className="font-medium">{project.projectType}</span>
                  </div>
                </div>
                {project.status === 'completed' && project.actualEndDate && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-800">
                      <span className="font-medium">完了日: {project.actualEndDate}</span>
                      {(() => {
                        const planned = new Date(project.plannedEndDate)
                        const actual = new Date(project.actualEndDate)
                        const daysDiff = Math.ceil((planned.getTime() - actual.getTime()) / (1000 * 60 * 60 * 24))
                        if (daysDiff > 0) {
                          const incentive = calculateIncentive(daysDiff, project.budget)
                          return ` - ${daysDiff}日早く完了！インセンティブ: ${incentive.toLocaleString()}円`
                        }
                        return ''
                      })()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* プロジェクト一覧 */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 全プロジェクト一覧
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  プロジェクト名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  クライアント
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  場所
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  予算
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状況
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  担当職人
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{project.clientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{project.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{project.budget.toLocaleString()}円</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {project.workers.map(workerId => {
                        const worker = workers.find(w => w.id === workerId)
                        return worker ? worker.name : workerId
                      }).join(', ')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex space-x-4 mb-8">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          新しい職人を追加
        </button>
        <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
          プロジェクトを追加
        </button>
        <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
          インセンティブ計算
        </button>
      </div>

      {/* モチベーション向上メッセージ */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">🚀 職人としての成長を目指そう！</h3>
        <p className="mb-4">
          納期短縮でインセンティブを獲得し、品質向上で評価アップ！
          頑張った分だけ収入が増え、より多くの現場を任されるようになります。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">納期短縮</div>
            <div className="text-sm">インセンティブ獲得</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">品質向上</div>
            <div className="text-sm">評価アップ</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">現場増加</div>
            <div className="text-sm">収入アップ</div>
          </div>
        </div>
      </div>
    </div>
  )
}
