import { useEffect } from "react";

export function CafeEffects() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Gentle scroll reveal observer that doesn't mutate DOM
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    const elements = document.querySelectorAll(
      ".cafe-reveal, .cafe-signature-item, .cafe-seven-row, .cafe-offer-ticket, .cafe-gallery-tile, .cafe-review-card",
    );
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
