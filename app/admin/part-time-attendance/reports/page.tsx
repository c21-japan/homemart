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

interface SalarySetting {
  id: string
  employee_id: string
  hourly_rate: number
  overtime_rate: number
  holiday_rate: number
  effective_date: string
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

export default function AttendanceReportsPage() {
  const [employees, setEmployees] = useState<PartTimeEmployee[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [salarySettings, setSalarySettings] = useState<SalarySetting[]>([])
  const [salaryCalculations, setSalaryCalculations] = useState<SalaryCalculation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [reportType, setReportType] = useState<'monthly' | 'yearly'>('monthly')
  const [generatingReport, setGeneratingReport] = useState(false)

  useEffect(() => {
    fetchData()
  }, [selectedEmployee, selectedYear, selectedMonth, reportType])

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

      // 勤怠記録を取得
      let query = supabase
        .from('part_time_attendance')
        .select(`
          *,
          part_time_employees!inner(name)
        `)
        .order('date', { ascending: false })

      if (reportType === 'monthly') {
        query = query
          .gte('date', `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`)
          .lt('date', `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`)
      } else {
        query = query
          .gte('date', `${selectedYear}-01-01`)
          .lt('date', `${selectedYear + 1}-01-01`)
      }

      if (selectedEmployee) {
        query = query.eq('employee_id', selectedEmployee)
      }

      const { data: attendanceData, error: attendanceError } = await query

      if (attendanceError) {
        console.error('Attendance error:', attendanceError)
      }

      // 給与設定を取得
      const { data: salaryData, error: salaryError } = await supabase
        .from('salary_settings')
        .select('*')
        .eq('is_active', true)

      if (salaryError) {
        console.error('Salary settings error:', salaryError)
      }

      // 給与計算を取得
      let salaryQuery = supabase
        .from('salary_calculations')
        .select('*')

      if (reportType === 'monthly') {
        salaryQuery = salaryQuery.eq('year', selectedYear).eq('month', selectedMonth)
      } else {
        salaryQuery = salaryQuery.eq('year', selectedYear)
      }

      if (selectedEmployee) {
        salaryQuery = salaryQuery.eq('employee_id', selectedEmployee)
      }

      const { data: salaryCalcData, error: salaryCalcError } = await salaryQuery

      if (salaryCalcError) {
        console.error('Salary calculations error:', salaryCalcError)
      }

      // データを整形
      const formattedRecords = (attendanceData || []).map(record => ({
        ...record,
        employee_name: record.part_time_employees.name
      }))

      setEmployees(employeesData || [])
      setAttendanceRecords(formattedRecords)
      setSalarySettings(salaryData || [])
      setSalaryCalculations(salaryCalcData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSalaryReport = async () => {
    if (!selectedEmployee || !selectedYear || !selectedMonth) {
      alert('従業員、年、月を選択してください')
      return
    }

    setGeneratingReport(true)

    try {
      // 選択された期間の勤怠記録を取得
      const { data: records, error: recordsError } = await supabase
        .from('part_time_attendance')
        .select('*')
        .eq('employee_id', selectedEmployee)
        .gte('date', `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`)
        .lt('date', `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`)
        .order('date')

      if (recordsError) throw recordsError

      // 給与設定を取得
      const { data: salarySetting, error: salaryError } = await supabase
        .from('salary_settings')
        .select('*')
        .eq('employee_id', selectedEmployee)
        .eq('is_active', true)
        .single()

      if (salaryError) throw salaryError

      // 給与計算
      let totalRegularHours = 0
      let totalOvertimeHours = 0
      const totalHolidayHours = 0

      records.forEach(record => {
        if (record.total_hours) {
          if (record.total_hours <= 8) {
            totalRegularHours += record.total_hours
          } else {
            totalRegularHours += 8
            totalOvertimeHours += record.total_hours - 8
          }
        }
      })

      const regularPay = totalRegularHours * salarySetting.hourly_rate
      const overtimePay = totalOvertimeHours * salarySetting.hourly_rate * salarySetting.overtime_rate
      const totalPay = regularPay + overtimePay

      // 給与計算結果を保存または更新
      const calculationData = {
        employee_id: selectedEmployee,
        year: selectedYear,
        month: selectedMonth,
        total_regular_hours: totalRegularHours,
        total_overtime_hours: totalOvertimeHours,
        total_holiday_hours: totalHolidayHours,
        regular_pay: regularPay,
        overtime_pay: overtimePay,
        holiday_pay: 0,
        total_pay: totalPay
      }

      const { error: upsertError } = await supabase
        .from('salary_calculations')
        .upsert([calculationData], { onConflict: 'employee_id,year,month' })

      if (upsertError) throw upsertError

      alert('給与レポートを生成しました！')
      fetchData() // データを再取得

    } catch (error) {
      console.error('Error generating salary report:', error)
      alert('給与レポートの生成に失敗しました。')
    } finally {
      setGeneratingReport(false)
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

  const getEmployeeStats = (employeeId: string) => {
    const employeeRecords = attendanceRecords.filter(record => record.employee_id === employeeId)
    const totalDays = employeeRecords.length
    const totalHours = employeeRecords.reduce((sum, record) => sum + (record.total_hours || 0), 0)
    const averageHours = totalDays > 0 ? totalHours / totalDays : 0

    return { totalDays, totalHours, averageHours }
  }

  const exportToCSV = () => {
    if (attendanceRecords.length === 0) {
      alert('エクスポートするデータがありません')
      return
    }

    const headers = ['日付', '従業員名', '出社時間', '退社時間', '勤務時間', '備考']
    const csvData = attendanceRecords.map(record => [
      formatDate(record.date),
      record.employee_name,
      formatTime(record.clock_in_time),
      formatTime(record.clock_out_time),
      record.total_hours ? `${record.total_hours}時間` : '-',
      record.notes || '-'
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `勤怠レポート_${selectedYear}年${selectedMonth}月.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
              <h1 className="text-3xl font-bold text-gray-800">勤怠レポート</h1>
              <p className="text-gray-600 mt-2">センチュリー21 ホームマート</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                CSVエクスポート
              </button>
              <Link
                href="/admin/part-time-attendance"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                勤怠管理に戻る
              </Link>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">レポート設定</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">レポートタイプ</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as 'monthly' | 'yearly')}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">月次レポート</option>
                <option value="yearly">年次レポート</option>
              </select>
            </div>

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

            {reportType === 'monthly' && (
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
            )}

            <div className="flex items-end">
              <button
                onClick={generateSalaryReport}
                disabled={generatingReport || !selectedEmployee || (reportType === 'monthly' && !selectedMonth)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {generatingReport ? '生成中...' : '給与レポート生成'}
              </button>
            </div>
          </div>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                  {attendanceRecords.length > 0 
                    ? (attendanceRecords.reduce((total, record) => total + (record.total_hours || 0), 0) / attendanceRecords.length).toFixed(1)
                    : '0'}時間
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">対象期間</p>
                <p className="text-3xl font-bold text-orange-600">
                  {reportType === 'monthly' ? `${selectedMonth}月` : `${selectedYear}年`}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 従業員別統計 */}
        {!selectedEmployee && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">従業員別統計</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((employee) => {
                  const stats = getEmployeeStats(employee.id)
                  return (
                    <div key={employee.id} className="border rounded-lg p-4">
                      <h3 className="font-bold text-lg mb-3">{employee.name}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">勤務日数:</span>
                          <span className="font-medium">{stats.totalDays}日</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">総勤務時間:</span>
                          <span className="font-medium">{stats.totalHours.toFixed(1)}時間</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">平均勤務時間:</span>
                          <span className="font-medium">{stats.averageHours.toFixed(1)}時間</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* 給与計算結果 */}
        {salaryCalculations.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">給与計算結果</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      従業員名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      期間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      通常勤務時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      残業時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      通常給与
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      残業給与
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      総給与
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salaryCalculations.map((calculation) => {
                    const employee = employees.find(e => e.id === calculation.employee_id)
                    return (
                      <tr key={calculation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee?.name || '不明'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {calculation.year}年{calculation.month}月
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {calculation.total_regular_hours.toFixed(1)}時間
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {calculation.total_overtime_hours.toFixed(1)}時間
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ¥{calculation.regular_pay.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ¥{calculation.overtime_pay.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          ¥{calculation.total_pay.toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 勤怠記録テーブル */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">勤怠記録</h2>
            <p className="text-sm text-gray-600 mt-1">
              {reportType === 'monthly' ? `${selectedYear}年${selectedMonth}月` : `${selectedYear}年`}
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
      </div>
    </div>
  )
}
