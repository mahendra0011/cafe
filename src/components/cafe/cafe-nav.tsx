import { useEffect, useState, type CSSProperties } from "react";
import { ArrowUpRight, Calendar, Menu, Phone, User, X } from "lucide-react";
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
          <img
            src="/logo.png"
            alt="7 Bites Cafe Logo"
            className="w-9 h-9 md:w-10 md:h-10 rounded-full object-contain shadow-xs border border-[#1C1410]/12 bg-white shrink-0"
          />
          <div className="cafe-wordmark-text">
            <span className="cafe-wordmark-name">7 Bites</span>
            <span className="cafe-wordmark-cafe">CAFÉ & PIZZERIA</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="cafe-desktop-links" aria-label="Main navigation">
          {navLinks.map((link) => (
            link.href.startsWith("/#") ? (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                activeProps={{ className: "is-active" }}
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>

        {/* Navigation Action Buttons */}
        <div className="cafe-nav-actions">
          {/* Phone (Desktop only) */}
          <a className="cafe-nav-phone" href={`tel:${cafeSite.phone}`}>
            <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
            <span>{cafeSite.phone}</span>
          </a>

          {/* Login / Create Account Button */}
          <Link
            to={session.isAuthenticated ? "/account" : "/login"}
            className="cafe-nav-login"
            title={session.isAuthenticated ? "Go to your Account" : "Login / Create Account"}
            aria-label={session.isAuthenticated ? "Account" : "Login or Create Account"}
          >
            <User className="w-4 h-4 text-[#C83B1E] shrink-0" aria-hidden="true" />
            <span className="cafe-nav-login-label">
              {session.isAuthenticated && session.customer
                ? `${session.customer.name.split(" ")[0]} (Account)`
                : "Login / Create Account"}
            </span>
          </Link>

          {/* Table Reservation CTA Button */}
          <Button asChild variant="pepperoni" size="sm" className="cafe-nav-order">
            <a href="/#reserve">
              <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="cafe-nav-order-label">Book Table</span>
              <ArrowUpRight className="cafe-nav-order-arrow shrink-0" aria-hidden="true" />
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
            {menuOpen ? <X className="w-5 h-5 shrink-0" aria-hidden="true" /> : <Menu className="w-5 h-5 shrink-0" aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer (Native Android/iOS Experience) */}
      <nav
        className={`cafe-mobile-menu${menuOpen ? " is-open" : ""}`}
        id="cafe-mobile-navigation"
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <div className="cafe-mobile-menu-header">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="7 Bites Cafe Logo"
              className="w-9 h-9 rounded-full object-contain shadow-xs border border-[#1C1410]/12 bg-white shrink-0"
            />
            <div className="flex flex-col text-left">
              <span className="font-bold text-base text-[#1C1410] leading-none">7 Bites Cafe</span>
              <span className="text-[10px] font-semibold text-[#C83B1E] tracking-wider uppercase mt-0.5">Jabalpur, MP</span>
            </div>
          </div>
          <button
            type="button"
            onClick={closeMenu}
            className="w-9 h-9 rounded-full bg-[#1C1410]/6 hover:bg-[#1C1410]/12 flex items-center justify-center text-[#1C1410] transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="cafe-mobile-menu-links">
          {navLinks.map((link, index) => (
            link.href.startsWith("/#") ? (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                style={{ "--menu-order": index } as CSSProperties}
                tabIndex={menuOpen ? 0 : -1}
                className="cafe-mobile-link"
              >
                <span>{link.label}</span>
                <ArrowUpRight className="w-4 h-4 text-[#C83B1E]/70" aria-hidden="true" />
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                onClick={closeMenu}
                style={{ "--menu-order": index } as CSSProperties}
                tabIndex={menuOpen ? 0 : -1}
                className="cafe-mobile-link"
              >
                <span>{link.label}</span>
                <ArrowUpRight className="w-4 h-4 text-[#C83B1E]/70" aria-hidden="true" />
              </Link>
            )
          ))}
        </div>

        <div className="cafe-mobile-menu-footer">
          <Link
            to={session.isAuthenticated ? "/account" : "/login"}
            onClick={closeMenu}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#1C1410]/10 shadow-xs mb-3 text-sm font-bold text-[#1C1410]"
            tabIndex={menuOpen ? 0 : -1}
          >
            <span className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#C83B1E]/10 flex items-center justify-center text-[#C83B1E]">
                <User className="w-4 h-4" />
              </div>
              {session.isAuthenticated && session.customer
                ? `Account: ${session.customer.name}`
                : "Login / Create Account"}
            </span>
            <ArrowUpRight className="w-4 h-4 text-[#8A8375]" />
          </Link>

          <a
            className="cafe-mobile-order"
            href="/#reserve"
            onClick={closeMenu}
            tabIndex={menuOpen ? 0 : -1}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book a Table Now
            <ArrowUpRight className="w-4 h-4 ml-2" aria-hidden="true" />
          </a>

          <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-[#1C1410]/8 text-xs text-[#6B5E57]">
            <a href={`tel:${cafeSite.phone}`} className="flex items-center gap-1.5 hover:text-[#C83B1E] font-medium">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>{cafeSite.phone}</span>
            </a>
            <span>•</span>
            <span className="text-[#1B6642] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Open 11 AM - 11 PM
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
}
