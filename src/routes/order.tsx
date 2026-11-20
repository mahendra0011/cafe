import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Flame,
  MapPin,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderCustomizerModal } from "@/components/cafe/order-customizer-modal";
import { CartDrawer } from "@/components/cafe/cart-drawer";
import { formatRupees, toPaise } from "@/lib/money";
import {
  calculateOrderPrice,
  type CartItem,
} from "@/lib/pricing-service";
import {
  addToCart,
  getAppliedCoupon,
  getCartItems,
  getSelectedOrderType,
  setSelectedOrderType,
  subscribeToStore,
} from "@/lib/order-store";
import menuData from "@/data/menu.json";
import { menuCategories, type MenuCategory, type MenuItem } from "@/config/site";

const allMenuItems = menuData as MenuItem[];

export const Route = createFileRoute("/order")({
  head: () => ({
    meta: [
      { title: "Order Online | 7 Bites Cafe Chhatarpur" },
      {
        name: "description",
        content:
          "Order freshly stone-baked pizza, artisanal cold coffees, burgers and sides for table dine-in or counter takeaway from 7 Bites Cafe Chhatarpur.",
      },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [activeItemForCustomization, setActiveItemForCustomization] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Reactive store state
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

  const filteredItems = useMemo(() => {
    return allMenuItems.filter((item) => {
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }
      if (vegOnly && item.diet !== "veg") {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [selectedCategory, vegOnly, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1410] flex flex-col font-sans pb-28">
      {/* Top Banner & Header */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#1C1410]/10 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-xl bg-white border border-[#1C1410]/10 hover:border-[#1C1410]/30 transition shadow-xs text-[#1C1410]"
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base md:text-lg tracking-tight">
                  7 Bites Cafe
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  OPEN NOW
                </span>
              </div>
              <p className="text-[11px] text-[#5C564B] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#C83B1E]" /> 15-20 min prep · Chhatarpur (MP)
              </p>
            </div>
          </div>

          {/* Quick Order Type Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white border border-[#1C1410]/15 rounded-xl shadow-xs">
            <button
              onClick={() => setSelectedOrderType("DINE_IN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                orderType === "DINE_IN"
                  ? "bg-[#C83B1E] text-white"
                  : "text-[#5C564B] hover:text-[#1C1410]"
              }`}
            >
              <UtensilsCrossed className="w-3 h-3" /> Table Dine-In
            </button>
            <button
              onClick={() => setSelectedOrderType("PICKUP")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                orderType === "PICKUP"
                  ? "bg-[#1C1410] text-white"
                  : "text-[#5C564B] hover:text-[#1C1410]"
              }`}
            >
              <Clock className="w-3 h-3" /> Counter Takeaway
            </button>
          </div>
        </div>

        {/* Search & Veg Filter Strip */}
        <div className="max-w-6xl mx-auto px-4 pb-3 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8375]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pizzas, burgers, cold coffees..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-[#1C1410]/15 text-xs text-[#1C1410] placeholder:text-[#8A8375] focus:outline-none focus:border-[#1C1410]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8375] hover:text-[#1C1410]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Veg Only Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              vegOnly
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-white text-[#5C564B] border-[#1C1410]/15 hover:border-[#1C1410]/30"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-xs border border-current flex items-center justify-center p-0.5">
              <span className="w-1 h-1 rounded-full bg-current" />
            </span>
            <span>Veg Only</span>
          </button>
        </div>

        {/* Sticky Horizontal Category Chips */}
        <div className="max-w-6xl mx-auto px-4 pb-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === "All"
                ? "bg-[#C83B1E] text-white shadow-xs"
                : "bg-white text-[#5C564B] border border-[#1C1410]/10 hover:border-[#1C1410]/30"
            }`}
          >
            All Items ({allMenuItems.length})
          </button>
          {menuCategories.map((cat) => {
            const count = allMenuItems.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-[#C83B1E] text-white shadow-xs"
                    : "bg-white text-[#5C564B] border border-[#1C1410]/10 hover:border-[#1C1410]/30"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full">
        {/* Category Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#1C1410] tracking-tight">
              {selectedCategory === "All" ? "Freshly Prepared Craving" : selectedCategory}
            </h1>
            <p className="text-xs text-[#5C564B]">
              Showing {filteredItems.length} mouth-watering dishes crafted with love
            </p>
          </div>

          <div className="text-xs font-semibold text-[#8A8375] hidden sm:block">
            ⚡ Quick 15 min preparation
          </div>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#1C1410]/10 p-10 text-center max-w-md mx-auto my-12 shadow-sm">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-base font-bold text-[#1C1410]">No dishes found</h3>
            <p className="text-xs text-[#5C564B] mt-1">
              Try searching for something else or clear the filters.
            </p>
            <Button
              onClick={() => {
                setSelectedCategory("All");
                setVegOnly(false);
                setSearchQuery("");
              }}
              className="mt-4 bg-[#1C1410] hover:bg-black text-white text-xs font-bold rounded-xl"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          /* Food Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const startingPrice = item.sizes && item.sizes.length > 0
                ? Math.min(...item.sizes.map((s) => s.price))
                : item.price;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#1C1410]/10 hover:border-[#1C1410]/30 transition shadow-xs hover:shadow-md p-4 flex flex-col justify-between group"
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    {item.image && (
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-[#FAF7F2] border border-[#1C1410]/5 p-1.5 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`w-3 h-3 rounded-xs border flex items-center justify-center p-0.5 ${
                            item.diet === "veg"
                              ? "border-emerald-600 bg-emerald-50"
                              : "border-rose-600 bg-rose-50"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.diet === "veg" ? "bg-emerald-600" : "bg-rose-600"
                            }`}
                          />
                        </span>
                        {item.bestseller && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md">
                            ★ Bestseller
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm md:text-base text-[#1C1410] line-clamp-1 leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#5C564B] line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom: Price & Add Button */}
                  <div className="mt-4 pt-3 border-t border-[#1C1410]/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#8A8375] font-medium">
                        {item.sizes && item.sizes.length > 0 ? "Starts from" : "Price"}
                      </div>
                      <div className="font-mono font-bold text-base text-[#1C1410]">
                        ₹{startingPrice}
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => setActiveItemForCustomization(item)}
                      className="bg-white hover:bg-[#C83B1E] text-[#C83B1E] hover:text-white border-2 border-[#C83B1E] font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1 group/btn"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>ADD</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Sticky Bottom Cart Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#1C1410] hover:bg-black text-white p-3.5 rounded-2xl shadow-xl border-2 border-[#FAF7F2] flex items-center justify-between transition transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C83B1E] flex items-center justify-center font-bold text-sm text-white">
                {pricing.itemCount}
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs text-[#FAF7F2]/80 uppercase tracking-wider font-semibold">
                  {orderType} • {pricing.itemCount} items
                </div>
                <div className="font-mono font-bold text-base text-[#F59E0B]">
                  {formatRupees(pricing.total)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-bold text-sm bg-white/10 py-1.5 px-3 rounded-xl">
              <span>View Cart</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Item Customizer Modal */}
      <OrderCustomizerModal
        item={activeItemForCustomization}
        isOpen={!!activeItemForCustomization}
        onClose={() => setActiveItemForCustomization(null)}
        onAddToCart={(cartItem) => {
          addToCart(cartItem);
        }}
      />

      {/* Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={(publicId) => {
          navigate({ to: "/order/$publicId", params: { publicId } });
        }}
      />
    </div>
  );
}
