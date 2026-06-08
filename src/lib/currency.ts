export function formatPrice(cents: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatPriceRange(centsList: number[], currency = "USD", locale = "en-US"): string {
  if (centsList.length === 0) return "";
  const min = Math.min(...centsList);
  const max = Math.max(...centsList);
  if (min === max) return formatPrice(min, currency, locale);
  return `from ${formatPrice(min, currency, locale)}`;
}
