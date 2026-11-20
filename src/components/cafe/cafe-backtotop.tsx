import { useEffect, useState } from "react";

export function CafeBackToTop() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      className="cafe-back-top-progress"
      href="#top"
      aria-label="Back to top"
      style={{ "--progress": `${progress}%` } as React.CSSProperties}
    >
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="16" className="cafe-back-track" />
        <circle cx="20" cy="20" r="16" className="cafe-back-fill" />
      </svg>
      <span>↑</span>
    </a>
  );
}
