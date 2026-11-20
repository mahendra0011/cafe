import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  CreditCard,
  Edit3,
  Gift,
  Heart,
  HelpCircle,
  Home,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Package,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Flame,
  User,
  Users,
  Utensils,
  UtensilsCrossed,
  QrCode,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupees, toPaise } from "@/lib/money";
import {
  getAuthSession,
  logout,
  subscribeToAuth,
  DEMO_CUSTOMER,
  type CustomerUser,
} from "@/lib/auth-store";
import {
  addToCart,
  getOrders,
  subscribeToStore,
  type CafeOrder,
} from "@/lib/order-store";
import menuData from "@/data/menu.json";
import { type MenuItem } from "@/config/site";

const allMenuItems = menuData as MenuItem[];

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Customer Account Dashboard | 7 Bites Cafe" },
      {
        name: "description",
        content: "Customer dashboard with 14 full sections: Orders, Track Live, Favorites, Coupons, Addresses, Payments, Support and Settings.",
      },
    ],
  }),
  component: CustomerAccountPage,
});

export type CustomerAccountTab =
  | "order-food"
  | "orders"
  | "track-order"
  | "reservations"
  | "favorites"
  | "reorder"
  | "coupons"
  | "addresses"
  | "payments"
  | "reviews"
  | "notifications"
  | "support"
  | "membership"
  | "profile"
  | "settings";

