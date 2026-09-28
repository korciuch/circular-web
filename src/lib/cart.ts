import { addMinor, multiplyMinor, percentOfMinor } from "@/lib/money";
import type { Cart, CartTotals } from "@/lib/types";

/** Sales tax in basis points. 825 is 8.25 percent. */
const TAX_BASIS_POINTS = 825;

export function lineTotal(unitAmount: number, quantity: number): number {
  return multiplyMinor(unitAmount, quantity);
}

export function subtotal(cart: Cart): number {
  return addMinor(...cart.items.map((item) => lineTotal(item.unitAmount, item.quantity)));
}

/**
 * Totals a cart in minor units.
 *
 * Tax rounds half up on the subtotal rather than per line, which is what the
 * ledger expects.
 */
export function totals(cart: Cart): CartTotals {
  const sub = subtotal(cart);
  const tax = percentOfMinor(sub, TAX_BASIS_POINTS, "half-up");

  return {
    subtotal: sub,
    tax,
    total: addMinor(sub, tax),
  };
}

export function itemCount(cart: Cart): number {
  return cart.items.reduce((count, item) => count + item.quantity, 0);
}
