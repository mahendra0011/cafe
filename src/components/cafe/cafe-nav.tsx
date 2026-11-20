import { useEffect, useState, type CSSProperties } from "react";
import { ArrowUpRight, Calendar, Menu, Phone, User, UtensilsCrossed, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { cafeSite } from "@/config/site";
import { getAuthSession, subscribeToAuth } from "@/lib/auth-store";

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Offers", href: "/#offers" },
  { label: "Reserve", href: "/#reserve" },
  { label: "About Us", href: "/#story" },
  { label: "Reviews", href: "/#reviews" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact Us", href: "/#visit" },
];

export function CafeNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [session, setSession] = useState(() => getAuthSession());

  useEffect(() => {
    return subscribeToAuth(() => setSession(getAuthSession()));
  }, []);

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
        {/* Brand Logo */}
        <Link className="cafe-wordmark" to="/" aria-label="7 Bites Cafe home" onClick={closeMenu}>
          <div className="cafe-wordmark-badge" aria-hidden="true">
            7B
          </div>
          <div className="cafe-wordmark-text">
            <span className="cafe-wordmark-name">7 Bites</span>
            <span className="cafe-wordmark-cafe">CAFÉ & PIZZERIA</span>
          </div>
        </Link>

        {/* Public Navigation: Home, Menu, Offers, Reserve, About Us, Reviews, FAQ, Contact Us */}
        <nav className="cafe-desktop-links" aria-label="Main navigation">
          {navLinks.map((link) => (
            link.href.startsWith("/#") ? (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ) : (
              <Link key={link.label} to={link.href}>
                {link.label}
              </Link>
            )
          ))}
        </nav>

        {/* Navigation Action Buttons */}
        <div className="cafe-nav-actions">
          {/* Phone */}
          <a className="cafe-nav-phone" href={`tel:${cafeSite.phone}`}>
            <Phone className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
            <span>{cafeSite.phone}</span>
          </a>

          {/* Login / Create Account Button */}
          <Link
            to={session.isAuthenticated ? "/account" : "/login"}
            className="cafe-nav-login"
            title={session.isAuthenticated ? "Go to your Account" : "Login / Create Account"}
          >
            <User className="w-3.5 h-3.5 text-[#C83B1E]" aria-hidden="true" />
            <span>
              {session.isAuthenticated && session.customer
                ? `${session.customer.name.split(" ")[0]} (Account)`
                : "Login / Create Account"}
            </span>
          </Link>

          {/* Table Reservation CTA Button */}
          <Button asChild variant="pepperoni" size="sm" className="cafe-nav-order">
            <a href="/#reserve">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              Book Table <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>

          {/* Mobile Menu Trigger */}
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

      {/* Mobile Drawer */}
      <nav
        className={`cafe-mobile-menu${menuOpen ? " is-open" : ""}`}
        id="cafe-mobile-navigation"
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <span className="cafe-mobile-menu-note">7 Bites Cafe · Chhatarpur</span>
        {navLinks.map((link, index) => (
          link.href.startsWith("/#") ? (
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
          ) : (
            <Link
              key={link.label}
              to={link.href}
              onClick={closeMenu}
              style={{ "--menu-order": index } as CSSProperties}
              tabIndex={menuOpen ? 0 : -1}
            >
              {link.label}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          )
        ))}

        <Link
          to={session.isAuthenticated ? "/account" : "/login"}
          onClick={closeMenu}
          className="flex items-center justify-between py-3 text-base font-bold text-[#1C1410] border-b border-[#1C1410]/10"
          tabIndex={menuOpen ? 0 : -1}
        >
          <span className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#C83B1E]" />
            {session.isAuthenticated ? "My Account Dashboard" : "Login / Create Account"}
          </span>
          <ArrowUpRight className="w-4 h-4 text-[#8A8375]" />
        </Link>

        <a
          className="cafe-mobile-order"
          href="/#reserve"
          onClick={closeMenu}
          tabIndex={menuOpen ? 0 : -1}
        >
          Book a Table Now <ArrowUpRight aria-hidden="true" />
        </a>
      </nav>
    </header>
  );
}
