import { useEffect, useState } from "react";

const KEY = "7bites-preloader-shown";

export function CafePreloader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(KEY)) return;
    setVisible(true);
    const timer = window.setTimeout(() => {
      sessionStorage.setItem(KEY, "1");
      setVisible(false);
    }, 2200);
    const skip = () => {
      sessionStorage.setItem(KEY, "1");
      setVisible(false);
    };
    window.addEventListener("click", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("click", skip);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="cafe-preloader" role="status" aria-label="Loading 7 Bites Cafe">
      <div className="cafe-preloader-curtain" />
      <div className="cafe-preloader-logo">
        <svg viewBox="0 0 120 120" className="cafe-preloader-pizza" aria-hidden="true">
          <path
            d="M60 10 L110 100 L10 100 Z"
            fill="#F7B52C"
            stroke="#16110D"
            strokeWidth="4"
            className="cafe-preloader-slice"
          />
        </svg>
        <span className="cafe-preloader-word">7 Bites</span>
        <span className="cafe-preloader-sub">Cafe</span>
      </div>
    </div>
  );
}
