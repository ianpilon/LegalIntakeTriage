# Legal Intake & Triage Platform - Design Guidelines

## Design Approach

**Selected System**: Modern Enterprise Design Language inspired by Linear, Notion, and Asana
**Rationale**: This is a utility-focused enterprise productivity tool requiring clarity, efficiency, and trust. The conversational AI elements need warmth without sacrificing professionalism, while the legal team interface demands information density and scanning efficiency.

**Core Principles**:
1. **Professional Approachability**: Reduce legal intimidation while maintaining credibility
2. **Adaptive Clarity**: Visual distinction between confidence modes without cognitive overload
3. **Efficient Transparency**: Dense information presented with clear hierarchy
4. **Conversational Warmth**: AI interactions feel helpful, not robotic

---

## Color Palette

### Light Mode
- **Primary Brand**: 215 85% 35% (Deep professional blue - trust, authority)
- **Primary Hover**: 215 85% 30%
- **Secondary Accent**: 160 50% 45% (Muted teal - success, guidance)
- **Background**: 0 0% 100% (Pure white)
- **Surface**: 220 15% 97% (Subtle warm gray)
- **Surface Elevated**: 0 0% 100% (White cards)
- **Border**: 220 15% 90%
- **Text Primary**: 220 25% 15%
- **Text Secondary**: 220 15% 45%
- **Text Tertiary**: 220 10% 65%

### Dark Mode
- **Primary Brand**: 215 75% 55%
- **Primary Hover**: 215 75% 60%
- **Secondary Accent**: 160 45% 50%
- **Background**: 220 20% 8%
- **Surface**: 220 18% 12%
- **Surface Elevated**: 220 16% 15%
- **Border**: 220 15% 22%
- **Text Primary**: 0 0% 95%
- **Text Secondary**: 220 10% 70%
- **Text Tertiary**: 220 8% 50%

### Semantic Colors
- **Success**: 140 60% 45% (Knowledge base resolution)
- **Warning**: 35 85% 55% (Might need review)
- **Info**: 200 80% 50% (Likely fine outcome)
- **Urgent**: 355 75% 50% (High priority indicators)

---

## Typography

**Font Stack**: Inter (via Google Fonts CDN) - geometric clarity with professional warmth

### Hierarchy
- **Display (H1)**: 36px / 700 weight / -0.02em tracking (Platform name, major sections)
- **Heading (H2)**: 24px / 600 weight / -0.01em tracking (Section titles, mode headers)
- **Subheading (H3)**: 18px / 600 weight (Category titles, card headers)
- **Body Large**: 16px / 500 weight (Conversational prompts, primary content)
- **Body**: 14px / 400 weight / 1.6 line-height (Form labels, descriptions, article text)
- **Body Small**: 13px / 400 weight (Helper text, metadata, timestamps)
- **Caption**: 12px / 500 weight (Tags, status badges, hints)

**Conversational Text**: Use Body Large (16px) for AI questions/responses to increase readability and warmth

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 3, 4, 6, 8, 12, 16, 24**
- Micro spacing (elements): p-2, gap-3, space-x-2
- Component padding: p-4, p-6
- Section spacing: py-8, py-12, py-16
- Major layout gaps: gap-8, gap-12

**Container Strategy**:
- Main app container: max-w-7xl mx-auto
- Conversational interface: max-w-3xl (optimal reading width)
- Legal team inbox: max-w-full (utilize space for data tables)
- Forms: max-w-2xl

**Grid Patterns**:
- Category cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
- Knowledge base: grid-cols-1 md:grid-cols-2 gap-6
- Legal team dashboard: Flexible single column with nested grids

---

## Component Library

### Navigation
- **Top Bar**: Sticky header with logo left, user profile right, h-16, backdrop-blur-md with subtle border-b
- **Breadcrumbs**: Show context in multi-step flows (Home > Guided Discovery > Risk Assessment)

