# circular-web

Circular's customer facing checkout, built with Next.js and TypeScript.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm test
```

The app talks to the Kotlin payments service from the `circular-payments`
repository. Point it at a local instance with:

```bash
NEXT_PUBLIC_PAYMENTS_API_URL=http://localhost:8080 npm run dev
```

## Layout

```
src/
  app/                 routes: home and the checkout flow
  components/          presentational components, props in and markup out
  lib/
    apiClient.ts       the only module that calls the backend
    money.ts           integer minor units, formatting, percentages
    cart.ts            cart totals
    types.ts           shared request and response shapes
```

## Two rules worth knowing before your first change

**Amounts are integers.** Every amount is a count of minor units, so 19.99 USD is
`1999`. `src/lib/money.ts` is the only module that converts to a display string.
Percentages such as tips and fees are expressed in basis points and go through
`percentOfMinor`, which takes an explicit rounding mode. Floating point dollars
drift, and the drift shows up as a mismatch between the total the customer agreed
to and the amount the payments service captured.

**All network calls go through `apiClient`.** It attaches the bearer token, a
request ID, the actor, and the `Idempotency-Key` that `POST /payments` requires.
The payments service rejects a capture request without that key and dedupes
retries that carry the same one, so the client generates one key per payment
attempt and reuses it across retries of that attempt. A direct `fetch` from a
component skips all of this.

See `.cursorrules` and `.greptile/rules.md` for the rest.
