/**
 * Money handling for the checkout app.
 *
 * Every amount in this codebase is an integer count of a currency's minor units,
 * so 19.99 USD is 1999. Nothing here returns a float, and nothing here accepts
 * one: a fractional input is a bug in the caller and is rejected rather than
 * rounded away quietly.
 */

/** An integer count of minor units. Never a float, never a formatted string. */
export type MinorUnits = number;

export type CurrencyCode = "USD" | "EUR" | "GBP";

const FRACTION_DIGITS: Record<CurrencyCode, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
};

export type Rounding = "half-up" | "floor" | "ceil";

function assertMinorUnits(value: number, label: string): void {
  if (!Number.isInteger(value)) {
    throw new TypeError(`${label} must be an integer number of minor units, received ${value}`);
  }
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${label} is outside the safe integer range`);
  }
}

/** Builds minor units from a whole major unit amount, for example 25 dollars. */
export function fromMajor(major: number, currency: CurrencyCode = "USD"): MinorUnits {
  assertMinorUnits(major, "major amount");
  return major * 10 ** FRACTION_DIGITS[currency];
}

export function addMinor(...amounts: readonly MinorUnits[]): MinorUnits {
  let total = 0;
  for (const amount of amounts) {
    assertMinorUnits(amount, "amount");
    total += amount;
  }
  return total;
}

export function subtractMinor(from: MinorUnits, amount: MinorUnits): MinorUnits {
  assertMinorUnits(from, "amount");
  assertMinorUnits(amount, "amount");
  return from - amount;
}

export function multiplyMinor(amount: MinorUnits, quantity: number): MinorUnits {
  assertMinorUnits(amount, "amount");
  assertMinorUnits(quantity, "quantity");
  return amount * quantity;
}

/**
 * Applies a percentage to an amount, for example a 15 percent tip or a 2.9
 * percent processing fee.
 *
 * The percentage is expressed in basis points so the caller never hands us a
 * float: 1500 basis points is 15 percent. Rounding is an explicit decision,
 * because a tip rounds differently from a fee.
 */
export function percentOfMinor(
  amount: MinorUnits,
  basisPoints: number,
  rounding: Rounding = "half-up",
): MinorUnits {
  assertMinorUnits(amount, "amount");
  assertMinorUnits(basisPoints, "basis points");

  const scaled = amount * basisPoints;

  switch (rounding) {
    case "floor":
      return Math.floor(scaled / 10_000);
    case "ceil":
      return Math.ceil(scaled / 10_000);
    case "half-up":
      return Math.round(scaled / 10_000);
  }
}

/** Formats minor units for display. The only place a decimal point appears. */
export function formatMinor(amount: MinorUnits, currency: CurrencyCode = "USD"): string {
  assertMinorUnits(amount, "amount");

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: FRACTION_DIGITS[currency],
  }).format(amount / 10 ** FRACTION_DIGITS[currency]);
}
