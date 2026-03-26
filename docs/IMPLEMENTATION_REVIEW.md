# FinPlan Implementation Review

Reviewed on 2026-03-26 against the current workspace state.

## Review Basis

- Review intent: implementation inconsistencies, dead code, architectural drift, and maintenance risks
- Standard used: the last committed `docs/AGENTS.md` rules, because that file is currently deleted in the working tree
- Verification run: `npm run lint`
- Lint result: failing with 39 errors

## Findings

### 1. Exchange operations are only partially implemented and are misclassified in the activity UI

Severity: High

The activities domain still supports `exchange`, but the page UI only exposes `income` and `transfer`. That already creates a feature mismatch. There is also a concrete bug: exchange entries are mapped to `operationType: 'income'`, so type filtering and visual treatment are wrong when exchange records exist.

Evidence:

- [src/app/core/models/operation.model.ts](/Users/denyskorotin/Projects/fin-plan/src/app/core/models/operation.model.ts#L4)
- [src/app/features/operations/operations-page/operations-page.component.ts](/Users/denyskorotin/Projects/fin-plan/src/app/features/operations/operations-page/operations-page.component.ts#L76)
- [src/app/features/operations/operations-page/operations-page.component.ts](/Users/denyskorotin/Projects/fin-plan/src/app/features/operations/operations-page/operations-page.component.ts#L82)
- [src/app/features/operations/operations-page/operations-page.component.ts](/Users/denyskorotin/Projects/fin-plan/src/app/features/operations/operations-page/operations-page.component.ts#L414)
- [src/app/features/operations/operations-page/operations-page.component.ts](/Users/denyskorotin/Projects/fin-plan/src/app/features/operations/operations-page/operations-page.component.ts#L442)
- [src/app/features/operations/operations-page/operations-page.component.html](/Users/denyskorotin/Projects/fin-plan/src/app/features/operations/operations-page/operations-page.component.html#L59)

Why it matters:

- The product intent explicitly calls out exchange tracking and FX-loss visibility.
- The current UI suggests a complete activity system, but it cannot create one of the supported core record types.
- Misclassified exchange entries will be filtered and styled incorrectly.

Recommended action:

1. Decide whether `exchange` is in scope right now.
2. If yes, expose it fully in the page UI and filtering model.
3. If no, remove exchange support from the domain model/helpers until the UI is ready.
4. In either case, stop labeling exchange entries as `income`.

### 2. Dashboard savings use a different source of truth than the currency tracker, and the UI copy is misleading

Severity: High

The dashboard computes current savings from operation-derived source balances, while the copy tells the user that the value is synced from the currency page. Those are two different financial models.

Evidence:

- [src/app/features/goals/goal-page/goal-page.component.ts](/Users/denyskorotin/Projects/fin-plan/src/app/features/goals/goal-page/goal-page.component.ts#L76)
- [src/app/features/goals/goal-page/goal-page.component.html](/Users/denyskorotin/Projects/fin-plan/src/app/features/goals/goal-page/goal-page.component.html#L113)
- [src/app/core/services/i18n.service.ts](/Users/denyskorotin/Projects/fin-plan/src/app/core/services/i18n.service.ts#L102)
- [src/app/core/services/i18n.service.ts](/Users/denyskorotin/Projects/fin-plan/src/app/core/services/i18n.service.ts#L110)

Why it matters:

- This is a finance product, so conflicting money models are a trust problem.
- Updating holdings in `/currency` does not drive the dashboard value the copy tells the user to trust.
- The project intent in `AGENTS.md` favors explicit financial logic over hidden behavior.

Recommended action:

1. Pick one canonical source of truth for “current savings”.
2. Either align the dashboard with the currency document or remove the implication that currency balances drive it.
3. Update the copy and docs in the same change so the UX matches the real model.

### 3. `SourceService` and the `sources/{uid}` Firestore document are effectively orphaned

Severity: Medium

The current sources UI is driven by `SourceFacade`, and that facade derives balances exclusively from operations. `SourceService` still reads and writes `sources/{uid}`, but nothing in the active UI flow uses it.

Evidence:

- [src/app/features/sources/source.facade.ts](/Users/denyskorotin/Projects/fin-plan/src/app/features/sources/source.facade.ts#L14)
- [src/app/features/sources/source.service.ts](/Users/denyskorotin/Projects/fin-plan/src/app/features/sources/source.service.ts#L9)
- [src/app/core/constants/firestore.constants.ts](/Users/denyskorotin/Projects/fin-plan/src/app/core/constants/firestore.constants.ts#L10)

Repo search result:

- `SourceService` is only referenced by its own spec file and not by any facade or page component.

Why it matters:

- This leaves two competing balance-storage models in the codebase.
- One of them is effectively dead but still has rules, tests, and maintenance cost.
- Future contributors can easily update the wrong path.

Recommended action:

1. Remove `SourceService` and `sources/{uid}` support if operations are the canonical source model.
2. Otherwise, rewire `SourceFacade` to use the service and make operations update the persisted source document explicitly.
3. Reflect the decision in Firestore rules and docs.

### 4. Expected-funds coverage falls back to a hardcoded house target

Severity: Medium

When no goal is configured, the expected-funds page silently falls back to `161_700` USD.

Evidence:

- [src/app/features/expected-funds/expected-funds.data.ts](/Users/denyskorotin/Projects/fin-plan/src/app/features/expected-funds/expected-funds.data.ts#L26)
- [src/app/features/expected-funds/expected-funds-page/expected-funds-page.component.ts](/Users/denyskorotin/Projects/fin-plan/src/app/features/expected-funds/expected-funds-page/expected-funds-page.component.ts#L74)

Why it matters:

- The percentage shown to the user is based on an invented target, not their data.
- This conflicts with the project rule to prefer explicit financial logic.

Recommended action:

1. Remove the hardcoded fallback from coverage calculations.
2. Show an explicit “goal required” state or disable coverage until a real goal exists.

### 5. The canonical Firestore constant for user preferences is wrong and unused

Severity: Medium

`FIRESTORE_PATHS.userPreferences` points at `users/{uid}/preferences/locale`, but the actual service reads and writes `users/{uid}/preferences/ui`.

Evidence:

- [src/app/core/constants/firestore.constants.ts](/Users/denyskorotin/Projects/fin-plan/src/app/core/constants/firestore.constants.ts#L11)
- [src/app/core/services/user-preferences.service.ts](/Users/denyskorotin/Projects/fin-plan/src/app/core/services/user-preferences.service.ts#L13)
- [src/app/core/services/user-preferences.service.ts](/Users/denyskorotin/Projects/fin-plan/src/app/core/services/user-preferences.service.ts#L25)

Why it matters:

- The shared path contract is false.
- If another change starts using the constant, it will write to the wrong document.

Recommended action:

1. Fix the constant to `users/{uid}/preferences/ui`.
2. Make `UserPreferencesService` use the constant.
3. Add a small test for the path if path constants are intended to be stable infrastructure.

### 6. The repo is not lint-clean, and part of the failure set reflects real drift

Severity: Medium

`npm run lint` currently fails with 39 errors.

Notable examples:

- deprecated Angular animation provider in [src/app/app.config.ts](/Users/denyskorotin/Projects/fin-plan/src/app/app.config.ts#L4)
- unused type/import drift in several feature files
- invalid `input` and `output` generic usage in [src/app/shared/ui/empty-state/empty-state.component.ts](/Users/denyskorotin/Projects/fin-plan/src/app/shared/ui/empty-state/empty-state.component.ts#L15) and [src/app/shared/ui/error-state/error-state.component.ts](/Users/denyskorotin/Projects/fin-plan/src/app/shared/ui/error-state/error-state.component.ts#L15)
- avoidable type and condition issues in the currency, goals, and operations pages

Why it matters:

- The codebase is no longer meeting its stated quality bar.
- Some of these failures are pure correctness and maintenance issues, not stylistic preference.

Recommended action:

1. Make the repo lint-clean before adding more feature work.
2. Remove dead code instead of only suppressing lint.
3. Tackle deprecated APIs now while the scope is still small.

## Unused or Likely Dead Code

### `SourceService`

Status: Likely dead in production flow

Evidence:

- only referenced directly in [src/app/features/sources/source.service.spec.ts](/Users/denyskorotin/Projects/fin-plan/src/app/features/sources/source.service.spec.ts)
- not used by [src/app/features/sources/source.facade.ts](/Users/denyskorotin/Projects/fin-plan/src/app/features/sources/source.facade.ts)

### `FIRESTORE_PATHS.userPreferences`

Status: Dead constant / incorrect constant

Evidence:

- declared in [src/app/core/constants/firestore.constants.ts](/Users/denyskorotin/Projects/fin-plan/src/app/core/constants/firestore.constants.ts#L11)
- no usage found in `src/app`

### `EmptyStateComponent` and `ErrorStateComponent`

Status: Likely unused shared UI primitives

Evidence:

- selectors exist in [src/app/shared/ui/empty-state/empty-state.component.ts](/Users/denyskorotin/Projects/fin-plan/src/app/shared/ui/empty-state/empty-state.component.ts#L9) and [src/app/shared/ui/error-state/error-state.component.ts](/Users/denyskorotin/Projects/fin-plan/src/app/shared/ui/error-state/error-state.component.ts#L9)
- repo-wide search did not find any usage sites

Note:

- These may be intended future primitives, but right now they only add surface area and lint debt.

## Inconsistencies With Product Rules

Compared with the committed `AGENTS.md`, the current implementation diverges in these notable ways:

- expected funds do not support `received`
- operations do not support `expense` or `adjustment`
- exchange is present in the domain model but not fully exposed in the UI
- financial source-of-truth rules are inconsistent between dashboard, sources, and currency pages
- the repo is not lint-clean despite a strict quality/maintainability posture

## Suggested Execution Order

If another AI is assigned to clean this up, the most defensible order is:

1. Decide the single source of truth for balances and dashboard savings.
2. Remove or rewire `SourceService` and related `sources/{uid}` persistence accordingly.
3. Fix the activities domain/UI mismatch, starting with exchange classification and scope.
4. Remove the hardcoded expected-funds target fallback.
5. Fix the user-preferences Firestore constant and wire it through the service.
6. Make the repo lint-clean and remove unused shared UI code if it remains unused.

## Verification Notes

Commands run during review:

```bash
npm run lint
rg -n "SourceService|FIRESTORE_PATHS\\.userPreferences|operationType: 'income'|DEFAULT_HOUSE_TARGET_USD" src/app
```

Observed result:

- `npm run lint` failed with 39 errors on 2026-03-26
