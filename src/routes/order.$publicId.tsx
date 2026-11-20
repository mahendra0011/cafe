import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  HelpCircle,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupees } from "@/lib/money";
import {
  getOrder,
  subscribeToStore,
  type CafeOrder,
  type OrderStatus,
} from "@/lib/order-store";

export const Route = createFileRoute("/order/$publicId")({
  head: () => ({
    meta: [
      { title: "Track Your Order | 7 Bites Cafe" },
      {
        name: "description",
        content: "Track live status of your 7 Bites Cafe order in Chhatarpur.",
      },
    ],
  }),
  component: OrderTrackingPage,
});

const TIMELINE_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  {
    status: "PLACED",
    label: "Order Placed",
    desc: "We received your order and sent it to our counter team.",
  },
  {
    status: "CONFIRMED",
    label: "Kitchen Confirmed",
    desc: "Order accepted by Chef. Fresh dough & ingredients prepped.",
  },
  {
    status: "PREPARING",
    label: "Baking & Cooking",
    desc: "Stone oven baking with 100% mozzarella cheese & herbs.",
  },
  {
    status: "READY",
    label: "Order Ready",
    desc: "Fresh, hot & packaged. Ready for pickup or rider dispatch.",
  },
  {
    status: "COMPLETED",
    label: "Served / Delivered",
    desc: "Order fulfilled! Enjoy your bite and good times.",
  },
];

function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case "PENDING_PAYMENT":
    case "PLACED":
      return 0;
    case "CONFIRMED":
      return 1;
    case "PREPARING":
      return 2;
    case "READY":
      return 3;
    case "SERVED":
    case "PICKED_UP":
    case "OUT_FOR_DELIVERY":
    case "DELIVERED":
    case "COMPLETED":
      return 4;
    default:
      return 1;
  }
}

