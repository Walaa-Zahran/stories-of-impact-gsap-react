// src/App.jsx
import { useLayoutEffect, useRef } from "react";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import Carousel from "./sections/Carousel";
import Photos from "./sections/Photos";
import Headline from "./sections/Headline";
import Title from "./sections/Title";
import KeyFigures from "./sections/KeyFigures";
import CTA from "./sections/CTA";
import Quotes from "./sections/Quotes";

gsap.registerPlugin(ScrollTrigger);

const App = () => {
  const scrollInitRef = useRef(false);
  const photosRef = useRef(null);
  const bgRef = useRef(null);

  // used to prevent multiple replays while sitting at y=0
  const replayStateRef = useRef({ isReplaying: false });

  const initScrollExperience = () => {
    if (scrollInitRef.current) return;
    scrollInitRef.current = true;

    const screens = Array.from(document.querySelectorAll(".screen"));
    const spacer = document.querySelector(".scroll-spacer");
    if (!screens.length || !spacer) return;

    const n = screens.length;
    spacer.style.setProperty("--scrollH", `${n * 100}vh`);

    // Background scale on scroll (starts 1, grows smoothly)
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        scale: 2.2,
        ease: "none",
        transformOrigin: "50% 40%",
        scrollTrigger: {
          trigger: spacer,
          start: "top top",
          end: () => `+=${window.innerHeight * n}`,
          scrub: true,
        },
      });
    }

    // ---- Global progress (step-by-step, starts from Carousel screen) ----
    const progressEl = document.getElementById("globalProgress");
    const progressFill = document.getElementById("globalProgressFill");
    const startIndex = 1; // 0 = Photos, 1 = Carousel

    const updateProgress = (activeIndex) => {
      if (!progressEl || !progressFill) return;

      if (activeIndex < startIndex) {
        progressEl.classList.remove("is-visible");
        progressFill.style.setProperty("--p", "0%");
        return;
      }

      progressEl.classList.add("is-visible");

      const steps = Math.max(1, n - 1 - startIndex);
      const stepIndex = Math.min(steps, Math.max(0, activeIndex - startIndex));
      const percent = (stepIndex / steps) * 100;

      progressFill.style.setProperty("--p", `${percent}%`);
    };
    // -------------------------------------------------------------------

    screens.forEach((s, i) => s.classList.toggle("is-active", i === 0));
    let active = 0;

    const setActive = (next) => {
      if (next === active) return;

      screens[active].classList.remove("is-active");
      screens[next].classList.add("is-active");

      //  Leaving Photos -> remove final state (so Carousel doesn't show it)
      if (next !== 0) {
        screens[0].classList.remove("show-final-text");
        screens[0].classList.remove("show-scroll-hint");
        // keep or remove based on preference:
        // screens[0].classList.remove("images-hidden");
      }

      active = next;
      updateProgress(active);
    };

    const st = ScrollTrigger.create({
      trigger: spacer,
      start: "top top",
      end: () => `+=${window.innerHeight * n}`,
      scrub: true,
      onUpdate: (self) => {
        const raw = self.progress * n;
        let i = Math.floor(raw);
        i = Math.max(0, Math.min(n - 1, i));

        const local = raw - i;

        // Force: once user scrolls even a tiny bit, go to Carousel
        if (i === 0 && self.progress > 0.0005) {
          return setActive(1);
        }

        const exit = parseFloat(screens[i].dataset.exit || "0.99");
        if (i < n - 1 && local >= exit) return setActive(i + 1);

        const back = parseFloat(screens[i].dataset.back || "0.15");
        if (i > 0 && local <= back) return setActive(i - 1);

        setActive(i);
      },
    });
    // --- Carousel stack -> spread animation (Screen 2 only) ---
    const setupCarouselMotion = () => {
      const screen2 = document.querySelector("#screen-2");
      if (!screen2) return;

      const cards = screen2.querySelectorAll(".story-card");
      if (!cards.length) return;

      const getVar = (el, name) =>
        parseFloat(getComputedStyle(el).getPropertyValue(name)) || 0;

      gsap.set(cards, {
        x: 0,
        y: 0,
        scale: 0.96,
        opacity: 1,
        transformOrigin: "50% 50%",
      });

      const tl = gsap.timeline({ paused: true });

      tl.to(
        cards,
        {
          x: (i, el) => getVar(el, "--fx"),
          y: (i, el) => getVar(el, "--fy"),
          scale: 1,
          ease: "none",
          stagger: 0.12,
        },
        0
      ).to(".story-card--back", { opacity: 0.55, ease: "none" }, 0);

      //  Drive the timeline with global scroll progress, but ONLY during screen-2 segment
      ScrollTrigger.create({
        trigger: spacer,
        start: "top top",
        end: () => `+=${window.innerHeight * n}`,
        scrub: true,
        onUpdate: (self) => {
          // global progress 0..1
          const p = self.progress;

          // segment for screen index 1 (Carousel): [1/n .. 2/n]
          const segStart = 1 / n;
          const segEnd = 2 / n;

          // map p -> 0..1 within this segment
          const local = gsap.utils.clamp(
            0,
            1,
            (p - segStart) / (segEnd - segStart)
          );

          tl.progress(local);
        },
      });
    };

    setupCarouselMotion();

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    ScrollTrigger.refresh(true);

    updateProgress(active);

    return () => {
      window.removeEventListener("resize", onResize);
      st.kill();
    };
  };

  // lock at first load
  useLayoutEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prevOverflow);
  }, []);

  const handleIntroDone = () => {
    // unlock scroll after intro
    document.body.style.overflow = "";

    //  allow future replays
    replayStateRef.current.isReplaying = false;

    initScrollExperience();
  };

  //  Replay intro when user returns to top (loop behavior)
  useLayoutEffect(() => {
    let armed = window.scrollY > 10;

    const onScroll = () => {
      const y = window.scrollY;

      if (y > 10) armed = true;

      if (y === 0 && armed && !replayStateRef.current.isReplaying) {
        armed = false;
        replayStateRef.current.isReplaying = true;

        document.body.style.overflow = "hidden";

        // hard reset then replay
        photosRef.current?.resetToStart?.();
        photosRef.current?.playIntro?.();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="page">
      <div className="bg-layer" ref={bgRef} aria-hidden="true" />

      {/* Global bottom progress (appears starting from Carousel) */}
      <div className="progress" id="globalProgress" aria-hidden="true">
        <span className="progress__track"></span>
        <span className="progress__fill" id="globalProgressFill"></span>
      </div>

      <Photos ref={photosRef} onIntroDone={handleIntroDone} />
      <Carousel />

      {/* Add more screens later */}
      <KeyFigures />
      <Headline />
      <Title />
      <Quotes />
      <CTA />

      <div className="scroll-spacer" />
    </main>
  );
};

export default App;
