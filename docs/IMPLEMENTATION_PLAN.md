# House Savings Dashboard — Implementation Plan

## Purpose

This document defines the product scope, delivery order, implementation rules, quality standards, and review expectations for building the House Savings Dashboard.

The goal is not to generate the entire system at once.

The goal is to implement the product in **small, logical, production-quality increments**, with:

- maintainable architecture
- premium UI/UX
- strong Angular best practices
- Firebase best practices
- unit test coverage
- clear feature boundaries
- predictable evolution of the codebase

This document is the source of truth for step-by-step implementation.

---

## Product Vision

Build a premium personal finance web application for tracking progress toward buying a house.

The app must help the user:

- define the house price target
- track current available money across multiple sources
- automatically convert all balances into USD
- account for expected borrowed money
- track exchange operations and losses caused by currency spread
- monitor overall readiness to buy the house
- use the product as a better alternative to spreadsheets

The application should feel like a **high-quality personal financial control panel**, not a raw table UI.

---

## Product Principles

The system must optimize for:

- clarity over clutter
- correctness over convenience
- maintainability over cleverness
- explicit calculations over hidden logic
- premium UX over default-looking admin UI
- gradual delivery over rushed full generation
- quality of code and design over speed of implementation

---

## Technical Baseline

Target stack:

- Angular 21.x
- TypeScript strict mode
- Standalone components
- Angular Signals for local reactive state
- RxJS where async streams are needed
- Firebase
  - Firebase Auth
  - Firestore
  - Firebase Hosting
  - optional Cloud Functions
- Unit tests for business logic and critical feature behavior
- Responsive UI
- Premium design quality

Angular’s official docs currently show the site built with Angular `v21.2.5`, and Angular recommends staying on the latest stable patch release and updating with `ng update`. :contentReference[oaicite:0]{index=0}

---

## Authentication Requirement

Authentication is required.

Supported authentication methods:

- Google Sign-In
- Email/Password

Requirements:

- unauthenticated users must not access app data
- Firebase security rules must rely on authenticated user access
- auth flow should be minimal, clean, and premium
- session restoration must work correctly
- logout must be supported
- auth screens must match the same premium UX standard as the dashboard

Do not build this app with open Firestore access.

---

## Core Product Scope

### 1. One Financial Goal

There is only one active goal:

- House purchase

The platform must allow the user to define:

- target house price
- target currency baseline: USD

All analytics must be normalized to USD.

---

### 2. Savings Sources

The app must support multiple money sources, including:

- Cash USD
- Card USD
- Card UAH
- Cash UAH

Future extensibility is allowed, but these are the required MVP sources.

The user must be able to:

- see current amount per source
- understand source currency
- track overall value in USD
- update balances through operations, not hidden state changes

---

### 3. Currency Conversion

The app must:

- fetch актуальні exchange rates
- normalize UAH and EUR values into USD
- show converted totals clearly
- use current rates for live dashboard summaries
- allow historical operations to preserve their own operation-specific rate

Examples:

- UAH balances must be reflected in USD
- expected borrowed EUR must be reflected in USD
- all total progress metrics must be shown in USD

---

### 4. Expected Borrowed Funds

The app must support expected external funds, for example:

- family support
- money that will be lent
- planned incoming help from specific people

Each expected fund record must contain:

- person or source name
- amount
- currency
- converted USD equivalent
- status
  - planned
  - confirmed
  - received
- optional expected date
- optional note

Expected borrowed funds must be included in the relevant dashboard totals.

The dashboard must clearly separate:

- own savings
- expected borrowed funds
- total capital including borrowed funds

---

### 5. Exchange Operations and FX Losses

The system must support exchange operations such as:

- converting UAH from card into USD cash
- converting one currency source into another
- tracking the actual effective exchange rate

The app must calculate:

- effective exchange rate
- reference market rate
- theoretical amount at market rate
- actual received amount
- FX loss caused by spread
- cumulative FX losses over time

The user must be able to understand:

- how much money was lost on exchange operations
- where those losses happened
- how this impacts final readiness for the house purchase

---

### 6. Dashboard

The dashboard must answer these questions immediately:

- How much do we already have?
- How much is still missing?
- Where is the money stored?
- How much is expected from borrowed funds?
- How much have we lost on exchange?
- How close are we to buying the house?

The dashboard must include:

- target amount
- progress toward target
- remaining amount
- own savings total
- expected borrowed funds total
- total available capital
- FX loss summary
- source breakdown
- recent activity preview

---

### 7. Operations Log

The app must support a full operations history.

Required operation categories:

- income
- expense
- transfer
- exchange
- adjustment

The operations history must support:

- listing
- filtering
- editing
- deleting
- understanding source and effect
- preserving rate context where relevant

---

## UX and Design Standards

This product must have a **premium UI/UX** standard.

Design requirements:

