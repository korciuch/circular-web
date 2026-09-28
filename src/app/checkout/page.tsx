"use client";

import { useState } from "react";
import { CheckoutSummary } from "@/components/CheckoutSummary";
import { PayButton } from "@/components/PayButton";
import { createPayment, newIdempotencyKey } from "@/lib/apiClient";
import { totals } from "@/lib/cart";
import type { Cart } from "@/lib/types";

const DEMO_CART: Cart = {
  currency: "USD",
  items: [
    { sku: "desk-01", name: "Standing desk", unitAmount: 44900, quantity: 1 },
    { sku: "mat-04", name: "Anti fatigue mat", unitAmount: 6500, quantity: 2 },
  ],
};

type Status = { state: "idle" } | { state: "paying" } | { state: "paid"; paymentId: string } | { state: "failed"; message: string };

export default function CheckoutPage(): React.JSX.Element {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const cartTotals = totals(DEMO_CART);

  async function pay(): Promise<void> {
    setStatus({ state: "paying" });

    // One key for this attempt. A retry of the same attempt reuses it so the
    // payments service can dedupe rather than capture twice.
    const idempotencyKey = newIdempotencyKey();

    const result = await createPayment(
      {
        accountId: "acct_4242",
        amountMinorUnits: cartTotals.total,
        currency: DEMO_CART.currency,
        instrumentToken: "tok_demo_checkout",
        instrumentLast4: "4242",
      },
      {
        authToken: "demo-session-token",
        actor: "customer@example.com",
        idempotencyKey,
      },
    );

    if (result.ok) {
      setStatus({ state: "paid", paymentId: result.data.paymentId });
    } else {
      setStatus({ state: "failed", message: result.error.message });
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Checkout</h1>

      <CheckoutSummary cart={DEMO_CART} totals={cartTotals} />

      <PayButton
        amount={cartTotals.total}
        currency={DEMO_CART.currency}
        disabled={status.state === "paying" || status.state === "paid"}
        onPay={() => {
          void pay();
        }}
      />

      {status.state === "paid" ? (
        <p className="text-sm text-slate-600">Payment {status.paymentId} confirmed.</p>
      ) : null}

      {status.state === "failed" ? (
        <p className="text-sm text-red-700">We could not take that payment: {status.message}</p>
      ) : null}
    </div>
  );
}
