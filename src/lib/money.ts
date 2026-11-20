/**
 * 7 Bites Cafe OS - Money & Currency Utilities
 * Key Rule: All currency calculations are performed in integer paise (1 INR = 100 paise)
 * to avoid floating point precision errors.
 */

export type Paise = number;

/**
 * Converts standard Rupee float/int to integer paise.
 */
export function toPaise(rupees: number): Paise {
  return Math.round(rupees * 100);
}

/**
 * Converts integer paise to Rupee float.
 */
export function toRupees(paise: Paise): number {
  return paise / 100;
}

/**
 * Formats paise into Indian Rupee display string (e.g., ₹249 or ₹249.50)
 */
export function formatRupees(paise: Paise, showDecimalsIfZero = false): string {
  const rupees = paise / 100;
  if (!showDecimalsIfZero && Number.isInteger(rupees)) {
    return `₹${rupees.toLocaleString("en-IN")}`;
  }
  return `₹${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Precise currency string for invoices and receipts (e.g., "₹ 249.00")
 */
export function formatInvoiceMoney(paise: Paise): string {
  return (paise / 100).toFixed(2);
}
