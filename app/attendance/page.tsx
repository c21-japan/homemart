'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { attendanceAPI, DailyAttendance, MonthlyAttendance, Employee } from '@/lib/supabase/attendance'

export default function AttendancePage() {
  const { user, isLoaded } = useUser()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [dailyAttendance, setDailyAttendance] = useState<DailyAttendance | null>(null)
  const [monthlyAttendance, setMonthlyAttendance] = useState<MonthlyAttendance | null>(null)
  const [isWorking, setIsWorking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (isLoaded && user) {
      initializeEmployee()
    }
  }, [isLoaded, user])

  useEffect(() => {
    // 現在時刻を1秒ごとに更新
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const initializeEmployee = async () => {
    if (!user) return

    try {
      // 従業員情報を取得
      let employeeData = await attendanceAPI.getEmployeeByAuthId(user.id)
      
      if (!employeeData) {
        // 従業員が存在しない場合は作成
        const name = user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || 'Unknown'
        employeeData = await attendanceAPI.createEmployee(user.id, name)
      }
      
      if (employeeData) {
        setEmployee(employeeData)
        await fetchAttendanceData(employeeData.id)
      }
    } catch (error) {
      console.error('従業員の初期化に失敗:', error)
      setMessage('従業員情報の初期化に失敗しました')
    }
  }

  const fetchAttendanceData = async (employeeId: string) => {
    try {
      // 当日の勤怠データ取得
      const dailyData = await attendanceAPI.getDailyAttendance(employeeId)
      
      if (dailyData) {
        setDailyAttendance(dailyData)
        setIsWorking(!dailyData.clock_out_jst)
      }

      // 当月の勤怠データ取得
      const monthlyData = await attendanceAPI.getMonthlyAttendance(employeeId)
      
      if (monthlyData) {
        setMonthlyAttendance(monthlyData)
      }
    } catch (error) {
      console.error('勤怠データの取得に失敗しました:', error)
    }
  }

  const handlePunchIn = async () => {
    if (!employee) return
    
    setLoading(true)
    setMessage('')
    
    try {
      const result = await attendanceAPI.punchIn(employee.id)

      if (result.success) {
        setMessage(result.message)
        await fetchAttendanceData(employee.id)
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('出社打刻に失敗しました')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePunchOut = async () => {
    if (!employee) return
    
    setLoading(true)
    setMessage('')
    
    try {
      const result = await attendanceAPI.punchOut(employee.id)

      if (result.success) {
        setMessage(result.message)
        await fetchAttendanceData(employee.id)
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('退勤打刻に失敗しました')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatHours = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}時間${m}分`
  }

  const getCurrentWorkHours = () => {
    if (!dailyAttendance || dailyAttendance.clock_out_jst) return 0
    
    const clockInTime = new Date(dailyAttendance.clock_in_jst)
    const now = new Date()
    return (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">ログインが必要です</h1>
          <p className="text-gray-600">勤怠管理システムにアクセスするにはログインしてください</p>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">従業員情報を初期化中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          勤怠管理
        </h1>

        {/* 従業員情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">従業員情報</h2>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-800">{employee.name}</p>
            <p className="text-sm text-gray-500">ID: {employee.id.slice(0, 8)}...</p>
          </div>
        </div>

        {/* 現在時刻 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">現在時刻</h2>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {currentTime.toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {currentTime.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
          </div>
        </div>

        {/* 勤務状況 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">勤務状況</h2>
          <div className={`text-center p-4 rounded-lg ${
            isWorking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            <span className="text-lg font-medium">
              {isWorking ? '勤務中' : '勤務外'}
            </span>
          </div>
        </div>

        {/* 打刻ボタン */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">打刻</h2>
          <div className="flex gap-4 justify-center">
            {!isWorking && (
              <button
                onClick={handlePunchIn}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? '処理中...' : '出社'}
              </button>
            )}
            {isWorking && (
              <button
                onClick={handlePunchOut}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? '処理中...' : '退勤'}
              </button>
            )}
          </div>
          {message && (
            <div className="mt-4 text-center text-sm text-gray-600">
              {message}
            </div>
          )}
        </div>

        {/* 当日の勤務時間 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">今日の勤務時間</h2>
          {dailyAttendance ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">出社時刻:</span>
                <span className="font-medium">{formatTime(dailyAttendance.clock_in_jst)}</span>
              </div>
              {dailyAttendance.clock_out_jst && (
                <div className="flex justify-between">
                  <span className="text-gray-600">退勤時刻:</span>
                  <span className="font-medium">{formatTime(dailyAttendance.clock_out_jst)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600 font-medium">勤務時間:</span>
                <span className="font-bold text-lg">
                  {isWorking 
                    ? formatHours(getCurrentWorkHours())
                    : formatHours(dailyAttendance.work_hours)
                  }
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              今日はまだ勤務していません
            </div>
          )}
        </div>

        {/* 当月の総勤務時間 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">今月の総勤務時間</h2>
          {monthlyAttendance ? (
            <div className="text-center">
              <span className="text-3xl font-bold text-blue-600">
                {formatHours(monthlyAttendance.total_work_hours)}
              </span>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              今月はまだ勤務していません
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
