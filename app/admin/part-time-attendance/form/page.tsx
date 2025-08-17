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

interface LocationData {
  latitude: number
  longitude: number
  address: string
}

export default function PartTimeAttendanceFormPage() {
  const [employees, setEmployees] = useState<PartTimeEmployee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [attendanceType, setAttendanceType] = useState<'clock_in' | 'clock_out'>('clock_in')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [locationError, setLocationError] = useState<string>('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)

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
        // 国土地理院の逆ジオコーディングAPI（無料）
        const response = await fetch(
          `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${latitude}&lon=${longitude}`
        )
        const data = await response.json()
        if (data.results && data.results[0] && data.results[0].muni) {
          const result = data.results[0]
          address = `${result.pref}${result.muni}${result.local}`
        } else {
          address = `緯度: ${latitude.toFixed(6)}, 経度: ${longitude.toFixed(6)}`
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
    <div className="min-h-screen bg-gray-100" style={{ paddingTop: 'var(--header-height, 0px)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">勤怠フォーム</h1>
              <p className="text-gray-600 mt-2">センチュリー21 ホームマート</p>
            </div>
            <Link
              href="/admin/part-time-attendance"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              管理画面に戻る
            </Link>
          </div>
        </div>

        {/* 勤怠フォーム */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">勤怠記録</h2>
          
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

            {/* 出社・退社選択 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                勤怠タイプ <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="clock_in"
                    checked={attendanceType === 'clock_in'}
                    onChange={(e) => setAttendanceType(e.target.value as 'clock_in' | 'clock_out')}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-lg font-medium text-green-600">出社</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="clock_out"
                    checked={attendanceType === 'clock_out'}
                    onChange={(e) => setAttendanceType(e.target.value as 'clock_in' | 'clock_out')}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-lg font-medium text-red-600">退社</span>
                </label>
              </div>
            </div>

            {/* 位置情報取得 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                位置情報 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isGettingLocation ? '位置情報を取得中...' : '現在地の位置情報を取得'}
                </button>
                
                {locationData && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>位置情報を取得しました</strong>
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      緯度: {locationData.latitude.toFixed(6)}, 経度: {locationData.longitude.toFixed(6)}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      住所: {locationData.address}
                    </p>
                  </div>
                )}
                
                {locationError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{locationError}</p>
                  </div>
                )}
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

            {/* 現在時刻表示 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">現在時刻</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Date().toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={loading || !selectedEmployee || !locationData}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-bold text-lg"
            >
              {loading ? '送信中...' : `${attendanceType === 'clock_in' ? '出社' : '退社'}を記録`}
            </button>
          </form>
        </div>

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">注意事項</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 出社時と退社時は別々の時間に申請フォームを送信してください</li>
            <li>• 位置情報の取得には、ブラウザで位置情報の使用を許可する必要があります</li>
            <li>• 勤怠記録は申請フォームを送信した時間で記録されます</li>
            <li>• 同じ日に複数回の出社・退社記録がある場合は、最新の記録で更新されます</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
