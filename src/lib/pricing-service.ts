import { type Paise, toPaise } from "./money";

export interface CartAddon {
  id: string;
  name: string;
  price: Paise; // in paise
}

export interface CartItem {
  id: string;
  itemId: string;
  name: string;
  image?: string;
  foodType: "veg" | "non-veg" | "egg";
  size?: string;
  unitPrice: Paise; // in paise
  qty: number;
  addOns?: CartAddon[];
  specialNote?: string;
}

export type OrderType = "PICKUP" | "DELIVERY" | "DINE_IN";

export interface PricingInput {
  items: CartItem[];
  orderType: OrderType;
  couponCode?: string;
}

export interface TaxBreakup {
  cgstRate: number; // e.g. 0.025 (2.5%)
  cgstAmount: Paise;
  sgstRate: number; // e.g. 0.025 (2.5%)
  sgstAmount: Paise;
  totalTax: Paise;
}

export interface PricingBreakdown {
  subtotal: Paise;
  discount: Paise;
  discountCode?: string;
  taxableAmount: Paise;
  tax: TaxBreakup;
  packagingFee: Paise;
  deliveryFee: Paise;
  roundOff: Paise;
  total: Paise;
  itemCount: number;
}

// Available promo coupons
export const VALID_COUPONS: Record<
  string,
  {
    type: "PERCENT" | "FLAT";
    value: number; // percentage or paise
    minOrder: Paise;
    maxDiscount?: Paise;
    description: string;
  }
> = {
  FIRSTBITE: {
    type: "PERCENT",
    value: 15,
    minOrder: toPaise(299),
    maxDiscount: toPaise(100),
    description: "15% OFF up to ₹100 on your first order (min ₹299)",
  },
  FLAT50: {
    type: "FLAT",
    value: toPaise(50),
    minOrder: toPaise(349),
    description: "Flat ₹50 OFF on orders above ₹349",
  },
  SEVENBITES: {
    type: "PERCENT",
    value: 10,
    minOrder: toPaise(199),
    maxDiscount: toPaise(70),
    description: "10% OFF up to ₹70 (min ₹199)",
  },
};

/**
 * Single source of truth for order calculation.
 * Ensures server & client compute exact matching figures in integer paise.
 */
export function calculateOrderPrice(input: PricingInput): PricingBreakdown {
  const { items, orderType, couponCode } = input;

  // 1. Calculate Subtotal
  let subtotal: Paise = 0;
  let itemCount = 0;

  for (const item of items) {
    const addonsTotal = (item.addOns || []).reduce((acc, a) => acc + a.price, 0);
    const linePrice = (item.unitPrice + addonsTotal) * item.qty;
    subtotal += linePrice;
    itemCount += item.qty;
  }

  // 2. Coupon Discount Calculation
  let discount: Paise = 0;
  let appliedCode: string | undefined = undefined;

  if (couponCode) {
    const normalized = couponCode.trim().toUpperCase();
    const coupon = VALID_COUPONS[normalized];
    if (coupon && subtotal >= coupon.minOrder) {
      if (coupon.type === "PERCENT") {
        const rawDiscount = Math.round((subtotal * coupon.value) / 100);
        discount = coupon.maxDiscount
          ? Math.min(rawDiscount, coupon.maxDiscount)
          : rawDiscount;
      } else {
        discount = Math.min(coupon.value, subtotal);
      }
      appliedCode = normalized;
    }
  }

  // 3. Taxable Amount
  const taxableAmount = Math.max(0, subtotal - discount);

  // 4. GST Breakdown (5% GST: 2.5% CGST + 2.5% SGST on restaurant food)
  const cgstAmount = Math.round(taxableAmount * 0.025);
  const sgstAmount = Math.round(taxableAmount * 0.025);
  const totalTax = cgstAmount + sgstAmount;

  // 5. Packaging & Delivery Fees
  let packagingFee: Paise = 0;
  let deliveryFee: Paise = 0;

  if (orderType === "DELIVERY") {
    // Delivery fee ₹35 if under ₹400, free otherwise
    deliveryFee = subtotal > 0 && subtotal < toPaise(400) ? toPaise(35) : 0;
    // Packaging fee ₹15 for delivery orders
    packagingFee = subtotal > 0 ? toPaise(15) : 0;
  } else if (orderType === "PICKUP") {
    // Packaging fee ₹10 for pickup/takeaway
    packagingFee = subtotal > 0 ? toPaise(10) : 0;
  }

  // 6. Pre-round Total
  const preRoundTotal = taxableAmount + totalTax + packagingFee + deliveryFee;

  // 7. Exact Round-off to Nearest Rupee (100 paise)
  const remainder = preRoundTotal % 100;
  let roundOff: Paise = 0;
  if (remainder >= 50) {
    roundOff = 100 - remainder;
  } else if (remainder > 0) {
    roundOff = -remainder;
  }

  const finalTotal = preRoundTotal + roundOff;

  return {
    subtotal,
    discount,
    discountCode: appliedCode,
    taxableAmount,
    tax: {
      cgstRate: 0.025,
      cgstAmount,
      sgstRate: 0.025,
      sgstAmount,
      totalTax,
    },
    packagingFee,
    deliveryFee,
    roundOff,
    total: Math.max(0, finalTotal),
    itemCount,
  };
}
