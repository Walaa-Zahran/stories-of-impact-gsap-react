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

      // ✅ READ FINAL FROM --fx/--fy
      const final = images.map((el) => {
        const cs = getComputedStyle(el);
        return {
          fx: parseFloat(cs.getPropertyValue("--fx")) || 0,
          fy: parseFloat(cs.getPropertyValue("--fy")) || 0,
        };
      });

      // ✅ Position scroll-hint just above the lowest image (based on final fy)
      const hint = section.querySelector(".scroll-hint");
      if (hint) {
        let lowestIndex = 0;
        for (let i = 1; i < final.length; i++) {
          if (final[i].fy > final[lowestIndex].fy) lowestIndex = i;
        }

        const lowestImg = images[lowestIndex];

        const updateHintBottom = () => {
          const imgH = lowestImg.getBoundingClientRect().height || 233;

          // bottom edge of the lowest image when spread
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

        // store cleanup (DON'T use ctx.add here)
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

      const apply = (p) => {
        const HOLD = 0.12;

        if (p <= HOLD) {
          images.forEach((_, i) => {
            setDX;
            setDY;
            setScale[i](0.98);
            setOpacity[i](i === heroIndex ? 1 : 0);
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

          const opacity = i === heroIndex ? 1 : Math.min(1, t * 1.2);
          setOpacity[i](opacity);
        });
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
    <section className="screen" id="screen-4" data-exit="0.85" ref={sectionRef}>
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
