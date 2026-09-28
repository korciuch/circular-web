import { CartLine } from "@/components/CartLine";
import { formatMinor } from "@/lib/money";
import type { Cart, CartTotals } from "@/lib/types";

export interface CheckoutSummaryProps {
  cart: Cart;
  totals: CartTotals;
}

export function CheckoutSummary({ cart, totals }: CheckoutSummaryProps): React.JSX.Element {
  return (
    <section aria-labelledby="order-summary" className="rounded-lg border border-slate-200 p-4">
      <h2 id="order-summary" className="text-base font-semibold text-slate-900">
        Order summary
      </h2>

      <ul className="divide-y divide-slate-100">
        {cart.items.map((item) => (
          <CartLine key={item.sku} item={item} currency={cart.currency} />
        ))}
      </ul>

      <dl className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600">Subtotal</dt>
          <dd className="tabular-nums text-slate-900">
            {formatMinor(totals.subtotal, cart.currency)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Tax</dt>
          <dd className="tabular-nums text-slate-900">{formatMinor(totals.tax, cart.currency)}</dd>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold">
          <dt className="text-slate-900">Total</dt>
          <dd className="tabular-nums text-slate-900">
            {formatMinor(totals.total, cart.currency)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
