'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface PartTimeEmployee {
  id: string
  name: string
  email: string
  phone: string
  position: string
  is_active: boolean
}

interface ShiftRequest {
  employee_id: string
  request_type: 'shift_request' | 'availability' | 'time_off'
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  total_hours: number
  notes: string
}

interface SelectedDate {
  date: string
  start_time: string
  end_time: string
  hours: number
}

export default function ShiftRequestPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<PartTimeEmployee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [requestType, setRequestType] = useState<'shift_request' | 'availability' | 'time_off'>('shift_request')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('09:00')
  const [endTime, setEndTime] = useState<string>('17:00')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedDates, setSelectedDates] = useState<SelectedDate[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (startDate && endDate) {
      generateDateRange()
    }
  }, [startDate, endDate, startTime, endTime])

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

  const generateDateRange = () => {
    if (!startDate || !endDate) return

    const start = new Date(startDate)
    const end = new Date(endDate)
    const dates: SelectedDate[] = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const startTimeObj = new Date(`2000-01-01T${startTime}`)
      const endTimeObj = new Date(`2000-01-01T${endTime}`)
      const hours = (endTimeObj.getTime() - startTimeObj.getTime()) / (1000 * 60 * 60)

      dates.push({
        date: dateStr,
        start_time: startTime,
        end_time: endTime,
        hours: hours
      })
    }

    setSelectedDates(dates)
  }

  const handleDateSelection = (date: string) => {
    setSelectedDates(prev => {
      const exists = prev.find(d => d.date === date)
      if (exists) {
        return prev.filter(d => d.date !== date)
      } else {
        const startTimeObj = new Date(`2000-01-01T${startTime}`)
        const endTimeObj = new Date(`2000-01-01T${endTime}`)
        const hours = (endTimeObj.getTime() - startTimeObj.getTime()) / (1000 * 60 * 60)

        return [...prev, {
          date,
          start_time: startTime,
          end_time: endTime,
          hours: hours
        }]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedEmployee) {
      alert('従業員を選択してください')
      return
    }

    if (selectedDates.length === 0) {
      alert('日付を選択してください')
      return
    }

    setLoading(true)

    try {
      // シフト申請の作成
      const shiftRequest = {
        employee_id: selectedEmployee,
        request_type: requestType,
        start_date: selectedDates[0].date,
        end_date: selectedDates[selectedDates.length - 1].date,
        start_time: startTime,
        end_time: endTime,
        total_hours: selectedDates.reduce((sum, date) => sum + date.hours, 0),
        notes: notes
      }

      const { data: requestData, error: requestError } = await supabase
        .from('shift_requests')
        .insert([shiftRequest])
        .select()
        .single()

      if (requestError) throw requestError

      // シフト詳細の作成
      const shiftDetails = selectedDates.map(date => ({
        shift_request_id: requestData.id,
        date: date.date,
        start_time: date.start_time,
        end_time: date.end_time,
        hours: date.hours
      }))

      const { error: detailsError } = await supabase
        .from('shift_request_details')
        .insert(shiftDetails)

      if (detailsError) throw detailsError

      alert('シフト申請を送信しました！')
      
      // フォームをリセット
      setSelectedEmployee('')
      setRequestType('shift_request')
      setStartDate('')
      setEndDate('')
      setStartTime('09:00')
      setEndTime('17:00')
      setNotes('')
      setSelectedDates([])

    } catch (error) {
      console.error('Error submitting shift request:', error)
      alert('シフト申請の送信に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

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
    return selectedDates.some(d => d.date === date.toISOString().split('T')[0])
  }

  const isDateInRange = (date: Date) => {
    if (!startDate || !endDate) return false
    const dateStr = date.toISOString().split('T')[0]
    return dateStr >= startDate && dateStr <= endDate
  }

  const getEmployeeNameForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const selectedDate = selectedDates.find(d => d.date === dateStr)
    if (selectedDate) {
      return employees.find(e => e.id === selectedEmployee)?.name
    }
    return null
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
              <h1 className="text-3xl font-bold text-gray-800">シフト申請フォーム</h1>
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
          {/* シフト申請フォーム */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">シフト申請</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* 申請タイプ */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  申請タイプ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="shift_request"
                      checked={requestType === 'shift_request'}
                      onChange={(e) => setRequestType(e.target.value as any)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">シフト申請</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="availability"
                      checked={requestType === 'availability'}
                      onChange={(e) => setRequestType(e.target.value as any)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">勤務可能日</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="time_off"
                      checked={requestType === 'time_off'}
                      onChange={(e) => setRequestType(e.target.value as any)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">休暇申請</span>
                  </label>
                </div>
              </div>

              {/* 日付範囲 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    開始日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    終了日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* 時間 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    開始時間
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    終了時間
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 備考 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  備考
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="特記事項があれば入力してください"
                />
              </div>

              {/* 送信ボタン */}
              <button
                type="submit"
                disabled={loading || !selectedEmployee || selectedDates.length === 0}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-bold"
              >
                {loading ? '送信中...' : `シフト申請を送信 (${selectedDates.length}日)`}
              </button>
            </form>
          </div>

          {/* カレンダー表示 */}
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
                      onClick={() => handleDateSelection(date.toISOString().split('T')[0])}
                      className={`w-full h-full p-2 text-sm rounded-lg transition-all ${
                        isDateSelected(date)
                          ? 'bg-blue-500 text-white'
                          : isDateInRange(date)
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'hover:bg-gray-100'
                      }`}
                      disabled={!startDate || !endDate}
                    >
                      <div className="text-center">{date.getDate()}</div>
                      {getEmployeeNameForDate(date) && (
                        <div className="text-xs mt-1 truncate">
                          {getEmployeeNameForDate(date)}
                        </div>
                      )}
                    </button>
                  ) : (
                    <div className="w-full h-full"></div>
                  )}
                </div>
              ))}
            </div>

            {/* 選択された日付一覧 */}
            {selectedDates.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">選択された日付 ({selectedDates.length}日)</h4>
                <div className="space-y-1">
                  {selectedDates.map((date, index) => (
                    <div key={index} className="text-sm text-blue-700">
                      {new Date(date.date).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'long' })}: {date.start_time} - {date.end_time} ({date.hours}時間)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
