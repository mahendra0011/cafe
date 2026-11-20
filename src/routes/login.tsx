import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  loginAsAdmin,
  loginAsCustomer,
} from "@/lib/auth-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In | 7 Bites Cafe OS" },
      {
        name: "description",
        content: "Access portal for User Account Dashboard and Cafe Super Admin.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  // Only 2 dedicated portals: Customer (User Dashboard) and Super Admin (Admin Dashboard)
  const [roleTab, setRoleTab] = useState<"customer" | "admin">("customer");

  // Customer State
  const [custName, setCustName] = useState("Aman Sharma");
  const [custPhone, setCustPhone] = useState("9876543210");
  const [custOtp, setCustOtp] = useState("7777");

  // Admin State
  const [adminEmail, setAdminEmail] = useState("admin@7bites.in");
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [adminError, setAdminError] = useState("");

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custPhone || custPhone.length < 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    loginAsCustomer(custName || "Aman Sharma", custPhone);
    navigate({ to: "/account" });
  };

  const handleQuickCustomerLogin = () => {
    loginAsCustomer("Aman Sharma", "9876543210");
    navigate({ to: "/account" });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAsAdmin(adminEmail, adminPassword);
    if (success) {
      navigate({ to: "/admin" });
    } else {
      setAdminError("Invalid credentials. Try: admin@7bites.in / admin123");
    }
  };

  const handleQuickAdminLogin = () => {
    loginAsAdmin("admin@7bites.in", "admin123");
    navigate({ to: "/admin" });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 flex flex-col font-sans antialiased selection:bg-[#C83B1E]/15 selection:text-[#C83B1E]">
      {/* Clean Top Navigation Bar */}
      <header className="px-6 py-4 border-b border-stone-200/80 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cafe</span>
        </Link>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#C83B1E] text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs">
            7B
          </div>
          <span className="font-semibold text-sm tracking-tight text-stone-900">
            7 Bites Cafe
          </span>
        </Link>
        <span className="text-[11px] font-medium text-stone-400">
          OS v2.4
        </span>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[420px] bg-white rounded-2xl border border-stone-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          {/* Refined Pill-Style Role Selector */}
          <div className="p-3 bg-stone-50/70 border-b border-stone-200/80">
            <div className="grid grid-cols-2 p-1 bg-stone-200/60 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setRoleTab("customer")}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  roleTab === "customer"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <User className={`w-3.5 h-3.5 ${roleTab === "customer" ? "text-[#C83B1E]" : "text-stone-400"}`} />
                <span>User Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => setRoleTab("admin")}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  roleTab === "admin"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${roleTab === "admin" ? "text-[#C83B1E]" : "text-stone-400"}`} />
                <span>Admin Portal</span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            {/* ================= 1. CUSTOMER / USER DASHBOARD LOGIN ================= */}
            {roleTab === "customer" && (
              <form onSubmit={handleCustomerLogin} className="space-y-4">
                <div className="text-center pb-1">
                  <h2 className="text-lg font-semibold tracking-tight text-stone-900">
                    Welcome to 7 Bites
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Sign in to view orders, table bookings & loyalty rewards
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1.5">
                      Your Full Name
                    </label>
                    <div className="flex items-center gap-2.5 border border-stone-200 rounded-xl px-3.5 py-2.5 bg-stone-50/50 focus-within:bg-white focus-within:border-[#C83B1E] focus-within:ring-2 focus-within:ring-[#C83B1E]/10 transition-all">
                      <User className="w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="Aman Sharma"
                        className="flex-1 bg-transparent text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1.5">
                      Mobile Number
                    </label>
                    <div className="flex items-center gap-2 border border-stone-200 rounded-xl px-3.5 py-2.5 bg-stone-50/50 focus-within:bg-white focus-within:border-[#C83B1E] focus-within:ring-2 focus-within:ring-[#C83B1E]/10 transition-all">
                      <Phone className="w-4 h-4 text-stone-400" />
                      <span className="text-xs text-stone-400 font-medium">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="98765 43210"
                        className="flex-1 bg-transparent text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1.5">
                      One-Time Password (OTP)
                    </label>
                    <div className="flex items-center gap-2.5 border border-stone-200 rounded-xl px-3.5 py-2.5 bg-stone-50/50 focus-within:bg-white focus-within:border-[#C83B1E] focus-within:ring-2 focus-within:ring-[#C83B1E]/10 transition-all">
                      <Lock className="w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        value={custOtp}
                        onChange={(e) => setCustOtp(e.target.value)}
                        placeholder="7777"
                        className="flex-1 bg-transparent text-xs text-stone-900 focus:outline-none font-mono"
                      />
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        Demo: 7777
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-2.5 h-auto bg-[#C83B1E] hover:bg-[#B33419] text-white font-medium text-xs rounded-xl shadow-xs transition mt-2"
                >
                  Enter User Dashboard →
                </Button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleQuickCustomerLogin}
                    className="w-full py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-medium text-stone-700 transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quick Demo Login (Aman Sharma)</span>
                  </button>
                </div>
              </form>
            )}

            {/* ================= 2. SUPER ADMIN DASHBOARD LOGIN ================= */}
            {roleTab === "admin" && (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="text-center pb-1">
                  <h2 className="text-lg font-semibold tracking-tight text-stone-900">
                    Cafe Operations Admin
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Manage 12-table floor plan, live KDS, inventory & GST
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1.5">
                      Administrator Email
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@7bites.in"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 focus:bg-white focus:border-[#C83B1E] focus:ring-2 focus:ring-[#C83B1E]/10 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 focus:bg-white focus:border-[#C83B1E] focus:ring-2 focus:ring-[#C83B1E]/10 focus:outline-none transition-all"
                    />
                  </div>

                  {adminError && (
                    <div className="text-xs text-rose-600 font-medium">
                      {adminError}
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 space-y-0.5">
                    <div className="font-semibold text-amber-950">Demo Credentials:</div>
                    <div className="text-stone-600">Email: <span className="font-mono text-stone-900">admin@7bites.in</span></div>
                    <div className="text-stone-600">Password: <span className="font-mono text-stone-900">admin123</span></div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-2.5 h-auto bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-xl shadow-xs transition mt-2"
                >
                  Unlock Admin Dashboard →
                </Button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleQuickAdminLogin}
                    className="w-full py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-medium text-stone-700 transition flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C83B1E]" />
                    <span>Quick Demo Login (Super Admin)</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-stone-50/70 px-6 py-3 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500">
            <span>7 Bites Cafe & Pizzeria</span>
            <span className="font-medium text-stone-400">Offline OS</span>
          </div>
        </div>
      </main>
    </div>
  );
}
