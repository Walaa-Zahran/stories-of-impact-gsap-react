import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Photos = () => {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    let removeResizeListener = null;

    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      const spacer = document.querySelector(".scroll-spacer");
      if (!section || !spacer) return;

      const screens = Array.from(document.querySelectorAll(".screen"));
      const index = screens.indexOf(section);
      if (index < 0) return;

      const images = Array.from(section.querySelectorAll(".impact__img"));
      if (!images.length) return;

      const hero = section.querySelector(".impact__img--mr") || images[0];
      const heroIndex = images.indexOf(hero);

      //  READ FINAL FROM --fx/--fy
      const final = images.map((el) => {
        const cs = getComputedStyle(el);
        return {
          fx: parseFloat(cs.getPropertyValue("--fx")) || 0,
          fy: parseFloat(cs.getPropertyValue("--fy")) || 0,
        };
      });

      const hint = section.querySelector(".scroll-hint");
      if (hint) {
        let lowestIndex = 0;
        for (let i = 1; i < final.length; i++) {
          if (final[i].fy > final[lowestIndex].fy) lowestIndex = i;
        }

        const lowestImg = images[lowestIndex];

        const updateHintBottom = () => {
          const imgH = lowestImg.getBoundingClientRect().height || 233;

          const lowestBottomFromTop =
            window.innerHeight / 2 + final[lowestIndex].fy + imgH / 2;

          const GAP = 18;
          const hintBottom = Math.max(
            16,
            window.innerHeight - lowestBottomFromTop + GAP
          );

          section.style.setProperty("--hint-bottom", `${hintBottom}px`);
        };

        updateHintBottom();
        window.addEventListener("resize", updateHintBottom);

        removeResizeListener = () =>
          window.removeEventListener("resize", updateHintBottom);
      }

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

        // initial
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
        const t = pp <= MID ? pp / MID : (1 - pp) / (1 - MID); // 1 spread, 0 merged

        images.forEach((_, i) => {
          setDX[i](final[i].fx * t);
          setDY[i](final[i].fy * t);

          const pop = 0.85 + 0.15 * t;
          setScale[i](i === heroIndex ? Math.max(1, pop) : pop);
        });

        //  step-by-step text fade when merged near end
        //  show text only near the END of the section
        const TEXT_START = 0.78; // when to start fading in
        const TEXT_END = 0.98; // when fully visible
        const STEPS = 10; // step count
        const raw = gsap.utils.clamp(
          0,
          1,
          (pp - TEXT_START) / (TEXT_END - TEXT_START)
        );
        const alpha = Math.round(raw * STEPS) / STEPS;

        if (setCenterAlpha) setCenterAlpha(alpha);
        if (setCenterY) setCenterY(8 * (1 - alpha));

        section.classList.toggle("show-final-text", alpha > 0.98);
        //  fade images out AFTER merge begins
        const IMG_FADE_START = 0.2; // start fading images once alpha > 0.2
        const imgFade = gsap.utils.clamp(
          0,
          1,
          (alpha - IMG_FADE_START) / (1 - IMG_FADE_START)
        );

        images.forEach((_, i) => {
          // base visibility while spreading
          const base = i === heroIndex ? 1 : Math.min(1, t * 1.2);

          // but once text comes in, fade EVERYTHING out
          const finalOpacity = base * (1 - imgFade);
          console.log("final opacity", finalOpacity);
          setOpacity[i](finalOpacity);
        });

        // hard hide when fully faded
        section.classList.toggle("images-hidden", imgFade >= 1);
        console.log("t:", t.toFixed(3), "alpha:", alpha.toFixed(2));
      };

      const st = ScrollTrigger.create({
        trigger: spacer,
        start: () => `top+=${index * window.innerHeight} top`,
        end: () => `top+=${(index + 1) * window.innerHeight} top`,
        scrub: true,
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => apply(self.progress),
        // markers: true,
      });

      apply(st.progress);
      ScrollTrigger.refresh();
    }, sectionRef);

    return () => {
      if (removeResizeListener) removeResizeListener();
      ctx.revert();
    };
  }, []);

  return (
    <section
      className="screen"
      id="screen-4"
      data-exit="0.999"
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
};

export default Photos;
