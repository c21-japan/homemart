'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface PartTimeEmployee {
  id: string
  name: string
  email: string
  phone: string
  position: string
  is_active: boolean
}

interface LocationData {
  latitude: number
  longitude: number
  address: string
}

export default function PartTimeAttendancePublicPage() {
  const [employees, setEmployees] = useState<PartTimeEmployee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [attendanceType, setAttendanceType] = useState<'clock_in' | 'clock_out'>('clock_in')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [locationError, setLocationError] = useState<string>('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetchEmployees()
    // 現在時刻を1秒ごとに更新
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
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

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    setIsGettingLocation(true)
    setLocationError('')

    try {
      // GPS位置情報を取得
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser.'))
          return
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        })
      })

      const { latitude, longitude } = position.coords

      // 住所情報を取得（逆ジオコーディング）
      let address = '位置情報を取得しました'
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=ja`
        )
        const data = await response.json()
        if (data.display_name) {
          address = data.display_name
        }
      } catch (error) {
        console.warn('Address lookup failed:', error)
        address = `緯度: ${latitude.toFixed(6)}, 経度: ${longitude.toFixed(6)}`
      }

      const locationData: LocationData = {
        latitude,
        longitude,
        address
      }

      setLocationData(locationData)
      return locationData
    } catch (error) {
      console.error('Error getting location:', error)
      let errorMessage = '位置情報の取得に失敗しました'
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '位置情報の使用が許可されていません。ブラウザの設定で位置情報を許可してください。'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置情報が利用できません。'
            break
          case error.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました。'
            break
        }
      }
      
      setLocationError(errorMessage)
      return null
    } finally {
      setIsGettingLocation(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedEmployee) {
      alert('従業員を選択してください')
      return
    }

    if (!locationData) {
      alert('位置情報を取得してください')
      return
    }

    setLoading(true)

    try {
      const now = new Date()
      const today = now.toISOString().split('T')[0]

      // 既存の勤怠記録を確認
      const { data: existingRecord, error: checkError } = await supabase
        .from('part_time_attendance')
        .select('*')
        .eq('employee_id', selectedEmployee)
        .eq('date', today)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      let totalHours = 0
      let updatedRecord

      if (existingRecord) {
        // 既存の記録を更新
        const updateData: {
          updated_at: string
          clock_in_time?: string
          clock_out_time?: string
          clock_in_location?: string
          clock_out_location?: string
          clock_in_address?: string
          clock_out_address?: string
          total_hours?: number
          notes?: string
        } = {
          updated_at: now.toISOString()
        }

        if (attendanceType === 'clock_in') {
          updateData.clock_in_time = now.toISOString()
          updateData.clock_in_location = `(${locationData.latitude},${locationData.longitude})`
          updateData.clock_in_address = locationData.address
        } else {
          updateData.clock_out_time = now.toISOString()
          updateData.clock_out_location = `(${locationData.latitude},${locationData.longitude})`
          updateData.clock_out_address = locationData.address
        }

        // 勤務時間を計算
        if (updateData.clock_in_time && updateData.clock_out_time) {
          const clockIn = new Date(updateData.clock_in_time)
          const clockOut = new Date(updateData.clock_out_time)
          totalHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
          updateData.total_hours = Math.round(totalHours * 100) / 100
        }

        if (notes) {
          updateData.notes = notes
        }

        const { error: updateError } = await supabase
          .from('part_time_attendance')
          .update(updateData)
          .eq('id', existingRecord.id)

        if (updateError) throw updateError
        updatedRecord = { ...existingRecord, ...updateData }
      } else {
        // 新しい記録を作成
        const newRecord = {
          employee_id: selectedEmployee,
          date: today,
          clock_in_time: attendanceType === 'clock_in' ? now.toISOString() : null,
          clock_out_time: attendanceType === 'clock_out' ? now.toISOString() : null,
          clock_in_location: attendanceType === 'clock_in' ? `(${locationData.latitude},${locationData.longitude})` : null,
          clock_out_location: attendanceType === 'clock_out' ? `(${locationData.latitude},${locationData.longitude})` : null,
          clock_in_address: attendanceType === 'clock_in' ? locationData.address : null,
          clock_out_address: attendanceType === 'clock_out' ? locationData.address : null,
          notes: notes || null
        }

        const { data: insertData, error: insertError } = await supabase
          .from('part_time_attendance')
          .insert([newRecord])
          .select()
          .single()

        if (insertError) throw insertError
        updatedRecord = insertData
      }

      // 成功メッセージ
      const actionText = attendanceType === 'clock_in' ? '出社' : '退社'
      const timeText = now.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      })
      
      alert(`${actionText}を記録しました！\n時間: ${timeText}\n従業員: ${employees.find(e => e.id === selectedEmployee)?.name}`)

      // フォームをリセット
      setNotes('')
      setLocationData(null)
      setLocationError('')

    } catch (error) {
      console.error('Error submitting attendance:', error)
      alert('勤怠記録の登録に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const handleGetLocation = async () => {
    await getCurrentLocation()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">勤怠フォーム</h1>
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

        {/* 勤怠フォーム */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">勤怠記録</h2>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 従業員選択 */}
            <div>
              <label className="block text-lg font-medium mb-3 text-gray-700">
                従業員名 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all"
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

            {/* 出社・退社選択 */}
            <div>
              <label className="block text-lg font-medium mb-3 text-gray-700">
                勤怠タイプ <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  attendanceType === 'clock_in' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-green-300'
                }`}>
                  <input
                    type="radio"
                    value="clock_in"
                    checked={attendanceType === 'clock_in'}
                    onChange={(e) => setAttendanceType(e.target.value as 'clock_in' | 'clock_out')}
                    className="mr-3 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-xl font-bold">出社</span>
                </label>
                <label className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  attendanceType === 'clock_out' 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : 'border-gray-200 hover:border-red-300'
                }`}>
                  <input
                    type="radio"
                    value="clock_out"
                    checked={attendanceType === 'clock_out'}
                    onChange={(e) => setAttendanceType(e.target.value as 'clock_in' | 'clock_out')}
                    className="mr-3 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xl font-bold">退社</span>
                </label>
              </div>
            </div>

            {/* 位置情報取得 */}
            <div>
              <label className="block text-lg font-medium mb-3 text-gray-700">
                位置情報 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all text-lg font-bold shadow-lg"
                >
                  {isGettingLocation ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      位置情報を取得中...
                    </div>
                  ) : (
                    '現在地の位置情報を取得'
                  )}
                </button>
                
                {locationData && (
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <p className="text-lg font-bold text-green-800 mb-2">
                      ✅ 位置情報を取得しました
                    </p>
                    <p className="text-sm text-green-700 mb-1">
                      緯度: {locationData.latitude.toFixed(6)}, 経度: {locationData.longitude.toFixed(6)}
                    </p>
                    <p className="text-sm text-green-700">
                      住所: {locationData.address}
                    </p>
                  </div>
                )}
                
                {locationError && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-lg font-bold text-red-800">❌ {locationError}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 備考 */}
            <div>
              <label className="block text-lg font-medium mb-3 text-gray-700">
                備考
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all"
                placeholder="特記事項があれば入力してください"
              />
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={loading || !selectedEmployee || !locationData}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-5 px-6 rounded-xl hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all text-2xl font-bold shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  送信中...
                </div>
              ) : (
                `${attendanceType === 'clock_in' ? '出社' : '退社'}を記録`
              )}
            </button>
          </form>
        </div>

        {/* 注意事項 */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mt-8">
          <h3 className="text-xl font-bold text-yellow-800 mb-4">📋 注意事項</h3>
          <ul className="text-base text-yellow-700 space-y-2">
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              出社時と退社時は別々の時間に申請フォームを送信してください
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              位置情報の取得には、ブラウザで位置情報の使用を許可する必要があります
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              勤怠記録は申請フォームを送信した時間で記録されます
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              同じ日に複数回の出社・退社記録がある場合は、最新の記録で更新されます
            </li>
          </ul>
        </div>

        {/* 勤怠状況の確認（プロフィール機能は一時的に無効化） */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <h3 className="text-xl font-bold mb-4 text-center">勤怠状況の確認</h3>
          <p className="text-center text-gray-600 mb-4">
            プロフィール機能は現在開発中です。詳細な勤怠状況は管理者にお問い合わせください。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employees.map((employee) => (
              <button
                key={employee.id}
                onClick={() => alert(`${employee.name}の勤怠状況\n\nこの機能は現在開発中です。\n詳細は管理者にお問い合わせください。`)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all text-center font-bold shadow-lg cursor-pointer"
              >
                {employee.name}の詳細
              </button>
            ))}
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-8 text-gray-500">
          <p>© 2025 ホームマート（CENTURY 21加盟店）. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
