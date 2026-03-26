# FinPlan Current Functionality

Last audited against the implementation on 2026-03-26.

## Scope

FinPlan is an authenticated Angular + Firebase application for tracking progress toward a house purchase. The current product centers on:

- a house-purchase target in USD
- operation-driven source balances
- manually maintained currency holdings and FX rates
- expected borrowed funds
- English/Ukrainian UI

This document describes what is implemented now, not planned behavior.

## Tech Stack

- Angular 21 standalone components
- TypeScript
- AngularFire + Firebase Auth + Firestore
- Angular Material form controls
- Chart.js via `ng2-charts`
- Vitest for unit tests

## Routes

Public routes:

- `/auth/login`
- `/auth/register`

Authenticated routes inside the shell:

- `/dashboard`
- `/sources`
- `/expected-funds`
- `/activities`
- `/currency`

Compatibility redirects:

- `/exchange-ops` -> `/activities`
- `/goals` -> `/dashboard`

## Authentication

Implemented:

- Google sign-in
- email/password sign-in
- email/password registration
- auth-guarded shell routes
- redirect away from auth screens when already signed in
- sign out
- Firebase error mapping for common auth failures

Not implemented:

- password reset flow
- profile management

## Shell

The authenticated shell currently provides:

- left sidebar navigation for Dashboard, Sources, Expected Funds, and Activities
- live FX summary panel
- manual FX refresh action
- English/Ukrainian locale switcher
- sign-out action

FX refresh loads rates from `https://open.er-api.com/v6/latest/USD` and stores them in Firestore under `currency/{uid}`.

## Implemented Features

### Dashboard

The `/dashboard` route is backed by the goals feature.

Implemented behavior:

- create and update a single goal
- store `targetAmount` and `alreadyPaidAmount` in `goals/{uid}`
- compute remaining amount and progress percentage
- show projected growth chart and milestone list
- include expected funds in total progress

Important implementation detail:

- dashboard "current savings" is calculated from operation-derived source balances, not from the manual currency holdings page

### Sources

The `/sources` page is a read-only breakdown of four fixed sources:

- `cashUsd`
- `cardUsd`
- `cardUah`
- `cashUah`

Implemented behavior:

- show per-source balances
- normalize UAH balances to USD using the current stored FX rate
- show source composition chart
- show summary insights such as total own savings and UAH exposure

Important implementation detail:

- source balances shown in the UI are derived from the operations history
- the current UI does not provide direct source-balance editing

### Expected Funds

The `/expected-funds` page supports CRUD for expected borrowed funds.

Implemented behavior:

- add, edit, and delete entries
- fields: source, description, original currency, original amount, ETA, status
- supported currencies: USD, EUR, UAH
- supported statuses: `planned`, `confirmed`
- convert each entry to USD using the current stored FX rates
- show total expected amount, confirmed amount, and support coverage

Stored in Firestore:

- `expectedFunds/{uid}` as an array document

Not implemented:

- `received` status

### Activities

The `/activities` page is an activity log plus record-management UI.

Implemented behavior:

- list saved activity records
- filter by month
- filter by type
- create, edit, and delete `income` records
- create, edit, and delete `transfer` records
- render confirmed expected funds as additional timeline entries

Important implementation detail:

- the domain model and helper layer still support `exchange` operations
- the current page UI exposes only `income` and `transfer` in the form controls

Stored in Firestore:

- `operations/{uid}` as an array document

### Currency Tracker

The `/currency` page is separate from the sources/activity flow.

Implemented behavior:

- edit holdings for UAH, USD, and EUR
- split each currency into `cash` and `card`
- store holdings in `currency/{uid}`
- display current totals in UAH, USD, and EUR
- show portfolio-distribution doughnut chart
- provide a local currency converter using the stored FX rates
- auto-fetch live rates once per signed-in session
- allow manual rate refresh

Important implementation detail:

- this feature uses its own `currency/{uid}` document
- these holdings are not the source of truth for dashboard own-savings calculations

## Internationalization

Implemented:

- English and Ukrainian translation dictionaries
- route titles translated through the i18n service
- locale persisted in local storage
- locale synced to Firestore user preferences when authenticated

Stored in Firestore:

- `users/{uid}/preferences/ui`

## Persistence Model

Current collections/documents used by the app:

- `goals/{uid}`
- `currency/{uid}`
- `expectedFunds/{uid}`
- `operations/{uid}`
- `users/{uid}/preferences/ui`

Security rules are user-scoped and require authentication for these data areas. The rules file also contains paths for `sources/{uid}`, but the current UI derives source balances from operations instead of reading that document.

## Tests Present

The repository currently contains unit tests for:

- auth service
- auth guard
- goal facade/service/helpers
- currency facade/service/helpers/formatting helpers
- expected-funds helpers
- operation helpers
- source service/helpers

## Known Gaps Between Older Docs and Current Code

The removed docs described behavior that is not the current implementation. The main mismatches were:

- planned design-system and UI-governance rules that are not the active source of truth
- roadmap and task-tracker files for already-shipped or changed work
- refactor notes that no longer match the current file structure
- expected-funds statuses that included `received`, while code supports only `planned` and `confirmed`
- activity/exchange documentation that implied a full exchange UI, while the current form exposes only income and transfer
- source-management documentation that implied direct editing, while current source balances are derived from operations
