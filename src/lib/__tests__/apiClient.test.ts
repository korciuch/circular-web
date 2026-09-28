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
  it("sends auth and tracing headers on POST /payments", async () => {
    const stub = stubFetch(201, { paymentId: "pay_1", status: "CAPTURED", amountMinorUnits: 51_902, currency: "USD" });

    await createPayment(payment, context);

    const headers = headersOf(stub);
    expect(headers.get(ACTOR_HEADER)).toBe("customer@example.com");
    expect(headers.get("Authorization")).toBe("Bearer session-token");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Accept")).toBe("application/json");
  });

  it("does not set a JSON content type on reads", async () => {
    const stub = stubFetch(200, { paymentId: "pay_1", status: "CAPTURED", amountMinorUnits: 51_902, currency: "USD" });

    await getPayment("pay_1", context);

    expect(headersOf(stub).get("Content-Type")).toBeNull();
    expect(headersOf(stub).get("Authorization")).toBe("Bearer session-token");
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
