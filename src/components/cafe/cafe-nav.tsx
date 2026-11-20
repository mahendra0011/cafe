import { useEffect, useState, type CSSProperties } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Menu", href: "#full-menu" },
  { label: "Story", href: "#story" },
  { label: "Offers", href: "#offers" },
  { label: "Gallery", href: "#gallery" },
  { label: "Visit", href: "#visit" },
];

export function CafeNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`cafe-site-header${compact ? " is-compact" : ""}`} id="top">
      <div className="cafe-nav-row">
        <a className="cafe-wordmark" href="#top" aria-label="7 Bites Cafe home" onClick={closeMenu}>
          <span className="cafe-wordmark-name">7 Bites</span>
          <span className="cafe-wordmark-cafe">CAFE</span>
        </a>

        <nav className="cafe-desktop-links" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="cafe-nav-actions">
          <Button asChild variant="pepperoni" size="sm" className="cafe-nav-order">
            <a href="#order">
              Order Now <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="cafe-menu-trigger"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="cafe-mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>
      </div>

      <nav
        className={`cafe-mobile-menu${menuOpen ? " is-open" : ""}`}
        id="cafe-mobile-navigation"
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <span className="cafe-mobile-menu-note">A little hungry?</span>
        {navLinks.map((link, index) => (
          <a
            key={link.label}
            href={link.href}
            onClick={closeMenu}
            style={{ "--menu-order": index } as CSSProperties}
            tabIndex={menuOpen ? 0 : -1}
          >
            {link.label}
            <ArrowUpRight aria-hidden="true" />
          </a>
        ))}
        <a
          className="cafe-mobile-order"
          href="#order"
          onClick={closeMenu}
          tabIndex={menuOpen ? 0 : -1}
        >
          Order Now <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </header>
  );
}
