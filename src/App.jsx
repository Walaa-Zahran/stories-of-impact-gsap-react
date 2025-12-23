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
  const keyFiguresTlRef = useRef(null);
  const replayStateRef = useRef({ isReplaying: false });
  const carouselTlRef = useRef(null);
  const paraSplitRef = useRef(null);

  // keep a reference so we can revert matchMedia on unmount
  const mmRef = useRef(null);

  const initScrollExperience = () => {
    if (scrollInitRef.current) return;
    scrollInitRef.current = true;

    const mm = gsap.matchMedia();
    mmRef.current = mm;

    // ----------------------------
    //  DESKTOP ONLY
    // ----------------------------
    mm.add("(min-width: 901px)", () => {
      document.body.classList.remove("is-mobile");
      document.body.classList.add("is-desktop");

      const screens = Array.from(document.querySelectorAll(".screen"));
      const spacer = document.querySelector(".scroll-spacer");
      if (!screens.length || !spacer) return;

      const n = screens.length;
      spacer.style.setProperty("--scrollH", `${n * 100}vh`);

      // Background scale on scroll
      if (bgRef.current) {
        const bgEndScreenId = "screen-5";
        const bgEndIndex = screens.findIndex((s) => s.id === bgEndScreenId);
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

      const progressEl = document.getElementById("globalProgress");
      const progressFill = document.getElementById("globalProgressFill");
      const startIndex = 1;
      const MIN_PROGRESS = 12;
      const CAROUSEL_TARGET = 50;

      const updateProgress = (activeIndex, localWithinScreen) => {
        if (!progressEl || !progressFill) return;

        if (activeIndex < startIndex) {
          progressEl.classList.remove("is-visible");
          progressFill.style.setProperty("--p", "0%");
          return;
        }

        progressEl.classList.add("is-visible");

        const stepsAfterCarousel = Math.max(1, n - 1 - startIndex);

        if (activeIndex === startIndex) {
          const t =
            typeof localWithinScreen === "number" ? localWithinScreen : 0;
          const pct = MIN_PROGRESS + (CAROUSEL_TARGET - MIN_PROGRESS) * t;
          progressFill.style.setProperty("--p", `${pct}%`);
          return;
        }

        const stepIndex = Math.min(
          stepsAfterCarousel,
          Math.max(1, activeIndex - startIndex)
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

        gsap.set(track, {
          transformPerspective: 1100,
          transformStyle: "preserve-3d",
        });

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

        if (bgTextInner) {
          gsap.set(bgTextInner, {
            opacity: 0,
            scale: 0.55,
            z: -120,
            filter: "blur(16px)",
          });

          paraSplitRef.current?.revert?.();
          paraSplitRef.current = null;
        }

        const tl = gsap.timeline({ paused: true });

        tl.to(cards, {
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.12,
          ease: "none",
          stagger: { each: 0.03, from: "center" },
        });

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

        if (bgTextInner) {
          tl.to(bgTextInner, {
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.25,
            ease: "power1.out",
          });

          const para = bgTextInner.querySelector(".carousel_paragraph");
          if (para) {
            tl.set(para, { opacity: 1 });

            const split = new SplitText(para, {
              type: "lines",
              linesClass: "carousel-line",
            });
            paraSplitRef.current = split;

            gsap.set(split.lines, { yPercent: 120, opacity: 0 });

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

      const setupKeyFiguresMotion = () => {
        const screen4 = document.querySelector("#screen-4");
        if (!screen4) return;

        const rail = screen4.querySelector(".figures__rail--floating");
        const cards = screen4.querySelectorAll(".figure-card--pos");
        if (!rail || !cards.length) return;

        const read = (el, name) =>
          parseFloat(getComputedStyle(el).getPropertyValue(name)) || 0;

        gsap.set(rail, {
          transformPerspective: 1100,
          transformStyle: "preserve-3d",
        });

        gsap.set(cards, {
          "--ox": (i, el) => `${-read(el, "--fx")}px`,
          "--oy": (i, el) => `${-read(el, "--fy")}px`,
          "--k": 0.12,
          z: -180,
          opacity: 0,
          rotateX: 0,
          rotateY: 0,
          filter: "blur(4px)",
          transformOrigin: "50% 50%",
        });

        const tl = gsap.timeline({ paused: true });

        tl.to(cards, {
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.12,
          ease: "none",
          stagger: { each: 0.03, from: "center" },
        });

        tl.to(cards, {
          "--k": 0.9,
          z: 0,
          duration: 0.22,
          ease: "power2.out",
          stagger: { each: 0.05, from: "center" },
        });

        tl.to(
          cards,
          {
            "--ox": "0px",
            "--oy": "0px",
            "--k": 1,
            z: 35,
            duration: 0.42,
            ease: "power1.out",
            stagger: { each: 0.06, from: "center" },
          },
          "<"
        );

        tl.to(cards, {
          "--ox": (i, el) => `${read(el, "--fx") * 1.2}px`,
          "--oy": (i, el) => `${read(el, "--fy") * 1.2}px`,
          "--k": 3.2,
          z: 720,
          opacity: 0,
          duration: 0.55,
          ease: "power2.in",
          stagger: { each: 0.05, from: "center" },
        });

        keyFiguresTlRef.current = tl;
        tl.progress(0);
      };

      setupCarouselMotion();
      setupKeyFiguresMotion();

      screens.forEach((s, i) => s.classList.toggle("is-active", i === 0));
      let active = 0;

      const setActive = (next) => {
        if (next === active) return;

        screens[active].classList.remove("is-active");
        screens[next].classList.add("is-active");

        if (next !== 0) {
          screens[0].classList.remove("show-final-text");
          screens[0].classList.remove("show-scroll-hint");
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
          const localScreen = raw - i;

          if (i === 0 && self.progress > 0.0005) {
            setActive(1);
          } else {
            const exit = parseFloat(screens[i].dataset.exit || "0.99");
            if (i < n - 1 && localScreen >= exit) setActive(i + 1);

            const back = parseFloat(screens[i].dataset.back || "0.10");
            if (i > 0 && localScreen <= back) setActive(i - 1);

            setActive(i);
          }

          const tl = carouselTlRef.current;
          if (tl) {
            const carouselStart = 0.0005;
            const carouselEnd = 2 / n;

            const local = gsap.utils.clamp(
              0,
              1,
              (self.progress - carouselStart) / (carouselEnd - carouselStart)
            );

            tl.progress(local);
            updateProgress(1, local);
          }

          const ktl = keyFiguresTlRef.current;
          if (ktl) {
            const keyFiguresIndex = 3;
            const start = keyFiguresIndex / n;
            const end = (keyFiguresIndex + 1) / n;

            const local = gsap.utils.clamp(
              0,
              1,
              (self.progress - start) / (end - start)
            );
            ktl.progress(local);
          }

          if (active !== 1) updateProgress(active);
        },
      });

      const onResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", onResize);
      ScrollTrigger.refresh(true);
      updateProgress(active);

      // cleanup for this desktop matchMedia context
      return () => {
        window.removeEventListener("resize", onResize);
        st.kill();

        carouselTlRef.current?.kill();
        carouselTlRef.current = null;

        keyFiguresTlRef.current?.kill();
        keyFiguresTlRef.current = null;

        paraSplitRef.current?.revert?.();
        paraSplitRef.current = null;
      };
    });

    // ----------------------------
    //  MOBILE FALLBACK
    // ----------------------------
    mm.add("(max-width: 900px)", () => {
      document.body.classList.remove("is-desktop");
      document.body.classList.add("is-mobile");

      // make all screens visible in normal flow
      const screens = Array.from(document.querySelectorAll(".screen"));
      screens.forEach((s) => s.classList.add("is-active"));

      // stop any leftover triggers/timelines if you resized from desktop -> mobile
      ScrollTrigger.getAll().forEach((t) => t.kill());
      carouselTlRef.current?.kill();
      carouselTlRef.current = null;

      keyFiguresTlRef.current?.kill();
      keyFiguresTlRef.current = null;

      paraSplitRef.current?.revert?.();
      paraSplitRef.current = null;

      // hide desktop global progress
      const progressEl = document.getElementById("globalProgress");
      if (progressEl) progressEl.classList.remove("is-visible");
    });
  };

  // lock at first load (desktop intro effect still works)
  useLayoutEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prevOverflow);
  }, []);

  const handleIntroDone = () => {
    document.body.style.overflow = "";
    replayStateRef.current.isReplaying = false;
    initScrollExperience();
  };

  // Replay intro when user returns to top (keep desktop behavior)
  useLayoutEffect(() => {
    let armed = window.scrollY > 10;

    const onScroll = () => {
      // don’t force replay logic on mobile (native scroll)
      if (window.matchMedia("(max-width: 900px)").matches) return;

      const y = window.scrollY;
      if (y > 10) armed = true;

      if (y === 0 && armed && !replayStateRef.current.isReplaying) {
        armed = false;
        replayStateRef.current.isReplaying = true;

        document.body.style.overflow = "hidden";
        photosRef.current?.resetToStart?.();
        photosRef.current?.playIntro?.();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // revert matchMedia on unmount
  useLayoutEffect(() => {
    return () => mmRef.current?.revert?.();
  }, []);

  return (
    <main className="page">
      <div className="bg-layer" ref={bgRef} aria-hidden="true" />

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
