import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import gsap from "gsap";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const Photos = forwardRef(({ onIntroDone }, ref) => {
  const bounceTweenRef = useRef(null);
  const stopBounceCleanupRef = useRef(null);
  const sectionRef = useRef(null);
  const introTweenRef = useRef(null);
  const splitRef = useRef({ title: null, subtitle: null });
  const textTweenRef = useRef(null);

  const stopBounce = () => {
    // kill tween
    bounceTweenRef.current?.kill();
    bounceTweenRef.current = null;

    // remove listeners if any
    stopBounceCleanupRef.current?.();
    stopBounceCleanupRef.current = null;
  };

  const startBounceUntilScroll = () => {
    const section = sectionRef.current;
    if (!section) return;

    const hintIcon = section.querySelector(".scroll-hint__icon img");
    if (!hintIcon) return;

    // ensure no duplicates
    stopBounce();

    // start bounce
    bounceTweenRef.current = gsap.to(hintIcon, {
      y: 10,
      duration: 0.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    let stopped = false;

    const kill = () => {
      if (stopped) return;
      stopped = true;

      stopBounce();

      // hide hint on first interaction
      section.classList.remove("show-scroll-hint");

      gsap.to(hintIcon, { y: 0, duration: 0.2, ease: "power2.out" });
    };

    const onWheel = () => kill();
    const onTouchMove = () => kill();
    const onKeyDown = (e) => {
      const keys = [
        "ArrowDown",
        "ArrowUp",
        "PageDown",
        "PageUp",
        "Home",
        "End",
        " ",
      ];
      if (keys.includes(e.key)) kill();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    // store cleanup
    stopBounceCleanupRef.current = () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  };
  const revertSplit = () => {
    splitRef.current.title?.revert();
    splitRef.current.subtitle?.revert();
    splitRef.current.title = null;
    splitRef.current.subtitle = null;
  };
  const animateCenterTextSplitLines = () => {
    const section = sectionRef.current;
    if (!section) return null;

    const center = section.querySelector(".impact__center");
    const titleEl = section.querySelector(".impact__center .title");
    const subtitleEl = section.querySelector(".impact__center .subtitle");
    if (!center || !titleEl || !subtitleEl) return null;

    textTweenRef.current?.kill();
    textTweenRef.current = null;
    revertSplit();

    splitRef.current.title = new SplitText(titleEl, {
      type: "lines",
      linesClass: "split-line",
    });
    splitRef.current.subtitle = new SplitText(subtitleEl, {
      type: "lines",
      linesClass: "split-line",
    });

    const allLines = [
      ...(splitRef.current.title.lines || []),
      ...(splitRef.current.subtitle.lines || []),
    ];

    allLines.forEach((line) => {
      const mask = document.createElement("div");
      mask.className = "line-mask";
      line.parentNode.insertBefore(mask, line);
      mask.appendChild(line);
    });

    gsap.set(allLines, { yPercent: 140, opacity: 0 });

    const tl = gsap.timeline();

    tl.to(allLines, {
      yPercent: 0,
      opacity: 1,
      duration: 0.85,
      ease: "power3.out",
      stagger: 0.28,
      clearProps: "transform,opacity",
    });

    tl.to(
      center,
      {
        rotation: 0,
        duration: 0.7,
        ease: "power3.out",
      },
      "+=0.15"
    );

    textTweenRef.current = tl;
    return tl;
  };

  useImperativeHandle(ref, () => ({
    playIntro: () => {
      runIntro(); // replay any time
    },
  }));

  const runIntro = () => {
    const section = sectionRef.current;
    if (!section) return;

    const images = Array.from(section.querySelectorAll(".impact__img"));
    if (!images.length) return;

    const hero = section.querySelector(".impact__img--mr") || images[0];
    const heroIndex = images.indexOf(hero);

    const final = images.map((el) => {
      const cs = getComputedStyle(el);
      return {
        fx: parseFloat(cs.getPropertyValue("--fx")) || 0,
        fy: parseFloat(cs.getPropertyValue("--fy")) || 0,
      };
    });

    const setOpacity = images.map((el) => gsap.quickSetter(el, "opacity"));
    const setScale = images.map((el) => gsap.quickSetter(el, "scale"));
    const setDX = images.map(
      (el) => (v) => el.style.setProperty("--dx", `${v}px`)
    );
    const setDY = images.map(
      (el) => (v) => el.style.setProperty("--dy", `${v}px`)
    );

    // center setters (DECLARE center BEFORE using it)
    const center = section.querySelector(".impact__center");
    if (center) {
      gsap.set(center, {
        rotation: -5,
        y: -30, // move up
        transformOrigin: "50% 50%",
      });
    }

    const setCenterAlpha = center
      ? gsap.quickSetter(center, "autoAlpha")
      : null;
    const setCenterY = center ? gsap.quickSetter(center, "y") : null;

    const apply = (p) => {
      const HOLD = 0; // start immediately (no static hold)

      // pp is normalized progress for the "main" animation segment
      const pp = HOLD === 0 ? p : (p - HOLD) / (1 - HOLD);

      // --- image spread in/out ---
      const MID = 0.55;
      const t = pp <= MID ? pp / MID : (1 - pp) / (1 - MID);

      images.forEach((_, i) => {
        setDX[i](final[i].fx * t);
        setDY[i](final[i].fy * t);

        const pop = 0.85 + 0.15 * t;
        setScale[i](i === heroIndex ? Math.max(1, pop) : pop);
      });

      // fade images out near the end (independent from text)
      const IMG_FADE_START = 0.75;
      const IMG_FADE_END = 1;

      const imgFade = gsap.utils.clamp(
        0,
        1,
        (pp - IMG_FADE_START) / (IMG_FADE_END - IMG_FADE_START)
      );

      images.forEach((_, i) => {
        const base = i === heroIndex ? 1 : Math.min(1, t * 1.2);
        setOpacity[i](base * (1 - imgFade));
      });

      section.classList.toggle("images-hidden", imgFade >= 1);

      // keep center hidden the whole time
      if (setCenterAlpha) setCenterAlpha(0);
      if (setCenterY) setCenterY(0);
      section.classList.remove("show-final-text");
      section.classList.remove("show-scroll-hint");
    };

    // kill any running intro tween before replay
    introTweenRef.current?.kill();
    introTweenRef.current = null;

    textTweenRef.current?.kill();
    textTweenRef.current = null;

    revertSplit();

    // reset state and start
    apply(0);

    const driver = { p: 0 };

    // IMPORTANT: keep only ONE tween (you had it duplicated)
    introTweenRef.current = gsap.to(driver, {
      p: 1,
      duration: 4.6,
      ease: "sine.inOut",
      onUpdate: () => apply(driver.p),
      onComplete: () => {
        apply(1);

        section.classList.add("images-hidden");

        if (setCenterAlpha) setCenterAlpha(1);
        if (setCenterY) setCenterY(0);
        section.classList.add("show-final-text");

        const tl = animateCenterTextSplitLines();

        if (tl) {
          tl.eventCallback("onComplete", () => {
            section.classList.add("show-scroll-hint");
            startBounceUntilScroll();
          });
        } else {
          // fallback if split didn't run
          section.classList.add("show-scroll-hint");
          startBounceUntilScroll();
        }

        onIntroDone?.();
      },
    });
  };

  useLayoutEffect(() => {
    // start once on mount
    runIntro();
    return () => {
      introTweenRef.current?.kill();
      introTweenRef.current = null;

      textTweenRef.current?.kill();
      textTweenRef.current = null;

      stopBounce(); // kills tween + removes listeners
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      className="screen is-active"
      id="screen-0"
      data-exit="0.02"
      ref={sectionRef}
    >
      <div className="impact">
        <div className="impact__center">
          <h2 className="title">
            <span className="title--thin">STORIES OF</span>
            <br />
            <span className="title--accent">IMPACT</span>
          </h2>

          <p className="subtitle">
            Behind every milestone is a story. These are the
            <br /> changemakers driving Our VISION and the results speak
            <br /> for themselves.
          </p>

          <div className="scroll-hint">
            <span className="scroll-hint__icon">
              <img src="/assets/images/scroll.png" alt="scroll" />
            </span>
            <span className="scroll-hint__text">Scroll to learn more</span>
          </div>
        </div>

        {/* images */}
        <img
          className="impact__img impact__img--tl"
          src="assets/images/people-1.png"
          alt=""
        />
        <img
          className="impact__img impact__img--ml"
          src="assets/images/people-2.png"
          alt=""
        />
        <img
          className="impact__img impact__img--bl"
          src="assets/images/people-3.png"
          alt=""
        />

        <img
          className="impact__img impact__img--tr"
          src="assets/images/people-4.png"
          alt=""
        />
        <img
          className="impact__img impact__img--mr"
          src="assets/images/people-5.png"
          alt=""
        />
        <img
          className="impact__img impact__img--br"
          src="assets/images/people-6.jpg"
          alt=""
        />

        <img
          className="impact__img impact__img--bc"
          src="assets/images/people-7.png"
          alt=""
        />
        <img
          className="impact__img impact__img--bm1"
          src="assets/images/people-8.png"
          alt=""
        />
        <img
          className="impact__img impact__img--bm2"
          src="assets/images/people-9.png"
          alt=""
        />
        <img
          className="impact__img impact__img--bm3"
          src="assets/images/people-10.png"
          alt=""
        />
        <img
          className="impact__img impact__img--bm4"
          src="assets/images/people-11.png"
          alt=""
        />
        <img
          className="impact__img impact__img--bm5"
          src="assets/images/people-12.png"
          alt=""
        />
      </div>
    </section>
  );
});

export default Photos;
