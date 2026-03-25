# REFACTOR.md

## Purpose

This file tracks technical debt, architectural violations, and code-quality improvements that need to be addressed before or during upcoming phases.

It is not a wish-list. Every item here is a concrete gap relative to the quality standards stated in `AGENTS.md`, `DESIGN_RULES.md`, and `IMPLEMENTATION_PLAN.md`.

Items are grouped by priority. Each item cites the specific violation and the rule it breaks.

**Keep this file up to date.** When a refactor is completed, move the item to the [Done](#done) section with a date.

---

## Priority: Critical

### RT-02 — Extract formatting helpers from `currency-page.component.ts`

**Files affected**: `currency-page.component.ts`, (new) `currency-formatting.helpers.ts`

**Rule**: AGENTS.md: _"components must not contain financial business logic"_; _"do not put business logic in templates"_. The component is 400+ lines.

**Issue**: The following methods are pure formatting/utility logic that does not belong in a component:

- `formatNumber(n)` — generic number formatter
- `formatHoldingAmount(code, amount)` — format based on currency
- `formatConverterAmount(amount, code)` — duplicate of above for converter
- `formatConverterRate(rate, from, to)` — rate formatting string
- `formatConverterInputAmount(amount, from)` — input display value
- `converterSymbol(code)` — currency → symbol lookup
- `getAlternativeCurrency(code)` — swap-partner logic
- `holdingInputStep(code)` — currency-specific step config
- `holdingFormKey(code)` — code → form key mapping

**Action**: Create `src/app/features/currency/currency-formatting.helpers.ts` with these as pure exported functions. Update the component to import and call them. Add tests.

---

## Priority: High

### RT-04 — Tokenize all hardcoded RGBA/hex colors in component SCSS

**Files affected**: `currency-page.component.scss`, `goal-page.component.scss`, `_theme.scss`

**Rule**: AGENTS.md: _"Do not introduce colors, spacing values, border-radius, typography, or shadow values that are not defined in `_theme.scss` or DESIGN_RULES.md"_; _"Do not override or bypass design tokens with raw CSS values"_.

**Issue**: Both component stylesheets contain 20+ hardcoded `rgba(...)` and hex values that bypass the design token system. Examples:

- `rgba(12, 20, 35, 0.8)` — should be a background overlay token
- `rgba(255, 255, 255, 0.05/0.08/0.12)` — should be named surface/overlay tokens
- `#5d45f3`, `#5538e0` — should be `var(--color-accent-violet)` or a derived token
- `#ffb2a2` — hardcoded warning color with no token equivalent
- `#0fd19a`, `#18c389` — should be `var(--color-accent-emerald)` derivatives

**Action**: Add missing overlay/glass/state tokens to `_theme.scss` (e.g. `--color-surface-1`, `--color-surface-2`, `--color-overlay-subtle`, `--color-overlay-moderate`). Replace all raw values in SCSS files.

---

### RT-06 — Complete sources feature UI

**Files affected**: `src/app/features/sources/` (new) `sources-page/`

**Rule**: IMPLEMENTATION_PLAN.md defines a Sources feature. The backend exists (service, facade, helpers, model) but there is no page component and no route to reach it.

**Issue**: `source.facade.ts`, `source.service.ts`, `source.helpers.ts` exist. `sources.routes.ts` exists. No `sources-page` component. No navigation link. The feature is unusable.

**Action**: Implement the `sources-page` component (list + add/edit/delete flow). Wire the route. Add nav link. Add tests for helpers and service (currently missing).

---

## Priority: Medium

### RT-12 — Evaluate Legacy Firestore backward-compatibility normalization

**Files affected**: `currency.service.ts`

**Rule**: IMPLEMENTATION*PLAN.md: *"no rushed 'temporary' code that obviously becomes permanent"\_.

**Issue**: `normalizeHoldingBalance()` exists to handle documents written before the `{cash, card}` model migration. If all existing user documents have already been migrated (or if there is only one user), this normalization path becomes dead code that adds complexity.

**Action**: Verify whether any legacy flat-format documents still exist in production Firestore. If not, remove the fallback normalization. If yes, consider a one-time migration script rather than read-time normalization.

---

### RT-13 — Split `currency-page.component.ts` into sub-components

**Files affected**: `currency-page.component.ts`, `currency-page.component.html`, (new) sub-components

**Rule**: AGENTS.md: _"do not use large smart components"_; _"components must have one clear responsibility"_.

**Issue**: `CurrencyPageComponent` currently handles: exchange rate display, rate fetching, holding card display, holdings edit dialog, portfolio total display, distribution chart, and currency converter. That is 7 distinct responsibilities in one component (~400 lines TS, ~500 lines HTML).

**Candidates for extraction** (in priority order):

1. `HoldingCardComponent` — a presentational component for a single currency holding card
2. `CurrencyConverterComponent` — standalone widget with its own form and logic
3. `PortfolioTotalComponent` — a display component for the total block
4. `RatesStripComponent` — rates display + refresh button

**Note**: Extract when the component naturally needs to be reused (e.g. when the Dashboard needs to embed holding cards), not purely for size.

---

## Priority: Low

### RT-14 — Evaluate `CurrencyHoldings` map-based structure

**Files affected**: `core/models/currency.model.ts`, `currency.facade.ts`, `currency.service.ts`, `currency-page.component.ts`, helpers

**Rule**: Extensibility. Adding a new tracked currency (e.g. GBP) currently requires updating the model interface, EMPTY constant, service mapper, form group, and all helper call sites.

**Issue**: The current interface `{ uah: CurrencyHoldingBalance; usd: ...; eur: ... }` is a named-property object. A `Record<CurrencyCode, CurrencyHoldingBalance>` design would allow generic iteration without per-currency `switch/if` statements.

**Consideration**: This is a significant refactor that touches every layer. Should only be done when a new currency addition is actually planned. Track as a future decision, not an immediate action.

---

### RT-15 — Internationalise chart tooltip callback

**Files affected**: `currency-page.component.ts`

**Rule**: AGENTS.md: _"every new user-facing string must be added to translations"_.

**Issue**: The doughnut chart tooltip callback formats a string inline:

```typescript
label: (context) => `${context.label}: ${context.parsed.toFixed(1)}%`;
```

This bypasses the i18n layer. In Ukrainian locale the word order and percentage formatting convention may differ.

**Action**: Inject `I18nService` into the chart options factory and use `t('currency.chartTooltipLabel', { label, value })` or format the percentage via Angular's `PercentPipe`.

---

## Done

_Completed items are moved here with a completion date._

<!-- Example:
### RT-00 — Example completed refactor
**Completed**: 2026-03-25
**What changed**: ...
-->

### RT-01 — Add tests for facades and services

**Completed**: 2026-03-25
**What changed**: Added [src/app/features/currency/currency.facade.spec.ts](src/app/features/currency/currency.facade.spec.ts), [src/app/features/goals/goal.facade.spec.ts](src/app/features/goals/goal.facade.spec.ts), and expanded [src/app/features/goals/goal.service.spec.ts](src/app/features/goals/goal.service.spec.ts) to cover facade signals and goal Firestore read/write behavior.

### RT-03 — Extract template percentage calculations to computed properties

**Completed**: 2026-03-25
**What changed**: Moved repeated cash/card percentage math out of [src/app/features/currency/currency-page/currency-page.component.html](src/app/features/currency/currency-page/currency-page.component.html) into `cashSharePercent()` and `cardSharePercent()` in [src/app/features/currency/currency-page/currency-page.component.ts](src/app/features/currency/currency-page/currency-page.component.ts).

### RT-05 — Tokenize hardcoded colors in chart configuration

**Completed**: 2026-03-25
**What changed**: Added [src/app/shared/helpers/chart-theme.ts](src/app/shared/helpers/chart-theme.ts) and updated [src/app/features/currency/currency-page/currency-page.component.ts](src/app/features/currency/currency-page/currency-page.component.ts) and [src/app/features/goals/goal-page/goal-page.component.ts](src/app/features/goals/goal-page/goal-page.component.ts) to read chart colors from design tokens instead of hardcoded literals.

### RT-07 — Fix typed reactive form in auth components

**Completed**: 2026-03-25
**What changed**: Switched [src/app/features/auth/login/login.component.ts](src/app/features/auth/login/login.component.ts) and [src/app/features/auth/register/register.component.ts](src/app/features/auth/register/register.component.ts) to `NonNullableFormBuilder` and removed untyped `FormGroup` / `getRawValue()` casts.

### RT-08 — Move Firestore mapper functions out of the service

**Completed**: 2026-03-25
**What changed**: Added [src/app/core/mappers/currency.mapper.ts](src/app/core/mappers/currency.mapper.ts) and updated [src/app/features/currency/currency.service.ts](src/app/features/currency/currency.service.ts) to import the normalization helpers from the mapper layer.

### RT-09 — Create `core/constants/` with Firestore path constants

**Completed**: 2026-03-25
**What changed**: Added [src/app/core/constants/firestore.constants.ts](src/app/core/constants/firestore.constants.ts) and updated [src/app/features/currency/currency.service.ts](src/app/features/currency/currency.service.ts) and [src/app/features/goals/goal.service.ts](src/app/features/goals/goal.service.ts) to use shared Firestore path builders.

### RT-10 — Update `Goal` model to include metadata fields

**Completed**: 2026-03-25
**What changed**: Extended [src/app/core/models/goal.model.ts](src/app/core/models/goal.model.ts) with `currency` and `updatedAt`, and updated [src/app/features/goals/goal.service.ts](src/app/features/goals/goal.service.ts) to return the typed currency field.

### RT-11 — Remove re-export of model constant from service

**Completed**: 2026-03-25
**What changed**: Removed the `EMPTY_CURRENCY_DATA` re-export from [src/app/features/currency/currency.service.ts](src/app/features/currency/currency.service.ts), keeping that constant sourced directly from the model layer.
