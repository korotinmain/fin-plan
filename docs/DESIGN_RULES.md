# DESIGN_RULES.md

## Purpose

This file defines the visual design rules and UI/UX quality standards for the FinPlan preview and all future screens.

The goal is to preserve a **premium, modern, high-trust financial product experience**.

This project must not drift into:

- generic admin panel UI
- template-like SaaS dashboard design
- cluttered fintech visuals
- spreadsheet-looking interfaces
- low-quality CRUD forms

This design language should feel:

- premium
- calm
- sharp
- trustworthy
- structured
- consistent
- product-grade

---

## Core Design Direction

The product is a **house purchase readiness dashboard**.

It is not:

- a generic portfolio tracker
- a crypto trading app
- a bank admin panel
- a data-heavy spreadsheet wrapper

The interface must feel like a **personal capital command center**.

The UI should prioritize:

1. financial clarity
2. premium hierarchy
3. low visual noise
4. precise interaction patterns
5. confidence in every number and every action

---

## Visual Identity

### Style

The UI must keep the current preview direction:

- dark premium background
- soft layered depth
- subtle violet accent system
- restrained glow usage
- rounded surfaces
- elegant spacing
- modern enterprise-grade visual language

### Mood

The product should feel:

- serious
- expensive
- stable
- focused
- elegant
- controlled

It must not feel:

- playful
- over-animated
- neon-heavy
- noisy
- overly decorative
- template-generated

---

## Color Rules

### Base Palette

Use a dark surface-first system:

- deep navy / near-black background
- slightly lifted card surfaces
- soft border contrast
- muted secondary text
- white primary text

### Accent Color

Primary accent:

- violet / purple

Use accent color for:

- primary CTA buttons
- active navigation state
- progress emphasis
- selected states
- key highlights

Do not use accent color everywhere.

### Semantic Colors

Use semantic colors carefully:

- green → positive / healthy / available / confirmed
- orange → warning / pending / remaining / attention
- red / rose → loss / negative impact / gap / risk
- cyan → neutral supporting financial category when needed

Semantic colors must remain restrained.
Never let semantic colors overpower the layout.

### Prohibited Color Behavior

Reject:

- rainbow dashboards
- too many accent colors
- bright gradients everywhere
- high saturation on every component
- glowing every important block
- aggressive contrast that feels “crypto app”

---

## Typography Rules

### General Principles

Typography must create hierarchy, not decoration.

Use typography to clearly separate:

- page title
- section title
- primary metric
- secondary metric
- labels
- descriptions
- metadata

### Typography Hierarchy

#### Page Titles

- large
- strong
- clean
- high contrast
- visually calm

#### Major Metrics

- large and dominant
- immediately scannable
- never visually weak
- reserved for truly important numbers only

#### Secondary Text

- muted
- readable
- never too small
- never too low-contrast

### Typography Constraints

- avoid too many font sizes
- avoid excessive font weights
- avoid decorative heading styles
- avoid tiny labels that reduce trust
- avoid weak difference between primary and secondary text

---

## Layout Rules

### Global Layout

Keep the current product shell direction:

- left sidebar navigation
- wide content area
- strong page header
- summary-first layout
- supporting sections below

### Layout Priorities

Every screen must answer:

1. what this page is about
2. what the most important number is
3. what the user can do next
4. what details support the decision

### Page Structure

Recommended page order:

1. header
2. hero summary or major KPIs
3. supporting metric cards
4. analytical blocks / lists / charts
5. operational detail or tables
6. modal interactions for editing/creating

### Spacing

Spacing must feel:

- premium
- breathable
- deliberate
- consistent

Rules:

- more space between sections than inside sections
- consistent internal padding inside cards
- no cramped metric layouts
- no random empty space without structural meaning

---

## Sidebar Rules

The sidebar must remain:

- minimal
- premium
- easy to scan
- structurally calm

### Sidebar Behavior

- compact logo/product area at top
- navigation only
- no decorative clutter
- no unnecessary footer block
- active item must be obvious but restrained

### Sidebar Visual Rules

- subtle active background
- subtle active ring/border
- muted default items
- stronger hover state
- icons aligned consistently with labels

---

## Header Rules

Every page header must include:

- eyebrow / context label
- page title
- short supporting description
- one clear primary action if needed

### Header Action Rules

- one main CTA in header when relevant
- do not overload the header with multiple competing actions
- CTA must visually feel important but not oversized

---

## Card Rules

Cards are a core building block of this product.

### Card Design

Cards must have:

- soft rounded corners
- subtle border
- subtle surface separation
- clean internal padding
- no heavy decoration
- consistent rhythm

### Card Usage

Use cards for:

- key summaries
- grouped metrics
- source balances
- expected fund items
- modal inner sections
- operational records
- chart containers

### Card Constraints

Do not use cards as:

- random wrappers for everything
- a replacement for good hierarchy
- a way to cram too much information into one block

### Card Content Hierarchy

Inside a card:

1. label / context
2. main value
3. support note / explanation

If a card contains too many hierarchy levels, simplify it.

---

## Metric Rules

Metrics are the heart of the product.

### Metric Priorities

Metrics must clearly distinguish:

- target amount
- own savings
- expected borrowed funds
- total ready capital
- remaining gap
- FX loss
- progress %

### Visual Treatment

- important metrics must be larger
- supporting metrics must be smaller
- loss metrics should be clear but not visually dramatic
- borrowed funds must be distinct from own funds
- progress must be obvious and readable