- dark or light premium visual system is acceptable
- polished spacing and typography
- strong visual hierarchy
- no cheap admin-panel look
- no cluttered spreadsheet-style UI
- cards, tables, summaries, and forms must feel intentional
- responsive layout must be considered from the start
- loading, empty, and error states must be designed
- auth flow must visually match the product quality level
- interactions must feel calm, precise, and modern

The design goal is not “fancy”.
The design goal is **high trust, clarity, and premium polish**.

---

## Engineering Standards

### Architecture

The codebase must be:

- feature-based
- modular
- easy to navigate
- easy to extend
- easy to review
- easy to refactor

### Angular standards

- standalone components only
- strict typing
- OnPush by default
- Signals for local state and derived state
- reactive forms
- minimal template logic
- no business-critical logic inside components
- no direct Firestore usage in UI components
- no giant all-in-one pages

### Firebase standards

- Firestore access must go through dedicated services/facades
- auth state must be handled explicitly
- Firestore rules must be secure
- no temporary insecure shortcuts
- data writes must be structured and predictable

### Code quality standards

- clear naming
- small components
- no duplicated formulas
- no hidden side effects
- no vague abstractions
- no overengineering
- no “generate everything now” approach

---

## Testing Standards

Unit tests are mandatory.

Priority for unit testing:

1. financial calculations
2. currency conversion logic
3. goal progress logic
4. FX loss calculation
5. normalization of totals into USD
6. auth-related service logic
7. form validation
8. critical facade/service behavior

Tests must cover:

- zero values
- mixed currencies
- missing or delayed rates
- exchange loss scenarios
- expected borrowed money conversion
- remaining amount calculation
- edge cases for empty state
- status transitions for expected funds

Do not postpone tests until the end.
Each implemented feature must include its related unit tests.

---

## Delivery Strategy

The system must be implemented in phases.

Copilot must not try to generate the entire application in one pass.

For each phase:

- define exact scope
- implement only that scope
- keep code production-quality
- add unit tests
- validate architecture
- move to next phase only after current phase is coherent

---

## Delivery Phases

### Phase 0 — Project Foundation

Goal:
Set up a clean, scalable foundation.

Scope:

- initialize Angular project with latest stable Angular 21.x approach
- configure strict TypeScript
- configure routing
- define app shell
- configure Firebase project integration
- configure Firebase Auth
- configure Firestore
- configure environment strategy
- define base folder architecture
- add shared theme/foundation
- add lint/format/test baseline
- create initial CI-friendly project structure

Definition of done:

- project runs
- Firebase connected
- auth configured
- architecture skeleton exists
- theme foundation exists
- test runner works

---

### Phase 1 — Authentication

Goal:
Secure the app and establish access flow.

Scope:

- login page
- Google auth
- email/password auth
- auth state handling
- logout
- route protection
- unauthenticated redirect behavior
- premium auth UI

Definition of done:

- user can sign in with Google
- user can sign in with email/password
- protected routes work
- auth state persists correctly
- auth UI looks production-ready

Unit tests:

- auth service logic
- route guard behavior
- auth state mapping where applicable

---

### Phase 2 — App Layout and Design System Foundation

Goal:
Create the visual and structural base of the product.

Scope:

- application shell
- top navigation / layout frame
- page container rules
- reusable card patterns
- typography system
- spacing system
- status badges
- summary blocks
- table shell
- empty/loading/error states

Definition of done:

- the app already looks like a premium product shell
- reusable UI primitives exist
- layout is consistent
- future pages can be built on top of this system

Unit tests:

- only where meaningful for presentational behavior
- avoid wasteful UI over-testing

---

### Phase 3 — Goal Setup

Goal:
Allow the user to define the house target.

Scope:

- create/edit goal
- target house price
- USD as base analytics currency
- goal summary state
- store/retrieve goal from Firestore

Definition of done:

- the goal can be created and edited
- the target amount is persisted
- the app can display the goal state reliably

Unit tests:

- goal-related service/facade logic
- validation behavior
- progress-related calculation helpers if introduced here

---

### Phase 4 — Savings Sources

Goal:
Introduce the main money containers.

Scope:

- define required sources
  - Cash USD
  - Card USD
  - Card UAH
  - Cash UAH
- source listing
- source summary cards
- source state retrieval/storage
- source-level totals

Definition of done:

- all core sources exist
- the user can see source balances
- balances are clearly grouped and understandable

Unit tests:

- source mapping
- source totals
- source display logic if derived through service/facade code

---

### Phase 5 — Exchange Rates

Goal:
Introduce current rate normalization.

Scope:

- fetch актуальні rates
- support USD, UAH, EUR
- normalize non-USD values into USD
- show rate freshness
- handle fallback / unavailable rate states safely

Definition of done:

- current balances can be reflected in USD
- expected EUR/UAH values can be converted into USD
- rate loading state is handled cleanly

Unit tests:

- rate normalization logic
- conversion helpers
- failure/fallback handling logic

---

### Phase 6 — Expected Borrowed Funds

Goal:
Track money that will be lent or provided.

Scope:

- add expected fund record
- edit/delete expected fund record
- support status
- convert value into USD
- include in dashboard totals

