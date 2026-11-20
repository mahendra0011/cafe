import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Delete,
  DollarSign,
  Minus,
  PauseCircle,
  Percent,
  Plus,
  Printer,
  QrCode,
  RotateCcw,
  Search,
  Trash2,
  User,
  Utensils,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatInvoiceMoney, formatRupees, toPaise, type Paise } from "@/lib/money";
import {
  calculateOrderPrice,
  type CartItem,
  type OrderType,
} from "@/lib/pricing-service";
import {
  getNextOrderNo,
  getOrders,
  placeOrder,
  type CafeOrder,
} from "@/lib/order-store";
import menuData from "@/data/menu.json";
import { menuCategories, type MenuCategory, type MenuItem } from "@/config/site";

const allMenuItems = menuData as MenuItem[];

export const Route = createFileRoute("/staff/pos")({
  head: () => ({
    meta: [
      { title: "Point of Sale (POS) Billing | 7 Bites Cafe" },
      {
        name: "description",
        content: "Touch-first POS counter billing system for 7 Bites Cafe staff.",
      },
    ],
  }),
  component: PosPage,
});

function PosPage() {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("DINE_IN");
  const [tableNo, setTableNo] = useState("T1");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [couponCode, setCouponCode] = useState("");

  // Payment modal state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "CARD" | "SPLIT">("CASH");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [lastPlacedOrder, setLastPlacedOrder] = useState<CafeOrder | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Price Calculation
  const pricing = useMemo(() => {
    return calculateOrderPrice({
      items: cart,
      orderType,
      couponCode: couponCode || undefined,
    });
  }, [cart, orderType, couponCode]);

  const addToPosCart = (item: MenuItem) => {
    const defaultPrice = item.sizes && item.sizes.length > 0 ? item.sizes[0].price : item.price;
    const cartItemId = `${item.id}-pos`;

    setCart((curr) => {
      const idx = curr.findIndex((c) => c.id === cartItemId);
      if (idx > -1) {
        const copy = [...curr];
        copy[idx].qty += 1;
        return copy;
      }
      return [
        ...curr,
        {
          id: cartItemId,
          itemId: item.id,
          name: item.name,
          foodType: (item.diet === "non-veg" ? "non-veg" : item.diet === "egg" ? "egg" : "veg") as "veg" | "non-veg" | "egg",
          unitPrice: toPaise(defaultPrice),
          qty: 1,
        },
      ];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((curr) =>
      curr
        .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const handleSettlePayment = () => {
    if (cart.length === 0) return;

    try {
      const order = placeOrder({
        customer: {
          name: customerName.trim() || "Walk-in Guest",
          phone: customerPhone.trim() || "0000000000",
          tableNo: orderType === "DINE_IN" ? tableNo : undefined,
        },
        orderType,
        items: cart,
        couponCode: couponCode || undefined,
        paymentMethod: paymentMode === "UPI" ? "UPI" : "CASH",
      });

      setLastPlacedOrder(order);
      setIsPaymentOpen(false);
      setIsReceiptOpen(true);
      // Clear cart
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCouponCode("");
      setCashTendered("");
    } catch (e: any) {
      alert(e.message || "Failed to settle order");
    }
  };

  const tenderAmount = Number(cashTendered) || 0;
  const changeDue = Math.max(0, tenderAmount - pricing.total / 100);

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
    <div className="min-h-screen bg-[#F6F3EC] text-[#1C1410] flex flex-col font-sans select-none">
      {/* Top Navbar */}
      <header className="bg-[#1C1410] text-white px-5 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="font-black text-lg tracking-tight text-white hover:text-[#F59E0B] flex items-center gap-2"
          >
            <span>7 BITES</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#C83B1E] uppercase">
              POS
            </span>
          </Link>
          <span className="text-xs text-white/50">|</span>
          <div className="text-xs font-medium text-white/80">
            Shift: <span className="text-emerald-400 font-bold">OPEN</span> · Cashier Rahul
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/kitchen"
            className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl text-white transition flex items-center gap-1.5"
          >
            <span>Kitchen Display</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Split Layout: Left Menu Tiles (65%), Right Cart & Bill (35%) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Category Tabs & Food Tiles */}
        <div className="flex-1 flex flex-col bg-[#F6F3EC] border-r border-[#1C1410]/10 p-4 overflow-hidden">
          {/* Controls: Search & Order Type */}
          <div className="flex items-center gap-3 mb-3">
            {/* Order Type Toggle */}
            <div className="flex items-center p-1 bg-white rounded-xl border border-[#1C1410]/15 shadow-xs">
              {(["DINE_IN", "PICKUP", "DELIVERY"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setOrderType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                    orderType === t
                      ? "bg-[#1C1410] text-white shadow-xs"
                      : "text-[#5C564B] hover:text-[#1C1410]"
                  }`}
                >
                  {t === "DINE_IN"
                    ? "Dine-In"
                    : t === "PICKUP"
                    ? "Takeaway"
                    : "Delivery"}
                </button>
              ))}
            </div>

            {/* Table Selector for Dine-in */}
            {orderType === "DINE_IN" && (
              <select
                value={tableNo}
                onChange={(e) => setTableNo(e.target.value)}
                className="bg-white text-xs font-bold px-3 py-2 rounded-xl border border-[#1C1410]/15 text-[#1C1410] focus:outline-none"
              >
                {["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10"].map(
                  (tbl) => (
                    <option key={tbl} value={tbl}>
                      Table {tbl.replace("T", "")}
                    </option>
                  )
                )}
              </select>
            )}

            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8375]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food by name..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-white border border-[#1C1410]/15 text-[#1C1410] placeholder:text-[#8A8375] focus:outline-none"
              />
            </div>
          </div>

          {/* Horizontal Category Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === "All"
                  ? "bg-[#C83B1E] text-white shadow-xs"
                  : "bg-white text-[#5C564B] border border-[#1C1410]/10"
              }`}
            >
              All ({allMenuItems.length})
            </button>
            {menuCategories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === c
                    ? "bg-[#C83B1E] text-white shadow-xs"
                    : "bg-white text-[#5C564B] border border-[#1C1410]/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Food Tiles Grid (Touch targets 56px+) */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pr-1">
            {filteredItems.map((item) => {
              const price =
                item.sizes && item.sizes.length > 0 ? item.sizes[0].price : item.price;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addToPosCart(item)}
                  className="bg-white hover:bg-[#FAF7F2] p-3 rounded-2xl border border-[#1C1410]/15 shadow-2xs hover:shadow-md transition text-left flex flex-col justify-between active:scale-[0.98] group"
                >
                  <div className="flex items-start justify-between gap-1 w-full">
                    <span
                      className={`w-2.5 h-2.5 rounded-xs border flex items-center justify-center p-0.5 mt-0.5 ${
                        item.diet === "veg"
                          ? "border-emerald-600 bg-emerald-50"
                          : "border-rose-600 bg-rose-50"
                      }`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${
                          item.diet === "veg" ? "bg-emerald-600" : "bg-rose-600"
                        }`}
                      />
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#8A8375] uppercase truncate">
                      {item.category}
                    </span>
                  </div>

                  <div className="my-2">
                    <div className="font-extrabold text-xs text-[#1C1410] line-clamp-2 leading-snug group-hover:text-[#C83B1E] transition">
                      {item.name}
                    </div>
                  </div>

                  <div className="w-full pt-1.5 border-t border-[#1C1410]/5 flex items-center justify-between">
                    <span className="font-mono font-black text-sm text-[#1C1410]">
                      ₹{price}
                    </span>
                    <span className="w-6 h-6 rounded-lg bg-[#C83B1E]/10 text-[#C83B1E] flex items-center justify-center font-bold text-xs group-hover:bg-[#C83B1E] group-hover:text-white transition">
                      +
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Running Cart & Billing Station (35%) */}
        <div className="w-full lg:w-[380px] xl:w-[420px] bg-white flex flex-col h-full shadow-lg border-l border-[#1C1410]/15">
          {/* Cart Header */}
          <div className="p-3.5 bg-[#FAF7F2] border-b border-[#1C1410]/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1C1410] text-white flex items-center justify-center text-xs font-black">
                {orderType === "DINE_IN" ? tableNo : orderType[0]}
              </div>
              <span className="font-extrabold text-sm text-[#1C1410]">
                {orderType === "DINE_IN"
                  ? `${tableNo} · Dine-In`
                  : orderType === "PICKUP"
                  ? "Takeaway Counter"
                  : "Delivery Order"}
              </span>
            </div>

            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs font-bold text-[#8A8375] hover:text-[#C83B1E] transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-[#8A8375] text-xs">
                <div className="text-3xl mb-2">🛒</div>
                <div className="font-bold text-[#1C1410]">Cart is empty</div>
                <div>Tap dishes on the left to add items</div>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-[#1C1410]/10 bg-[#FAF7F2]/40 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-[#1C1410] truncate">
                      {item.name}
                    </div>
                    <div className="font-mono text-[11px] text-[#5C564B]">
                      {formatRupees(item.unitPrice)} each
                    </div>
                  </div>

                  {/* Quantity Controller */}
                  <div className="flex items-center border border-[#1C1410]/20 rounded-lg bg-white p-0.5">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, -1)}
                      className="w-6 h-6 flex items-center justify-center text-[#1C1410] hover:bg-[#FAF7F2] rounded"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-xs">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, 1)}
                      className="w-6 h-6 flex items-center justify-center text-[#1C1410] hover:bg-[#FAF7F2] rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="w-16 text-right font-mono font-bold text-xs text-[#1C1410]">
                    {formatRupees(item.unitPrice * item.qty)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bill Calculation & Quick Settle */}
          <div className="p-3.5 bg-[#FAF7F2] border-t border-[#1C1410]/10 space-y-2">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#5C564B]">
                <span>Subtotal ({pricing.itemCount} items)</span>
                <span className="font-mono font-bold text-[#1C1410]">
                  {formatRupees(pricing.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[#5C564B]">
                <span>GST (5% Food)</span>
                <span className="font-mono text-[#1C1410]">
                  {formatRupees(pricing.tax.totalTax)}
                </span>
              </div>
              <div className="pt-1.5 border-t border-[#1C1410]/10 flex justify-between items-center text-sm font-black text-[#1C1410]">
                <span>TOTAL</span>
                <span className="font-mono text-lg text-[#C83B1E]">
                  {formatRupees(pricing.total)}
                </span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <Button
                type="button"
                disabled={cart.length === 0}
                onClick={() => {
                  alert("Order ticket sent directly to Kitchen Display!");
                  handleSettlePayment();
                }}
                className="py-5 bg-[#1C1410] hover:bg-black text-white font-extrabold text-xs rounded-xl"
              >
                Send KOT ➔
              </Button>
              <Button
                type="button"
                disabled={cart.length === 0}
                onClick={() => setIsPaymentOpen(true)}
                className="py-5 bg-[#C83B1E] hover:bg-[#B33419] text-white font-extrabold text-xs rounded-xl shadow-xs"
              >
                PAY & PRINT 🧾
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Settlement Modal */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-md p-5 bg-[#FAF7F2] border-2 border-[#1C1410] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-[#1C1410]">
              Settle Payment · {formatRupees(pricing.total)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Mode Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode("CASH")}
                className={`py-3 px-2 rounded-xl border text-center text-xs font-bold transition ${
                  paymentMode === "CASH"
                    ? "bg-[#1C1410] text-white border-[#1C1410]"
                    : "bg-white text-[#1C1410] border-[#1C1410]/20"
                }`}
              >
                💵 Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode("UPI")}
                className={`py-3 px-2 rounded-xl border text-center text-xs font-bold transition ${
                  paymentMode === "UPI"
                    ? "bg-[#1C1410] text-white border-[#1C1410]"
                    : "bg-white text-[#1C1410] border-[#1C1410]/20"
                }`}
              >
                📱 QR / UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode("CARD")}
                className={`py-3 px-2 rounded-xl border text-center text-xs font-bold transition ${
                  paymentMode === "CARD"
                    ? "bg-[#1C1410] text-white border-[#1C1410]"
                    : "bg-white text-[#1C1410] border-[#1C1410]/20"
                }`}
              >
                💳 Card
              </button>
            </div>

            {/* Cash Tender Calculation */}
            {paymentMode === "CASH" && (
              <div className="p-4 bg-white rounded-2xl border border-[#1C1410]/15 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#1C1410]">
                  <span>Cash Received</span>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    placeholder={String(pricing.total / 100)}
                    className="w-28 text-right font-mono font-bold text-sm px-2.5 py-1.5 rounded-lg border border-[#1C1410]/20 focus:outline-none"
                  />
                </div>

                {/* Quick Cash Chips */}
                <div className="flex gap-2">
                  {[pricing.total / 100, 200, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashTendered(String(amt))}
                      className="flex-1 py-1 px-2 rounded-lg bg-[#FAF7F2] border border-[#1C1410]/15 text-[11px] font-mono font-bold text-[#1C1410] hover:border-[#1C1410]"
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#1C1410]/10 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#5C564B]">Change Due</span>
                  <span className="font-mono font-black text-sm text-emerald-700">
                    ₹{changeDue.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* UPI QR Display */}
            {paymentMode === "UPI" && (
              <div className="p-4 bg-white rounded-2xl border border-[#1C1410]/15 text-center space-y-2">
                <div className="w-28 h-28 mx-auto bg-[#FAF7F2] border border-[#1C1410]/15 rounded-xl flex items-center justify-center text-4xl shadow-2xs">
                  📱
                </div>
                <div className="text-xs font-bold text-[#1C1410]">
                  Scan & Pay {formatRupees(pricing.total)}
                </div>
                <div className="text-[11px] text-[#5C564B]">
                  UPI ID: 7bitescafe@upi · Instant verification
                </div>
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={handleSettlePayment}
            className="w-full py-6 bg-[#C83B1E] hover:bg-[#B33419] text-white font-extrabold text-sm rounded-xl shadow-md transition"
          >
            CONFIRM PAYMENT & PRINT
          </Button>
        </DialogContent>
      </Dialog>

      {/* Thermal Invoice Preview Modal */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-xs p-5 bg-white border border-[#1C1410] rounded-2xl font-mono text-xs">
          {lastPlacedOrder && (
            <div className="space-y-3 text-center">
              <div>
                <div className="font-black text-base text-black">7 BITES CAFE</div>
                <div className="text-[10px] text-gray-600">
                  Gohalpur Amkhera, Jagriti Nagar, Jabalpur (MP) 482001
                </div>
                <div className="text-[10px] text-gray-600">
                  GSTIN: 23ABCDE1234F1Z5 · FSSAI: 12345678901234
                </div>
              </div>

              <div className="border-t border-b border-dashed border-black py-1.5 text-left text-[11px] space-y-0.5">
                <div>Inv: 7B/26-27/0000{lastPlacedOrder.orderNo}</div>
                <div>Date: {new Date().toLocaleDateString("en-IN")} {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                <div>Type: {lastPlacedOrder.type} ({lastPlacedOrder.customer.tableNo || "Counter"})</div>
              </div>

              <div className="text-left space-y-1">
                {lastPlacedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {it.qty}x {it.name}
                    </span>
                    <span>{formatInvoiceMoney(it.unitPrice * it.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-black pt-2 space-y-0.5 text-left">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatInvoiceMoney(lastPlacedOrder.pricing.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>{formatInvoiceMoney(lastPlacedOrder.pricing.tax.totalTax)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-black">
                  <span>TOTAL PAID</span>
                  <span>₹{formatInvoiceMoney(lastPlacedOrder.pricing.total)}</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-gray-500">
                Thank you for visiting! Ek bite aur?
                <br />
                Follow @7bitescafe on Instagram
              </div>

              <Button
                type="button"
                onClick={() => {
                  window.print();
                  setIsReceiptOpen(false);
                }}
                className="w-full bg-[#1C1410] text-white text-xs font-bold py-2 rounded-lg"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
