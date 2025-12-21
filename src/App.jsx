import { useLayoutEffect } from "react";
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
  useLayoutEffect(() => {
    const screens = Array.from(document.querySelectorAll(".screen"));
    const spacer = document.querySelector(".scroll-spacer");
    if (!screens.length || !spacer) return;

    const n = screens.length;

    // total scroll = N screens * 100vh
    spacer.style.setProperty("--scrollH", `${n * 100}vh`);

    // show first screen
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
        const total = n; // slices count
        const raw = self.progress * total; // 0..n
        let i = Math.floor(raw);
        i = Math.max(0, Math.min(n - 1, i));

        const local = raw - i; // 0..1 progress inside current slice

        const exit = parseFloat(screens[i].dataset.exit || "0.99");

        if (i < n - 1 && local >= exit) {
          setActive(i + 1);
          return;
        }

        // backward: add a small "re-enter threshold" to avoid flicker
        // if user scrolls up, switch back when we're early in slice
        const back = parseFloat(screens[i].dataset.back || "0.15");
        if (i > 0 && local <= back) {
          setActive(i - 1);
          return;
        }

        // otherwise keep current i visible
        setActive(i);
      },
    });

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      st.kill();
    };
  }, []);

  return (
    <main className="page">
      <Photos />
      <Carousel />
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
