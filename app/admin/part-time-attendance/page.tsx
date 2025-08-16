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

interface AttendanceRecord {
  id: string
  employee_id: string
  date: string
  clock_in_time: string
  clock_out_time: string
  total_hours: number
  notes: string
  employee_name: string
}

interface RealtimeAttendance {
  id: string
  employee_id: string
  attendance_type: 'clock_in' | 'clock_out'
  location_data: {
    latitude: number
    longitude: number
    address: string
  }
  timestamp: string
  created_at: string
  part_time_employees: {
    name: string
  }
}

export default function PartTimeAttendancePage() {
  const [employees, setEmployees] = useState<PartTimeEmployee[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [realtimeAttendances, setRealtimeAttendances] = useState<RealtimeAttendance[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetchData()
    fetchRealtimeData()
    
    // 現在時刻を1分ごとに更新
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      fetchRealtimeData() // 1分ごとにリアルタイムデータを更新
    }, 60000)
    
    // リアルタイムデータを5秒ごとに更新
    const realtimeTimer = setInterval(() => {
      fetchRealtimeData()
    }, 5000)

    return () => {
      clearInterval(timer)
      clearInterval(realtimeTimer)
    }
  }, [selectedEmployee, selectedYear, selectedMonth])

  const fetchRealtimeData = async () => {
    try {
      const response = await fetch('/api/part-time-attendance/realtime')
      if (response.ok) {
        const { data } = await response.json()
        setRealtimeAttendances(data || [])
      }
    } catch (error) {
      console.error('Error fetching realtime data:', error)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)

      // 従業員データを取得
      const { data: employeesData, error: employeesError } = await supabase
        .from('part_time_employees')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (employeesError) {
        console.error('Employees error:', employeesError)
      }

      // 勤怠記録を取得（従業員名も含める）
      let query = supabase
        .from('part_time_attendance')
        .select(`
          *,
          part_time_employees!inner(name)
        `)
        .gte('date', `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`)
        .lt('date', `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`)
        .order('date', { ascending: false })

      if (selectedEmployee) {
        query = query.eq('employee_id', selectedEmployee)
      }

      const { data: attendanceData, error: attendanceError } = await query

      if (attendanceError) {
        console.error('Attendance error:', attendanceError)
      }

      // データを整形
      const formattedRecords = (attendanceData || []).map(record => ({
        ...record,
        employee_name: record.part_time_employees.name
      }))

      setEmployees(employeesData || [])
      setAttendanceRecords(formattedRecords)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return '-'
    return new Date(timeString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      years.push(i)
    }
    return years
  }

  const getMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1)
  }

  // カレンダー用の日付配列を生成
  const getCalendarDays = () => {
    const year = selectedYear
    const month = selectedMonth
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const daysInMonth = lastDay.getDate()
    const firstDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // 前月の日付を追加
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 2, lastDay.getDate() - i)
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false
      })
    }
    
    // 当月の日付を追加
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month - 1, i)
      const today = new Date()
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: today.getFullYear() === year && today.getMonth() === month - 1 && today.getDate() === i
      })
    }
    
    // 翌月の日付を追加（6週分になるように）
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month, i)
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false
      })
    }
    
    return days
  }

  // 指定日の勤怠記録を取得
  const getAttendanceForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return attendanceRecords.filter(record => record.date === dateString)
  }

  // 指定日のリアルタイム勤怠を取得
  const getRealtimeAttendanceForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return realtimeAttendances.filter(record => {
      const recordDate = new Date(record.timestamp).toISOString().split('T')[0]
      return recordDate === dateString
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 'var(--header-height, 0px)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ paddingTop: 'var(--header-height, 0px)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">アルバイト勤怠管理</h1>
              <p className="text-gray-600 mt-2">センチュリー21 ホームマート</p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/admin/part-time-attendance/form"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold"
              >
                勤怠フォーム
              </Link>
              <Link
                href="/admin/part-time-attendance/shift-request"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-bold"
              >
                シフト申請
              </Link>
              <Link
                href="/admin/part-time-attendance/reports"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-bold"
              >
                勤怠レポート
              </Link>
              <Link
                href="/admin"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                管理画面に戻る
              </Link>
            </div>
          </div>
        </div>

        {/* リアルタイム通知 */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">リアルタイム勤怠状況</h2>
              <p className="text-green-100">最新の出社・退社記録がリアルタイムで表示されます</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">現在時刻</p>
              <p className="text-2xl font-bold">
                {currentTime.toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
          </div>
          
          {realtimeAttendances.length > 0 && (
            <div className="mt-4 space-y-2">
              {realtimeAttendances.slice(0, 3).map((attendance) => (
                <div key={attendance.id} className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold">{attendance.part_time_employees.name}</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                        attendance.attendance_type === 'clock_in' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {attendance.attendance_type === 'clock_in' ? '出社' : '退社'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-90">
                        {new Date(attendance.timestamp).toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </p>
                      <p className="text-xs opacity-75">
                        {new Date(attendance.timestamp).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs opacity-90 mt-1">
                    位置: {attendance.location_data.address}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">フィルター</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">従業員</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">すべての従業員</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">年</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {getYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}年
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">月</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {getMonthOptions().map((month) => (
                  <option key={month} value={month}>
                    {month}月
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* カレンダー表示 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">カレンダー表示</h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedYear}年{selectedMonth}月の勤怠状況
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-7 gap-1">
              {/* 曜日ヘッダー */}
              {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                <div key={day} className="p-2 text-center font-bold text-gray-600 bg-gray-50 rounded">
                  {day}
                </div>
              ))}
              
              {/* 日付と勤怠状況 */}
              {getCalendarDays().map((day, index) => {
                const dayAttendance = getAttendanceForDate(day.date)
                const realtimeAttendance = getRealtimeAttendanceForDate(day.date)
                
                return (
                  <div
                    key={index}
                    className={`p-2 min-h-[80px] border rounded ${
                      day.isCurrentMonth 
                        ? 'bg-white' 
                        : 'bg-gray-50 text-gray-400'
                    } ${
                      day.isToday 
                        ? 'ring-2 ring-blue-500' 
                        : ''
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {day.date.getDate()}
                    </div>
                    
                    {/* 勤怠状況表示 */}
                    {day.isCurrentMonth && dayAttendance.length > 0 && (
                      <div className="space-y-1">
                        {dayAttendance.map((record) => (
                          <div key={record.id} className="text-xs">
                            <div className="font-medium text-blue-600">
                              {record.employee_name}
                            </div>
                            {record.clock_in_time && (
                              <div className="text-green-600">
                                ↑ {formatTime(record.clock_in_time)}
                              </div>
                            )}
                            {record.clock_out_time && (
                              <div className="text-red-600">
                                ↓ {formatTime(record.clock_out_time)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* リアルタイム通知表示 */}
                    {day.isCurrentMonth && realtimeAttendance.length > 0 && (
                      <div className="mt-1">
                        {realtimeAttendance.slice(0, 2).map((attendance) => (
                          <div
                            key={attendance.id}
                            className={`text-xs px-1 py-0.5 rounded ${
                              attendance.attendance_type === 'clock_in'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {attendance.attendance_type === 'clock_in' ? '出社' : '退社'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 勤怠記録テーブル */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">勤怠記録</h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedYear}年{selectedMonth}月
              {selectedEmployee && ` - ${employees.find(e => e.id === selectedEmployee)?.name}`}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日付
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    従業員名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    出社時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    退社時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    勤務時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    備考
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.employee_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(record.clock_in_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(record.clock_out_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.total_hours ? `${record.total_hours}時間` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      該当する勤怠記録がありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 統計情報 */}
        {attendanceRecords.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">総勤務日数</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {attendanceRecords.length}日
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">総勤務時間</p>
                  <p className="text-3xl font-bold text-green-600">
                    {attendanceRecords.reduce((total, record) => total + (record.total_hours || 0), 0).toFixed(1)}時間
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">平均勤務時間</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {(attendanceRecords.reduce((total, record) => total + (record.total_hours || 0), 0) / attendanceRecords.length).toFixed(1)}時間
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
