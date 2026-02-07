export function formatPrice(price: number): string {
  if (!Number.isFinite(price)) return '価格要相談'
  if (price >= 10000) {
    return `${(price / 10000).toLocaleString()}万円`
  }
  return `${price.toLocaleString()}万円`
}
