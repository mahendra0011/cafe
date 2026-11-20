import { type Paise, toPaise } from "./money";
import {
  calculateOrderPrice,
  type CartItem,
  type OrderType,
  type PricingBreakdown,
} from "./pricing-service";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PLACED"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "UPI" | "CASH" | "CARD" | "PAY_AT_COUNTER";
export type PaymentStatus = "PAID" | "PENDING";

export interface OrderCustomer {
  name: string;
  phone: string;
  address?: string;
  tableNo?: string;
  notes?: string;
}

export interface OrderEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface CafeOrder {
  id: string;
  publicId: string;
  orderNo: number;
  type: OrderType;
  status: OrderStatus;
  customer: OrderCustomer;
  items: CartItem[];
  pricing: PricingBreakdown;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  estimatedMinutes: number;
  events: OrderEvent[];
}

export interface TableCallRequest {
  id: string;
  tableNo: string;
  type: "CALL_WAITER" | "BILL_REQUEST";
  timestamp: string;
  status: "PENDING" | "RESOLVED";
  note?: string;
}

const STORAGE_KEYS = {
  CART: "7bites_cart_v1",
  ORDER_TYPE: "7bites_order_type_v1",
  COUPON: "7bites_coupon_v1",
  ORDERS: "7bites_orders_v1",
  TABLE_CALLS: "7bites_table_calls_v1",
  DAILY_COUNTER: "7bites_daily_counter_v1",
};

// Initial Seed Orders for Instant Testing & Demo
const SEED_ORDERS: CafeOrder[] = [
  {
    id: "ord_101",
    publicId: "7B-9810A",
    orderNo: 41,
    type: "DINE_IN",
    status: "PREPARING",
    customer: { name: "Aman Sharma", phone: "9876543210", tableNo: "T4" },
    items: [
      {
        id: "seed-1",
        itemId: "farmhouse-feast-pizza",
        name: "Farmhouse Feast Pizza",
        foodType: "veg",
        size: "Medium",
        unitPrice: toPaise(329),
        qty: 1,
        addOns: [{ id: "c1", name: "Extra Mozzarella", price: toPaise(40) }],
      },
      {
        id: "seed-2",
        itemId: "signature-cold-coffee",
        name: "Signature Cold Coffee",
        foodType: "veg",
        unitPrice: toPaise(129),
        qty: 2,
      },
    ],
    pricing: calculateOrderPrice({
      items: [
        {
          id: "seed-1",
          itemId: "farmhouse-feast-pizza",
          name: "Farmhouse Feast Pizza",
          foodType: "veg",
          size: "Medium",
          unitPrice: toPaise(329),
          qty: 1,
          addOns: [{ id: "c1", name: "Extra Mozzarella", price: toPaise(40) }],
        },
        {
          id: "seed-2",
          itemId: "signature-cold-coffee",
          name: "Signature Cold Coffee",
          foodType: "veg",
          unitPrice: toPaise(129),
          qty: 2,
        },
      ],
      orderType: "DINE_IN",
    }),
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    estimatedMinutes: 15,
    events: [
      { status: "PLACED", timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
      { status: "CONFIRMED", timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString() },
      { status: "PREPARING", timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), note: "Stone oven baking" },
    ],
  },
  {
    id: "ord_102",
    publicId: "7B-4421B",
    orderNo: 42,
    type: "DELIVERY",
    status: "CONFIRMED",
    customer: {
      name: "Priya Verma",
      phone: "9123456780",
      address: "Flat 204, Green Heights, Jagriti Nagar, Jabalpur",
    },
    items: [
      {
        id: "seed-3",
        itemId: "paneer-tikka-burger",
        name: "Crispy Paneer Supreme Burger",
        foodType: "veg",
        unitPrice: toPaise(179),
        qty: 2,
      },
      {
        id: "seed-4",
        itemId: "peri-peri-fries",
        name: "Spicy Peri-Peri Crinkle Fries",
        foodType: "veg",
        unitPrice: toPaise(119),
        qty: 1,
      },
    ],
    pricing: calculateOrderPrice({
      items: [
        {
          id: "seed-3",
          itemId: "paneer-tikka-burger",
          name: "Crispy Paneer Supreme Burger",
          foodType: "veg",
          unitPrice: toPaise(179),
          qty: 2,
        },
        {
          id: "seed-4",
          itemId: "peri-peri-fries",
          name: "Spicy Peri-Peri Crinkle Fries",
          foodType: "veg",
          unitPrice: toPaise(119),
          qty: 1,
        },
      ],
      orderType: "DELIVERY",
      couponCode: "FLAT50",
    }),
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    estimatedMinutes: 25,
    events: [
      { status: "PLACED", timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString() },
      { status: "CONFIRMED", timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString() },
    ],
  },
];

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error(e);
    }
  });
}

function safeGetJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSetJSON(key: string, val: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
    notify();
  } catch (e) {
    console.error(e);
  }
}

// ================= CART OPERATIONS =================

export function getCartItems(): CartItem[] {
  return safeGetJSON<CartItem[]>(STORAGE_KEYS.CART, []);
}

export function setCartItems(items: CartItem[]) {
  safeSetJSON(STORAGE_KEYS.CART, items);
}

export function getSelectedOrderType(): OrderType {
  return safeGetJSON<OrderType>(STORAGE_KEYS.ORDER_TYPE, "PICKUP");
}

export function setSelectedOrderType(type: OrderType) {
  safeSetJSON(STORAGE_KEYS.ORDER_TYPE, type);
}

