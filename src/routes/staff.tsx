import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coffee,
  Coins,
  DollarSign,
  FileText,
  Flame,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Table,
  UserCheck,
  Users,
  Utensils,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupees, toPaise } from "@/lib/money";
import {
  getAuthSession,
  loginAsStaff,
  logout,
  subscribeToAuth,
  DEMO_STAFF_MEMBERS,
  type StaffMember,
  type StaffType,
} from "@/lib/auth-store";
import {
  getOrders,
  getTableCalls,
  resolveTableCall,
  subscribeToStore,
  type CafeOrder,
} from "@/lib/order-store";
import menuData from "@/data/menu.json";
import { type MenuItem } from "@/config/site";

const allMenuItems = menuData as MenuItem[];

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff Operations Portal | 7 Bites Cafe OS" },
      {
        name: "description",
        content: "Role-adaptive staff operations panel for Manager, Cashier, Waiter, and Kitchen.",
      },
    ],
  }),
  component: StaffPanelPage,
});

export function StaffPanelPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getAuthSession());
  const [orders, setOrders] = useState<CafeOrder[]>(() => getOrders());
  const [tableCalls, setTableCalls] = useState(() => getTableCalls());
  const [activeTab, setActiveTab] = useState<string>("shift-dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [outOfStockIds, setOutOfStockIds] = useState<string[]>([]);

  useEffect(() => {
    return subscribeToAuth(() => setSession(getAuthSession()));
  }, []);

  useEffect(() => {
    return subscribeToStore(() => {
      setOrders(getOrders());
      setTableCalls(getTableCalls());
    });
  }, []);

  // Current staff member & role (default to Manager Rahul if not logged in as staff)
  const staffMember: StaffMember =
    session.role === "STAFF" && session.staffMember
      ? session.staffMember
      : DEMO_STAFF_MEMBERS[0]; // Manager

  const staffType: StaffType = staffMember.type;

  const handleSwitchStaff = (targetStaffId: string) => {
    loginAsStaff(targetStaffId, "1234");
  };

  const toggleOutOfStock = (id: string) => {
    setOutOfStockIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const activeOrders = orders.filter(
    (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED"
  );

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#1C1410] flex font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ================= DYNAMIC STAFF SIDEBAR (File 01 Section 4) ================= */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#1C1410] text-[#FAF7F2] z-50 flex flex-col justify-between transition-transform duration-300 border-r border-white/10 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#C83B1E] text-white flex items-center justify-center font-black text-sm">
                7B
              </div>
              <div>
                <div className="font-black text-sm text-white flex items-center gap-1.5">
                  <span>Staff Portal</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-[#F59E0B] text-[#1C1410] uppercase">
                    {staffType}
                  </span>
                </div>
                <div className="text-[10px] text-white/50">{staffMember.shift}</div>
              </div>
            </Link>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Staff Switcher for Demo */}
          <div className="p-2.5 bg-white/5 border-b border-white/10">
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-wider mb-1">
              Switch Staff Profile:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {DEMO_STAFF_MEMBERS.map((st) => (
                <button
                  key={st.id}
                  onClick={() => handleSwitchStaff(st.id)}
                  className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-bold transition flex items-center gap-1.5 ${
                    staffMember.id === st.id
                      ? "bg-[#C83B1E] text-white shadow-2xs"
                      : "bg-white/5 text-white/70 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <span className="truncate">{st.name.split(" ")[0]}</span>
                  <span className="text-[9px] opacity-70">({st.type[0]})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Sidebar Links per File 01 Section 4 */}
          <nav className="p-3 space-y-1 text-xs">
            {/* MANAGER MENU */}
            {staffType === "MANAGER" && (
              <>
                <button
                  onClick={() => {
                    setActiveTab("shift-dashboard");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition ${
                    activeTab === "shift-dashboard"
                      ? "bg-[#C83B1E] text-white shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Shift Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("live-orders");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition ${
                    activeTab === "live-orders"
                      ? "bg-[#C83B1E] text-white shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Live Orders</span>
                  </div>
                  <span className="font-mono text-[10px] bg-amber-400 text-black px-1.5 rounded-full">
                    {activeOrders.length}
                  </span>
                </button>

                <Link
                  to="/staff/pos"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-white/80 hover:bg-white/10 hover:text-white transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Receipt className="w-4 h-4 text-[#F59E0B]" />
                    <span>POS Terminal</span>
                  </div>
                  <span className="font-mono text-[10px] bg-white/15 px-1 rounded">F2</span>
                </Link>

                <button
                  onClick={() => {
                    setActiveTab("tables");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition ${
                    activeTab === "tables"
                      ? "bg-[#C83B1E] text-white shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span>Floor & Tables</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("approvals");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition ${
                    activeTab === "approvals"
                      ? "bg-[#C83B1E] text-white shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Approvals (PIN)</span>
                  </div>
                  <span className="font-mono text-[10px] bg-emerald-400 text-black px-1.5 rounded-full">
                    2
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("stock-toggle");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition ${
                    activeTab === "stock-toggle"
                      ? "bg-[#C83B1E] text-white shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Item Availability</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("cash-register");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition ${
                    activeTab === "cash-register"
                      ? "bg-[#C83B1E] text-white shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>Cash Register</span>
                </button>
              </>
            )}

            {/* CASHIER MENU */}
            {staffType === "CASHIER" && (
              <>
                <Link
                  to="/staff/pos"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold bg-[#C83B1E] text-white shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Receipt className="w-4 h-4" />
                    <span>POS Billing Screen</span>
                  </div>
                  <span className="font-mono text-[10px] bg-white/20 px-1.5 rounded">
                    OPEN
                  </span>
                </Link>

                <button
                  onClick={() => {
                    setActiveTab("live-orders");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition ${
                    activeTab === "live-orders"
                      ? "bg-[#C83B1E] text-white shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Live Orders</span>
                  </div>
                  <span className="font-mono text-[10px] bg-amber-400 text-black px-1.5 rounded-full">
                    {activeOrders.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("tables");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition ${
                    activeTab === "tables"
                      ? "bg-[#C83B1E] text-white shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span>Tables & Running Tabs</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("cash-register");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition ${
                    activeTab === "cash-register"
                      ? "bg-[#C83B1E] text-white shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>Shift & Cash Register</span>
                </button>
              </>
            )}

            {/* WAITER MENU */}
            {staffType === "WAITER" && (
              <>
                <button
                  onClick={() => {
                    setActiveTab("tables");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition ${
                    activeTab === "tables"
                      ? "bg-[#C83B1E] text-white shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Table className="w-4 h-4" />
                    <span>My Floor Tables</span>
                  </div>
                  <span className="font-mono text-[10px] bg-purple-400 text-black px-1.5 rounded-full">
                    10
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("table-requests");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition ${
                    activeTab === "table-requests"
                      ? "bg-[#C83B1E] text-white shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span>Table Requests</span>
                  </div>
                  {tableCalls.filter((c) => c.status === "PENDING").length > 0 && (
                    <span className="font-mono text-[10px] bg-rose-500 text-white px-1.5 rounded-full animate-pulse">
                      {tableCalls.filter((c) => c.status === "PENDING").length}
                    </span>
                  )}
                </button>

                <Link
                  to="/t/$token"
                  params={{ token: "table-05" }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-white/80 hover:bg-white/10 hover:text-white transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Utensils className="w-4 h-4 text-emerald-400" />
                    <span>Take Order (QR Tab)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>

                <button
                  onClick={() => {
                    setActiveTab("live-orders");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition ${
                    activeTab === "live-orders"
                      ? "bg-[#C83B1E] text-white shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Order Status</span>
                </button>
              </>
            )}

            {/* KITCHEN MENU */}
            {staffType === "KITCHEN" && (
              <>
                <Link
                  to="/kitchen"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold bg-[#C83B1E] text-white shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Utensils className="w-4 h-4" />
                    <span>Kitchen Display (KDS)</span>
                  </div>
                  <span className="font-mono text-[10px] bg-white/20 px-1.5 rounded">
                    OPEN
                  </span>
                </Link>

                <button
                  onClick={() => {
                    setActiveTab("stock-toggle");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition ${
                    activeTab === "stock-toggle"
                      ? "bg-[#C83B1E] text-white shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Item Availability Toggle</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Staff User Footer */}
        <div className="p-3.5 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#C83B1E] text-white font-black text-xs flex items-center justify-center">
              {staffMember.name[0]}
            </div>
            <div className="leading-tight">
              <div className="font-bold text-xs text-white">{staffMember.name}</div>
              <div className="text-[10px] text-white/50">{staffType} · PIN Locked</div>
            </div>
          </div>
          <Link
            to="/login"
            className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition"
            title="Lock & Switch Account"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* ================= MAIN CONTENT VIEW ================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#1C1410]/10 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-[#1C1410]/15 text-[#1C1410]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-black text-lg text-[#1C1410] capitalize">
                {activeTab.replace("-", " ")}
              </h2>
              <p className="text-[11px] text-[#5C564B]">
                Active role: <span className="font-bold text-[#C83B1E]">{staffMember.name}</span> ({staffType})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/staff/pos"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#C83B1E] text-white hover:bg-[#B33419] transition flex items-center gap-1"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>POS Billing</span>
            </Link>
            <Link
              to="/kitchen"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1C1410] text-white hover:bg-black transition flex items-center gap-1"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>KDS</span>
            </Link>
          </div>
        </header>

        {/* View Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* TAB: SHIFT DASHBOARD (Manager View) */}
          {activeTab === "shift-dashboard" && (
            <div className="space-y-6">
              {/* Scoreboard Strip */}
              <div className="bg-white rounded-2xl border border-[#1C1410]/15 p-4 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-[#1C1410]/10">
                <div>
                  <div className="text-[11px] font-bold text-[#8A8375] uppercase">
                    Active Shift Sales
                  </div>
                  <div className="text-xl font-mono font-black text-[#1C1410] mt-1">
                    {formatRupees(
                      orders.reduce((acc, o) => acc + o.pricing.total, 0)
                    )}
                  </div>
                </div>
                <div className="md:pl-4 pt-2 md:pt-0">
                  <div className="text-[11px] font-bold text-[#8A8375] uppercase">
                    Active Kitchen Tickets
                  </div>
                  <div className="text-xl font-mono font-black text-[#C83B1E] mt-1">
                    {activeOrders.length} tickets
                  </div>
                </div>
                <div className="md:pl-4 pt-2 md:pt-0">
                  <div className="text-[11px] font-bold text-[#8A8375] uppercase">
                    Occupied Tables
                  </div>
                  <div className="text-xl font-mono font-black text-purple-700 mt-1">
                    4 of 10 Tables
                  </div>
                </div>
                <div className="md:pl-4 pt-2 md:pt-0">
                  <div className="text-[11px] font-bold text-[#8A8375] uppercase">
                    Staff on Duty
                  </div>
                  <div className="text-xl font-mono font-black text-emerald-700 mt-1">
                    4 Members
                  </div>
                </div>
              </div>

              {/* Shift Staff List */}
              <div className="bg-white rounded-2xl border border-[#1C1410]/15 p-5 shadow-xs space-y-3">
                <h3 className="font-extrabold text-sm text-[#1C1410]">
                  Staff On Duty (Shift 8AM - 4PM)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {DEMO_STAFF_MEMBERS.map((st) => (
                    <div
                      key={st.id}
                      className="p-3 rounded-xl border border-[#1C1410]/10 bg-[#FAF7F2] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-[#1C1410]">{st.name}</div>
                        <div className="text-[10px] text-[#5C564B]">{st.type}</div>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {st.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: LIVE ORDERS */}
          {activeTab === "live-orders" && (
            <div className="bg-white rounded-2xl border border-[#1C1410]/15 p-5 shadow-xs space-y-4">
              <h3 className="font-black text-base text-[#1C1410]">
                Active Orders Feed
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl border border-[#1C1410]/15 bg-[#FAF7F2]/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm">
                        #{ord.orderNo}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {ord.status}
                      </span>
                    </div>
                    <div className="font-bold text-[#1C1410]">{ord.customer.name}</div>
                    <div className="text-[#5C564B]">
                      {ord.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                    </div>
                    <div className="pt-2 border-t border-[#1C1410]/10 flex items-center justify-between font-bold">
                      <span className="text-[#C83B1E]">
                        {formatRupees(ord.pricing.total)}
                      </span>
                      <Link
                        to="/order/$publicId"
                        params={{ publicId: ord.publicId }}
                        className="text-[#1C1410] hover:underline"
                      >
                        Track ➔
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TABLES & FLOOR */}
          {activeTab === "tables" && (
            <div className="bg-white rounded-2xl border border-[#1C1410]/15 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-[#1C1410]">
                    Floor Plan & Dine-In Tables
                  </h3>
                  <p className="text-xs text-[#5C564B]">
                    Tap a table to view running tab or take direct QR orders
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 font-bold text-purple-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                    Occupied (4)
                  </span>
                  <span className="flex items-center gap-1 font-bold text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    Vacant (6)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isOccupied = [2, 4, 5, 7].includes(num);
                  return (
                    <Link
                      key={num}
                      to="/t/$token"
                      params={{ token: `table-${num}` }}
                      className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between h-32 ${
                        isOccupied
                          ? "bg-purple-50/70 border-purple-300 hover:border-purple-500"
                          : "bg-white border-[#1C1410]/15 hover:border-[#1C1410]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-lg text-[#1C1410]">
                          T{num}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            isOccupied
                              ? "bg-purple-200 text-purple-900"
                              : "bg-emerald-100 text-emerald-900"
                          }`}
                        >
                          {isOccupied ? "Occupied" : "Vacant"}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#5C564B]">
                        {isOccupied ? "Order: #41 · Running Tab" : "4 Seats · Ready"}
                      </div>

                      <div className="text-[10px] font-bold text-[#C83B1E] flex items-center justify-between pt-1 border-t border-[#1C1410]/10">
                        <span>Open QR Tab</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: TABLE REQUESTS (Waiter View) */}
          {activeTab === "table-requests" && (
            <div className="bg-white rounded-2xl border border-[#1C1410]/15 p-5 shadow-xs space-y-4">
              <h3 className="font-black text-base text-[#1C1410]">
                Live Table Calls & Bill Requests
              </h3>
              {tableCalls.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8A8375]">
                  No pending customer table calls right now.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tableCalls.map((call) => (
                    <div
                      key={call.id}
                      className="p-3.5 rounded-xl border border-[#1C1410]/15 bg-[#FAF7F2] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#C83B1E] text-white flex items-center justify-center font-bold">
                          {call.tableNo.replace("Table ", "T")}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#1C1410]">
                            {call.tableNo}: {call.type.replace("_", " ")}
                          </div>
                          <div className="text-[#5C564B]">
                            {call.note || "Customer waiting"} ·{" "}
                            {new Date(call.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>

                      {call.status === "PENDING" ? (
                        <Button
                          onClick={() => resolveTableCall(call.id)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 h-auto rounded-lg"
                        >
                          Mark Handled ✓
                        </Button>
                      ) : (
                        <span className="text-emerald-700 font-bold">Resolved ✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: APPROVALS (Manager View) */}
          {activeTab === "approvals" && (
            <div className="bg-white rounded-2xl border border-[#1C1410]/15 p-5 shadow-xs space-y-4">
              <h3 className="font-black text-base text-[#1C1410]">
                Manager PIN Approvals Queue
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-[#B45309]">
                    <span>Discount Request: 15% Flat off</span>
                    <span className="bg-amber-200 text-black px-2 py-0.5 rounded">
                      Table T4 · Bill: ₹647
                    </span>
                  </div>
                  <p className="text-[#5C564B]">
                    Cashier Aakash requested approval: "Regular customer courtesy discount".
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => alert("Approved with Manager PIN!")}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-1.5 px-3 h-auto rounded-lg"
                    >
                      Approve Discount (PIN)
                    </Button>
                    <Button
                      variant="outline"
                      className="text-xs py-1.5 px-3 h-auto rounded-lg text-rose-700 border-rose-300"
                    >
                      Reject
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-blue-300 bg-blue-50/70 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-blue-900">
                    <span>Item Void Request: 1x Cold Coffee</span>
                    <span className="bg-blue-200 text-black px-2 py-0.5 rounded">
                      Table T2 · Waiter Vikas
                    </span>
                  </div>
                  <p className="text-[#5C564B]">
                    Reason: "Customer changed order to Hot Cappuccino before preparation."
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => alert("Void authorized!")}
                      className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-1.5 px-3 h-auto rounded-lg"
                    >
                      Authorize Void
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ITEM AVAILABILITY / OUT OF STOCK */}
          {activeTab === "stock-toggle" && (
            <div className="bg-white rounded-2xl border border-[#1C1410]/15 p-5 shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-base text-[#1C1410]">
                  Item Out-of-Stock Toggle (Kitchen & Manager)
                </h3>
                <p className="text-xs text-[#5C564B]">
                  Marking an item out-of-stock updates Online Store, QR Menus, and POS in real-time.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allMenuItems.slice(0, 18).map((item) => {
                  const isOut = outOfStockIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition flex items-center justify-between text-xs ${
                        isOut
                          ? "bg-rose-50 border-rose-300 text-rose-900"
                          : "bg-[#FAF7F2] border-[#1C1410]/10 text-[#1C1410]"
                      }`}
                    >
                      <div>
                        <div className="font-bold line-clamp-1">{item.name}</div>
                        <div className="text-[10px] text-[#5C564B]">{item.category} · ₹{item.price}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleOutOfStock(item.id)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition ${
                          isOut
                            ? "bg-rose-700 text-white border-rose-700 shadow-2xs"
                            : "bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                        }`}
                      >
                        {isOut ? "OUT OF STOCK" : "AVAILABLE"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: CASH REGISTER */}
          {activeTab === "cash-register" && (
            <div className="bg-white rounded-2xl border border-[#1C1410]/15 p-5 shadow-xs space-y-4">
              <h3 className="font-black text-base text-[#1C1410]">
                Shift & Cash Register (Z-Report)
              </h3>
              <div className="p-4 rounded-xl border border-[#1C1410]/15 bg-[#FAF7F2] space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Shift Opening Cash:</span>
                  <span className="font-mono">₹2,000.00</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Cash Sales Received:</span>
                  <span className="font-mono">+₹4,520.00</span>
                </div>
                <div className="flex justify-between text-blue-700 font-bold">
                  <span>UPI / Digital Sales:</span>
                  <span className="font-mono">+₹7,890.00</span>
                </div>
                <div className="flex justify-between text-rose-700">
                  <span>Petty Cash Expenses (Dairy):</span>
                  <span className="font-mono">-₹450.00</span>
                </div>
                <div className="pt-2 border-t border-[#1C1410]/10 flex justify-between font-black text-sm text-[#1C1410]">
                  <span>Expected Drawer Cash:</span>
                  <span className="font-mono text-base text-[#C83B1E]">
                    ₹6,070.00
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
