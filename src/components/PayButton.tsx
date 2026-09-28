import { formatMinor } from "@/lib/money";
import type { CurrencyCode, MinorUnits } from "@/lib/money";

export interface PayButtonProps {
  amount: MinorUnits;
  currency: CurrencyCode;
  disabled?: boolean;
  onPay: () => void;
}

export function PayButton({
  amount,
  currency,
  disabled = false,
  onPay,
}: PayButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onPay}
      disabled={disabled}
      aria-label={`Pay ${formatMinor(amount, currency)}`}
      className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300"
    >
      Pay {formatMinor(amount, currency)}
    </button>
  );
}
