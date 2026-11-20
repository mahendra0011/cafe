import { useState } from "react";
import {
  ArrowRight,
  Clock,
  MapPin,
  Minus,
  Percent,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
  User,
  X,
  CheckCircle2,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatRupees, toPaise } from "@/lib/money";
import {
  calculateOrderPrice,
  type CartItem,
  type OrderType,
  VALID_COUPONS,
} from "@/lib/pricing-service";
import {
  clearCart,
  getAppliedCoupon,
  getCartItems,
  getSelectedOrderType,
  placeOrder,
  setAppliedCoupon,
  setSelectedOrderType,
  updateCartItemQty,
} from "@/lib/order-store";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (publicId: string) => void;
}

export function CartDrawer({ isOpen, onClose, onOrderPlaced }: CartDrawerProps) {
  const items = getCartItems();
  const orderType = getSelectedOrderType();
  const appliedCoupon = getAppliedCoupon();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tableNo, setTableNo] = useState("05");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CASH">("UPI");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pricing = calculateOrderPrice({
    items,
    orderType,
    couponCode: appliedCoupon,
  });

  const handleApplyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!VALID_COUPONS[clean]) {
      setCouponError("Invalid coupon code");
      return;
    }
    if (pricing.subtotal < VALID_COUPONS[clean].minOrder) {
      setCouponError(
        `Minimum order ${formatRupees(VALID_COUPONS[clean].minOrder)} required`
      );
      return;
    }
    setCouponError("");
    setAppliedCoupon(clean);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon("");
    setCouponInput("");
    setCouponError("");
  };

  const handleCheckout = () => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    if (orderType === "DINE_IN" && !tableNo) {
      alert("Please select your Table Number (1 to 12)");
      return;
    }

    setIsSubmitting(true);
    try {
      const order = placeOrder({
        customer: {
          name: name.trim(),
          phone: phone.trim(),
          address: orderType === "DINE_IN" ? `Table ${tableNo}` : "Counter Takeaway",
        },
        orderType,
        paymentMethod: paymentMethod === "UPI" ? "UPI" : "CASH",
        couponCode: appliedCoupon,
      });

      setIsSubmitting(false);
      onClose();
      onOrderPlaced(order.publicId);
    } catch (err: any) {
      setIsSubmitting(false);
      alert(err.message || "Failed to place order");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-[#FAF7F2] border-l-2 border-[#1C1410] flex flex-col h-full"
      >
        {/* Header */}
        <SheetHeader className="p-4 bg-white border-b border-[#1C1410]/10 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#C83B1E]/10 flex items-center justify-center text-[#C83B1E]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <SheetTitle className="text-base font-bold text-[#1C1410]">
              Your Cart ({pricing.itemCount})
            </SheetTitle>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => clearCart()}
              className="text-xs font-semibold text-[#8A8375] hover:text-[#C83B1E] transition flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-white border border-[#1C1410]/10 flex items-center justify-center text-3xl mb-4 shadow-sm">
              🍕
            </div>
            <h4 className="text-lg font-bold text-[#1C1410]">Your cart is empty</h4>
            <p className="text-xs text-[#5C564B] max-w-xs mt-1">
              Add some freshly baked stone pizzas, cold coffees or burgers to get started!
            </p>
            <Button
              onClick={onClose}
              className="mt-5 bg-[#C83B1E] hover:bg-[#B33419] text-white font-bold rounded-xl text-xs py-2 px-5"
            >
              Browse Menu
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Order Type Toggle: DINE_IN vs PICKUP (No Delivery) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-white border border-[#1C1410]/10 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedOrderType("DINE_IN")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  orderType === "DINE_IN"
                    ? "bg-[#C83B1E] text-white shadow-sm"
                    : "text-[#5C564B] hover:text-[#1C1410]"
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" /> Table Dine-In (QR)
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrderType("PICKUP")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  orderType === "PICKUP"
                    ? "bg-[#1C1410] text-white shadow-sm"
                    : "text-[#5C564B] hover:text-[#1C1410]"
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Counter Takeaway
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5">
              {items.map((item) => {
                const addonsPrice = (item.addOns || []).reduce(
                  (a, b) => a + b.price,
                  0
                );
                const lineTotal = (item.unitPrice + addonsPrice) * item.qty;

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-xl border border-[#1C1410]/10 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-xs border flex items-center justify-center ${
                              item.foodType === "veg"
                                ? "border-emerald-600 bg-emerald-50"
                                : "border-rose-600 bg-rose-50"
                            }`}
                          >
                            <span
                              className={`w-1 h-1 rounded-full ${
                                item.foodType === "veg"
                                  ? "bg-emerald-600"
                                  : "bg-rose-600"
                              }`}
                            />
                          </span>
                          <span className="font-bold text-sm text-[#1C1410]">
                            {item.name}
                          </span>
                        </div>

                        {item.size && (
                          <div className="text-[11px] font-medium text-[#8A8375] mt-0.5">
                            Size: {item.size}
                          </div>
                        )}

                        {item.addOns && item.addOns.length > 0 && (
                          <div className="text-[11px] text-[#5C564B] mt-0.5">
                            + {item.addOns.map((a) => a.name).join(", ")}
                          </div>
                        )}

                        {item.specialNote && (
                          <div className="text-[10px] text-[#C83B1E] italic mt-0.5">
                            Note: {item.specialNote}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="font-bold font-mono text-sm text-[#1C1410]">
                          {formatRupees(lineTotal)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-[#1C1410]/5 flex items-center justify-between">
                      <span className="text-[11px] text-[#8A8375]">Quantity</span>
                      <div className="flex items-center border border-[#1C1410]/20 rounded-lg bg-[#FAF7F2] p-0.5">
                        <button
                          type="button"
                          onClick={() => updateCartItemQty(item.id, item.qty - 1)}
                          className="w-6 h-6 flex items-center justify-center text-[#1C1410] hover:bg-white rounded transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs font-mono">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartItemQty(item.id, item.qty + 1)}
                          className="w-6 h-6 flex items-center justify-center text-[#1C1410] hover:bg-white rounded transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupons Section */}
            <div className="p-3 bg-white rounded-xl border border-[#1C1410]/10 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1410]">
                <Percent className="w-3.5 h-3.5 text-[#C83B1E]" /> Apply Coupon
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-mono font-bold text-xs text-emerald-800">
                      {appliedCoupon} applied
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#1C1410]/15 uppercase font-mono tracking-wider focus:outline-none focus:border-[#1C1410]"
                    />
                    <Button
                      type="button"
                      onClick={() => handleApplyCoupon(couponInput)}
                      className="bg-[#1C1410] hover:bg-black text-white text-xs px-3 py-2 font-bold rounded-lg"
                    >
                      Apply
                    </Button>
                  </div>
                  {couponError && (
                    <div className="text-[11px] text-[#C83B1E] font-medium">
                      {couponError}
                    </div>
                  )}
                  {/* One-tap coupons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Object.keys(VALID_COUPONS).map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleApplyCoupon(code)}
                        className="text-[10px] font-mono font-bold py-1 px-2 rounded-md bg-[#FAF7F2] border border-[#1C1410]/15 text-[#1C1410] hover:bg-[#F59E0B]/10 hover:border-[#F59E0B] transition"
                      >
                        🏷️ {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Customer Details Form */}
            <div className="p-3 bg-white rounded-xl border border-[#1C1410]/10 space-y-2.5">
              <div className="text-xs font-bold text-[#1C1410] uppercase tracking-wider">
                Contact & Details
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 border border-[#1C1410]/15 rounded-lg px-2.5 py-1.5 bg-[#FAF7F2]/50">
                  <User className="w-3.5 h-3.5 text-[#8A8375]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name *"
                    className="flex-1 bg-transparent text-xs text-[#1C1410] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 border border-[#1C1410]/15 rounded-lg px-2.5 py-1.5 bg-[#FAF7F2]/50">
                  <Phone className="w-3.5 h-3.5 text-[#8A8375]" />
                  <span className="text-xs text-[#8A8375] font-mono">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="10-digit Mobile *"
                    className="flex-1 bg-transparent text-xs text-[#1C1410] font-mono focus:outline-none"
                  />
                </div>

                {orderType === "DINE_IN" && (
                  <div className="flex items-center gap-2 border border-[#1C1410]/15 rounded-lg px-2.5 py-1.5 bg-[#FAF7F2]/50">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-[#C83B1E]" />
                    <span className="text-xs font-bold text-[#1C1410]">Table Number:</span>
                    <select
                      value={tableNo}
                      onChange={(e) => setTableNo(e.target.value)}
                      className="flex-1 bg-transparent text-xs text-[#1C1410] font-bold focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                        <option key={n} value={n < 10 ? `0${n}` : `${n}`}>
                          Table {n} (Dine-in Floor)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-3 bg-white rounded-xl border border-[#1C1410]/10 space-y-2">
              <div className="text-xs font-bold text-[#1C1410] uppercase tracking-wider">
                Payment Option
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    paymentMethod === "UPI"
                      ? "bg-[#FAF7F2] border-[#C83B1E] ring-1 ring-[#C83B1E]"
                      : "bg-white border-[#1C1410]/15 hover:border-[#1C1410]/30"
                  }`}
                >
                  <div className="text-xs font-bold text-[#1C1410]">Pay Online (UPI)</div>
                  <div className="text-[10px] text-[#5C564B]">GPay, PhonePe, Paytm</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    paymentMethod === "CASH"
                      ? "bg-[#FAF7F2] border-[#C83B1E] ring-1 ring-[#C83B1E]"
                      : "bg-white border-[#1C1410]/15 hover:border-[#1C1410]/30"
                  }`}
                >
                  <div className="text-xs font-bold text-[#1C1410]">
                    {orderType === "DINE_IN" ? "Pay at Table / Counter" : "Pay at Pickup Counter"}
                  </div>
                  <div className="text-[10px] text-[#5C564B]">Cash or Card later</div>
                </button>
              </div>
            </div>

            {/* Bill Breakdown */}
            <div className="p-3 bg-white rounded-xl border border-[#1C1410]/10 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#5C564B]">
                <span>Item Subtotal</span>
                <span className="font-mono text-[#1C1410]">
                  {formatRupees(pricing.subtotal)}
                </span>
              </div>

              {pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({pricing.discountCode})</span>
                  <span className="font-mono">-{formatRupees(pricing.discount)}</span>
                </div>
              )}

              {orderType === "DELIVERY" && (
                <div className="flex justify-between text-[#5C564B]">
                  <span>Delivery Partner Fee</span>
                  <span className="font-mono text-[#1C1410]">
                    {pricing.deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase">
                        Free
                      </span>
                    ) : (
                      formatRupees(pricing.deliveryFee)
                    )}
                  </span>
                </div>
              )}

              {pricing.packagingFee > 0 && (
                <div className="flex justify-between text-[#5C564B]">
                  <span>Packaging Charges</span>
                  <span className="font-mono text-[#1C1410]">
                    {formatRupees(pricing.packagingFee)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-[#5C564B]">
                <span>GST (5% Restaurant Food)</span>
                <span className="font-mono text-[#1C1410]">
                  {formatRupees(pricing.tax.totalTax)}
                </span>
              </div>

              {pricing.roundOff !== 0 && (
                <div className="flex justify-between text-[#8A8375] text-[11px]">
                  <span>Round-off</span>
                  <span className="font-mono">
                    {pricing.roundOff > 0 ? "+" : ""}
                    {(pricing.roundOff / 100).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-[#1C1410]/10 flex justify-between items-center text-sm font-bold text-[#1C1410]">
                <span>Grand Total</span>
                <span className="font-mono text-base text-[#C83B1E]">
                  {formatRupees(pricing.total)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Drawer Footer */}
        {items.length > 0 && (
          <div className="p-4 bg-white border-t border-[#1C1410]/10">
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleCheckout}
              className="w-full py-6 bg-[#C83B1E] hover:bg-[#B33419] text-white font-bold rounded-xl text-base shadow-md hover:shadow-lg transition flex items-center justify-between px-5"
            >
              <div className="flex flex-col items-start leading-tight">
                <span className="text-xs font-normal opacity-90 uppercase tracking-wider">
                  {orderType} • {pricing.itemCount} items
                </span>
                <span className="font-mono text-lg">{formatRupees(pricing.total)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Place Order</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