### Metric Anti-Patterns

Reject:

- too many equally large metrics
- unclear primary KPI
- visually weak major numbers
- decorative numbers without context

---

## Chart Rules

Charts are allowed, but must remain secondary to direct numbers.

### Chart Purpose

Only show charts when they help answer a real question:

- how readiness grows over time
- how savings sources are distributed
- how FX losses accumulate

### Chart Style

Charts must be:

- minimal
- clean
- readable
- visually integrated with the product

### Chart Constraints

- no over-detailed chart chrome
- no unnecessary legends if labels already explain the data
- no bright, loud chart palettes
- no decorative data visualizations

### Current Preferred Chart Types

- soft area chart for growth
- donut chart for composition
- compact bar chart for loss tracking

---

## Table and List Rules

Tables and list blocks must feel premium and readable.

### General Rules

- avoid raw grid feel
- keep strong alignment
- maintain clean row spacing
- use muted secondary content
- make numeric values easy to compare

### Row Structure

Every row must have:

- primary item identity
- supporting explanation
- value or effect
- optional date/status

### Avoid

- too many visible borders
- cluttered row actions
- excessive icons
- equal emphasis on every cell

---

## Form Rules

Forms must feel precise and trustworthy.

### Input Design

Inputs must:

- be clearly labeled
- have enough padding
- have subtle contrast
- look premium in dark mode
- never feel like browser defaults

### Field Rules

- labels above fields
- optional hint below fields
- keep field groups logically clustered
- do not overload forms with too many columns
- money-related fields must feel especially clear

### Select Rules

Selects must visually match inputs.
No different styling language.

### Form Behavior

- fields should be grouped by meaning
- destructive ambiguity must be avoided
- calculations should be previewed where relevant
- exchange dialogs must surface the impact clearly

---

## Modal Rules

Modals are part of the premium experience.

### Modal Design

Modals must:

- feel clean and structured
- have strong title hierarchy
- maintain generous internal spacing
- include visible close action
- separate header, body, and footer clearly

### Modal Usage

Use modals for:

- review flows
- create flows
- edit flows
- exchange operations
- focused decision points

### Modal Constraints

Do not:

- overload modals with too many unrelated sections
- create giant form walls
- hide critical context inside dense layouts

---

## CTA Button Rules

### Mandatory Rule

**All CTA buttons must contain an icon.**

This applies to:

- header actions
- modal primary actions
- create buttons
- save buttons
- review buttons
- exchange actions
- edit actions

### CTA Structure

Preferred button content structure:

- icon
- label

Examples:

- `✦ Review plan`
- `✎ Edit balances`
- `＋ Add expected fund`
- `↔ Record exchange`
- `✓ Save changes`
- `→ Continue`

### Button Hierarchy

#### Primary CTA

- filled accent button
- clear icon
- strong text contrast
- reserved for the most important action in the area

#### Secondary / Ghost CTA

- lower emphasis
- still polished
- still contains icon if it is a CTA

### Button Constraints

- do not use text-only CTAs
- do not mix icon/no-icon patterns randomly
- do not use oversized icons
- do not let icon spacing feel inconsistent

---

## Interaction Rules

The interface must feel:

- smooth
- modern
- intentional
- calm

### Interaction States

All interactive elements must have:

- hover state
- active state
- focus state
- disabled state when relevant

### Motion

Motion must be subtle.
Use motion only to support clarity.

Avoid:

- bounce
- flashy transitions
- dramatic reveals
- playful interactions that reduce trust

---

## Empty, Loading, and Error States

These states must be designed with the same premium quality bar.

### Empty States

- intentional
- helpful
- visually integrated
- never “blank and broken”

### Loading States

- calm
- subtle
- layout-preserving

### Error States

- clear
- respectful
- useful
- never visually chaotic

---

## Content Rules

Text inside the UI must be:

- short
- clear
- product-oriented
- trustworthy
- financially precise

### Avoid

- vague labels
- generic dashboard text
- filler descriptions
- technical wording exposed to the user

### Prefer

- specific financial language
- plain-English descriptions
- labels that support quick scanning

---

## Premium Quality Checklist

Before approving any screen, confirm:

### Visual

- Does it feel premium?
- Does it feel calm and high-trust?
- Is the hierarchy strong?
- Is the spacing consistent?
- Is the color usage restrained?

### Product

- Does the screen answer a real user question?
- Is the most important number visually obvious?
- Are own funds and borrowed funds clearly separated?
- Is FX loss clearly understandable?

### Components

- Are cards consistent?
- Are forms clean?
- Are modals polished?
- Are buttons consistent?

### CTA

- Does every CTA include an icon?
- Is the primary action obvious?
- Is the action hierarchy clear?

If any answer is “no”, the design is not finished.

---

## Hard Rejections

Reject any UI that introduces:

- text-only CTA buttons
- inconsistent button icon usage
- generic admin panel styling
- crowded dashboards
- weak metric hierarchy
- too much glow
- loud gradients everywhere
- too many equal-priority cards
- low-contrast text
- visually noisy charts
- inconsistent modal styling
- inconsistent input/select styling
- spreadsheet-like raw tables
- decorative UI that adds no product value

---

## Final Rule

This product must always feel like a **premium financial product**, not a generic dashboard.

Every future screen must preserve:

- strong hierarchy
- premium restraint
- precise financial clarity
- consistent component language
- CTA buttons with icons
- elegant, trustworthy UI/UX
