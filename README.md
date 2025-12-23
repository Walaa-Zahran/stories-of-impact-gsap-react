# GSAP Scroll Experience (React)
**Photos Intro → Carousel → Quote → Key Figures → CTA**  
Desktop: scroll-driven “paged screens” • Mobile: normal vertical page

---

## Overview

This project creates a **desktop scroll storytelling experience** using **GSAP + ScrollTrigger + SplitText**:

- **Desktop (≥ 901px)**  
  - Every `.screen` is **fixed** to the viewport (one screen visible at a time).
  - A `.scroll-spacer` simulates scrolling by providing a tall scroll area.
  - A single `ScrollTrigger` calculates scroll progress and:
    - toggles active screens
    - scrubs the Carousel animation timeline
    - scrubs the Key Figures animation timeline
    - updates a global progress bar

- **Mobile (≤ 900px)**  
  - The layout becomes **normal page flow** (screens stack vertically).
  - ScrollTrigger and desktop timelines are killed.
  - The global progress indicator is hidden.

---

## Tech Stack

- **React**
- **GSAP**
- **ScrollTrigger** (`gsap/ScrollTrigger`)
- **SplitText** (`gsap/SplitText`)


---

## What You Get

### Screen Flow
1. **Photos (Screen 0)**: Intro animation (images expand + fade → text reveal)
2. **Carousel (Screen 2)**: 3D card motion + background text sequence
3. **Quotes (Screen 3)**: Centered quote
4. **Key Figures (Screen 4)**: Floating stat cards motion
5. **CTA (Screen 5)**: End screen with buttons

### Extras
- **Intro replay** when returning to top on desktop
- **Global progress bar** (desktop only)
- **Background scale** animation during scroll (desktop only)
- **Scroll hint bounce** until the user interacts

---

## How Desktop Scroll Paging Works

### Fixed screens
Each `.screen` is fixed and hidden by default:

- `.screen` → hidden (opacity 0, no pointer events)
- `.screen.is-active` → visible and interactive

### Scroll spacer
A `.scroll-spacer` element becomes the scroll area. Its height is set to:

```

#screens * 100vh

````

### Active screen selection
A single `ScrollTrigger` computes which screen should be active based on overall scroll progress:
- `i = floor(progress * n)` (clamped)
- `localWithinScreen = (progress * n) - i`

Then it uses:
- `data-exit` to move forward
- `data-back` to move backward

---

## Components

### 1) `App` (Controller)
**Responsibilities**
- Registers GSAP plugins (`ScrollTrigger`, `SplitText`)
- Uses `gsap.matchMedia()` to split behaviors:
  - Desktop: full scroll experience
  - Mobile: stacked layout fallback
- Sets up:
  - background scaling
  - global progress
  - Carousel timeline
  - Key Figures timeline
  - screen activation logic
  - intro replay when returning to top

**Important refs**
- `photosRef` → calls Photos imperative methods (`playIntro`, `resetToStart`)
- `bgRef` → background scaling animation target
- `carouselTlRef`, `keyFiguresTlRef` → scrubbed GSAP timelines
- `mmRef` → matchMedia cleanup (`revert()`)

---

### 2) `Photos` (Intro Screen)
**What it does**
- Animates a group of images outward using CSS custom properties:
  - `--dx`, `--dy` animated values
  - `--fx`, `--fy` final target offsets defined in CSS
- Fades images out near the end
- Reveals center headline + subtitle using **SplitText lines**
- Shows a scroll hint, with a bouncing icon, until user interaction

**Imperative API (forwardRef)**
```js
photosRef.current.playIntro();
photosRef.current.resetToStart();
````

**Key details**

* Runs intro on mount (`useLayoutEffect`)
* On completion:

  * adds `.images-hidden` (hides the floating images)
  * adds `.show-final-text` (reveals center text)
  * starts scroll hint bounce
  * calls `onIntroDone()` so App unlocks scrolling + initializes ScrollTrigger

---

### 3) `Carousel` (Screen 2)

Static markup that gets animated by the **App timeline**.

**Elements**

* `.carousel__track` (3D stage)
* `.story-card` cards (positioning uses `--fx/--fy`)
* `.carousel__bgTextInner` background text animation layer
* `.carousel_paragraph` is split into lines and animated in/out

