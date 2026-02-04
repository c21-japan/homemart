import type { TrialBalanceItem } from './reports'

type SummaryLine = {
  label: string
  value: number
}

type Summary = {
  highlights: SummaryLine[]
  categories: SummaryLine[]
}

function normalizeNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') return Number(value)
  return 0
}

function pickFirstByNames(items: TrialBalanceItem[], names: string[]) {
  for (const name of names) {
    const match = items.find(
      (item) =>
        item.account_item_name === name || item.account_category_name === name
    )
    if (match) {
      return normalizeNumber(match.closing_balance)
    }
  }
  return null
}

function pickTopLevel(items: TrialBalanceItem[]) {
  const candidates = items.filter((item) => {
    if (item.hierarchy_level === 1) return true
    if (item.parent_account_category_name == null && item.hierarchy_level != null) return true
    return item.total_line === true
  })

  return candidates.map((item) => ({
    label: item.account_item_name || item.account_category_name || '未分類',
    value: normalizeNumber(item.closing_balance)
  }))
}

export function buildPlSummary(items: TrialBalanceItem[] = []): Summary {
  const highlights: SummaryLine[] = []

  const sales = pickFirstByNames(items, ['売上高', '売上', '営業収益'])
  if (sales != null) highlights.push({ label: '売上高', value: sales })

  const gross = pickFirstByNames(items, ['売上総利益', '粗利'])
  if (gross != null) highlights.push({ label: '売上総利益', value: gross })

  const operating = pickFirstByNames(items, ['営業利益', '営業損失'])
  if (operating != null) highlights.push({ label: '営業利益', value: operating })

  const ordinary = pickFirstByNames(items, ['経常利益', '経常損失'])
  if (ordinary != null) highlights.push({ label: '経常利益', value: ordinary })

  const net = pickFirstByNames(items, ['当期純利益', '当期純損失'])
  if (net != null) highlights.push({ label: '当期純利益', value: net })

  const categories = pickTopLevel(items)
  return { highlights, categories }
}

export function buildBsSummary(items: TrialBalanceItem[] = []): Summary {
  const highlights: SummaryLine[] = []

  const assets = pickFirstByNames(items, ['資産合計', '資産の部'])
  if (assets != null) highlights.push({ label: '資産合計', value: assets })

  const liabilities = pickFirstByNames(items, ['負債合計', '負債の部'])
  if (liabilities != null) highlights.push({ label: '負債合計', value: liabilities })

  const equity = pickFirstByNames(items, ['純資産合計', '純資産の部'])
  if (equity != null) highlights.push({ label: '純資産合計', value: equity })

  const categories = pickTopLevel(items)
  return { highlights, categories }
}

export type { Summary, SummaryLine }