Definition of done:

- expected funds are manageable
- expected funds show converted USD values
- totals clearly separate own savings and borrowed support

Unit tests:

- conversion logic
- status-related calculations
- totals that include/exclude expected funds as intended

---

### Phase 7 — Operations Log Foundation

Goal:
Create the backbone for financial activity tracking.

Scope:

- operations list
- operation creation
- operation editing
- operation deletion
- categories:
  - income
  - expense
  - transfer
  - adjustment
- basic filtering

Definition of done:

- operations history works
- operations are persisted
- operations are understandable in UI
- adjustments are explicit, not hidden mutations

Unit tests:

- operation normalization
- filtering logic
- totals affected by operations where applicable

---

### Phase 8 — Exchange Operations and FX Loss

Goal:
Track currency exchange and losses.

Scope:

- exchange operation flow
- source currency → target currency
- effective exchange rate
- reference market rate
- actual received amount
- theoretical amount
- FX loss
- cumulative FX loss metrics

Definition of done:

- user can record exchange operations
- the app calculates spread loss correctly
- FX loss is visible in summary and history
- exchange operations affect balances consistently

Unit tests:

- effective rate calculation
- reference vs actual comparison
- FX loss calculation
- cumulative loss aggregation

---

### Phase 9 — Dashboard Assembly

Goal:
Compose the full decision-making dashboard.

Scope:

- target summary
- own savings summary
- borrowed funds summary
- total capital summary
- remaining to goal
- progress
- source breakdown
- FX loss summary
- recent operations section

Definition of done:

- dashboard answers the key product questions immediately
- values are coherent and explainable
- UI feels premium and trustworthy
- the dashboard is clearly better than the spreadsheet

Unit tests:

- dashboard aggregation logic
- derived totals
- progress calculations
- remaining amount calculations

---

### Phase 10 — Hardening and Refinement

Goal:
Raise the product to production-quality level.

Scope:

- UX refinements
- responsive polish
- loading/error/empty state refinement
- performance pass
- accessibility pass
- code cleanup
- architectural cleanup
- test coverage improvements
- final review of security rules

Definition of done:

- app feels polished
- codebase is clean
- tests are in good shape
- architecture is maintainable
- security is acceptable
- MVP is genuinely usable

---

## Copilot Working Rules

Copilot must follow these rules when implementing:

1. Do not generate the whole system at once.
2. Always work on one phase at a time.
3. Before each phase, restate:
   - goal
   - scope
   - files likely affected
   - risks
4. After each phase, summarize:
   - what was implemented
   - what remains
   - what should be tested next
5. Prefer simple, maintainable solutions.
6. Use best practices, not shortcuts.
7. Keep code readable and production-oriented.
8. Add unit tests with each meaningful piece of business logic.
9. Do not invent unnecessary abstraction layers.
10. Do not degrade design quality for implementation speed.

---

## Review Checklist for Every Phase

Before moving to the next phase, verify:

### Product

- Does this phase improve the real user workflow?
- Is the outcome useful on its own?
- Does it align with the financial control-panel concept?

### Architecture

- Is responsibility placed correctly?
- Is business logic outside UI components?
- Is the codebase easier to extend now?

### Angular quality

- Is this aligned with modern Angular 21 best practices?
- Are components small and clear?
- Are forms typed and maintainable?
- Is state flow understandable?

Angular’s release guide shows the v21 line is current and Angular recommends regular updates on the supported stable path. :contentReference[oaicite:1]{index=1}

### Firebase quality

- Is auth secure and explicit?
- Are Firestore interactions isolated?
- Are data shapes clear?
- Are rules likely secure?

### UX quality

- Does this look premium?
- Is the UI calm, clear, and intentional?
- Is the visual hierarchy strong?
- Is the app already feeling trustworthy?

### Testing

- Were unit tests added?
- Are core calculations tested?
- Are edge cases covered?
- Is the test suite meaningful, not ceremonial?

---

## Definition of Done

A feature is done only if:

- the intended scope is implemented
- the UI is clean and production-worthy
- code structure is maintainable
- business logic is explicit
- authentication/security assumptions are valid
- unit tests are added for meaningful logic
- loading, error, and empty states are handled where relevant
- the result is coherent enough to be built upon

If any of these are missing, the feature is not done.

---

## Anti-Patterns to Reject

Reject any implementation that introduces:

- all-in-one giant components
- business logic inside templates
- direct Firestore logic inside page components
- duplicated calculations
- weak or vague naming
- insecure Firestore shortcuts
- broken or inconsistent UX
- spreadsheet-like raw UI instead of product UI
- no tests for core financial logic
- “temporary” hacks that will obviously remain permanent
- premature complexity without real need

---

## Final Delivery Goal

The final MVP must be:

- secure
- readable
- premium-looking
- easy to maintain
- logically structured
- financially correct
- test-covered in critical areas
- pleasant to continue building

The priority is not raw generation speed.

The priority is:
**high code quality + strong architecture + premium design + steady incremental delivery**.
