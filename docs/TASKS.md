---

## `TASKS.md`

```md
# TASKS.md

## Purpose

This file is the step-by-step implementation tracker for the House Savings Dashboard.

The project must be built incrementally.
Do not attempt to generate the full app at once.

Each phase should:
- have a clear goal
- stay within defined scope
- produce production-quality code
- include unit tests where meaningful
- be reviewed before moving on

This file should be updated during implementation.

---

# Progress Rules

For every phase:

- mark it as `[ ]` before implementation
- change it to `[-]` when in progress
- change it to `[x]` only when fully complete
- add notes under the phase if needed
- do not mark a phase done if tests or architecture quality are missing

---

# Global Quality Gates

These conditions apply to every phase:

- authentication must remain required
- no insecure Firestore shortcuts
- Angular best practices must be followed
- code must stay feature-based and maintainable
- premium UI/UX quality must be preserved
- unit tests must be added for important logic
- business logic must not be embedded in components
- no large unstructured files
- no rushed “temporary” code that obviously becomes permanent

---

# Phase Plan

## [x] Phase 0 — Project Foundation

### Goal

Set up a clean, scalable, production-ready Angular + Firebase foundation.

### Scope

- initialize Angular project
- configure strict TypeScript
- configure routing
- create feature-based folder structure
- configure Firebase project connection
- configure Firebase Auth
- configure Firestore
- configure environments
- configure theming foundation
- configure testing baseline
- configure lint/format baseline
- prepare app shell skeleton

### Deliverables

- app runs locally ✓
- Firebase is connected ✓
- architecture skeleton exists ✓
- testing works ✓ (Vitest, 2/2 passing)
- theming foundation exists ✓

### Tests

- verify test runner setup ✓
- baseline sanity tests: app creates, router-outlet renders ✓

### Notes

- Angular 21.2.3 + @angular/fire 20.0.1 + firebase 11.10.0
- Vitest used as test runner (Angular 21 default)
- SCSS theming with CSS custom properties (dark premium palette)
- Firestore rules: deny-all default, user-scoped reads/writes only
- Environment files configured with fileReplacements for prod build
- ESLint configured with Angular + TypeScript strict rules
- Feature-based folder skeleton: core/, shared/, features/
- Phase completed: 2026-03-25

---

## [x] Phase 1 — Authentication

### Goal

Secure the app and create a premium access flow.

### Scope

- login screen
- Google sign-in
- email/password sign-in
- auth state handling
- logout
- protected routes
- redirect unauthenticated users
- premium auth UI

### Deliverables

- user can sign in with Google ✓
- user can sign in with email/password ✓
- route protection works ✓ (authGuard functional CanActivateFn)
- session is restored correctly ✓ (toSignal from authState stream)
- logout works ✓

### Tests

- auth service logic ✓ (8 tests: creation, currentUser signal, isAuthenticated computed, user/signout state transitions, observable returns)
- route guard behavior ✓ (2 tests: authenticated→true, unauthenticated→UrlTree redirect)

### Notes

- AuthService uses toSignal(authState()) for reactive session state
- Guard is functional CanActivateFn — no class-based guards
- LoginComponent: standalone, OnPush, ReactiveFormsModule, premium dark UI
- Auth routes are lazy-loaded (separate chunk)
- Protected shell route uses canActivate: [authGuard]
- Wildcard route redirects to /auth/login
- Firebase error codes mapped to user-friendly messages
- vi.hoisted() used for Vitest mock hoisting (no fakeAsync — Vitest has no Zone.js)
- Phase completed: 2026-03-25

---

## [x] Phase 2 — App Shell and Design Foundation

### Goal

Create the reusable visual and structural foundation of the product.

### Scope

- app shell
- main layout frame
- navigation structure
- page container conventions
- reusable card base
- summary card pattern
- typography hierarchy
- spacing system
- table shell
- loading state
- empty state
- error state

### Deliverables

- app already feels like a premium product shell ✓
- future screens can be built consistently ✓
- visual language is coherent ✓

### Tests

- only where meaningful for reusable behavior
- do not over-test purely visual components

### Notes

- focus on trust, hierarchy, and polish
- avoid default-looking admin-panel design
- ShellComponent: core/layout/shell/ — fixed left sidebar, app branding, stacked nav, bottom user/sign-out, main content area
- Shared UI primitives in shared/ui/: card, badge, skeleton, empty-state, error-state
- \_layout.scss: .page container class (max-width: 1200px, consistent padding)
- Shell is lazy-loaded as the protected route wrapper in app.routes.ts
- Badge class-mapping logic tested: 8 tests passing
- Phase completed: 2026-03-25

---

## [x] Phase 3 — Goal Setup

### Goal

Allow the user to define and manage the house target.

### Scope

- create goal
- edit goal
- define house target amount
- define USD as base analytics currency
- display current goal summary
- store and retrieve goal from Firestore

### Deliverables

- user can define target amount ✓
- goal persists correctly ✓
- summary displays reliably ✓ (target, 0% progress, remaining amount)

### Tests

- goal service/facade logic
- validation rules
- progress-related calculations introduced in this phase

### Notes

- Goal stored in Firestore at `goals/{uid}` (document keyed by user UID)
- GoalFacade: reactive signal state — undefined (loading) / null (no goal) / Goal (set)
- goal.helpers.ts: calcRemaining + calcProgressPercent pure functions — 11 tests
- GoalService: getGoal$ (docData stream mapped to Goal | null) + setGoal (setDoc merge) — 7 tests
- GoalPageComponent: create/edit/summary states, NonNullableFormBuilder, CurrencyPipe
- Shell nav updated with Dashboard + Goal links (RouterLinkActive)
- Total tests after phase: 38 passing
- Phase completed: 2026-03-25

---

## [x] Phase 4 — Currency Tracker

### Goal

Introduce a currency tracker with holdings, manual rates, and portfolio conversion.

### Scope

- support required currencies:
  - UAH
  - USD
  - EUR
- display exchange rate strip
- display currency summary cards
- store and load holdings and rates
- provide a live converter

### Deliverables

- user sees the tracked currencies ✓
- holdings and rates are understandable ✓
- currency states are persisted correctly ✓

### Tests

- conversion logic
- portfolio totals
- currency-related derived values

### Notes

- Currency tracker now refreshes live FX rates from a public API and persists the latest rates to Firestore.
- Rates auto-refresh once when the currency page opens for an authenticated user.
- Holdings editing uses a modal dialog to avoid layout jumps in the main page flow.
- Portfolio distribution now uses a chart package instead of a CSS-only custom visualization.
- Currency page spacing and card heights were normalized to match the product design system.
- **[Updated 2026-03-25]** `CurrencyHoldings` model refactored from flat totals to nested `{cash, card}` per currency (`CurrencyHoldingBalance`).
- Holdings dialog replaced with a 6-field grouped form (cash + card per each of UAH/USD/EUR) with live total preview per currency.
- Firestore service updated with backward-compatible read normalization: reads legacy flat `uah/usd/eur` fields and maps to `{cash, card}`; writes both new nested structure and flat aggregate totals (dual-write for continuity).
- `CurrencyFacade.totalFor(code)` method added; `updateHoldings` now accepts the full nested `CurrencyHoldings` object.
- `calcHoldingTotal(balance)` added to helpers; `calcPortfolioTotals`, `calcPortfolioShare` updated to work with nested model.
- Goal page reworked to be USD-first: `targetAmount` stored and displayed in USD; `savedAmountUsd` is derived directly from `totals().totalUsd` on the currency page — no manual entry needed.
- **Premium UI redesign** of holding cards: currency identity row (badge + name + code), share pill, hero section with total + cash/card composition rail, percentage detail tiles.
- **Premium UI redesign** of portfolio total block: eyebrow label + wallet icon, large hero amount at `clamp(2.5rem, 4vw, 4rem)`, frosted-glass FX chip tiles for USD/EUR with coloured left-border accents, ambient violet radial glow.
- All i18n keys for cash/card/total/dialog subtitle updated in both EN and UK locales.
- Tests fully updated for new model; build and all tests passing.

---

## [-] Cross-Cutting — Localization and UX Consistency

### Goal

Roll out bilingual UI support and remove visible CTA inconsistency across the product.

### Scope

- English and Ukrainian translations for all user-facing screens
- sidebar language switch in authenticated shell
- persist locale to Firestore user preferences
- maintain local fallback for language on startup
- align CTA icons across auth, goals, currency, and dashboard views
- update product documentation to reflect the new standards

### Deliverables

- authenticated users can switch locale from the sidebar
- locale persists across sessions and devices
- major user flows are translated in both locales
- CTA buttons and action links use consistent icon patterns

### Tests

- verify translated shell and primary flows render without template errors
- verify locale persistence does not break unauthenticated screens

### Notes

- currency tracker logic must stay explicit and easy to extend
- Manual rates are stored with holdings at currency/{uid}
- CurrencyService exposes merge updates for holdings and rates
- CurrencyFacade exposes signal state, totals, shares, and chart data
- CurrencyPageComponent follows the screenshot layout: rate strip, holding cards, total block, donut, and converter
- Sidebar navigation now links to Currency
- Firestore rules updated for currency/{userId}
- Tests added: currency.helpers.spec.ts + currency.service.spec.ts
- Validation: `npm run build` ✓, `npx ng test --watch=false` ✓ (84 tests passing)
- Phase completed: 2026-03-25
- **[Updated 2026-03-25]** Bilingual string coverage (EN + UK) added for currency cash/card/total labels, dialog subtitle, and goal-page USD-related copy.
- Locale switch (sidebar), Firestore persistence of locale preference, and local fallback still in progress.

---

## [ ] Phase 5 — Exchange Rates

### Goal

Automate the manual tracker rates with live rate refresh and freshness handling.

### Scope

- fetch current rates
- support USD / UAH / EUR
- replace manual rate-only flow with fetched live rates
- display rate freshness/status
- handle unavailable-rate scenarios safely

### Deliverables

- dashboard can normalize UAH and EUR values into USD from fetched rates
- conversions are understandable
- missing rate states are handled cleanly

### Tests

- conversion logic
- rate normalization logic
- unavailable/fallback handling

### Notes

- builds on the manual rates stored in Phase 4

---

## [ ] Phase 6 — Expected Borrowed Funds

### Goal

Track money that is expected to be borrowed or provided externally.

### Scope

- create expected fund entry
- edit expected fund entry
- delete expected fund entry
- status support:
  - planned
  - confirmed
  - received
- convert values into USD
- include in relevant summaries

### Deliverables

- expected funds are manageable
- values are normalized into USD
- own savings and expected borrowed funds are clearly separated

### Tests

- expected fund conversion logic
- totals that include borrowed funds
- status-related logic

### Notes

- must not blur the distinction between own money and borrowed support

---

## [ ] Phase 7 — Operations Log Foundation

### Goal

Build the financial activity backbone.

### Scope

- operations list
- add operation
- edit operation
- delete operation
- support types:
  - income
  - expense
  - transfer
  - adjustment
- basic filtering

### Deliverables

- operations history is usable
- operations are persisted
- adjustments are explicit and visible

### Tests

- operation normalization
- filtering logic
- service/facade behavior for operations

### Notes

- no hidden balance mutations
- every meaningful change should be traceable

---

## [ ] Phase 8 — Exchange Operations and FX Loss

### Goal

Track exchange operations and calculate losses from spread.

### Scope

- create exchange operation flow
- select source and target
- record source amount
- record received amount
- calculate effective exchange rate
- use reference market rate
- calculate theoretical market result
- calculate FX loss
- show cumulative FX loss

### Deliverables

- exchange operations are recorded correctly
- FX loss is visible and explainable
- balances update consistently after exchange operations

### Tests

- effective rate calculation
- theoretical vs actual result
- FX loss calculation
- cumulative FX loss aggregation

### Notes

- this is a critical business feature
- calculations must be especially well-tested

---

## [ ] Phase 9 — Dashboard Assembly

### Goal

Compose the main financial control panel.

### Scope

- target summary
- own savings summary
- expected borrowed funds summary
- total capital summary
- remaining-to-goal summary
- progress percentage
- source breakdown
- FX loss summary
- recent operations preview

### Deliverables

- dashboard answers the core product questions immediately
- numbers are coherent
- UI feels premium and trustworthy
- dashboard is clearly more useful than the spreadsheet

### Tests

- aggregation logic
- remaining amount calculation
- progress calculation
- dashboard derived values

### Notes

- prioritize clarity and hierarchy over widget quantity

---

## [ ] Phase 10 — Hardening and Refinement

### Goal

Bring the MVP to a polished, maintainable, production-quality state.

### Scope

- UX refinement
- responsive refinement
- accessibility pass
- performance pass
- error/loading/empty-state refinement
- code cleanup
- architecture cleanup
- test coverage improvement
- Firebase rules review
- final MVP review

### Deliverables

- app feels polished
- codebase is clean
- architecture remains easy to maintain
- security is acceptable
- tests cover critical logic well

### Tests

- improve missing test coverage
- verify critical flows remain covered

### Notes

- do not add new large features here
- this phase is for raising quality, not expanding scope

---

# Per-Phase Execution Template

Use this template before starting any phase:

## Phase Start

- Goal:
- Scope:
- Main files/layers likely affected:
- Risks:
- Tests to add:

Use this template after finishing any phase:

## Phase End

- Implemented:
- Not included intentionally:
- Tests added:
- Known gaps:
- Next recommended phase:

---

# Ongoing Review Checklist

Use this checklist before marking any phase complete:

## Product

- Does this phase solve a real user problem?
- Does it support the financial control-panel vision?

## Architecture

- Is responsibility placed correctly?
- Is business logic outside UI components?
- Is the structure still easy to extend?

## Angular

- Are components small and focused?
- Are forms typed?
- Is state flow clear?
- Is OnPush respected?
- Are Signals used appropriately?

## Firebase

- Is auth secure?
- Are Firestore interactions isolated?
- Are rules still safe?

## UX

- Does it look premium?
- Is hierarchy clear?
- Are loading/error/empty states handled properly?

## Testing

- Were unit tests added?
- Are edge cases covered?
- Is the test suite meaningful?

---

# Backlog Ideas (Not MVP)

Do not implement these before MVP is solid.

- advanced charts
- AI summaries
- forecasting scenarios
- multi-user support
- collaboration
- notifications
- export/import tools
- advanced analytics
- mobile-first PWA extras beyond what is necessary

---

# Final Goal

The final MVP must be:

- secure
- maintainable
- premium-looking
- financially correct
- well-structured
- test-covered in critical areas
- pleasant to continue building

The priority is not speed of generation.

The priority is:
**high code quality + premium UX + strong architecture + steady phased delivery**
