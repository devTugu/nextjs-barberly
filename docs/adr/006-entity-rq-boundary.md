# ADR 006: React Query hooks leave entities

## Status

Accepted

## Context

Entities held ~30 React Query modules (`'use client'`). That couples the domain
layer to the UI framework and blocks Clean Architecture scoring on money flows.

## Decision

1. **New** React Query hooks live in `features/*` (or `widgets/*`), not `entities/*`.
2. Entities expose framework-free API functions, types, keys, and use-cases.
3. Booking money path is the reference: payment/OTP/settlement use-cases + feature
   flow hooks (`useDepositPaymentFlow`, `useBalancePaymentFlow`).
4. Remaining entity RQ modules migrate incrementally; do not add new ones.

## Consequences

- Features own cache invalidation and toast/router adapters via ports.
- Entities stay unit-testable without React.