export function getAppliedCoupon(): string {
  return safeGetJSON<string>(STORAGE_KEYS.COUPON, "");
}

export function setAppliedCoupon(code: string) {
  safeSetJSON(STORAGE_KEYS.COUPON, code.trim().toUpperCase());
}

export function addToCart(
  item: Omit<CartItem, "id"> & { id?: string }
): CartItem[] {
  const current = getCartItems();
  const cartItemId =
    item.id ||
    `${item.itemId}-${item.size || "reg"}-${(item.addOns || [])
      .map((a) => a.id)
      .sort()
      .join("_")}`;

  const existingIndex = current.findIndex((c) => c.id === cartItemId);
  if (existingIndex > -1) {
    current[existingIndex].qty += item.qty;
  } else {
    current.push({ ...item, id: cartItemId });
  }
  setCartItems(current);
  return current;
}

export function updateCartItemQty(cartItemId: string, newQty: number) {
  let current = getCartItems();
  if (newQty <= 0) {
    current = current.filter((c) => c.id !== cartItemId);
  } else {
    current = current.map((c) =>
      c.id === cartItemId ? { ...c, qty: newQty } : c
    );
  }
  setCartItems(current);
}

export function clearCart() {
  setCartItems([]);
  setAppliedCoupon("");
}

// ================= ORDER OPERATIONS =================

export function getOrders(): CafeOrder[] {
  const stored = safeGetJSON<CafeOrder[]>(STORAGE_KEYS.ORDERS, []);
  if (stored.length === 0) {
    safeSetJSON(STORAGE_KEYS.ORDERS, SEED_ORDERS);
    return SEED_ORDERS;
  }
  return stored;
}

export function getOrder(publicId: string): CafeOrder | undefined {
  const orders = getOrders();
  return orders.find(
    (o) => o.publicId.toLowerCase() === publicId.toLowerCase()
  );
}

export function getNextOrderNo(): number {
  const current = safeGetJSON<number>(STORAGE_KEYS.DAILY_COUNTER, 42);
  const next = current + 1;
  safeSetJSON(STORAGE_KEYS.DAILY_COUNTER, next);
  return next;
}

export function placeOrder(params: {
  customer: OrderCustomer;
  orderType: OrderType;
  items?: CartItem[];
  couponCode?: string;
  paymentMethod: PaymentMethod;
}): CafeOrder {
  const items = params.items || getCartItems();
  if (items.length === 0) {
    throw new Error("Cart is empty");
  }

  const pricing = calculateOrderPrice({
    items,
    orderType: params.orderType,
    couponCode: params.couponCode || getAppliedCoupon(),
  });

  const orderNo = getNextOrderNo();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const publicId = `7B-${orderNo}${randomSuffix}`;

  const newOrder: CafeOrder = {
    id: `ord_${Date.now()}`,
    publicId,
    orderNo,
    type: params.orderType,
    status: "PLACED",
    customer: params.customer,
    items,
    pricing,
    paymentMethod: params.paymentMethod,
    paymentStatus: params.paymentMethod === "UPI" ? "PAID" : "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedMinutes: params.orderType === "DELIVERY" ? 30 : 15,
    events: [
      {
        status: "PLACED",
        timestamp: new Date().toISOString(),
        note: `Order received via ${params.orderType}`,
      },
    ],
  };

  const existingOrders = getOrders();
  const updated = [newOrder, ...existingOrders];
  safeSetJSON(STORAGE_KEYS.ORDERS, updated);

  // Clear cart if this was user's active cart
  if (!params.items) {
    clearCart();
  }

  return newOrder;
}

export function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string
): CafeOrder | undefined {
  const orders = getOrders();
  const index = orders.findIndex(
    (o) => o.id === orderId || o.publicId === orderId
  );
  if (index === -1) return undefined;

  const target = orders[index];
  const updatedEvents: OrderEvent[] = [
    ...target.events,
    { status: newStatus, timestamp: new Date().toISOString(), note },
  ];

  const updatedOrder: CafeOrder = {
    ...target,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    events: updatedEvents,
    paymentStatus:
      newStatus === "COMPLETED" ? "PAID" : target.paymentStatus,
  };

  orders[index] = updatedOrder;
  safeSetJSON(STORAGE_KEYS.ORDERS, orders);
  return updatedOrder;
}

// ================= TABLE DINING CALLS =================

export function getTableCalls(): TableCallRequest[] {
  return safeGetJSON<TableCallRequest[]>(STORAGE_KEYS.TABLE_CALLS, []);
}

export function createTableCall(tableNo: string, type: "CALL_WAITER" | "BILL_REQUEST", note?: string) {
  const calls = getTableCalls();
  const newCall: TableCallRequest = {
    id: `call_${Date.now()}`,
    tableNo,
    type,
    timestamp: new Date().toISOString(),
    status: "PENDING",
    note,
  };
  safeSetJSON(STORAGE_KEYS.TABLE_CALLS, [newCall, ...calls]);
}

export function resolveTableCall(id: string) {
  const calls = getTableCalls();
  const updated = calls.map((c) =>
    c.id === id ? { ...c, status: "RESOLVED" as const } : c
  );
  safeSetJSON(STORAGE_KEYS.TABLE_CALLS, updated);
}

// React Hook helper for components to re-render on store updates
export function subscribeToStore(callback: Listener): () => void {
  listeners.add(callback);
  const storageHandler = () => callback();
  if (typeof window !== "undefined") {
    window.addEventListener("storage", storageHandler);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", storageHandler);
    }
  };
}
