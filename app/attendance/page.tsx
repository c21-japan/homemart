'use client'

import { useEffect, useState } from 'react'
import { attendanceAPI, DailyAttendance, MonthlyAttendance, Employee } from '@/lib/supabase/attendance'

// Clerk認証なしのコンポーネント
function AttendanceWithoutAuth() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          勤怠管理システム
        </h1>
        
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

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">
              認証システムが無効化されています
            </h2>
            <p className="text-yellow-700">
              現在、認証機能が無効化されているため、勤怠管理機能は利用できません。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// メインコンポーネント
export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          勤怠管理システム
        </h1>
        
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

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">
              認証システムが無効化されています
            </h2>
            <p className="text-yellow-700">
              現在、認証機能が無効化されているため、勤怠管理機能は利用できません。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
