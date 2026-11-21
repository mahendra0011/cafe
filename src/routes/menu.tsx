import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
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
import { CartDrawer } from "@/components/cafe/cart-drawer";
import { Button } from "@/components/ui/button";
import { cafeSite, type MenuItem } from "@/config/site";
import { formatRupees, toPaise } from "@/lib/money";
import { calculateOrderPrice } from "@/lib/pricing-service";
import {
  addToCart,
  getAppliedCoupon,
  getCartItems,
  getSelectedOrderType,
  subscribeToStore,
} from "@/lib/order-store";
import menuData from "@/data/menu.json";

type DietFilter = "all" | "veg" | "non-veg";
type MenuSize = NonNullable<MenuItem["sizes"]>[number]["label"];
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
  const navigate = useNavigate();
  const [category, setCategory] = useState<TabKey>("Pizza");
  const [diet, setDiet] = useState<DietFilter>("all");
  const [query, setQuery] = useState("");
  const [bestsellers, setBestsellers] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Synchronize reactively with global application order-store
  const [, setTick] = useState(0);
  useEffect(() => {
    return subscribeToStore(() => setTick((t) => t + 1));
  }, []);

  const cartItems = getCartItems();
  const orderType = getSelectedOrderType();
  const appliedCoupon = getAppliedCoupon();

  const pricing = calculateOrderPrice({
    items: cartItems,
    orderType,
    couponCode: appliedCoupon,
  });

  const addItem = (item: MenuItem, size?: MenuSize) => {
    const unitPrice = itemPrice(item, size);
    const unitPricePaise = toPaise(unitPrice);

    // Add to central application cart store immediately
    addToCart({
      itemId: item.id,
      name: item.name,
      foodType: (item.diet === "non-veg" ? "non-veg" : item.diet === "egg" ? "egg" : "veg") as "veg" | "non-veg" | "egg",
      unitPrice: unitPricePaise,
      qty: 1,
      size: size,
    });
  };

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

  return (
    <main className="cafe-home min-h-screen pb-20">
      <CafeNav onOpenCart={() => setIsCartOpen(true)} />

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
      </section>

      {/* Viewport-Fixed Floating Bottom Cart Bar */}
      {cartItems.length > 0 && (
        <aside
          className="fixed bottom-5 left-4 right-4 max-w-xl mx-auto z-40 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
          aria-label="Current Cart Order Bar"
        >
          <div className="bg-[#1C1410] text-white p-3 md:p-3.5 rounded-2xl shadow-2xl border-2 border-[#FAF7F2]/40 flex items-center justify-between gap-3 backdrop-blur-md">
            {/* Left: Cart Count Badge & Total Price */}
            <button
              type="button"
              className="flex items-center gap-3 cursor-pointer select-none text-left flex-1 min-w-0 group"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open Cart Drawer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#C83B1E] group-hover:bg-[#D8381D] flex items-center justify-center font-black text-sm text-white shrink-0 shadow-md shadow-[#C83B1E]/40 transition">
                {pricing.itemCount}
              </div>
              <div className="min-w-0 leading-tight">
                <div className="text-[11px] text-[#FAF7F2]/80 uppercase tracking-wider font-bold truncate">
                  {orderType === "DINE_IN"
                    ? "Table Dine-In"
                    : orderType === "PICKUP"
                      ? "Counter Takeaway"
                      : "Delivery"} • {pricing.itemCount} {pricing.itemCount === 1 ? "item" : "items"}
                </div>
                <div className="font-mono font-black text-lg text-[#F59E0B]">
                  {formatRupees(pricing.total)}
                </div>
              </div>
            </button>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`https://wa.me/${cafeSite.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `*Order from 7 Bites Cafe Menu*\n\nItems:\n• ` +
                    cartItems
                      .map(
                        (c) =>
                          `${c.name}${c.size ? ` (${c.size})` : ""} x${c.qty} - ${formatRupees(c.unitPrice * c.qty)}`,
                      )
                      .join("\n• ") +
                    `\n\nTotal: ${formatRupees(pricing.total)}`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold transition shadow-xs"
                title="Order via WhatsApp"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#C83B1E] hover:bg-[#D8381D] text-white text-xs md:text-sm font-black transition flex items-center gap-1.5 shadow-md shadow-[#C83B1E]/30 active:scale-95 cursor-pointer"
              >
                <span>View Cart</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={(publicId) => {
          navigate({ to: "/order/$publicId", params: { publicId } });
        }}
      />

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
