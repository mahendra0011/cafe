import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Box,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Coffee,
  Coins,
  CreditCard,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Flame,
  Gift,
  HelpCircle,
  History,
  Layers,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Package,
  Percent,
  Phone,
  Plus,
  Printer,
  QrCode,
  Receipt,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  Table,
  Tag,
  Activity,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  Utensils,
  UtensilsCrossed,
  X,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupees, toPaise } from "@/lib/money";
import {
  getOrders,
  placeOrder,
  subscribeToStore,
  updateOrderStatus,
  type CafeOrder,
} from "@/lib/order-store";
import menuData from "@/data/menu.json";
import { type MenuItem } from "@/config/site";

const allMenuItems = menuData as MenuItem[];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Cafe Operations Super Admin | 7 Bites Cafe OS" },
      {
        name: "description",
        content: "Offline Cafe Operating System for 7 Bites: Table Floor Map, Live KDS, Dine-In POS, Table Reservations, Inventory, and GST billing.",
      },
    ],
  }),
  component: AdminDashboardPage,
});

export type AdminTab =
  // 1. Main Control
  | "dashboard"
  | "manual-order"
  | "order-history"
  | "table-floor"
  | "live-kds"
  | "pos-billing"
  | "menu-catalog"
  | "digital-qr"
  | "storefront-cms"
  // 2. Reservations & Kitchen
  | "reservations"
  | "combos-specials"
  | "inventory-stock"
  | "recipes-cost"
  // 3. Customers & Finance
  | "customer-crm"
  | "cash-register"
  | "tax-gst"
  | "billing-ledger"
  | "coupons-offers"
  | "reviews-ratings"
  // 4. Reports & Configuration
  | "analytics-reports"
  | "staff-pins"
  | "hardware-settings";

export interface TableOrderItem {
  id: string;
  itemId: string;
  name: string;
  category: string;
  price: number; // in rupees
  qty: number;
}

export interface ActiveOrderTicket {
  ticketId: string;
  ticketNo: number;
  guestName: string;
  phone?: string;
  tag: string; // e.g. "Table 4 (Person 1)", "Table 4 (Person 2)", "Counter", "Takeaway"
  items: TableOrderItem[];
  status: "ACTIVE" | "BILL_REQUESTED" | "SETTLED";
  seatedMinutes?: number;
}

export interface TableEventBooking {
  id: string;
  tableNumber: number;
  tableSeats: number;
  eventType: "BIRTHDAY" | "ANNIVERSARY" | "REUNION" | "CORPORATE" | "CANDLELIGHT" | "PRIVATE_PARTY";
  eventTitle: string;
  hostName: string;
  hostPhone: string;
  guestCount: number;
  date: string;
  timeSlot: string;
  setupNotes: string;
  status: "CONFIRMED" | "DECOR_READY" | "IN_PROGRESS" | "COMPLETED";
  advancePaid: number;
  estimatedBill: number;
  preOrderedItems: Array<{ name: string; qty: number; price: number }>;
}

export interface TableInfo {
  number: number;
  seats: number;
  status: "VACANT" | "OCCUPIED" | "RESERVED" | "BILL_REQUESTED";
  guestName?: string;
  phone?: string;
  items: TableOrderItem[];
  orderTotal?: number; // in rupees
  itemsCount?: number;
  seatedMinutes?: number;
}

interface Reservation {
  id: string;
  guestName: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  occasion: string;
  status: "PENDING" | "CONFIRMED" | "SEATED" | "CANCELLED";
  assignedTable?: number;
}

