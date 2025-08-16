import { format, parseISO, addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

// タイムゾーン設定
const JST_TIMEZONE = 'Asia/Tokyo';

/**
 * UTC日時をJST日時に変換
 */
export function utcToJst(utcDate: Date | string): Date {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  return utcToZonedTime(date, JST_TIMEZONE);
}

/**
 * JST日時をUTC日時に変換
 */
export function jstToUtc(jstDate: Date | string): Date {
  const date = typeof jstDate === 'string' ? parseISO(jstDate) : jstDate;
  return zonedTimeToUtc(date, JST_TIMEZONE);
}

/**
 * 現在のJST日時を取得
 */
export function nowJst(): Date {
  return utcToZonedTime(new Date(), JST_TIMEZONE);
}

/**
 * 現在のJST日付を取得（時刻は00:00:00）
 */
export function todayJst(): Date {
  const now = nowJst();
  return startOfDay(now);
}

/**
 * 指定日数の前後のJST日付を取得
 */
export function addDaysJst(date: Date | string, days: number): Date {
  const jstDate = typeof date === 'string' ? parseISO(date) : date;
  return addDays(jstDate, days);
}

export function subDaysJst(date: Date | string, days: number): Date {
  const jstDate = typeof date === 'string' ? parseISO(date) : date;
  return subDays(jstDate, days);
}

/**
 * JST日時をフォーマット
 */
export function formatJst(date: Date | string, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string {
  const jstDate = typeof date === 'string' ? parseISO(date) : date;
  return format(jstDate, formatStr);
}

/**
 * JST日付のみをフォーマット
 */
export function formatJstDate(date: Date | string): string {
  return formatJst(date, 'yyyy-MM-dd');
}

/**
 * JST時刻のみをフォーマット
 */
export function formatJstTime(date: Date | string): string {
  return formatJst(date, 'HH:mm:ss');
}

/**
 * 媒介期限の計算（開始日+3ヶ月-1日）
 */
export function calculateBrokerageEnd(startDate: Date | string): Date {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  // 3ヶ月後から1日を引く
  const threeMonthsLater = new Date(start);
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  return subDays(threeMonthsLater, 1);
}

/**
 * 媒介期限の14日前の日付を取得
 */
export function getBrokerageReminderDate(endDate: Date | string): Date {
  return subDaysJst(endDate, 14);
}

/**
 * 指定日時がJSTの営業時間内かチェック（9:00-18:00）
 */
export function isBusinessHours(date: Date | string = new Date()): boolean {
  const jstDate = typeof date === 'string' ? parseISO(date) : date;
  const hour = jstDate.getHours();
  return hour >= 9 && hour < 18;
}

/**
 * 次の営業開始時刻（9:00）を取得
 */
export function getNextBusinessStart(date: Date | string = new Date()): Date {
  const jstDate = typeof date === 'string' ? parseISO(date) : date;
  const nextDay = addDaysJst(jstDate, 1);
  nextDay.setHours(9, 0, 0, 0);
  return nextDay;
}

/**
 * 媒介報告の頻度に基づいて次回報告日を計算
 */
export function getNextReportDate(
  lastReportDate: Date | string,
  brokerageType: 'exclusive_right' | 'exclusive' | 'general'
): Date | null {
  if (brokerageType === 'general') return null; // 一般は報告不要
  
  const lastReport = typeof lastReportDate === 'string' ? parseISO(lastReportDate) : lastReportDate;
  
  if (brokerageType === 'exclusive_right') {
    // 専属専任：週1回
    return addDaysJst(lastReport, 7);
  } else {
    // 専任：2週に1回
    return addDaysJst(lastReport, 14);
  }
}

/**
 * 媒介報告が必要かチェック
 */
export function isReportRequired(
  lastReportDate: Date | string,
  brokerageType: 'exclusive_right' | 'exclusive' | 'general',
  currentDate: Date | string = new Date()
): boolean {
  if (brokerageType === 'general') return false;
  
  const nextReportDate = getNextReportDate(lastReportDate, brokerageType);
  if (!nextReportDate) return false;
  
  const current = typeof currentDate === 'string' ? parseISO(currentDate) : currentDate;
  return current >= nextReportDate;
}

/**
 * 媒介期限が14日以内かチェック
 */
export function isBrokerageExpiringSoon(
  endDate: Date | string,
  currentDate: Date | string = new Date()
): boolean {
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const current = typeof currentDate === 'string' ? parseISO(currentDate) : currentDate;
  const reminderDate = getBrokerageReminderDate(end);
  
  return current >= reminderDate;
}

/**
 * 媒介期限が過ぎているかチェック
 */
export function isBrokerageExpired(
  endDate: Date | string,
  currentDate: Date | string = new Date()
): boolean {
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const current = typeof currentDate === 'string' ? parseISO(currentDate) : currentDate;
  
  return current > end;
}

/**
 * 日付の差分を日数で取得
 */
export function getDaysDifference(
  date1: Date | string,
  date2: Date | string = new Date()
): number {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 日付が今日かチェック
 */
export function isToday(date: Date | string): boolean {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  const today = todayJst();
  
  return formatJstDate(targetDate) === formatJstDate(today);
}

/**
 * 日付が今週かチェック
 */
export function isThisWeek(date: Date | string): boolean {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  const today = todayJst();
  const weekStart = subDaysJst(today, today.getDay()); // 日曜日
  const weekEnd = addDaysJst(weekStart, 6); // 土曜日
  
  return targetDate >= weekStart && targetDate <= weekEnd;
}

/**
 * 日付が今月かチェック
 */
export function isThisMonth(date: Date | string): boolean {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  const today = todayJst();
  
  return targetDate.getFullYear() === today.getFullYear() &&
         targetDate.getMonth() === today.getMonth();
}
