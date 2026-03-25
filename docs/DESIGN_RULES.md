# DESIGN_RULES.md

## Purpose

This file defines the visual design rules, UI generation standards, and product-interface constraints for the House Savings Dashboard project.

This document must be treated as the primary design behavior guide for AI-assisted implementation.

The goal is not to create random beautiful screens.

The goal is to create a **premium, calm, trustworthy financial product UI** with:
- strong visual hierarchy
- clear information architecture
- low visual noise
- polished spacing and typography
- maintainable design consistency
- product-grade dashboard quality

This file is intentionally opinionated.

If a proposed UI looks generic, cluttered, flat, noisy, spreadsheet-like, or low-trust, reject it.

---

## Design Source of Truth

### Primary visual taste reference
Refactoring UI

Use it as the main source for:
- visual hierarchy
- spacing
- density control
- typography hierarchy
- card and table composition
- practical UI polish
- “developer-friendly” premium UI thinking

### Primary design-system reference
IBM Carbon Design System

Use it as the main source for:
- design system discipline
- information architecture consistency
- component behavior
- enterprise-grade UX structure
- accessibility-aware product patterns
- scalable product UI rules

### Secondary reference
Microsoft Fluent 2

Use it as a secondary reference for:
- polished modern product behavior
- coherent digital experience patterns
- calm and refined interface language
- high-quality interaction and layout restraint

### Optional fallback reference
Material Design 3

Use only as a fallback for:
- accessibility behavior
- basic component state conventions
- responsive/foundation patterns

---

## Core Design Philosophy

This product must feel like:
- a premium financial control panel
- a trustworthy product
- a focused personal wealth-tracking dashboard
- a calm, intentional tool for decision-making

This product must not feel like:
- an internal admin panel
- a spreadsheet pasted into cards
- a startup template
- a generic SaaS clone
- a dashboard overloaded with widgets
- a crypto/trading interface with visual noise
- a template-first design with weak hierarchy

---

## Product-Level UI Principles

The interface must optimize for:

- clarity over decoration
- hierarchy over density chaos
- trust over excitement
- structure over improvisation
- calmness over visual aggression
- polished restraint over overdesigned novelty
- usability over dribbble-style experimentation

The user must immediately understand:
- how much money is currently available
- how much is still missing
- where the money is stored
- what amount is expected from borrowed funds
- how much has been lost on exchange
- how close the house purchase is

If the UI fails to answer these questions quickly, the design is wrong.

---

## Global Visual Rules

### 1. Visual Hierarchy Must Be Obvious

Every screen must have a clear reading order.

The user should instantly identify:
1. primary summary
2. secondary breakdown
3. actions
4. supporting detail

Use hierarchy through:
- size
- spacing
- contrast
- grouping
- weight
- alignment

Do not rely on color alone to create hierarchy.

### 2. Start Spacious, Then Densify Carefully

Default to generous spacing first.
Reduce spacing only when the layout already feels structured.

Do not compress the UI too early.
Do not create empty luxury spacing that harms information flow.

Target feeling:
- premium
- breathable
- structured
- efficient

### 3. Use Fewer Visual Decisions

Reduce unnecessary variation in:
- corner radii
- shadows
- border styles
- icon sizes
- text sizes
- card structures
- padding systems

A polished UI repeats strong decisions consistently.

### 4. Prefer Surface Hierarchy Over Decoration

Use:
- sections
- cards
- grouped blocks
- subtle borders
- restrained elevation
- background separation

Do not use:
- excessive gradients
- glow effects
- unnecessary glassmorphism
- ornamental dividers
- random accent colors
- decorative charts with no decision value

### 5. Typography Must Carry Meaning

Typography must signal:
- page importance
- metric importance
- section grouping
- supporting detail
- muted metadata

Do not use too many font sizes.
Do not use weak contrast between important and unimportant text.
Do not create headings that are stylistically loud but structurally weak.

---

## Shell Layout Rules

The application shell defines the structural container for all authenticated screens.

### Layout model
- **No top header.** The application must not use a horizontal top navigation bar.
- **Left sidebar navigation only.** All navigation is contained in a fixed-width left sidebar.
- The sidebar is the sole persistent application chrome once authenticated.
- The main content area occupies all remaining horizontal space to the right of the sidebar.

### Sidebar structure
- App branding (name + subtitle) appears at the top of the sidebar.
- Navigation items are listed below branding, vertically stacked.
- Active route must be visually distinct — use an accent background or left indicator.
- A subtle metadata line (e.g. last updated timestamp) may appear at the bottom of the sidebar.
- The sidebar must feel calm, structured, and secondary to the content — it must not compete for attention.