export function AdminDashboardPage() {
  const [orders, setOrders] = useState<CafeOrder[]>(() => getOrders());
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [busyMode, setBusyMode] = useState(false);
  const [dateRange, setDateRange] = useState<"today" | "yesterday" | "7d" | "30d">("today");

  // ================= DYNAMIC 12-TABLE FLOOR STATE (PER-TABLE ACTIVE ORDERS) =================
  const [tables, setTables] = useState<TableInfo[]>([
    {
      number: 1,
      seats: 2,
      status: "VACANT",
      items: [],
      orderTotal: 0,
      itemsCount: 0,
    },
    {
      number: 2,
      seats: 2,
      status: "OCCUPIED",
      guestName: "Aakash Gupta",
      phone: "98261 11223",
      seatedMinutes: 25,
      items: [
        { id: "t2-1", itemId: "pizza-1", name: "Farmhouse Feast Pizza (M)", category: "Pizza", price: 329, qty: 1 },
        { id: "t2-2", itemId: "cold-coffee-1", name: "Signature Cold Coffee", category: "Cold Coffee", price: 129, qty: 2 },
      ],
      orderTotal: 616,
      itemsCount: 3,
    },
    {
      number: 3,
      seats: 4,
      status: "OCCUPIED",
      guestName: "Priya Patel",
      phone: "98765 44332",
      seatedMinutes: 40,
      items: [
        { id: "t3-1", itemId: "burgers-1", name: "Double Cheese Paneer Burger", category: "Burgers", price: 179, qty: 2 },
        { id: "t3-2", itemId: "fries-1", name: "Spicy Peri-Peri Crinkle Fries", category: "Fries & Sides", price: 119, qty: 1 },
        { id: "t3-3", itemId: "cold-coffee-1", name: "Signature Cold Coffee", category: "Cold Coffee", price: 129, qty: 2 },
      ],
      orderTotal: 772,
      itemsCount: 5,
    },
    {
      number: 4,
      seats: 4,
      status: "BILL_REQUESTED",
      guestName: "Rohit Sharma",
      phone: "94251 77889",
      seatedMinutes: 52,
      items: [
        { id: "t4-1", itemId: "pizza-1", name: "Farmhouse Loaded Pizza (L)", category: "Pizza", price: 429, qty: 1 },
        { id: "t4-2", itemId: "burgers-1", name: "Double Cheese Paneer Burger", category: "Burgers", price: 179, qty: 1 },
        { id: "t4-3", itemId: "cold-coffee-1", name: "Signature Cold Coffee", category: "Cold Coffee", price: 129, qty: 2 },
      ],
      orderTotal: 909,
      itemsCount: 4,
    },
    {
      number: 5,
      seats: 4,
      status: "OCCUPIED",
      guestName: "Aman Sharma",
      phone: "98765 43210",
      seatedMinutes: 15,
      items: [
        { id: "t5-1", itemId: "pizza-2", name: "Paneer Makhani Stone-Oven Pizza", category: "Pizza", price: 349, qty: 1 },
        { id: "t5-2", itemId: "momos-1", name: "Steamed Momos (8pcs)", category: "Momos", price: 129, qty: 2 },
      ],
      orderTotal: 637,
      itemsCount: 3,
    },
    {
      number: 6,
      seats: 6,
      status: "RESERVED",
      guestName: "Birthday Party (Dr. Verma)",
      phone: "98261 44521",
      seatedMinutes: 0,
      items: [],
      orderTotal: 0,
      itemsCount: 0,
    },
    {
      number: 7,
      seats: 4,
      status: "VACANT",
      items: [],
      orderTotal: 0,
      itemsCount: 0,
    },
    {
      number: 8,
      seats: 2,
      status: "OCCUPIED",
      guestName: "Couple Date (Kunal & Riya)",
      phone: "91792 33410",
      seatedMinutes: 30,
      items: [
        { id: "t8-1", itemId: "pizza-1", name: "Farmhouse Pizza (Personal)", category: "Pizza", price: 219, qty: 1 },
        { id: "t8-2", itemId: "dessert-1", name: "Sizzling Choco Brownie", category: "Desserts", price: 149, qty: 1 },
      ],
      orderTotal: 386,
      itemsCount: 2,
    },
    {
      number: 9,
      seats: 4,
      status: "VACANT",
      items: [],
      orderTotal: 0,
      itemsCount: 0,
    },
    {
      number: 10,
      seats: 6,
      status: "VACANT",
      items: [],
      orderTotal: 0,
      itemsCount: 0,
    },
    {
      number: 11,
      seats: 2,
      status: "VACANT",
      items: [],
      orderTotal: 0,
      itemsCount: 0,
    },
    {
      number: 12,
      seats: 8,
      status: "RESERVED",
      guestName: "Family Anniversary (Gupta Ji)",
      phone: "97554 88992",
      seatedMinutes: 0,
      items: [],
      orderTotal: 0,
      itemsCount: 0,
    },
  ]);

  // ================= ACTIVE RUNNING ORDER TICKETS (MULTI-PERSON PER TABLE) =================
  const [activeTickets, setActiveTickets] = useState<ActiveOrderTicket[]>([
    {
      ticketId: "tkt-1",
      ticketNo: 1,
      guestName: "Aman Sharma",
      phone: "98765 43210",
      tag: "Table 4 (Person 1)",
      items: [
        { id: "t1-1", itemId: "pizza-1", name: "Farmhouse Feast Pizza (M)", category: "Pizza", price: 329, qty: 1 },
        { id: "t1-2", itemId: "cold-coffee-1", name: "Signature Cold Coffee", category: "Cold Coffee", price: 129, qty: 2 },
      ],
      status: "ACTIVE",
      seatedMinutes: 20,
    },
    {
      ticketId: "tkt-2",
      ticketNo: 2,
      guestName: "Rohan Mehra",
      phone: "98261 44521",
      tag: "Table 4 (Person 2 - Split Bill)",
      items: [
        { id: "t2-1", itemId: "burgers-1", name: "Double Cheese Paneer Burger", category: "Burgers", price: 179, qty: 1 },
        { id: "t2-2", itemId: "fries-1", name: "Spicy Peri-Peri Crinkle Fries", category: "Fries & Sides", price: 119, qty: 1 },
      ],
      status: "ACTIVE",
      seatedMinutes: 15,
    },
    {
      ticketId: "tkt-3",
      ticketNo: 3,
      guestName: "Priya Patel",
      phone: "98261 11223",
      tag: "Table 2 (Guest 1)",
      items: [
        { id: "t3-1", itemId: "momos-1", name: "Steamed Momos (8pcs)", category: "Momos", price: 129, qty: 2 },
        { id: "t3-2", itemId: "shakes-1", name: "Belgian Chocolate Shake", category: "Shakes", price: 149, qty: 1 },
      ],
      status: "ACTIVE",
      seatedMinutes: 30,
    },
    {
      ticketId: "tkt-4",
      ticketNo: 4,
      guestName: "Aakash Gupta",
      phone: "97554 88992",
      tag: "Table 2 (Guest 2 - Separate)",
      items: [
        { id: "t4-1", itemId: "cold-coffee-1", name: "Signature Cold Coffee", category: "Cold Coffee", price: 129, qty: 2 },
        { id: "t4-2", itemId: "burgers-1", name: "Double Cheese Paneer Burger", category: "Burgers", price: 179, qty: 1 },
      ],
      status: "BILL_REQUESTED",
      seatedMinutes: 35,
    },
    {
      ticketId: "tkt-5",
      ticketNo: 5,
      guestName: "Dr. Aniruddh Verma",
      phone: "94251 77210",
      tag: "Family Table 6",
      items: [
        { id: "t5-1", itemId: "pizza-1", name: "Farmhouse Loaded Pizza (L)", category: "Pizza", price: 429, qty: 1 },
        { id: "t5-2", itemId: "cold-coffee-1", name: "Signature Cold Coffee", category: "Cold Coffee", price: 129, qty: 2 },
      ],
      status: "ACTIVE",
      seatedMinutes: 10,
    },
    {
      ticketId: "tkt-6",
      ticketNo: 6,
      guestName: "Kunal Singhal",
      phone: "91792 33410",
      tag: "Table 8 (Couple A)",
      items: [
        { id: "t6-1", itemId: "pizza-1", name: "Farmhouse Pizza (Personal)", category: "Pizza", price: 219, qty: 1 },
      ],
      status: "ACTIVE",
      seatedMinutes: 25,
    },
    {
      ticketId: "tkt-7",
      ticketNo: 7,
      guestName: "Riya Sen",
      phone: "98261 99887",
      tag: "Table 8 (Couple B - Separate)",
      items: [
        { id: "t7-1", itemId: "dessert-1", name: "Sizzling Choco Brownie", category: "Desserts", price: 149, qty: 1 },
        { id: "t7-2", itemId: "cold-coffee-1", name: "Signature Cold Coffee", category: "Cold Coffee", price: 129, qty: 1 },
      ],
      status: "ACTIVE",
      seatedMinutes: 25,
    },
    {
      ticketId: "tkt-8",
      ticketNo: 8,
      guestName: "Counter Walk-in",
      phone: "94251 00112",
      tag: "Counter Takeaway #1",
      items: [
        { id: "t8-1", itemId: "pizza-2", name: "Paneer Makhani Stone-Oven Pizza", category: "Pizza", price: 349, qty: 1 },
      ],
      status: "ACTIVE",
      seatedMinutes: 5,
    },
    {
      ticketId: "tkt-9",
      ticketNo: 9,
      guestName: "New Guest",
      phone: "",
      tag: "Open Ticket #09",
      items: [],
      status: "ACTIVE",
      seatedMinutes: 0,
    },
  ]);

  const [activeTicketIdForAdding, setActiveTicketIdForAdding] = useState<string>("tkt-1");
  const [ticketGuestNameInput, setTicketGuestNameInput] = useState<string>("");
  const [ticketPhoneInput, setTicketPhoneInput] = useState<string>("");
  const [ticketTagInput, setTicketTagInput] = useState<string>("");

  // Selected table for menu item adding
  const [activeTableForAdding, setActiveTableForAdding] = useState<number>(4);
  const [activeTableGuestName, setActiveTableGuestName] = useState<string>("");
  const [activeTableGuestPhone, setActiveTableGuestPhone] = useState<string>("");

  // Selected table on floor plan
  const [selectedTableNo, setSelectedTableNo] = useState<number | null>(4);

  // ================= ANALYTICS & BUSINESS INTELLIGENCE STATE =================
  const [analyticsHorizon, setAnalyticsHorizon] = useState<"today" | "yesterday" | "7d" | "30d">("today");
  const [analyticsMetric, setAnalyticsMetric] = useState<"sales" | "orders">("sales");

  const hourlySalesToday = [
    { time: "11 AM", sales: 280, orders: 1, cogs: 72 },
    { time: "12 PM", sales: 490, orders: 2, cogs: 128 },
    { time: "1 PM", sales: 890, orders: 4, cogs: 235 },
    { time: "2 PM", sales: 1140, orders: 5, cogs: 300 },
    { time: "3 PM", sales: 650, orders: 3, cogs: 170 },
    { time: "4 PM", sales: 520, orders: 2, cogs: 135 },
    { time: "5 PM", sales: 890, orders: 4, cogs: 232 },
    { time: "6 PM", sales: 1420, orders: 6, cogs: 370 },
    { time: "7 PM", sales: 2180, orders: 8, cogs: 570 },
    { time: "8 PM", sales: 2890, orders: 10, cogs: 755 },
    { time: "9 PM", sales: 3120, orders: 12, cogs: 815 },
    { time: "10 PM", sales: 2240, orders: 8, cogs: 585 },
    { time: "11 PM", sales: 940, orders: 3, cogs: 245 },
  ];

  const hourlySalesYesterday = [
    { time: "11 AM", sales: 210, orders: 1, cogs: 55 },
    { time: "12 PM", sales: 380, orders: 2, cogs: 99 },
    { time: "1 PM", sales: 740, orders: 3, cogs: 195 },
    { time: "2 PM", sales: 980, orders: 4, cogs: 258 },
    { time: "3 PM", sales: 540, orders: 2, cogs: 142 },
    { time: "4 PM", sales: 420, orders: 2, cogs: 110 },
    { time: "5 PM", sales: 710, orders: 3, cogs: 186 },
    { time: "6 PM", sales: 1180, orders: 5, cogs: 310 },
    { time: "7 PM", sales: 1790, orders: 7, cogs: 470 },
    { time: "8 PM", sales: 2420, orders: 9, cogs: 635 },
    { time: "9 PM", sales: 2650, orders: 10, cogs: 695 },
    { time: "10 PM", sales: 1890, orders: 7, cogs: 495 },
    { time: "11 PM", sales: 680, orders: 2, cogs: 178 },
  ];

  const sales7Days = [
    { time: "Mon", sales: 18450, orders: 58, cogs: 4850 },
    { time: "Tue", sales: 21200, orders: 64, cogs: 5580 },
    { time: "Wed", sales: 19800, orders: 61, cogs: 5210 },
    { time: "Thu", sales: 23400, orders: 72, cogs: 6150 },
    { time: "Fri", sales: 31200, orders: 94, cogs: 8200 },
    { time: "Sat", sales: 42500, orders: 128, cogs: 11150 },
    { time: "Sun", sales: 38900, orders: 116, cogs: 10200 },
  ];

  const sales30Days = [
    { time: "Week 1", sales: 142000, orders: 430, cogs: 37400 },
    { time: "Week 2", sales: 156500, orders: 472, cogs: 41200 },
    { time: "Week 3", sales: 168200, orders: 512, cogs: 44300 },
    { time: "Week 4", sales: 184900, orders: 558, cogs: 48600 },
  ];

  const currentAnalyticsChartData = useMemo(() => {
    switch (analyticsHorizon) {
      case "yesterday":
        return hourlySalesYesterday;
      case "7d":
        return sales7Days;
      case "30d":
        return sales30Days;
      case "today":
      default:
        return hourlySalesToday;
    }
  }, [analyticsHorizon]);

  const categoryShareData = [
    { name: "Pizzas (Stone-Oven)", value: 42, revenue: 24850, color: "#C83B1E", margin: "74%" },
    { name: "Artisan Coffee & Shakes", value: 26, revenue: 15380, color: "#7C3AED", margin: "82%" },
    { name: "Burgers & Sides", value: 18, revenue: 10650, color: "#F59E0B", margin: "68%" },
    { name: "Himalayan Momos", value: 9, revenue: 5320, color: "#10B981", margin: "76%" },
    { name: "Sizzling Desserts", value: 5, revenue: 2950, color: "#06B6D4", margin: "78%" },
  ];

  const channelSplitData = [
    { channel: "Dine-In Casual", percentage: 56, amount: 33150, color: "bg-[#C83B1E]" },
    { channel: "Event Party Bookings", percentage: 28, amount: 16580, color: "bg-purple-600" },
    { channel: "Counter Takeaway", percentage: 16, amount: 9470, color: "bg-amber-600" },
  ];

  const topSellingMenuChampions = [
    { rank: "#1", name: "Farmhouse Feast Pizza (M)", category: "Pizza", sold: 48, revenue: 15792, margin: 74, tag: "Best Seller" },
    { rank: "#2", name: "Signature Thick Cold Coffee", category: "Beverages", sold: 64, revenue: 8256, margin: 82, tag: "High Profit" },
    { rank: "#3", name: "Double Cheese Paneer Burger", category: "Burgers", sold: 36, revenue: 6444, margin: 68, tag: "Trending" },
    { rank: "#4", name: "Spicy Peri-Peri Crinkle Fries", category: "Sides", sold: 42, revenue: 4998, margin: 85, tag: "Top Add-on" },
    { rank: "#5", name: "Sizzling Choco Brownie", category: "Desserts", sold: 22, revenue: 3278, margin: 78, tag: "Sweet Favorite" },
  ];

  // ================= FULL TABLE EVENT & CELEBRATION BOOKINGS =================
  const [eventBookings, setEventBookings] = useState<TableEventBooking[]>([
    {
      id: "evt-1",
      tableNumber: 6,
      tableSeats: 6,
      eventType: "BIRTHDAY",
      eventTitle: "Dr. Verma 40th Birthday Celebration",
      hostName: "Dr. Aniruddh Verma",
      hostPhone: "98261 44521",
      guestCount: 6,
      date: "2026-11-20",
      timeSlot: "8:00 PM – 10:30 PM",
      setupNotes: "Helium Balloon Arch, Cake Table with Knife & Candles, Party Caps",
      status: "DECOR_READY",
      advancePaid: 1000,
      estimatedBill: 2450,
      preOrderedItems: [
        { name: "Farmhouse Loaded Pizza (Large)", qty: 2, price: 429 },
        { name: "Sizzling Choco Brownie with Ice Cream", qty: 4, price: 149 },
        { name: "Signature Thick Cold Coffee", qty: 6, price: 129 },
      ],
    },
    {
      id: "evt-2",
      tableNumber: 12,
      tableSeats: 8,
      eventType: "ANNIVERSARY",
      eventTitle: "25th Silver Wedding Anniversary Dinner",
      hostName: "Siddharth Gupta",
      hostPhone: "97554 88992",
      guestCount: 8,
      date: "2026-11-20",
      timeSlot: "8:30 PM – 11:00 PM",
      setupNotes: "Full Table Candlelight setup, Rose petals decoration, Romantic Playlist",
      status: "CONFIRMED",
      advancePaid: 1500,
      estimatedBill: 3800,
      preOrderedItems: [
        { name: "Paneer Makhani Stone-Oven Pizza (L)", qty: 3, price: 449 },
        { name: "Creamy Alfredo Pasta (Veg)", qty: 2, price: 249 },
        { name: "Belgian Chocolate Shake", qty: 4, price: 149 },
        { name: "Garlic Bread Supreme", qty: 3, price: 139 },
      ],
    },
    {
      id: "evt-3",
      tableNumber: 4,
      tableSeats: 4,
      eventType: "REUNION",
      eventTitle: "Batch 2024 College Friends Reunion",
      hostName: "Neha Chouksey",
      hostPhone: "91792 33410",
      guestCount: 4,
      date: "2026-11-21",
      timeSlot: "7:00 PM – 9:30 PM",
      setupNotes: "Reserved Corner Table, Photo backdrop area, Custom music request",
      status: "CONFIRMED",
      advancePaid: 800,
      estimatedBill: 1650,
      preOrderedItems: [
        { name: "Double Cheese Paneer Burger", qty: 4, price: 179 },
        { name: "Spicy Peri-Peri Crinkle Fries", qty: 2, price: 119 },
        { name: "Signature Cold Coffee", qty: 4, price: 129 },
      ],
    },
    {
      id: "evt-4",
      tableNumber: 8,
      tableSeats: 6,
      eventType: "CORPORATE",
      eventTitle: "Tech Solutions Q4 Target Milestone Dinner",
      hostName: "Rajesh Bansal",
      hostPhone: "94251 77210",
      guestCount: 6,
      date: "2026-11-20",
      timeSlot: "7:30 PM – 10:00 PM",
      setupNotes: "Quiet Executive Zone, Separate Invoice Billing with Company GSTIN",
      status: "IN_PROGRESS",
      advancePaid: 2000,
      estimatedBill: 3200,
      preOrderedItems: [
        { name: "Farmhouse Feast Pizza (M)", qty: 3, price: 329 },
        { name: "Stuffed Garlic Breads", qty: 3, price: 149 },
        { name: "Cold Coffee with Ice Cream", qty: 6, price: 149 },
      ],
    },
    {
      id: "evt-5",
      tableNumber: 2,
      tableSeats: 2,
      eventType: "CANDLELIGHT",
      eventTitle: "Private Proposal & Candlelight Dinner",
      hostName: "Kunal Singhal",
      hostPhone: "98261 11223",
      guestCount: 2,
      date: "2026-11-21",
      timeSlot: "8:15 PM – 10:00 PM",
      setupNotes: "Private 2-Seater Booth, Red rose bouquet, Sparkler Candle on Dessert",
      status: "CONFIRMED",
      advancePaid: 1000,
      estimatedBill: 1250,
      preOrderedItems: [
        { name: "Farmhouse Personal Pizza", qty: 1, price: 219 },
        { name: "Sizzling Brownie with Sparkler", qty: 1, price: 199 },
        { name: "Signature Cold Coffee", qty: 2, price: 129 },
      ],
    },
  ]);

  const [selectedEventTableNo, setSelectedEventTableNo] = useState<number>(6);
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>("ALL");
  const [showBookEventModal, setShowBookEventModal] = useState<boolean>(false);

  // New Event Form State
  const [newEventTableNo, setNewEventTableNo] = useState<number>(1);
  const [newEventType, setNewEventType] = useState<TableEventBooking["eventType"]>("BIRTHDAY");
  const [newEventTitle, setNewEventTitle] = useState<string>("");
  const [newEventHostName, setNewEventHostName] = useState<string>("");
  const [newEventHostPhone, setNewEventHostPhone] = useState<string>("");
  const [newEventGuestCount, setNewEventGuestCount] = useState<number>(4);
  const [newEventDate, setNewEventDate] = useState<string>("2026-11-21");
  const [newEventTime, setNewEventTime] = useState<string>("20:00");
  const [newEventSetupNotes, setNewEventSetupNotes] = useState<string>("");
  const [newEventAdvance, setNewEventAdvance] = useState<number>(1000);

  const handleUpdateEventStatus = (
    id: string,
    newStatus: TableEventBooking["status"]
  ) => {
    setEventBookings((prev) =>
      prev.map((evt) => (evt.id === id ? { ...evt, status: newStatus } : evt))
    );
  };

  const handleCompleteEventAndFreeTable = (id: string) => {
    setEventBookings((prev) => prev.filter((evt) => evt.id !== id));
  };

  const handleCreateNewEventBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventHostName.trim()) {
      alert("Please enter host name");
      return;
    }
    const newBooking: TableEventBooking = {
      id: `evt-${Date.now()}`,
      tableNumber: newEventTableNo,
      tableSeats: newEventTableNo === 12 ? 8 : newEventTableNo === 6 || newEventTableNo === 8 ? 6 : 4,
      eventType: newEventType,
      eventTitle: newEventTitle.trim() || `${newEventHostName}'s ${newEventType.replace("_", " ")}`,
      hostName: newEventHostName.trim(),
      hostPhone: newEventHostPhone.trim() || "9876543210",
      guestCount: newEventGuestCount,
      date: newEventDate,
      timeSlot: `${newEventTime} – 2.5 hrs`,
      setupNotes: newEventSetupNotes.trim() || "Table booked exclusively for event",
      status: "CONFIRMED",
      advancePaid: newEventAdvance,
      estimatedBill: newEventAdvance * 2,
      preOrderedItems: [
        { name: "Farmhouse Feast Pizza", qty: 2, price: 329 },
        { name: "Signature Cold Coffee", qty: newEventGuestCount, price: 129 },
      ],
    };

    setEventBookings((prev) => [newBooking, ...prev]);
    setSelectedEventTableNo(newBooking.tableNumber);
    setShowBookEventModal(false);

    // Reset inputs
    setNewEventTitle("");
    setNewEventHostName("");
    setNewEventHostPhone("");
    setNewEventSetupNotes("");
  };

  // ================= DYNAMIC TABLE RESERVATIONS =================
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: "res-101",
      guestName: "Dr. Aniruddh Verma",
      phone: "98261 44521",
      guests: 6,
      date: "2026-11-20",
      time: "20:00",
      occasion: "Birthday Party (Balloons & Cake table)",
      status: "CONFIRMED",
      assignedTable: 6,
    },
    {
      id: "res-102",
      guestName: "Siddharth Gupta",
      phone: "97554 88992",
      guests: 8,
      date: "2026-11-20",
      time: "20:30",
      occasion: "Family Anniversary Dinner",
      status: "CONFIRMED",
      assignedTable: 12,
    },
    {
      id: "res-103",
      guestName: "Neha Chouksey",
      phone: "91792 33410",
      guests: 4,
      date: "2026-11-21",
      time: "19:00",
      occasion: "College Friends Reunion",
      status: "PENDING",
    },
    {
      id: "res-104",
      guestName: "Kunal Singhal",
      phone: "94251 77210",
      guests: 2,
      date: "2026-11-21",
      time: "20:15",
      occasion: "Candlelight Pizza Date",
      status: "PENDING",
    },
  ]);

  // Reservation form modal state
  const [showNewResModal, setShowNewResModal] = useState(false);
  const [resName, setResName] = useState("");
  const [resPhone, setResPhone] = useState("");
  const [resGuests, setResGuests] = useState(4);
  const [resTime, setResTime] = useState("19:30");
  const [resOccasion, setResOccasion] = useState("Casual Hangout");

  // ================= DYNAMIC KDS LIVE TICKETS =================
  const [kdsTickets, setKdsTickets] = useState([
    {
      kotNo: 41,
      tableNo: 4,
      type: "DINE-IN",
      time: "12m ago",
      status: "IN_OVEN",
      items: [
        { name: "Farmhouse Loaded Pizza (Large)", qty: 1, note: "Extra crispy crust" },
        { name: "Signature Thick Cold Coffee", qty: 2, note: "Less sweet" },
        { name: "Garlic Bread with Cheese", qty: 1, note: "" },
      ],
    },
    {
      kotNo: 42,
      tableNo: 2,
      type: "DINE-IN",
      time: "6m ago",
      status: "PREPARING",
      items: [
        { name: "Double Cheese Paneer Burger", qty: 2, note: "Peri-peri dip" },
        { name: "Salted Crinkle Fries", qty: 1, note: "Extra dip" },
      ],
    },
    {
      kotNo: 43,
      tableNo: 5,
      type: "DINE-IN",
      time: "2m ago",
      status: "NEW",
      items: [
        { name: "Himalayan Steamed Momos (8 pcs)", qty: 2, note: "Spicy red chutney" },
        { name: "Peach Iced Tea", qty: 2, note: "" },
      ],
    },
    {
      kotNo: 44,
      tableNo: 0,
      type: "TAKEAWAY",
      time: "Just now",
      status: "NEW",
      items: [
        { name: "Paneer Makhani Pizza (Medium)", qty: 1, note: "Boxed to-go" },
        { name: "Sizzling Choco Brownie", qty: 1, note: "" },
      ],
    },
  ]);

  // ================= DYNAMIC MENU 86 & PRICING =================
  const [itemsAvailability, setItemsAvailability] = useState<Record<string, boolean>>({
    "pizza-1": true,
    "pizza-2": true,
    "burgers-1": true,
    "burgers-2": true,
    "cold-coffee-1": true,
    "momos-1": false, // Simulated 86'd item
  });

  // ================= DYNAMIC CASH REGISTER STATE =================
  const [openingFloat, setOpeningFloat] = useState(2500);
  const [pettyExpense, setPettyExpense] = useState(350);
  const [expenseReason, setExpenseReason] = useState("Amul Milk 5L purchase");
  const [shiftClosed, setShiftClosed] = useState(false);

  // ================= COMBOS & SPECIALS STATE =================
  const [combos, setCombos] = useState([
    {
      id: "combo-1",
      title: "Solo Pizza & Cold Coffee Deal",
      price: 299,
      originalPrice: 420,
      badge: "Best Seller",
      items: ["Farmhouse Personal Pizza (7\")", "Signature Thick Cold Coffee", "Garlic Dip"],
      active: true,
    },
    {
      id: "combo-2",
      title: "Couple Pizza & Burger Date Platter",
      price: 549,
      originalPrice: 760,
      badge: "Couple Favorite",
      items: ["Medium Paneer Makhani Pizza", "Double Cheese Burger", "Peri Peri Fries", "2 Cold Brews"],
      active: true,
    },
    {
      id: "combo-3",
      title: "Family Stone-Oven Feast",
      price: 899,
      originalPrice: 1240,
      badge: "Family Pick",
      items: ["Large 7 Bites Special Pizza", "Cheesy Garlic Bread", "Steamed Momos (8pcs)", "Choco Brownie with Fudge", "Large Coke Pitcher"],
      active: true,
    },
    {
      id: "combo-4",
      title: "Evening Hangout Fries & Shake Combo",
      price: 249,
      originalPrice: 340,
      badge: "Youth Favorite",
      items: ["Cheesy Fries", "Oreo Thick Shake", "Spicy Jalapeno Dip"],
      active: false,
    },
  ]);
  const [showAddComboModal, setShowAddComboModal] = useState(false);
  const [newComboTitle, setNewComboTitle] = useState("");
  const [newComboPrice, setNewComboPrice] = useState("");
  const [newComboOrig, setNewComboOrig] = useState("");
  const [newComboItems, setNewComboItems] = useState("");

  // ================= KITCHEN INVENTORY & STOCK =================
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: "inv-1",
      name: "00 Italian Pizza Flour (Farina)",
      category: "Dough Prep",
      qty: 48,
      unit: "kg",
      minThreshold: 20,
      costPerUnit: 85,
      supplier: "Jabalpur Food Supplies",
      status: "OPTIMAL" as const,
    },
    {
      id: "inv-2",
      name: "Pure Dairy Mozzarella Block (Amul)",
      category: "Cheese & Dairy",
      qty: 6.5,
      unit: "kg",
      minThreshold: 10,
      costPerUnit: 440,
      supplier: "Amul MP Dairy Hub",
      status: "LOW_STOCK" as const,
    },
    {
      id: "inv-3",
      name: "San Marzano Style Pizza Sauce",
      category: "Sauces & Condiments",
      qty: 18,
      unit: "kg",
      minThreshold: 8,
      costPerUnit: 140,
      supplier: "Cremica / Dr. Oetker",
      status: "OPTIMAL" as const,
    },
    {
      id: "inv-4",
      name: "100% Arabica Espresso Beans",
      category: "Beverage Raw",
      qty: 3.2,
      unit: "kg",
      minThreshold: 5,
      costPerUnit: 920,
      supplier: "Blue Tokai Coffee Roasters",
      status: "LOW_STOCK" as const,
    },
    {
      id: "inv-5",
      name: "Full Cream Milk (Fresh)",
      category: "Cheese & Dairy",
      qty: 24,
      unit: "liters",
      minThreshold: 15,
      costPerUnit: 64,
      supplier: "Local Dairy Jabalpur",
      status: "OPTIMAL" as const,
    },
    {
      id: "inv-6",
      name: "Fresh Malai Paneer Blocks",
      category: "Fresh Veg & Protein",
      qty: 12,
      unit: "kg",
      minThreshold: 6,
      costPerUnit: 340,
      supplier: "Local Dairy Jabalpur",
      status: "OPTIMAL" as const,
    },
    {
      id: "inv-7",
      name: "Artisan Brioche Burger Buns",
      category: "Bakery",
      qty: 8,
      unit: "packs (4s)",
      minThreshold: 15,
      costPerUnit: 48,
      supplier: "Standard Bakery Jabalpur",
      status: "LOW_STOCK" as const,
    },
    {
      id: "inv-8",
      name: "Custom Kraft Pizza Boxes (10\")",
      category: "Packaging",
      qty: 140,
      unit: "pcs",
      minThreshold: 50,
      costPerUnit: 12,
      supplier: "PackWell Box Printers",
      status: "OPTIMAL" as const,
    },
  ]);
  const [restockFilter, setRestockFilter] = useState<"ALL" | "LOW_STOCK">("ALL");
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockItemId, setRestockItemId] = useState<string | null>(null);
  const [restockQtyInput, setRestockQtyInput] = useState("10");

  // ================= RECIPE BOM & FOOD COST =================
  const [recipes] = useState([
    {
      name: "Farmhouse Stone-Baked Pizza (10\" Medium)",
      category: "Pizzas",
      sellingPrice: 320,
      ingredients: [
        { item: "Fermented Dough Ball (300g)", qty: "1 ball", cost: 18 },
        { item: "100% Pure Mozzarella", qty: "130g", cost: 42 },
        { item: "San Marzano Pizza Sauce", qty: "60g", cost: 9 },
        { item: "Bell Peppers, Onion, Sweetcorn", qty: "80g", cost: 14 },
        { item: "Olive Oil & Italian Herbs", qty: "10ml", cost: 5 },
        { item: "Box & Liner", qty: "1 set", cost: 10 },
      ],
    },
    {
      name: "Signature Thick Cold Coffee",
      category: "Cold Brew & Beverages",
      sellingPrice: 140,
      ingredients: [
        { item: "Arabica Double Espresso Shot", qty: "40ml", cost: 14 },
        { item: "Chilled Full Cream Milk", qty: "220ml", cost: 15 },
        { item: "Vanilla Gelato Scoop & Cocoa", qty: "40g", cost: 8 },
        { item: "Glass / Takeaway Cup & Paper Straw", qty: "1 set", cost: 6 },
      ],
    },
    {
      name: "Double Cheese Paneer Burger",
      category: "Burgers",
      sellingPrice: 180,
      ingredients: [
        { item: "Toasted Brioche Bun", qty: "1 pair", cost: 14 },
        { item: "Crispy Spiced Paneer Patty", qty: "90g", cost: 26 },
        { item: "Cheddar Cheese Slice", qty: "1 slice", cost: 14 },
        { item: "House Chipotle Mayo & Lettuce", qty: "30g", cost: 7 },
        { item: "Branded Wrapper & Toothpick Flag", qty: "1 set", cost: 4 },
      ],
    },
    {
      name: "Himalayan Steamed Momos (8 Pcs)",
      category: "Momos & Sides",
      sellingPrice: 130,
      ingredients: [
        { item: "Dumpling Wrappers & Cabbage Stuffing", qty: "8 pcs", cost: 16 },
        { item: "Spicy Roasted Tomato Chili Dip", qty: "50ml", cost: 6 },
        { item: "Garlic Mayo Dip", qty: "30ml", cost: 5 },
        { item: "Serving Boat / Plate Liner", qty: "1 set", cost: 3 },
      ],
    },
  ]);

  // ================= DINE-IN COUPONS & OFFERS =================
  const [cafeCoupons, setCafeCoupons] = useState([
    {
      code: "CAFEDINE10",
      type: "PERCENT" as const,
      value: 10,
      minSpend: 499,
      maxDiscount: 100,
      title: "10% Table Discount",
      desc: "Valid on all dine-in food orders above ₹499",
      redemptions: 48,
      active: true,
      expiry: "31 Dec 2026",
    },
    {
      code: "HAPPYHOUR",
      type: "FLAT" as const,
      value: 80,
      minSpend: 399,
      maxDiscount: 80,
      title: "Afternoon Happy Hour (4 PM - 7 PM)",
      desc: "Flat ₹80 off on pizzas and milkshakes between 4 PM to 7 PM",
      redemptions: 92,
      active: true,
      expiry: "Daily 4-7 PM",
    },
    {
      code: "STUDENT50",
      type: "FLAT" as const,
      value: 50,
      minSpend: 249,
      maxDiscount: 50,
      title: "College Student Pass",
      desc: "Valid with student college ID at table billing",
      redemptions: 114,
      active: true,
      expiry: "Permanent",
    },
    {
      code: "WEEKENDPIZZA",
      type: "FLAT" as const,
      value: 120,
      minSpend: 699,
      maxDiscount: 120,
      title: "Weekend Pizza Party",
      desc: "Flat ₹120 off on 2 or more Medium/Large pizzas on Friday-Sunday",
      redemptions: 63,
      active: true,
      expiry: "Fridays to Sundays",
    },
  ]);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponTitle, setNewCouponTitle] = useState("");
  const [newCouponVal, setNewCouponVal] = useState("10");
  const [newCouponType, setNewCouponType] = useState<"PERCENT" | "FLAT">("PERCENT");
  const [newCouponMin, setNewCouponMin] = useState("499");

  // ================= STOREFRONT CMS =================
  const [cmsHeroText, setCmsHeroText] = useState("Handcrafted Pizzas & Cold Coffee in Jabalpur");
  const [cmsNotice, setCmsNotice] = useState("🎉 Weekend Special: Flat 20% OFF on Large Pizzas every Friday to Sunday!");
  const [cmsActive, setCmsActive] = useState(true);
  const [cmsSavedAlert, setCmsSavedAlert] = useState(false);

  // ================= MANUAL QUICK ORDER BUILDER STATE =================
  const [manualCustName, setManualCustName] = useState("");
  const [manualCustPhone, setManualCustPhone] = useState("");
  const [manualOrderType, setManualOrderType] = useState<"DINE_IN" | "PICKUP">("DINE_IN");
  const [manualTableNo, setManualTableNo] = useState(1);
  const [manualPaymentMethod, setManualPaymentMethod] = useState<"CASH" | "UPI" | "CARD">("UPI");
  const [manualSearchQuery, setManualSearchQuery] = useState("");
  const [manualCategory, setManualCategory] = useState("ALL");
  const [posMenuSearch, setPosMenuSearch] = useState("");
  const [posSelectedCategory, setPosSelectedCategory] = useState("ALL");

  const posMenuCategories = useMemo(() => {
    const cats = Array.from(new Set(allMenuItems.map((i) => i.category)));
    return ["ALL", ...cats];
  }, []);

  const posFilteredMenuItems = useMemo(() => {
    return allMenuItems.filter((item) => {
      const matchCat = posSelectedCategory === "ALL" || item.category === posSelectedCategory;
      const matchSearch =
        !posMenuSearch ||
        item.name.toLowerCase().includes(posMenuSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(posMenuSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [posSelectedCategory, posMenuSearch]);
  const [manualItems, setManualItems] = useState<
    Array<{ id: string; itemId: string; name: string; category: string; price: number; qty: number }>
  >([
    { id: "pizza-1", itemId: "farmhouse-feast-pizza", name: "Farmhouse Feast Pizza (Medium)", category: "Pizza", price: 329, qty: 2 },
    { id: "burgers-1", itemId: "double-cheese-burger", name: "Double Cheese Paneer Burger", category: "Burgers", price: 179, qty: 1 },
  ]);
  const [activeBillModalOrder, setActiveBillModalOrder] = useState<CafeOrder | null>(null);

  // Real-time calculations for Manual Order Box
  const manualSubtotal = useMemo(() => {
    return manualItems.reduce((acc, it) => acc + it.price * it.qty, 0);
  }, [manualItems]);

  const manualCgst = useMemo(() => Math.round(manualSubtotal * 0.025 * 100) / 100, [manualSubtotal]);
  const manualSgst = useMemo(() => Math.round(manualSubtotal * 0.025 * 100) / 100, [manualSubtotal]);
  const manualTax = useMemo(() => Math.round((manualCgst + manualSgst) * 100) / 100, [manualCgst, manualSgst]);
  const manualGrandTotal = useMemo(() => Math.round(manualSubtotal + manualTax), [manualSubtotal, manualTax]);
  const manualTotalCount = useMemo(() => manualItems.reduce((acc, it) => acc + it.qty, 0), [manualItems]);

  const handleAddManualItem = (item: MenuItem) => {
    setManualItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          id: item.id,
          itemId: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          qty: 1,
        },
      ];
    });
  };

  const handleUpdateManualQty = (id: string, delta: number) => {
    setManualItems((prev) =>
      prev
        .map((it) => {
          if (it.id === id) {
            const newQty = it.qty + delta;
            return newQty > 0 ? { ...it, qty: newQty } : null;
          }
          return it;
        })
        .filter(Boolean) as typeof manualItems
    );
  };

  const handleRemoveManualItem = (id: string) => {
    setManualItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleClearManualOrder = () => {
    setManualItems([]);
    setManualCustName("");
    setManualCustPhone("");
  };

  const handleGenerateManualBill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (manualItems.length === 0) {
      alert("Please add at least 1 item to the order box.");
      return;
    }

    const guestName = manualCustName.trim() || "Walk-in Guest";
    const guestPhone = manualCustPhone.trim() || "9876543210";
    const tableLabel = manualOrderType === "DINE_IN" ? `Table ${manualTableNo}` : "Counter Takeaway";

    const newOrder = placeOrder({
      customer: {
        name: guestName,
        phone: guestPhone,
        tableNo: tableLabel,
      },
      orderType: manualOrderType,
      paymentMethod: manualPaymentMethod,
      items: manualItems.map((it) => ({
        itemId: it.itemId,
        name: it.name,
        foodType: "veg",
        size: "Regular",
        unitPrice: toPaise(it.price),
        qty: it.qty,
      })),
    });

    if (manualOrderType === "DINE_IN") {
      setTables((prev) =>
        prev.map((t) =>
          t.number === manualTableNo
            ? {
                ...t,
                status: "OCCUPIED",
                guestName,
                orderTotal: manualGrandTotal,
                itemsCount: manualTotalCount,
                seatedMinutes: 1,
              }
            : t
        )
      );
    }

    setKdsTickets((prev) => [
      {
        kotNo: newOrder.orderNo,
        tableNo: manualOrderType === "DINE_IN" ? manualTableNo : 0,
        type: manualOrderType === "DINE_IN" ? "DINE-IN" : "TAKEAWAY",
        time: "Just now",
        status: "NEW",
        items: manualItems.map((it) => ({
          name: it.name,
          qty: it.qty,
          note: "Direct Counter Order",
        })),
      },
      ...prev,
    ]);

    setOrders(getOrders());
    setActiveBillModalOrder(newOrder);
    setManualItems([]);
    setManualCustName("");
    setManualCustPhone("");
  };

  // ================= TICKET BOXES HANDLERS (MULTI-PERSON PER TABLE) =================
  const handleAddItemToTicket = (ticketId: string, menuItem: MenuItem) => {
    setActiveTickets((prev) =>
      prev.map((tkt) => {
        if (tkt.ticketId !== ticketId) return tkt;

        const existingIdx = tkt.items.findIndex((it) => it.itemId === menuItem.id);
        let updatedItems: TableOrderItem[];
        if (existingIdx > -1) {
          updatedItems = tkt.items.map((it, idx) =>
            idx === existingIdx ? { ...it, qty: it.qty + 1 } : it
          );
        } else {
          updatedItems = [
            ...tkt.items,
            {
              id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              itemId: menuItem.id,
              name: menuItem.name,
              category: menuItem.category,
              price: menuItem.price,
              qty: 1,
            },
          ];
        }

        return {
          ...tkt,
          guestName: ticketGuestNameInput.trim() || tkt.guestName,
          phone: ticketPhoneInput.trim() || tkt.phone,
          tag: ticketTagInput.trim() || tkt.tag,
          items: updatedItems,
          seatedMinutes: tkt.seatedMinutes || 1,
        };
      })
    );
  };

  const handleUpdateTicketItemQty = (ticketId: string, itemId: string, delta: number) => {
    setActiveTickets((prev) =>
      prev.map((tkt) => {
        if (tkt.ticketId !== ticketId) return tkt;

        const updatedItems = tkt.items
          .map((it) => (it.id === itemId ? { ...it, qty: it.qty + delta } : it))
          .filter((it) => it.qty > 0);

        return {
          ...tkt,
          items: updatedItems,
        };
      })
    );
  };

  const handleCreateNewTicket = () => {
    const nextNo = activeTickets.length + 1;
    const newTkt: ActiveOrderTicket = {
      ticketId: `tkt-${Date.now()}`,
      ticketNo: nextNo,
      guestName: `Guest #${nextNo}`,
      phone: "",
      tag: `Order Ticket #${nextNo < 10 ? `0${nextNo}` : nextNo}`,
      items: [],
      status: "ACTIVE",
      seatedMinutes: 0,
    };
    setActiveTickets((prev) => [...prev, newTkt]);
    setActiveTicketIdForAdding(newTkt.ticketId);
  };

  const handlePrintAndSettleTicketBill = (ticketId: string) => {
    const tkt = activeTickets.find((t) => t.ticketId === ticketId);
    if (!tkt || tkt.items.length === 0) return;

    const guestName = tkt.guestName || `Guest #${tkt.ticketNo}`;
    const guestPhone = tkt.phone || "9876543210";
    const tag = tkt.tag || `Ticket #${tkt.ticketNo}`;

    // 1. Create order in order-store
    const newOrder = placeOrder({
      customer: {
        name: guestName,
        phone: guestPhone,
        tableNo: tag,
      },
      orderType: tag.toLowerCase().includes("takeaway") ? "PICKUP" : "DINE_IN",
      paymentMethod: "UPI",
      items: tkt.items.map((it) => ({
        itemId: it.itemId,
        name: it.name,
        foodType: "veg",
        size: "Regular",
        unitPrice: toPaise(it.price),
        qty: it.qty,
      })),
    });

    // 2. Mark order completed
    updateOrderStatus(newOrder.id, "COMPLETED");

    // 3. Open thermal bill modal for instant print
    setActiveBillModalOrder(newOrder);

    // 4. Reset ticket items or clear box
    setActiveTickets((prev) =>
      prev.map((t) =>
        t.ticketId === ticketId
          ? {
              ...t,
              items: [],
              status: "ACTIVE",
              guestName: `Open Ticket #${t.ticketNo}`,
              phone: "",
              seatedMinutes: 0,
            }
          : t
      )
    );

    // 5. Update orders list
    setOrders(getOrders());
  };

  // ================= PER-TABLE ITEM ADD & BILL SETTLEMENT HANDLERS =================
  const handleAddItemToTable = (tableNo: number, menuItem: MenuItem) => {
    setTables((prev) =>
      prev.map((tbl) => {
        if (tbl.number !== tableNo) return tbl;

        const existingIndex = tbl.items.findIndex((it) => it.itemId === menuItem.id);
        let updatedItems: TableOrderItem[];
        if (existingIndex > -1) {
          updatedItems = tbl.items.map((it, idx) =>
            idx === existingIndex ? { ...it, qty: it.qty + 1 } : it
          );
        } else {
          updatedItems = [
            ...tbl.items,
            {
              id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              itemId: menuItem.id,
              name: menuItem.name,
              category: menuItem.category,
              price: menuItem.price,
              qty: 1,
            },
          ];
        }

        const subtotal = updatedItems.reduce((acc, it) => acc + it.price * it.qty, 0);
        const grandTotal = Math.round(subtotal * 1.05);

        return {
          ...tbl,
          status: tbl.status === "VACANT" || tbl.status === "RESERVED" ? "OCCUPIED" : tbl.status,
          guestName: tbl.guestName || (activeTableGuestName.trim() || `Guest (Table ${tableNo})`),
          phone: tbl.phone || (activeTableGuestPhone.trim() || "9876543210"),
          items: updatedItems,
          orderTotal: grandTotal,
          itemsCount: updatedItems.reduce((acc, it) => acc + it.qty, 0),
          seatedMinutes: tbl.seatedMinutes || 1,
        };
      })
    );
  };

  const handleUpdateTableItemQty = (tableNo: number, itemId: string, delta: number) => {
    setTables((prev) =>
      prev.map((tbl) => {
        if (tbl.number !== tableNo) return tbl;

        const updatedItems = tbl.items
          .map((it) => (it.id === itemId ? { ...it, qty: it.qty + delta } : it))
          .filter((it) => it.qty > 0);

        const subtotal = updatedItems.reduce((acc, it) => acc + it.price * it.qty, 0);
        const grandTotal = Math.round(subtotal * 1.05);

        return {
          ...tbl,
          items: updatedItems,
          orderTotal: grandTotal,
          itemsCount: updatedItems.reduce((acc, it) => acc + it.qty, 0),
          status: updatedItems.length === 0 ? "VACANT" : tbl.status,
          guestName: updatedItems.length === 0 ? undefined : tbl.guestName,
          phone: updatedItems.length === 0 ? undefined : tbl.phone,
        };
      })
    );
  };

  const handlePrintAndSettleTableBill = (tableNo: number) => {
    const table = tables.find((t) => t.number === tableNo);
    if (!table || table.items.length === 0) return;

    const guestName = table.guestName || `Guest (Table ${tableNo})`;
    const guestPhone = table.phone || "9876543210";

    // 1. Create order in order-store
    const newOrder = placeOrder({
      customer: {
        name: guestName,
        phone: guestPhone,
        tableNo: `Table ${tableNo}`,
      },
      orderType: "DINE_IN",
      paymentMethod: "UPI",
      items: table.items.map((it) => ({
        itemId: it.itemId,
        name: it.name,
        foodType: "veg",
        size: "Regular",
        unitPrice: toPaise(it.price),
        qty: it.qty,
      })),
    });

    // 2. Mark order completed
    updateOrderStatus(newOrder.id, "COMPLETED");

    // 3. Open thermal bill modal for instant print
    setActiveBillModalOrder(newOrder);

    // 4. Reset table to VACANT
    setTables((prev) =>
      prev.map((t) =>
        t.number === tableNo
          ? {
              ...t,
              status: "VACANT",
              guestName: undefined,
              phone: undefined,
              items: [],
              orderTotal: 0,
              itemsCount: 0,
              seatedMinutes: 0,
            }
          : t
      )
    );

    // 5. Update orders list
    setOrders(getOrders());
  };

  // ================= ORDER HISTORY STATE & HANDLERS =================
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("ALL");
  const [historyTypeFilter, setHistoryTypeFilter] = useState("ALL");

  const filteredHistoryOrders = useMemo(() => {
    return orders.filter((o) => {
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase();
        const matchNo = String(o.orderNo).includes(q) || o.publicId.toLowerCase().includes(q);
        const matchName = o.customer.name.toLowerCase().includes(q);
        const matchPhone = o.customer.phone.includes(q);
        const matchTable = (o.customer.tableNo || "").toLowerCase().includes(q);
        if (!matchNo && !matchName && !matchPhone && !matchTable) return false;
      }
      if (historyStatusFilter !== "ALL" && o.status !== historyStatusFilter) {
        return false;
      }
      if (historyTypeFilter !== "ALL" && o.type !== historyTypeFilter) {
        return false;
      }
      return true;
    });
  }, [orders, historySearch, historyStatusFilter, historyTypeFilter]);

  const handleAdvanceOrderStatus = (orderId: string, currentStatus: CafeOrder["status"]) => {
    const nextStatusMap: Record<CafeOrder["status"], CafeOrder["status"]> = {
      PENDING_PAYMENT: "CONFIRMED",
      PLACED: "PREPARING",
      CONFIRMED: "PREPARING",
      PREPARING: "READY",
      READY: "SERVED",
      SERVED: "COMPLETED",
      PICKED_UP: "COMPLETED",
      OUT_FOR_DELIVERY: "DELIVERED",
      DELIVERED: "COMPLETED",
      COMPLETED: "COMPLETED",
      CANCELLED: "CANCELLED",
    };
    const next = nextStatusMap[currentStatus] || "COMPLETED";
    updateOrderStatus(orderId, next);
    setOrders(getOrders());
  };

  useEffect(() => {
    setOrders(getOrders());
    return subscribeToStore(() => setOrders(getOrders()));
  }, []);

  // Compute offline cafe metrics
  const totalSales = useMemo(
    () => orders.reduce((acc, o) => acc + o.pricing.total, 0),
    [orders]
  );
  const totalTax = useMemo(
    () => orders.reduce((acc, o) => acc + o.pricing.tax.totalTax, 0),
    [orders]
  );
  const aov = orders.length > 0 ? Math.round(totalSales / orders.length) : 0;

  const occupiedTablesCount = tables.filter((t) => t.status === "OCCUPIED" || t.status === "BILL_REQUESTED").length;
  const vacantTablesCount = tables.filter((t) => t.status === "VACANT").length;
  const reservedTablesCount = tables.filter((t) => t.status === "RESERVED").length;

  // Table status transition handler
  const handleUpdateTableStatus = (tableNo: number, newStatus: TableInfo["status"]) => {
    setTables((prev) =>
      prev.map((t) => (t.number === tableNo ? { ...t, status: newStatus } : t))
    );
  };

  // Reservation actions
  const handleConfirmReservation = (id: string, tableNo?: number) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "CONFIRMED", assignedTable: tableNo || 7 } : r
      )
    );
    if (tableNo) {
      handleUpdateTableStatus(tableNo, "RESERVED");
    }
  };

  const handleSeatReservation = (id: string) => {
    const res = reservations.find((r) => r.id === id);
    if (res && res.assignedTable) {
      handleUpdateTableStatus(res.assignedTable, "OCCUPIED");
    }
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "SEATED" } : r))
    );
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName.trim() || !resPhone.trim()) return;
    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      guestName: resName.trim(),
      phone: resPhone.trim(),
      guests: Number(resGuests),
      date: "2026-11-20",
      time: resTime,
      occasion: resOccasion,
      status: "CONFIRMED",
      assignedTable: 9,
    };
    setReservations((prev) => [newRes, ...prev]);
    handleUpdateTableStatus(9, "RESERVED");
    setResName("");
    setResPhone("");
    setShowNewResModal(false);
  };

  // KDS ticket bump
  const handleAdvanceKds = (kotNo: number) => {
    setKdsTickets((prev) =>
      prev.map((k) => {
        if (k.kotNo !== kotNo) return k;
        if (k.status === "NEW") return { ...k, status: "PREPARING" };
        if (k.status === "PREPARING") return { ...k, status: "IN_OVEN" };
        if (k.status === "IN_OVEN") return { ...k, status: "READY" };
        return k;
      })
    );
  };

  const toggleItemAvailability = (id: string) => {
    setItemsAvailability((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSaveCms = (e: React.FormEvent) => {
    e.preventDefault();
    setCmsSavedAlert(true);
    setTimeout(() => setCmsSavedAlert(false), 3000);
  };

  // Combo handlers
  const handleToggleCombo = (id: string) => {
    setCombos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const handleCreateCombo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComboTitle.trim() || !newComboPrice.trim()) return;
    const itemsArr = newComboItems
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const newC = {
      id: `combo-${Date.now()}`,
      title: newComboTitle.trim(),
      price: Number(newComboPrice) || 299,
      originalPrice: Number(newComboOrig) || Number(newComboPrice) + 80,
      badge: "Cafe Special",
      items: itemsArr.length > 0 ? itemsArr : ["Chef Special Pizza", "Beverage"],
      active: true,
    };
    setCombos((prev) => [newC, ...prev]);
    setNewComboTitle("");
    setNewComboPrice("");
    setNewComboOrig("");
    setNewComboItems("");
    setShowAddComboModal(false);
  };

  // Inventory handlers
  const handleRestockItem = (id: string, additionalQty: number) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newQty = item.qty + additionalQty;
        return {
          ...item,
          qty: newQty,
          status: newQty > item.minThreshold ? ("OPTIMAL" as const) : ("LOW_STOCK" as const),
        };
      })
    );
    setShowRestockModal(false);
    setRestockItemId(null);
  };

  // Coupon handlers
  const handleToggleCoupon = (code: string) => {
    setCafeCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, active: !c.active } : c))
    );
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponTitle.trim()) return;
    const newC = {
      code: newCouponCode.trim().toUpperCase(),
      type: newCouponType,
      value: Number(newCouponVal) || 10,
      minSpend: Number(newCouponMin) || 399,
      maxDiscount: newCouponType === "PERCENT" ? 150 : Number(newCouponVal) || 50,
      title: newCouponTitle.trim(),
      desc: `Special offer valid on orders above ₹${newCouponMin}`,
      redemptions: 0,
      active: true,
      expiry: "Valid till end of month",
    };
    setCafeCoupons((prev) => [newC, ...prev]);
    setNewCouponCode("");
    setNewCouponTitle("");
    setShowAddCouponModal(false);
  };

  const selectedTableObj = tables.find((t) => t.number === selectedTableNo);

  return (
    <div className="h-screen w-screen bg-[#FAF9F5] text-stone-900 flex overflow-hidden font-sans antialiased selection:bg-[#C83B1E]/15 selection:text-[#C83B1E]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ================= 1. SUPER ADMIN SIDEBAR (Independent Scrolling) ================= */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-72 bg-[#12100E] text-stone-300 z-50 flex flex-col justify-between shrink-0 transition-transform duration-300 border-r border-white/[0.08] ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="shrink-0 p-4 border-b border-white/[0.08] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="7 Bites Cafe Logo"
              className="w-8 h-8 rounded-full object-contain bg-white border border-white/20 shadow-xs shrink-0"
            />
            <div>
              <div className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>7 Bites Cafe</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-white/[0.1] text-amber-300 border border-white/[0.06]">
                  OFFLINE OS
                </span>
              </div>
              <div className="text-[11px] text-stone-400">
                Super Admin Console
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

        {/* Live Outlet & Floor Indicator */}
        <div className="shrink-0 px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-stone-300">Jabalpur Main Floor</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-400 font-medium">
            {occupiedTablesCount}/12 Occupied
          </span>
        </div>

        {/* 4 OFFLINE CAFE NAVIGATION GROUPS (Independent Scrollbar) */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-xs scrollbar-thin scrollbar-thumb-white/10">
          {/* ================= GROUP 1: MAIN CONTROL ================= */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wider flex items-center justify-between">
              <span>Main Operations</span>
              <span className="text-[9px] text-stone-600 font-normal">Floor & POS</span>
            </div>
            <div className="space-y-0.5">
              {/* Dashboard Home */}
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "dashboard"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className={`w-4 h-4 ${activeTab === "dashboard" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Dashboard Overview</span>
                </div>
              </button>

              {/* NEW SECTION 1: Manual Order Desk */}
              <button
                onClick={() => {
                  setActiveTab("manual-order");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "manual-order"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className={`w-4 h-4 ${activeTab === "manual-order" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Manual Order Desk</span>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Fast POS
                </span>
              </button>

              {/* NEW SECTION 2: Order History & Bills */}
              <button
                onClick={() => {
                  setActiveTab("order-history");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "order-history"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <History className={`w-4 h-4 ${activeTab === "order-history" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Order History & Bills</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.08] text-stone-300">
                  {orders.length}
                </span>
              </button>

              {/* Table Floor Map */}
              <button
                onClick={() => {
                  setActiveTab("table-floor");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "table-floor"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Table className={`w-4 h-4 ${activeTab === "table-floor" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Table Floor Map</span>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.08] text-stone-300">
                  12 Tables
                </span>
              </button>

              {/* Live Kitchen KDS */}
              <button
                onClick={() => {
                  setActiveTab("live-kds");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "live-kds"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Flame className={`w-4 h-4 ${activeTab === "live-kds" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Live Kitchen KDS</span>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/20">
                  {kdsTickets.length} KOTs
                </span>
              </button>

              {/* Touch POS & Billing */}
              <button
                onClick={() => {
                  setActiveTab("pos-billing");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "pos-billing"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className={`w-4 h-4 ${activeTab === "pos-billing" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Dine-In Touch POS</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-stone-400">POS</span>
              </button>

              {/* Menu Catalog */}
              <button
                onClick={() => {
                  setActiveTab("menu-catalog");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "menu-catalog"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Coffee className={`w-4 h-4 ${activeTab === "menu-catalog" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Menu Catalog & 86</span>
                </div>
                <span className="text-[10px] font-medium text-stone-500">{allMenuItems.length}</span>
              </button>

              {/* Digital Menu QR */}
              <button
                onClick={() => {
                  setActiveTab("digital-qr");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "digital-qr"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <QrCode className={`w-4 h-4 ${activeTab === "digital-qr" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Table QR Codes</span>
                </div>
              </button>

              {/* Storefront CMS */}
              <button
                onClick={() => {
                  setActiveTab("storefront-cms");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "storefront-cms"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className={`w-4 h-4 ${activeTab === "storefront-cms" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Storefront CMS</span>
                </div>
              </button>
            </div>
          </div>

          {/* ================= GROUP 2: RESERVATIONS & KITCHEN ================= */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wider flex items-center justify-between">
              <span>Kitchen & Stock</span>
              <span className="text-[9px] text-stone-600 font-normal">Back of House</span>
            </div>
            <div className="space-y-0.5">
              {/* Table Reservations Manager */}
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
                  <span>Table Reservations</span>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300">
                  {reservations.filter((r) => r.status === "PENDING").length} New
                </span>
              </button>

              {/* Combos & Value Specials */}
              <button
                onClick={() => {
                  setActiveTab("combos-specials");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "combos-specials"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className={`w-4 h-4 ${activeTab === "combos-specials" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Combos & Specials</span>
                </div>
                <span className="text-[10px] font-medium text-stone-500">{combos.length}</span>
              </button>

              {/* Kitchen Inventory & Stock */}
              <button
                onClick={() => {
                  setActiveTab("inventory-stock");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "inventory-stock"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className={`w-4 h-4 ${activeTab === "inventory-stock" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Inventory & Stock</span>
                </div>
                {inventoryItems.filter((i) => i.status === "LOW_STOCK").length > 0 && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    Low: {inventoryItems.filter((i) => i.status === "LOW_STOCK").length}
                  </span>
                )}
              </button>

              {/* Recipes & Food Cost */}
              <button
                onClick={() => {
                  setActiveTab("recipes-cost");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "recipes-cost"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className={`w-4 h-4 ${activeTab === "recipes-cost" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Recipe BOM & Margin</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">28% Target</span>
              </button>
            </div>
          </div>

          {/* ================= GROUP 3: CUSTOMERS & FINANCE ================= */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wider flex items-center justify-between">
              <span>Finance & Guest CRM</span>
              <span className="text-[9px] text-stone-600 font-normal">Ledger</span>
            </div>
            <div className="space-y-0.5">
              {/* Customer CRM */}
              <button
                onClick={() => {
                  setActiveTab("customer-crm");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "customer-crm"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className={`w-4 h-4 ${activeTab === "customer-crm" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Customer Regulars</span>
                </div>
              </button>

              {/* Daily Cash Register */}
              <button
                onClick={() => {
                  setActiveTab("cash-register");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "cash-register"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Coins className={`w-4 h-4 ${activeTab === "cash-register" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Daily Cash Register</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium">Open</span>
              </button>

              {/* GST & Tax Management */}
              <button
                onClick={() => {
                  setActiveTab("tax-gst");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "tax-gst"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Percent className={`w-4 h-4 ${activeTab === "tax-gst" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>GST & Tax Compliance</span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">5%</span>
              </button>

              {/* Billing & Invoices Ledger */}
              <button
                onClick={() => {
                  setActiveTab("billing-ledger");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "billing-ledger"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className={`w-4 h-4 ${activeTab === "billing-ledger" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Dine-In Billing Ledger</span>
                </div>
              </button>

              {/* Coupons & Happy Hours */}
              <button
                onClick={() => {
                  setActiveTab("coupons-offers");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "coupons-offers"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Tag className={`w-4 h-4 ${activeTab === "coupons-offers" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Coupons & Happy Hours</span>
                </div>
              </button>

              {/* Reviews & Ratings */}
              <button
                onClick={() => {
                  setActiveTab("reviews-ratings");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "reviews-ratings"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className={`w-4 h-4 ${activeTab === "reviews-ratings" ? "text-amber-400 fill-amber-400" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Guest Reviews</span>
                </div>
                <span className="text-[10px] font-semibold text-amber-300">4.9 ★</span>
              </button>
            </div>
          </div>

          {/* ================= GROUP 4: REPORTS & CONFIGURATION ================= */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wider flex items-center justify-between">
              <span>Settings & Reports</span>
              <span className="text-[9px] text-stone-600 font-normal">System</span>
            </div>
            <div className="space-y-0.5">
              {/* Analytics & Reports */}
              <button
                onClick={() => {
                  setActiveTab("analytics-reports");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "analytics-reports"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className={`w-4 h-4 ${activeTab === "analytics-reports" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Table Turnover Analytics</span>
                </div>
              </button>

              {/* Staff PINs & Shifts */}
              <button
                onClick={() => {
                  setActiveTab("staff-pins");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "staff-pins"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className={`w-4 h-4 ${activeTab === "staff-pins" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Staff PINs & Shifts</span>
                </div>
              </button>

              {/* Hardware & Printer Settings */}
              <button
                onClick={() => {
                  setActiveTab("hardware-settings");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors group ${
                  activeTab === "hardware-settings"
                    ? "bg-white/[0.1] text-white font-semibold border-l-2 border-[#C83B1E] shadow-xs"
                    : "text-stone-400 font-medium hover:text-stone-100 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Printer className={`w-4 h-4 ${activeTab === "hardware-settings" ? "text-[#E05A3E]" : "text-stone-400 group-hover:text-stone-200"}`} />
                  <span>Thermal Printer & KDS Sound</span>
                </div>
              </button>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="shrink-0 p-3.5 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">
              R
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-xs text-white">Rahul Sharma</div>
              <div className="text-[10px] text-stone-400">Owner & Super Admin</div>
            </div>
          </div>
          <Link
            to="/"
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.08] transition"
            title="Exit to Cafe Website"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* ================= 2. MAIN CONTENT AREA (Independent Scrolling) ================= */}
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
                {activeTab === "manual-order"
                  ? "Manual Counter Order & Fast Bill Generator"
                  : activeTab === "order-history"
                  ? "Orders History & Fiscal Billing Records"
                  : activeTab === "table-floor"
                  ? "Cafe Table Floor Plan (12 Tables)"
                  : activeTab === "live-kds"
                  ? "Kitchen Display System (KDS)"
                  : activeTab === "reservations"
                  ? "Table Reservations Manager"
                  : activeTab === "dashboard"
                  ? "Operations Scoreboard"
                  : activeTab.replace("-", " ")}
              </h2>
              <p className="text-[11px] text-stone-500">
                {activeTab === "dashboard"
                  ? "Live table occupancy, active kitchen KOTs & today's offline sales"
                  : `7 Bites Offline Cafe — ${activeTab.replace("-", " ")}`}
              </p>
            </div>
          </div>

          {/* Quick Actions & Rush Mode */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200/60 text-xs font-medium">
              {(["today", "yesterday", "7d", "30d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-2.5 py-1 rounded-lg transition uppercase text-[10px] font-mono ${
                    dateRange === r
                      ? "bg-white text-stone-900 shadow-xs font-semibold"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Kitchen Rush Mode Toggle */}
            <button
              onClick={() => setBusyMode(!busyMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border ${
                busyMode
                  ? "bg-rose-50 border-rose-300 text-rose-700"
                  : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${busyMode ? "text-rose-600 fill-rose-600" : "text-stone-400"}`} />
              <span>{busyMode ? "Rush Mode ON" : "Normal Mode"}</span>
            </button>

            {/* New Reservation Quick Button */}
            <Button
              onClick={() => {
                setActiveTab("reservations");
                setShowNewResModal(true);
              }}
              className="bg-[#C83B1E] hover:bg-[#B33419] text-white text-xs font-medium px-3.5 py-1.5 h-auto rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>+ Book Table</span>
            </Button>
          </div>
        </header>

        {/* Dynamic Main Workspace Views */}
        <main className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl">
          {/* ================= 1.1 DASHBOARD HOME ================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Top Live Operations Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900 tracking-tight">
                        Cafe Live Operations Center
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                        Offline POS Active
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">
                      Gohalpur Amkhera, Jagriti Nagar, Jabalpur (M.P.) • Live Dine-in, Kitchen KDS, and Event Bookings
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-mono font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    <span>Peak Evening Rush • 8:00 PM – 10:15 PM</span>
                  </div>
                  <Button
                    onClick={() => setActiveTab("analytics-reports")}
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold rounded-xl text-stone-700 border-stone-200 hover:bg-stone-50 flex items-center gap-1.5"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-[#C83B1E]" /> Full Analytics →
                  </Button>
                </div>
              </div>

              {/* 4 Elevated Scoreboard Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sales Card */}
                <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:border-stone-300 transition-all group">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
                    <span className="font-semibold uppercase text-[10px] tracking-wider text-stone-400">Today's Sales</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Coins className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-bold text-2xl tracking-tight text-stone-900 mt-2 font-mono">
                    {formatRupees(totalSales)}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-1.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>+18.4% vs yesterday</span>
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">Dine-in &amp; Event revenue</div>
                </div>

                {/* Table Occupancy Card */}
                <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:border-stone-300 transition-all group">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
                    <span className="font-semibold uppercase text-[10px] tracking-wider text-stone-400">Table Occupancy</span>
                    <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#C83B1E] flex items-center justify-center font-bold">
                      <Table className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-bold text-2xl tracking-tight text-stone-900 mt-2">
                    {eventBookings.length} / 12 Tables
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-[#C83B1E] h-full rounded-full"
                      style={{ width: `${(eventBookings.length / 12) * 100}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1.5">
                    {12 - eventBookings.length} Open for Events • {eventBookings.length} Booked
                  </div>
                </div>

                {/* Active Kitchen KOTs Card */}
                <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:border-stone-300 transition-all group">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
                    <span className="font-semibold uppercase text-[10px] tracking-wider text-stone-400">Active Kitchen KOTs</span>
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                      <Flame className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-bold text-2xl tracking-tight text-rose-600 mt-2 font-mono">
                    {kdsTickets.length} Orders
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-600 mt-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-semibold">1 In Oven</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">2 Prep</span>
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">Avg turnaround: 12.5 mins</div>
                </div>

                {/* Event Bookings Card */}
                <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:border-stone-300 transition-all group">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
                    <span className="font-semibold uppercase text-[10px] tracking-wider text-stone-400">Event Parties Today</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-bold text-2xl tracking-tight text-stone-900 mt-2 font-mono">
                    {eventBookings.length} Celebrations
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-700 mt-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>Birthday &amp; Anniversary specials</span>
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">Next: Dr. Verma Party (8:00 PM)</div>
                </div>
              </div>

              {/* Quick Operational Shortcuts Bar */}
              <div className="p-3 rounded-2xl bg-stone-900 text-white flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-stone-400 px-2">
                    Quick Actions:
                  </span>
                  <Button
                    onClick={() => setActiveTab("manual-order")}
                    size="sm"
                    className="bg-[#C83B1E] hover:bg-[#a83017] text-white text-xs font-semibold px-3 py-1.5 h-8 rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Fast POS / Take Order
                  </Button>
                  <Button
                    onClick={() => setActiveTab("table-floor")}
                    size="sm"
                    variant="outline"
                    className="bg-stone-800 hover:bg-stone-700 border-stone-700 text-white text-xs font-semibold px-3 py-1.5 h-8 rounded-xl flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Book Event Table
                  </Button>
                  <Button
                    onClick={() => setActiveTab("live-kds")}
                    size="sm"
                    variant="outline"
                    className="bg-stone-800 hover:bg-stone-700 border-stone-700 text-white text-xs font-semibold px-3 py-1.5 h-8 rounded-xl flex items-center gap-1.5"
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-400" /> Live Kitchen KDS
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setActiveTab("analytics-reports")}
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 h-8 rounded-xl flex items-center gap-1.5"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-orange-400" /> Live Sales Graph
                  </Button>
                  <Button
                    onClick={() => setActiveTab("order-history")}
                    size="sm"
                    variant="outline"
                    className="bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-300 text-xs font-semibold px-3 py-1.5 h-8 rounded-xl flex items-center gap-1.5"
                  >
                    <History className="w-3.5 h-3.5" /> Order History ({orders.length})
                  </Button>
                </div>
              </div>

              {/* 2-Column Overview Layout: Left (8 cols) Graph & Event Tables, Right (4 cols) Kitchen Pulse & Top Sellers */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT: Mini Live Sales Curve + Full Table Event Bookings (8 Columns) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Today's Live Hourly Sales Curve Mini-Chart */}
                  <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 tracking-tight flex items-center gap-2">
                          Today&apos;s Live Hourly Sales Trajectory
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Real-Time
                          </span>
                        </h4>
                        <p className="text-xs text-stone-500">
                          Hourly revenue velocity showing daytime pace and evening rush peak
                        </p>
                      </div>
                      <Button
                        onClick={() => setActiveTab("analytics-reports")}
                        variant="ghost"
                        size="sm"
                        className="text-xs font-semibold text-[#C83B1E] hover:bg-orange-50 h-7 px-2.5 rounded-lg flex items-center gap-1"
                      >
                        Deep Analysis →
                      </Button>
                    </div>

                    <div className="h-[180px] w-full pt-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={hourlySalesToday} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="dashSalesGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#C83B1E" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#C83B1E" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EB" vertical={false} />
                          <XAxis dataKey="time" stroke="#A8A29E" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#A8A29E" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-stone-900 text-white text-xs rounded-xl p-2.5 shadow-xl border border-stone-800 space-y-0.5">
                                    <div className="text-[10px] text-stone-400">{data.time} Service</div>
                                    <div className="font-bold text-[#FF8566] font-mono">₹{data.sales.toLocaleString()}</div>
                                    <div className="text-[10px] text-stone-300">{data.orders} orders placed</div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="sales"
                            stroke="#C83B1E"
                            strokeWidth={2.5}
                            fill="url(#dashSalesGrad)"
                            dot={{ r: 2.5, fill: "#C83B1E", strokeWidth: 1.5, stroke: "#fff" }}
                            activeDot={{ r: 5, fill: "#C83B1E", strokeWidth: 2, stroke: "#fff" }}
                            isAnimationActive={true}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Full Table Event Bookings Section */}
                  <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm tracking-tight text-stone-900 flex items-center gap-2">
                          Full Table Event Bookings
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            {eventBookings.length} Tables Reserved
                          </span>
                        </h4>
                        <p className="text-xs text-stone-500">
                          Tables reserved exclusively for birthdays, anniversaries &amp; private celebrations
                        </p>
                      </div>
                      <Button
                        onClick={() => setActiveTab("table-floor")}
                        variant="ghost"
                        size="sm"
                        className="text-xs font-semibold text-[#C83B1E] hover:bg-orange-50 h-7 px-2.5 rounded-lg flex items-center gap-1"
                      >
                        Open Event Floor Map →
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {eventBookings.map((evt) => (
                        <button
                          key={evt.id}
                          onClick={() => {
                            setSelectedEventTableNo(evt.tableNumber);
                            setActiveTab("table-floor");
                          }}
                          className="p-3.5 rounded-xl border text-left transition relative bg-stone-50/60 border-stone-200/80 hover:border-[#C83B1E] hover:bg-white hover:shadow-xs group space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-stone-900 text-white">
                              Table {evt.tableNumber < 10 ? `0${evt.tableNumber}` : evt.tableNumber}
                            </span>
                            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
                              {evt.eventType === "BIRTHDAY"
                                ? "🎂 Birthday"
                                : evt.eventType === "ANNIVERSARY"
                                ? "💍 Anniversary"
                                : evt.eventType === "REUNION"
                                ? "🎓 Reunion"
                                : evt.eventType === "CORPORATE"
                                ? "💼 Corporate"
                                : "🕯️ Date"}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-stone-900 truncate">{evt.eventTitle}</p>
                            <p className="text-[11px] text-stone-500 truncate">{evt.hostName} • {evt.guestCount} Guests</p>
                          </div>
                          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-stone-200/60">
                            <span className="text-stone-400 font-mono">{evt.timeSlot.split("–")[0]}</span>
                            <span className="font-semibold text-emerald-700 font-mono">Adv: ₹{evt.advancePaid}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Kitchen Health Meter & Top Selling Champions (4 Columns) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Service Speed & Operational Gauge */}
                  <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-stone-900 tracking-tight">
                        Service Health &amp; Kitchen Speed
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Excellent
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                        <div className="flex justify-between text-stone-500 text-[11px]">
                          <span>Kitchen Prep Speed</span>
                          <strong className="text-stone-900 font-bold">12.5 Mins</strong>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full w-[85%]" />
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                        <div className="flex justify-between text-stone-500 text-[11px]">
                          <span>Table Turnover Rate</span>
                          <strong className="text-stone-900 font-bold">41.5 Mins / table</strong>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full w-[78%]" />
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                        <div className="flex justify-between text-stone-500 text-[11px]">
                          <span>UPI / QR Digital Payments</span>
                          <strong className="text-stone-900 font-bold">76% of Sales</strong>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#C83B1E] h-full rounded-full w-[76%]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Selling Dishes Today */}
                  <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 tracking-tight">
                          Top Moving Items Today
                        </h4>
                        <p className="text-[11px] text-stone-500">Fastest selling dishes from oven &amp; bar</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-orange-100 text-[#C83B1E]">
                        Live
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {topSellingMenuChampions.slice(0, 4).map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-0">
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="w-5 h-5 rounded bg-stone-100 text-stone-800 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                              {item.rank}
                            </span>
                            <div className="truncate">
                              <p className="font-semibold text-stone-900 truncate">{item.name}</p>
                              <span className="text-[10px] text-stone-400 font-mono">{item.sold} orders • {item.margin}% margin</span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-stone-800 shrink-0">
                            ₹{item.revenue.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 1.2 TICKET POS & 3×3 ACTIVE ORDER BOXES ================= */}
          {activeTab === "manual-order" && (() => {
            const selectedTicket =
              activeTickets.find((t) => t.ticketId === activeTicketIdForAdding) ||
              activeTickets[0];
            const activeBoxesCount = activeTickets.filter((t) => t.items.length > 0).length;
            const runningRevenue = activeTickets.reduce((sum, tkt) => {
              const sub = tkt.items.reduce((s, it) => s + it.price * it.qty, 0);
              return sum + sub;
            }, 0);

            return (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-base tracking-tight text-stone-900">
                      Active Order Boxes & Live Tickets (3×3 Running Grid)
                    </h3>
                    <p className="text-xs text-stone-500">
                      Har customer / group ka apna alag running box hai (ek hi table me 2-3 alag log bhi alag-alag order aur bill rakh sakte hain). Har box me &quot;+ Add Item&quot; se items jodte raho, calculation real-time dikhti rahegi. Jab customer bill mange tabhi &quot;🧾 Print / Settle Bill&quot; par click karke final GST bill generate karo.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      ● {activeBoxesCount} Active Orders
                    </span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200/60">
                      Running: ₹{runningRevenue}
                    </span>
                    <Button
                      onClick={handleCreateNewTicket}
                      size="sm"
                      className="bg-[#C83B1E] hover:bg-[#a83017] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Open New Box
                    </Button>
                    <Button
                      onClick={() => setActiveTab("order-history")}
                      variant="outline"
                      size="sm"
                      className="text-xs font-medium text-stone-600 rounded-xl flex items-center gap-1.5"
                    >
                      <History className="w-3.5 h-3.5" /> Order History ({orders.length})
                    </Button>
                  </div>
                </div>

                {/* 2-Column Layout: Left 3x3 Order Boxes Grid (8 cols), Right Menu Add Drawer (4 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* LEFT: 3×3 Grid of Active Order Boxes (8 Columns) */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {activeTickets.map((tkt) => {
                        const isSelected = activeTicketIdForAdding === tkt.ticketId;
                        const tktSubtotal = tkt.items.reduce((acc, it) => acc + it.price * it.qty, 0);
                        const tktTax = Math.round(tktSubtotal * 0.05 * 100) / 100;
                        const tktGrandTotal = Math.round(tktSubtotal + tktTax);
                        const hasItems = tkt.items.length > 0;

                        return (
                          <div
                            key={tkt.ticketId}
                            className={`rounded-xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
                              isSelected
                                ? "bg-white ring-2 ring-[#C83B1E] border-transparent shadow-md"
                                : "bg-white border-stone-200/80 hover:border-stone-300"
                            }`}
                          >
                            <div>
                              {/* Box Header Row */}
                              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-stone-900 text-white">
                                    Box #{tkt.ticketNo < 10 ? `0${tkt.ticketNo}` : tkt.ticketNo}
                                  </span>
                                  <span className="text-[11px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md truncate max-w-[110px]" title={tkt.tag}>
                                    {tkt.tag}
                                  </span>
                                </div>

                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    tkt.status === "BILL_REQUESTED"
                                      ? "bg-rose-100 text-rose-800 animate-pulse"
                                      : hasItems
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-stone-100 text-stone-500"
                                  }`}
                                >
                                  {tkt.status === "BILL_REQUESTED"
                                    ? "● Bill Req"
                                    : hasItems
                                    ? `● Active (${tkt.seatedMinutes || 1}m)`
                                    : "○ Empty"}
                                </span>
                              </div>

                              {/* Customer Details */}
                              <div className="py-2 border-b border-stone-100 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-stone-900 truncate">
                                    {tkt.guestName || `Guest #${tkt.ticketNo}`}
                                  </span>
                                  <span className="text-[11px] text-stone-400 font-mono">
                                    {tkt.phone || "—"}
                                  </span>
                                </div>
                              </div>

                              {/* Live Items in this Box */}
                              <div className="py-2.5 min-h-[110px] max-h-[160px] overflow-y-auto space-y-1.5 pr-1">
                                {!hasItems ? (
                                  <div className="h-[90px] flex flex-col items-center justify-center text-center text-stone-400">
                                    <UtensilsCrossed className="w-5 h-5 text-stone-300 mb-1" />
                                    <p className="text-[11px]">No items added yet</p>
                                    <p className="text-[10px] text-stone-400">Click &quot;+ Add Item&quot; to take order</p>
                                  </div>
                                ) : (
                                  tkt.items.map((it) => (
                                    <div
                                      key={it.id}
                                      className="flex items-center justify-between gap-1 text-xs py-1 px-1.5 rounded-lg bg-stone-50 hover:bg-stone-100/80 transition-colors"
                                    >
                                      <div className="flex-1 min-w-0 pr-1">
                                        <p className="font-medium text-stone-800 text-[11px] truncate leading-tight">
                                          {it.name}
                                        </p>
                                        <span className="text-[10px] text-stone-500 font-mono">
                                          ₹{it.price} × {it.qty} = ₹{it.price * it.qty}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateTicketItemQty(tkt.ticketId, it.id, -1);
                                          }}
                                          className="w-5 h-5 rounded flex items-center justify-center bg-stone-200/80 hover:bg-stone-300 text-stone-700 text-xs font-bold"
                                        >
                                          -
                                        </button>
                                        <span className="w-4 text-center font-mono font-semibold text-xs">
                                          {it.qty}
                                        </span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateTicketItemQty(tkt.ticketId, it.id, 1);
                                          }}
                                          className="w-5 h-5 rounded flex items-center justify-center bg-stone-200/80 hover:bg-stone-300 text-stone-700 text-xs font-bold"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Live Running Calculation & Actions */}
                            <div className="pt-2 border-t border-stone-100 space-y-2">
                              {/* Running Calculation */}
                              <div className="bg-stone-50/80 rounded-lg p-2 text-xs space-y-0.5">
                                <div className="flex justify-between text-stone-500 text-[11px]">
                                  <span>Subtotal</span>
                                  <span className="font-mono">₹{tktSubtotal}</span>
                                </div>
                                <div className="flex justify-between text-stone-500 text-[10px]">
                                  <span>GST (5%: 2.5% CGST + 2.5% SGST)</span>
                                  <span className="font-mono">₹{tktTax}</span>
                                </div>
                                <div className="flex justify-between text-stone-900 font-bold text-xs pt-1 border-t border-stone-200/60">
                                  <span>Running Bill</span>
                                  <span className="font-mono text-[#C83B1E]">₹{tktGrandTotal}</span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="grid grid-cols-2 gap-1.5 pt-1">
                                <Button
                                  onClick={() => setActiveTicketIdForAdding(tkt.ticketId)}
                                  size="sm"
                                  variant={isSelected ? "default" : "outline"}
                                  className={`text-[11px] font-semibold py-1 h-8 rounded-lg flex items-center justify-center gap-1 ${
                                    isSelected
                                      ? "bg-[#C83B1E] text-white hover:bg-[#a83017]"
                                      : "text-stone-700 border-stone-300 hover:bg-stone-100"
                                  }`}
                                >
                                  {isSelected ? "✓ Active Box" : "+ Add Item"}
                                </Button>

                                <Button
                                  onClick={() => handlePrintAndSettleTicketBill(tkt.ticketId)}
                                  size="sm"
                                  disabled={!hasItems}
                                  className="bg-stone-900 hover:bg-black text-white text-[11px] font-semibold py-1 h-8 rounded-lg flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                                  title={hasItems ? "Bill generate karo aur print nikalo" : "Add items pehle"}
                                >
                                  <Printer className="w-3 h-3" /> Settle Bill
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT: Selected Box Info & Menu Catalog Drawer (4 Columns) */}
                  <div className="lg:col-span-4 bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs space-y-4 sticky top-20">
                    {/* Selected Box Banner */}
                    <div className="p-3 rounded-lg bg-orange-50/70 border border-orange-200/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-orange-900 uppercase tracking-wider">
                          Target Order Box
                        </span>
                        <span className="text-xs font-mono font-bold bg-[#C83B1E] text-white px-2 py-0.5 rounded-md">
                          Box #{selectedTicket ? (selectedTicket.ticketNo < 10 ? `0${selectedTicket.ticketNo}` : selectedTicket.ticketNo) : "01"}
                        </span>
                      </div>

                      {selectedTicket && (
                        <div className="space-y-1.5 pt-1">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="text-[10px] font-semibold text-stone-500 uppercase block">Tag / Table</label>
                              <Input
                                value={selectedTicket.tag}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setActiveTickets((prev) =>
                                    prev.map((t) =>
                                      t.ticketId === selectedTicket.ticketId ? { ...t, tag: val } : t
                                    )
                                  );
                                }}
                                placeholder="e.g. Table 4 (Person 1)"
                                className="h-7 text-xs bg-white rounded-md mt-0.5"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-stone-500 uppercase block">Guest Name</label>
                              <Input
                                value={selectedTicket.guestName}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setActiveTickets((prev) =>
                                    prev.map((t) =>
                                      t.ticketId === selectedTicket.ticketId ? { ...t, guestName: val } : t
                                    )
                                  );
                                }}
                                placeholder="Customer Name"
                                className="h-7 text-xs bg-white rounded-md mt-0.5"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-stone-500 uppercase block">Phone (Optional for Bill)</label>
                            <Input
                              value={selectedTicket.phone || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setActiveTickets((prev) =>
                                  prev.map((t) =>
                                    t.ticketId === selectedTicket.ticketId ? { ...t, phone: val } : t
                                  )
                                );
                              }}
                              placeholder="98765 43210"
                              className="h-7 text-xs bg-white rounded-md mt-0.5"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Menu Search & Category Filters */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                        <Input
                          placeholder="Search items (Pizza, Coffee, Momos)..."
                          value={posMenuSearch}
                          onChange={(e) => setPosMenuSearch(e.target.value)}
                          className="pl-8 h-8 text-xs bg-stone-50 rounded-lg border-stone-200"
                        />
                      </div>

                      {/* Category Pills */}
                      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                        {posMenuCategories.slice(0, 7).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setPosSelectedCategory(cat)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition-colors ${
                              posSelectedCategory === cat
                                ? "bg-stone-900 text-white"
                                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filtered Menu Items List */}
                    <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                      {posFilteredMenuItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-lg border border-stone-100 hover:border-stone-200 bg-stone-50/50 hover:bg-white transition-all group"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                item.isVeg ? "bg-emerald-500" : "bg-amber-600"
                              }`}
                              title={item.isVeg ? "Vegetarian" : "Non-Veg"}
                            />
                            <div className="truncate">
                              <p className="text-xs font-semibold text-stone-900 truncate">
                                {item.name}
                              </p>
                              <span className="text-[10px] text-stone-500 font-mono">
                                ₹{item.price} • {item.category}
                              </span>
                            </div>
                          </div>

                          <Button
                            onClick={() => {
                              if (selectedTicket) {
                                handleAddItemToTicket(selectedTicket.ticketId, item);
                              }
                            }}
                            size="sm"
                            className="h-7 px-2.5 bg-stone-900 hover:bg-[#C83B1E] text-white text-[10px] font-semibold rounded-md shadow-xs shrink-0 flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ================= 1.3 ALL ORDERS HISTORY & BILLING LEDGER ================= */}
          {activeTab === "order-history" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-base tracking-tight text-stone-900">
                    Order History & Billing Ledger ({filteredHistoryOrders.length})
                  </h3>
                  <p className="text-xs text-stone-500">
                    Complete fiscal audit trail of all dine-in table orders and counter takeaway bills
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setActiveTab("manual-order")}
                    className="bg-[#C83B1E] hover:bg-[#b03318] text-white text-xs font-semibold px-3.5 py-1.5 h-auto rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Take New Order
                  </Button>
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="text-xs font-medium text-stone-600 px-3.5 py-1.5 h-auto rounded-xl flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Shift Ledger
                  </Button>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative sm:col-span-1">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      placeholder="Search order #, guest name, mobile, table..."
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#C83B1E]/20 bg-white text-stone-900"
                    />
                  </div>

                  {/* Channel Filter */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-stone-500 text-[11px] font-medium">Channel:</span>
                    {(["ALL", "DINE_IN", "PICKUP"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setHistoryTypeFilter(t)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          historyTypeFilter === t
                            ? "bg-stone-900 text-white shadow-xs"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {t === "ALL" ? "All" : t === "DINE_IN" ? "Dine-In" : "Takeaway"}
                      </button>
                    ))}
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-stone-500 text-[11px] font-medium">Status:</span>
                    {(["ALL", "PLACED", "PREPARING", "READY", "COMPLETED"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setHistoryStatusFilter(st)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
                          historyStatusFilter === st
                            ? "bg-[#C83B1E] text-white shadow-xs"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Orders History Cards List */}
              <div className="space-y-3">
                {filteredHistoryOrders.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-xl border border-stone-200/80 text-stone-500 text-xs">
                    Koi order match nahi hua. Search ya filter clear karke dekhein.
                  </div>
                ) : (
                  filteredHistoryOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs hover:border-stone-300 transition-all space-y-3"
                    >
                      {/* Top Row: Order #, Time, Channel, Payment */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-stone-900 text-white">
                            #{ord.orderNo}
                          </span>
                          <span className="font-mono text-xs text-stone-500 font-medium">
                            {ord.publicId}
                          </span>
                          <span className="text-[11px] text-stone-400">·</span>
                          <span className="text-xs text-stone-500 font-mono">
                            {new Date(ord.createdAt).toLocaleDateString("en-IN")} ·{" "}
                            {new Date(ord.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                              ord.type === "DINE_IN"
                                ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                                : "bg-blue-50 text-blue-700 border border-blue-200/60"
                            }`}
                          >
                            {ord.customer.tableNo || ord.type}
                          </span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            {ord.paymentMethod} · {ord.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Middle Row: Customer Info & Items */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                            Guest Details
                          </span>
                          <div className="font-semibold text-stone-900 mt-0.5">{ord.customer.name}</div>
                          <div className="text-[11px] text-stone-500 font-mono">{ord.customer.phone}</div>
                        </div>

                        <div className="sm:col-span-2">
                          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                            Items Ordered ({ord.items.reduce((acc, it) => acc + it.qty, 0)})
                          </span>
                          <div className="text-xs text-stone-700 font-medium mt-0.5 flex flex-wrap gap-1.5">
                            {ord.items.map((it, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 text-[11px]"
                              >
                                {it.qty}× {it.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Financial Totals, Status Advance & Thermal Bill CTA */}
                      <div className="pt-2.5 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs">
                          <div className="text-stone-500">
                            Subtotal: <span className="font-mono font-semibold text-stone-900">{formatRupees(ord.pricing.subtotal)}</span>
                          </div>
                          <div className="text-stone-500">
                            GST (5%): <span className="font-mono text-stone-600">{formatRupees(ord.pricing.tax.totalTax)}</span>
                          </div>
                          <div className="font-bold text-sm text-[#C83B1E] font-mono">
                            Total: {formatRupees(ord.pricing.total)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Live Status Pill & Advance Button */}
                          <button
                            type="button"
                            onClick={() => handleAdvanceOrderStatus(ord.id, ord.status)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition border ${
                              ord.status === "PLACED"
                                ? "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100"
                                : ord.status === "PREPARING"
                                ? "bg-rose-50 text-rose-800 border-rose-200/80 hover:bg-rose-100"
                                : ord.status === "READY"
                                ? "bg-blue-50 text-blue-800 border-blue-200/80 hover:bg-blue-100"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200/80"
                            }`}
                            title="Click to advance status"
                          >
                            {ord.status === "PLACED"
                              ? "⏳ Placed → Start Prep"
                              : ord.status === "PREPARING"
                              ? "🔥 In Oven → Mark Ready"
                              : ord.status === "READY"
                              ? "🍕 Ready → Mark Served"
                              : "✓ Completed"}
                          </button>

                          {/* Print Bill Modal Trigger */}
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setActiveBillModalOrder(ord)}
                            className="bg-stone-900 hover:bg-black text-white text-xs font-semibold px-3 py-1 h-auto rounded-lg flex items-center gap-1.5"
                          >
                            <Receipt className="w-3.5 h-3.5 text-amber-400" />
                            <span>View Thermal Bill</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

{/* ================= 1.2 TABLE FLOOR MAP (FULL-TABLE EVENT BOOKINGS ONLY) ================= */}
          {activeTab === "table-floor" && (() => {
            const filteredEvents = eventBookings.filter((evt) =>
              eventCategoryFilter === "ALL" ? true : evt.eventType === eventCategoryFilter
            );
            const selectedBooking =
              eventBookings.find((e) => e.tableNumber === selectedEventTableNo) ||
              eventBookings[0];

            const decorReadyCount = eventBookings.filter((e) => e.status === "DECOR_READY").length;
            const inProgressCount = eventBookings.filter((e) => e.status === "IN_PROGRESS").length;

            return (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-base tracking-tight text-stone-900">
                      Table Floor Map (Full-Table Event & Celebration Bookings)
                    </h3>
                    <p className="text-xs text-stone-500">
                      Floor Map par sirf wahi tables reserved &amp; tracked hain jisme poori table kisi special event (Birthday Party, Anniversary, Reunion, Corporate Dinner) ke liye book ki gayi hai. Normal walk-ins Manual Order Desk se manage hote hain.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200/60">
                      ● {eventBookings.length} Event Tables Booked
                    </span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60">
                      ● {decorReadyCount} Decor Ready
                    </span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      ● {inProgressCount} In-Progress
                    </span>
                    <Button
                      onClick={() => setShowBookEventModal(true)}
                      size="sm"
                      className="bg-[#C83B1E] hover:bg-[#a83017] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Book Table for Event
                    </Button>
                  </div>
                </div>

                {/* Filter Tabs by Event Type */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                  {[
                    { id: "ALL", label: `All Event Tables (${eventBookings.length})` },
                    { id: "BIRTHDAY", label: `🎂 Birthday (${eventBookings.filter((e) => e.eventType === "BIRTHDAY").length})` },
                    { id: "ANNIVERSARY", label: `💍 Anniversary (${eventBookings.filter((e) => e.eventType === "ANNIVERSARY").length})` },
                    { id: "REUNION", label: `🎓 Reunion (${eventBookings.filter((e) => e.eventType === "REUNION").length})` },
                    { id: "CORPORATE", label: `💼 Corporate (${eventBookings.filter((e) => e.eventType === "CORPORATE").length})` },
                    { id: "CANDLELIGHT", label: `🕯️ Candlelight (${eventBookings.filter((e) => e.eventType === "CANDLELIGHT").length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setEventCategoryFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition border ${
                        eventCategoryFilter === tab.id
                          ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                          : "bg-white text-stone-600 border-stone-200/80 hover:bg-stone-50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* 2-Column Floor Layout: Left Event Tables Grid (8 cols), Right Event Inspector (4 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* LEFT: Grid of Full-Table Event Bookings (8 Columns) */}
                  <div className="lg:col-span-8 space-y-4">
                    {filteredEvents.length === 0 ? (
                      <div className="p-8 text-center bg-white rounded-xl border border-stone-200/80 text-stone-400">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                        <p className="font-medium text-xs">No tables currently booked for this event type</p>
                        <p className="text-[11px] text-stone-400 mt-1">Click &quot;+ Book Table for Event&quot; to reserve a full table.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredEvents.map((evt) => {
                          const isSelected = selectedBooking?.id === evt.id;
                          return (
                            <div
                              key={evt.id}
                              onClick={() => setSelectedEventTableNo(evt.tableNumber)}
                              className={`rounded-xl border p-4 shadow-xs transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? "bg-white ring-2 ring-[#C83B1E] border-transparent shadow-md"
                                  : "bg-white border-stone-200/80 hover:border-stone-300"
                              }`}
                            >
                              <div className="space-y-3">
                                {/* Top Badge Row */}
                                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-stone-900 text-white">
                                      Table {evt.tableNumber < 10 ? `0${evt.tableNumber}` : evt.tableNumber}
                                    </span>
                                    <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                                      Full {evt.tableSeats}-Seater Booked
                                    </span>
                                  </div>

                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                      evt.status === "DECOR_READY"
                                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                                        : evt.status === "IN_PROGRESS"
                                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse"
                                        : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                    }`}
                                  >
                                    {evt.status === "DECOR_READY"
                                      ? "● Decor Ready"
                                      : evt.status === "IN_PROGRESS"
                                      ? "● Event In Progress"
                                      : "● Reserved"}
                                  </span>
                                </div>

                                {/* Event Title & Occasion */}
                                <div>
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                                    <span>
                                      {evt.eventType === "BIRTHDAY"
                                        ? "🎂 Birthday Party"
                                        : evt.eventType === "ANNIVERSARY"
                                        ? "💍 Anniversary Dinner"
                                        : evt.eventType === "REUNION"
                                        ? "🎓 College Reunion"
                                        : evt.eventType === "CORPORATE"
                                        ? "💼 Corporate Dinner"
                                        : evt.eventType === "CANDLELIGHT"
                                        ? "🕯️ Romantic Date"
                                        : "🎉 Special Event"}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-sm text-stone-900 mt-0.5 leading-snug">
                                    {evt.eventTitle}
                                  </h4>
                                </div>

                                {/* Host & Schedule Details */}
                                <div className="space-y-1 text-xs text-stone-600 bg-stone-50/70 p-2.5 rounded-lg border border-stone-100">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-stone-800 flex items-center gap-1">
                                      <Users className="w-3 h-3 text-stone-400" /> {evt.hostName} ({evt.guestCount} Guests)
                                    </span>
                                    <span className="font-mono text-[11px] text-stone-500">{evt.hostPhone}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[11px] text-stone-500">
                                    <Clock className="w-3 h-3 text-stone-400" /> {evt.date} • {evt.timeSlot}
                                  </div>
                                  <div className="text-[11px] text-stone-600 italic pt-0.5">
                                    &ldquo;{evt.setupNotes}&rdquo;
                                  </div>
                                </div>

                                {/* Financials & Pre-orders */}
                                <div className="flex items-center justify-between text-xs pt-1">
                                  <div>
                                    <span className="text-[10px] text-stone-400 uppercase block font-semibold">Advance Paid</span>
                                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                      ₹{evt.advancePaid} (UPI Paid)
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[10px] text-stone-400 uppercase block font-semibold">Pre-order Est.</span>
                                    <span className="font-mono font-semibold text-stone-800">₹{evt.estimatedBill}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Card Action Buttons */}
                              <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-stone-100">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEventTableNo(evt.tableNumber);
                                  }}
                                  size="sm"
                                  variant={isSelected ? "default" : "outline"}
                                  className={`text-xs font-semibold h-8 rounded-lg ${
                                    isSelected
                                      ? "bg-[#C83B1E] text-white hover:bg-[#a83017]"
                                      : "text-stone-700 border-stone-300 hover:bg-stone-100"
                                  }`}
                                >
                                  {isSelected ? "✓ Selected" : "Inspect Setup"}
                                </Button>

                                {evt.status === "CONFIRMED" && (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateEventStatus(evt.id, "DECOR_READY");
                                    }}
                                    size="sm"
                                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold h-8 rounded-lg shadow-xs"
                                  >
                                    Decor Ready
                                  </Button>
                                )}

                                {evt.status === "DECOR_READY" && (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateEventStatus(evt.id, "IN_PROGRESS");
                                    }}
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-8 rounded-lg shadow-xs"
                                  >
                                    Seat Guests
                                  </Button>
                                )}

                                {evt.status === "IN_PROGRESS" && (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCompleteEventAndFreeTable(evt.id);
                                    }}
                                    size="sm"
                                    className="bg-stone-900 hover:bg-black text-white text-xs font-semibold h-8 rounded-lg shadow-xs"
                                  >
                                    Free Table
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Selected Event Booking Sheet & Host Control (4 Columns) */}
                  <div className="lg:col-span-4 bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs space-y-4 sticky top-20">
                    {selectedBooking ? (
                      <div className="space-y-4">
                        {/* Event Header */}
                        <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Event Booking Pass
                            </span>
                            <span className="text-xs font-mono font-bold bg-purple-900 text-white px-2 py-0.5 rounded-md">
                              Table {selectedBooking.tableNumber}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-stone-900 leading-tight">
                            {selectedBooking.eventTitle}
                          </h4>

                          <div className="text-xs text-stone-600 space-y-1 pt-1 border-t border-purple-200/60">
                            <div className="flex justify-between">
                              <span className="text-stone-500">Reserved Area:</span>
                              <strong className="text-stone-900 font-medium">Full {selectedBooking.tableSeats}-Seater Table</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-500">Party Size:</span>
                              <strong className="text-stone-900 font-medium">{selectedBooking.guestCount} Guests</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-500">Schedule:</span>
                              <strong className="text-stone-900 font-medium">{selectedBooking.timeSlot}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Host Contact Card */}
                        <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/60 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-stone-500 uppercase">Host Contact</span>
                            <span className="font-mono text-stone-800 font-semibold">{selectedBooking.hostPhone}</span>
                          </div>
                          <div className="font-medium text-stone-900 text-sm">
                            {selectedBooking.hostName}
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <a
                              href={`tel:${selectedBooking.hostPhone}`}
                              className="py-1 px-2 text-center rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-[11px] flex items-center justify-center gap-1"
                            >
                              <Phone className="w-3 h-3" /> Call Host
                            </a>
                            <a
                              href={`https://wa.me/91${selectedBooking.hostPhone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="py-1 px-2 text-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center justify-center gap-1"
                            >
                              WhatsApp
                            </a>
                          </div>
                        </div>

                        {/* Decor & Setup Checklist */}
                        <div className="space-y-2 text-xs">
                          <label className="text-[11px] font-bold text-stone-500 uppercase block">
                            Event Setup Checklist
                          </label>
                          <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60 space-y-1.5">
                            <div className="flex items-center gap-2 text-stone-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Entire table reserved &amp; cleared</span>
                            </div>
                            <div className="flex items-center gap-2 text-stone-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{selectedBooking.setupNotes}</span>
                            </div>
                            <div className="flex items-center gap-2 text-stone-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Welcome drinks &amp; water placed</span>
                            </div>
                          </div>
                        </div>

                        {/* Pre-ordered Event Food */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-stone-500 uppercase">
                              Pre-Ordered Party Menu
                            </label>
                            <span className="font-mono text-stone-500 text-[10px]">
                              {selectedBooking.preOrderedItems.length} items
                            </span>
                          </div>
                          <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                            {selectedBooking.preOrderedItems.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center py-1 px-2 rounded-md bg-stone-50 text-[11px]"
                              >
                                <span className="font-medium text-stone-800">
                                  {item.qty}× {item.name}
                                </span>
                                <span className="font-mono text-stone-600">₹{item.price * item.qty}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Advance & Balance Breakdown */}
                        <div className="p-3 rounded-lg bg-stone-50/90 border border-stone-200/80 space-y-1 text-xs">
                          <div className="flex justify-between text-stone-500 text-[11px]">
                            <span>Pre-order Total</span>
                            <span className="font-mono">₹{selectedBooking.estimatedBill}</span>
                          </div>
                          <div className="flex justify-between text-emerald-700 font-medium text-[11px]">
                            <span>Advance Deposit Paid</span>
                            <span className="font-mono">-₹{selectedBooking.advancePaid}</span>
                          </div>
                          <div className="flex justify-between text-stone-900 font-bold text-xs pt-1 border-t border-stone-200">
                            <span>Balance Due at Venue</span>
                            <span className="font-mono text-[#C83B1E]">
                              ₹{Math.max(0, selectedBooking.estimatedBill - selectedBooking.advancePaid)}
                            </span>
                          </div>
                        </div>

                        {/* Status Manager Buttons */}
                        <div className="space-y-2 pt-1">
                          {selectedBooking.status === "CONFIRMED" && (
                            <Button
                              onClick={() => handleUpdateEventStatus(selectedBooking.id, "DECOR_READY")}
                              className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold py-2 rounded-xl shadow-xs"
                            >
                              🎈 Mark Decor &amp; Cake Table Ready
                            </Button>
                          )}

                          {selectedBooking.status === "DECOR_READY" && (
                            <Button
                              onClick={() => handleUpdateEventStatus(selectedBooking.id, "IN_PROGRESS")}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-xl shadow-xs"
                            >
                              🎉 Seat Guests (Start Event)
                            </Button>
                          )}

                          <Button
                            onClick={() => handleCompleteEventAndFreeTable(selectedBooking.id)}
                            variant="outline"
                            className="w-full text-xs font-semibold py-2 rounded-xl border-stone-300 text-stone-700 hover:bg-stone-100"
                          >
                            ✅ Complete Event &amp; Free Table
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-xs text-stone-400 py-12">
                        Select an event table to view party details &amp; setup notes
                      </div>
                    )}
                  </div>
                </div>

                {/* MODAL: Book Full Table for New Event */}
                {showBookEventModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                        <div>
                          <h3 className="font-bold text-base text-stone-900">
                            Book Full Table for Event
                          </h3>
                          <p className="text-xs text-stone-500">
                            Reserve an entire table exclusively for a birthday, anniversary, or private celebration.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowBookEventModal(false)}
                          className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleCreateNewEventBooking} className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold text-stone-700 block mb-1">
                              Select Table to Reserve
                            </label>
                            <select
                              value={newEventTableNo}
                              onChange={(e) => setNewEventTableNo(Number(e.target.value))}
                              className="w-full h-8 px-2.5 rounded-lg border border-stone-300 bg-white text-xs"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                                <option key={num} value={num}>
                                  Table {num < 10 ? `0${num}` : num} ({num === 12 ? 8 : num === 6 || num === 8 ? 6 : 4} Seats)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="font-semibold text-stone-700 block mb-1">
                              Event Occasion
                            </label>
                            <select
                              value={newEventType}
                              onChange={(e) => setNewEventType(e.target.value as TableEventBooking["eventType"])}
                              className="w-full h-8 px-2.5 rounded-lg border border-stone-300 bg-white text-xs"
                            >
                              <option value="BIRTHDAY">🎂 Birthday Party</option>
                              <option value="ANNIVERSARY">💍 Anniversary Dinner</option>
                              <option value="REUNION">🎓 College Reunion</option>
                              <option value="CORPORATE">💼 Corporate Dinner</option>
                              <option value="CANDLELIGHT">🕯️ Candlelight Date</option>
                              <option value="PRIVATE_PARTY">🎉 Private Celebration</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">
                            Event Title
                          </label>
                          <Input
                            placeholder="e.g. Rahul's 21st Birthday Bash"
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold text-stone-700 block mb-1">
                              Host Name *
                            </label>
                            <Input
                              placeholder="Customer / Host Name"
                              value={newEventHostName}
                              onChange={(e) => setNewEventHostName(e.target.value)}
                              required
                              className="h-8 text-xs"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-stone-700 block mb-1">
                              Host Phone *
                            </label>
                            <Input
                              placeholder="98765 43210"
                              value={newEventHostPhone}
                              onChange={(e) => setNewEventHostPhone(e.target.value)}
                              required
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="font-semibold text-stone-700 block mb-1">
                              Guest Count
                            </label>
                            <Input
                              type="number"
                              min={1}
                              max={16}
                              value={newEventGuestCount}
                              onChange={(e) => setNewEventGuestCount(Number(e.target.value))}
                              className="h-8 text-xs"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-stone-700 block mb-1">
                              Date
                            </label>
                            <Input
                              type="date"
                              value={newEventDate}
                              onChange={(e) => setNewEventDate(e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-stone-700 block mb-1">
                              Time
                            </label>
                            <Input
                              type="time"
                              value={newEventTime}
                              onChange={(e) => setNewEventTime(e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">
                            Setup &amp; Decor Notes
                          </label>
                          <Input
                            placeholder="e.g. Balloon arch, Candle decor, Cake table arrangement"
                            value={newEventSetupNotes}
                            onChange={(e) => setNewEventSetupNotes(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">
                            Advance Deposit Paid (₹)
                          </label>
                          <Input
                            type="number"
                            min={0}
                            step={100}
                            value={newEventAdvance}
                            onChange={(e) => setNewEventAdvance(Number(e.target.value))}
                            className="h-8 text-xs font-mono"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                          <Button
                            type="button"
                            onClick={() => setShowBookEventModal(false)}
                            variant="outline"
                            size="sm"
                            className="text-xs font-semibold rounded-xl"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            className="bg-[#C83B1E] hover:bg-[#a83017] text-white text-xs font-semibold rounded-xl shadow-xs"
                          >
                            Confirm Full Table Booking
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ================= 1.3 LIVE KITCHEN DISPLAY (KDS) ================= */}
          {activeTab === "live-kds" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-stone-900">Live Kitchen Display System (KDS)</h3>
                  <p className="text-xs text-stone-500">
                    Real-time KOT tickets directly from Table QR and POS. Bump tickets as items are prepped.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 animate-pulse">
                    350°C Stone Oven Active
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kdsTickets.map((t) => (
                  <div
                    key={t.kotNo}
                    className={`bg-white rounded-xl border-2 p-4 shadow-xs flex flex-col justify-between ${
                      t.status === "NEW"
                        ? "border-amber-400 bg-amber-50/20"
                        : t.status === "IN_OVEN"
                        ? "border-rose-400 bg-rose-50/20"
                        : t.status === "READY"
                        ? "border-emerald-400 bg-emerald-50/20"
                        : "border-stone-200/80"
                    }`}
                  >
                    <div>
                      {/* Ticket Header */}
                      <div className="flex items-center justify-between border-b border-stone-200/60 pb-2 mb-2.5">
                        <div>
                          <span className="font-mono font-bold text-sm text-stone-900">KOT #{t.kotNo}</span>
                          <span className="text-[10px] text-stone-400 font-mono block">{t.time}</span>
                        </div>
                        <span
                          className={`font-mono font-semibold text-xs px-2 py-0.5 rounded-lg ${
                            t.tableNo > 0 ? "bg-stone-900 text-white" : "bg-purple-600 text-white"
                          }`}
                        >
                          {t.tableNo > 0 ? `Table ${t.tableNo}` : "Takeaway"}
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2 text-xs">
                        {t.items.map((it, idx) => (
                          <div key={idx} className="border-b border-dashed border-stone-200/60 pb-1.5">
                            <div className="font-bold text-stone-900 flex justify-between">
                              <span>{it.qty}× {it.name}</span>
                            </div>
                            {it.note && (
                              <div className="text-[10px] text-rose-700 font-semibold italic mt-0.5">
                                Note: {it.note}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bump Button */}
                    <div className="mt-4 pt-3 border-t border-stone-200/60">
                      <Button
                        onClick={() => handleAdvanceKds(t.kotNo)}
                        className={`w-full text-xs font-bold py-2 rounded-xl transition ${
                          t.status === "NEW"
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : t.status === "PREPARING"
                            ? "bg-rose-600 hover:bg-rose-700 text-white"
                            : t.status === "IN_OVEN"
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "bg-emerald-600 text-white"
                        }`}
                      >
                        {t.status === "NEW"
                          ? "🔥 Start Prep"
                          : t.status === "PREPARING"
                          ? "🍕 Move to Stone Oven"
                          : t.status === "IN_OVEN"
                          ? "✅ Mark Ready for Table"
                          : "✓ Served to Table"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 1.4 DINE-IN TOUCH POS ================= */}
          {activeTab === "pos-billing" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-stone-900">Dine-In Touch POS & Counter Billing</h3>
                  <p className="text-xs text-stone-500">
                    Fast touch screen cashier interface for table settlement and thermal GST bills
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Shift POS Summary
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200/80 p-5 shadow-xs space-y-4">
                  <h4 className="font-bold text-sm text-stone-900">Active Tables Ready for Billing</h4>
                  <div className="divide-y divide-stone-200/60 text-xs">
                    {tables
                      .filter((t) => t.status === "OCCUPIED" || t.status === "BILL_REQUESTED")
                      .map((t) => (
                        <div key={t.number} className="py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-[#C83B1E] text-white font-mono font-bold flex items-center justify-center text-xs">
                              T{t.number}
                            </span>
                            <div>
                              <div className="font-bold text-stone-900">{t.guestName || "Guest"}</div>
                              <div className="text-[10px] text-stone-400 font-mono">
                                Seated {t.seatedMinutes}m ago · {t.itemsCount} Items
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-sm text-[#C83B1E]">
                              ₹{t.orderTotal}
                            </span>
                            <Button
                              onClick={() => handleUpdateTableStatus(t.number, "VACANT")}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1 h-auto rounded-xl"
                            >
                              Settle & Print
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-stone-200/80 p-5 shadow-xs space-y-3">
                  <h4 className="font-bold text-sm text-stone-900">Thermal Bill Simulator</h4>
                  <div className="p-4 rounded-xl bg-stone-50 font-mono text-[11px] text-stone-900 space-y-1.5 border border-stone-200/60">
                    <div className="text-center font-bold">*** 7 BITES CAFE ***</div>
                    <div className="text-center text-[10px] text-stone-400">Gohalpur Amkhera, Jagriti Nagar, Jabalpur (MP) 482001</div>
                    <div className="text-center text-[10px] text-stone-400">GSTIN: 23ABCDE1234F1Z5</div>
                    <div className="border-b border-dashed border-stone-200 my-1" />
                    <div className="flex justify-between">
                      <span>Table: 04</span>
                      <span>KOT: 41</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1× Farmhouse Pizza (L)</span>
                      <span>389.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2× Cold Coffee</span>
                      <span>258.00</span>
                    </div>
                    <div className="border-b border-dashed border-stone-200 my-1" />
                    <div className="flex justify-between font-bold">
                      <span>Subtotal:</span>
                      <span>₹647.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST (2.5%):</span>
                      <span>₹16.18</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (2.5%):</span>
                      <span>₹16.18</span>
                    </div>
                    <div className="border-b border-dashed border-stone-200 my-1" />
                    <div className="flex justify-between font-semibold text-xs text-[#C83B1E]">
                      <span>TOTAL DUE:</span>
                      <span>₹679.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2.1 TABLE RESERVATIONS MANAGER ================= */}
          {activeTab === "reservations" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-stone-900">Table Reservations & Party Bookings</h3>
                  <p className="text-xs text-stone-500">
                    Manage pre-bookings for dine-in tables, birthdays, and anniversary dinners
                  </p>
                </div>
                <Button
                  onClick={() => setShowNewResModal(true)}
                  className="bg-[#C83B1E] hover:bg-[#B33419] text-white text-xs font-bold px-3.5 py-1.5 h-auto rounded-xl flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> + New Reservation
                </Button>
              </div>

              {/* New Reservation Form Modal */}
              {showNewResModal && (
                <form
                  onSubmit={handleCreateReservation}
                  className="bg-white rounded-xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4"
                >
                  <h4 className="font-bold text-sm text-stone-900">Add Walk-In / Phone Table Booking</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">Guest Name *</label>
                      <input
                        type="text"
                        value={resName}
                        onChange={(e) => setResName(e.target.value)}
                        placeholder="e.g. Ankit Sharma"
                        required
                        className="w-full text-xs p-2 rounded-xl border border-stone-200/80"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        value={resPhone}
                        onChange={(e) => setResPhone(e.target.value)}
                        placeholder="10-digit Mobile"
                        required
                        className="w-full text-xs p-2 rounded-xl border border-stone-200/80 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">Number of Guests</label>
                      <input
                        type="number"
                        min={1}
                        max={16}
                        value={resGuests}
                        onChange={(e) => setResGuests(Number(e.target.value))}
                        className="w-full text-xs p-2 rounded-xl border border-stone-200/80 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">Reservation Time</label>
                      <input
                        type="time"
                        value={resTime}
                        onChange={(e) => setResTime(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-stone-200/80"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-stone-900 block mb-1">Occasion / Special Request</label>
                      <input
                        type="text"
                        value={resOccasion}
                        onChange={(e) => setResOccasion(e.target.value)}
                        placeholder="e.g. Birthday Party, Window Table"
                        className="w-full text-xs p-2 rounded-xl border border-stone-200/80"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="bg-[#C83B1E] text-white text-xs font-bold rounded-xl">
                      Save & Confirm Reservation
                    </Button>
                    <Button
                      type="button"
                      variant="paper"
                      onClick={() => setShowNewResModal(false)}
                      className="text-xs font-bold rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* Reservations Table */}
              <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 border-b border-stone-200/60 text-stone-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Guest Name</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Party Size</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Occasion</th>
                      <th className="p-3">Assigned Table</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/60">
                    {reservations.map((r) => (
                      <tr key={r.id} className="hover:hover:bg-stone-50/60">
                        <td className="p-3 font-bold text-stone-900">{r.guestName}</td>
                        <td className="p-3 font-mono text-stone-500">+91 {r.phone}</td>
                        <td className="p-3 font-mono">{r.guests} People</td>
                        <td className="p-3 font-mono font-bold text-stone-900">{r.time}</td>
                        <td className="p-3 text-stone-500">{r.occasion}</td>
                        <td className="p-3">
                          {r.assignedTable ? (
                            <span className="font-mono font-bold text-xs bg-stone-50 px-2 py-0.5 rounded border border-stone-200/60">
                              Table {r.assignedTable}
                            </span>
                          ) : (
                            <span className="text-stone-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              r.status === "CONFIRMED"
                                ? "bg-emerald-100 text-emerald-800"
                                : r.status === "SEATED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {r.status === "PENDING" && (
                            <button
                              onClick={() => handleConfirmReservation(r.id, 9)}
                              className="text-[11px] font-bold text-emerald-700 hover:underline"
                            >
                              Confirm
                            </button>
                          )}
                          {r.status === "CONFIRMED" && (
                            <button
                              onClick={() => handleSeatReservation(r.id)}
                              className="text-[11px] font-bold text-purple-700 hover:underline"
                            >
                              Seat Guests
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 2.2 COMBOS & SPECIALS ================= */}
          {activeTab === "combos-specials" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-stone-900">
                    Dine-In Meal Combos & Specials ({combos.length})
                  </h3>
                  <p className="text-xs text-stone-500">
                    High-margin pizza, beverage & sides bundles for quick table upselling
                  </p>
                </div>
                <Button
                  onClick={() => setShowAddComboModal(true)}
                  className="bg-[#C83B1E] hover:bg-[#B33419] text-white text-xs font-bold px-4 py-2 h-auto rounded-xl flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Combo</span>
                </Button>
              </div>

              {/* Add Combo Modal */}
              {showAddComboModal && (
                <form
                  onSubmit={handleCreateCombo}
                  className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                    <h4 className="font-bold text-sm text-stone-900">Add New Meal Combo</h4>
                    <button
                      type="button"
                      onClick={() => setShowAddComboModal(false)}
                      className="p-1 rounded-lg hover:bg-stone-50 text-stone-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-stone-900 block mb-1">Combo Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Pizza Lover's Duo Platter"
                        value={newComboTitle}
                        onChange={(e) => setNewComboTitle(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 focus:outline-none focus:border-[#C83B1E]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">Combo Price (₹)</label>
                      <input
                        type="number"
                        placeholder="399"
                        value={newComboPrice}
                        onChange={(e) => setNewComboPrice(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 focus:outline-none focus:border-[#C83B1E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">Original Total Value (₹)</label>
                      <input
                        type="number"
                        placeholder="520"
                        value={newComboOrig}
                        onChange={(e) => setNewComboOrig(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 focus:outline-none focus:border-[#C83B1E]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">Included Items (comma separated)</label>
                      <input
                        type="text"
                        placeholder="Medium Pizza, Cold Coffee, Garlic Bread"
                        value={newComboItems}
                        onChange={(e) => setNewComboItems(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 focus:outline-none focus:border-[#C83B1E]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAddComboModal(false)}
                      className="text-xs font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#C83B1E] hover:bg-[#B33419] text-white text-xs font-bold px-4 py-2 h-auto rounded-xl"
                    >
                      Save & Activate Combo
                    </Button>
                  </div>
                </form>
              )}

              {/* Combos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {combos.map((combo) => (
                  <div
                    key={combo.id}
                    className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition ${
                      combo.active ? "border-stone-200/80" : "border-stone-200/60 opacity-60 bg-gray-50/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F59E0B]/20 text-stone-900">
                          {combo.badge}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-xs text-stone-400 line-through">₹{combo.originalPrice}</span>
                          <span className="font-semibold text-base text-[#C83B1E]">₹{combo.price}</span>
                        </div>
                      </div>
                      <h4 className="font-bold text-sm text-stone-900 mt-2">{combo.title}</h4>

                      <div className="mt-3 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-stone-400 uppercase block">
                          Includes {combo.items.length} Items:
                        </span>
                        <ul className="text-xs text-stone-500 space-y-1">
                          {combo.items.map((it, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C83B1E]" />
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-stone-200/60 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          combo.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {combo.active ? "Active in POS & Menu" : "Inactive / Paused"}
                      </span>
                      <Button
                        size="sm"
                        variant={combo.active ? "paper" : "pepperoni"}
                        onClick={() => handleToggleCombo(combo.id)}
                        className="text-xs font-bold py-1 h-auto rounded-xl"
                      >
                        {combo.active ? "Pause Combo" : "Activate"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 2.3 KITCHEN INVENTORY & STOCK ================= */}
          {activeTab === "inventory-stock" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-stone-900">
                    Raw Material Inventory & Stock Control
                  </h3>
                  <p className="text-xs text-stone-500">
                    Real-time ingredient levels, minimum reorder thresholds, and vendor stock replenishment
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center p-1 bg-stone-50 rounded-xl border border-stone-200/60 text-xs font-bold">
                    <button
                      onClick={() => setRestockFilter("ALL")}
                      className={`px-3 py-1 rounded-lg transition ${
                        restockFilter === "ALL" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500"
                      }`}
                    >
                      All Items ({inventoryItems.length})
                    </button>
                    <button
                      onClick={() => setRestockFilter("LOW_STOCK")}
                      className={`px-3 py-1 rounded-lg transition ${
                        restockFilter === "LOW_STOCK" ? "bg-white text-rose-700 shadow-xs" : "text-stone-500"
                      }`}
                    >
                      Low Stock Alerts ({inventoryItems.filter((i) => i.status === "LOW_STOCK").length})
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs">
                  <span className="text-[10px] font-mono text-stone-400 uppercase font-bold">
                    Total Raw Inventory Value
                  </span>
                  <div className="font-mono font-semibold text-xl text-stone-900 mt-1">
                    ₹
                    {inventoryItems
                      .reduce((sum, item) => sum + item.qty * item.costPerUnit, 0)
                      .toLocaleString("en-IN")}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                    ✓ 8 key pantry items tracked
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs">
                  <span className="text-[10px] font-mono text-stone-400 uppercase font-bold">
                    Reorder Threshold Alerts
                  </span>
                  <div className="font-mono font-semibold text-xl text-rose-600 mt-1">
                    {inventoryItems.filter((i) => i.status === "LOW_STOCK").length} Items Low
                  </div>
                  <span className="text-[10px] text-rose-600 font-bold mt-1 block">
                    ⚠ Mozzarella, Espresso & Brioche buns
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs">
                  <span className="text-[10px] font-mono text-stone-400 uppercase font-bold">
                    Primary Dairy Supplier
                  </span>
                  <div className="font-bold text-base text-stone-900 mt-1 truncate">
                    Amul MP Dairy Hub & Local Farm
                  </div>
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    Daily morning delivery: 07:00 AM
                  </span>
                </div>
              </div>

              {/* Restock Modal */}
              {showRestockModal && (
                <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                    <h4 className="font-bold text-sm text-stone-900">Restock Inventory Item</h4>
                    <button
                      type="button"
                      onClick={() => setShowRestockModal(false)}
                      className="p-1 rounded-lg hover:bg-stone-50 text-stone-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">Select Ingredient</label>
                      <select
                        value={restockItemId || ""}
                        onChange={(e) => setRestockItemId(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 bg-white font-medium focus:outline-none focus:border-[#C83B1E]"
                      >
                        {inventoryItems.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.name} (Current: {it.qty} {it.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">Received Quantity to Add</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={restockQtyInput}
                          onChange={(e) => setRestockQtyInput(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 focus:outline-none focus:border-[#C83B1E]"
                        />
                        <div className="flex items-center gap-1">
                          {["5", "10", "25"].map((q) => (
                            <button
                              key={q}
                              type="button"
                              onClick={() => setRestockQtyInput(q)}
                              className="px-2.5 py-2 text-xs font-bold border border-stone-200/80 rounded-xl hover:bg-stone-50"
                            >
                              +{q}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowRestockModal(false)}
                      className="text-xs font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() =>
                        handleRestockItem(
                          restockItemId || inventoryItems[0].id,
                          Number(restockQtyInput) || 10
                        )
                      }
                      className="bg-[#C83B1E] hover:bg-[#B33419] text-white text-xs font-bold px-4 py-2 h-auto rounded-xl"
                    >
                      Update Stock
                    </Button>
                  </div>
                </div>
              )}

              {/* Inventory Table */}
              <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 border-b border-stone-200/60 text-stone-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Raw Ingredient</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Current Stock</th>
                      <th className="p-3.5">Min Threshold</th>
                      <th className="p-3.5">Unit Cost</th>
                      <th className="p-3.5">Supplier</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Quick Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/60">
                    {inventoryItems
                      .filter((i) => (restockFilter === "LOW_STOCK" ? i.status === "LOW_STOCK" : true))
                      .map((item) => (
                        <tr key={item.id} className="hover:hover:bg-stone-50/60">
                          <td className="p-3.5 font-bold text-stone-900">{item.name}</td>
                          <td className="p-3.5 text-stone-500">{item.category}</td>
                          <td className="p-3.5 font-mono font-bold text-stone-900">
                            {item.qty} {item.unit}
                          </td>
                          <td className="p-3.5 font-mono text-stone-400">
                            {item.minThreshold} {item.unit}
                          </td>
                          <td className="p-3.5 font-mono text-stone-500">₹{item.costPerUnit}/{item.unit}</td>
                          <td className="p-3.5 text-stone-500">{item.supplier}</td>
                          <td className="p-3.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.status === "OPTIMAL"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800 animate-pulse"
                              }`}
                            >
                              {item.status === "OPTIMAL" ? "Optimal Level" : "Low Stock Alert"}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <Button
                              size="sm"
                              variant="paper"
                              onClick={() => {
                                setRestockItemId(item.id);
                                setShowRestockModal(true);
                              }}
                              className="text-xs font-bold py-1 h-auto rounded-xl"
                            >
                              + Restock
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 2.4 RECIPE BOM & FOOD COST ================= */}
          {activeTab === "recipes-cost" && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-base text-stone-900">
                  Recipe Bill of Materials (BOM) & Food Cost Calculator
                </h3>
                <p className="text-xs text-stone-500">
                  Exact raw material cost per plate, gross margins, and profitability optimization
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {recipes.map((recipe, idx) => {
                  const totalCost = recipe.ingredients.reduce((acc, cur) => acc + cur.cost, 0);
                  const foodCostPct = Math.round((totalCost / recipe.sellingPrice) * 100);
                  const grossMarginPct = 100 - foodCostPct;

                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-stone-200/80 p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">
                            {recipe.category}
                          </span>
                          <span className="font-mono font-bold text-sm text-stone-900">
                            Menu Price: <span className="text-[#C83B1E]">₹{recipe.sellingPrice}</span>
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-stone-900 mt-1">{recipe.name}</h4>

                        {/* Cost Bar */}
                        <div className="mt-4 p-3 bg-stone-50 rounded-2xl border border-stone-200/60 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-stone-400 uppercase block">
                              Raw Food Cost
                            </span>
                            <span className="font-mono font-bold text-base text-stone-900">₹{totalCost}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono text-stone-400 uppercase block">
                              Food Cost %
                            </span>
                            <span
                              className={`font-mono font-semibold text-base ${
                                foodCostPct <= 30 ? "text-emerald-600" : "text-amber-600"
                              }`}
                            >
                              {foodCostPct}%{" "}
                              <span className="text-[10px] font-normal text-stone-500">
                                ({grossMarginPct}% Margin)
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Ingredients Breakdown Table */}
                        <div className="mt-4 space-y-1.5">
                          <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">
                            Ingredient Cost Breakdown:
                          </span>
                          <div className="divide-y divide-stone-200/60 text-xs">
                            {recipe.ingredients.map((ing, iIdx) => (
                              <div key={iIdx} className="py-1.5 flex items-center justify-between">
                                <span className="text-stone-500">
                                  {ing.item} ({ing.qty})
                                </span>
                                <span className="font-mono font-bold text-stone-900">₹{ing.cost}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-emerald-700 font-bold">
                          ✓ Healthy Cafe Margin target met
                        </span>
                        <span className="font-mono font-bold text-stone-900">
                          Profit: ₹{recipe.sellingPrice - totalCost} / plate
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 2.2 MENU CATALOG & 86 TOGGLES ================= */}
          {activeTab === "menu-catalog" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-stone-900">
                    Menu Items Catalog ({allMenuItems.length})
                  </h3>
                  <p className="text-xs text-stone-500">
                    Manage live 86 / In-Stock kitchen availability toggles
                  </p>
                </div>
                <Link
                  to="/menu"
                  className="px-3 py-1.5 rounded-xl border border-stone-200/80 text-xs font-bold text-stone-900 hover:bg-stone-50"
                >
                  View Public Menu →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {allMenuItems.map((item) => {
                  const isAvailable = itemsAvailability[item.id] !== false;
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                            {item.category}
                          </span>
                          <span className="font-mono font-bold text-sm text-[#C83B1E]">
                            ₹{item.price}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-stone-900 mt-1">{item.name}</h4>
                        <p className="text-xs text-stone-500 line-clamp-2 mt-1">{item.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {isAvailable ? "In Stock · Available" : "86'd · Sold Out"}
                        </span>
                        <Button
                          onClick={() => toggleItemAvailability(item.id)}
                          size="sm"
                          variant={isAvailable ? "paper" : "pepperoni"}
                          className="text-xs font-bold py-1 h-auto rounded-lg"
                        >
                          {isAvailable ? "Mark Sold Out" : "Mark Available"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 2.3 DIGITAL TABLE QR CODES ================= */}
          {activeTab === "digital-qr" && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-base text-stone-900">Table Digital QR Codes (Tables 1 – 12)</h3>
                <p className="text-xs text-stone-500">
                  Printable table tent QR cards for seamless guest dine-in ordering without waiter delays
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <div
                    key={num}
                    className="bg-white rounded-xl border border-stone-200/80 p-4 text-center shadow-xs flex flex-col items-center justify-between"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-semibold text-sm mb-2">
                      T-{num < 10 ? `0${num}` : num}
                    </div>
                    <h5 className="font-bold text-xs text-stone-900">Table {num} QR</h5>
                    <div className="text-[10px] text-stone-400 font-mono mt-0.5">token: table-{num}</div>

                    <Link
                      to="/t/$token"
                      params={{ token: `table-0${num}` }}
                      className="mt-3 text-[11px] font-bold text-[#C83B1E] hover:underline flex items-center gap-1"
                    >
                      <span>Open Guest View</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 2.4 STOREFRONT CMS ================= */}
          {activeTab === "storefront-cms" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">Storefront & Festival CMS</h3>
                <p className="text-xs text-stone-500">
                  Control website banner announcements, festive notices, and cafe opening hours
                </p>
              </div>

              <form
                onSubmit={handleSaveCms}
                className="bg-white rounded-xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-stone-900 block mb-1">
                    Homepage Announcement Ribbon:
                  </label>
                  <input
                    type="text"
                    value={cmsNotice}
                    onChange={(e) => setCmsNotice(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 focus:outline-none focus:border-[#C83B1E]"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="cmsBanner"
                    checked={cmsActive}
                    onChange={(e) => setCmsActive(e.target.checked)}
                    className="rounded accent-[#C83B1E]"
                  />
                  <label htmlFor="cmsBanner" className="text-xs font-bold text-stone-900">
                    Show Festival Glow Ribbon on Homepage Topbar
                  </label>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Button
                    type="submit"
                    className="bg-[#C83B1E] hover:bg-[#B33419] text-white text-xs font-bold px-4 py-2 h-auto rounded-xl"
                  >
                    Save & Publish Live
                  </Button>
                  {cmsSavedAlert && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Published to 7 Bites Website!
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* ================= 3.1 DAILY CASH REGISTER ================= */}
          {activeTab === "cash-register" && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-base text-stone-900">Daily Cash Register & Shift Settlement</h3>
                <p className="text-xs text-stone-500">
                  Track counter cash float, UPI settlements, and daily drawer reconciliation
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs">
                  <span className="text-xs text-stone-400 font-bold">Opening Cash Float</span>
                  <div className="font-mono font-semibold text-xl text-stone-900 mt-1">₹{openingFloat}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Counter opening cash</div>
                </div>

                <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs">
                  <span className="text-xs text-stone-400 font-bold">Cash Dine-In Sales</span>
                  <div className="font-mono font-semibold text-xl text-emerald-700 mt-1">₹4,290</div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Collected in drawer</div>
                </div>

                <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs">
                  <span className="text-xs text-stone-400 font-bold">UPI / QR Collections</span>
                  <div className="font-mono font-semibold text-xl text-blue-700 mt-1">₹11,480</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Bank settled instantly</div>
                </div>

                <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs">
                  <span className="text-xs text-stone-400 font-bold">Expected Closing Cash</span>
                  <div className="font-mono font-semibold text-xl text-[#C83B1E] mt-1">
                    ₹{openingFloat + 4290 - pettyExpense}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">After petty expenses</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-stone-200/80 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Shift Settlement Status</h4>
                  <p className="text-xs text-stone-500">Cashier: Aakash Gupta · Shift A</p>
                </div>
                <Button
                  onClick={() => setShiftClosed(!shiftClosed)}
                  className={`text-xs font-bold px-4 py-2 rounded-xl ${
                    shiftClosed ? "bg-emerald-600 text-white" : "bg-stone-900 text-white"
                  }`}
                >
                  {shiftClosed ? "✓ Shift Settled & Closed" : "Close Shift & Print Z-Report"}
                </Button>
              </div>
            </div>
          )}

          {/* ================= 3.2 GST & TAX COMPLIANCE ================= */}
          {activeTab === "tax-gst" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">GST & Tax Compliance Ledger</h3>
                <p className="text-xs text-stone-500">
                  Restaurant 5% GST (2.5% CGST + 2.5% SGST) breakdown without ITC per government rules
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs">
                  <span className="text-xs text-stone-400 font-bold">Total CGST (2.5%)</span>
                  <div className="font-mono font-semibold text-xl text-stone-900 mt-1">
                    {formatRupees(Math.round(totalTax / 2))}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Central GST collected</div>
                </div>

                <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs">
                  <span className="text-xs text-stone-400 font-bold">Total SGST (2.5%)</span>
                  <div className="font-mono font-semibold text-xl text-stone-900 mt-1">
                    {formatRupees(Math.round(totalTax / 2))}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">State GST (Madhya Pradesh)</div>
                </div>

                <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs">
                  <span className="text-xs text-stone-400 font-bold">Total Tax Depositable</span>
                  <div className="font-mono font-semibold text-xl text-emerald-700 mt-1">
                    {formatRupees(totalTax)}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">HSN Code: 996331 (Restaurant)</div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 3.3 DINE-IN BILLING LEDGER ================= */}
          {activeTab === "billing-ledger" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-stone-900">Dine-In Billing Ledger</h3>
                  <p className="text-xs text-stone-500">
                    Complete archive of fiscal tax invoices, thermal bills, and audit records
                  </p>
                </div>
                <Button size="sm" variant="paper" className="text-xs font-bold rounded-xl flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Export GSTR-1 Excel
                </Button>
              </div>

              <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 border-b border-stone-200/60 text-stone-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Invoice #</th>
                      <th className="p-3">Table / Channel</th>
                      <th className="p-3">Payment Mode</th>
                      <th className="p-3">Subtotal</th>
                      <th className="p-3">GST (5%)</th>
                      <th className="p-3">Grand Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/60">
                    {orders.slice(0, 8).map((o) => (
                      <tr key={o.id} className="hover:hover:bg-stone-50/60">
                        <td className="p-3 font-mono font-bold text-stone-900">INV-2026-{o.orderNo}</td>
                        <td className="p-3">
                          <span className="font-bold text-stone-900">{o.customer.address || "Dine-In"}</span>
                        </td>
                        <td className="p-3 font-bold text-stone-900">{o.paymentMethod}</td>
                        <td className="p-3 font-mono">{formatRupees(o.pricing.subtotal)}</td>
                        <td className="p-3 font-mono text-stone-500">{formatRupees(o.pricing.tax.totalTax)}</td>
                        <td className="p-3 font-mono font-bold text-[#C83B1E]">{formatRupees(o.pricing.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 3.4 CUSTOMER CRM ================= */}
          {activeTab === "customer-crm" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">Customer Regulars & Loyalty Directory</h3>
                <p className="text-xs text-stone-500">
                  Track dine-in guest frequency, loyalty stamps, and average table spend
                </p>
              </div>

              <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 border-b border-stone-200/60 text-stone-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Regular Guest</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Cafe Visits</th>
                      <th className="p-3">Total Spend</th>
                      <th className="p-3">Stamp Card Status</th>
                      <th className="p-3">Favorite Order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/60">
                    {[
                      { name: "Aman Sharma", phone: "98765 43210", visits: 14, spend: "₹5,480", stamps: "7/8 (Ready for Free Meal)", fav: "Farmhouse Pizza + Cold Brew" },
                      { name: "Priya Patel", phone: "98261 11223", visits: 9, spend: "₹3,240", stamps: "5/8 Collected", fav: "Cheese Burger + Peri Fries" },
                      { name: "Rohit Verma", phone: "97554 99882", visits: 5, spend: "₹1,890", stamps: "3/8 Collected", fav: "Paneer Tikka Pizza" },
                    ].map((c, idx) => (
                      <tr key={idx} className="hover:hover:bg-stone-50/60">
                        <td className="p-3 font-bold text-stone-900">{c.name}</td>
                        <td className="p-3 font-mono text-stone-500">+91 {c.phone}</td>
                        <td className="p-3 font-mono font-bold text-stone-900">{c.visits} Times</td>
                        <td className="p-3 font-mono font-bold text-[#C83B1E]">{c.spend}</td>
                        <td className="p-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            {c.stamps}
                          </span>
                        </td>
                        <td className="p-3 text-stone-500">{c.fav}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 3.5 DINE-IN COUPONS & OFFERS ================= */}
          {activeTab === "coupons-offers" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-stone-900">
                    Dine-In Promo Codes & Happy Hours ({cafeCoupons.length})
                  </h3>
                  <p className="text-xs text-stone-500">
                    Manage table discounts, student passes, and happy hour discount codes
                  </p>
                </div>
                <Button
                  onClick={() => setShowAddCouponModal(true)}
                  className="bg-[#C83B1E] hover:bg-[#B33419] text-white text-xs font-bold px-4 py-2 h-auto rounded-xl flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </Button>
              </div>

              {/* Add Coupon Modal */}
              {showAddCouponModal && (
                <form
                  onSubmit={handleCreateCoupon}
                  className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                    <h4 className="font-bold text-sm text-stone-900">Add New Dine-In Promo Code</h4>
                    <button
                      type="button"
                      onClick={() => setShowAddCouponModal(false)}
                      className="p-1 rounded-lg hover:bg-stone-50 text-stone-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">Coupon Code</label>
                      <input
                        type="text"
                        placeholder="e.g. MONSOON20"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 uppercase font-mono font-bold focus:outline-none focus:border-[#C83B1E]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">Offer Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Monsoon Pizza Treat"
                        value={newCouponTitle}
                        onChange={(e) => setNewCouponTitle(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 focus:outline-none focus:border-[#C83B1E]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">Discount Type & Value</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={newCouponType}
                          onChange={(e) => setNewCouponType(e.target.value as "PERCENT" | "FLAT")}
                          className="text-xs p-2.5 rounded-xl border border-stone-200/80 bg-white font-medium focus:outline-none focus:border-[#C83B1E]"
                        >
                          <option value="PERCENT">Percentage (%)</option>
                          <option value="FLAT">Flat (₹)</option>
                        </select>
                        <input
                          type="number"
                          placeholder="10"
                          value={newCouponVal}
                          onChange={(e) => setNewCouponVal(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 focus:outline-none focus:border-[#C83B1E]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">Minimum Bill (₹)</label>
                      <input
                        type="number"
                        placeholder="499"
                        value={newCouponMin}
                        onChange={(e) => setNewCouponMin(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200/80 focus:outline-none focus:border-[#C83B1E]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-900 block mb-1">Applicable Channel</label>
                      <input
                        type="text"
                        readOnly
                        value="Table Dine-In & Counter Takeaway Only"
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200/60 bg-stone-50 text-stone-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAddCouponModal(false)}
                      className="text-xs font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#C83B1E] hover:bg-[#B33419] text-white text-xs font-bold px-4 py-2 h-auto rounded-xl"
                    >
                      Save & Activate Coupon
                    </Button>
                  </div>
                </form>
              )}

              {/* Coupons Table */}
              <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 border-b border-stone-200/60 text-stone-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Coupon Code</th>
                      <th className="p-3.5">Offer Title & Terms</th>
                      <th className="p-3.5">Discount</th>
                      <th className="p-3.5">Min Order</th>
                      <th className="p-3.5">Redemptions</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/60">
                    {cafeCoupons.map((coupon) => (
                      <tr key={coupon.code} className="hover:hover:bg-stone-50/60">
                        <td className="p-3.5">
                          <span className="font-mono font-semibold text-xs px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                            {coupon.code}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-stone-900">{coupon.title}</div>
                          <div className="text-[11px] text-stone-500">{coupon.desc}</div>
                        </td>
                        <td className="p-3.5 font-bold font-mono text-[#C83B1E]">
                          {coupon.type === "PERCENT" ? `${coupon.value}% OFF` : `₹${coupon.value} FLAT`}
                        </td>
                        <td className="p-3.5 font-mono text-stone-500">₹{coupon.minSpend}</td>
                        <td className="p-3.5 font-mono font-bold text-stone-900">{coupon.redemptions} times</td>
                        <td className="p-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              coupon.active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {coupon.active ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <Button
                            size="sm"
                            variant={coupon.active ? "paper" : "pepperoni"}
                            onClick={() => handleToggleCoupon(coupon.code)}
                            className="text-xs font-bold py-1 h-auto rounded-xl"
                          >
                            {coupon.active ? "Deactivate" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 3.6 REVIEWS & RATINGS ================= */}
          {activeTab === "reviews-ratings" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">Guest Reviews & Food Feedback</h3>
                <p className="text-xs text-stone-500">
                  Average cafe rating: 4.8/5 ★ across Google Maps and in-cafe guest feedback
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Rohit Sharma", rating: 5, date: "Today", text: "Best pizza in Jabalpur! Dough was super light and cheese pull was genuine mozzarella." },
                  { name: "Priya Patel", rating: 5, date: "Yesterday", text: "Loved their cozy cafe interior and thick cold coffee with brownie!" },
                  { name: "Dr. Aniruddh Verma", rating: 5, date: "2 days ago", text: "Booked Table 6 for family birthday. The staff was super polite and service was prompt." },
                ].map((r, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-stone-900">{r.name}</div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-stone-500 mt-1.5">{r.text}</p>
                    <div className="text-[10px] text-stone-400 font-mono mt-1">{r.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 4.1 ANALYTICS & TABLE TURNOVER ================= */}
          {activeTab === "analytics-reports" && (() => {
            const isToday = analyticsHorizon === "today";
            const currentTotalSales = analyticsHorizon === "today" 
              ? 28940 
              : analyticsHorizon === "yesterday" 
              ? 24180 
              : analyticsHorizon === "7d" 
              ? 195450 
              : 651600;
            const currentOrdersCount = analyticsHorizon === "today" 
              ? 84 
              : analyticsHorizon === "yesterday" 
              ? 74 
              : analyticsHorizon === "7d" 
              ? 593 
              : 1972;
            const currentAov = Math.round(currentTotalSales / currentOrdersCount);

            return (
              <div className="space-y-6">
                {/* Header & Controls Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-orange-100 text-[#C83B1E]">
                        <BarChart3 className="w-4 h-4" />
                      </span>
                      <h3 className="font-bold text-lg tracking-tight text-stone-900">
                        Business Intelligence &amp; Sales Analytics
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Live dining trends, peak revenue hours, menu profitability, and channel contributions
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Time Horizon Pills */}
                    <div className="p-1 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center text-xs">
                      {[
                        { id: "today", label: "Today (Hourly)" },
                        { id: "yesterday", label: "Yesterday" },
                        { id: "7d", label: "7 Days" },
                        { id: "30d", label: "30 Days" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setAnalyticsHorizon(tab.id as any)}
                          className={`px-3 py-1 rounded-lg font-medium transition-all ${
                            analyticsHorizon === tab.id
                              ? "bg-white text-stone-900 font-semibold shadow-xs"
                              : "text-stone-500 hover:text-stone-900"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <Button
                      onClick={() => alert("Sales Analytics Ledger downloaded in CSV format.")}
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold rounded-xl text-stone-700 border-stone-200 hover:bg-stone-50 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </Button>
                  </div>
                </div>

                {/* 4 Interactive KPI Metric Cards with Trends */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Revenue Card */}
                  <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:border-stone-300 transition-all group">
                    <div className="flex items-center justify-between text-stone-500 text-xs">
                      <span className="font-semibold uppercase text-[10px] tracking-wider text-stone-400">Total Revenue</span>
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Coins className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="font-bold text-2xl tracking-tight text-stone-900 mt-2 font-mono">
                      ₹{currentTotalSales.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-1.5">
                      <TrendingUp className="w-3 h-3" />
                      <span>+14.8% vs last period</span>
                    </div>
                  </div>

                  {/* Orders Card */}
                  <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:border-stone-300 transition-all group">
                    <div className="flex items-center justify-between text-stone-500 text-xs">
                      <span className="font-semibold uppercase text-[10px] tracking-wider text-stone-400">Orders Served</span>
                      <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#C83B1E] flex items-center justify-center font-bold">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="font-bold text-2xl tracking-tight text-stone-900 mt-2 font-mono">
                      {currentOrdersCount} Orders
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-stone-500 mt-1.5">
                      <span>Avg Ticket:</span>
                      <strong className="text-stone-900 font-mono">₹{currentAov} / order</strong>
                    </div>
                  </div>

                  {/* Table Turnover Card */}
                  <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:border-stone-300 transition-all group">
                    <div className="flex items-center justify-between text-stone-500 text-xs">
                      <span className="font-semibold uppercase text-[10px] tracking-wider text-stone-400">Table Dwell Time</span>
                      <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="font-bold text-2xl tracking-tight text-stone-900 mt-2">
                      41.5 Mins
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-1.5">
                      <TrendingUp className="w-3 h-3" />
                      <span>3.4 turns/table/day (Healthy)</span>
                    </div>
                  </div>

                  {/* Gross Margin Card */}
                  <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:border-stone-300 transition-all group">
                    <div className="flex items-center justify-between text-stone-500 text-xs">
                      <span className="font-semibold uppercase text-[10px] tracking-wider text-stone-400">Food Cost &amp; Margin</span>
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="font-bold text-2xl tracking-tight text-stone-900 mt-2">
                      73.6% <span className="text-xs font-normal text-stone-400">Margin</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-stone-500 mt-1.5">
                      <span>Food Cost:</span>
                      <strong className="text-emerald-700 font-semibold font-mono">26.4% (Target: &lt;28%)</strong>
                    </div>
                  </div>
                </div>

                {/* Hero Animated Revenue & Sales Trend Curve */}
                <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-base text-stone-900 tracking-tight flex items-center gap-2">
                        Sales Velocity &amp; Revenue Curve
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Live Data
                        </span>
                      </h4>
                      <p className="text-xs text-stone-500">
                        {isToday
                          ? "Real-time hourly dining trajectory (Peak Evening Rush highlighted)"
                          : `Comparative sales trajectory across ${analyticsHorizon === "7d" ? "last 7 days" : "last 30 days"}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <button
                        onClick={() => setAnalyticsMetric("sales")}
                        className={`px-3 py-1 rounded-lg font-semibold transition ${
                          analyticsMetric === "sales"
                            ? "bg-[#C83B1E] text-white shadow-xs"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        Revenue (₹)
                      </button>
                      <button
                        onClick={() => setAnalyticsMetric("orders")}
                        className={`px-3 py-1 rounded-lg font-semibold transition ${
                          analyticsMetric === "orders"
                            ? "bg-[#C83B1E] text-white shadow-xs"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        Order Count
                      </button>
                    </div>
                  </div>

                  {/* Recharts Area Chart with Gradient */}
                  <div className="h-[280px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={currentAnalyticsChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C83B1E" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#C83B1E" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="cogsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EB" vertical={false} />
                        <XAxis
                          dataKey="time"
                          stroke="#A8A29E"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#A8A29E"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => analyticsMetric === "sales" ? `₹${val}` : `${val}`}
                        />
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-stone-900 text-white text-xs rounded-xl p-3 shadow-xl border border-stone-800 space-y-1">
                                  <div className="font-semibold text-stone-400 text-[10px] uppercase">
                                    Time: {data.time}
                                  </div>
                                  <div className="font-bold text-sm text-[#FF8566] font-mono">
                                    Revenue: ₹{data.sales.toLocaleString()}
                                  </div>
                                  <div className="text-[11px] text-stone-300">
                                    Orders: <strong className="text-white">{data.orders}</strong>
                                  </div>
                                  <div className="text-[10px] text-stone-400 pt-0.5 border-t border-stone-800 flex justify-between gap-3">
                                    <span>Food Cost (COGS):</span>
                                    <span className="font-mono text-purple-300">₹{data.cogs}</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey={analyticsMetric === "sales" ? "sales" : "orders"}
                          stroke="#C83B1E"
                          strokeWidth={2.5}
                          fill="url(#salesGrad)"
                          dot={{ r: 3, fill: "#C83B1E", strokeWidth: 2, stroke: "#fff" }}
                          activeDot={{ r: 6, fill: "#C83B1E", strokeWidth: 3, stroke: "#fff" }}
                          isAnimationActive={true}
                          animationDuration={1200}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Peak Hours Annotation Bar */}
                  <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-orange-50/70 border border-orange-200/60 text-xs">
                    <div className="flex items-center gap-2 text-orange-950 font-medium">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C83B1E]"></span>
                      </span>
                      <span>Peak Dine-In Hours: <strong>7:30 PM – 10:15 PM</strong> (Avg ₹2,800/hr)</span>
                    </div>
                    <span className="text-[11px] text-stone-500 font-mono">
                      Kitchen Turnaround: 12.5 mins • 100% Floor Utilization
                    </span>
                  </div>
                </div>

                {/* 2-Column Middle Row: Category Share Donut + Hourly Heatmap */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Category Revenue Donut Chart (5 cols) */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 tracking-tight">
                          Category Revenue Share
                        </h4>
                        <p className="text-[11px] text-stone-500">Sales distribution across menu departments</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        Top: Pizza 42%
                      </span>
                    </div>

                    <div className="h-[200px] w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryShareData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            isAnimationActive={true}
                            animationDuration={1000}
                          >
                            {categoryShareData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-stone-900 text-white text-xs rounded-xl p-2.5 shadow-xl border border-stone-800 space-y-0.5">
                                    <div className="font-bold text-xs" style={{ color: data.color }}>
                                      {data.name}
                                    </div>
                                    <div className="text-[11px] font-mono">
                                      Revenue: ₹{data.revenue.toLocaleString()} ({data.value}%)
                                    </div>
                                    <div className="text-[10px] text-stone-400">
                                      Gross Margin: <strong className="text-emerald-400">{data.margin}</strong>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Category Legend list */}
                    <div className="space-y-2 pt-1 border-t border-stone-100 text-xs">
                      {categoryShareData.map((cat) => (
                        <div key={cat.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="text-stone-700 font-medium">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-stone-500 text-[11px]">₹{cat.revenue.toLocaleString()}</span>
                            <span className="font-semibold text-stone-900 w-8 text-right">{cat.value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hourly Table Occupancy & Turnover Heatmap (7 cols) */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 tracking-tight">
                          Floor Traffic &amp; Peak Hour Heatmap
                        </h4>
                        <p className="text-[11px] text-stone-500">Hourly guest inflow and table occupancy rate</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Peak: 8 PM (100%)
                      </span>
                    </div>

                    <div className="h-[200px] w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { hour: "11 AM", occupancy: 20 },
                            { hour: "12 PM", occupancy: 45 },
                            { hour: "1 PM", occupancy: 70 },
                            { hour: "2 PM", occupancy: 80 },
                            { hour: "3 PM", occupancy: 40 },
                            { hour: "4 PM", occupancy: 35 },
                            { hour: "5 PM", occupancy: 55 },
                            { hour: "6 PM", occupancy: 75 },
                            { hour: "7 PM", occupancy: 90 },
                            { hour: "8 PM", occupancy: 100 },
                            { hour: "9 PM", occupancy: 95 },
                            { hour: "10 PM", occupancy: 65 },
                          ]}
                          margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EB" vertical={false} />
                          <XAxis dataKey="hour" stroke="#A8A29E" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#A8A29E" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-stone-900 text-white text-xs rounded-xl p-2.5 shadow-xl border border-stone-800 space-y-0.5">
                                    <div className="text-[10px] text-stone-400">{data.hour} Service</div>
                                    <div className="font-bold text-[#FF8566]">
                                      Floor Occupancy: {data.occupancy}%
                                    </div>
                                    <div className="text-[10px] text-stone-300">
                                      {data.occupancy >= 90 ? "🔥 Maximum Rush" : data.occupancy >= 60 ? "⚡ Moderate Flow" : "○ Low Activity"}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar
                            dataKey="occupancy"
                            fill="#C83B1E"
                            radius={[4, 4, 0, 0]}
                            isAnimationActive={true}
                            animationDuration={1000}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Operational Insights Footer */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-center">
                      <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">Avg Table Stay</span>
                        <strong className="text-xs font-bold text-stone-900">41.5 Mins</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">Kitchen Speed</span>
                        <strong className="text-xs font-bold text-emerald-700">12.5 Mins</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">Payment Speed</span>
                        <strong className="text-xs font-bold text-stone-900">45 Secs (UPI)</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Channel Mix & Top 5 Menu Champions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Channel Breakdown (5 cols) */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 tracking-tight">
                        Revenue Channels Breakdown
                      </h4>
                      <p className="text-[11px] text-stone-500">Sales generated via different cafe touchpoints</p>
                    </div>

                    <div className="space-y-3">
                      {channelSplitData.map((ch) => (
                        <div key={ch.channel} className="space-y-1.5 p-3 rounded-xl bg-stone-50 border border-stone-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-stone-900">{ch.channel}</span>
                            <span className="font-mono font-bold text-stone-800">
                              ₹{ch.amount.toLocaleString()} <span className="text-stone-400 font-normal">({ch.percentage}%)</span>
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${ch.color} rounded-full transition-all duration-700`}
                              style={{ width: `${ch.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Selling Menu Stars Leaderboard (7 cols) */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 tracking-tight">
                          Top 5 Menu Champions Leaderboard
                        </h4>
                        <p className="text-[11px] text-stone-500">Highest volume &amp; high gross-margin contributors</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Ranked by Profit
                      </span>
                    </div>

                    <div className="space-y-2">
                      {topSellingMenuChampions.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-stone-100 hover:border-stone-200 bg-stone-50/50 hover:bg-white transition-all text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <span className="font-mono font-bold text-xs w-6 h-6 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0">
                              {item.rank}
                            </span>
                            <div className="truncate">
                              <p className="font-bold text-stone-900 truncate">{item.name}</p>
                              <span className="text-[11px] text-stone-500">
                                {item.sold} sold today • <strong className="text-emerald-700 font-semibold">{item.margin}% Margin</strong>
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-mono font-bold text-stone-900">
                              ₹{item.revenue.toLocaleString()}
                            </div>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-[#C83B1E]">
                              {item.tag}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ================= 4.2 STAFF PINS & SHIFTS ================= */}
          {activeTab === "staff-pins" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">Staff Access PINs & Duty Shifts</h3>
                <p className="text-xs text-stone-500">
                  Role-based security PINs for Touch POS, Floor Waiter tablet, and Kitchen KDS
                </p>
              </div>

              <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 border-b border-stone-200/60 text-stone-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Staff Member</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Touch PIN</th>
                      <th className="p-3">Duty Shift</th>
                      <th className="p-3">Live Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/60">
                    {[
                      { name: "Rahul Sharma", role: "Store Manager", pin: "1234", shift: "Morning / Evening", status: "On Duty" },
                      { name: "Aakash Gupta", role: "Cashier (POS)", pin: "2345", shift: "Counter Shift A", status: "On Duty" },
                      { name: "Vikas Ahirwar", role: "Floor Server", pin: "3456", shift: "Tables 1-8", status: "On Duty" },
                      { name: "Manoj Sen", role: "Head Pizza Chef", pin: "4567", shift: "Stone Oven & Fryer", status: "On Duty" },
                    ].map((s, idx) => (
                      <tr key={idx} className="hover:hover:bg-stone-50/60">
                        <td className="p-3 font-bold text-stone-900">{s.name}</td>
                        <td className="p-3 font-bold text-[#C83B1E]">{s.role}</td>
                        <td className="p-3 font-mono text-stone-400">•••• ({s.pin})</td>
                        <td className="p-3 text-stone-500">{s.shift}</td>
                        <td className="p-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 4.3 HARDWARE & PRINTER SETTINGS ================= */}
          {activeTab === "hardware-settings" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">Thermal Receipt Printer & Audio Chimes</h3>
                <p className="text-xs text-stone-500">
                  ESC/POS thermal printer baud rates, automatic cutter, and kitchen audio alerts
                </p>
              </div>

              <div className="bg-white rounded-xl border border-stone-200/80 p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                  <div>
                    <div className="font-bold text-xs text-stone-900">Thermal Receipt Printer (ESC/POS 80mm)</div>
                    <div className="text-[11px] text-stone-500">Connected via USB / LAN at Counter</div>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    EPSON TM-T82 (READY)
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                  <div>
                    <div className="font-bold text-xs text-stone-900">Kitchen Audio Buzzer on New QR Order</div>
                    <div className="text-[11px] text-stone-500">Plays pleasant chime when guest places order from Table QR</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    ENABLED
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-stone-900">Target Table Prep Duration</div>
                    <div className="text-[11px] text-stone-500">Stone oven target time before auto-alerting manager</div>
                  </div>
                  <span className="font-mono text-xs font-bold bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200/80">
                    15 Minutes
                  </span>
                </div>
              </div>
            </div>
          )}
        
      {/* ================= THERMAL TAX INVOICE POPUP MODAL ================= */}
      {activeBillModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="font-semibold text-sm text-stone-900 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#C83B1E]" />
                <span>GST Thermal Tax Invoice</span>
              </div>
              <button
                onClick={() => setActiveBillModalOrder(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 80mm Thermal Bill Slip */}
            <div className="my-4 p-4 rounded-xl bg-stone-50 border border-stone-200 font-mono text-[11px] text-stone-900 space-y-1.5 leading-tight">
              <div className="text-center font-bold text-sm text-stone-950">7 BITES CAFÉ & PIZZERIA</div>
              <div className="text-center text-[10px] text-stone-500">Gohalpur Amkhera, Jagriti Nagar, Jabalpur, M.P. 482001</div>
              <div className="text-center text-[10px] text-stone-500">GSTIN: 23ABCDE1234F1Z5 · FSSAI: 11424850000123</div>
              <div className="border-b border-dashed border-stone-300 my-2" />
              <div className="flex justify-between">
                <span>Bill #: INV-2026-{activeBillModalOrder.orderNo}</span>
                <span>KOT: #{activeBillModalOrder.orderNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Date: {new Date(activeBillModalOrder.createdAt).toLocaleDateString("en-IN")}</span>
                <span>Time: {new Date(activeBillModalOrder.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>Guest: <strong>{activeBillModalOrder.customer.name}</strong></span>
                <span>Ph: {activeBillModalOrder.customer.phone}</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>Channel: <strong>{activeBillModalOrder.customer.tableNo || activeBillModalOrder.type}</strong></span>
                <span className="text-emerald-700 font-bold">PAID ({activeBillModalOrder.paymentMethod})</span>
              </div>
              <div className="border-b border-dashed border-stone-300 my-2" />
              {/* Itemized Table */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-stone-500 uppercase">
                  <span>Item</span>
                  <span>Qty × Rate</span>
                  <span>Amt</span>
                </div>
                {activeBillModalOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate max-w-[140px]">{it.name}</span>
                    <span>{it.qty} × ₹{Math.round(it.unitPrice / 100)}</span>
                    <span>₹{Math.round((it.unitPrice * it.qty) / 100)}</span>
                  </div>
                ))}
              </div>
              <div className="border-b border-dashed border-stone-300 my-2" />
              <div className="flex justify-between font-bold">
                <span>Subtotal:</span>
                <span>{formatRupees(activeBillModalOrder.pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-stone-600">
                <span>CGST (2.5%):</span>
                <span>{formatRupees(Math.round(activeBillModalOrder.pricing.tax.totalTax / 2))}</span>
              </div>
              <div className="flex justify-between text-[10px] text-stone-600">
                <span>SGST (2.5%):</span>
                <span>{formatRupees(Math.round(activeBillModalOrder.pricing.tax.totalTax / 2))}</span>
              </div>
              <div className="border-b border-dashed border-stone-300 my-2" />
              <div className="flex justify-between font-bold text-xs text-[#C83B1E]">
                <span>GRAND TOTAL:</span>
                <span>{formatRupees(activeBillModalOrder.pricing.total)}</span>
              </div>
              <div className="border-b border-dashed border-stone-300 my-2" />
              <div className="text-center text-[10px] text-stone-500 pt-1">
                *** Thank you for dining with us! ***
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => window.print()}
                className="flex-1 bg-stone-900 hover:bg-black text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Thermal Bill
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveBillModalOrder(null)}
                className="text-xs font-semibold py-2 rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

        </main>
      </div>
    </div>
  );
}
