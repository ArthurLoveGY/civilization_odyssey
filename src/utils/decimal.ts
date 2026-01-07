import Decimal from 'decimal.js';

// Configure decimal.js for the game
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_DOWN,
  toExpNeg: -9,
  toExpPos: 9,
});

/**
 * Safely convert a value to Decimal
 */
export function toDecimal(value: string | number | Decimal): Decimal {
  if (value instanceof Decimal) {
    return value;
  }
  return new Decimal(value);
}

/**
 * Convert Decimal to string for display
 */
export function decimalToString(decimal: Decimal, decimals = 2): string {
  return decimal.toFixed(decimals);
}

/**
 * Format a large number with commas (e.g., 1,234.56)
 */
export function formatNumber(decimal: Decimal, decimals = 2): string {
  const str = decimal.toFixed(decimals);
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/**
 * Format a number for display with optional suffixes for large numbers
 */
export function formatCompact(decimal: Decimal): string {
  const abs = decimal.abs();

  if (abs.greaterThanOrEqualTo(1e9)) {
    return decimal.dividedBy(1e9).toFixed(2) + 'B';
  }
  if (abs.greaterThanOrEqualTo(1e6)) {
    return decimal.dividedBy(1e6).toFixed(2) + 'M';
  }
  if (abs.greaterThanOrEqualTo(1e3)) {
    return decimal.dividedBy(1e3).toFixed(2) + 'K';
  }

  return decimal.toFixed(2);
}

/**
 * Clamp a Decimal between min and max
 */
export function clampDecimal(value: Decimal, min: Decimal, max: Decimal): Decimal {
  return Decimal.max(min, Decimal.min(max, value));
}

/**
 * Get the percentage of a value relative to a total
 */
export function getPercentage(value: Decimal, total: Decimal): Decimal {
  if (total.isZero()) {
    return new Decimal(0);
  }
  return value.dividedBy(total).times(100);
}
