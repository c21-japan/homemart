/**
 * 数値を日本円形式でフォーマット
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * 数値を千円単位でフォーマット
 */
export function formatCurrencyK(amount: number): string {
  if (amount >= 10000) {
    return `${Math.round(amount / 1000)}千円`
  }
  return formatCurrency(amount)
}

/**
 * 数値を万円単位でフォーマット
 */
export function formatCurrencyM(amount: number): string {
  if (amount >= 100000000) {
    return `${Math.round(amount / 10000000) / 10}億円`
  } else if (amount >= 10000) {
    return `${Math.round(amount / 10000)}万円`
  }
  return formatCurrency(amount)
}

/**
 * 日付を日本語形式でフォーマット
 */
export function formatDateJP(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * 日付を短縮形式でフォーマット
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric'
  })
}

/**
 * 日時を日本語形式でフォーマット
 */
export function formatDateTimeJP(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * パーセンテージをフォーマット
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%'
  const percentage = Math.round((value / total) * 100)
  return `${percentage}%`
}

/**
 * ファイルサイズを人間が読みやすい形式でフォーマット
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
