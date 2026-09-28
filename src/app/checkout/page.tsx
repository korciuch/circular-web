"use client";

import { useState } from "react";
import { CheckoutSummary } from "@/components/CheckoutSummary";
import { PayButton } from "@/components/PayButton";
import { TipSelector } from "@/components/TipSelector";
import { totals } from "@/lib/cart";
import type { Cart } from "@/lib/types";

const DEMO_CART: Cart = {
  currency: "USD",
  items: [
    { sku: "desk-01", name: "Standing desk", unitAmount: 44900, quantity: 1 },
    { sku: "mat-04", name: "Anti fatigue mat", unitAmount: 6500, quantity: 2 },
  ],
};

const SERVICE_FEE_RATE = 0.029;

const PAYMENTS_API_URL = process.env.NEXT_PUBLIC_PAYMENTS_API_URL ?? "http://localhost:8080";

type Status = { state: "idle" } | { state: "paying" } | { state: "paid"; paymentId: string } | { state: "failed"; message: string };

export default function CheckoutPage(): React.JSX.Element {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [tip, setTip] = useState(0);
  const cartTotals = totals(DEMO_CART);

  const serviceFee = parseFloat(((cartTotals.total / 100) * SERVICE_FEE_RATE).toFixed(2));
  const amountDue = parseFloat((cartTotals.total / 100 + tip + serviceFee).toFixed(2));

  async function pay(): Promise<void> {
    setStatus({ state: "paying" });

    const response = await fetch(`${PAYMENTS_API_URL}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId: "acct_4242",
        amountMinorUnits: Math.round(amountDue * 100),
        currency: DEMO_CART.currency,
        instrumentToken: "tok_demo_checkout",
        instrumentLast4: "4242",
      }),
    });

    if (!response.ok) {
      setStatus({ state: "failed", message: `Payment failed with status ${response.status}` });
      return;
    }

    const data = await response.json();
    setStatus({ state: "paid", paymentId: data.paymentId });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Checkout</h1>

      <CheckoutSummary cart={DEMO_CART} totals={cartTotals} />

      <TipSelector subtotal={cartTotals.subtotal} onTipChange={setTip} />

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600">Service fee</dt>
          <dd className="tabular-nums text-slate-900">${serviceFee.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between font-semibold">
          <dt className="text-slate-900">Amount due</dt>
          <dd className="tabular-nums text-slate-900">${amountDue.toFixed(2)}</dd>
        </div>
      </dl>

      <PayButton
        amount={Math.round(amountDue * 100)}
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