---

### 4) `Quotes` (Screen 3)

A simple centered quote section.

---

### 5) `KeyFigures` (Screen 4)

Static markup animated by the **App timeline**.

**Position + motion uses CSS vars**

* `--fx`, `--fy` final placement
* `--ox`, `--oy` animated offsets (collapsed start / fly-out)
* `--k` scale multiplier (timeline controlled)

---

### 6) `CTA` (Screen 5)

Final call-to-action screen with two buttons.

---

## Animation Breakdown

### Background scale (Desktop)

The fixed `.bg-layer` scales as you scroll to a chosen end screen.

---

### Photos intro (Screen 0)

**Stage 1 — images expand and settle**

* Images start collapsed at center.
* GSAP animates their `--dx/--dy` based on `--fx/--fy`.

**Stage 2 — images fade out**

* Near the end, images fade and `.images-hidden` is applied.

**Stage 3 — text reveal**

* Headline + subtitle are split into lines with SplitText.
* Lines animate upward into view using a mask wrapper (`.line-mask`).

---

### Scroll hint bounce

After intro:

* `.show-scroll-hint` is added
* The scroll icon bounces until:

  * wheel scroll
  * touch move
  * key press (arrows, page up/down, home/end, space)

---

### Carousel 3D timeline (Screen 2)

Cards start:

* tiny, blurry, low opacity, pushed back in Z, slightly rotated

Timeline flow:

1. Fade in cards + remove blur
2. Show background text (scale/blur/opacity)
3. Cards scale up and flatten rotations
4. Cards move to final `--fx/--fy`
5. Brief hold
6. Cards fly outward (x/y multiplied, z forward, scale up, fade out)
7. Paragraph lines split + animate in, then animate out

---

### Key Figures floating timeline (Screen 4)

Cards start:

* offset opposite their final position (`--ox = -fx`, `--oy = -fy`)
* small scale (`--k`)
* z pushed back, blurred, hidden

Timeline flow:

1. Fade in + remove blur
2. Scale up + move forward
3. Settle into final positions (`--ox/--oy` → 0)
4. Fly out (offset increases, scale up, z forward, fade out)

---

### Global progress bar (Desktop)

* Hidden before `startIndex` (screen 1).
* During Carousel, progress maps from a minimum value to a target (ex: 12% → 50%).
* Remaining screens fill 50% → 100%.

---

## Mobile Fallback (≤ 900px)

When the viewport is ≤ 900px:

* `.screen` becomes `position: relative` and stacks normally
* `.scroll-spacer` height becomes `0`
* All ScrollTriggers are killed
* Carousel/KeyFigures timelines are killed
* Global progress is hidden

Mobile CSS uses forced visibility:

```css
@media (max-width: 900px) {
  .screen {
    position: relative;
    height: auto;
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
  }
  .scroll-spacer { height: 0 !important; }
}
```

---

## CSS Notes (Important Classes & Variables)

### Photos / Impact

* `.impact__img` uses:

  * `--fx`, `--fy` (final positions)
  * `--dx`, `--dy` (animated positions)
* `.screen.images-hidden` hides floating images
* `.screen.show-final-text` reveals `.impact__center`
* `.screen.show-scroll-hint` reveals `.scroll-hint`

### Carousel

* `.story-card` final layout uses `--fx`, `--fy`
* `.carousel__track` is the 3D stage

### Key Figures

* `.figure-card--pos` transform uses:

  * translate by `--fx/--fy` + `--ox/--oy`
  * scale by `--s * --k`

---

## Assets

Expected directories:

* `/assets/images/*`
* `/assets/fonts/poppins/*`

Common assets referenced:

* `/assets/images/ptrn.png`
* `/assets/images/bg.svg`
* `/assets/images/scroll.png`
* `/assets/images/people-*.png|jpg`
* `/assets/images/carousel-*.png`

---

## Cleanup & Gotchas

* **Always revert SplitText** on cleanup to avoid DOM nesting buildup:

  * `split.revert()`
* **Kill GSAP timelines** on unmount / mode switch:

  * `tl.kill()`
* **Revert matchMedia** to clear desktop-only triggers:

  * `mm.revert()`
* **Call `ScrollTrigger.refresh()`** on resize for accurate measurements.

---

