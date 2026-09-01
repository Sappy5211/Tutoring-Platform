---
name: We the Travellers
colors:
  surface: '#f8f9ff'
  surface-dim: '#d7dae3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3fd'
  surface-container: '#ebeef7'
  surface-container-high: '#e5e8f1'
  surface-container-highest: '#dfe2eb'
  on-surface: '#171c22'
  on-surface-variant: '#3f4753'
  inverse-surface: '#2c3137'
  inverse-on-surface: '#edf1fa'
  outline: '#707884'
  outline-variant: '#bfc7d5'
  surface-tint: '#0061a7'
  primary: '#0061a7'
  on-primary: '#ffffff'
  primary-container: '#0096ff'
  on-primary-container: '#002d52'
  inverse-primary: '#a1c9ff'
  secondary: '#705d00'
  on-secondary: '#ffffff'
  secondary-container: '#fcd400'
  on-secondary-container: '#6e5c00'
  tertiary: '#9b4500'
  on-tertiary: '#ffffff'
  tertiary-container: '#e1752c'
  on-tertiary-container: '#4b1e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#a1c9ff'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#00487f'
  secondary-fixed: '#ffe16d'
  secondary-fixed-dim: '#e9c400'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#544600'
  tertiary-fixed: '#ffdbc9'
  tertiary-fixed-dim: '#ffb68d'
  on-tertiary-fixed: '#331200'
  on-tertiary-fixed-variant: '#763300'
  background: '#f8f9ff'
  on-background: '#171c22'
  surface-variant: '#dfe2eb'
typography:
  display-lg:
    fontFamily: Quicksand
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Open Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Open Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Open Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 80px
---

## Brand & Style

The design system is built to facilitate a sense of wonder and discovery for children and their parents. The brand personality is **Adventurous, Encouraging, and Accessible**, functioning as a digital travel companion for young learners. 

The visual style blends **Soft Minimalism** with **Tactile Modernism**. It prioritizes extreme legibility and cognitive ease, ensuring that educational content remains the focus while the interface provides a warm, supportive embrace. We use high-quality whitespace to prevent overstimulation, allowing the vibrant "travel-themed" accents to guide the eye through the learning journey. The emotional response is one of safety and excitement—a "digital playroom" where mistakes are part of the adventure.

## Colors

The palette is rooted in a "Safe" visual identity, utilizing a familiar sky-blue base that evokes the horizon and open air. This is complemented by a series of soft secondary colors designed to categorize information and provide positive reinforcement:

- **Primary (Sky Blue):** Used for navigation, primary actions, and core branding. It represents the "Path" forward.
- **Secondary (Sunny Yellow):** Used for highlights, achievements, and "Worked Example" indicators. It represents "Light" and understanding.
- **Tertiary (Friendly Orange):** Used for interactive elements that require attention or indicate movement (like "Next" buttons).
- **Mint Green:** Specifically reserved for success states, progress completion, and "Correct" feedback.

The background is a very soft, tinted off-white to reduce eye strain compared to pure white, maintaining a gentle contrast ratio for young readers.

## Typography

This design system employs a dual-font strategy to balance personality with performance. 

**Quicksand** is used for all headlines and display text. Its rounded terminals and geometric shapes mirror the "soft" geometry of the UI, making titles feel approachable rather than academic. 

**Open Sans** is used for all body text and instructional content. It was chosen for its high x-height and open apertures, which are essential for early readers. We use a slightly larger base size (18px for body-lg) to ensure that the "travellers" can digest information without fatigue. Line heights are generous to prevent text from feeling cramped.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with generous "breathing room." 

- **Desktop:** A 12-column grid with 24px gutters. Content is often centered in a 10-column container to prevent line lengths from becoming too long for young readers.
- **Mobile:** A 4-column grid with 16px margins.
- **Rhythm:** We use an 8px baseline grid. Spacing between sections (lg/xl) is intentionally large to clearly separate different learning modules or "stops" on the travel journey.

Padding inside components like cards and "Worked Examples" is kept consistent at `md` (24px) to ensure icons and text never feel crowded against the edges.

## Elevation & Depth

To maintain a friendly and non-intimidating environment, the design system avoids heavy, dark shadows. Instead, it uses **Tonal Layers** and **Ambient Tinted Shadows**.

1.  **Level 0 (Base):** The background color (`#F8FBFF`).
2.  **Level 1 (Cards/Content):** White surfaces with a very soft, diffused shadow tinted with the Primary color (e.g., `rgba(0, 150, 255, 0.08)`).
3.  **Level 2 (Interactive/Hover):** When a child interacts with a card or button, the shadow deepens slightly and the element shifts up by 2px, providing a tactile "clicky" feel.

Floating Action Buttons (FABs) or primary navigation anchors use a slightly higher elevation to suggest they sit "above" the map/content.

## Shapes

The shape language is defined by **Roundedness Level 2**. This creates a soft, organic feel that eliminates sharp "scary" corners, reinforcing the friendly brand personality.

- **Buttons & Inputs:** `0.5rem` (8px) radius.
- **Cards & Worked Example Boxes:** `1rem` (16px) radius for a container-like feel.
- **Progress Bars:** Fully pill-shaped (rounded-full) to symbolize a smooth path.
- **Selection Indicators:** Use a thick 3px stroke with rounded caps to emphasize the "hand-drawn" friendly nature of travel maps.

## Components

### Buttons & Actions
Primary buttons are large, using the Primary Sky Blue with white text. They feature a slight "bottom-heavy" border (2px) in a darker shade of blue to create a 3D effect that makes them look "pressable."

### Learning Cards
Cards use Level 1 elevation and white backgrounds. Each card should feature a travel-themed icon (e.g., a paper plane for "Quick Tips" or a compass for "Explore More") in the top left corner.

### Worked Example Boxes
These are the most distinct elements in the design system. They use a **Sunny Yellow** light fill with a thick (2px) dashed border. This visual "interruption" signals to the child that they should stop and look at the example.

### Progress Indicators
Progress is visualized as a "Route Map." Instead of a simple bar, use a dotted line where the "Traveller" (a small boat or plane icon) moves from point A to point B. Completed sections turn Mint Green.

### Input Fields
Forms and text inputs have a thick 2px border in a soft grey-blue, turning Primary Sky Blue when active. The labels always sit above the field in `label-lg` (Quicksand) to remain highly visible.

### Chips & Tags
Used for categorizing "Travel Zones" (Subjects). These are pill-shaped with light pastel backgrounds matching the category color, using `label-lg` typography.