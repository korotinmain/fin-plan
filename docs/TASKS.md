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

## [ ] Phase 2 — App Shell and Design Foundation

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

- app already feels like a premium product shell
- future screens can be built consistently
- visual language is coherent

### Tests

- only where meaningful for reusable behavior
- do not over-test purely visual components

### Notes

- focus on trust, hierarchy, and polish
- avoid default-looking admin-panel design

---

## [ ] Phase 3 — Goal Setup

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

- user can define target amount
- goal persists correctly
- summary displays reliably

### Tests

- goal service/facade logic
- validation rules
- progress-related calculations introduced in this phase

### Notes

- keep goal flow simple and high-confidence

---

## [ ] Phase 4 — Savings Sources

### Goal

Introduce and display the required money sources.

### Scope

- support required sources:
  - Cash USD
  - Card USD
  - Card UAH
  - Cash UAH
- display source list
- display source summary cards
- store and load source balances
- show currency per source

### Deliverables

- user sees all main savings sources
- balances are understandable
- source states are persisted correctly

### Tests

- source mapping logic
- source totals
- source-related derived values

### Notes

- source logic must stay explicit and easy to extend

---

## [ ] Phase 5 — Exchange Rates

### Goal

Normalize all relevant values into USD using live rates.

### Scope

- fetch current rates
- support USD / UAH / EUR
- convert non-USD values into USD
- display rate freshness/status
- handle unavailable-rate scenarios safely

### Deliverables

- dashboard can normalize UAH and EUR values into USD
- conversions are understandable
- missing rate states are handled cleanly

### Tests

- conversion logic
- rate normalization logic
- unavailable/fallback handling

### Notes

- current dashboard totals should always be explainable

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
