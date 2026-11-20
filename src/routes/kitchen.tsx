import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getOrders,
  subscribeToStore,
  updateOrderStatus,
  type CafeOrder,
  type OrderStatus,
} from "@/lib/order-store";

export const Route = createFileRoute("/kitchen")({
  head: () => ({
    meta: [
      { title: "Kitchen Display System (KDS) | 7 Bites Cafe" },
      {
        name: "description",
        content: "Live digital KOT tickets and kitchen orders screen for 7 Bites Cafe.",
      },
    ],
  }),
  component: KitchenPage,
});

function getMinutesElapsed(isoString: string): number {
  const diff = Date.now() - new Date(isoString).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60)));
}

function KitchenPage() {
  const [orders, setOrders] = useState<CafeOrder[]>(() => getOrders());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stationFilter, setStationFilter] = useState<string>("ALL");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // 10 second timer to update elapsed minutes
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setOrders(getOrders());
    return subscribeToStore(() => {
      setOrders(getOrders());
    });
  }, []);

  // Filter only active kitchen orders
  const activeOrders = orders.filter(
    (o) =>
      o.status !== "COMPLETED" &&
      o.status !== "CANCELLED" &&
      o.status !== "PENDING_PAYMENT"
  );

  const newOrders = activeOrders.filter(
    (o) => o.status === "PLACED" || o.status === "CONFIRMED"
  );
  const preparingOrders = activeOrders.filter((o) => o.status === "PREPARING");
  const readyOrders = activeOrders.filter(
    (o) => o.status === "READY" || o.status === "SERVED"
  );

  const handleStartPrep = (orderId: string) => {
    updateOrderStatus(orderId, "PREPARING", "Chef started preparation");
  };

  const handleMarkReady = (orderId: string) => {
    updateOrderStatus(orderId, "READY", "Items freshly prepared & boxed");
  };

  const handleBump = (orderId: string) => {
    updateOrderStatus(orderId, "COMPLETED", "Order handed over to customer/table");
  };

  const renderTicket = (order: CafeOrder, currentLane: "NEW" | "PREP" | "READY") => {
    const elapsed = getMinutesElapsed(order.createdAt);
    const isLate = elapsed >= 10;
    const isWarning = elapsed >= 5 && elapsed < 10;

    return (
      <div
        key={order.id}
        className={`bg-white rounded-2xl border-2 transition shadow-sm overflow-hidden flex flex-col justify-between ${
          isLate
            ? "border-[#C83B1E] ring-2 ring-[#C83B1E]/20"
            : isWarning
            ? "border-[#F59E0B]"
            : "border-[#1C1410]/20"
        }`}
      >
        {/* Ticket Header */}
        <div
          className={`p-3.5 border-b flex items-center justify-between ${
            isLate
              ? "bg-[#C83B1E]/10 border-[#C83B1E]/30 text-[#C83B1E]"
              : isWarning
              ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#B45309]"
              : "bg-[#FAF7F2] border-[#1C1410]/10 text-[#1C1410]"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-lg">
              #{order.orderNo}
            </span>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                order.type === "DINE_IN"
                  ? "bg-purple-100 text-purple-900 border border-purple-200"
                  : order.type === "DELIVERY"
                  ? "bg-blue-100 text-blue-900 border border-blue-200"
                  : "bg-amber-100 text-amber-900 border border-amber-200"
              }`}
            >
              {order.type === "DINE_IN"
                ? `Table ${order.customer.tableNo || "?"}`
                : order.type}
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono font-bold text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{elapsed}m ago</span>
          </div>
        </div>

        {/* Items List */}
        <div className="p-4 space-y-3 flex-1">
          {order.items.map((item, idx) => (
            <div key={idx} className="border-b border-dashed border-[#1C1410]/10 pb-2.5 last:border-none">
              <div className="flex items-start justify-between">
                <div className="font-black text-base text-[#1C1410] leading-tight">
                  <span className="text-[#C83B1E] mr-1.5">{item.qty}×</span>
                  {item.name}
                  {item.size && (
                    <span className="text-xs font-normal text-[#5C564B] ml-1">
                      ({item.size})
                    </span>
                  )}
                </div>
              </div>

              {/* Modifiers & Addons */}
              {item.addOns && item.addOns.length > 0 && (
                <div className="text-xs font-bold text-[#B45309] mt-1 pl-4">
                  + {item.addOns.map((a) => a.name).join(", ")}
                </div>
              )}

              {/* Special Note */}
              {item.specialNote && (
                <div className="text-xs font-bold bg-amber-50 text-[#C83B1E] border border-amber-200 px-2 py-1 rounded-md mt-1.5 inline-block">
                  ⚠️ Note: {item.specialNote}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Customer / Token Strip */}
        <div className="px-4 py-2 bg-[#FAF7F2] border-t border-[#1C1410]/10 flex items-center justify-between text-xs text-[#5C564B]">
          <span className="font-medium truncate max-w-[150px]">
            {order.customer.name}
          </span>
          <span className="font-mono text-[11px] font-bold text-[#8A8375]">
            {order.publicId}
          </span>
        </div>

        {/* Action Button */}
        <div className="p-3 bg-white border-t border-[#1C1410]/10">
          {currentLane === "NEW" && (
            <Button
              type="button"
              onClick={() => handleStartPrep(order.id)}
              className="w-full py-5 bg-[#1C1410] hover:bg-black text-white font-extrabold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START PREPPING</span>
            </Button>
          )}

          {currentLane === "PREP" && (
            <Button
              type="button"
              onClick={() => handleMarkReady(order.id)}
              className="w-full py-5 bg-[#C83B1E] hover:bg-[#B33419] text-white font-extrabold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>MARK READY</span>
            </Button>
          )}

          {currentLane === "READY" && (
            <Button
              type="button"
              onClick={() => handleBump(order.id)}
              className="w-full py-5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>BUMP / HANDOVER</span>
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#1C1410] flex flex-col font-sans">
      {/* KDS Kiosk Topbar */}
      <header className="sticky top-0 z-30 bg-[#1C1410] text-white px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="font-black text-xl tracking-tight text-white hover:text-[#F59E0B] transition flex items-center gap-2"
          >
            <span>7 BITES</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#C83B1E] text-white uppercase tracking-wider">
              KDS
            </span>
          </Link>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-3 text-xs font-mono pl-4 border-l border-white/20">
            <span className="text-amber-400 font-bold">
              Active: {activeOrders.length}
            </span>
            <span className="text-white/60">·</span>
            <span className="text-rose-400 font-bold">
              Late (&gt;10m):{" "}
              {
                activeOrders.filter((o) => getMinutesElapsed(o.createdAt) >= 10)
                  .length
              }
            </span>
          </div>
        </div>

        {/* Station Filter & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl text-xs font-bold">
            {["ALL", "PIZZA", "BEVERAGES", "SNACKS"].map((st) => (
              <button
                key={st}
                onClick={() => setStationFilter(st)}
                className={`px-3 py-1 rounded-lg transition ${
                  stationFilter === st
                    ? "bg-[#C83B1E] text-white shadow-xs"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-white"
            title={soundEnabled ? "Sound ON" : "Sound Muted"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-white/50" />
            )}
          </button>

          <Link
            to="/order"
            className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl text-white transition"
          >
            + Test Order
          </Link>
        </div>
      </header>

      {/* 3-Column Lanes Grid */}
      <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto">
        {/* Lane 1: NEW */}
        <div className="flex flex-col bg-[#EEEAE0]/70 rounded-3xl p-4 border border-[#1C1410]/10">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1C1410]/10">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#1C1410]" />
              <h2 className="font-extrabold text-base tracking-tight text-[#1C1410]">
                NEW TICKETS
              </h2>
            </div>
            <span className="font-mono font-bold text-xs bg-white border border-[#1C1410]/15 px-2.5 py-0.5 rounded-full">
              {newOrders.length}
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 max-h-[calc(100vh-170px)] pr-1">
            {newOrders.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-[#8A8375] text-xs">
                <div>☕ All caught up</div>
                <div className="text-[11px] mt-1">No new tickets right now</div>
              </div>
            ) : (
              newOrders.map((o) => renderTicket(o, "NEW"))
            )}
          </div>
        </div>

        {/* Lane 2: PREPARING */}
        <div className="flex flex-col bg-[#FBF0DA]/60 rounded-3xl p-4 border border-[#F59E0B]/30">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F59E0B]/30">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B] animate-pulse" />
              <h2 className="font-extrabold text-base tracking-tight text-[#B45309]">
                PREPARING IN OVEN
              </h2>
            </div>
            <span className="font-mono font-bold text-xs bg-white border border-[#F59E0B]/40 px-2.5 py-0.5 rounded-full text-[#B45309]">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 max-h-[calc(100vh-170px)] pr-1">
            {preparingOrders.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-[#8A8375] text-xs">
                <div>🔥 Oven ready</div>
                <div className="text-[11px] mt-1">Start prepping new tickets</div>
              </div>
            ) : (
              preparingOrders.map((o) => renderTicket(o, "PREP"))
            )}
          </div>
        </div>

        {/* Lane 3: READY */}
        <div className="flex flex-col bg-[#E6F2EA]/60 rounded-3xl p-4 border border-emerald-600/30">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-600/30">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <h2 className="font-extrabold text-base tracking-tight text-emerald-900">
                READY TO SERVE
              </h2>
            </div>
            <span className="font-mono font-bold text-xs bg-white border border-emerald-600/40 px-2.5 py-0.5 rounded-full text-emerald-800">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 max-h-[calc(100vh-170px)] pr-1">
            {readyOrders.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-[#8A8375] text-xs">
                <div>🥡 Pass clear</div>
                <div className="text-[11px] mt-1">Ready orders appear here</div>
              </div>
            ) : (
              readyOrders.map((o) => renderTicket(o, "READY"))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
