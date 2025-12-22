import { useLayoutEffect, useRef } from "react";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";

import Photos from "./sections/Photos";
import Carousel from "./sections/Carousel";
import Quotes from "./sections/Quotes";
import KeyFigures from "./sections/KeyFigures";
import CTA from "./sections/CTA";

gsap.registerPlugin(ScrollTrigger, SplitText);

const App = () => {
  const scrollInitRef = useRef(false);
  const photosRef = useRef(null);
  const bgRef = useRef(null);

  // used to prevent multiple replays while sitting at y=0
  const replayStateRef = useRef({ isReplaying: false });

  // holds Carousel timeline so it’s accessible from onUpdate
  const carouselTlRef = useRef(null);

  // holds SplitText instance so it can be reverted on cleanup
  const paraSplitRef = useRef(null);

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
      const bgEndScreenId = "screen-5";
      const bgEndIndex = screens.findIndex((s) => s.id === bgEndScreenId);
      // fallback if not found
      const endScreens = bgEndIndex >= 0 ? bgEndIndex : 1;

      gsap.to(bgRef.current, {
        scale: 1.5,
        ease: "none",
        transformOrigin: "50% 40%",
        scrollTrigger: {
          trigger: spacer,
          start: "top top",
          end: () => `+=${window.innerHeight * endScreens}`,
          scrub: true,
        },
      });
    }

    // ---- Global progress (step-by-step, starts from Carousel screen) ----
    const progressEl = document.getElementById("globalProgress");
    const progressFill = document.getElementById("globalProgressFill");
    const startIndex = 1; // 0 = Photos, 1 = Carousel

    const MIN_PROGRESS = 12; // not empty at start
    const CAROUSEL_TARGET = 50; // reach 50% by end of Carousel timeline

    // localWithinScreen is used only for Carousel smooth fill
    const updateProgress = (activeIndex, localWithinScreen) => {
      if (!progressEl || !progressFill) return;

      if (activeIndex < startIndex) {
        progressEl.classList.remove("is-visible");
        progressFill.style.setProperty("--p", "0%");
        return;
      }

      progressEl.classList.add("is-visible");

      // screens AFTER carousel
      const stepsAfterCarousel = Math.max(1, n - 1 - startIndex);

      // Carousel: MIN -> 50 smoothly
      if (activeIndex === startIndex) {
        const t = typeof localWithinScreen === "number" ? localWithinScreen : 0;
        const pct = MIN_PROGRESS + (CAROUSEL_TARGET - MIN_PROGRESS) * t;
        progressFill.style.setProperty("--p", `${pct}%`);
        return;
      }

      // After Carousel: 50 -> 100 step-by-step
      const stepIndex = Math.min(
        stepsAfterCarousel,
        Math.max(1, activeIndex - startIndex)
      );

      const pct =
        CAROUSEL_TARGET +
        (stepIndex / stepsAfterCarousel) * (100 - CAROUSEL_TARGET);

      progressFill.style.setProperty("--p", `${pct}%`);
    };
    // -------------------------------------------------------------------

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

      // Cards start: tiny at center, stacked
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

      // Text start: hidden + more blur
      if (bgTextInner) {
        gsap.set(bgTextInner, {
          opacity: 0,
          scale: 0.55,
          z: -120,
          filter: "blur(16px)",
        });

        // IMPORTANT: if a split existed from before, revert it
        paraSplitRef.current?.revert?.();
        paraSplitRef.current = null;
      }

      const tl = gsap.timeline({ paused: true });

      // 0) Cards appear fast
      tl.to(cards, {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.12,
        ease: "none",
        stagger: { each: 0.03, from: "center" },
      });

      // Text starts showing while cards begin (still blurry)
      if (bgTextInner) {
        tl.to(
          bgTextInner,
          {
            opacity: 0.4,
            scale: 1,
            z: 0,
            filter: "blur(8px)",
            duration: 0.55,
            ease: "power2.out",
          },
          0
        );
      }

      // 1) Cards grow in place (still centered)
      tl.to(cards, {
        scale: 0.9,
        z: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.28,
        ease: "power2.out",
        stagger: { each: 0.06, from: "center" },
      });

      // 2) Cards spread to exact positions (--fx/--fy)
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

      // Keep back cards slightly faded when settled
      tl.to(
        screen2.querySelectorAll(".story-card--back"),
        { opacity: 0.55, duration: 0.2, ease: "none" },
        "<"
      );

      // When cards reach final position
      if (bgTextInner) {
        tl.to(bgTextInner, {
          opacity: 0.4,
          filter: "blur(4px)",
          duration: 0.2,
          ease: "none",
        });
      }

      // Hold briefly at final layout
      tl.to({}, { duration: 0.18 });

      // 4) Cards exit out following same direction (based on fx/fy)
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

      // 5) Text becomes fully clear AFTER cards exit
      if (bgTextInner) {
        tl.to(bgTextInner, {
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.25,
          ease: "power1.out",
        });

        // 6) Paragraph line-by-line (SplitText) AFTER text is clear
        const para = bgTextInner.querySelector(".carousel_paragraph");
        if (para) {
          tl.set(para, { opacity: 1 });

          const split = new SplitText(para, {
            type: "lines",
            linesClass: "carousel-line",
          });
          paraSplitRef.current = split;

          gsap.set(split.lines, { yPercent: 120, opacity: 0 });

          // reveal lines
          tl.to(
            split.lines,
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.6,
              ease: "power3.out",
              stagger: 0.12,
            },
            ">+=0.05"
          );

          // OUTRO: keep scrolling -> paragraph + text go back (small+blurry) then disappear
          tl.to({}, { duration: 0.12 });

          tl.to(
            split.lines,
            {
              yPercent: 120,
              opacity: 0,
              duration: 0.45,
              ease: "power2.in",
              stagger: 0.06,
            },
            "<"
          );

          tl.to(
            bgTextInner,
            {
              scale: 0.55,
              z: -120,
              opacity: 0,
              filter: "blur(16px)",
              duration: 0.45,
              ease: "power2.in",
            },
            "<"
          );
        }
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
        // --- screen switching logic ---
        const raw = self.progress * n;
        let i = Math.floor(raw);
        i = Math.max(0, Math.min(n - 1, i));

        const localScreen = raw - i;

        // Force: once user scrolls even a tiny bit, go to Carousel
        if (i === 0 && self.progress > 0.0005) {
          setActive(1);
        } else {
          const exit = parseFloat(screens[i].dataset.exit || "0.99");
          if (i < n - 1 && localScreen >= exit) setActive(i + 1);

          const back = parseFloat(screens[i].dataset.back || "0.10");
          if (i > 0 && localScreen <= back) setActive(i - 1);

          setActive(i);
        }

        // --- Carousel timeline mapping (give it enough scroll time for paragraph + outro) ---
        const tl = carouselTlRef.current;
        if (tl) {
          const carouselStart = 0.0005; // right after leaving top
          const carouselEnd = 2 / n;

          const local = gsap.utils.clamp(
            0,
            1,
            (self.progress - carouselStart) / (carouselEnd - carouselStart)
          );

          tl.progress(local);

          updateProgress(1, local);
        }

        if (active !== 1) updateProgress(active);
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

      paraSplitRef.current?.revert?.();
      paraSplitRef.current = null;
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

      <Quotes />
      <KeyFigures />
      <CTA />

      <div className="scroll-spacer" />
    </main>
  );
};

export default App;
