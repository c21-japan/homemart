import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employee_id, attendance_type, location_data, timestamp } = body

    // 勤怠記録をデータベースに保存
    const { data, error } = await supabase
      .from('part_time_attendance_realtime')
      .insert([{
        employee_id,
        attendance_type,
        location_data,
        timestamp,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Error saving realtime attendance:', error)
      return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 })
    }

    // 成功レスポンス
    return NextResponse.json({ 
      success: true, 
      data,
      message: `${attendance_type === 'clock_in' ? '出社' : '退社'}記録を保存しました`
    })

  } catch (error) {
    console.error('Error in realtime attendance API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    // 最新の勤怠記録を取得
    const { data, error } = await supabase
      .from('part_time_attendance_realtime')
      .select(`
        *,
        part_time_employees(name)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching realtime attendance:', error)
      return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in realtime attendance GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
