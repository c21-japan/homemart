function getJstParts(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  const parts = formatter.formatToParts(date)
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day)
  }
}

export function formatJstDate(date: Date) {
  const parts = getJstParts(date)
  const month = String(parts.month).padStart(2, '0')
  const day = String(parts.day).padStart(2, '0')
  return `${parts.year}-${month}-${day}`
}

export function getFiscalRange(asOf: Date) {
  const parts = getJstParts(asOf)
  const fiscalYear = parts.month >= 5 ? parts.year : parts.year - 1
  const startDate = `${fiscalYear}-05-01`
  const endDate = formatJstDate(asOf)
  return { startDate, endDate }
}