function OrderTrackingPage() {
  const { publicId } = useParams({ from: "/order/$publicId" });
  const [order, setOrder] = useState<CafeOrder | undefined>(() => getOrder(publicId));

  useEffect(() => {
    setOrder(getOrder(publicId));
    return subscribeToStore(() => {
      setOrder(getOrder(publicId));
    });
  }, [publicId]);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#1C1410] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-white border border-[#1C1410]/10 flex items-center justify-center text-3xl mb-4 shadow-sm">
          🔍
        </div>
        <h2 className="text-xl font-bold text-[#1C1410]">Order Not Found</h2>
        <p className="text-xs text-[#5C564B] max-w-sm mt-1 mb-6">
          Could not locate order ID "{publicId}". Please check your link or browse the menu to place a fresh order.
        </p>
        <Link
          to="/order"
          className="inline-flex items-center gap-2 bg-[#C83B1E] hover:bg-[#B33419] text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-xs transition"
        >
          <ShoppingBag className="w-4 h-4" /> Go to Online Menu
        </Link>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1410] flex flex-col font-sans pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#1C1410]/10 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/order"
            className="flex items-center gap-1.5 text-xs font-bold text-[#5C564B] hover:text-[#1C1410] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Order More
          </Link>
          <div className="text-center">
            <span className="font-mono font-bold text-sm bg-white border border-[#1C1410]/15 px-3 py-1 rounded-full text-[#1C1410] shadow-2xs">
              Order #{order.orderNo} ({order.publicId})
            </span>
          </div>
          <Link
            to="/"
            className="text-xs font-semibold text-[#8A8375] hover:text-[#1C1410]"
          >
            Home
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 py-6 w-full space-y-5">
        {/* Live Status Hero Card */}
        <div className="p-6 bg-white rounded-3xl border-2 border-[#1C1410] shadow-md relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                {order.type === "DINE_IN"
                  ? `Dine-In • Table ${order.customer.tableNo || "Counter"}`
                  : order.type === "DELIVERY"
                  ? "Home Delivery"
                  : "Takeaway Pickup"}
              </div>

              <h1 className="text-2xl font-black text-[#1C1410] tracking-tight">
                {isCancelled
                  ? "Order Cancelled"
                  : currentStep === 4
                  ? "Delivered & Completed!"
                  : currentStep === 3
                  ? "Ready for You!"
                  : currentStep === 2
                  ? "Baking in the Stone Oven 🔥"
                  : currentStep === 1
                  ? "Kitchen is Prepping 👨‍🍳"
                  : "Order Placed & Received"}
              </h1>

              <p className="text-xs text-[#5C564B] mt-1">
                Estimated turnaround: ~{order.estimatedMinutes} minutes from placement
              </p>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border border-[#1C1410]/15 flex items-center justify-center text-3xl shadow-xs">
              {currentStep === 4 ? "🎉" : currentStep === 3 ? "🥡" : currentStep === 2 ? "🍕" : "⏳"}
            </div>
          </div>

          {/* Vertical Timeline */}
          <div className="mt-8 pt-6 border-t border-[#1C1410]/10 space-y-6">
            {TIMELINE_STEPS.map((step, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={step.status} className="flex items-start gap-4 relative">
                  {/* Connecting Line */}
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={`absolute left-[15px] top-[30px] bottom-[-24px] w-0.5 transition-colors ${
                        isPast ? "bg-emerald-600" : "bg-[#1C1410]/15"
                      }`}
                    />
                  )}

                  {/* Dot/Icon */}
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 transition ${
                      isPast
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                        : isCurrent
                        ? "bg-[#C83B1E] border-[#C83B1E] text-white animate-pulse shadow-xs"
                        : "bg-[#FAF7F2] border-[#1C1410]/20 text-[#8A8375]"
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="font-mono text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-bold ${
                          isCurrent
                            ? "text-[#C83B1E]"
                            : isPast
                            ? "text-[#1C1410]"
                            : "text-[#8A8375]"
                        }`}
                      >
                        {step.label}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C83B1E]/10 text-[#C83B1E]">
                          IN PROGRESS
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5C564B] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cafe Help & Action Contacts */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href="tel:+919876543210"
            className="p-3.5 bg-white rounded-2xl border border-[#1C1410]/15 hover:border-[#1C1410]/40 transition shadow-xs flex items-center justify-center gap-2 text-xs font-bold text-[#1C1410]"
          >
            <Phone className="w-4 h-4 text-[#C83B1E]" />
            <span>Call 7 Bites</span>
          </a>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 transition rounded-2xl shadow-xs flex items-center justify-center gap-2 text-xs font-bold text-[#075E54]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Us</span>
          </a>
        </div>

        {/* Order Details & Items Card */}
        <div className="p-5 bg-white rounded-2xl border border-[#1C1410]/15 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#1C1410]/10 pb-3">
            <h3 className="font-bold text-sm text-[#1C1410]">Order Summary</h3>
            <span className="text-xs text-[#8A8375]">
              {new Date(order.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-start justify-between text-xs">
                <div>
                  <div className="font-bold text-[#1C1410]">
                    {item.qty}x {item.name} {item.size ? `(${item.size})` : ""}
                  </div>
                  {item.addOns && item.addOns.length > 0 && (
                    <div className="text-[11px] text-[#5C564B]">
                      + {item.addOns.map((a) => a.name).join(", ")}
                    </div>
                  )}
                  {item.specialNote && (
                    <div className="text-[10px] text-[#C83B1E] italic">
                      "{item.specialNote}"
                    </div>
                  )}
                </div>
                <div className="font-mono font-bold text-[#1C1410]">
                  {formatRupees(
                    (item.unitPrice +
                      (item.addOns || []).reduce((a, b) => a + b.price, 0)) *
                      item.qty
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bill Table */}
          <div className="pt-3 border-t border-[#1C1410]/10 space-y-1.5 text-xs">
            <div className="flex justify-between text-[#5C564B]">
              <span>Subtotal</span>
              <span className="font-mono">{formatRupees(order.pricing.subtotal)}</span>
            </div>
            {order.pricing.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount ({order.pricing.discountCode})</span>
                <span className="font-mono">-{formatRupees(order.pricing.discount)}</span>
              </div>
            )}
            {order.pricing.deliveryFee > 0 && (
              <div className="flex justify-between text-[#5C564B]">
                <span>Delivery Fee</span>
                <span className="font-mono">{formatRupees(order.pricing.deliveryFee)}</span>
              </div>
            )}
            {order.pricing.packagingFee > 0 && (
              <div className="flex justify-between text-[#5C564B]">
                <span>Packaging Fee</span>
                <span className="font-mono">{formatRupees(order.pricing.packagingFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#5C564B]">
              <span>GST (5% Food)</span>
              <span className="font-mono">{formatRupees(order.pricing.tax.totalTax)}</span>
            </div>
            <div className="pt-2 border-t border-[#1C1410]/10 flex justify-between items-center text-sm font-bold text-[#1C1410]">
              <span>Total Paid ({order.paymentMethod})</span>
              <span className="font-mono text-base text-[#C83B1E]">
                {formatRupees(order.pricing.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery / Table Info */}
        <div className="p-4 bg-white rounded-2xl border border-[#1C1410]/15 text-xs space-y-1">
          <div className="font-bold text-[#1C1410] uppercase tracking-wider">
            Customer Details
          </div>
          <div className="text-[#5C564B]">
            {order.customer.name} · +91 {order.customer.phone}
          </div>
          {order.customer.address && (
            <div className="text-[#5C564B] flex items-start gap-1 pt-1">
              <MapPin className="w-3.5 h-3.5 text-[#C83B1E] flex-shrink-0 mt-0.5" />
              <span>{order.customer.address}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
