import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import gsap from "gsap";
const Photos = forwardRef(({ onIntroDone }, ref) => {
  const bounceTweenRef = useRef(null);
  const stopBounceCleanupRef = useRef(null);
  const sectionRef = useRef(null);
  const introTweenRef = useRef(null);
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
      duration: 0.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    let stopped = false;

    const kill = () => {
      if (stopped) return;
      stopped = true;

      stopBounce();

      // snap back nicely
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
      window.removeEventListener("wheel", onWheel, { passive: true });
      window.removeEventListener("touchmove", onTouchMove, { passive: true });
      window.removeEventListener("keydown", onKeyDown);
    };
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

    const center = section.querySelector(".impact__center");
    const setCenterAlpha = center
      ? gsap.quickSetter(center, "autoAlpha")
      : null;
    const setCenterY = center ? gsap.quickSetter(center, "y") : null;

    const apply = (p) => {
      const HOLD = 0.12;

      if (p <= HOLD) {
        if (setCenterAlpha) setCenterAlpha(0);
        if (setCenterY) setCenterY(8);

        section.classList.remove("show-final-text");
        section.classList.remove("images-hidden");

        images.forEach((_, i) => {
          setScale[i](0.98);
          setOpacity[i](i === heroIndex ? 1 : 0);

          setDX;
          setDY;
        });

        return;
      }

      const pp = (p - HOLD) / (1 - HOLD);
      const MID = 0.55;
      const t = pp <= MID ? pp / MID : (1 - pp) / (1 - MID);

      images.forEach((_, i) => {
        setDX[i](final[i].fx * t);
        setDY[i](final[i].fy * t);

        const pop = 0.85 + 0.15 * t;
        setScale[i](i === heroIndex ? Math.max(1, pop) : pop);
      });

      const TEXT_START = 0.78;
      const TEXT_END = 0.98;
      const STEPS = 10;

      const raw = gsap.utils.clamp(
        0,
        1,
        (pp - TEXT_START) / (TEXT_END - TEXT_START)
      );
      const alpha = Math.round(raw * STEPS) / STEPS;

      if (setCenterAlpha) setCenterAlpha(alpha);
      if (setCenterY) setCenterY(8 * (1 - alpha));

      section.classList.toggle("show-final-text", alpha > 0.98);

      const IMG_FADE_START = 0.2;
      const imgFade = gsap.utils.clamp(
        0,
        1,
        (alpha - IMG_FADE_START) / (1 - IMG_FADE_START)
      );

      images.forEach((_, i) => {
        const base = i === heroIndex ? 1 : Math.min(1, t * 1.2);
        setOpacity[i](base * (1 - imgFade));
      });

      section.classList.toggle("images-hidden", imgFade >= 1);
    };

    // kill any running intro tween before replay
    if (introTweenRef.current) {
      introTweenRef.current.kill();
      introTweenRef.current = null;
    }

    // reset state and start
    apply(0);

    const driver = { p: 0 };
    introTweenRef.current = gsap.to(driver, {
      p: 1,
      duration: 3.6,
      ease: "sine.inOut",
      onUpdate: () => apply(driver.p),
      onComplete: () => {
        apply(1);
        onIntroDone?.();
      },
    });
    introTweenRef.current = gsap.to(driver, {
      p: 1,
      duration: 3.6,
      ease: "sine.inOut",
      onUpdate: () => apply(driver.p),
      onComplete: () => {
        apply(1);

        //start bouncing AFTER intro is done (text visible)
        startBounceUntilScroll();

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
