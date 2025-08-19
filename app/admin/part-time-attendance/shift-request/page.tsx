'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface PartTimeEmployee {
  id: string
  name: string
  email: string
  phone: string
  position: string
  is_active: boolean
}

interface StagingEntry {
  date: string
  start: string
  end: string
}

export default function ShiftRequestPage() {
  const [employees, setEmployees] = useState<PartTimeEmployee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [note, setNote] = useState('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('09:00')
  const [endTime, setEndTime] = useState<string>('17:00')
  const [staging, setStaging] = useState<StagingEntry[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const { data: employeesData, error: employeesError } = await supabase
        .from('part_time_employees')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (employeesError) {
        console.error('Employees error:', employeesError)
        return
      }

      setEmployees(employeesData || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  // バリデーション: 追加可能かチェック
  const canAdd = useMemo(() => {
    if (!selectedDate || !startTime || !endTime) return false
    if (endTime <= startTime) return false
    
    // 同一日での時間帯交差チェック
    const sameDayEntries = staging.filter(entry => entry.date === selectedDate)
    return !sameDayEntries.some(entry => 
      !(entry.end <= startTime || endTime <= entry.start)
    )
  }, [selectedDate, startTime, endTime, staging])

  // エントリー追加
  const addEntry = () => {
    if (!canAdd) return
    
    const newEntry: StagingEntry = {
      date: selectedDate,
      start: startTime,
      end: endTime
    }
    
    setStaging(prev => [...prev, newEntry])
    
    // 入力欄を初期化（日付は保持して連続入力しやすく）
    setStartTime('09:00')
    setEndTime('17:00')
  }

  // エントリー削除
  const removeEntry = (index: number) => {
    setStaging(prev => prev.filter((_, i) => i !== index))
  }

  // 一括申請
  const submitAll = async () => {
    if (!selectedEmployee || staging.length === 0) {
      alert('従業員を選択し、勤務可能日を追加してください')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/shift-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          note: note,
          entries: staging
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '申請の送信に失敗しました')
      }

      alert('勤務可能日の申請を受け付けました！')
      
      // フォームをリセット
      setSelectedEmployee('')
      setNote('')
      setSelectedDate('')
      setStartTime('09:00')
      setEndTime('17:00')
      setStaging([])

    } catch (error: any) {
      console.error('Error submitting shift request:', error)
      alert(error.message || '申請の送信に失敗しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  // カレンダー関連の関数
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []

    // 前月の日付を追加
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    // 当月の日付を追加
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const isDateSelected = (date: Date) => {
    return selectedDate === date.toISOString().split('T')[0]
  }

  const hasStagingEntry = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return staging.some(entry => entry.date === dateStr)
  }

  const getStagingEntriesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return staging.filter(entry => entry.date === dateStr)
  }

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ paddingTop: 'var(--header-height, 0px)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">勤務可能日申請フォーム</h1>
              <p className="text-gray-600 mt-2">センチュリー21 ホームマート</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin/part-time-attendance"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                勤怠管理に戻る
              </Link>
              <Link
                href="/admin"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                管理画面に戻る
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左カラム：申請フォーム */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">勤務可能日申請</h2>
            
            <div className="space-y-6">
              {/* 従業員選択 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  従業員名 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">従業員を選択してください</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 備考 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  備考
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="特記事項があれば入力してください"
                />
              </div>

              {/* 入力エリア：日程・開始・終了 */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-3">勤務可能日を追加</h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">日程</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">開始時間</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">終了時間</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={addEntry}
                  disabled={!canAdd}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  追加
                </button>
                
                {!canAdd && selectedDate && startTime && endTime && (
                  <p className="text-sm text-red-600 mt-2">
                    {endTime <= startTime 
                      ? '終了時間は開始時間より後である必要があります'
                      : '同一日の時間帯が重複しています'
                    }
                  </p>
                )}
              </div>

              {/* ステージング一覧 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">申請予定（未送信）</h3>
                  <span className="text-sm text-gray-500">{staging.length} 件</span>
                </div>
                
                {staging.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center border-2 border-dashed border-gray-200 rounded-lg">
                    まだ勤務可能日が追加されていません
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left p-3">日程</th>
                          <th className="text-left p-3">開始</th>
                          <th className="text-left p-3">終了</th>
                          <th className="p-3 w-20"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {staging
                          .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))
                          .map((entry, index) => (
                          <tr key={index} className="border-t hover:bg-gray-50">
                            <td className="p-3">
                              {new Date(entry.date).toLocaleDateString('ja-JP', { 
                                month: 'long', 
                                day: 'numeric', 
                                weekday: 'long' 
                              })}
                            </td>
                            <td className="p-3">{entry.start}</td>
                            <td className="p-3">{entry.end}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => removeEntry(index)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                削除
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 一括申請ボタン */}
              <button
                onClick={submitAll}
                disabled={submitting || !selectedEmployee || staging.length === 0}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-bold"
              >
                {submitting ? '送信中...' : `一括申請 (${staging.length}件)`}
              </button>
            </div>
          </div>

          {/* 右カラム：カレンダー表示 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">カレンダー選択</h2>
            
            {/* カレンダーヘッダー */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => changeMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-lg font-semibold">
                {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
              </h3>
              <button
                onClick={() => changeMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* カレンダーグリッド */}
            <div className="grid grid-cols-7 gap-1">
              {getCalendarDays().map((date, index) => (
                <div key={index} className="min-h-[60px] p-1">
                  {date ? (
                    <button
                      onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
                      className={`w-full h-full p-2 text-sm rounded-lg transition-all ${
                        isDateSelected(date)
                          ? 'bg-blue-500 text-white'
                          : hasStagingEntry(date)
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-center">{date.getDate()}</div>
                      {hasStagingEntry(date) && (
                        <div className="text-xs mt-1">
                          {getStagingEntriesForDate(date).map((entry, i) => (
                            <div key={i} className="truncate">
                              {entry.start}-{entry.end}
                            </div>
                          ))}
                        </div>
                      )}
                    </button>
                  ) : (
                    <div className="w-full h-full"></div>
                  )}
                </div>
              ))}
            </div>

            {/* カレンダー凡例 */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>選択中</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 rounded"></div>
                <span>申請予定</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
