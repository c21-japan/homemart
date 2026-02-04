type TrialBalanceEntry = Record<string, string | number | null>

type SummaryLine = {
  label: string
  value: number
}

type Summary = {
  highlights: SummaryLine[]
  categories: SummaryLine[]
}

type ParsedSummary = {
  pl: Summary
  bs: Summary
}

/**
 * 試算表CSVデータからPL/BSサマリーを生成
 */
export function parseTrialBalanceSummary(
  trialBalanceData: TrialBalanceEntry[]
): ParsedSummary {
  if (!trialBalanceData || trialBalanceData.length === 0) {
    return {
      pl: { highlights: [], categories: [] },
      bs: { highlights: [], categories: [] }
    }
  }

  const plCategories: SummaryLine[] = []
  const bsCategories: SummaryLine[] = []

  // 収益・費用・資産・負債・純資産の合計
  let totalRevenue = 0
  let totalExpense = 0
  let totalAssets = 0
  let totalLiabilities = 0
  let totalEquity = 0

  trialBalanceData.forEach((entry) => {
    // カラム名のバリエーションに対応
    const categoryName =
      entry['勘定科目カテゴリー'] ||
      entry['勘定科目'] ||
      entry['account_category_name'] ||
      entry['科目名'] ||
      ''

    const balance =
      Number(entry['残高'] || entry['balance'] || entry['closing_balance'] || 0)

    const categoryStr = String(categoryName)

    // 収益科目（売上、営業外収益など）
    if (
      categoryStr.includes('売上') ||
      categoryStr.includes('収益') ||
      categoryStr.includes('受取')
    ) {
      totalRevenue += balance
      plCategories.push({ label: categoryStr, value: balance })
    }
    // 費用科目（売上原価、販管費など）
    else if (
      categoryStr.includes('原価') ||
      categoryStr.includes('費用') ||
      categoryStr.includes('経費') ||
      categoryStr.includes('支払') ||
      categoryStr.includes('給与') ||
      categoryStr.includes('地代家賃') ||
      categoryStr.includes('減価償却')
    ) {
      totalExpense += balance
      plCategories.push({ label: categoryStr, value: balance })
    }
    // 資産科目
    else if (
      categoryStr.includes('資産') ||
      categoryStr.includes('現金') ||
      categoryStr.includes('預金') ||
      categoryStr.includes('売掛金') ||
      categoryStr.includes('棚卸') ||
      categoryStr.includes('在庫') ||
      categoryStr.includes('建物') ||
      categoryStr.includes('土地') ||
      categoryStr.includes('機械')
    ) {
      totalAssets += balance
      bsCategories.push({ label: categoryStr, value: balance })
    }
    // 負債科目
    else if (
      categoryStr.includes('負債') ||
      categoryStr.includes('買掛金') ||
      categoryStr.includes('借入金') ||
      categoryStr.includes('未払') ||
      categoryStr.includes('預り金')
    ) {
      totalLiabilities += balance
      bsCategories.push({ label: categoryStr, value: balance })
    }
    // 純資産科目
    else if (
      categoryStr.includes('資本') ||
      categoryStr.includes('純資産') ||
      categoryStr.includes('利益剰余金')
    ) {
      totalEquity += balance
      bsCategories.push({ label: categoryStr, value: balance })
    }
  })

  const netProfit = totalRevenue - totalExpense

  return {
    pl: {
      highlights: [
        { label: '売上高', value: totalRevenue },
        { label: '費用合計', value: totalExpense },
        { label: '当期純利益', value: netProfit }
      ],
      categories: plCategories.filter((c) => Math.abs(c.value) > 0)
    },
    bs: {
      highlights: [
        { label: '資産合計', value: totalAssets },
        { label: '負債合計', value: totalLiabilities },
        { label: '純資産合計', value: totalEquity },
        { label: '自己資本比率', value: totalAssets ? (totalEquity / totalAssets) * 100 : 0 }
      ],
      categories: bsCategories.filter((c) => Math.abs(c.value) > 0)
    }
  }
}

/**
 * 仕訳帳CSVデータから月次データを生成
 */
export function parseMonthlyData(journalData: TrialBalanceEntry[]) {
  if (!journalData || journalData.length === 0) return []

  const dataByMonth: Record<string, { income: number; expense: number }> = {}

  journalData.forEach((entry) => {
    const dateField = entry['取引日'] || entry['日付'] || entry['date'] || entry['Date']
    const amountField = entry['金額'] || entry['amount'] || entry['Amount'] || entry['借方金額'] || entry['貸方金額']
    const categoryField = entry['勘定科目'] || entry['account'] || entry['Account'] || entry['科目名']

    if (!dateField || !amountField) return

    try {
      const date = new Date(String(dateField))
      if (isNaN(date.getTime())) return

      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const amount = Math.abs(Number(amountField) || 0)

      if (!dataByMonth[month]) {
        dataByMonth[month] = { income: 0, expense: 0 }
      }

      const category = String(categoryField || '')

      // カテゴリで収益/費用を判定
      if (
        category.includes('売上') ||
        category.includes('収益') ||
        category.includes('受取')
      ) {
        dataByMonth[month].income += amount
      } else if (
        category.includes('費用') ||
        category.includes('原価') ||
        category.includes('経費') ||
        category.includes('支払') ||
        category.includes('給与')
      ) {
        dataByMonth[month].expense += amount
      }
    } catch (err) {
      // エラーは無視
    }
  })

  return Object.entries(dataByMonth)
    .map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      profit: data.income - data.expense
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}
