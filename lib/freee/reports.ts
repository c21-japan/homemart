import { getAccessToken } from './client'

const API_BASE = 'https://api.freee.co.jp'

type QueryParams = Record<string, string>

type TrialResponse = {
  company_id?: number
  start_date?: string
  end_date?: string
  trial_pl?: { balances?: TrialBalanceItem[]; up_to_date?: boolean }
  trial_bs?: { balances?: TrialBalanceItem[]; up_to_date?: boolean }
}

type TrialBalanceItem = {
  account_category_name?: string
  account_item_name?: string
  hierarchy_level?: number
  closing_balance?: number
  total_line?: boolean
  parent_account_category_name?: string | null
}

function getCompanyId() {
  const raw =
    process.env.FREEE_COMPANY_ID ||
    process.env.FREEE_OFFICE_NUMBER ||
    process.env.FREEE_BUSINESS_ID ||
    '751-520-6912'

  const normalized = String(raw).trim().replace(/[^0-9]/g, '')
  return normalized || String(raw)
}

async function fetchReport(path: string, params: QueryParams) {
  const token = await getAccessToken()
  const url = new URL(`${API_BASE}${path}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`freee APIエラー: ${response.status} ${detail}`)
  }

  return (await response.json()) as TrialResponse
}

export async function fetchTrialBS(startDate: string, endDate: string) {
  const companyId = getCompanyId()
  return await fetchReport('/api/1/reports/trial_bs', {
    company_id: companyId,
    start_date: startDate,
    end_date: endDate
  })
}

export async function fetchTrialPL(startDate: string, endDate: string) {
  const companyId = getCompanyId()
  return await fetchReport('/api/1/reports/trial_pl', {
    company_id: companyId,
    start_date: startDate,
    end_date: endDate
  })
}

export type { TrialBalanceItem, TrialResponse }