export function CustomerAccountPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getAuthSession());
  const [orders, setOrders] = useState<CafeOrder[]>(() => getOrders());
  const [activeTab, setActiveTab] = useState<CustomerAccountTab>("orders");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Favorites state
  const [favoriteIds, setFavoriteIds] = useState<string[]>([
    "pizza-1",
    "cold-coffee-1",
    "momos-1",
    "burgers-2",
  ]);

  // Notifications State
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(3);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Customer Reservations State
  const [customerReservations, setCustomerReservations] = useState([
    {
      id: "res-cb-101",
      tableNo: 5,
      area: "Window Booth (Cozy Corner)",
      date: "Today, 20 Nov 2026",
      time: "8:00 PM",
      guests: 4,
      status: "CONFIRMED" as const,
      occasion: "Weekend Cafe Dinner",
      specialRequest: "Near window, extra oregano dips",
      pin: "7B-9024",
    },
    {
      id: "res-cb-092",
      tableNo: 2,
      area: "Indoor AC Lounge",
      date: "12 Nov 2026",
      time: "7:30 PM",
      guests: 2,
      status: "COMPLETED" as const,
      occasion: "Coffee & Pizza Date",
      specialRequest: "",
      pin: "7B-4198",
    },
  ]);
  const [showBookTableModal, setShowBookTableModal] = useState(false);
  const [bookTableDate, setBookTableDate] = useState("Today, 20 Nov 2026");
  const [bookTableTime, setBookTableTime] = useState("8:30 PM");
  const [bookTableGuests, setBookTableGuests] = useState(2);
  const [bookTableArea, setBookTableArea] = useState("Window Booth");
  const [bookTableOccasion, setBookTableOccasion] = useState("Casual Dining");
  const [bookTableNote, setBookTableNote] = useState("");
  const [tableBookingSuccess, setTableBookingSuccess] = useState(false);

  // Address form state
  const [addresses, setAddresses] = useState([
    {
      id: "addr-1",
      label: "Home",
      address: "B-14, Civil Lines, Near Jubilee Hall, Chhatarpur, MP 471001",
      landmark: "Opposite Nehru Park",
      isDefault: true,
    },
    {
      id: "addr-2",
      label: "Work",
      address: "Shop 12, Main Market, Jawahar Chowk, Chhatarpur, MP 471001",
      landmark: "Near SBI Main Branch",
      isDefault: false,
    },
  ]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState<"Home" | "Work" | "Other">("Home");
  const [newAddress, setNewAddress] = useState("");
  const [newLandmark, setNewLandmark] = useState("");

  // Review state
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewInput, setReviewInput] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Profile form state
  const customer: CustomerUser =
    session.role === "CUSTOMER" && session.customer
      ? session.customer
      : DEMO_CUSTOMER;

  const [profileName, setProfileName] = useState(customer.name);
  const [profileEmail, setProfileEmail] = useState(customer.email || "aman.sharma@example.com");
  const [profilePhone, setProfilePhone] = useState(customer.phone);
  const [profileBirthday, setProfileBirthday] = useState("1998-08-15");
  const [profileVegOnly, setProfileVegOnly] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Settings toggles
  const [notifWhatsApp, setNotifWhatsApp] = useState(true);
  const [notifSMS, setNotifSMS] = useState(true);
  const [appLanguage, setAppLanguage] = useState<"English" | "Hindi">("English");

  useEffect(() => {
    return subscribeToAuth(() => setSession(getAuthSession()));
  }, []);

  useEffect(() => {
    return subscribeToStore(() => setOrders(getOrders()));
  }, []);

  const liveOrder = useMemo(() => {
    return orders.find(
      (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED"
    ) || orders[0];
  }, [orders]);

  const handleReorder = (order: CafeOrder) => {
    order.items.forEach((it) => {
      addToCart({
        itemId: it.itemId,
        name: it.name,
        foodType: it.foodType,
        size: it.size,
        unitPrice: it.unitPrice,
        qty: it.qty,
        addOns: it.addOns,
        specialNote: it.specialNote,
      });
    });
    navigate({ to: "/order" });
  };

  const handleAddFavoriteToCart = (item: MenuItem) => {
    addToCart({
      itemId: item.id,
      name: item.name,
      foodType: (item.diet === "non-veg" ? "non-veg" : item.diet === "egg" ? "egg" : "veg") as "veg" | "non-veg" | "egg",
      unitPrice: toPaise(item.price),
      qty: 1,
    });
    navigate({ to: "/order" });
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const favoriteItems = useMemo(
    () => allMenuItems.filter((item) => favoriteIds.includes(item.id)),
    [favoriteIds]
  );

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 3000);
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    setAddresses((prev) => [
      ...prev,
      {
        id: `addr-${Date.now()}`,
        label: newLabel,
        address: newAddress.trim(),
        landmark: newLandmark.trim(),
        isDefault: prev.length === 0,
      },
    ]);
    setNewAddress("");
    setNewLandmark("");
    setShowAddAddress(false);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3500);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewInput.trim()) return;
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setReviewInput("");
    }, 4000);
  };

  const handleBookTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRes = {
      id: `res-cb-${Date.now().toString().slice(-4)}`,
      tableNo: Math.floor(Math.random() * 8) + 1,
      area: bookTableArea,
      date: bookTableDate,
      time: bookTableTime,
      guests: bookTableGuests,
      status: "CONFIRMED" as const,
      occasion: bookTableOccasion,
      specialRequest: bookTableNote,
      pin: `7B-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setCustomerReservations((prev) => [newRes, ...prev]);
    setTableBookingSuccess(true);
    setTimeout(() => {
      setTableBookingSuccess(false);
      setShowBookTableModal(false);
      setBookTableNote("");
    }, 2500);
  };

  const handleCancelReservation = (id: string) => {
    setCustomerReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "CANCELLED" as const } : r))
    );
  };

  // Coupons available
  const coupons = [
    {
      code: "FIRST50",
      title: "Welcome to 7 Bites",
      discount: "Flat ₹50 OFF",
      desc: "Valid on your first dine-in or takeaway order above ₹249",
      expiry: "Valid till 31 Dec 2026",
      tag: "Popular",
    },
    {
      code: "BITES100",
      title: "Super Saver Combo",
      discount: "Flat ₹100 OFF",
      desc: "Valid on orders above ₹499 across all pizzas and burgers",
      expiry: "Valid this week",
      tag: "Best Value",
    },
    {
      code: "PIZZAPARTY",
      title: "Weekend Pizza Party",
      discount: "20% OFF up to ₹150",
      desc: "Valid on Friday, Saturday & Sunday on all Large Pizzas",
      expiry: "Weekend Special",
      tag: "Weekend",
    },
    {
      code: "7BITESFREE",
      title: "Dessert on Us",
      discount: "Free Choco Brownie",
      desc: "Valid on orders above ₹399. Auto-applied for Gold Tier",
      expiry: "VIP Perk",
      tag: "Gold Tier",
    },
  ];

  return (
    <div className="h-screen w-screen bg-[#FAF9F5] text-stone-900 flex overflow-hidden font-sans antialiased selection:bg-[#C83B1E]/15 selection:text-[#C83B1E]">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ================= 1. CUSTOMER SIDEBAR (Independent Scrolling) ================= */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-68 bg-[#12100E] text-stone-300 z-50 flex flex-col justify-between shrink-0 transition-transform duration-300 border-r border-white/[0.08] ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="shrink-0 p-4 border-b border-white/[0.08] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C83B1E] text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs">
              7B
            </div>
            <div>
              <div className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>7 Bites Cafe</span>
              </div>
              <div className="text-[11px] text-stone-400">
                Customer Account Portal
              </div>
            </div>
          </Link>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Profile Card */}
        <div className="shrink-0 p-3.5 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C83B1E] text-white font-semibold text-sm flex items-center justify-center shadow-xs">
              {customer.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-xs text-white truncate">
                {customer.name}
              </div>
              <div className="text-[11px] text-stone-400 font-mono">
                +91 {customer.phone}
              </div>
              <div className="text-[10px] font-medium text-amber-400 flex items-center gap-1 mt-0.5">
                <span>★ {customer.tier} Tier</span>
                <span className="text-white/30">·</span>
                <span>{customer.loyaltyPoints} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* 15 Navigation Links (Independent Scrollbar Container) */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-3 text-xs scrollbar-thin scrollbar-thumb-white/10">
          <div className="px-3 pb-1 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
            Dining & Orders
          </div>

          <div className="space-y-0.5">
            {/* 1. Order Food */}
            <button
              onClick={() => {
                setActiveTab("order-food");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                activeTab === "order-food"
                  ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                  : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Utensils className={`w-4 h-4 ${activeTab === "order-food" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                <span>Order Food</span>
              </div>
              <span className="text-[9px] bg-white/[0.08] text-amber-300 font-semibold px-1.5 py-0.5 rounded">
                MENU
              </span>
            </button>

            {/* 2. My Orders */}
            <button
              onClick={() => {
                setActiveTab("orders");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                activeTab === "orders"
                  ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                  : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className={`w-4 h-4 ${activeTab === "orders" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                <span>My Orders</span>
              </div>
              {orders.length > 0 && (
                <span className="text-[10px] font-medium bg-white/[0.08] text-stone-300 px-2 py-0.5 rounded-full">
                  {orders.length}
                </span>
              )}
            </button>

            {/* 3. Track Order */}
            <button
              onClick={() => {
                setActiveTab("track-order");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                activeTab === "track-order"
                  ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                  : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Flame className={`w-4 h-4 ${activeTab === "track-order" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                <span>Track Order</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
              </span>
            </button>

            {/* 4. Table Reservations (Pre-Bookings) */}
            <button
              onClick={() => {
                setActiveTab("reservations");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                activeTab === "reservations"
                  ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                  : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className={`w-4 h-4 ${activeTab === "reservations" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                <span>Table Bookings</span>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300">
                {customerReservations.filter((r) => r.status === "CONFIRMED").length} Booked
              </span>
            </button>

            {/* 5. Favorites */}
            <button
              onClick={() => {
                setActiveTab("favorites");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                activeTab === "favorites"
                  ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                  : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className={`w-4 h-4 ${activeTab === "favorites" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                <span>Favorites</span>
              </div>
              <span className="text-[10px] text-stone-500 font-medium">
                {favoriteIds.length}
              </span>
            </button>

            {/* 6. Reorder */}
            <button
              onClick={() => {
                setActiveTab("reorder");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                activeTab === "reorder"
                  ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                  : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <RotateCcw className={`w-4 h-4 ${activeTab === "reorder" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                <span>Quick Reorder</span>
              </div>
            </button>
          </div>

          <div className="px-3 pb-1 pt-2 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
            Savings & Wallet
          </div>

          <div className="space-y-0.5">
            {/* 7. Coupons & Offers */}
            <button
              onClick={() => {
                setActiveTab("coupons");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                activeTab === "coupons"
                  ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                  : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tag className={`w-4 h-4 ${activeTab === "coupons" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                <span>Coupons & Offers</span>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                {coupons.length}
              </span>
            </button>

            {/* 8. Addresses */}
            <button
              onClick={() => {
                setActiveTab("addresses");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                activeTab === "addresses"
                  ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                  : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className={`w-4 h-4 ${activeTab === "addresses" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                <span>Saved Addresses</span>
              </div>
              <span className="text-[10px] text-stone-500 font-medium">
                {addresses.length}
              </span>
            </button>

            {/* 9. Payments */}
            <button
              onClick={() => {
                setActiveTab("payments");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                activeTab === "payments"
                  ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                  : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className={`w-4 h-4 ${activeTab === "payments" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                <span>Payments & Receipts</span>
              </div>
            </button>
          </div>

          <div className="px-3 pb-1 pt-2 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
            Engagement & Help
          </div>

          <div className="space-y-0.5">
            {/* 10. Reviews & Ratings */}
            <button
              onClick={() => {
                setActiveTab("reviews");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                activeTab === "reviews"
                  ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                  : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className={`w-4 h-4 ${activeTab === "reviews" ? "text-amber-400 fill-amber-400" : "text-stone-400 group-hover:text-stone-200"}`} />
                <span>Reviews & Ratings</span>
              </div>
            </button>

            {/* 11. Notifications */}
            <button
              onClick={() => {
                setActiveTab("notifications");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                activeTab === "notifications"
                  ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                  : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className={`w-4 h-4 ${activeTab === "notifications" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                <span>Notifications</span>
              </div>
              {unreadNotificationsCount > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* 12. Customer Support */}
            <button
              onClick={() => {
                setActiveTab("support");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                activeTab === "support"
                  ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                  : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className={`w-4 h-4 ${activeTab === "support" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                <span>Customer Support</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">24×7</span>
            </button>

            {/* 13. Membership */}
            <button
              onClick={() => {
                setActiveTab("membership");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                activeTab === "membership"
                  ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                  : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Gift className={`w-4 h-4 ${activeTab === "membership" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                <span>VIP Membership</span>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                Gold ★
              </span>
            </button>
          </div>

          <div className="px-3 pb-1 pt-2 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
            Preferences
          </div>

          <div className="space-y-0.5">
            {/* 14. Profile */}
            <button
              onClick={() => {
                setActiveTab("profile");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                activeTab === "profile"
                  ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                  : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className={`w-4 h-4 ${activeTab === "profile" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                <span>Profile Details</span>
              </div>
            </button>

            {/* 15. Settings */}
            <button
              onClick={() => {
                setActiveTab("settings");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                activeTab === "settings"
                  ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                  : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className={`w-4 h-4 ${activeTab === "settings" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                <span>Settings</span>
              </div>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="shrink-0 p-3.5 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-medium text-stone-400 hover:text-white transition"
          >
            <Home className="w-4 h-4" /> Cafe Home
          </Link>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ================= 2. MAIN CONTENT VIEW (Independent Scrolling) ================= */}
      <div className="flex-1 h-screen overflow-y-auto flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-semibold text-base text-stone-900 tracking-tight capitalize">
                {activeTab === "order-food"
                  ? "Explore Full Menu"
                  : activeTab === "orders"
                  ? "My Dine-In Orders"
                  : activeTab === "track-order"
                  ? "Live Order Tracker"
                  : activeTab === "reservations"
                  ? "Table Reservations"
                  : activeTab === "favorites"
                  ? "Saved Favorites"
                  : activeTab === "reorder"
                  ? "Quick Reorder"
                  : activeTab === "coupons"
                  ? "Coupons & Discounts"
                  : activeTab === "addresses"
                  ? "Saved Addresses"
                  : activeTab === "payments"
                  ? "Payments & Receipts"
                  : activeTab === "reviews"
                  ? "Reviews & Feedback"
                  : activeTab === "notifications"
                  ? "Notifications & Alerts"
                  : activeTab === "support"
                  ? "Customer Support (24×7)"
                  : activeTab === "membership"
                  ? "VIP Membership"
                  : activeTab === "profile"
                  ? "Profile Information"
                  : "Settings & Preferences"}
              </h2>
              <p className="text-xs text-stone-500">
                Welcome back, {customer.name} · 7 Bites Account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/order"
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[#C83B1E] text-white hover:bg-[#B33419] transition flex items-center gap-1.5 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Table Cart / Menu</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Tab Content */}
        <main className="p-4 sm:p-6 space-y-6 max-w-5xl">
          {/* ================= 1. TAB: ORDER FOOD ================= */}
          {activeTab === "order-food" && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-[#C83B1E] to-[#E25C3C] text-white p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                    Fresh Wood-Fired & Handcrafted
                  </span>
                  <h3 className="text-2xl font-semibold mt-2">Hungry for 7 Bites?</h3>
                  <p className="text-xs text-white/90 max-w-md mt-1">
                    Explore artisan stone-baked pizzas, gourmet smashed burgers, steamed Himalayan momos, and signature thick cold coffees.
                  </p>
                </div>
                <Button
                  onClick={() => navigate({ to: "/order" })}
                  className="bg-white text-[#C83B1E] hover:bg-stone-50 font-semibold text-sm px-5 py-3 h-auto rounded-2xl shadow-md shrink-0 flex items-center gap-2"
                >
                  <Utensils className="w-4 h-4" /> Open Full Food Menu
                </Button>
              </div>

              <div>
                <h4 className="font-bold text-base text-stone-900 mb-3">Popular Cravings Today</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {allMenuItems.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                            {item.category}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#C83B1E]">
                            ₹{item.price}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-stone-900 mt-1">{item.name}</h5>
                        <p className="text-xs text-stone-500 line-clamp-2 mt-1">{item.description}</p>
                      </div>
                      <Button
                        onClick={() => handleAddFavoriteToCart(item)}
                        className="mt-3 bg-stone-50 hover:bg-[#C83B1E] text-stone-900 hover:text-white border border-stone-200/80 text-xs font-bold py-1.5 h-auto rounded-xl flex items-center justify-center gap-1.5 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add & Checkout
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. TAB: MY ORDERS ================= */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-stone-900">
                    Recent Order History ({orders.length})
                  </h3>
                  <p className="text-xs text-stone-500">
                    Track active orders or reorder your favorites in 1 click
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-xl border border-stone-200/80 p-8 text-center text-xs text-stone-500">
                  No orders placed yet. Tap "Order Food Now" above to get started!
                </div>
              ) : (
                <div className="space-y-3.5">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white rounded-xl border border-stone-200/80 p-4 sm:p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-stone-200/60 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-base text-stone-900">
                              #{ord.orderNo}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                ord.status === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : ord.status === "PREPARING"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {ord.status}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-50 text-stone-500">
                              {ord.type}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5 font-mono">
                            {new Date(ord.createdAt).toLocaleDateString("en-IN")} at{" "}
                            {new Date(ord.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-semibold text-lg text-[#C83B1E]">
                            {formatRupees(ord.pricing.total)}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            Paid via {ord.paymentMethod}
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5 text-xs">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-stone-500">
                            <span className="font-medium">
                              <span className="font-bold text-stone-900">{it.qty}×</span>{" "}
                              {it.name} {it.size ? `(${it.size})` : ""}
                            </span>
                            <span className="font-mono font-bold text-stone-900">
                              {formatRupees(it.unitPrice * it.qty)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2.5 border-t border-stone-200/60 flex items-center justify-between">
                        <button
                          onClick={() => setActiveTab("track-order")}
                          className="text-xs font-bold text-stone-900 hover:text-[#C83B1E] flex items-center gap-1"
                        >
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          <span>Track Live Order Status</span>
                        </button>

                        <Button
                          onClick={() => handleReorder(ord)}
                          className="bg-stone-900 hover:bg-black text-white text-xs font-bold px-3.5 py-1.5 h-auto rounded-xl flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reorder Meal
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 3. TAB: TRACK ORDER (LIVE) ================= */}
          {activeTab === "track-order" && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-stone-200/80 p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 animate-pulse">
                        LIVE TRACKING
                      </span>
                      <span className="font-mono font-bold text-base text-stone-900">
                        Order #{liveOrder?.orderNo || "104"}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 mt-1">
                      Prep Time: <strong className="text-stone-900">12–15 mins</strong> · Dine-In at Table 05 (Floor Service)
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href="tel:+919876543210"
                      className="px-3 py-1.5 rounded-xl border border-stone-200/80 text-xs font-bold text-stone-900 hover:bg-stone-50 flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Call Floor Server</span>
                    </a>
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Cafe</span>
                    </a>
                  </div>
                </div>

                {/* Animated Stepper */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold mb-2">
                      ✓
                    </div>
                    <div className="font-bold text-xs">1. Placed via QR</div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">Printed at Kitchen KOT</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-semibold mb-2 animate-bounce">
                      🔥
                    </div>
                    <div className="font-bold text-xs">2. In Stone Oven</div>
                    <div className="text-[10px] text-amber-700 mt-0.5">Baking at 350°C right now</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60 text-stone-500">
                    <div className="w-7 h-7 rounded-full bg-stone-300 text-stone-700 flex items-center justify-center text-xs font-semibold mb-2">
                      3
                    </div>
                    <div className="font-bold text-xs">3. Ready for Server</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">Plated with dips & herbs</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60 text-stone-500">
                    <div className="w-7 h-7 rounded-full bg-stone-300 text-stone-700 flex items-center justify-center text-xs font-semibold mb-2">
                      4
                    </div>
                    <div className="font-bold text-xs">4. Served to Table</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">Enjoy your hot meal!</div>
                  </div>
                </div>

                {/* Floor Server Assistance */}
                <div className="rounded-2xl bg-stone-50 border border-stone-200/80 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C83B1E]/10 text-[#C83B1E] flex items-center justify-center shrink-0">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-stone-900">Floor Server Assigned: Vikas Ahirwar</div>
                    <div className="text-[11px] text-stone-500">Assisting Table 05 · Call waiter or request extra oregano & dips anytime</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    At your service
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. TAB: TABLE RESERVATIONS (Pre-Bookings) ================= */}
          {activeTab === "reservations" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-stone-900">
                    Your Table Reservations ({customerReservations.length})
                  </h3>
                  <p className="text-xs text-stone-500">
                    Reserve your favorite cozy table, booth or birthday party spot in advance
                  </p>
                </div>
                <Button
                  onClick={() => setShowBookTableModal(true)}
                  className="bg-[#C83B1E] hover:bg-[#B33419] text-white text-xs font-bold px-4 py-2 h-auto rounded-xl flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book a Table</span>
                </Button>
              </div>

              {/* Book Table Modal / Form */}
              {showBookTableModal && (
                <form
                  onSubmit={handleBookTableSubmit}
                  className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#C83B1E]" />
                      <h4 className="font-bold text-sm text-stone-900">Book a Table at 7 Bites Cafe</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBookTableModal(false)}
                      className="p-1 rounded-lg hover:bg-stone-50 text-stone-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">Reservation Date</label>
                      <select
                        value={bookTableDate}
                        onChange={(e) => setBookTableDate(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 bg-white font-medium focus:outline-none focus:border-[#C83B1E]"
                      >
                        <option value="Today, 20 Nov 2026">Today, 20 Nov 2026</option>
                        <option value="Tomorrow, 21 Nov 2026">Tomorrow, 21 Nov 2026</option>
                        <option value="Sunday, 22 Nov 2026">Sunday, 22 Nov 2026</option>
                        <option value="Monday, 23 Nov 2026">Monday, 23 Nov 2026</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">Time Slot</label>
                      <select
                        value={bookTableTime}
                        onChange={(e) => setBookTableTime(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 bg-white font-medium focus:outline-none focus:border-[#C83B1E]"
                      >
                        <option value="1:00 PM">1:00 PM (Lunch)</option>
                        <option value="2:30 PM">2:30 PM (Afternoon Coffee)</option>
                        <option value="6:00 PM">6:00 PM (Snacks & Pizza)</option>
                        <option value="7:30 PM">7:30 PM (Evening Dinner)</option>
                        <option value="8:30 PM">8:30 PM (Prime Dinner)</option>
                        <option value="9:30 PM">9:30 PM (Late Night Cravings)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">
                        Number of Guests ({bookTableGuests} People)
                      </label>
                      <div className="flex items-center gap-2">
                        {[2, 4, 6, 8].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setBookTableGuests(num)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                              bookTableGuests === num
                                ? "bg-[#C83B1E] border-[#C83B1E] text-white shadow-xs"
                                : "bg-white border-stone-200/80 text-stone-900 hover:bg-stone-50"
                            }`}
                          >
                            {num} Seats
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">Seating Area Preference</label>
                      <select
                        value={bookTableArea}
                        onChange={(e) => setBookTableArea(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 bg-white font-medium focus:outline-none focus:border-[#C83B1E]"
                      >
                        <option value="Window Booth (Cozy Corner)">Window Booth (Cozy Corner)</option>
                        <option value="Indoor AC Main Floor">Indoor AC Main Floor</option>
                        <option value="Garden Courtyard">Garden Courtyard</option>
                        <option value="VIP Birthday Lounge">VIP Birthday Lounge</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-900 block mb-1">Occasion / Special Request</label>
                    <input
                      type="text"
                      placeholder="e.g. Birthday celebration, Candlelight anniversary, extra oregano dips"
                      value={bookTableNote}
                      onChange={(e) => setBookTableNote(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 focus:outline-none focus:border-[#C83B1E]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <p className="text-[11px] text-stone-500">
                      Zero cancellation fee · Table held for 15 minutes past slot
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowBookTableModal(false)}
                        className="text-xs font-bold"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#C83B1E] hover:bg-[#B33419] text-white text-xs font-bold px-4 py-2 h-auto rounded-xl"
                      >
                        Confirm Booking
                      </Button>
                    </div>
                  </div>

                  {tableBookingSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Table reservation confirmed! We have reserved your table.
                    </div>
                  )}
                </form>
              )}

              {/* Reservations List */}
              <div className="space-y-4">
                {customerReservations.map((res) => (
                  <div
                    key={res.id}
                    className={`bg-white rounded-xl border p-5 sm:p-6 shadow-xs transition ${
                      res.status === "CONFIRMED"
                        ? "border-[#C83B1E]/30 bg-gradient-to-br from-white to-[#FAF7F2]"
                        : "border-stone-200/80 opacity-80"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/60">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-semibold ${
                            res.status === "CONFIRMED"
                              ? "bg-[#C83B1E] text-white shadow-xs"
                              : "bg-[#E5DFD3] text-stone-500"
                          }`}
                        >
                          <span className="text-[9px] font-mono uppercase tracking-wider">TBL</span>
                          <span className="text-base leading-none">0{res.tableNo}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-stone-900">{res.area}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                res.status === "CONFIRMED"
                                  ? "bg-emerald-100 text-emerald-800 animate-pulse"
                                  : res.status === "COMPLETED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {res.status}
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-600" />
                              {res.date}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              {res.time}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1 font-semibold text-stone-900">
                              <Users className="w-3.5 h-3.5 text-[#C83B1E]" />
                              {res.guests} Guests
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Waiter Check-In QR Pass */}
                      {res.status === "CONFIRMED" && (
                        <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200/60 flex items-center gap-3 self-start sm:self-auto">
                          <div className="w-9 h-9 rounded-xl bg-white border border-stone-200/60 flex items-center justify-center text-stone-900">
                            <QrCode className="w-5 h-5 text-[#C83B1E]" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-stone-400 uppercase block">
                              Host Check-In PIN
                            </span>
                            <span className="text-xs font-mono font-semibold text-stone-900">{res.pin}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-stone-500">
                        {res.occasion && (
                          <span className="font-semibold text-stone-900">Note: {res.occasion}</span>
                        )}
                        {res.specialRequest && (
                          <span className="block text-[11px] text-stone-400 mt-0.5">
                            Preferences: {res.specialRequest}
                          </span>
                        )}
                      </div>

                      {res.status === "CONFIRMED" && (
                        <div className="flex items-center gap-2">
                          <a
                            href="tel:+919876543210"
                            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-stone-200/80 text-stone-900 hover:bg-stone-50 flex items-center gap-1.5"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>Call Host</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCancelReservation(res.id)}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl text-rose-700 hover:bg-rose-50 transition"
                          >
                            Cancel Reservation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 4. TAB: FAVORITES ================= */}
          {activeTab === "favorites" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">
                  Your Favorite Dishes ({favoriteItems.length})
                </h3>
                <p className="text-xs text-stone-500">
                  Your saved items for ultra-fast 1-tap ordering
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {favoriteItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        {item.category}
                      </div>
                      <div className="font-bold text-sm text-stone-900 truncate mt-0.5">
                        {item.name}
                      </div>
                      <div className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                        {item.description}
                      </div>
                      <div className="font-mono font-bold text-sm text-[#C83B1E] mt-1.5">
                        ₹{item.price}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="text-rose-500 hover:text-rose-700"
                        title="Remove from favorites"
                      >
                        <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                      </button>
                      <Button
                        onClick={() => handleAddFavoriteToCart(item)}
                        size="sm"
                        className="bg-[#C83B1E] hover:bg-[#B33419] text-white text-xs font-bold px-3 py-1 h-auto rounded-xl flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Order
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 5. TAB: REORDER ================= */}
          {activeTab === "reorder" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">1-Tap Fast Reorder</h3>
                <p className="text-xs text-stone-500">
                  One click to re-populate your cart with meals you have loved in the past
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-stone-200/60 pb-2 mb-2">
                        <span className="font-mono font-semibold text-xs text-stone-900">
                          Order #{ord.orderNo}
                        </span>
                        <span className="font-mono font-bold text-xs text-[#C83B1E]">
                          {formatRupees(ord.pricing.total)}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-stone-500">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{it.qty}× {it.name}</span>
                            <span className="font-mono">{formatRupees(it.unitPrice * it.qty)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleReorder(ord)}
                      className="mt-4 bg-stone-900 hover:bg-[#C83B1E] text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reorder This Entire Meal
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 6. TAB: COUPONS & OFFERS ================= */}
          {activeTab === "coupons" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">
                  Active Offers & Coupons ({coupons.length})
                </h3>
                <p className="text-xs text-stone-500">
                  Tap to copy promo code and save on your next dine-in or takeaway visit
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((c) => (
                  <div
                    key={c.code}
                    className="bg-white rounded-xl border-2 border-dashed border-stone-200 p-5 shadow-xs relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          {c.tag}
                        </span>
                        <span className="text-xs font-extrabold text-[#C83B1E]">
                          {c.discount}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-stone-900 mt-2">{c.title}</h4>
                      <p className="text-xs text-stone-500 mt-1">{c.desc}</p>
                      <div className="text-[10px] text-stone-400 mt-2 font-mono">{c.expiry}</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between">
                      <span className="font-mono font-semibold text-sm bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200/60">
                        {c.code}
                      </span>
                      <Button
                        onClick={() => handleCopyCoupon(c.code)}
                        size="sm"
                        className="bg-[#C83B1E] hover:bg-[#B33419] text-white text-xs font-bold px-3 py-1.5 h-auto rounded-xl flex items-center gap-1 shadow-2xs"
                      >
                        {copiedCoupon === c.code ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Code
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 7. TAB: ADDRESSES ================= */}
          {activeTab === "addresses" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-stone-900">
                    Saved Contact & Billing Addresses ({addresses.length})
                  </h3>
                  <p className="text-xs text-stone-500">
                    Manage your registered addresses for cafe billing & takeaway orders in Chhatarpur
                  </p>
                </div>
                <Button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="bg-[#C83B1E] hover:bg-[#B33419] text-white text-xs font-bold px-3.5 py-1.5 h-auto rounded-xl flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Address
                </Button>
              </div>

              {/* Add Address Form */}
              {showAddAddress && (
                <form
                  onSubmit={handleAddNewAddress}
                  className="bg-white rounded-xl border border-stone-200/80 p-5 shadow-xs space-y-3"
                >
                  <h4 className="font-bold text-sm text-stone-900">Add New Contact Address</h4>
                  <div className="flex gap-2">
                    {(["Home", "Work", "Other"] as const).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setNewLabel(type)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          newLabel === type
                            ? "bg-[#C83B1E] text-white border-[#C83B1E]"
                            : "bg-stone-50 text-stone-900 border-stone-200/80"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-900 block mb-1">
                      Complete Street Address:
                    </label>
                    <textarea
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="e.g. House No. 24, Near Bus Stand, Chhatarpur"
                      required
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 focus:outline-none focus:border-[#C83B1E]"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-900 block mb-1">
                      Landmark (Optional):
                    </label>
                    <input
                      type="text"
                      value={newLandmark}
                      onChange={(e) => setNewLandmark(e.target.value)}
                      placeholder="e.g. Near Hanuman Temple"
                      className="w-full text-xs p-2 rounded-xl border border-stone-200/80 focus:outline-none focus:border-[#C83B1E]"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      className="bg-[#C83B1E] hover:bg-[#B33419] text-white text-xs font-bold px-4 py-1.5 h-auto rounded-xl"
                    >
                      Save Address
                    </Button>
                    <Button
                      type="button"
                      variant="paper"
                      onClick={() => setShowAddAddress(false)}
                      className="text-xs font-bold px-3 py-1.5 h-auto rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* Address List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {addresses.map((a) => (
                  <div
                    key={a.id}
                    className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-50 text-stone-900 border border-stone-200/60">
                          {a.label}
                        </span>
                        {a.isDefault && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Default Address
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-900 mt-2 font-medium">{a.address}</p>
                      {a.landmark && (
                        <p className="text-[11px] text-stone-400 mt-1">Landmark: {a.landmark}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-stone-200/60 flex items-center justify-between">
                      {!a.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(a.id)}
                          className="text-[11px] font-bold text-[#C83B1E] hover:underline"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(a.id)}
                        className="text-stone-400 hover:text-rose-600 ml-auto"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 8. TAB: PAYMENTS ================= */}
          {activeTab === "payments" && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-base text-stone-900">Saved Payment Methods</h3>
                <p className="text-xs text-stone-500">
                  Manage UPI VPA handles, saved cards, and download invoices
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      UPI
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-900">Google Pay / PhonePe UPI</div>
                      <div className="text-[11px] text-stone-500 font-mono">aman.sharma@okaxis</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Primary
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      HDFC
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-900">HDFC Millennia Debit Card</div>
                      <div className="text-[11px] text-stone-500 font-mono">•••• •••• •••• 4092</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">Exp 09/28</span>
                </div>
              </div>

              {/* Transaction Receipts Ledger */}
              <div>
                <h4 className="font-bold text-sm text-stone-900 mb-2.5">Past Payment Receipts</h4>
                <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden">
                  <div className="divide-y divide-stone-200/60 text-xs">
                    {orders.slice(0, 4).map((o) => (
                      <div key={o.id} className="p-3.5 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-stone-900">Order #{o.orderNo} · {o.paymentMethod}</div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            {new Date(o.createdAt).toLocaleDateString("en-IN")} · Txn ID: TXN-{o.orderNo}9842
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-sm text-stone-900">
                            {formatRupees(o.pricing.total)}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            SUCCESS
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 9. TAB: REVIEWS & RATINGS ================= */}
          {activeTab === "reviews" && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-base text-stone-900">Reviews & Experience Rating</h3>
                <p className="text-xs text-stone-500">
                  Share your honest feedback to help us craft better food and win 50 bonus loyalty points
                </p>
              </div>

              {/* Review Input Box */}
              <form
                onSubmit={handleReviewSubmit}
                className="bg-white rounded-xl border border-stone-200/80 p-5 shadow-xs space-y-4"
              >
                <h4 className="font-bold text-sm text-stone-900">Rate Your Recent Meal</h4>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingInput(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= ratingInput ? "fill-amber-400" : "text-stone-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-900 ml-2">
                    {ratingInput} of 5 Stars
                  </span>
                </div>

                <textarea
                  value={reviewInput}
                  onChange={(e) => setReviewInput(e.target.value)}
                  placeholder="Tell us what you liked about the pizza crust, cheese pull, cold coffee, or floor service or takeaway packaging..."
                  rows={3}
                  required
                  className="w-full text-xs p-3 rounded-xl border border-stone-200/80 focus:outline-none focus:border-[#C83B1E]"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    ★ +50 7-Bites Loyalty points on verified reviews
                  </span>
                  <Button
                    type="submit"
                    className="bg-[#C83B1E] hover:bg-[#B33419] text-white text-xs font-bold px-4 py-2 h-auto rounded-xl shadow-2xs"
                  >
                    Submit Review
                  </Button>
                </div>

                {reviewSubmitted && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thank you for your review! 50 Points credited to your Gold Tier wallet.</span>
                  </div>
                )}
              </form>

              {/* Past Reviews */}
              <div>
                <h4 className="font-bold text-sm text-stone-900 mb-2.5">Your Past Feedback</h4>
                <div className="bg-white rounded-xl border border-stone-200/80 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">14 Nov 2026</span>
                  </div>
                  <p className="text-xs text-stone-900 font-medium">
                    "The Paneer Tikka pizza was fresh, stone-baked and super crispy. The cheese pull was unreal! Also loved the packaging."
                  </p>
                  <div className="text-[10px] text-emerald-700 font-bold">Verified Dine-in Guest</div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 10. TAB: NOTIFICATIONS ================= */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-stone-900">Notifications & Updates</h3>
                  <p className="text-xs text-stone-500">
                    Order alerts, promo discounts, and stamp progress
                  </p>
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={() => setUnreadNotificationsCount(0)}
                    className="text-xs font-bold text-[#C83B1E] hover:underline"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    title: "Order #104 is in the Stone Oven! 🔥",
                    desc: "Chef Manoj has stretched your handmade dough and placed it inside the 350°C stone oven.",
                    time: "10 mins ago",
                    unread: true,
                    type: "order",
                  },
                  {
                    title: "85 Loyalty Points Added ⭐",
                    desc: "You earned 85 points for your last order. Your current balance is 420 points (₹210 discount value).",
                    time: "Yesterday",
                    unread: true,
                    type: "loyalty",
                  },
                  {
                    title: "Weekend Flash Sale: 20% OFF 🍕",
                    desc: "Use code PIZZAPARTY on all large pizzas this Friday to Sunday. Dine-in and Takeaway.",
                    time: "2 days ago",
                    unread: true,
                    type: "promo",
                  },
                  {
                    title: "Table Booking Confirmed ✨",
                    desc: "Table for 4 reserved for Birthday Party celebration on 21 Nov at 7:30 PM.",
                    time: "3 days ago",
                    unread: false,
                    type: "table",
                  },
                ].map((n, idx) => (
                  <div
                    key={idx}
                    className={`bg-white rounded-xl border p-4 shadow-xs flex items-start justify-between gap-3 ${
                      n.unread ? "border-[#C83B1E]/40 bg-[#FFFDFB]" : "border-stone-200/80"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-stone-50 text-[#C83B1E] flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-stone-900 flex items-center gap-2">
                          <span>{n.title}</span>
                          {n.unread && (
                            <span className="w-2 h-2 rounded-full bg-[#C83B1E]" />
                          )}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">{n.desc}</div>
                        <div className="text-[10px] text-stone-400 font-mono mt-1">{n.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 11. TAB: CUSTOMER SUPPORT ================= */}
          {activeTab === "support" && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-base text-stone-900">Customer Support & Helpdesk</h3>
                <p className="text-xs text-stone-500">
                  Direct access to cafe manager, live WhatsApp chat, and fast grievance resolution
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 text-white rounded-2xl p-5 shadow-xs flex items-center justify-between hover:bg-emerald-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Chat on WhatsApp</div>
                      <div className="text-[11px] text-emerald-100">Instant reply · Avg 2 mins</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="tel:+919876543210"
                  className="bg-stone-900 text-white rounded-2xl p-5 shadow-xs flex items-center justify-between hover:bg-black transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
                      <Phone className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Call Cafe Hotline</div>
                      <div className="text-[11px] text-white/60">+91 98765 43210</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* FAQs */}
              <div>
                <h4 className="font-bold text-sm text-stone-900 mb-3">Frequently Asked Questions</h4>
                <div className="space-y-2.5">
                  {[
                    {
                      q: "What are your cafe operating hours in Chhatarpur?",
                      a: "We deliver hot and fresh from 11:00 AM to 11:30 PM every day across Chhatarpur city within a 7 km radius.",
                    },
                    {
                      q: "How does the '7 Bites, 8th Free' stamp program work?",
                      a: "Every time you order above ₹250, you earn 1 digital stamp. Once you collect 7 stamps, your 8th pizza or meal is completely free!",
                    },
                    {
                      q: "Do you use 100% real dairy mozzarella cheese?",
                      a: "Yes! We use 100% pure dairy mozzarella with zero analogues, zero palm oil blends, and zero artificial cheese powders.",
                    },
                  ].map((faq, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-stone-200/80 p-4">
                      <div className="font-bold text-xs text-stone-900">{faq.q}</div>
                      <div className="text-xs text-stone-500 mt-1">{faq.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 12. TAB: MEMBERSHIP (LOYALTY & STAMP CARD) ================= */}
          {activeTab === "membership" && (
            <div className="space-y-6">
              {/* VIP Gold Card */}
              <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-[#2A1D16] to-stone-900 text-stone-100 p-6 sm:p-7 shadow-lg border border-amber-500/30 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
                    <span className="font-mono text-xs tracking-wider text-[#F59E0B] uppercase font-bold">
                      7 Bites VIP Club
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-semibold border border-[#F59E0B]/30">
                    ★ {customer.tier} Tier
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="text-[10px] text-white/50 uppercase font-mono">Member Name</div>
                    <div className="font-bold text-sm text-white mt-0.5">{customer.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/50 uppercase font-mono">Member ID</div>
                    <div className="font-mono text-sm text-white mt-0.5">7B-GOLD-8492</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/50 uppercase font-mono">Points Balance</div>
                    <div className="font-mono font-bold text-sm text-[#F59E0B] mt-0.5">
                      {customer.loyaltyPoints} pts (₹{customer.loyaltyPoints / 2})
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/50 uppercase font-mono">Total Orders</div>
                    <div className="font-mono text-sm text-white mt-0.5">{customer.totalOrders} Meals</div>
                  </div>
                </div>
              </div>

              {/* Digital Stamp Card */}
              <div className="bg-white rounded-xl border border-stone-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-base text-stone-900">
                      7 Bites, 8th Free! Stamp Card
                    </h4>
                    <p className="text-xs text-stone-500">
                      Collect 7 stamps on orders over ₹250. Your 8th meal is completely free!
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                    7/8 Collected
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 pt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                    const isCollected = num <= 7;
                    const isFreeMeal = num === 8;
                    return (
                      <div
                        key={num}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center border-2 transition ${
                          isCollected
                            ? "bg-[#C83B1E]/10 border-[#C83B1E] text-[#C83B1E]"
                            : isFreeMeal
                            ? "bg-amber-100 border-dashed border-amber-400 text-amber-900 animate-pulse"
                            : "bg-stone-50 border-stone-200/60 text-stone-400"
                        }`}
                      >
                        {isCollected ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-[#C83B1E]" />
                            <span className="text-[9px] font-semibold mt-1 font-mono">Bite {num}</span>
                          </>
                        ) : isFreeMeal ? (
                          <>
                            <Gift className="w-5 h-5 text-amber-700" />
                            <span className="text-[9px] font-semibold mt-1 uppercase text-amber-900">
                              FREE!
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-bold text-stone-400 font-mono">{num}</span>
                            <span className="text-[9px] text-stone-400 mt-1">Pending</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= 13. TAB: PROFILE ================= */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">Personal Profile Information</h3>
                <p className="text-xs text-stone-500">
                  Update your contact details and preferences for personalized offers
                </p>
              </div>

              <form
                onSubmit={handleSaveProfile}
                className="bg-white rounded-xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-900 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 focus:outline-none focus:border-[#C83B1E]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-900 block mb-1">
                      Phone Number (OTP Login)
                    </label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 focus:outline-none focus:border-[#C83B1E] font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-900 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 focus:outline-none focus:border-[#C83B1E]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-900 block mb-1">
                      Birthday (Birthday Surprise Offer)
                    </label>
                    <input
                      type="date"
                      value={profileBirthday}
                      onChange={(e) => setProfileBirthday(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 focus:outline-none focus:border-[#C83B1E]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-stone-200/60">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="vegOnly"
                      checked={profileVegOnly}
                      onChange={(e) => setProfileVegOnly(e.target.checked)}
                      className="rounded accent-[#C83B1E]"
                    />
                    <label htmlFor="vegOnly" className="text-xs font-bold text-stone-900">
                      Show 100% Pure Veg menu items only
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="bg-[#C83B1E] hover:bg-[#B33419] text-white text-xs font-bold px-4 py-2 h-auto rounded-xl"
                  >
                    Save Changes
                  </Button>
                </div>

                {profileSaved && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Profile details updated successfully!</span>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ================= 14. TAB: SETTINGS ================= */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">Account Settings & Preferences</h3>
                <p className="text-xs text-stone-500">
                  Manage communication channels, language, and security
                </p>
              </div>

              <div className="bg-white rounded-xl border border-stone-200/80 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                  <div>
                    <div className="font-bold text-xs text-stone-900">WhatsApp Order Notifications</div>
                    <div className="text-[11px] text-stone-500">Receive live KOT tracking and bill receipts on WhatsApp</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifWhatsApp}
                    onChange={(e) => setNotifWhatsApp(e.target.checked)}
                    className="w-4 h-4 accent-[#C83B1E]"
                  />
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                  <div>
                    <div className="font-bold text-xs text-stone-900">SMS Promotional Offers</div>
                    <div className="text-[11px] text-stone-500">Get notified of weekend discounts and birthday perks</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSMS}
                    onChange={(e) => setNotifSMS(e.target.checked)}
                    className="w-4 h-4 accent-[#C83B1E]"
                  />
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                  <div>
                    <div className="font-bold text-xs text-stone-900">Language Preference</div>
                    <div className="text-[11px] text-stone-500">Choose your preferred menu display language</div>
                  </div>
                  <select
                    value={appLanguage}
                    onChange={(e) => setAppLanguage(e.target.value as "English" | "Hindi")}
                    className="text-xs p-1.5 rounded-lg border border-stone-200/80"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      logout();
                      navigate({ to: "/login" });
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out from Account
                  </button>

                  <span className="text-[10px] text-stone-400 font-mono">Version 2.4.0 · 7 Bites Cafe OS</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
