'use client'

import { useState, useEffect } from 'react'
import { 
  CloudArrowUpIcon, 
  EnvelopeIcon, 
  TableCellsIcon, 
  CalendarIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  FolderIcon
} from '@heroicons/react/24/outline'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'

interface GoogleFile {
  id: string
  name: string
  mimeType: string
  webViewLink: string
  thumbnailLink?: string
  modifiedTime: string
  size?: string
}

interface GoogleEmail {
  id: string
  subject: string
  from: string
  snippet: string
  date: string
  isRead: boolean
}

interface GoogleEvent {
  id: string
  summary: string
  start: string
  end: string
  description?: string
  location?: string
}

export default function GoogleWorkspace() {
  const [activeTab, setActiveTab] = useState<'drive' | 'gmail' | 'sheets' | 'calendar'>('drive')
  const [driveFiles, setDriveFiles] = useState<GoogleFile[]>([])
  const [emails, setEmails] = useState<GoogleEmail[]>([])
  const [events, setEvents] = useState<GoogleEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tabs = [
    { id: 'drive', name: 'Googleドライブ', icon: FolderIcon, color: 'text-blue-600' },
    { id: 'gmail', name: 'Gmail', icon: EnvelopeIcon, color: 'text-red-600' },
    { id: 'sheets', name: 'スプレッドシート', icon: TableCellsIcon, color: 'text-green-600' },
    { id: 'calendar', name: 'Googleカレンダー', icon: CalendarIcon, color: 'text-purple-600' }
  ]

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return PhotoIcon
    if (mimeType.includes('video')) return VideoCameraIcon
    if (mimeType.includes('document') || mimeType.includes('text')) return DocumentTextIcon
    return FolderIcon
  }

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes)
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId)
    setError(null)
    // タブ切り替え時にデータを再取得
    fetchData(tabId)
  }

  const fetchData = async (tab: typeof activeTab) => {
    setLoading(true)
    setError(null)
    
    try {
      // 実際の実装では、ここでGoogle APIを呼び出します
      // 現在はモックデータを使用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      switch (tab) {
        case 'drive':
          setDriveFiles([
            {
              id: '1',
              name: '営業資料2024.pdf',
              mimeType: 'application/pdf',
              webViewLink: '#',
              modifiedTime: new Date().toISOString(),
              size: '2048576'
            },
            {
              id: '2',
              name: '物件写真',
              mimeType: 'application/vnd.google-apps.folder',
              webViewLink: '#',
              modifiedTime: new Date().toISOString()
            }
          ])
          break
        case 'gmail':
          setEmails([
            {
              id: '1',
              subject: '物件のお問い合わせについて',
              from: 'customer@example.com',
              snippet: '先日お問い合わせした物件について、詳細を教えていただけますでしょうか...',
              date: new Date().toISOString(),
              isRead: false
            }
          ])
          break
        case 'sheets':
          setDriveFiles([
            {
              id: '3',
              name: '営業実績管理表',
              mimeType: 'application/vnd.google-apps.spreadsheet',
              webViewLink: '#',
              modifiedTime: new Date().toISOString()
            }
          ])
          break
        case 'calendar':
          setEvents([
            {
              id: '1',
              summary: '物件内見',
              start: new Date().toISOString(),
              end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
              description: '新築マンションの内見',
              location: '東京都渋谷区'
            }
          ])
          break
      }
    } catch (err) {
      setError('データの取得に失敗しました')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(activeTab)
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Google Workspace</h2>
        <p className="text-gray-600">Googleの各種サービスに素早くアクセス</p>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as typeof activeTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? `${tab.color} border-current`
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* コンテンツエリア */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Googleドライブ */}
            {activeTab === 'drive' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">最近のファイル</h3>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    ドライブで開く →
                  </button>
                </div>
                <div className="space-y-3">
                  {driveFiles.map((file) => {
                    const FileIcon = getFileIcon(file.mimeType)
                    return (
                      <div key={file.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <FileIcon className="h-8 w-8 text-gray-400 mr-3" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(file.modifiedTime)}
                            {file.size && ` • ${formatFileSize(file.size)}`}
                          </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          開く
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Gmail */}
            {activeTab === 'gmail' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">最近のメール</h3>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Gmailで開く →
                  </button>
                </div>
                <div className="space-y-3">
                  {emails.map((email) => (
                    <div key={email.id} className={`p-3 border rounded-lg hover:bg-gray-50 ${
                      email.isRead ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${email.isRead ? 'text-gray-900' : 'text-blue-900'}`}>
                            {email.subject}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{email.from}</p>
                          <p className="text-sm text-gray-700 mt-2">{email.snippet}</p>
                          <p className="text-xs text-gray-500 mt-2">{formatDate(email.date)}</p>
                        </div>
                        {!email.isRead && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            未読
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* スプレッドシート */}
            {activeTab === 'sheets' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">スプレッドシート</h3>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                    スプレッドシートで開く →
                  </button>
                </div>
                <div className="space-y-3">
                  {driveFiles.map((file) => (
                    <div key={file.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <TableCellsIcon className="h-8 w-8 text-green-600 mr-3" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatDate(file.modifiedTime)}</p>
                      </div>
                      <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                        開く
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Googleカレンダー */}
            {activeTab === 'calendar' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">今後の予定</h3>
                  <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                    カレンダーで開く →
                  </button>
                </div>
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-start">
                        <CalendarIcon className="h-8 w-8 text-purple-600 mr-3 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{event.summary}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {formatDate(event.start)} - {formatDate(event.end)}
                          </p>
                          {event.location && (
                            <p className="text-xs text-gray-600 mt-1">📍 {event.location}</p>
                          )}
                          {event.description && (
                            <p className="text-sm text-gray-700 mt-2">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* クイックアクション */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">クイックアクション</h4>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <CloudArrowUpIcon className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-900">ファイルをアップロード</span>
          </button>
          <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <EnvelopeIcon className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-sm font-medium text-gray-900">メールを送信</span>
          </button>
          <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <TableCellsIcon className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-900">新規スプレッドシート</span>
          </button>
          <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <CalendarIcon className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-gray-900">予定を追加</span>
          </button>
        </div>
      </div>
    </div>
  )
}
