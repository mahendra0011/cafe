import { useEffect } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function CafeEffects() {
  useEffect(() => {
    let lenis: any = null;
    let raf = 0;
    let cancelled = false;
    const tweens: any[] = [];

    (async () => {
      const [{ default: Lenis }, gsapMod, stMod] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      const gsap = gsapMod.gsap ?? gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default;
      gsap.registerPlugin(ScrollTrigger);
      lenis = new Lenis({ lerp: 0.08, smoothWheel: true, autoBind: true });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => {
        lenis?.raf(time * 1000);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value?: number) {
          if (arguments.length && typeof value === "number" && lenis)
            lenis.scrollTo(value, { immediate: true });
          return lenis?.scroll ?? document.documentElement.scrollTop;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
      });
      ScrollTrigger.defaults({ scroller: document.documentElement });
      ScrollTrigger.refresh();

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const reveal = (selector: string, cfg: any = {}) => {
        document.querySelectorAll(selector).forEach((el: any) => {
          tweens.push(
            ScrollTrigger.create({
              trigger: el,
              start: "top 98%",
              toggleActions: "onEnter none none none",
              onEnter: () => {
                if (reduced) return;
                tweens.push(
                  gsap.fromTo(
                    el,
                    { autoAlpha: 0, y: cfg.y ?? 28 },
                    { autoAlpha: 1, y: 0, duration: cfg.duration ?? 1.2, ease: "power3.out" },
                  ),
                );
              },
            }),
          );
        });
      };
      reveal(".cafe-section");
      reveal(".cafe-signature-item");
      reveal(".cafe-seven-row");
      reveal(".cafe-offer-ticket");
      reveal(".cafe-gallery-tile");
      reveal(".cafe-review-slip");
      reveal(".cafe-story-copy h2, .cafe-story-copy > p, .cafe-story-copy p.cafe-section-note");

      // Crop-reveal + parallax for signature art / story photos / hero graphic.
      document.querySelectorAll(".cafe-signature-art").forEach((el: any) => {
        const img = el.querySelector("img");
        if (!img) return;
        tweens.push(
          ScrollTrigger.create({
            trigger: img,
            start: "top 82%",
            onEnter: () => {
              if (!reduced)
                tweens.push(
                  gsap.to(img, { clipPath: "inset(0 0 0 0%)", duration: 1.4, ease: "power3.out" }),
                );
            },
          }),
        );
        tweens.push(
          ScrollTrigger.create({
            trigger: img,
            start: "top 78%",
            end: "top -40%",
            scrub: 0.9,
            onUpdate: (self: any) => {
              if (reduced) return;
              img.style.transform = `translateY(${Math.round(self.direction * self.progress * 14)}px) scale(${0.985 + self.progress * 0.015})`;
            },
          }),
        );
      });
      document.querySelectorAll(".cafe-story-collage figure img").forEach((el: any) => {
        tweens.push(
          ScrollTrigger.create({
            trigger: el,
            start: "top 78%",
            end: "top -40%",
            scrub: 0.9,
            onUpdate: (self: any) => {
              if (reduced) return;
              el.style.transform = `translateY(${Math.round(self.direction * self.progress * 24)}px) scale(${0.98 + self.progress * 0.02})`;
            },
          }),
        );
      });

      // Stats count-up.
      document.querySelectorAll(".cafe-story-stats strong").forEach((el: any) => {
        if (el.dataset.animated) return;
        el.dataset.animated = "1";
        const raw = el.textContent?.replace(/[^0-9.]/g, "") ?? "0";
        const target = Number.parseFloat(raw) || 0;
        const isInteger = Number.isInteger(target);
        const val = { value: 0 };
        tweens.push(
          ScrollTrigger.create({
            trigger: el,
            start: "top 70%",
            once: true,
            onEnter: () => {
              if (reduced) return;
              tweens.push(
                gsap.to(val, {
                  value: target,
                  duration: 1.2,
                  ease: "power3.out",
                  onUpdate: () => {
                    el.textContent = isInteger
                      ? `${Math.round(val.value)}\u207a`
                      : `${val.value.toFixed(1)}`;
                  },
                }),
              );
            },
          }),
        );
      });

      // Seven: progressive-bite SVG mask reveal.
      const sevenList = document.querySelector(".cafe-seven-list");
      if (sevenList && !sevenList.querySelector("[data-bite-applied]")) {
        const w = 320,
          h = 240;
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        svg.setAttribute("class", "cafe-seven-bite");
        svg.setAttribute("data-bite-applied", "1");
        const slice = document.createElementNS("http://www.w3.org/2000/svg", "path");
        slice.setAttribute(
          "d",
          `M${w / 2},10 L${w - 12},${h - 8} L${w - 22},${h} L${w / 2},${h} L12,${h} L${w / 2 - 12},${h} Z`,
        );
        slice.setAttribute("fill", "#F7B52C");
        slice.setAttribute("stroke", "#16110D");
        slice.setAttribute("stroke-width", 3);
        svg.appendChild(slice);
        sevenList.querySelectorAll(".cafe-seven-row").forEach((row: any, i: number) => {
          const mark = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          mark.setAttribute("r", 8);
          mark.setAttribute("cx", `${w / 2 - 72 + i * 50}`);
          mark.setAttribute("cy", `${h - 48 + (i % 2 ? 0 : 14)}`);
          mark.setAttribute("fill", "#16110D");
          svg.appendChild(mark);
          mark.style.opacity = "0";
          tweens.push(
            ScrollTrigger.create({
              trigger: row,
              start: "top 76%",
              once: true,
              onEnter: () => {
                if (!reduced)
                  tweens.push(
                    gsap.to(mark, { opacity: 1, scale: 1.3, duration: 0.5, ease: "power2.out" }),
                  );
              },
            }),
          );
        });
        sevenList.parentElement?.after(svg);
      }

      // Magnetic hover (desktop only).
      if (!window.matchMedia("(pointer: coarse)").matches && !reduced) {
        document.querySelectorAll(".cafe-button").forEach((el: any) => {
          el.style.transition = "none";
          const wrap = document.createElement("div");
          wrap.className = "cafe-magnetic-wrap";
          wrap.style.display = "inline-block";
          el.parentElement?.insertBefore(wrap, el);
          wrap.appendChild(el);
          el.addEventListener("mousemove", (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const dx = e.clientX - rect.left - rect.width / 2;
            const dy = e.clientY - rect.top - rect.height / 2;
            el.style.transition = "none";
            el.style.transform = `translate3d(${Math.min(Math.max(dx / 14, -12), 12)}px, ${Math.min(Math.max(dy / 14, -12), 12)}px, 0)`;
          });
          el.addEventListener("mouseleave", () => {
            el.style.transition = "transform 120ms ease";
            el.style.transform = "translate3d(0,0,0)";
          });
        });
      }

      // Reviews auto-scroll marquee (two rows).
      const rail = document.querySelector(".cafe-review-rail");
      if (rail && !rail.querySelector(".cafe-review-marquee-track")) {
        const track = document.createElement("div");
        track.className = "cafe-review-marquee-track";
        Array.from(rail.children).forEach((c) => track.appendChild(c));
        rail.appendChild(track);
        const dup = track.cloneNode(true) as HTMLElement;
        track.appendChild(dup);
        const scrollT = gsap.to(track, { xPercent: -50, duration: 9, ease: "none", repeat: -1 });
        rail.addEventListener("mouseenter", () => scrollT.pause());
        rail.addEventListener("mouseleave", () => scrollT.resume());
      }

      // Lightbox entry animation.
      document.querySelectorAll(".cafe-lightbox").forEach((el: any) => {
        el.style.opacity = "0";
        tweens.push(
          ScrollTrigger.create({
            trigger: el,
            start: "top 50%",
            once: true,
            onEnter: () => {
              if (reduced) return;
              tweens.push(gsap.from(el, { autoAlpha: 0, duration: 0.6, ease: "power2.out" }));
            },
          }),
        );
      });
    })();

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      tweens.forEach((t) => t.kill?.());
      if (lenis) lenis.destroy();
      document.querySelectorAll(".cafe-magnetic-wrap").forEach((w) => {
        const el = w.firstElementChild;
        if (el) w.parentElement?.insertBefore(el, w);
        w.remove();
      });
    };
  }, []);

  return null;
}
