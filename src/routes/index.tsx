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
                Ek Bite. <span className="cafe-title-seven">Phir Saat.</span>
              </h1>

              <p className="cafe-hero-subtitle">
                Craving <strong>golden cheese pulls</strong>, gourmet burgers, sizzling momos, or rich chilled coffee?
                Welcome to 7 Bites Cafe — handcrafted for sharing smiles and delicious bites in Jabalpur (Gohalpur Amkhera, Jagriti Nagar).
              </p>

              <div className="cafe-hero-actions">
                <Button asChild variant="pepperoni" size="lg" className="cafe-button-hero">
                  <a href="#reserve">
                    Book Table / Reserve <ArrowUpRight aria-hidden="true" />
                  </a>
                </Button>
                <Button asChild variant="paper" size="lg" className="cafe-button-hero">
                  <a href="#full-menu">
                    Explore Menu <ArrowDownRight aria-hidden="true" />
                  </a>
                </Button>
              </div>

              <div className="cafe-trust-note">
                <div className="cafe-trust-stars" aria-label="5 star rating">
                  <Star aria-hidden="true" />
                  <Star aria-hidden="true" />
                  <Star aria-hidden="true" />
                  <Star aria-hidden="true" />
                  <Star aria-hidden="true" />
                </div>
                <span>4.8 Rating on Google</span>
                <span className="cafe-trust-placeholder">· 15,000+ Happy Foodies</span>
              </div>
            </div>

            <div
              className="cafe-hero-art"
              aria-label="Illustration of a cheesy pepperoni pizza slice"
            >
              <div className="cafe-hero-glow" aria-hidden="true" />

              <img
                className="cafe-pizza-sticker"
                src={pizzaSticker}
                alt="A cheesy pepperoni pizza slice with golden cheese drips"
                width={1200}
                height={1200}
                fetchPriority="high"
                decoding="async"
              />
              <div className="cafe-hero-pill-badge cafe-hero-pill-1">
                <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
                <span>100% Real Mozzarella</span>
              </div>
              <div className="cafe-hero-pill-badge cafe-hero-pill-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" aria-hidden="true" />
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
