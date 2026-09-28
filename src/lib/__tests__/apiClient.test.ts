import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ACTOR_HEADER,
  IDEMPOTENCY_KEY_HEADER,
  createPayment,
  getPayment,
  newIdempotencyKey,
} from "@/lib/apiClient";
import type { PaymentRequest } from "@/lib/types";

const payment: PaymentRequest = {
  accountId: "acct_4242",
  amountMinorUnits: 51_902,
  currency: "USD",
  instrumentToken: "tok_test_checkout",
  instrumentLast4: "4242",
};

const context = {
  authToken: "session-token",
  actor: "customer@example.com",
};

function stubFetch(status: number, body: unknown): ReturnType<typeof vi.fn> {
  const stub = vi.fn(async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", stub);
  return stub;
}

function headersOf(stub: ReturnType<typeof vi.fn>): Headers {
  const init = stub.mock.calls[0]?.[1] as RequestInit | undefined;
  if (init === undefined) {
    throw new Error("fetch was not called");
  }
  return init.headers as Headers;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiClient", () => {
  it("sends an idempotency key on POST /payments", async () => {
    const stub = stubFetch(201, { paymentId: "pay_1", status: "CAPTURED", amountMinorUnits: 51_902, currency: "USD" });

    await createPayment(payment, context);

    const headers = headersOf(stub);
    expect(headers.get(IDEMPOTENCY_KEY_HEADER)).toBeTruthy();
    expect(headers.get(ACTOR_HEADER)).toBe("customer@example.com");
    expect(headers.get("Authorization")).toBe("Bearer session-token");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("reuses the caller's idempotency key so a retry does not charge twice", async () => {
    const key = newIdempotencyKey();
    const stub = stubFetch(201, { paymentId: "pay_1", status: "CAPTURED", amountMinorUnits: 51_902, currency: "USD" });

    await createPayment(payment, { ...context, idempotencyKey: key });
    await createPayment(payment, { ...context, idempotencyKey: key });

    const first = (stub.mock.calls[0]?.[1] as RequestInit).headers as Headers;
    const second = (stub.mock.calls[1]?.[1] as RequestInit).headers as Headers;
    expect(first.get(IDEMPOTENCY_KEY_HEADER)).toBe(key);
    expect(second.get(IDEMPOTENCY_KEY_HEADER)).toBe(key);
  });

  it("generates a distinct key per attempt when the caller does not supply one", async () => {
    const stub = stubFetch(201, { paymentId: "pay_1", status: "CAPTURED", amountMinorUnits: 51_902, currency: "USD" });

    await createPayment(payment, context);
    await createPayment(payment, context);

    const first = (stub.mock.calls[0]?.[1] as RequestInit).headers as Headers;
    const second = (stub.mock.calls[1]?.[1] as RequestInit).headers as Headers;
    expect(first.get(IDEMPOTENCY_KEY_HEADER)).not.toBe(second.get(IDEMPOTENCY_KEY_HEADER));
  });

  it("does not send an idempotency key on reads", async () => {
    const stub = stubFetch(200, { paymentId: "pay_1", status: "CAPTURED", amountMinorUnits: 51_902, currency: "USD" });

    await getPayment("pay_1", context);

    expect(headersOf(stub).get(IDEMPOTENCY_KEY_HEADER)).toBeNull();
  });

  it("returns a typed failure for an error response", async () => {
    stubFetch(400, { code: "idempotency_key_required", message: "Idempotency-Key must not be blank" });

    const result = await createPayment(payment, context);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error.code).toBe("idempotency_key_required");
    }
  });

  it("returns a typed failure when the network throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("connection reset");
      }),
    );

    const result = await createPayment(payment, context);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("network_error");
      expect(result.error.message).toBe("connection reset");
    }
  });
});
