import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  FileText,
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
import { formatRupees } from "@/lib/money";
import { calculateOrderPrice } from "@/lib/pricing-service";
import {
  addToCart,
  createTableCall,
  getAppliedCoupon,
  getCartItems,
  getOrders,
  setSelectedOrderType,
  subscribeToStore,
} from "@/lib/order-store";
import menuData from "@/data/menu.json";
import { menuCategories, type MenuCategory, type MenuItem } from "@/config/site";

const allMenuItems = menuData as MenuItem[];

export const Route = createFileRoute("/t/$token")({
  head: () => ({
    meta: [
      { title: "Table Dine-In Order | 7 Bites Cafe" },
      {
        name: "description",
        content: "Scan, order, and dine at 7 Bites Cafe Chhatarpur.",
      },
    ],
  }),
  component: TableQRPage,
});

function TableQRPage() {
  const { token } = useParams({ from: "/t/$token" });
  const navigate = useNavigate();

  // Normalize token to table name (e.g. table-5 -> Table 5, or 5 -> Table 5)
  const tableName = useMemo(() => {
    const raw = token.replace(/^table-?/i, "").toUpperCase();
    return raw ? `Table ${raw}` : "Table Dine-In";
  }, [token]);

  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeItemForCustomization, setActiveItemForCustomization] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto set order type to DINE_IN for this page
  useEffect(() => {
    setSelectedOrderType("DINE_IN");
  }, []);

  const [, setTick] = useState(0);
  useEffect(() => {
    return subscribeToStore(() => setTick((t) => t + 1));
  }, []);

  const cartItems = getCartItems();
  const appliedCoupon = getAppliedCoupon();
  const pricing = calculateOrderPrice({
    items: cartItems,
    orderType: "DINE_IN",
    couponCode: appliedCoupon,
  });

  const handleCallWaiter = () => {
    createTableCall(tableName, "CALL_WAITER", "Customer requested waiter assistance");
    setToastMessage("Waitstaff notified! Someone will assist you shortly.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRequestBill = () => {
    createTableCall(tableName, "BILL_REQUEST", "Customer requested final bill");
    setToastMessage("Bill requested! Cashier will bring the invoice.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredItems = useMemo(() => {
    return allMenuItems.filter((item) => {
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1410] flex flex-col font-sans pb-28">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 max-w-md mx-auto z-50 bg-[#1C1410] text-white p-3 rounded-2xl shadow-xl border border-white/20 flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <span>🔔 {toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white/70">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Seated Table Banner */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#1C1410]/10 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#C83B1E] text-white flex items-center justify-center font-black text-sm shadow-xs">
              {tableName.replace("Table ", "T")}
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-black text-base text-[#1C1410]">
                <span>7 Bites Cafe</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
                  {tableName}
                </span>
              </div>
              <p className="text-[11px] text-[#5C564B]">
                Order directly to kitchen · Zero waiting
              </p>
            </div>
          </div>

          {/* Quick Table Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCallWaiter}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-[#1C1410]/15 hover:border-[#1C1410]/40 text-xs font-bold text-[#1C1410] flex items-center gap-1 shadow-2xs transition active:scale-95"
              title="Call Waiter"
            >
              <Bell className="w-3.5 h-3.5 text-[#C83B1E]" />
              <span className="hidden sm:inline">Call Waiter</span>
            </button>
            <button
              onClick={handleRequestBill}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-[#1C1410]/15 hover:border-[#1C1410]/40 text-xs font-bold text-[#1C1410] flex items-center gap-1 shadow-2xs transition active:scale-95"
              title="Request Bill"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Request Bill</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="max-w-4xl mx-auto px-4 pb-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === "All"
                ? "bg-[#C83B1E] text-white shadow-xs"
                : "bg-white text-[#5C564B] border border-[#1C1410]/10"
            }`}
          >
            All Items
          </button>
          {menuCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-[#C83B1E] text-white shadow-xs"
                  : "bg-white text-[#5C564B] border border-[#1C1410]/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-4xl mx-auto px-4 py-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredItems.map((item) => {
            const price = item.sizes && item.sizes.length > 0 ? item.sizes[0].price : item.price;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#1C1410]/10 p-3.5 flex items-center justify-between gap-3 shadow-xs"
              >
                {item.image && (
                  <div className="w-16 h-16 rounded-xl bg-[#FAF7F2] p-1 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-[#1C1410] line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-[#5C564B] line-clamp-1">
                    {item.description}
                  </p>
                  <div className="font-mono font-bold text-xs text-[#1C1410] mt-1">
                    ₹{price}
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => setActiveItemForCustomization(item)}
                  className="bg-white hover:bg-[#C83B1E] text-[#C83B1E] hover:text-white border border-[#C83B1E] text-xs font-bold px-3 py-1.5 rounded-xl h-auto transition"
                >
                  ADD +
                </Button>
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Bottom Cart Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#1C1410] text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#C83B1E] flex items-center justify-center font-bold text-xs">
                {pricing.itemCount}
              </span>
              <div className="text-left leading-tight">
                <div className="text-[10px] text-white/70 uppercase">
                  {tableName} Tab
                </div>
                <div className="font-mono font-bold text-sm text-[#F59E0B]">
                  {formatRupees(pricing.total)}
                </div>
              </div>
            </div>
            <span className="font-bold text-xs bg-white/10 px-3 py-1.5 rounded-lg">
              Send to Kitchen →
            </span>
          </button>
        </div>
      )}

      {/* Customizer */}
      <OrderCustomizerModal
        item={activeItemForCustomization}
        isOpen={!!activeItemForCustomization}
        onClose={() => setActiveItemForCustomization(null)}
        onAddToCart={(cartItem) => addToCart(cartItem)}
      />

      {/* Cart Drawer */}
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
