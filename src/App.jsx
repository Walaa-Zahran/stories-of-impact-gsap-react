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

  //  holds Carousel timeline so it’s accessible from onUpdate
  const carouselTlRef = useRef(null);

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

    const MIN_PROGRESS = 12; // initial fill when progress appears
    const CAROUSEL_TARGET = 50; // ✅ must reach 50% by end of Carousel

    const updateProgress = (activeIndex, localWithinScreen) => {
      if (!progressEl || !progressFill) return;

      if (activeIndex < startIndex) {
        progressEl.classList.remove("is-visible");
        progressFill.style.setProperty("--p", "0%");
        return;
      }

      progressEl.classList.add("is-visible");

      // total steps AFTER carousel (KeyFigures..CTA)
      const stepsAfterCarousel = Math.max(1, n - 1 - startIndex);

      // ✅ If we are on Carousel, fill smoothly up to 50%
      if (activeIndex === startIndex) {
        const t = typeof localWithinScreen === "number" ? localWithinScreen : 0;
        const pct = MIN_PROGRESS + (CAROUSEL_TARGET - MIN_PROGRESS) * t; // MIN -> 50
        progressFill.style.setProperty("--p", `${pct}%`);
        return;
      }

      // ✅ After Carousel: fill from 50% -> 100% step-by-step
      const stepIndex = Math.min(
        stepsAfterCarousel,
        Math.max(1, activeIndex - startIndex) // 1 for first screen after carousel
      );

      const pct =
        CAROUSEL_TARGET +
        (stepIndex / stepsAfterCarousel) * (100 - CAROUSEL_TARGET);
      progressFill.style.setProperty("--p", `${pct}%`);
    };

    const setupCarouselMotion = () => {
      const screen2 = document.querySelector("#screen-2");
      if (!screen2) return;

      const track = screen2.querySelector(".carousel__track");
      const cards = screen2.querySelectorAll(".story-card");
      const bgTextInner = screen2.querySelector(".carousel__bgTextInner");
      if (!cards.length) return;

      const getVar = (el, name) =>
        parseFloat(getComputedStyle(el).getPropertyValue(name)) || 0;

      // 3D space
      gsap.set(track, {
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
      });

      // ---- Cards start: tiny at center, stacked ----
      gsap.set(cards, {
        x: 0,
        y: 0,
        z: -180,
        scale: 0.12,
        opacity: 0,
        rotateX: 10,
        rotateY: -8,
        transformOrigin: "50% 50%",
        filter: "blur(4px)",
      });

      // ---- Text start: hidden + more blur ----
      if (bgTextInner) {
        gsap.set(bgTextInner, {
          opacity: 0,
          scale: 0.55,
          z: -120,
          filter: "blur(16px)",
        });
      }

      const tl = gsap.timeline({ paused: true });

      tl.to(cards, {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.12,
        ease: "none",
        stagger: { each: 0.03, from: "center" },
      });

      // TEXT: starts showing while cards begin (still blurry)
      if (bgTextInner) {
        tl.to(
          bgTextInner,
          {
            opacity: 0.4,
            scale: 1,
            z: 0,
            filter: "blur(8px)", // still blurry while the wave/spread starts
            duration: 0.55,
            ease: "power2.out",
          },
          0 // start at timeline beginning
        );
      }

      tl.to(cards, {
        scale: 0.9,
        z: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.28,
        ease: "power2.out",
        stagger: { each: 0.06, from: "center" },
      });

      tl.to(
        cards,
        {
          x: (i, el) => getVar(el, "--fx"),
          y: (i, el) => getVar(el, "--fy"),
          scale: 1,
          z: 35,
          duration: 0.38,
          ease: "power1.out",
          stagger: { each: 0.06, from: "center" },
        },
        "<+=0.02"
      );

      tl.to(
        screen2.querySelectorAll(".story-card--back"),
        { opacity: 0.55, duration: 0.2, ease: "none" },
        "<"
      );

      if (bgTextInner) {
        tl.to(bgTextInner, {
          opacity: 0.4,
          filter: "blur(4px)",
          duration: 0.2,
          ease: "none",
        });
      }

      tl.to({}, { duration: 0.18 });

      tl.to(cards, {
        x: (i, el) => getVar(el, "--fx") * 2.2,
        y: (i, el) => getVar(el, "--fy") * 2.2,
        z: 720,
        scale: 3.2,
        opacity: 0,
        duration: 0.55,
        ease: "power2.in",
        stagger: { each: 0.05, from: "center" },
      });

      // 5) TEXT becomes fully clear AFTER cards exit
      if (bgTextInner) {
        tl.to(bgTextInner, {
          opacity: 1,
          filter: "blur(0px)", //  crystal clear
          duration: 0.25,
          ease: "power1.out",
        });
      }

      carouselTlRef.current = tl;
      tl.progress(0);
    };

    setupCarouselMotion();

    // ----- active screen switching -----
    screens.forEach((s, i) => s.classList.toggle("is-active", i === 0));
    let active = 0;

    const setActive = (next) => {
      if (next === active) return;

      screens[active].classList.remove("is-active");
      screens[next].classList.add("is-active");

      // Leaving Photos -> remove final state (so Carousel doesn't show it)
      if (next !== 0) {
        screens[0].classList.remove("show-final-text");
        screens[0].classList.remove("show-scroll-hint");
        // keep or remove based on preference:
        // screens[0].classList.remove("images-hidden");
      }

      active = next;
      updateProgress(active);
    };
    // ----------------------------------

    const st = ScrollTrigger.create({
      trigger: spacer,
      start: "top top",
      end: () => `+=${window.innerHeight * n}`,
      scrub: true,
      onUpdate: (self) => {
        // --- screen switching logic (same as before) ---
        const raw = self.progress * n;
        let i = Math.floor(raw);
        i = Math.max(0, Math.min(n - 1, i));

        const localScreen = raw - i;

        // Force: once user scrolls even a tiny bit, go to Carousel
        if (i === 0 && self.progress > 0.0005) {
          setActive(1);
          updateProgress(1);
        } else {
          const exit = parseFloat(screens[i].dataset.exit || "0.99");
          if (i < n - 1 && localScreen >= exit) {
            setActive(i + 1);
          }

          const back = parseFloat(screens[i].dataset.back || "0.10");
          if (i > 0 && localScreen <= back) {
            setActive(i - 1);
          }

          setActive(i);
        }

        // ---  Carousel stack -> spread immediately after leaving y=0 ---
        const tl = carouselTlRef.current;
        if (tl) {
          // start anim immediately after leaving top
          const carouselStart = 0.0005;
          const carouselEnd = 1 / n; // finish within first "screen" scroll

          const local = gsap.utils.clamp(
            0,
            1,
            (self.progress - carouselStart) / (carouselEnd - carouselStart)
          );

          tl.progress(local);
          updateProgress(1, local);
          if (active !== 1) {
            updateProgress(active);
          }
        }
      },
    });

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    ScrollTrigger.refresh(true);

    updateProgress(active);

    return () => {
      window.removeEventListener("resize", onResize);
      st.kill();

      carouselTlRef.current?.kill();
      carouselTlRef.current = null;
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

    // allow future replays
    replayStateRef.current.isReplaying = false;

    initScrollExperience();
  };

  // Replay intro when user returns to top (loop behavior)
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
