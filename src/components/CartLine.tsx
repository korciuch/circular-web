import { formatMinor } from "@/lib/money";
import { lineTotal } from "@/lib/cart";
import type { CartItem } from "@/lib/types";
import type { CurrencyCode } from "@/lib/money";

export interface CartLineProps {
  item: CartItem;
  currency: CurrencyCode;
}

export function CartLine({ item, currency }: CartLineProps): React.JSX.Element {
  return (
    <li className="flex items-baseline justify-between gap-4 py-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900">{item.name}</span>
        <span className="text-xs text-slate-500">
          {item.quantity} x {formatMinor(item.unitAmount, currency)}
        </span>
      </div>
      <span className="text-sm tabular-nums text-slate-900">
        {formatMinor(lineTotal(item.unitAmount, item.quantity), currency)}
      </span>
    </li>
  );
}
