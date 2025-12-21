import { useLayoutEffect, useRef } from "react";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import Headline from "./sections/Headline";
import Carousel from "./sections/Carousel";
import Title from "./sections/Title";
import Photos from "./sections/Photos";
import KeyFigures from "./sections/KeyFigures";
import CTA from "./sections/CTA";
import Quotes from "./sections/Quotes";

gsap.registerPlugin(ScrollTrigger);

const App = () => {
  const scrollInitRef = useRef(false);
  const photosRef = useRef(null);
  const bgRef = useRef(null);

  const initScrollExperience = () => {
    if (scrollInitRef.current) return;
    scrollInitRef.current = true;

    const screens = Array.from(document.querySelectorAll(".screen"));
    const spacer = document.querySelector(".scroll-spacer");
    if (!screens.length || !spacer) return;

    const n = screens.length;
    spacer.style.setProperty("--scrollH", `${n * 100}vh`);
    //  Background scale on scroll (starts 1, grows smoothly)
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        scale: 2.2, // how big it gets at the bottom
        ease: "none", // smooth + consistent with scrub
        transformOrigin: "50% 40%",
        scrollTrigger: {
          trigger: spacer,
          start: "top top",
          end: () => `+=${window.innerHeight * n}`,
          scrub: true,
        },
      });
    }
    screens.forEach((s, i) => s.classList.toggle("is-active", i === 0));
    let active = 0;

    const setActive = (next) => {
      if (next === active) return;
      screens[active].classList.remove("is-active");
      screens[next].classList.add("is-active");
      active = next;
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
        const exit = parseFloat(screens[i].dataset.exit || "0.99");

        if (i < n - 1 && local >= exit) return setActive(i + 1);

        const back = parseFloat(screens[i].dataset.back || "0.15");
        if (i > 0 && local <= back) return setActive(i - 1);

        setActive(i);
      },
    });

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    ScrollTrigger.refresh(true);

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
    document.body.style.overflow = ""; // unlock
    initScrollExperience();
  };

  //  replay intro when user returns to top
  useLayoutEffect(() => {
    let rearming = true; // prevents replay loop while staying at top
    let isReplaying = false;

    const onScroll = () => {
      const y = window.scrollY;

      // if user moved away from top, allow replay next time they come back
      if (y > 10) rearming = true;

      // when they reach top again, replay once
      if (y === 0 && rearming && !isReplaying) {
        rearming = false;
        isReplaying = true;

        // lock scrolling during replay
        document.body.style.overflow = "hidden";

        // replay photos intro
        photosRef.current?.playIntro();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  //  small tweak: when intro finishes, clear replay flag
  const replayFlagRef = useRef(false);

  const handleIntroDoneWrapped = () => {
    replayFlagRef.current = false;
    handleIntroDone();
  };

  return (
    <main className="page">
      <div className="bg-layer" ref={bgRef} aria-hidden="true" />

      <Photos ref={photosRef} onIntroDone={handleIntroDoneWrapped} />
      <Carousel />
      {/* <KeyFigures />
      <Headline />
      <Title />
      <Quotes />
      <CTA /> */}

      <div className="scroll-spacer" />
    </main>
  );
};

export default App;