### Sidebar visual rules
- Use a dark or deeply tinted sidebar background that separates from the content area.
- Icon + label pairs for each nav item; icons must be consistent in size and weight.
- Nav items must have clear hover and active states.
- The sidebar width must be fixed and consistent across all screens.
- No collapsible/hamburger sidebar behavior is required at this stage.

### Content area
- Content area has its own background, separate from the sidebar.
- Each page manages its own internal padding and layout.
- The content area must never include a redundant page-level top bar or secondary nav strip.

### Reject
- any top horizontal nav bar or header bar
- dual navigation (sidebar + top bar simultaneously)
- collapsing or overlay sidebars at desktop width
- sidebars that visually overpower the content area
- content area headers that duplicate sidebar navigation context

---

## Dashboard Design Rules

The dashboard is the most important screen in the app.

It must behave like a **decision cockpit**, not a statistics wall.

### Dashboard priorities
The dashboard must present, in this order:

1. house target status
2. total available capital
3. remaining amount to goal
4. own savings
5. expected borrowed funds
6. FX loss summary
7. source breakdown
8. recent activity

### Dashboard layout rules
- the top section must contain the highest-value summary
- major financial numbers must be visible without scrolling
- supporting detail should be grouped below or beside the summary
- the dashboard should not have too many equally loud blocks
- avoid symmetrical “same weight everywhere” layouts
- major summaries should be larger and calmer than supporting widgets

### Dashboard anti-patterns
Reject dashboards that:
- show too many cards with equal emphasis
- hide the most important number
- use charts before core metrics are understood
- make the user search for the target or remaining amount
- over-fragment the screen into many tiny panels
- look like a BI tool instead of a personal control panel

---

## Card Rules

Cards are allowed, but card overload is not.

### Good card usage
Use cards for:
- key summaries
- grouped data
- source balances
- expected funds
- FX overview
- recent activity blocks

### Card behavior rules
- each card must have a clear purpose
- cards must not become generic containers for everything
- cards must have consistent internal spacing
- cards must not rely on heavy shadows for separation
- card titles and numbers must have strong hierarchy
- secondary metadata must be visually quieter

### Card anti-patterns
Reject cards that:
- contain too many unrelated elements
- are visually loud without adding clarity
- use weak padding
- mix 3+ hierarchy levels badly
- have unclear action placement
- look like duplicated template placeholders

---

## Table Rules

Tables are useful in this product, especially for operations and expected funds.

### Table principles
- tables must remain highly readable
- row density should be efficient but not cramped
- alignment must be intentional
- numbers must be easy to compare vertically
- actions should not dominate the row
- headers should be useful, not decorative

### Table design rules
- numeric columns must align consistently
- currency and amount relationships must be immediately understandable
- supporting text should not overpower numeric values
- row hover and selection states must be subtle and premium
- filters must be clean and not overcomplicate the layout

### Table anti-patterns
Reject tables that:
- feel like raw database grids
- have too many visible borders
- have poor numeric alignment
- mix too many text styles inside rows
- bury important columns among low-value fields

---

## Form Rules

Forms must feel premium, structured, and trustworthy.

### Form behavior
- forms should be calm and explicit
- labels must be clear
- field grouping must be meaningful
- destructive or important actions must be visually distinguishable
- validation must be understandable, not noisy

### Form layout
- group fields by meaning, not by arbitrary symmetry
- avoid overlong forms where possible
- keep field widths intentional
- money-related inputs must feel especially precise
- exchange and conversion forms must surface rate context clearly

### Form anti-patterns
Reject forms that:
- look like generic admin CRUD
- stack too many unrelated inputs in one block
- hide important financial context
- use placeholder-only labeling
- use inconsistent spacing or widths
- make exchange operations feel ambiguous

---

## Data Visualization Rules

Charts are optional and secondary.

This product is not chart-first.

### Use charts only when they help answer a real question:
- progress over time
- FX loss trend
- balance distribution by source

### Chart rules
- charts must support a concrete decision
- charts must not replace direct key metrics
- charts must be visually restrained
- chart colors must not overpower the interface
- avoid decorative chart-heavy dashboards

### Prefer:
- simple line charts
- restrained bar charts
- compact visual summaries

### Avoid:
- donut charts for everything
- 3D charts
- highly saturated multi-series clutter
- charts that repeat numbers already shown more clearly elsewhere

---

## Color Rules

Color must support meaning, not entertain the user.

### Color principles
- use a restrained palette
- maintain strong contrast for important metrics
- use accent colors intentionally
- reserve semantic colors for states and meaning
- avoid high-saturation overload

### Color usage
Use color primarily for:
- status
- emphasis
- progress
- alerts
- positive/negative delta meaning
- subtle structural separation

### Avoid
- rainbow dashboards
- too many accent colors
- bright colors on every card
- semantic confusion between informational and critical states
- decorative gradients that reduce trust

