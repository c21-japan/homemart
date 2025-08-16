import { supabase } from '../supabase'

export interface Employee {
  id: string
  auth_user_id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AttendanceRecord {
  id: string
  employee_id: string
  clock_in_at: string
  clock_out_at: string | null
  created_at: string
  updated_at: string
}

export interface DailyAttendance {
  employee_id: string
  employee_name: string
  clock_in_jst: string
  clock_out_jst: string | null
  work_hours: number
  work_date: string
}

export interface MonthlyAttendance {
  employee_id: string
  employee_name: string
  month: string
  total_work_hours: number
}

export interface PunchResult {
  success: boolean
  message: string
  record_id?: string
}

// 従業員関連の関数
export const attendanceAPI = {
  // 従業員情報を取得
  async getEmployeeByAuthId(authUserId: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single()
    
    if (error) {
      console.error('従業員情報の取得に失敗:', error)
      return null
    }
    
    return data
  },

  // 従業員を作成
  async createEmployee(authUserId: string, name: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .insert({
        auth_user_id: authUserId,
        name: name,
        is_active: true
      })
      .select()
      .single()
    
    if (error) {
      console.error('従業員の作成に失敗:', error)
      return null
    }
    
    return data
  },

  // 全従業員を取得（管理者用）
  async getAllEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) {
      console.error('全従業員の取得に失敗:', error)
      return []
    }
    
    return data || []
  },

  // 勤怠記録関連の関数
  async getDailyAttendance(employeeId: string): Promise<DailyAttendance | null> {
    const { data, error } = await supabase
      .from('attendance_daily_view')
      .select('*')
      .eq('employee_id', employeeId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // データが見つからない場合（当日の勤怠がない）
        return null
      }
      console.error('日次勤怠の取得に失敗:', error)
      return null
    }
    
    return data
  },

  async getMonthlyAttendance(employeeId: string): Promise<MonthlyAttendance | null> {
    const { data, error } = await supabase
      .from('attendance_monthly_view')
      .select('*')
      .eq('employee_id', employeeId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // データが見つからない場合（当月の勤怠がない）
        return null
      }
      console.error('月次勤怠の取得に失敗:', error)
      return null
    }
    
    return data
  },

  // 出社打刻
  async punchIn(employeeId: string): Promise<PunchResult> {
    const { data, error } = await supabase.rpc('punch_in', {
      employee_uuid: employeeId
    })
    
    if (error) {
      console.error('出社打刻に失敗:', error)
      return {
        success: false,
        message: '出社打刻に失敗しました'
      }
    }
    
    return data
  },

  // 退勤打刻
  async punchOut(employeeId: string): Promise<PunchResult> {
    const { data, error } = await supabase.rpc('punch_out', {
      employee_uuid: employeeId
    })
    
    if (error) {
      console.error('退勤打刻に失敗:', error)
      return {
        success: false,
        message: '退勤打刻に失敗しました'
      }
    }
    
    return data
  },

  // 勤怠記録一覧を取得（管理者用）
  async getAttendanceRecords(startDate: Date, endDate: Date): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        employees!inner(name)
      `)
      .gte('clock_in_at', startDate.toISOString())
      .lte('clock_in_at', endDate.toISOString())
      .order('clock_in_at', { ascending: false })
    
    if (error) {
      console.error('勤怠記録の取得に失敗:', error)
      return []
    }
    
    return data || []
  },

  // 従業員IDで勤怠記録を取得
  async getAttendanceRecordsByEmployee(employeeId: string, days: number = 30): Promise<AttendanceRecord[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('clock_in_at', startDate.toISOString())
      .order('clock_in_at', { ascending: false })
    
    if (error) {
      console.error('従業員の勤怠記録取得に失敗:', error)
      return []
    }
    
    return data || []
  }
}
