# AGENTS.md

## Purpose

This file defines strict engineering rules, architectural constraints, implementation standards, and review expectations for the House Savings Dashboard project.

This project must be built with a strong focus on:

- code quality
- maintainability
- premium UI/UX
- explicit financial logic
- predictable incremental delivery
- production-oriented Angular and Firebase best practices

This file is intentionally strict.
If a solution is more complex than the product actually needs, reject it.

---

## Mandatory Pre-Implementation Checklist

Before writing or changing **any** UI code, components, layouts, or styles:

1. Read `docs/DESIGN_RULES.md` in full.
2. Match every visual decision to the tokens, patterns, and principles defined there.
3. Do not introduce colors, spacing values, border-radius, typography, or shadow values that are not defined in `_theme.scss` or `DESIGN_RULES.md`.
4. Do not override or bypass design tokens with raw CSS values.
5. If a required token is missing, add it to `_theme.scss` first, then use it.

This rule applies to every phase, every component, every iteration.

---

## Product Intent

The project is a premium personal finance web application for tracking progress toward buying a house.

The app must allow the user to:

- define one financial goal: buying a house
- set the house price target
- track available money across multiple savings sources
- normalize all values into USD
- track expected borrowed funds
- track exchange operations
- calculate FX losses caused by spread
- monitor true readiness to purchase the house
- use the app as a clear and trustworthy replacement for spreadsheets

This is a focused financial control panel.
It is not a generic finance platform.

---

## Product Principles

The application must optimize for:

- clarity over clutter
- correctness over convenience
- maintainability over cleverness
- explicit calculations over hidden behavior
- premium UX over default admin UI
- simplicity over premature scale patterns
- gradual evolution over rushed full generation

---

## Mandatory Technical Standards

### Stack

- Angular latest stable version
- TypeScript strict mode
- standalone components only
- Angular Signals for local and derived UI state
- RxJS only where async streams are needed
- Firebase Auth
- Firestore
- Firebase Hosting
- optional Cloud Functions only if clearly justified

### Angular Standards

- use standalone components only
- use `ChangeDetectionStrategy.OnPush` by default
- use typed reactive forms only
- use Signals for local state
- use `computed()` for derived view state
- use `effect()` only for real side effects
- do not use template-driven forms
- do not put business logic in templates
- do not use large smart components
- do not introduce NgRx unless the product scope genuinely grows beyond this app’s current needs
- keep routing explicit and feature-based
- prefer route-level lazy loading where useful

### Component Standards

- components must have one clear responsibility
- page/container components orchestrate data and composition
- presentational components render inputs and emit outputs only
- form components manage typed form state and emit normalized data
- components must not contain financial business logic
- components must not access Firestore directly
- components must not duplicate calculation logic
- component inputs and outputs must be explicit and strongly typed
- avoid vague event names like `changed`
- prefer explicit event names like `goalSaved`, `operationDeleted`, `expectedFundUpdated`

### UI Standards

> **Always read `docs/DESIGN_RULES.md` before implementing any UI.**
> All visual decisions must be grounded in the design system defined there.

- premium, polished, high-trust UI
- strong visual hierarchy
- intentional spacing and typography
- clean card-based dashboard experience
- no spreadsheet-like raw UI
- no cluttered tables with weak hierarchy
- loading, empty, and error states must be designed
- auth screens must match the same product quality standard
- responsive behavior must be considered from the start

### Firebase Standards

- authentication is required
- supported auth providers:
  - Google sign-in
  - email/password
- Firestore must never be openly writable
- UI components must not use Firebase SDK directly
- all Firebase access must go through dedicated services or facades
- Firestore rules must enforce authenticated access
- no insecure shortcuts “for now”
- data writes must be explicit and predictable

### Testing Standards

- unit tests are mandatory
- each meaningful business logic addition must include tests
- each feature phase must include tests for its important logic
- prioritize testing:
  1. financial calculations
  2. currency conversion
  3. progress calculations
  4. FX loss calculations
  5. expected borrowed funds logic
  6. auth logic
  7. facade/service logic
  8. validation logic

---

## Required Product Scope

### 1. Goal

There is only one main financial goal:

- House purchase

The app must allow:

- setting the target amount
- using USD as the base analytics currency

### 2. Savings Sources

Required initial savings sources:

- Cash USD
- Card USD
- Card UAH
- Cash UAH

The app must show:

- source balance
- source currency
- normalized USD value
- total own savings across all sources

### 3. Currency Conversion

The app must:

- fetch current exchange rates
- normalize UAH and EUR values into USD
- use live rates for dashboard summaries
- preserve operation-specific rate context for historical operations

### 4. Expected Borrowed Funds

The app must support:

- person/source name
- amount
- currency
- converted USD value
- status:
  - planned
  - confirmed
  - received
- optional expected date
- optional note

The dashboard must clearly separate:

- own savings
- expected borrowed funds
- total capital including expected borrowed funds

### 5. Exchange Operations

The app must support:

- converting from one source to another
- effective exchange rate
- reference market rate
- actual amount received
- theoretical amount at market rate
- FX loss
- cumulative FX loss

### 6. Dashboard

The dashboard must immediately answer:

- How much money do we have now?
- How much is still missing?
- Where is the money stored?
- How much is expected from borrowed funds?
- How much was lost on exchange?
- How close are we to buying the house?

### 7. Operations Log

Required operation types:

- income
- expense
- transfer
- exchange
- adjustment

The operations history must support:

- create
- edit
- delete
- filter
- understand operation effect clearly

---

## Architecture Rules

Use feature-based architecture.

Expected structure:

```text
src/app/
  core/
    config/
    constants/
    models/
    services/
    guards/
    utils/
    mappers/

  shared/
    ui/
    pipes/
    directives/
    helpers/
    types/

  features/
    auth/
    dashboard/
    goals/
    sources/
    exchange-rates/
    expected-funds/
    operations/
    settings/
```
