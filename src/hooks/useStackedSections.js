import { useLayoutEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function useStackedSections() {
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const sections = gsap.utils.toArray(".screen");
            const spacer = document.querySelector(".scroll-spacer");
            if (!sections.length || !spacer) return;

            sections.forEach((s, i) => (s.style.zIndex = String(i + 1)));

            gsap.set(sections, { autoAlpha: 0, y: 0 });
            gsap.set(sections[0], { autoAlpha: 1 });

            ScrollTrigger.create({
                trigger: spacer,
                start: "top top",
                end: "bottom bottom",
                scrub: true,
                onUpdate: () => {
                    const vh = window.innerHeight;
                    const y = window.scrollY;

                    const lastIndex = sections.length - 1;
                    const index = Math.min(lastIndex, Math.max(0, Math.floor(y / vh)));
                    const local = Math.min(1, Math.max(0, (y - index * vh) / vh));

                    // hide all first
                    gsap.set(sections, { autoAlpha: 0, y: 0 });

                    const current = sections[index];
                    const next = sections[index + 1];

                    // ✅ current NEVER fades out
                    gsap.set(current, { autoAlpha: 1, y: 0 });

                    // fade next on top during the local progress
                    if (next) {
                        gsap.set(next, { autoAlpha: local, y: (1 - local) * 20 });
                    }

                    // ✅ if we're at/after the last slide range, keep last visible
                    if (index === lastIndex && y >= lastIndex * vh) {
                        gsap.set(sections[lastIndex], { autoAlpha: 1, y: 0 });
                    }
                },
            });

            const onResize = () => ScrollTrigger.refresh();
            window.addEventListener("resize", onResize);
            return () => window.removeEventListener("resize", onResize);
        });

        return () => ctx.revert();
    }, []);
}