### Conversational Interface
- **Entry Prompt**: Large textarea (min-h-32) with placeholder "What are you working on?", subtle border focus ring
- **AI Messages**: Left-aligned with small avatar icon, bg-surface p-4 rounded-xl, max-w-prose
- **User Messages**: Right-aligned, bg-primary/10 text-primary, p-4 rounded-xl
- **Mode Toggle**: Prominent tabs or segmented control to switch between Direct/Guided modes

### Direct Path Categories
- **Category Cards**: Hover-lift effect, flex items-center gap-3, p-6 rounded-lg border-2, icon + title + brief description
- **Icons**: Use Heroicons outline style (24px) - neutral, professional, clear
- **Selected State**: border-primary bg-primary/5

### Forms
- **Input Fields**: h-11, px-4, rounded-md, border focus:ring-2 focus:ring-primary/20
- **Labels**: text-sm font-medium mb-2 text-secondary
- **File Upload**: Drag-drop zone with dashed border-2, hover:bg-surface transition, 120px min-height
- **Progressive Disclosure**: Smooth height transitions, show/hide with opacity + transform

### Status & Tracking
- **Status Badges**: px-3 py-1 rounded-full text-xs font-medium with semantic colors (Submitted, Triaged, In Review, Complete)
- **Timeline**: Vertical line connector with circular nodes, completed steps filled with primary color
- **Attorney Card**: Small avatar (40px), name + role, estimated timeline with clock icon
- **SLA Indicator**: Progress bar showing days elapsed/remaining

### Legal Team Interface
- **Request Cards**: Compact horizontal layout (avatar | summary | metadata | actions), border-l-4 with priority color coding
- **Filters**: Chip-style multi-select with count badges
- **Quick Actions**: Icon buttons (reassign, flag, close) with tooltips
- **AI Summary Section**: bg-info/5 border-l-4 border-info, italic text to distinguish AI-generated content

### Knowledge Base
- **Article Cards**: Icon badge top-left, title (font-semibold), excerpt (2 lines truncated), "5 min read" metadata
- **Search**: Prominent search bar with autocomplete dropdown
- **Feedback**: Inline thumbs up/down with "Was this helpful?" text

### Buttons
- **Primary**: bg-primary text-white hover:bg-primary-hover, h-10 px-6 rounded-md font-medium
- **Secondary**: border-2 border-primary text-primary hover:bg-primary/5
- **Ghost**: text-primary hover:bg-primary/10
- **Outline on images**: backdrop-blur-md bg-white/10 border border-white/20 (no manual hover states)

### Overlays
- **Modals**: max-w-2xl, backdrop-blur, rounded-xl, shadow-2xl
- **Tooltips**: bg-gray-900 text-white text-xs px-3 py-2 rounded, positioned contextually
- **Notifications**: Toast style (top-right), slide-in animation, auto-dismiss after 5s

---

## Animations

**Minimal, purposeful motion only**:
- Page transitions: 150ms opacity fade
- Card hover: translate-y-[-2px] with shadow increase (200ms ease)
- Loading states: Subtle pulse on skeleton screens
- Status updates: 300ms color transition
- Mode switching: Crossfade between interfaces (250ms)

**No**: Elaborate scroll animations, parallax, or decorative motion

---

## Images

**Hero Section**: NOT applicable - this is a web application, not a marketing site
**Avatar Images**: Use placeholder circles with initials for users and attorneys (40px standard, 56px for featured)
**Iconography**: Heroicons throughout (outline for inactive, solid for active states)
**Illustrations**: Optional small spot illustrations for empty states (e.g., "No pending requests" with friendly graphic)

**No hero images needed** - focus on functional interface elements from the start

---

## Accessibility & Polish

- Maintain WCAG AA contrast ratios (4.5:1 text, 3:1 UI components)
- Focus visible: 2px offset ring-primary/50
- Dark mode: Ensure form inputs have visible borders (border-white/10)
- Keyboard navigation: All interactive elements focusable, logical tab order
- Loading states: Show skeleton screens matching final content layout
- Error states: Inline validation with error color and descriptive text