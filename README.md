# GSAP Scroll Experience (React) — Photos Intro + Carousel + Quotes + Key Figures + CTA

This project is a **desktop “scroll-driven screens” experience** powered by **GSAP + ScrollTrigger + SplitText**, with a **mobile fallback** that switches to normal page flow.

---

## Table of Contents
- [Overview](#overview)
- [Stack](#stack)
- [How the Experience Works](#how-the-experience-works)
- [Components](#components)
  - [App (Controller)](#app-controller)
  - [Photos (Intro Screen)](#photos-intro-screen)
  - [Carousel (Screen 2)](#carousel-screen-2)
  - [Quotes (Screen 3)](#quotes-screen-3)
  - [KeyFigures (Screen 4)](#keyfigures-screen-4)
  - [CTA (Screen 5)](#cta-screen-5)
- [Desktop Scroll Paging Logic](#desktop-scroll-paging-logic)
- [Animations](#animations)
  - [Background Scale](#background-scale)
  - [Photos Intro (Images → Text)](#photos-intro-images--text)
  - [Scroll Hint Bounce](#scroll-hint-bounce)
  - [Carousel 3D Timeline](#carousel-3d-timeline)
  - [Key Figures Floating Timeline](#key-figures-floating-timeline)
  - [Global Progress Bar](#global-progress-bar)
- [Mobile Fallback](#mobile-fallback)
- [CSS Notes (Important Classes & Variables)](#css-notes-important-classes--variables)
- [Assets](#assets)
- [Tips / Gotchas](#tips--gotchas)

---

## Overview

### Desktop (≥ 901px)
- Each section (`.screen`) is **fixed** to the viewport.
- Scroll is simulated using a large spacer (`.scroll-spacer`) whose height is `#screens * 100vh`.
- A single `ScrollTrigger` tracks overall progress and activates screens.
- Screen-specific GSAP timelines (Carousel / KeyFigures) are driven by the same global scroll progress.

### Mobile (≤ 900px)
- The layout switches to **normal page flow**:
  - `.screen { position: relative; height: auto; opacity: 1; }`
  - `.scroll-spacer` is removed.
  - Any ScrollTriggers are killed.
  - Global progress bar is hidden.

---

## Stack
- React
- GSAP (`gsap`)
- GSAP ScrollTrigger (`gsap/ScrollTrigger`)
- GSAP SplitText (`gsap/SplitText`)


---

## How the Experience Works

1. The app loads with **body scrolling locked** (overflow hidden).
2. `Photos` (screen 0) runs its intro automatically.
3. When Photos is done it calls `onIntroDone()`:
   - Unlocks scroll
   - Initializes the desktop scroll experience (if not already initialized)
4. `ScrollTrigger` drives:
   - Which `.screen` is active
   - Carousel timeline progress while in screen 2 range
   - Key Figures timeline progress while in screen 4 range
   - Global progress indicator percentage
5. If the user scrolls back to the top on desktop, Photos intro can replay.

---

## Components

### App (Controller)
**File:** `App.jsx`

**Responsibilities**
- Registers GSAP plugins: `ScrollTrigger`, `SplitText`.
- Initializes desktop scroll paging using `gsap.matchMedia()` to split behavior:
  - `"(min-width: 901px)"` → desktop experience
  - `"(max-width: 900px)"` → mobile fallback
- Controls:
  - Background scaling on scroll
  - Global progress bar
  - Carousel motion timeline setup
  - Key figures motion timeline setup
  - Active screen switching rules
  - Replay logic when returning to top

**Key refs**
- `photosRef` → calls Photos imperative methods (`playIntro`, `resetToStart`)
- `bgRef` → background scaling animation
- `carouselTlRef` / `keyFiguresTlRef` → timelines driven by scroll progress
- `mmRef` → stores matchMedia instance to revert on unmount

---

### Photos (Intro Screen)
**File:** `sections/Photos.jsx`

**What it does**
- Animates floating photos in/out using CSS variables `--dx/--dy` (animated) and `--fx/--fy` (final positions).
- Fades images away at the end and reveals center title/subtitle.
- Uses `SplitText` to animate title/subtitle line-by-line with masked lines.
- Shows a scroll hint icon that bounces until the user scrolls.

**Imperative API (forwardRef)**
```js
photosRef.current.playIntro()
photosRef.current.resetToStart()
