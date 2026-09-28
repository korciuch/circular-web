import type { CurrencyCode, MinorUnits } from "@/lib/money";

export interface CartItem {
  sku: string;
  name: string;
  unitAmount: MinorUnits;
  quantity: number;
}

export interface Cart {
  items: readonly CartItem[];
  currency: CurrencyCode;
}

export interface CartTotals {
  subtotal: MinorUnits;
  tax: MinorUnits;
  total: MinorUnits;
}

export interface PaymentRequest {
  accountId: string;
  amountMinorUnits: MinorUnits;
  currency: CurrencyCode;
  instrumentToken: string;
  instrumentLast4: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: "CAPTURED" | "REFUNDED" | "PARTIALLY_REFUNDED" | "FAILED";
  amountMinorUnits: MinorUnits;
  currency: CurrencyCode;
}

export interface ApiError {
  code: string;
  message: string;
}

/** Every apiClient call returns this, so callers cannot ignore a failure. */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError; status: number };
