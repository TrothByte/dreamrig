const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

export function formatPrice(value: number): string {
  return priceFormatter.format(value)
}

export function discountPercent(price: number, marketPrice: number): number {
  if (marketPrice <= price || marketPrice <= 0) {
    return 0
  }
  return Math.round(((marketPrice - price) / marketPrice) * 100)
}
