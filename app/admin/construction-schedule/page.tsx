'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { hasPermission } from '@/lib/auth/permissions'

interface ScheduleItem {
  id: string
  customer_id?: string | null
  reform_project_id?: string | null
  assignee_id?: string | null
  work_date: string
  start_time: string
  end_time: string
  task_name: string
  site_name?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  customers?: {
    name: string
  } | null
  reform_projects?: {
    title: string
  } | null
  staff_members?: {
    name: string
  } | null
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
}

interface CustomerOption {
  id: string
  name: string
  category: 'seller' | 'buyer' | 'reform'
}

interface ReformProjectOption {
  id: string
  title: string
}

interface StaffOption {
  id: string
  name: string
  role: string
}

const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土']

const toDateString = (date: Date) => date.toISOString().split('T')[0]
const parseDateString = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

const formatTime = (timeValue?: string | null) => {
  if (!timeValue) return ''
  const [hours, minutes] = timeValue.split(':')
  return `${hours}:${minutes}`
}

export default function ConstructionSchedulePage() {
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [items, setItems] = useState<ScheduleItem[]>([])
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [reformProjects, setReformProjects] = useState<ReformProjectOption[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffOption[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [reformSearch, setReformSearch] = useState('')
  const [staffSearch, setStaffSearch] = useState('')
  const [assigneeFilterId, setAssigneeFilterId] = useState('')
  const [summaryMode, setSummaryMode] = useState<'day' | 'week'>('day')
  const [summaryDate, setSummaryDate] = useState(toDateString(new Date()))
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [canView, setCanView] = useState(true)
  const [canEdit, setCanEdit] = useState(true)
  const [canDelete, setCanDelete] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null)
  const [formData, setFormData] = useState({
    start_time: '09:00',
    end_time: '18:00',
    task_name: '',
    site_name: '',
    notes: '',
    customer_id: '',
    reform_project_id: '',
    assignee_id: ''
  })

  useEffect(() => {
    fetchPermissions()
  }, [])

  useEffect(() => {
    if (!canView) {
      setLoading(false)
      return
    }
    fetchSchedule()
  }, [selectedYear, selectedMonth, canView])

  useEffect(() => {
    if (!canView) return
    fetchOptions()
  }, [canView])

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        setPermissionError('権限情報の取得に失敗したため、閲覧のみ許可されています。')
        setCanView(true)
        setCanEdit(false)
        setCanDelete(false)
        return
      }
      const currentUser = await response.json()
      const permissions = currentUser?.permissions || {}
      const viewAllowed = hasPermission(permissions, 'CONSTRUCTION_SCHEDULE', 'VIEW')
      const editAllowed =
        hasPermission(permissions, 'CONSTRUCTION_SCHEDULE', 'CREATE') ||
        hasPermission(permissions, 'CONSTRUCTION_SCHEDULE', 'EDIT')
      const deleteAllowed = hasPermission(permissions, 'CONSTRUCTION_SCHEDULE', 'DELETE')

      setCanView(viewAllowed)
      setCanEdit(editAllowed)
      setCanDelete(deleteAllowed)
      if (!viewAllowed) {
        setPermissionError('工程表の閲覧権限がありません。')
      }
    } catch (error) {
      setPermissionError('権限情報の取得に失敗したため、閲覧のみ許可されています。')
      setCanView(true)
      setCanEdit(false)
      setCanDelete(false)
    }
  }

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      const startDate = new Date(selectedYear, selectedMonth - 1, 1)
      const endDate = new Date(selectedYear, selectedMonth, 0)

      const { data, error } = await supabase
        .from('construction_schedules')
        .select('*, customers(name), reform_projects(title), staff_members(name)')
        .gte('work_date', toDateString(startDate))
        .lte('work_date', toDateString(endDate))
        .order('work_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching schedules:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const fetchOptions = async () => {
    try {
      const [customersResult, reformResult, staffResult] = await Promise.all([
        supabase
          .from('customers')
          .select('id, name, category')
          .order('created_at', { ascending: false }),
        supabase
          .from('reform_projects')
          .select('id, title')
          .order('created_at', { ascending: false }),
        supabase
          .from('staff_members')
          .select('id, name, role')
          .order('name', { ascending: true })
      ])

      if (!customersResult.error) {
        setCustomers(customersResult.data || [])
      }
      if (!reformResult.error) {
        setReformProjects(reformResult.data || [])
      }
      if (!staffResult.error) {
        setStaffMembers(staffResult.data || [])
      }
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const year = selectedYear
    const month = selectedMonth
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const daysInMonth = lastDay.getDate()
    const firstDayOfWeek = firstDay.getDay()

    const days: CalendarDay[] = []

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 2, lastDay.getDate() - i)
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false
      })
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month - 1, i)
      const today = new Date()
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday:
          today.getFullYear() === year &&
          today.getMonth() === month - 1 &&
          today.getDate() === i
      })
    }

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
  }, [selectedYear, selectedMonth])

  const visibleItems = useMemo(() => {
    if (!assigneeFilterId) return items
    return items.filter((item) => item.assignee_id === assigneeFilterId)
  }, [items, assigneeFilterId])

  const itemsByDate = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>()
    visibleItems.forEach((item) => {
      const key = item.work_date
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)!.push(item)
    })
    return map
  }, [visibleItems])

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers
    const keyword = customerSearch.trim().toLowerCase()
    return customers.filter((customer) => customer.name.toLowerCase().includes(keyword))
  }, [customers, customerSearch])

  const filteredReformProjects = useMemo(() => {
    if (!reformSearch.trim()) return reformProjects
    const keyword = reformSearch.trim().toLowerCase()
    return reformProjects.filter((project) => project.title.toLowerCase().includes(keyword))
  }, [reformProjects, reformSearch])

  const filteredStaffMembers = useMemo(() => {
    if (!staffSearch.trim()) return staffMembers
    const keyword = staffSearch.trim().toLowerCase()
    return staffMembers.filter((staff) => staff.name.toLowerCase().includes(keyword))
  }, [staffMembers, staffSearch])

  const summaryWeekRange = useMemo(() => {
    const baseDate = parseDateString(summaryDate)
    const dayOfWeek = baseDate.getDay()
    const offset = (dayOfWeek + 6) % 7
    const start = new Date(baseDate)
    start.setDate(baseDate.getDate() - offset)
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return date
    })
    return days
  }, [summaryDate])

  const summaryItemsByDay = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>()
    visibleItems.forEach((item) => {
      if (!map.has(item.work_date)) {
        map.set(item.work_date, [])
      }
      map.get(item.work_date)!.push(item)
    })
    return map
  }, [visibleItems])

  const openDayModal = (date: Date) => {
    setSelectedDate(date)
    setEditingItem(null)
    setCustomerSearch('')
    setReformSearch('')
    setStaffSearch('')
    setFormData({
      start_time: '09:00',
      end_time: '18:00',
      task_name: '',
      site_name: '',
      notes: '',
      customer_id: '',
      reform_project_id: '',
      assignee_id: ''
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedDate(null)
    setEditingItem(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedDate) return

    if (!formData.task_name.trim()) {
      alert('作業内容を入力してください')
      return
    }

    if (!formData.start_time || !formData.end_time) {
      alert('開始・終了時間を入力してください')
      return
    }

    const payload = {
      work_date: toDateString(selectedDate),
      start_time: formData.start_time,
      end_time: formData.end_time,
      task_name: formData.task_name,
      site_name: formData.site_name || null,
      notes: formData.notes || null,
      customer_id: formData.customer_id || null,
      reform_project_id: formData.reform_project_id || null,
      assignee_id: formData.assignee_id || null,
      updated_at: new Date().toISOString()
    }

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('construction_schedules')
          .update(payload)
          .eq('id', editingItem.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('construction_schedules')
          .insert([payload])

        if (error) throw error
      }

      await fetchSchedule()
      setEditingItem(null)
      setFormData({
        start_time: '09:00',
        end_time: '18:00',
        task_name: '',
        site_name: '',
        notes: '',
        customer_id: '',
        reform_project_id: '',
        assignee_id: ''
      })
    } catch (error) {
      console.error('Error saving schedule:', error)
      alert('保存に失敗しました')
    }
  }

  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item)
    setCustomerSearch('')
    setReformSearch('')
    setStaffSearch('')
    setFormData({
      start_time: formatTime(item.start_time),
      end_time: formatTime(item.end_time),
      task_name: item.task_name,
      site_name: item.site_name || '',
      notes: item.notes || '',
      customer_id: item.customer_id || '',
      reform_project_id: item.reform_project_id || '',
      assignee_id: item.assignee_id || ''
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この工程を削除してもよろしいですか？')) return

    try {
      const { error } = await supabase
        .from('construction_schedules')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchSchedule()
    } catch (error) {
      console.error('Error deleting schedule:', error)
      alert('削除に失敗しました')
    }
  }

  const yearOptions = Array.from({ length: 5 }, (_, index) => {
    const currentYear = new Date().getFullYear()
    return currentYear - 2 + index
  })

  const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 'var(--header-height, 0px)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-100" style={{ paddingTop: 'var(--header-height, 0px)' }}>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">工程表</h1>
            <p className="text-gray-600">この画面を閲覧する権限がありません。</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ paddingTop: 'var(--header-height, 0px)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">工程表（カレンダー）</h1>
              <p className="text-gray-600 mt-2">日付をクリックして時間単位の工程を登録できます</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                管理画面に戻る
              </Link>
            </div>
          </div>
        </div>

        {permissionError && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6">
            {permissionError}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">担当者フィルター</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">担当者</label>
              <select
                value={assigneeFilterId}
                onChange={(event) => setAssigneeFilterId(event.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">全員</option>
                {staffMembers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-3">
              <button
                type="button"
                onClick={() => setAssigneeFilterId('')}
                className="px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                フィルター解除
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">表示月</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">年</label>
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {yearOptions.map((year) => (
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
                onChange={(event) => setSelectedMonth(Number(event.target.value))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {month}月
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">{selectedYear}年{selectedMonth}月 工程表</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-7 gap-1">
              {weekdayLabels.map((day) => (
                <div key={day} className="p-2 text-center font-bold text-gray-600 bg-gray-50 rounded">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => {
                const dateKey = toDateString(day.date)
                const dayItems = itemsByDate.get(dateKey) || []

                return (
                  <button
                    key={`${dateKey}-${index}`}
                    type="button"
                    onClick={() => openDayModal(day.date)}
                    className={`text-left p-2 min-h-[110px] border rounded transition hover:border-blue-400 hover:bg-blue-50/40 ${
                      day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                    } ${day.isToday ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="text-sm font-medium mb-1">{day.date.getDate()}</div>
                    {dayItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="text-xs text-gray-700 truncate">
                        <span className="font-semibold text-blue-600">
                          {formatTime(item.start_time)}
                        </span>
                        <span className="ml-1">{item.task_name}</span>
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="text-xs text-gray-400 mt-1">他 {dayItems.length - 3} 件</div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mt-6">
          <div className="p-6 border-b">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold">担当者別 日次/週次一覧</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {assigneeFilterId
                    ? `担当: ${staffMembers.find((staff) => staff.id === assigneeFilterId)?.name || ''}`
                    : '全担当者'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSummaryMode('day')}
                  className={`px-4 py-2 rounded-lg border ${
                    summaryMode === 'day' ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-600'
                  }`}
                >
                  日次
                </button>
                <button
                  type="button"
                  onClick={() => setSummaryMode('week')}
                  className={`px-4 py-2 rounded-lg border ${
                    summaryMode === 'week' ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-600'
                  }`}
                >
                  週次
                </button>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {summaryMode === 'day' ? '日付を選択' : '週の基準日を選択'}
              </label>
              <input
                type="date"
                value={summaryDate}
                onChange={(event) => setSummaryDate(event.target.value)}
                className="w-full md:w-64 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {summaryMode === 'day' && (
              <div className="space-y-3">
                {(summaryItemsByDay.get(summaryDate) || []).length === 0 && (
                  <p className="text-sm text-gray-500">この日の工程はありません。</p>
                )}
                {(summaryItemsByDay.get(summaryDate) || []).map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="text-sm text-blue-600 font-semibold">
                      {formatTime(item.start_time)} - {formatTime(item.end_time)}
                    </div>
                    <div className="text-base font-bold text-gray-800">{item.task_name}</div>
                    {item.staff_members?.name && (
                      <div className="text-sm text-gray-500">担当: {item.staff_members.name}</div>
                    )}
                    {item.site_name && (
                      <div className="text-sm text-gray-500">現場: {item.site_name}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {summaryMode === 'week' && (
              <div className="space-y-4">
                {summaryWeekRange.map((date) => {
                  const key = toDateString(date)
                  const dayItems = summaryItemsByDay.get(key) || []
                  return (
                    <div key={key} className="border rounded-lg p-4">
                      <div className="font-semibold text-gray-800 mb-2">
                        {date.toLocaleDateString('ja-JP', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </div>
                      {dayItems.length === 0 ? (
                        <p className="text-sm text-gray-500">工程なし</p>
                      ) : (
                        <div className="space-y-2">
                          {dayItems.map((item) => (
                            <div key={item.id} className="text-sm text-gray-700">
                              <span className="text-blue-600 font-semibold">
                                {formatTime(item.start_time)}-{formatTime(item.end_time)}
                              </span>
                              <span className="ml-2">{item.task_name}</span>
                              {item.staff_members?.name && (
                                <span className="ml-2 text-gray-500">({item.staff_members.name})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-bold">{selectedDate.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}</h3>
                <p className="text-sm text-gray-500 mt-1">時間単位の工程を入力してください</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-bold mb-3">登録済み工程</h4>
                {itemsByDate.get(toDateString(selectedDate))?.length ? (
                  <div className="space-y-3">
                    {itemsByDate.get(toDateString(selectedDate))!.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                  <div className="text-sm text-blue-600 font-semibold">
                    {formatTime(item.start_time)} - {formatTime(item.end_time)}
                  </div>
                  <div className="text-base font-bold text-gray-800">{item.task_name}</div>
                  {(item.site_name || item.staff_members?.name) && (
                    <div className="text-sm text-gray-500">
                      {item.site_name && <span>現場: {item.site_name}</span>}
                      {item.site_name && item.staff_members?.name && <span className="mx-2">/</span>}
                      {item.staff_members?.name && <span>担当: {item.staff_members.name}</span>}
                    </div>
                  )}
                  {(item.customers?.name || item.reform_projects?.title) && (
                    <div className="text-sm text-gray-500 mt-1">
                      {item.customers?.name && (
                        <span>
                          顧客:{' '}
                          <Link
                            href={`/admin/customers/${item.customer_id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {item.customers.name}
                          </Link>
                        </span>
                      )}
                      {item.customers?.name && item.reform_projects?.title && (
                        <span className="mx-2">/</span>
                      )}
                      {item.reform_projects?.title && (
                        <span>
                          施工実績:{' '}
                          <Link
                            href="/admin/reform-projects"
                            className="text-blue-600 hover:underline"
                          >
                            {item.reform_projects.title}
                          </Link>
                        </span>
                      )}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-sm text-gray-500 mt-1">{item.notes}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1 text-sm rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      編集
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 text-sm rounded-lg border border-red-500 text-red-600 hover:bg-red-50"
                    >
                      削除
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">この日の工程はまだ登録されていません。</p>
                )}
              </div>

              <div className="border-t pt-6">
                <h4 className="text-lg font-bold mb-4">{editingItem ? '工程を編集' : '工程を追加'}</h4>
                {!canEdit ? (
                  <div className="text-sm text-gray-500">編集権限がないため登録はできません。</div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">開始時間</label>
                        <input
                          type="time"
                          value={formData.start_time}
                          onChange={(event) => setFormData({ ...formData, start_time: event.target.value })}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">終了時間</label>
                        <input
                          type="time"
                          value={formData.end_time}
                          onChange={(event) => setFormData({ ...formData, end_time: event.target.value })}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">作業内容</label>
                      <input
                        type="text"
                        value={formData.task_name}
                        onChange={(event) => setFormData({ ...formData, task_name: event.target.value })}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例: 解体工事、配管工事、塗装作業"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">顧客案件</label>
                        <input
                          type="text"
                          value={customerSearch}
                          onChange={(event) => setCustomerSearch(event.target.value)}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                          placeholder="顧客名で検索"
                        />
                        <select
                          value={formData.customer_id}
                          onChange={(event) => {
                            const value = event.target.value
                            setFormData({
                              ...formData,
                              customer_id: value,
                              reform_project_id: value ? '' : formData.reform_project_id
                            })
                          }}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">選択しない</option>
                          {filteredCustomers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.name} ({customer.category === 'reform' ? 'リフォーム' : customer.category === 'seller' ? '売却' : '購入'})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">施工実績案件</label>
                        <input
                          type="text"
                          value={reformSearch}
                          onChange={(event) => setReformSearch(event.target.value)}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                          placeholder="施工実績名で検索"
                        />
                        <select
                          value={formData.reform_project_id}
                          onChange={(event) => {
                            const value = event.target.value
                            setFormData({
                              ...formData,
                              reform_project_id: value,
                              customer_id: value ? '' : formData.customer_id
                            })
                          }}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">選択しない</option>
                          {filteredReformProjects.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">現場名</label>
                        <input
                          type="text"
                          value={formData.site_name}
                          onChange={(event) => setFormData({ ...formData, site_name: event.target.value })}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="例: 〇〇様邸"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">担当者</label>
                        <input
                          type="text"
                          value={staffSearch}
                          onChange={(event) => setStaffSearch(event.target.value)}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                          placeholder="担当者名で検索"
                        />
                        <select
                          value={formData.assignee_id}
                          onChange={(event) => setFormData({ ...formData, assignee_id: event.target.value })}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">未指定</option>
                          {filteredStaffMembers.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                              {staff.name} ({staff.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">備考</label>
                      <textarea
                        value={formData.notes}
                        onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="注意点や準備物など"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold"
                      >
                        {editingItem ? '更新する' : '追加する'}
                      </button>
                      {editingItem && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(null)
                            setFormData({
                              start_time: '09:00',
                              end_time: '18:00',
                              task_name: '',
                              site_name: '',
                              notes: '',
                              customer_id: '',
                              reform_project_id: '',
                              assignee_id: ''
                            })
                          }}
                          className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          編集をやめる
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
