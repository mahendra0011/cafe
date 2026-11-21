import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  Utensils,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { CafeNav } from "@/components/cafe/cafe-nav";
import { CafeFloatingActions } from "@/components/cafe/cafe-floating";
import { CafeBackToTop } from "@/components/cafe/cafe-backtotop";
import { FoodMarker, formatPrice, itemPrice } from "@/components/cafe/menu-card";
import { getMenuItemImage, getMenuItemFallbackSticker } from "@/lib/menu-images";
import { cafeSite, type MenuCategory, type MenuItem } from "@/config/site";
import menuData from "@/data/menu.json";

type DietFilter = "all" | "veg" | "non-veg";
type MenuSize = NonNullable<MenuItem["sizes"]>[number]["label"];

type CartLine = {
  key: string;
  item: MenuItem;
  size?: MenuSize;
  quantity: number;
};

const items = menuData as MenuItem[];

// Primary Category pills as shown in reference
const categoryPills = [
  { label: "Pizzas", value: "Pizza", icon: "🍕" },
  { label: "Burgers", value: "Burgers", icon: "🍔" },
  { label: "Pastas", value: "Pasta", icon: "🍝" },
  { label: "Snacks", value: "Fries & Sides", icon: "🍟" },
  { label: "Beverages", value: "Cold Coffee", icon: "🥤" },
  { label: "Desserts", value: "Desserts", icon: "🍰" },
  { label: "All Items →", value: "All", icon: "" },
] as const;

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Delicious Food, Just a Click Away | 7 Bites Cafe Menu" },
      {
        name: "description",
        content:
          "Explore our wide range of pizzas, burgers, pastas and more at 7 Bites Cafe in Gohalpur Amkhera, Jabalpur. Order fresh stone-baked bites and thick cold brews.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuCardItem({
  item,
  onAddToCart,
}: {
  item: MenuItem;
  onAddToCart: (item: MenuItem, size: MenuSize | undefined, quantity: number) => void;
}) {
  const defaultSize = item.sizes?.[1]?.label || item.sizes?.[0]?.label;
  const [size, setSize] = useState<MenuSize | undefined>(defaultSize);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const price = itemPrice(item, size);
  const image = getMenuItemImage(item);
  const fallback = getMenuItemFallbackSticker(item);

  const handleAdd = () => {
    onAddToCart(item, size, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const isBestseller = item.bestseller || item.tag === "Bestseller";
  const isMostPopular = item.tag === "Most Popular" || item.bestseller;

  return (
    <article className="cafe-ref-card group">
      {/* Food Image Container */}
      <div className="cafe-ref-card-img-wrap">
        <img
          src={image}
          alt={item.name}
          className="cafe-ref-card-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = fallback;
          }}
        />

        {/* Veg / Non-Veg Marker on Top Left */}
        <div className="cafe-ref-card-diet">
          <FoodMarker diet={item.diet} />
        </div>

        {/* Floating Tag on Top Right */}
        {isMostPopular ? (
          <span className="cafe-ref-card-badge is-green">
            <span>★</span>
            <span>Most Popular</span>
          </span>
        ) : isBestseller ? (
          <span className="cafe-ref-card-badge is-amber">
            <span>🔥</span>
            <span>Bestseller</span>
          </span>
        ) : item.tag ? (
          <span className="cafe-ref-card-badge is-amber">
            <span>👨‍🍳</span>
            <span>{item.tag}</span>
          </span>
        ) : null}
      </div>

      {/* Card Body */}
      <div className="cafe-ref-card-body">
        <div>
          <h3 className="cafe-ref-card-title">{item.name}</h3>
          <p className="cafe-ref-card-desc">{item.description}</p>

          {/* Size Pills (if sizes exist) */}
          {item.sizes && item.sizes.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[10px] font-bold text-[#8A8375] uppercase">Size:</span>
              {item.sizes.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setSize(opt.label)}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border transition ${
                    size === opt.label
                      ? "bg-[#1C1410] text-white border-[#1C1410]"
                      : "bg-[#FAF7F2] text-[#5C564B] border-[#1C1410]/15 hover:border-[#1C1410]/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Price + Stepper + Add to Cart */}
        <div className="cafe-ref-card-footer">
          <span className="cafe-ref-card-price">{formatPrice(price)}</span>

          <div className="cafe-ref-card-actions">
            {/* Stepper [- qty +] */}
            <div className="cafe-ref-stepper" aria-label="Adjust quantity">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              className={`cafe-ref-add-btn ${isAdded ? "is-added" : ""}`}
              onClick={handleAdd}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [diet, setDiet] = useState<DietFilter>("all");
  const [query, setQuery] = useState("");
  const [bestsellersOnly, setBestsellersOnly] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);

  // Add items to cart line
  const handleAddToCart = (item: MenuItem, size: MenuSize | undefined, quantity: number) => {
    const key = `${item.id}-${size || "regular"}`;
    setCart((prev) => {
      const existing = prev.find((line) => line.key === key);
      if (existing) {
        return prev.map((line) =>
          line.key === key ? { ...line, quantity: line.quantity + quantity } : line,
        );
      }
      return [...prev, { key, item, size, quantity }];
    });
  };

  const updateQuantity = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((line) => {
          if (line.key === key) {
            const newQty = line.quantity + delta;
            return newQty > 0 ? { ...line, quantity: newQty } : null;
          }
          return line;
        })
        .filter(Boolean) as CartLine[],
    );
  };

  const removeLine = (key: string) => {
    setCart((prev) => prev.filter((line) => line.key !== key));
  };

  const clearCart = () => setCart([]);

  // Filtered dishes
  const filtered = useMemo(() => {
    return items.filter((item) => {
      // Category match
      let matchesCategory = true;
      if (activeCategory !== "All") {
        if (activeCategory === "Pizza") matchesCategory = item.category === "Pizza";
        else if (activeCategory === "Burgers") matchesCategory = item.category === "Burgers";
        else if (activeCategory === "Pasta") matchesCategory = item.category === "Pasta";
        else if (activeCategory === "Fries & Sides") {
          matchesCategory =
            item.category === "Fries & Sides" ||
            item.category === "Momos" ||
            item.category === "Sandwiches";
        } else if (activeCategory === "Cold Coffee") {
          matchesCategory =
            item.category === "Cold Coffee" ||
            item.category === "Shakes" ||
            item.category === "Hot Beverages";
        } else if (activeCategory === "Desserts") {
          matchesCategory = item.category === "Desserts";
        } else {
          matchesCategory = item.category === activeCategory;
        }
      }

      // Diet match
      const matchesDiet = diet === "all" || item.diet === diet;

      // Query search match
      const matchesSearch =
        !query.trim() ||
        `${item.name} ${item.description} ${item.category}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());

      // Bestseller match
      const matchesBestseller = !bestsellersOnly || item.bestseller || item.tag === "Bestseller";

      return matchesCategory && matchesDiet && matchesSearch && matchesBestseller;
    });
  }, [activeCategory, diet, query, bestsellersOnly]);

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, line) => sum + itemPrice(line.item, line.size) * line.quantity, 0);
  }, [cart]);

  const totalItemCount = useMemo(() => {
    return cart.reduce((sum, line) => sum + line.quantity, 0);
  }, [cart]);

  const whatsappMessage = useMemo(() => {
    if (!cart.length) return "";
    const lines = cart.map(
      (line) =>
        `• ${line.item.name}${line.size ? ` (${line.size})` : ""} × ${line.quantity} = ${formatPrice(
          itemPrice(line.item, line.size) * line.quantity,
        )}`,
    );
    return `*New Order Enquiry - 7 Bites Cafe Menu*\n\n${lines.join("\n")}\n\n*Total: ${formatPrice(
      totalAmount,
    )}*\n\nPlease confirm preparation time!`;
  }, [cart, totalAmount]);

  return (
    <main className="cafe-menu-page-wrapper">
      <CafeNav />

      {/* Header Section with 3D Typography */}
      <section className="cafe-menu-page-header">
        <div className="cafe-menu-page-header-content">
          {/* Eyebrow badge */}
          <div className="cafe-menu-page-eyebrow-wrap">
            <div className="cafe-menu-page-eyebrow">
              <Utensils className="w-3.5 h-3.5 text-[#D82103]" aria-hidden="true" />
              <span>Our Menu</span>
            </div>
          </div>

          {/* 3D Title */}
          <h1 className="cafe-menu-page-title">
            <span className="cafe-menu-page-title-brown">
              Delicious Food,
              {/* 3 Red Burst Rays */}
              <svg
                className="cafe-menu-page-burst"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="6" y1="18" x2="2" y2="14" />
                <line x1="12" y1="17" x2="12" y2="10" />
                <line x1="18" y1="18" x2="22" y2="14" />
              </svg>
            </span>
            <span className="cafe-menu-page-title-red">
              Just a Click Away!
              {/* Curved swoop underline */}
              <svg
                className="cafe-menu-page-swoop"
                viewBox="0 0 160 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M4 14C50 4 110 6 156 12C120 15 60 16 4 14Z" fill="#D82103" />
              </svg>
            </span>
          </h1>

          <p className="cafe-menu-page-subtitle">
            Explore our wide range of pizzas, burgers, pastas and more.
          </p>

          {/* Horizontal Category Filter Pills */}
          <div
            className="cafe-menu-category-bar"
            role="group"
            aria-label="Filter dishes by category"
          >
            {categoryPills.map((pill) => {
              const isActive = activeCategory === pill.value;
              return (
                <button
                  key={pill.label}
                  type="button"
                  className={`cafe-menu-cat-btn ${isActive ? "is-active" : ""}`}
                  onClick={() => setActiveCategory(pill.value)}
                  aria-pressed={isActive}
                >
                  {pill.icon && <span aria-hidden="true">{pill.icon}</span>}
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Sub-filters */}
          <div className="cafe-menu-subfilter-row">
            <label className="cafe-search-box flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pizza, burger, momos, pasta, cold coffee..."
                className="w-full bg-transparent border-none text-sm outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 text-gray-400 hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </label>

            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value as DietFilter)}
              className="bg-white border border-black/10 rounded-full px-4 py-2 text-xs font-bold text-[#1C1410] shadow-xs cursor-pointer outline-none"
            >
              <option value="all">🌱 All Dishes</option>
              <option value="veg">🟢 Veg Only</option>
              <option value="non-veg">🔴 Non-Veg Only</option>
            </select>

            <button
              type="button"
              onClick={() => setBestsellersOnly((b) => !b)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition shadow-xs cursor-pointer ${
                bestsellersOnly
                  ? "bg-[#D82103] text-white border-transparent"
                  : "bg-white text-[#1C1410] border border-black/10 hover:border-black/25"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${bestsellersOnly ? "fill-white" : "fill-amber-400 text-amber-500"}`} />
              <span>Bestsellers Only</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Layout: Cards Grid + Your Order Sidebar */}
      <div className="cafe-menu-main-layout" id="dishes-container">
        {/* Left Column: Cards Grid */}
        <div className="cafe-menu-grid-column">
          <div className="flex justify-between items-center mb-4 text-xs font-bold text-[#8A8375] px-1">
            <span>
              Showing {filtered.length} dishes in{" "}
              {activeCategory === "All" ? "all categories" : activeCategory}
            </span>
            {(activeCategory !== "All" || diet !== "all" || query || bestsellersOnly) && (
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("All");
                  setDiet("all");
                  setQuery("");
                  setBestsellersOnly(false);
                }}
                className="text-[#D82103] hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {filtered.length ? (
            <div className="cafe-menu-cards-grid">
              {filtered.map((item) => (
                <MenuCardItem
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-black/10 shadow-sm">
              <p className="text-base font-bold text-[#1C1410] mb-2">No dishes found</p>
              <p className="text-xs text-[#5C564B] mb-4">
                We couldn't find anything matching your filters. Try selecting another category!
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("All");
                  setDiet("all");
                  setQuery("");
                  setBestsellersOnly(false);
                }}
                className="cafe-button bg-[#D82103] text-white text-xs font-bold"
              >
                Show All Dishes
              </button>
            </div>
          )}
        </div>

        {/* Right Column: "Your Order" Sticky Cart Sidebar */}
        <aside className="cafe-menu-order-column">
          <div className="cafe-order-sidebar">
            {/* Header */}
            <div className="cafe-order-sidebar-head">
              <div className="cafe-order-sidebar-title">
                <ShoppingBag className="w-5 h-5 text-[#D82103]" aria-hidden="true" />
                <span>Your Order</span>
                {totalItemCount > 0 && (
                  <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-[#D82103] text-white font-bold">
                    {totalItemCount}
                  </span>
                )}
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="cafe-order-sidebar-clear"
                  title="Clear entire cart"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Empty State */}
            {cart.length === 0 ? (
              <div className="cafe-order-empty-state">
                <div className="cafe-order-empty-icon">
                  <Sparkles className="w-4 h-4 text-emerald-500 absolute -top-1 -right-1 animate-pulse" />
                  <ShoppingBag className="w-6 h-6 text-[#007A3D]" />
                </div>
                <h4 className="cafe-order-empty-title">Your cart is empty!</h4>
                <p className="cafe-order-empty-desc">
                  Add some delicious items to get started.
                </p>
                <a href="#dishes-container" className="cafe-order-browse-btn">
                  <span>Browse Menu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              /* Populated Items State */
              <>
                <div className="cafe-order-items-list">
                  {cart.map((line) => {
                    const linePrice = itemPrice(line.item, line.size);
                    return (
                      <div className="cafe-order-item-row" key={line.key}>
                        <div className="cafe-order-item-info">
                          <span className="cafe-order-item-name">
                            {line.item.name}
                            {line.size ? ` (${line.size})` : ""}
                          </span>
                          <span className="cafe-order-item-price">
                            {formatPrice(linePrice)} each
                          </span>
                        </div>

                        <div className="cafe-order-item-actions">
                          {/* Stepper */}
                          <div className="cafe-ref-stepper">
                            <button
                              type="button"
                              onClick={() => updateQuantity(line.key, -1)}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span>{line.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(line.key, 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeLine(line.key)}
                            className="p-1 text-gray-400 hover:text-[#D82103]"
                            title="Remove item"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bill Summary */}
                <div className="cafe-order-summary">
                  <div className="cafe-order-total-row">
                    <span>Total Amount</span>
                    <span className="cafe-order-total-amount">{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                {/* WhatsApp Direct Order Button */}
                <a
                  href={`https://wa.me/${cafeSite.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                    whatsappMessage,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="cafe-order-checkout-btn"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Order on WhatsApp ({formatPrice(totalAmount)})</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                <p className="text-[11px] text-center text-gray-500 mt-2">
                  Dine-in? You can also scan your table QR code inside the cafe!
                </p>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="cafe-footer mt-20">
        <div className="cafe-section-inner">
          <div className="cafe-footer-top">
            <Link className="cafe-footer-mark" to="/">
              <span className="w-8 h-8 rounded-lg bg-[#D82103] flex items-center justify-center text-white text-base font-bold">
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
