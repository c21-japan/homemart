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

export default function PartTimeAttendancePage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<PartTimeEmployee[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)

  useEffect(() => {
    fetchData()
  }, [selectedEmployee, selectedYear, selectedMonth])

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
