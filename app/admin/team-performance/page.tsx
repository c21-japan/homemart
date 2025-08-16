'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Store {
  id: string
  name: string
  monthlyTarget: number
  monthlyCurrent: number
  monthlyAchievement: number
  teams: Team[]
}

interface Team {
  id: string
  name: string
  storeId: string
  monthlyTarget: number
  monthlyCurrent: number
  monthlyAchievement: number
  members: TeamMember[]
}

interface TeamMember {
  id: string
  name: string
  teamId: string
  monthlyTarget: number
  monthlyCurrent: number
  monthlyAchievement: number
  isTopPerformer: boolean
  rank: number
}

interface RankingData {
  storeRanking: Store[]
  teamRanking: Team[]
  individualRanking: TeamMember[]
  lastUpdated: string
}

export default function TeamPerformancePage() {
  const [stores, setStores] = useState<Store[]>([
    {
      id: '1',
      name: '奈良県店舗',
      monthlyTarget: 50000000,
      monthlyCurrent: 42000000,
      monthlyAchievement: 84,
      teams: [
        {
          id: '1A',
          name: 'チーム1A',
          storeId: '1',
          monthlyTarget: 18000000,
          monthlyCurrent: 15000000,
          monthlyAchievement: 83.3,
          members: [
            {
              id: '1A-001',
              name: '田中太郎',
              teamId: '1A',
              monthlyTarget: 6000000,
              monthlyCurrent: 5500000,
              monthlyAchievement: 91.7,
              isTopPerformer: true,
              rank: 1
            },
            {
              id: '1A-002',
              name: '佐藤花子',
              teamId: '1A',
              monthlyTarget: 6000000,
              monthlyCurrent: 4800000,
              monthlyAchievement: 80.0,
              isTopPerformer: false,
              rank: 3
            },
            {
              id: '1A-003',
              name: '鈴木一郎',
              teamId: '1A',
              monthlyTarget: 6000000,
              monthlyCurrent: 4700000,
              monthlyAchievement: 78.3,
              isTopPerformer: false,
              rank: 4
            }
          ]
        },
        {
          id: '1B',
          name: 'チーム1B',
          storeId: '1',
          monthlyTarget: 16000000,
          monthlyCurrent: 14000000,
          monthlyAchievement: 87.5,
          members: [
            {
              id: '1B-001',
              name: '高橋美咲',
              teamId: '1B',
              monthlyTarget: 5500000,
              monthlyCurrent: 5200000,
              monthlyAchievement: 94.5,
              isTopPerformer: false,
              rank: 2
            },
            {
              id: '1B-002',
              name: '渡辺健太',
              teamId: '1B',
              monthlyTarget: 5500000,
              monthlyCurrent: 4800000,
              monthlyAchievement: 87.3,
              isTopPerformer: false,
              rank: 5
            },
            {
              id: '1B-003',
              name: '伊藤麻衣',
              teamId: '1B',
              monthlyTarget: 5000000,
              monthlyCurrent: 4000000,
              monthlyAchievement: 80.0,
              isTopPerformer: false,
              rank: 6
            }
          ]
        },
        {
          id: '1C',
          name: 'チーム1C',
          storeId: '1',
          monthlyTarget: 16000000,
          monthlyCurrent: 13000000,
          monthlyAchievement: 81.3,
          members: [
            {
              id: '1C-001',
              name: '山田次郎',
              teamId: '1C',
              monthlyTarget: 5500000,
              monthlyCurrent: 4500000,
              monthlyAchievement: 81.8,
              isTopPerformer: false,
              rank: 7
            },
            {
              id: '1C-002',
              name: '中村愛子',
              teamId: '1C',
              monthlyTarget: 5500000,
              monthlyCurrent: 4500000,
              monthlyAchievement: 81.8,
              isTopPerformer: false,
              rank: 8
            },
            {
              id: '1C-003',
              name: '小林正人',
              teamId: '1C',
              monthlyTarget: 5000000,
              monthlyCurrent: 4000000,
              monthlyAchievement: 80.0,
              isTopPerformer: false,
              rank: 9
            }
          ]
        }
      ]
    },
    {
      id: '2',
      name: '南大阪店舗',
      monthlyTarget: 40000000,
      monthlyCurrent: 32000000,
      monthlyAchievement: 80,
      teams: [
        {
          id: '2A',
          name: 'チーム2A',
          storeId: '2',
          monthlyTarget: 14000000,
          monthlyCurrent: 12000000,
          monthlyAchievement: 85.7,
          members: [
            {
              id: '2A-001',
              name: '加藤優子',
              teamId: '2A',
              monthlyTarget: 5000000,
              monthlyCurrent: 4500000,
              monthlyAchievement: 90.0,
              isTopPerformer: false,
              rank: 10
            },
            {
              id: '2A-002',
              name: '松本大輔',
              teamId: '2A',
              monthlyTarget: 5000000,
              monthlyCurrent: 4000000,
              monthlyAchievement: 80.0,
              isTopPerformer: false,
              rank: 11
            },
            {
              id: '2A-003',
              name: '井上真理',
              teamId: '2A',
              monthlyTarget: 4000000,
              monthlyCurrent: 3500000,
              monthlyAchievement: 87.5,
              isTopPerformer: false,
              rank: 12
            }
          ]
        },
        {
          id: '2B',
          name: 'チーム2B',
          storeId: '2',
          monthlyTarget: 13000000,
          monthlyCurrent: 10000000,
          monthlyAchievement: 76.9,
          members: [
            {
              id: '2B-001',
              name: '木村和也',
              teamId: '2B',
              monthlyTarget: 4500000,
              monthlyCurrent: 3800000,
              monthlyAchievement: 84.4,
              isTopPerformer: false,
              rank: 13
            },
            {
              id: '2B-002',
              name: '斎藤恵美',
              teamId: '2B',
              monthlyTarget: 4500000,
              monthlyCurrent: 3500000,
              monthlyAchievement: 77.8,
              isTopPerformer: false,
              rank: 14
            },
            {
              id: '2B-003',
              name: '岡本直樹',
              teamId: '2B',
              monthlyTarget: 4000000,
              monthlyCurrent: 2700000,
              monthlyAchievement: 67.5,
              isTopPerformer: false,
              rank: 15
            }
          ]
        },
        {
          id: '2C',
          name: 'チーム2C',
          storeId: '2',
          monthlyTarget: 13000000,
          monthlyCurrent: 10000000,
          monthlyAchievement: 76.9,
          members: [
            {
              id: '2C-001',
              name: '森田美咲',
              teamId: '2C',
              monthlyTarget: 4500000,
              monthlyCurrent: 3800000,
              monthlyAchievement: 84.4,
              isTopPerformer: false,
              rank: 16
            },
            {
              id: '2C-002',
              name: '池田健一',
              teamId: '2C',
              monthlyTarget: 4500000,
              monthlyCurrent: 3500000,
              monthlyAchievement: 77.8,
              isTopPerformer: false,
              rank: 17
            },
            {
              id: '2C-003',
              name: '石川由美',
              teamId: '2C',
              monthlyTarget: 4000000,
              monthlyCurrent: 2700000,
              monthlyAchievement: 67.5,
              isTopPerformer: false,
              rank: 18
            }
          ]
        }
      ]
    }
  ])

  const [selectedStore, setSelectedStore] = useState<string>('1')
  const [selectedTeam, setSelectedTeam] = useState<string>('1A')
  const [lastUpdated, setLastUpdated] = useState<string>('2025-08-15 08:00:00')

  // 全店舗ランキング
  const storeRanking = [...stores].sort((a, b) => b.monthlyAchievement - a.monthlyAchievement)

  // 全チームランキング
  const teamRanking = stores.flatMap(store => store.teams).sort((a, b) => b.monthlyAchievement - a.monthlyAchievement)

  // 全個人ランキング
  const individualRanking = stores.flatMap(store => 
    store.teams.flatMap(team => team.members)
  ).sort((a, b) => b.monthlyAchievement - a.monthlyAchievement)

  const getAchievementColor = (achievement: number) => {
    if (achievement >= 90) return 'text-green-600'
    if (achievement >= 80) return 'text-blue-600'
    if (achievement >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAchievementBgColor = (achievement: number) => {
    if (achievement >= 90) return 'bg-green-100'
    if (achievement >= 80) return 'bg-blue-100'
    if (achievement >= 70) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const selectedStoreData = stores.find(store => store.id === selectedStore)
  const selectedTeamData = selectedStoreData?.teams.find(team => team.id === selectedTeam)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          チーム成績管理
        </h1>
        <p className="text-gray-600">
          店舗・チーム・個人の成績を管理し、切磋琢磨を促進します
        </p>
        <div className="mt-4 text-sm text-gray-500">
          最終更新: {lastUpdated} (毎日朝8時に自動更新)
        </div>
      </div>

      {/* 店舗選択 */}
      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => {
                setSelectedStore(store.id)
                setSelectedTeam(store.teams[0]?.id || '')
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStore === store.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {store.name}
            </button>
          ))}
        </div>
      </div>

      {/* 店舗成績サマリー */}
      {selectedStoreData && (
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {selectedStoreData.name} - 月間成績サマリー
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {selectedStoreData.monthlyTarget.toLocaleString()}円
              </div>
              <div className="text-sm text-gray-500">月間目標</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {selectedStoreData.monthlyCurrent.toLocaleString()}円
              </div>
              <div className="text-sm text-gray-500">月間実績</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getAchievementColor(selectedStoreData.monthlyAchievement)}`}>
                {selectedStoreData.monthlyAchievement}%
              </div>
              <div className="text-sm text-gray-500">達成率</div>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                selectedStoreData.monthlyAchievement >= 90 ? 'bg-green-500' :
                selectedStoreData.monthlyAchievement >= 80 ? 'bg-blue-500' :
                selectedStoreData.monthlyAchievement >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(selectedStoreData.monthlyAchievement, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* チーム選択と成績 */}
      {selectedStoreData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              チーム選択
            </h2>
            <div className="space-y-3">
              {selectedStoreData.teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={`w-full p-4 rounded-lg border transition-all ${
                    selectedTeam === team.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{team.name}</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getAchievementBgColor(team.monthlyAchievement)} ${getAchievementColor(team.monthlyAchievement)}`}>
                      {team.monthlyAchievement}%
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    目標: {team.monthlyTarget.toLocaleString()}円 / 実績: {team.monthlyCurrent.toLocaleString()}円
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 選択されたチームの詳細 */}
          {selectedTeamData && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {selectedTeamData.name} - メンバー成績
              </h2>
              <div className="space-y-4">
                {selectedTeamData.members.map((member) => (
                  <div
                    key={member.id}
                    className={`p-4 rounded-lg border ${
                      member.isTopPerformer ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold ${
                          member.isTopPerformer ? 'text-yellow-700' : 'text-gray-900'
                        }`}>
                          {member.name}
                        </span>
                        {member.isTopPerformer && (
                          <span className="px-2 py-1 bg-yellow-400 text-yellow-800 text-xs font-bold rounded-full">
                            🏆 1位
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getAchievementBgColor(member.monthlyAchievement)} ${getAchievementColor(member.monthlyAchievement)}`}>
                        {member.monthlyAchievement}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">目標: </span>
                        <span className="font-medium">{member.monthlyTarget.toLocaleString()}円</span>
                      </div>
                      <div>
                        <span className="text-gray-600">実績: </span>
                        <span className="font-medium">{member.monthlyCurrent.toLocaleString()}円</span>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          member.monthlyAchievement >= 90 ? 'bg-green-500' :
                          member.monthlyAchievement >= 80 ? 'bg-blue-500' :
                          member.monthlyAchievement >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(member.monthlyAchievement, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ランキング表示 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* 店舗ランキング */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏢 店舗ランキング</h3>
          <div className="space-y-3">
            {storeRanking.map((store, index) => (
              <div key={store.id} className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-400 text-yellow-800' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  index === 2 ? 'bg-orange-400 text-orange-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{store.name}</div>
                  <div className="text-sm text-gray-600">{store.monthlyAchievement}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* チームランキング */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 チームランキング</h3>
          <div className="space-y-3">
            {teamRanking.slice(0, 10).map((team, index) => (
              <div key={team.id} className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-400 text-yellow-800' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  index === 2 ? 'bg-orange-400 text-orange-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{team.name}</div>
                  <div className="text-sm text-gray-600">{team.monthlyAchievement}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 個人ランキング */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 個人ランキング</h3>
          <div className="space-y-3">
            {individualRanking.slice(0, 10).map((member, index) => (
              <div key={member.id} className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-400 text-yellow-800' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  index === 2 ? 'bg-orange-400 text-orange-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${
                    member.isTopPerformer ? 'text-yellow-700' : ''
                  }`}>
                    {member.name}
                  </div>
                  <div className="text-sm text-gray-600">{member.monthlyAchievement}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex space-x-4 mb-8">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          新しい店舗を追加
        </button>
        <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
          チームを追加
        </button>
        <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
          成績レポート出力
        </button>
      </div>

      {/* モチベーション向上メッセージ */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">🚀 チームで頑張ろう！</h3>
        <p className="mb-4">
          個人の努力がチームの成功につながり、チームの成功が店舗の成長を支えます。
          お互いを高め合い、全員で目標達成を目指しましょう！
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">1位</div>
            <div className="text-sm">個人ランキング</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">1位</div>
            <div className="text-sm">チームランキング</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">1位</div>
            <div className="text-sm">店舗ランキング</div>
          </div>
        </div>
      </div>
    </div>
  )
}
