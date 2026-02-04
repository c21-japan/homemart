'use client';

import { useState, useEffect } from "react";

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

// import { useUser } from '@clerk/nextjs'
import { attendanceAPI, AttendanceRecord, Employee } from '@/lib/supabase/attendance'

interface AttendanceRecordWithEmployee extends AttendanceRecord {
  employees: {
    name: string
  }
}

export default function AdminAttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecordWithEmployee[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [dateRange, setDateRange] = useState(30)

  useEffect(() => {
    fetchData()
  }, [selectedDate, dateRange, selectedEmployee])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 全従業員を取得
      const employeesData = await attendanceAPI.getAllEmployees()
      setEmployees(employeesData)
      
      // 勤怠記録を取得
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - dateRange)
      
      let records: AttendanceRecordWithEmployee[] = []
      
      if (selectedEmployee === 'all') {
        // 全従業員の記録を取得
        const allRecords = await attendanceAPI.getAttendanceRecords(startDate, new Date())
        records = allRecords as AttendanceRecordWithEmployee[]
      } else {
        // 特定の従業員の記録を取得
        const employeeRecords = await attendanceAPI.getAttendanceRecordsByEmployee(selectedEmployee, dateRange)
        const employee = employeesData.find(emp => emp.id === selectedEmployee)
        if (employee) {
          records = employeeRecords.map(record => ({
            ...record,
            employees: { name: employee.name }
          }))
        }
      }
      
      setAttendanceRecords(records)
    } catch (error) {
      console.error('データの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    const headers = ['従業員名', '出社時刻', '退勤時刻', '勤務時間(時間)', '日付']
    const csvContent = [
      headers.join(','),
      ...attendanceRecords.map(record => [
        record.employees.name,
        new Date(record.clock_in_at).toLocaleString('ja-JP'),
        record.clock_out_at ? new Date(record.clock_out_at).toLocaleString('ja-JP') : '勤務中',
        record.clock_out_at 
          ? ((new Date(record.clock_out_at).getTime() - new Date(record.clock_in_at).getTime()) / (1000 * 60 * 60)).toFixed(2)
          : ((new Date().getTime() - new Date(record.clock_in_at).getTime()) / (1000 * 60 * 60)).toFixed(2),
        new Date(record.clock_in_at).toLocaleDateString('ja-JP')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `attendance_${selectedDate}_${dateRange}days.csv`
    link.click()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP')
  }

  const formatHours = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}時間${m}分`
  }

  const getWorkHours = (record: AttendanceRecord) => {
    if (record.clock_out_at) {
      return (new Date(record.clock_out_at).getTime() - new Date(record.clock_in_at).getTime()) / (1000 * 60 * 60)
    } else {
      return (new Date().getTime() - new Date(record.clock_in_at).getTime()) / (1000 * 60 * 60)
    }
  }

  const getTotalWorkHours = () => {
    return attendanceRecords.reduce((total, record) => {
      return total + getWorkHours(record)
    }, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF6DE]/70 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4C84B] mx-auto mb-4"></div>
          <p className="text-[#6E5B2E]">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          勤怠管理（管理者）
        </h1>

        {/* コントロール */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                表示期間
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value={7}>直近7日</option>
                <option value={14}>直近14日</option>
                <option value={30}>直近30日</option>
                <option value={60}>直近60日</option>
                <option value={90}>直近90日</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                従業員
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">全従業員</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                基準日
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <button
                onClick={exportCSV}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                CSV出力
              </button>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">総勤務時間</h3>
            <p className="text-3xl font-bold text-blue-600">
              {formatHours(getTotalWorkHours())}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">記録件数</h3>
            <p className="text-3xl font-bold text-green-600">
              {attendanceRecords.length}件
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">対象従業員数</h3>
            <p className="text-3xl font-bold text-purple-600">
              {selectedEmployee === 'all' ? employees.length : 1}名
            </p>
          </div>
        </div>

        {/* 勤怠記録一覧 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">勤怠記録一覧</h2>
            <p className="text-sm text-gray-500 mt-1">
              {dateRange}日間の記録を表示中
            </p>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">読み込み中...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      従業員名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      出社時刻
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      退勤時刻
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      勤務時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日付
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.employees.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(record.clock_in_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.clock_out_at ? formatTime(record.clock_out_at) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatHours(getWorkHours(record))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.clock_in_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.clock_out_at 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.clock_out_at ? '完了' : '勤務中'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!loading && attendanceRecords.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              該当する勤怠記録がありません
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
