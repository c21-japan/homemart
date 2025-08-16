// 日本の祝日データ（2025-2026年）
const JAPANESE_HOLIDAYS = [
  // 2025年
  '2025-01-01', // 元日
  '2025-01-13', // 成人の日
  '2025-02-11', // 建国記念の日
  '2025-02-23', // 天皇誕生日
  '2025-02-24', // 振替休日
  '2025-03-21', // 春分の日
  '2025-04-29', // 昭和の日
  '2025-05-03', // 憲法記念日
  '2025-05-04', // みどりの日
  '2025-05-05', // こどもの日
  '2025-05-06', // 振替休日
  '2025-07-21', // 海の日
  '2025-08-11', // 山の日
  '2025-09-15', // 敬老の日
  '2025-09-23', // 秋分の日
  '2025-10-13', // スポーツの日
  '2025-11-03', // 文化の日
  '2025-11-23', // 勤労感謝の日
  '2025-11-24', // 振替休日
  // 年末年始（当社の休み）
  '2025-12-29', // 年末年始
  '2025-12-30', // 年末年始
  '2025-12-31', // 年末年始
  '2026-01-02', // 年末年始
  '2026-01-03', // 年末年始
]

/**
 * 指定された日付が営業日かどうかを判定
 */
export function isBusinessDay(date: Date): boolean {
  const dayOfWeek = date.getDay()
  const dateString = date.toISOString().split('T')[0]
  
  // 土日は営業日外
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false
  }
  
  // 祝日は営業日外
  if (JAPANESE_HOLIDAYS.includes(dateString)) {
    return false
  }
  
  return true
}

/**
 * 指定された日付から指定営業日数後の日付を計算
 */
export function addBusinessDays(startDate: Date, businessDays: number): Date {
  const result = new Date(startDate)
  let addedDays = 0
  
  while (addedDays < businessDays) {
    result.setDate(result.getDate() + 1)
    if (isBusinessDay(result)) {
      addedDays++
    }
  }
  
  return result
}

/**
 * 指定された日付から指定営業日数前の日付を計算
 */
export function subtractBusinessDays(startDate: Date, businessDays: number): Date {
  const result = new Date(startDate)
  let subtractedDays = 0
  
  while (subtractedDays < businessDays) {
    result.setDate(result.getDate() - 1)
    if (isBusinessDay(result)) {
      subtractedDays++
    }
  }
  
  return result
}

/**
 * 媒介契約種別に基づいてレインズ登録期限を計算
 */
export function calculateReinsDeadline(signedAt: Date, contractType: '専属専任' | '専任' | '一般'): Date {
  switch (contractType) {
    case '専属専任':
      // 翌日起算で5営業日
      return addBusinessDays(new Date(signedAt.getTime() + 24 * 60 * 60 * 1000), 5)
    case '専任':
      // 翌日起算で7営業日
      return addBusinessDays(new Date(signedAt.getTime() + 24 * 60 * 60 * 1000), 7)
    case '一般':
      // 一般は期限なし
      return new Date('9999-12-31')
    default:
      throw new Error('無効な契約種別です')
  }
}

/**
 * 媒介契約種別に基づいて次回報告日を計算
 */
export function calculateNextReportDate(lastReportDate: Date, contractType: '専属専任' | '専任' | '一般'): Date {
  switch (contractType) {
    case '専属専任':
      // 週1回（7日後）
      return addBusinessDays(lastReportDate, 7)
    case '専任':
      // 2週に1回（14日後）
      return addBusinessDays(lastReportDate, 14)
    case '一般':
      // 一般は任意
      return new Date('9999-12-31')
    default:
      throw new Error('無効な契約種別です')
  }
}

/**
 * 媒介契約種別に基づいて報告間隔日数を取得
 */
export function getReportIntervalDays(contractType: '専属専任' | '専任' | '一般'): number {
  switch (contractType) {
    case '専属専任':
      return 7
    case '専任':
      return 14
    case '一般':
      return 0
    default:
      throw new Error('無効な契約種別です')
  }
}

/**
 * 指定された日付がレインズ登録期限切れかどうかを判定
 */
export function isReinsOverdue(deadline: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today > deadline
}

/**
 * レインズ登録期限までの残り営業日数を計算
 */
export function getRemainingBusinessDays(deadline: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (today >= deadline) {
    return 0
  }
  
  let remainingDays = 0
  const current = new Date(today)
  
  while (current < deadline) {
    if (isBusinessDay(current)) {
      remainingDays++
    }
    current.setDate(current.getDate() + 1)
  }
  
  return remainingDays
}

/**
 * 日付を日本語形式でフォーマット
 */
export function formatDateJP(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  return `${year}年${month}月${day}日`
}

/**
 * 日付を短縮形式でフォーマット
 */
export function formatDateShort(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  return `${month}/${day}`
}
