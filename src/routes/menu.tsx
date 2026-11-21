import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Search,
  ShoppingBag,
  Star,
  Utensils,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { CafeNav } from "@/components/cafe/cafe-nav";
import { CafeFloatingActions } from "@/components/cafe/cafe-floating";
import { CafeBackToTop } from "@/components/cafe/cafe-backtotop";
import { MenuItemCard, formatPrice, itemPrice } from "@/components/cafe/menu-card";
import { Button } from "@/components/ui/button";
import { cafeSite, type MenuItem } from "@/config/site";
import menuData from "@/data/menu.json";

type DietFilter = "all" | "veg" | "non-veg";
type MenuSize = NonNullable<MenuItem["sizes"]>[number]["label"];
type OrderPick = { key: string; item: MenuItem; size?: MenuSize | undefined };
type TabKey = "Pizza" | "Burgers" | "Pasta" | "Snacks" | "Beverages" | "Desserts" | "All";

const items = menuData as MenuItem[];

const menuTabList: { id: TabKey; label: string; icon: string }[] = [
  { id: "Pizza", label: "Pizzas", icon: "🍕" },
  { id: "Burgers", label: "Burgers", icon: "🍔" },
  { id: "Pasta", label: "Pastas", icon: "🍝" },
  { id: "Snacks", label: "Snacks", icon: "🍟" },
  { id: "Beverages", label: "Beverages", icon: "🥤" },
  { id: "Desserts", label: "Desserts", icon: "🍰" },
  { id: "All", label: "All Items →", icon: "" },
];

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Complete Menu | 7 Bites Cafe Jabalpur" },
      {
        name: "description",
        content:
          "Explore all stone-baked pizzas, gourmet smash burgers, steamed momos, creamy pastas, and signature cold coffees at 7 Bites Cafe in Jabalpur.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [category, setCategory] = useState<TabKey>("Pizza");
  const [diet, setDiet] = useState<DietFilter>("all");
  const [query, setQuery] = useState("");
  const [bestsellers, setBestsellers] = useState(false);
  const [selected, setSelected] = useState<OrderPick[]>([]);

  const addItem = (item: MenuItem, size?: MenuSize) =>
    setSelected((current) => [
      ...current,
      { key: `${item.id}-${Date.now()}-${current.length}`, item, size },
    ]);

  const removeItem = (key: string) =>
    setSelected((current) => current.filter((pick) => pick.key !== key));

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        let matchesCategory = true;
        if (category === "Pizza") {
          matchesCategory = item.category === "Pizza";
        } else if (category === "Burgers") {
          matchesCategory = item.category === "Burgers";
        } else if (category === "Pasta") {
          matchesCategory = item.category === "Pasta";
        } else if (category === "Snacks") {
          matchesCategory =
            item.category === "Fries & Sides" ||
            item.category === "Momos" ||
            item.category === "Sandwiches";
        } else if (category === "Beverages") {
          matchesCategory =
            item.category === "Hot Beverages" ||
            item.category === "Cold Coffee" ||
            item.category === "Shakes";
        } else if (category === "Desserts") {
          matchesCategory = item.category === "Desserts";
        } else if (category === "All") {
          matchesCategory = true;
        }

        const matchesDiet = diet === "all" || item.diet === diet;
        const matchesSearch = `${item.name} ${item.description} ${item.category}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        return matchesCategory && matchesDiet && matchesSearch && (!bestsellers || item.bestseller);
      }),
    [category, diet, query, bestsellers],
  );

  const totalAmount = useMemo(
    () => selected.reduce((sum, { item, size }) => sum + itemPrice(item, size), 0),
    [selected],
  );

  return (
    <main className="cafe-home min-h-screen pb-20">
      <CafeNav />

      {/* 7 Bites Menu Page Hero Banner */}
      <section className="cafe-menu-hero-banner" aria-labelledby="menu-hero-title">
        <div className="cafe-menu-hero-inner">
          <div className="cafe-menu-hero-copy">
            {/* Eyebrow: Our Menu */}
            <div className="cafe-menu-hero-eyebrow">
              <Utensils className="w-3.5 h-3.5 text-[#D82103]" aria-hidden="true" />
              <span>Our Menu</span>
            </div>

            {/* 3D Headline */}
            <h1 className="cafe-menu-hero-title" id="menu-hero-title">
              <span className="cafe-menu-hero-title-line1">
                Delicious Food,
                {/* 3 Red Burst Rays */}
                <svg
                  className="cafe-menu-hero-burst"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D82103"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="6" y1="18" x2="2" y2="14" />
                  <line x1="12" y1="17" x2="12" y2="10" />
                  <line x1="18" y1="18" x2="22" y2="14" />
                </svg>
              </span>
              <span className="cafe-menu-hero-title-line2">
                Just a Click Away!
                {/* Curved swoop underline */}
                <svg
                  className="cafe-menu-hero-swoop"
                  viewBox="0 0 280 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M4 14C80 4 200 4 276 12C220 15 100 16 4 14Z" fill="#D82103" />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="cafe-menu-hero-subtitle">
              Explore our wide range of pizzas, burgers, pastas and more.
            </p>

            {/* Category Filter Tabs */}
            <div className="cafe-menu-hero-tabs" role="group" aria-label="Filter menu by category">
              {menuTabList.map((tab) => {
                const isActive = category === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`cafe-menu-hero-tab ${isActive ? "is-active" : ""}`}
                    aria-pressed={isActive}
                    onClick={() => setCategory(tab.id)}
                  >
                    {tab.icon && (
                      <span className="cafe-menu-hero-tab-icon" aria-hidden="true">
                        {tab.icon}
                      </span>
                    )}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Spacer column so the floating pizza slice and cheese pull shine through */}
          <div className="cafe-menu-hero-spacer" aria-hidden="true" />
        </div>
      </section>

      {/* Controls & Grid */}
      <section className="cafe-section-inner mt-8">
        <div className="cafe-menu-filter-bar">
          <div className="cafe-filter-row">
            <label className="cafe-search-box">
              <Search aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search pizza, burger, momos, pasta, cold coffee..."
              />
            </label>

            <label className="cafe-select-label">
              <span className="sr-only">Diet preference</span>
              <select value={diet} onChange={(event) => setDiet(event.target.value as DietFilter)}>
                <option value="all">All Dishes</option>
                <option value="veg">Veg Only</option>
                <option value="non-veg">Non-Veg</option>
              </select>
            </label>

            <button
              type="button"
              className={`cafe-filter-pill cafe-button ${bestsellers ? "is-active" : "cafe-button-outline"}`}
              aria-pressed={bestsellers}
              onClick={() => setBestsellers((value) => !value)}
            >
              <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              Bestsellers Only
            </button>
          </div>
        </div>

        {/* Results Count & active filter chip */}
        <div className="flex justify-between items-center mb-6 text-sm text-gray-500 font-semibold px-1">
          <span>
            Showing {filtered.length} delicious {category === "All" ? "dishes" : category.toLowerCase()}
          </span>
          {category !== "All" && (
            <button
              onClick={() => setCategory("All")}
              className="text-[#D82103] font-bold hover:underline"
            >
              Show all items
            </button>
          )}
        </div>

        {/* Menu Cards Grid */}
        <div className="cafe-menu-grid">
          {filtered.length ? (
            filtered.map((item) => (
              <MenuItemCard key={item.id} item={item} onAdd={addItem} />
            ))
          ) : (
            <div className="cafe-empty-menu">
              <p>No dishes found matching "{query}". Try another craving!</p>
            </div>
          )}
        </div>

        {/* Sticky Order Tray */}
        {selected.length ? (
          <div className="cafe-order-tray" aria-live="polite">
            <div className="cafe-tray-info">
              <div className="cafe-tray-icon">
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="cafe-tray-text">
                <strong>
                  {selected.length} items selected ({formatPrice(totalAmount)})
                </strong>
                <span>
                  {selected
                    .map(({ item, size }) => `${item.name}${size ? ` (${size})` : ""}`)
                    .join(", ")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="pepperoni" size="sm" className="cafe-button">
                <a
                  href={`https://wa.me/${cafeSite.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `*Order Enquiry from 7 Bites Cafe Menu*\n\nItems:\n• ` +
                      selected
                        .map(
                          ({ item, size }) =>
                            `${item.name}${size ? ` (${size})` : ""} - ${formatPrice(itemPrice(item, size))}`,
                        )
                        .join("\n• ") +
                      `\n\nTotal: ${formatPrice(totalAmount)}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <UtensilsCrossed className="w-4 h-4 mr-1.5" />
                  Order on WhatsApp ({formatPrice(totalAmount)}) <ArrowUpRight className="w-4 h-4" />
                </a>
              </Button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-black/5 text-gray-500 hover:text-black"
                aria-label="Clear selected items"
                onClick={() => selected.forEach(({ key }) => removeItem(key))}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* Quick Footer Links */}
      <footer className="cafe-footer mt-28">
        <div className="cafe-section-inner">
          <div className="cafe-footer-top">
            <Link className="cafe-footer-mark" to="/">
              <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white text-base font-bold">
                7B
              </span>
              7 Bites <span>Cafe</span>
            </Link>

            <div className="cafe-footer-links">
              <Link to="/">Home</Link>
              <Link to="/menu">Menu</Link>
              <a href="/#signature">Signature</a>
              <a href="/#offers">Combos</a>
              <a href="/#visit">Location</a>
              <a href="/#order">Book Table</a>
            </div>

            <Link className="cafe-back-top" to="/">
              Back to Home
            </Link>
          </div>

          <div className="cafe-footer-bottom">
            <span>
              © {new Date().getFullYear()} {cafeSite.name}. Handcrafted with love in Jabalpur.
            </span>
            <span>Dine-In, Takeaway & Delivery.</span>
          </div>
        </div>
      </footer>

      <CafeFloatingActions />
      <CafeBackToTop />
    </main>
  );
}