### Financial meaning
- positive values should feel stable, not celebratory
- warnings should feel controlled, not alarming
- losses should be clear but not visually aggressive
- borrowed funds should be visually distinct from own savings

---

## Spacing Rules

Spacing is one of the main tools for making the UI feel premium.

### Spacing principles
- use spacing to group meaning
- more space between groups than within groups
- keep rhythm consistent
- avoid arbitrary spacing jumps
- preserve calmness

### Rules
- internal component spacing must be systematic
- section spacing must clearly signal structure
- dense data can exist, but must still breathe
- spacing must not feel accidental

### Reject
- cramped layouts
- inconsistent padding
- cards with shallow interiors
- sections that visually blend into each other
- overly stretched layouts with weak grouping

---

## Typography Rules

Typography must create trust and hierarchy.

### Principles
- important numbers must be visually unmistakable
- section titles must be clear but not oversized for no reason
- metadata must be quieter
- labels must remain readable
- text styles must stay limited and systematic

### Use typography to distinguish:
- page title
- section title
- primary metric
- secondary metric
- label
- supporting note
- muted metadata

### Avoid
- too many font weights
- too many font sizes
- weak contrast between primary and secondary text
- tiny muted labels that hurt readability
- decorative heading styles with no structural value

---

## Interaction Rules

Interactions must feel premium and calm.

### Principles
- smooth, not flashy
- clear, not dramatic
- intentional, not busy
- subtle motion, not performative motion

### Required interaction qualities
- obvious hover states
- clean focus states
- polished pressed states
- clear disabled states
- structured loading states
- meaningful success/error feedback

### Motion
- use motion sparingly
- motion should explain transitions, not decorate them
- avoid excessive bounce, dramatic entrance animations, and noisy microinteractions

---

## Empty, Loading, and Error State Rules

These states must be designed from the start.

### Empty states
- should feel intentional
- should explain what to do next
- should not look like missing UI
- should preserve premium product feel

### Loading states
- should be calm and structured
- prefer skeletons or subtle placeholders where appropriate
- avoid chaotic spinners everywhere

### Error states
- should be clear and respectful
- should not destroy layout consistency
- should guide recovery when possible

---

## Auth Screen Rules

Authentication is part of the product experience.

### Requirements
- auth screens must feel premium
- they must visually belong to the same product
- they must not feel like Firebase defaults
- they must remain minimal and focused
- Google and email/password options should be cleanly presented

### Reject
- bland default login cards
- weak spacing
- no hierarchy
- visual mismatch between login and dashboard

---

## Premium UI Quality Bar

Every generated screen must pass this test:

### It should feel:
- calm
- expensive
- clean
- intentional
- modern
- trustworthy
- structured
- product-grade

### It should not feel:
- noisy
- playful in the wrong way
- over-decorated
- generic
- template-derived
- rushed
- admin-like
- spreadsheet-like

---

## AI Generation Rules

When generating UI, the AI must:

1. Start from information hierarchy, not decoration
2. Prioritize the most important financial questions first
3. Use restrained visual language
4. Reuse consistent spacing and card logic
5. Keep components visually coherent across screens
6. Prefer fewer, stronger layout ideas
7. Make the interface feel like one product
8. Avoid low-trust visual shortcuts
9. Design for decision-making, not screen-filling
10. Keep all screens premium, including auth, forms, tables, and empty states

---

## Screen-Level Rules

### Goal Screen
Must feel simple, high-confidence, and intentional.
No excessive steps.
The target amount must feel important.

### Savings Sources Screen
Must make source balances easy to scan and compare.
Currency context must never be ambiguous.

### Expected Funds Screen
Must clearly distinguish external support from own money.
Status must be easy to understand.

### Operations Screen
Must feel structured and auditable.
The user should trust the history instantly.

### Exchange Flow
Must feel precise.
Inputs, rates, and FX impact must be extremely clear.

### Dashboard
Must feel like the financial command center.
This is the most important product surface.

---

## Hard Design Rejections

Reject any generated UI that includes:
- top horizontal header or navigation bar
- dual navigation (sidebar + top bar)
- generic template dashboard layout
- equal emphasis on all cards
- too many widgets above the fold
- weak hierarchy
- excessive gradients
- glowing cards
- neon fintech styling
- cluttered filters
- table-heavy admin appearance
- inconsistent spacing
- poor typography scale
- low-contrast critical metrics
- default-looking login page
- decorative charts without decision value
- too many colors competing for attention
- ambiguous distinction between own money and borrowed funds

---

## Final Rule

A screen is successful only if it looks like a premium, trustworthy, carefully designed financial product.

Not just “nice”.
Not just “modern”.
Not just “clean”.

It must look like:
- a real SaaS product
- with strong hierarchy
- strong judgment
- and consistent design discipline