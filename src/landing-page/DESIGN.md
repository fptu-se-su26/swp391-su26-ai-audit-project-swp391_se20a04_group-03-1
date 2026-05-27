---
name: LogiPort Design System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#00687a'
  on-secondary: '#ffffff'
  secondary-container: '#57dffe'
  on-secondary-container: '#006172'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001a42'
  on-tertiary-container: '#3980f4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  section-padding-desktop: 120px
  section-padding-mobile: 64px
  gutter: 24px
  container-max: 1280px
---

## Brand & Style
The design system for LogiPort is built on a foundation of **Modern Corporate** aesthetics mixed with **High-Tech Precision**. It targets logistics operators, port authorities, and tech-savvy supply chain managers who require a sense of absolute reliability and forward-thinking innovation.

The visual style utilizes a "Clean-Tech" approach: heavy white space to ensure clarity of information, paired with high-contrast typography that commands authority. Subtle glassmorphism is used for secondary interface elements to imply a "digital-first" transparency, while deep industrial blues ground the brand in the world of heavy infrastructure.

The emotional response should be one of **trust, speed, and intelligence**. The UI doesn't just manage data; it orchestrates movement.

## Colors
The palette is dominated by a deep "Industrial Navy" (Primary) and a vibrant "Electric Cyan" (Secondary). This combination bridges the gap between traditional logistics and modern software.

- **Primary (#0F172A):** Used for typography, navigation backgrounds, and hero sections to provide weight and professionalism.
- **Secondary (#06B6D4):** Used for primary actions, data visualization highlights, and as a gradient component to represent data flow.
- **Tertiary (#3B82F6):** A bridge blue for secondary actions and information callouts.
- **Neutral (#F8FAFC):** A clean, cool-tinted white for backgrounds to maintain a high-contrast, airy feel.

Functional colors (Success, Warning, Error) should follow standard semantic patterns but utilize the same saturation levels as the secondary blue to remain cohesive.

## Typography
The typography system uses a tiered approach to balance character and utility. 

**Plus Jakarta Sans** is the hero font, providing a modern, geometric, and friendly yet professional feel for large headings. Its wide stance gives the brand a "stable" presence.

**Hanken Grotesk** is the workhorse for body copy, chosen for its exceptional legibility and contemporary proportions. 

**Geist** is used for technical labels, buttons, and monospaced data values, reinforcing the "tech-forward" developer-centric precision of the platform.

For mobile, headlines scale down aggressively to ensure they don't break across too many lines, while body copy remains large to preserve readability in outdoor port environments.

## Layout & Spacing
The layout follows a **12-column fixed grid** on desktop (1280px max-width) to ensure content remains centered and readable on ultra-wide monitors. On tablet, this transitions to an 8-column fluid grid, and a 4-column fluid grid on mobile.

We employ a **generous whitespace philosophy**. Vertical rhythm is based on 8px increments. Sections are separated by large 120px gaps to allow the eye to rest and to signify clear shifts in content.

Internal component spacing (padding within cards and buttons) should be tight and precise to contrast with the expansive layout spacing, creating a "macro-breathable, micro-functional" dynamic.

## Elevation & Depth
This design system uses **Tonal Layers** combined with **Backdrop Blurs** to create hierarchy. 

1.  **Level 0 (Base):** Neutral background (#F8FAFC).
2.  **Level 1 (Cards):** Pure white surfaces with an extremely soft, large-radius shadow (Blur: 40px, Opacity: 4%, Color: Primary Blue).
3.  **Level 2 (Interactive/Floating):** Use of backdrop filters (glassmorphism) for navigation bars and dropdowns. Use a `12px` blur with a `white/80%` tint.
4.  **Level 3 (Modals/Overlays):** Distinct shadows with a slight blue tint (Blur: 60px, Opacity: 10%, Color: Primary Blue) to lift elements off the page.

Avoid heavy borders; use subtle 1px "ghost" strokes (#E2E8F0) to define boundaries on white backgrounds.

## Shapes
The shape language is **Rounded**, utilizing a base radius of 8px (0.5rem). This softens the industrial tone of the brand and makes the software feel more modern and accessible.

- **Small Components (Checkboxes, Inputs):** 8px radius.
- **Medium Components (Buttons, Cards):** 16px (1rem) radius.
- **Large Components (Hero sections, Feature Blocks):** 24px (1.5rem) radius.

Icons should follow this logic, using a 2px stroke weight with rounded caps and joins to match the UI elements.

## Components
- **Buttons:** Primary buttons use the Cyan-to-Blue gradient with white text in `label-sm` (Geist). Secondary buttons use a transparent background with a 1px Primary color border.
- **Cards:** Feature cards should have a vertical layout, with an icon at the top (contained in a soft-tinted circle), followed by `headline-md` and `body-md` text.
- **Stats:** High-impact numbers (like "99.9%") should use `display-lg` and can utilize a gradient fill to draw the user's eye immediately.
- **Input Fields:** Use a subtle background (#F1F5F9) rather than a white background to clearly distinguish the interactive area. The focus state uses a 2px Cyan glow.
- **Chips/Badges:** Use a "Pill" shape (fully rounded) with Geist font for metadata labels or status indicators.
- **Lists:** Use custom icons instead of standard bullets. Each list item should have generous vertical padding (16px) and a bottom divider line.