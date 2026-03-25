# STYLEGUIDE.md

## Purpose

This document defines the screenshot-matched visual system for FinPlan.

It is the implementation-level style source of truth for the authenticated product UI.
If a future change makes the product look flatter, brighter, noisier, or more generic than the screenshot direction, that change should be rejected or revised.

## Visual Direction

FinPlan must feel like:

- a premium wealth-readiness dashboard
- dark, calm, intentional, high-trust
- dense enough to feel professional, but never cramped
- product UI first, marketing UI never

FinPlan must not feel like:

- a generic admin template
- a card grid with random purple accents
- a crypto dashboard with excessive glow
- a spreadsheet in disguise

## Page Architecture

Authenticated pages follow the same structure:

1. left sidebar only
2. page eyebrow
3. large page title
4. short subtitle
5. top-right primary action
6. primary summary block
7. secondary metric cards
8. analytical detail section below

## Shell Rules

Sidebar:

- Fixed width: 184px
- Background token: `--color-shell-sidebar`
- Active nav state: filled indigo pill, subtle border, no loud shadows
- Brand mark: rounded-square violet gradient chip
- Main content background: deep dark with soft radial violet bloom near the top

Navigation labels:

- Dashboard
- Sources
- Expected Funds
- Exchange & Ops

## Color Tokens

Use only tokens from `src/styles/_theme.scss`.
Do not introduce raw colors in feature styles unless a new token is added first.

Core layout:

- `--color-shell-bg`: app frame background
- `--color-shell-sidebar`: sidebar background
- `--color-bg-base`: deep app background
- `--color-bg-surface`: default card surface
- `--color-bg-elevated`: raised content surface
- `--color-bg-overlay`: compact overlays / toggles

Brand and semantic accents:

- `--color-accent-violet`: primary analytical accent
- `--color-accent-emerald`: positive / saved / healthy state
- `--color-accent-amber`: warning / still missing / caution state
- `--color-danger-light`: soft negative metric state
- `--color-primary`: utility blue for neutral informational accents

Charts:

- `--color-chart-violet-fill`
- `--color-chart-grid`
- `--color-chart-empty`

Buttons:

- `--color-btn-primary-from`
- `--color-btn-primary-to`

## Border Radius

Use these radii consistently:

- compact pills and segmented controls: 9px to 12px
- standard cards: `--radius-lg`
- large content cards and chart panels: `--radius-xl`
- hero summary cards: `--radius-xl` or slightly above
- full pills/badges: `--radius-full`

Do not mix many different radius values in the same feature.

## Typography

Typography should carry hierarchy more than color.

Rules:

- Eyebrow: 12px, uppercase, wide tracking, muted accent tone
- Page title: clamp-based, large, tight tracking
- Page subtitle: secondary tone, max width around 720–760px
- Metric value: large, bold, negative tracking
- Labels and meta rows: 11–13px, subdued contrast

## Card Composition

Base content cards:

- Use `app-card`
- Default card border is subtle and always present
- Inner content should usually be arranged as: title, metric/value, hint

Top metric cards:

- Compact outer card
- Inner inset panel for the main amount when appropriate
- Status badge in top-right
- One short note line at the bottom

Analytics cards:

- Header block with title + subtitle
- Primary visual block below
- Legend or insight stack beneath / beside visual

Activity log cards:

- Rounded inset panel inside the main card
- Header row with operation title on the left and compact date on the right
- Three-column detail strip for FROM / TO / EFFECT
- One muted footnote row explaining rate context or source rebalance
- Effect color communicates gain / neutral move / loss without recoloring the whole card

## CTA Rules

Primary CTA:

- height around 46px
- gradient fill using button tokens
- rounded large corners
- no icon unless action clarity requires it
- should sit in the page header, right aligned

Secondary CTA:

- subtle surface, bordered
- no bright fill unless it is the sole action in a dialog

## Form Controls

Inputs in authenticated screens:

- dark inset surface
- subtle border
- rounded large corners
- focus ring uses violet-tinted outline, not browser default blue
- modal forms use a dense grid, not long marketing-style vertical spacing

## Charts

Charts are analytical, not decorative.

Rules:

- hide chart legends when a custom legend is clearer
- use token-driven colors only
- use dark chart canvases inside slightly inset panels
- avoid heavy axes and grid lines
- center text inside doughnut charts is acceptable when it communicates the primary total

## Content Tone

Headings and labels must be specific to the product model:

- own savings
- expected borrowed funds
- readiness progress
- UAH exposure
- remaining gap

Avoid generic dashboard labels like:

- analytics
- performance
- users
- activity

## Responsiveness

On smaller screens:

- page header stacks
- top-right CTA becomes full width
- summary grids collapse to one column
- tables collapse by hiding lower-priority columns first
- dialogs become full-width panels inside padded viewport bounds

## Implementation Rules

When editing UI:

- update translations for both English and Ukrainian in the same change
- update this styleguide if new permanent tokens or component patterns are introduced
- prefer reusing `app-card`, `app-badge`, shared tokens, and the chart theme helper
- if a raw value is needed repeatedly, promote it to a token immediately
