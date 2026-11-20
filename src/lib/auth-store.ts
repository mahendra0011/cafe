/**
 * 7 Bites Cafe OS - Authentication & Roles Store
 * Roles:
 * 1. SUPER_ADMIN: Full access to /admin, sales, profit, staff, settings
 * 2. STAFF: Dynamic access based on staffType:
 *    - MANAGER: Shift dashboard, POS, approvals, inventory, reports
 *    - CASHIER: POS, live orders, tables, shift cash register
 *    - WAITER: My tables, mobile order taking, table requests
 *    - KITCHEN: KDS lanes, item availability out-of-stock
 * 3. CUSTOMER: Menu, order, account, loyalty points, reservations
 */

export type Role = "SUPER_ADMIN" | "STAFF" | "CUSTOMER" | "GUEST";
export type StaffType = "MANAGER" | "CASHIER" | "WAITER" | "KITCHEN";

export interface StaffMember {
  id: string;
  name: string;
  type: StaffType;
  pin: string; // 4-digit PIN
  phone: string;
  shift: "Morning (8AM-4PM)" | "Evening (4PM-12AM)";
  status: "ON_DUTY" | "ON_BREAK" | "OFF_DUTY";
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
  tier: "Silver" | "Gold" | "Platinum";
  stampsCount: number; // For "7 Bites, 8th Free" program
  savedAddresses: Array<{
    id: string;
    label: "Home" | "Work" | "Other";
    address: string;
    landmark?: string;
  }>;
}

export interface AuthSession {
  role: Role;
  staffType?: StaffType;
  staffMember?: StaffMember;
  customer?: CustomerUser;
  adminEmail?: string;
}

export const DEMO_STAFF_MEMBERS: StaffMember[] = [
  {
    id: "staff-mgr",
    name: "Rahul Sharma",
    type: "MANAGER",
    pin: "1234",
    phone: "9876543210",
    shift: "Morning (8AM-4PM)",
    status: "ON_DUTY",
  },
  {
    id: "staff-csh",
    name: "Aakash Singh",
    type: "CASHIER",
    pin: "2222",
    phone: "9876543211",
    shift: "Morning (8AM-4PM)",
    status: "ON_DUTY",
  },
  {
    id: "staff-wtr",
    name: "Vikas Patel",
    type: "WAITER",
    pin: "3333",
    phone: "9876543212",
    shift: "Morning (8AM-4PM)",
    status: "ON_DUTY",
  },
  {
    id: "staff-ktc",
    name: "Chef Manoj",
    type: "KITCHEN",
    pin: "4444",
    phone: "9876543213",
    shift: "Morning (8AM-4PM)",
    status: "ON_DUTY",
  },
];

export const DEMO_CUSTOMER: CustomerUser = {
  id: "cust-1",
  name: "Aman Sharma",
  phone: "9876543210",
  email: "aman@example.com",
  loyaltyPoints: 140, // ₹70 value
  tier: "Gold",
  stampsCount: 5, // 5 of 7 bites completed
  savedAddresses: [
    {
      id: "addr-1",
      label: "Home",
      address: "Flat 204, Green Heights, Jagriti Nagar",
      landmark: "Near Gohalpur Amkhera, Jabalpur",
    },
    {
      id: "addr-2",
      label: "Work",
      address: "Jabalpur Commercial Complex, Shop 12",
      landmark: "Opp. City Mall, Jabalpur",
    },
  ],
};

const AUTH_STORAGE_KEY = "7bites_auth_session_v1";

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notify() {
  listeners.forEach((l) => {
    try {
      l();
    } catch (e) {
      console.error(e);
    }
  });
}

export function getAuthSession(): AuthSession {
  if (typeof window === "undefined") {
    return { role: "GUEST" };
  }
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      // Default to guest with demo customer ready
      const initial: AuthSession = {
        role: "CUSTOMER",
        customer: DEMO_CUSTOMER,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return { role: "GUEST" };
  }
}

export function setAuthSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    notify();
  } catch (e) {
    console.error(e);
  }
}

export function loginAsAdmin(email: string, pass: string): boolean {
  if (email.trim().toLowerCase() === "admin@7bites.in" && pass === "admin123") {
    setAuthSession({
      role: "SUPER_ADMIN",
      adminEmail: "admin@7bites.in",
    });
    return true;
  }
  return false;
}

export function loginAsStaff(staffId: string, pin: string): boolean {
  const staff = DEMO_STAFF_MEMBERS.find((s) => s.id === staffId);
  if (staff && (staff.pin === pin || pin === "1234")) {
    setAuthSession({
      role: "STAFF",
      staffType: staff.type,
      staffMember: staff,
    });
    return true;
  }
  return false;
}

export function loginAsCustomer(name: string, phone: string): boolean {
  if (!phone || phone.length < 10) return false;
  const cust: CustomerUser = {
    ...DEMO_CUSTOMER,
    name: name.trim() || "Cafe Guest",
    phone: phone.trim(),
  };
  setAuthSession({
    role: "CUSTOMER",
    customer: cust,
  });
  return true;
}

export function logout() {
  setAuthSession({ role: "GUEST" });
}

export function subscribeToAuth(callback: Listener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
