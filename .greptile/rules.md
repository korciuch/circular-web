# Circular web conventions

Review context for Circular's checkout app.

## Amounts are integers

Every amount in this codebase is an integer count of minor units, carried as the
`MinorUnits` type from `src/lib/money.ts`. Floating point arithmetic on money is a
defect even when the displayed total looks right, because the error compounds once
a tip or fee percentage is involved and the front end total then disagrees with
what the payments service captured.

Specific patterns that are wrong here: `parseFloat` on a price, arithmetic on
dollar amounts, `toFixed(2)` used to produce a total rather than to format one
already computed in minor units, and passing a formatted string where a
`MinorUnits` value is expected. Tips and fees go through `percentOfMinor`, which
takes an explicit rounding decision.

## One way out to the network

`src/lib/apiClient.ts` is the single egress point to the backend. It attaches the
bearer token and the headers the payments service expects, and it maps failures
into a typed result the UI can render.

A direct `fetch` from a component or a page bypasses all of that. The request goes
out unauthenticated and without the headers the backend requires, and the failure
mode is a rejected or duplicated payment rather than a clean error. Treat a new
`fetch` call outside `apiClient.ts` as a defect.

## The payments contract

The backend that serves `POST /payments` lives in the `circular-payments`
repository. That endpoint requires an `Idempotency-Key` header and uses it to
dedupe retries, so `apiClient` generates one key per payment attempt and reuses it
across retries of that attempt. Removing, renaming or regenerating that header
changes behaviour on the server: a missing key is rejected, and a key that changes
on retry allows the same payment to be captured twice.

Treat the headers `apiClient` sends to the payments service as a contract with that
repository rather than as local implementation detail.

## TypeScript

Strict mode, no `any`, no non null assertions on network data. Narrow `unknown`
before use. Exported functions declare their return types.

## Components

Presentational components take props and render. Fetching happens in pages or
actions. Tailwind utilities only. Real interactive elements with accessible labels.
