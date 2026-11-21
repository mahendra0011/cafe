import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowUpRight, Calendar, ChevronRight, Star, UtensilsCrossed } from "lucide-react";
import { CafeNav } from "@/components/cafe/cafe-nav";
import { CafeSections } from "@/components/cafe/cafe-sections";
import { CafeEffects } from "@/components/cafe/cafe-effects";
import { CafePreloader } from "@/components/cafe/cafe-preloader";
import { CafeCursor } from "@/components/cafe/cafe-cursor";
import { CafeFloatingActions } from "@/components/cafe/cafe-floating";
import { CafeBackToTop } from "@/components/cafe/cafe-backtotop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "7 Bites Cafe | Pizza, Coffee & Good Times in Jabalpur" },
      {
        name: "description",
        content:
          "Pizza, café favourites and a little extra cheese. Find 7 Bites Cafe at Gohalpur Amkhera, Jagriti Nagar, Jabalpur, Madhya Pradesh 482001.",
      },
      { property: "og:title", content: "7 Bites Cafe | Jabalpur" },
      {
        property: "og:description",
        content: "Ek bite. Phir saat. Pizza, café favourites and good times in Jabalpur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CafeOrCoffeeShop",
          name: "7 Bites Cafe",
          url: "https://7bitescafe.example/",
          description:
            "Pizza, coffee and a little extra cheese. Find 7 Bites Cafe at Gohalpur Amkhera, Jagriti Nagar, Jabalpur, Madhya Pradesh 482001.",
          image: "/logo.png",
          keywords:
            "pizza, cafe, Jabalpur, Madhya Pradesh, food, coffee, pizza near me, cafe near me, Gohalpur, Jagriti Nagar",
          isFamilyFriendly: true,
          priceRange: "₹200-₹800",
          areaServed: "Jabalpur, Madhya Pradesh, India",
          servesCuisine: ["Pizza", "Cafe", "Burgers", "Fast Food"],
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ],
              opens: "11:00",
              closes: "23:00",
            },
          ],
          address: {
            "@type": "PostalAddress",
            streetAddress: "Gohalpur Amkhera, Jagriti Nagar",
            addressLocality: "Jabalpur",
            addressRegion: "Madhya Pradesh",
            postalCode: "482001",
            addressCountry: "IN",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "15000",
            bestRating: "5",
            worstRating: "1",
          },
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
  }, []);
  return (
    <>
      <CafePreloader />
      <CafeCursor />
      <CafeEffects />
      <main className="cafe-home">
        <CafeNav />

        <section className="cafe-hero" aria-labelledby="hero-title">
          <div className="cafe-hero-layout">
            <div className="cafe-hero-copy">
              <p className="cafe-eyebrow">
                <span className="cafe-eyebrow-dot" aria-hidden="true" />
                Jabalpur's Favourite Pizzeria & Café
              </p>

              <h1 className="cafe-hero-title" id="hero-title">
                <span className="cafe-title-line-dark">Ek Bite.</span>
                <span className="cafe-title-line-red">
                  Phir Saat.
                  {/* Radiant accent marks on top-right of Phir Saat */}
                  <span className="cafe-title-burst" aria-hidden="true">
                    <svg width="34" height="28" viewBox="0 0 34 28" fill="none">
                      <path d="M4 22L1 17" stroke="#EC2D09" strokeWidth="3" strokeLinecap="round" />
                      <path d="M17 14V2" stroke="#EC2D09" strokeWidth="3" strokeLinecap="round" />
                      <path d="M30 22L33 17" stroke="#EC2D09" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </span>
                  {/* Playful curved swoop underline */}
                  <span className="cafe-title-swoop" aria-hidden="true">
                    <svg viewBox="0 0 280 22" fill="none" className="w-full h-auto overflow-visible">
                      <path d="M4 8 C 85 22, 195 22, 276 6" stroke="#EC2D09" strokeWidth="4.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </span>
              </h1>

              <p className="cafe-hero-subtitle">
                Craving <strong>golden cheese pulls</strong>, gourmet burgers, sizzling momos, or rich chilled coffee?
                Welcome to 7 Bites Cafe – handcrafted for sharing smiles and delicious bites in Jabalpur (Gohalpur Amkhera, Jagriti Nagar).
              </p>

              <div className="cafe-hero-actions">
                <a href="#reserve" className="cafe-hero-btn-primary">
                  <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Book Table / Reserve</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </a>
                <a href="#full-menu" className="cafe-hero-btn-secondary">
                  <UtensilsCrossed className="w-4 h-4 text-[#D8381D] shrink-0" aria-hidden="true" />
                  <span>Explore Menu</span>
                  <ChevronRight className="w-4 h-4 text-[#7A6960] shrink-0" aria-hidden="true" />
                </a>
              </div>

              <div className="cafe-trust-note">
                <div className="cafe-trust-stars" aria-label="5 star rating">
                  <Star aria-hidden="true" />
                  <Star aria-hidden="true" />
                  <Star aria-hidden="true" />
                  <Star aria-hidden="true" />
                  <Star aria-hidden="true" />
                </div>
                <span className="font-bold text-[#1E100A]">4.8 Rating on Google</span>
                <span className="text-[#8C7A70]">·</span>
                <span className="cafe-trust-placeholder">15,000+ Happy Foodies</span>
              </div>
            </div>

            <div
              className="cafe-hero-art"
              aria-label="Fresh Artisan Pizza with molten cheese pull"
            >
              {/* Floating badges overlaying the pizza slice and wooden cutting board in the background */}
              <div className="cafe-hero-pill-badge cafe-hero-pill-1">
                <span className="cafe-badge-emoji">🍕</span>
                <span>100% Real Mozzarella</span>
              </div>
              <div className="cafe-hero-pill-badge cafe-hero-pill-2">
                <span className="cafe-badge-emoji">👨‍🍳</span>
                <span>Fresh Dough Baked Daily</span>
              </div>
            </div>
          </div>
        </section>
        <CafeSections />
        <CafeFloatingActions />
        <CafeBackToTop />
      </main>
    </>
  );
}
