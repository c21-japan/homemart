'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

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

export default function ReportsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">勤怠レポート</h1>
      <p>この機能は準備中です</p>
    </div>
  )
}
