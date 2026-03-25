# UI_CHANGELOG.md

## Purpose

This document records the screenshot-driven UI migration in implementation order.
It exists so future refactors can understand what changed, why it changed, and which areas are now expected to remain visually stable.

## Step-by-step changelog

### Step 1 — Establish screenshot style system

- Added screenshot-specific shell/background tokens to `src/styles/_theme.scss`
- Standardized the visual direction around dark premium product UI surfaces
- Documented the new visual system in `docs/STYLEGUIDE.md`

### Step 2 — Rebuild application shell

- Reworked sidebar proportions to match the screenshot layout
- Replaced the old authenticated nav structure with:
  - Dashboard
  - Sources
  - Expected Funds
  - Exchange & Ops
- Updated active, hover, locale, and sign-out states to fit the new style

### Step 3 — Replace dashboard placeholder with a real readiness dashboard

- Replaced the placeholder dashboard with a production-style dashboard page
- Added a hero readiness summary with target, own savings, expected support, and remaining gap
- Added secondary summary cards for own savings, borrowed support, FX losses, and estimated completion
- Added readiness growth chart and capital composition block

### Step 4 — Redesign sources page around source composition

- Rebuilt the sources page into screenshot-style source cards
- Added doughnut composition chart with center total
- Added insight stack tied to house-readiness logic
- Replaced per-row inline editing with a single “Edit balances” workflow

### Step 5 — Add expected funds feature page

- Created a dedicated expected-funds route and page
- Added summary cards for expected total, confirmed support, and support coverage
- Added support registry table with search field and status badges

### Step 6 — Align routing with screenshot IA

- Added sources and expected-funds routes to the protected shell
- Added `exchange-ops` route alias for the existing exchange/currency feature
- Kept existing goal and currency routes available, but moved the main experience toward the screenshot navigation model

### Step 7 — Expand i18n coverage

- Added new shell, dashboard, sources, expected-funds, and route-title copy in both English and Ukrainian
- Localized status labels and page-level product language for the new UI

### Step 8 — Build Exchange & Ops as a real feature

- Replaced the temporary `exchange-ops` alias to the currency page with a dedicated operations feature
- Added persistent Firestore-backed activity logging for exchange, income, and transfer records
- Added atomic source-balance updates when an operation is saved
- Added a dedicated exchange impact panel with cumulative and largest-loss metrics plus a monthly FX-loss chart
- Added a recording dialog that keeps the screenshot layout but now drives real balance mutations

## Stable UI Areas

The following areas should now be treated as screenshot-locked unless the styleguide is explicitly revised:

- sidebar proportions and active state styling
- dashboard hero gradient and metric arrangement
- four-card source breakdown row
- composition + insights two-column layout on large screens
- expected funds summary cards and registry table look
- exchange impact split layout and audit-log card structure

## Follow-up work

The following can still be improved without breaking the screenshot direction:

- unify remaining authenticated pages under the same page-header system
- finish replacing leftover raw color values with permanent tokens where needed
- add persistent data management for expected funds instead of static registry data
- add visual regression screenshots once CI supports them
- add edit/delete flows for operations if historical corrections become necessary
