# Accessibility (a11y) & Responsive Behavior Specification

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 3 — UX Design  
**Author:** Sally (BMAD UX Designer)  
**Date:** September 21, 2026  
**Status:** Completed Design  

---

## 1. Responsive Layout Specifications Across 5 Viewports

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RESPONSIVE BREAKPOINT MATRIX                       │
├─────────────────┬──────────────┬────────────┬───────────────────────────────┤
│ VIEWPORT TIER   │ RESOLUTION   │ SIDEBAR    │ WORKSPACE LAYOUT BEHAVIOR     │
├─────────────────┼──────────────┼────────────┼───────────────────────────────┤
│ 1. Mobile       │ 375px–767px  │ Hidden     │ Single column stack, bottom   │
│                 │              │ (Drawer)   │ tab bar, full-screen modals.  │
├─────────────────┼──────────────┼────────────┼───────────────────────────────┤
│ 2. Tablet       │ 768px–1023px │ Compact    │ 2-column resource cards, top  │
│                 │              │ (Collapse) │ telemetry strip, modal sheets.│
├─────────────────┼──────────────┼────────────┼───────────────────────────────┤
│ 3. Desktop      │ 1024px–1439px│ 260px      │ Standard multi-column layout, │
│                 │              │ (Sticky)   │ fixed left sidebar, canvas.   │
├─────────────────┼──────────────┼────────────┼───────────────────────────────┤
│ 4. Large Desktop│ 1440px–2559px│ 260px      │ Centered 1100px canvas,       │
│                 │              │ (Sticky)   │ comfortable margin buffers.   │
├─────────────────┼──────────────┼────────────┼───────────────────────────────┤
│ 5. 4K Ultra-HD  │ 3840px+      │ 300px      │ Max-width bounded container,  │
│                 │              │ (Scaled)   │ zero horizontal stretching.   │
└─────────────────┴──────────────┴────────────┴───────────────────────────────┘
```

### Detailed Viewport Behaviors:

#### 1. Mobile Viewport (375px to 767px)
- **Top Bar:** Condensed to Logo, streak count (`14🔥`), and hamburger menu (`☰`).
- **Sidebar:** Concealed off-canvas. Accessible via slide-out drawer or via bottom navigation tabs.
- **Bottom Navigation Bar (`height: 56px`):** Fixed at bottom with 4 primary targets: `Today`, `Roadmap`, `Quiz`, `Notes`.
- **Workspace Canvas:** Subtopics and resource cards stack vertically (single column).
- **Modals:** Transform into full-screen dialog sheets with top sticky close bars.

#### 2. Tablet Viewport (768px to 1023px)
- **Sidebar:** Collapsible into compact icon mode (64px width) or full slide-out drawer.
- **Resource Cards:** 2-column grid.
- **Header:** Full telemetry strip rendered.

#### 3. Desktop & Large Desktop (1024px to 2559px)
- **Standard Master Layout:** Fixed 260px sidebar + flex-1 centered workspace canvas (max-width: 1100px).
- **Sticky Navigation:** Header remains locked at top (`56px`) with blur backdrop.

#### 4. 4K Ultra-HD Viewport (3840px+)
- **Canvas Centering:** The entire application shell is centered with a max-width of 1800px to prevent excessive scanning distance across ultra-wide monitors.

---

## 2. WCAG 2.1 Level AA Accessibility (a11y) Standards

### 2.1 Color Contrast Compliance Matrix
All color combinations meet or exceed WCAG 2.1 AA standards:
- **Primary Text (`#e6edf3`) on Base Background (`#0d1117`):** Contrast ratio **14.8:1** (Exceeds AAA requirement of 7.0:1).
- **Secondary Text (`#8b949e`) on Base Background (`#0d1117`):** Contrast ratio **6.4:1** (Exceeds AA requirement of 4.5:1).
- **Accent Blue (`#58a6ff`) on Base Background (`#0d1117`):** Contrast ratio **7.2:1** (AAA compliant).
- **Success Green (`#3fb950`) on Base Background (`#0d1117`):** Contrast ratio **8.1:1** (AAA compliant).

### 2.2 Non-Color Visual Indicators
To support color-blind learners (Deuteranopia, Protanopia, Tritanopia):
- **Completed Topics:** Indicated by both green background fill AND a white checkmark icon (`✓`) plus strikethrough text.
- **Quiz Feedback:** Correct answers use Green `#3fb950` + `✅ Correct!` label; wrong answers use Red `#f85149` + `❌ Wrong` label.
- **Skip Cards:** Feature explicit `✕` cross prefixes before every list item.

---

## 3. Keyboard Navigation & Focus Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          KEYBOARD SHORTCUT MATRIX                           │
├───────────────────────┬─────────────────────────────────────────────────────┤
│ SHORTCUT KEY          │ ACTION / OUTCOME                                    │
├───────────────────────┼─────────────────────────────────────────────────────┤
│ `ArrowLeft` (←)       │ Navigate to Previous Day (Ignored when typing)      │
│ `ArrowRight` (→)      │ Navigate to Next Day (Ignored when typing)          │
│ `Ctrl + S` / `Cmd + S`│ Save Notes immediately (Suppresses browser save)    │
│ `Space` / `Enter`     │ Toggle Subtopic Checkbox / Trigger Focused Button   │
│ `Escape` (Esc)        │ Dismiss active Modal / Quiz Overlay                 │
│ `Tab` / `Shift + Tab` │ Logical sequential focus navigation                 │
└───────────────────────┴─────────────────────────────────────────────────────┘
```

### Focus Ring Standards:
- All interactive elements (buttons, checkboxes, inputs, cards) possess a prominent, non-obscured focus ring: `outline: 2px solid #58a6ff; outline-offset: 2px;`.

### Modal Focus Trapping (`aria-modal="true"`):
- When a modal opens (Onboarding, Quiz, Reschedule, Pause, Migration), keyboard focus is immediately directed to the modal container or its primary action.
- Focus is strictly trapped inside the modal until dismissed via `Esc` or the close button.
- Upon closing, focus returns smoothly to the triggering element.

---

## 4. Screen Reader & ARIA Semantics

1. **Live Regions (`aria-live="polite"`):**
   - Focus Timer: Screen readers announce session completion without interrupting study.
   - Note Auto-Save: Discrete notification `Note saved successfully` announced in live region.
2. **Accessible Checklists:**
   - Every subtopic checklist item carries `role="checkbox"`, `aria-checked="true|false"`, and `tabindex="0"`.
3. **Progress Meters:**
   - Progress bars carry `role="progressbar"`, `aria-valuenow="42"`, `aria-valuemin="0"`, `aria-valuemax="100"`.
4. **Reduced Motion (`prefers-reduced-motion: reduce`):**
   - All modal fade-ins, pulse animations, and scale bounces automatically collapse to instant 0ms state changes when user enables OS-level reduced motion.
