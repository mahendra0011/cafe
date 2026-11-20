import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, ShoppingBag, Sparkles, Star, UtensilsCrossed, X } from "lucide-react";
import { CafeNav } from "@/components/cafe/cafe-nav";
import { CafeFloatingActions } from "@/components/cafe/cafe-floating";
import { CafeBackToTop } from "@/components/cafe/cafe-backtotop";
import { MenuItemCard, formatPrice, itemPrice } from "@/components/cafe/menu-card";
import { Button } from "@/components/ui/button";
import { cafeSite, menuCategories, type MenuCategory, type MenuItem } from "@/config/site";
import menuData from "@/data/menu.json";

type DietFilter = "all" | "veg" | "non-veg";
type MenuSize = NonNullable<MenuItem["sizes"]>[number]["label"];
type OrderPick = { key: string; item: MenuItem; size?: MenuSize | undefined };

const items = menuData as MenuItem[];

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Complete Menu | 7 Bites Cafe Chhatarpur" },
      {
        name: "description",
        content:
          "Explore all stone-baked pizzas, gourmet smash burgers, steamed momos, creamy pastas, and signature cold coffees at 7 Bites Cafe in Chhatarpur.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [category, setCategory] = useState<MenuCategory | "All">("All");
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
        const matchesCategory = category === "All" || item.category === category;
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

      {/* Header */}
      <section className="cafe-menu-page-header">
        <div className="cafe-section-inner">
          <p className="cafe-section-eyebrow">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Crafted With Love
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1C1410] tracking-tight font-display mb-4">
            Our Complete Menu
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
            From stone-baked pizzas with rich cheese pulls to chilled artisan coffees, find your favorite craving in Chhatarpur.
          </p>
        </div>
      </section>

      {/* Controls & Grid */}
      <section className="cafe-section-inner mt-4">
        <div className="cafe-menu-controls">
          <div className="cafe-category-tabs" role="group" aria-label="Filter by menu category">
            {["All", ...menuCategories].map((value) => (
              <button
                key={value}
                type="button"
                className={`cafe-filter-pill cafe-button ${category === value ? "is-active" : "cafe-button-outline"}`}
                aria-pressed={category === value}
                onClick={() => setCategory(value as MenuCategory | "All")}
              >
                {value}
              </button>
            ))}
          </div>

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

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6 text-sm text-gray-500 font-semibold px-1">
          <span>Showing {filtered.length} delicious items</span>
          {category !== "All" && (
            <button
              onClick={() => setCategory("All")}
              className="text-red-700 hover:underline"
            >
              Clear filter
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
              © {new Date().getFullYear()} {cafeSite.name}. Handcrafted with love in Chhatarpur.
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
