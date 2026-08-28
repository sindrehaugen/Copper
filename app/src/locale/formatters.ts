export function formatCurrency(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale).format(date);
}

export function getComplianceRegion(locale: string): string {
  if (locale.includes('US')) return 'US';
  if (locale.includes('EU') || locale.includes('FR') || locale.includes('DE')) return 'EU';
  return 'GLOBAL';
}
