'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'

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
}

interface ShiftRequestData {
  id: string
  employee_id: string
  request_type: string
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  total_hours: number
  status: string
  notes: string
  created_at: string
}

interface SalaryCalculation {
  id: string
  employee_id: string
  year: number
  month: number
  total_regular_hours: number
  total_overtime_hours: number
  total_holiday_hours: number
  regular_pay: number
  overtime_pay: number
  holiday_pay: number
  total_pay: number
}

export default function EmployeeProfilePage() {
  const params = useParams()
  const employeeId = params.id as string
  
  const [employee, setEmployee] = useState<PartTimeEmployee | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [shiftRequests, setShiftRequests] = useState<ShiftRequestData[]>([])
  const [salaryCalculations, setSalaryCalculations] = useState<SalaryCalculation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData()
    }
    
    // 現在時刻を1秒ごとに更新
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [employeeId, selectedYear, selectedMonth])

  const fetchEmployeeData = async () => {
    try {
      setLoading(true)

      // 従業員データを取得
      const { data: employeeData, error: employeeError } = await supabase
        .from('part_time_employees')
        .select('*')
        .eq('id', employeeId)
        .single()

      if (employeeError) {
        console.error('Employee error:', employeeError)
        return
      }

      // 勤怠記録を取得
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('part_time_attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`)
        .lt('date', `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`)
        .order('date', { ascending: false })

      if (attendanceError) {
        console.error('Attendance error:', attendanceError)
      }

      // シフト申請を取得
      const { data: shiftData, error: shiftError } = await supabase
        .from('shift_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (shiftError) {
        console.error('Shift requests error:', shiftError)
      }

      // 給与計算を取得
      const { data: salaryData, error: salaryError } = await supabase
        .from('salary_calculations')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('year', selectedYear)
        .eq('month', selectedMonth)

      if (salaryError) {
        console.error('Salary calculations error:', salaryError)
      }

      setEmployee(employeeData)
      setAttendanceRecords(attendanceData || [])
      setShiftRequests(shiftData || [])
      setSalaryCalculations(salaryData || [])
    } catch (error) {
      console.error('Error fetching employee data:', error)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '承認済み'
      case 'rejected':
        return '却下'
      case 'pending':
        return '審査中'
      default:
        return status
    }
  }

  const getRequestTypeText = (type: string) => {
    switch (type) {
      case 'shift_request':
        return 'シフト申請'
      case 'availability':
        return '勤務可能日'
      case 'time_off':
        return '休暇申請'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 'var(--header-height, 0px)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 'var(--header-height, 0px)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">従業員が見つかりません</h1>
          <Link
            href="/part-time-attendance"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            勤怠フォームに戻る
          </Link>
        </div>
      </div>
    )
  }

  const currentMonthStats = {
    totalDays: attendanceRecords.length,
    totalHours: attendanceRecords.reduce((sum, record) => sum + (record.total_hours || 0), 0),
    averageHours: attendanceRecords.length > 0 
      ? attendanceRecords.reduce((sum, record) => sum + (record.total_hours || 0), 0) / attendanceRecords.length 
      : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{employee.name}の勤怠ページ</h1>
            <p className="text-xl text-gray-600">センチュリー21 ホームマート</p>
          </div>
          
          {/* 現在時刻表示 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl">
            <p className="text-sm opacity-90 mb-2">現在時刻</p>
            <p className="text-3xl font-bold">
              {currentTime.toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
            <p className="text-lg mt-2">
              {currentTime.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">期間選択</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">年</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
              >
                {getMonthOptions().map((month) => (
                  <option key={month} value={month}>
                    {month}月
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Link
                href="/part-time-attendance"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors text-center font-bold"
              >
                勤怠記録
              </Link>
            </div>
          </div>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">今月の勤務日数</p>
                <p className="text-3xl font-bold text-blue-600">
                  {currentMonthStats.totalDays}日
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">今月の総勤務時間</p>
                <p className="text-3xl font-bold text-green-600">
                  {currentMonthStats.totalHours.toFixed(1)}時間
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">今月の平均勤務時間</p>
                <p className="text-3xl font-bold text-purple-600">
                  {currentMonthStats.averageHours.toFixed(1)}時間
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 今月の勤怠記録 */}
          <div className="bg-white rounded-2xl shadow-xl">
            <div className="p-6 border-b-2 border-gray-100">
              <h2 className="text-xl font-bold">今月の勤怠記録</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedYear}年{selectedMonth}月
              </p>
            </div>
            <div className="p-6">
              {attendanceRecords.length > 0 ? (
                <div className="space-y-4">
                  {attendanceRecords.map((record) => (
                    <div key={record.id} className="border-2 border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">
                          {formatDate(record.date)}
                        </h3>
                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                          {record.total_hours ? `${record.total_hours}時間` : '-'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">出社:</span>
                          <span className="ml-2 font-medium">{formatTime(record.clock_in_time)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">退社:</span>
                          <span className="ml-2 font-medium">{formatTime(record.clock_out_time)}</span>
                        </div>
                      </div>
                      {record.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600 text-sm">備考: {record.notes}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>今月の勤怠記録がありません</p>
                </div>
              )}
            </div>
          </div>

          {/* シフト申請状況 */}
          <div className="bg-white rounded-2xl shadow-xl">
            <div className="p-6 border-b-2 border-gray-100">
              <h2 className="text-xl font-bold">シフト申請状況</h2>
              <p className="text-sm text-gray-600 mt-1">最近の申請</p>
            </div>
            <div className="p-6">
              {shiftRequests.length > 0 ? (
                <div className="space-y-4">
                  {shiftRequests.map((request) => (
                    <div key={request.id} className="border-2 border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">
                          {getRequestTypeText(request.request_type)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-gray-600">期間:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(request.start_date)} 〜 {formatDate(request.end_date)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">時間:</span>
                          <span className="ml-2 font-medium">
                            {request.start_time} - {request.end_time} ({request.total_hours}時間)
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">申請日:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(request.created_at)}
                          </span>
                        </div>
                      </div>
                      {request.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600 text-sm">備考: {request.notes}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>シフト申請がありません</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 給与計算結果 */}
        {salaryCalculations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl mt-8">
            <div className="p-6 border-b-2 border-gray-100">
              <h2 className="text-xl font-bold">給与計算結果</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedYear}年{selectedMonth}月
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {salaryCalculations.map((calculation) => (
                  <div key={calculation.id} className="text-center">
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-xl">
                      <h3 className="text-lg font-bold mb-2">総給与</h3>
                      <p className="text-3xl font-bold">¥{calculation.total_pay.toLocaleString()}</p>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">通常勤務:</span>
                        <span className="font-medium">{calculation.total_regular_hours.toFixed(1)}時間</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">残業時間:</span>
                        <span className="font-medium">{calculation.total_overtime_hours.toFixed(1)}時間</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">通常給与:</span>
                        <span className="font-medium">¥{calculation.regular_pay.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">残業給与:</span>
                        <span className="font-medium">¥{calculation.overtime_pay.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="text-center mt-8 text-gray-500">
          <p>© 2025 ホームマート（CENTURY 21加盟店）. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
