import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Sparkles, Star } from "lucide-react";
import pizzaSticker from "@/assets/7-bites-pizza-sticker.png";
import { CafeNav } from "@/components/cafe/cafe-nav";
import { CafeSections } from "@/components/cafe/cafe-sections";
import { CafeEffects } from "@/components/cafe/cafe-effects";
import { CafePreloader } from "@/components/cafe/cafe-preloader";
import { CafeCursor } from "@/components/cafe/cafe-cursor";
import { CafeFloatingActions } from "@/components/cafe/cafe-floating";
import { CafeBackToTop } from "@/components/cafe/cafe-backtotop";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "7 Bites Cafe | Pizza, Coffee & Good Times in Chhatarpur" },
      {
        name: "description",
        content:
          "Pizza, café favourites and a little extra cheese. Find 7 Bites Cafe in Chhatarpur, Madhya Pradesh.",
      },
      { property: "og:title", content: "7 Bites Cafe | Chhatarpur" },
      {
        property: "og:description",
        content: "Ek bite. Phir saat. Pizza, café favourites and good times in Chhatarpur.",
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
            "Pizza, coffee and a little extra cheese. Find 7 Bites Cafe in Chhatarpur, Madhya Pradesh, India.",
          image: "/og-image.svg",
          keywords:
            "pizza, cafe, Chhatarpur, Madhya Pradesh, food, coffee, pizza near me, cafe near me",
          isFamilyFriendly: false,
          priceRange: "₹500-₹1500",
          areaServed: "Chhatarpur, Madhya Pradesh, India",
          servesCuisine: ["Pizza", "Cafe"],
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
              opens: "[ADD OPEN TIME]",
              closes: "[ADD CLOSE TIME]",
            },
          ],
          address: {
            "@type": "PostalAddress",
            addressLocality: "Chhatarpur",
            addressRegion: "Madhya Pradesh",
            addressCountry: "IN",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "[ADD RATING]",
            ratingCount: "[ADD RATING COUNT]",
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
      <main className="cafe-home cafe-paper-texture">
        <CafeNav />

        <section className="cafe-hero" aria-labelledby="hero-title">
          <div className="cafe-hero-layout">
            <div className="cafe-hero-copy">
              <p className="cafe-eyebrow">
                <span className="cafe-eyebrow-dot" aria-hidden="true" />
                PIZZA, CAFÉ & GOOD TIMES
              </p>

              <h1 className="cafe-hero-title" id="hero-title">
                <span className="cafe-title-line cafe-title-seven">Ek Bite.</span>
                <span className="cafe-title-line">Phir Saat.</span>
              </h1>

              <div className="cafe-script-note" aria-label="cheese-approved">
                <span>cheese-</span>
                <span>approved</span>
                <svg className="cafe-note-arrow" viewBox="0 0 60 44" aria-hidden="true">
                  <path d="M4 7c11 1 20 6 23 16 2 7 0 11-2 15m0 0 9-6m-9 6-2-11" />
                </svg>
              </div>

              <p className="cafe-hero-subtitle">
                Chhatarpur, <strong>thoda cheesy</strong> ho jaaye? One slice, one sip, full-on good
                mood.
              </p>

              <div className="cafe-hero-actions">
                <Button asChild variant="pepperoni" size="lg" className="cafe-button-hero">
                  <a href="#order">
                    Order Now <ArrowUpRight aria-hidden="true" />
                  </a>
                </Button>
                <Button asChild variant="paper" size="lg" className="cafe-button-hero">
                  <a href="#full-menu">
                    See Menu <ArrowDownRight aria-hidden="true" />
                  </a>
                </Button>
              </div>

              <p className="cafe-trust-note">
                <Star aria-hidden="true" />
                <span>Good food, great company.</span>
                <span className="cafe-trust-placeholder">(Google rating coming soon)</span>
              </p>
            </div>

            <div
              className="cafe-hero-art"
              aria-label="Illustration of a cheesy pepperoni pizza slice"
            >
              <div className="cafe-hero-glow" aria-hidden="true" />

              <Sparkles className="cafe-spark cafe-spark-one" aria-hidden="true" />
              <Sparkles className="cafe-spark cafe-spark-two" aria-hidden="true" />
              <img
                className="cafe-pizza-sticker"
                src={pizzaSticker}
                alt="A cheesy pepperoni pizza slice with golden cheese drips"
                width={1200}
                height={1200}
                fetchPriority="high"
                decoding="async"
              />
              <span className="cafe-pizza-caption">One more bite?</span>
              <span className="cafe-hero-tape">Made for sharing (maybe)</span>
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
