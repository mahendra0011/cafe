import { describe, expect, it } from "vitest";
import { formatRupees, toPaise, toRupees } from "../lib/money";
import { calculateOrderPrice, type CartItem } from "../lib/pricing-service";

describe("Money Utilities", () => {
  it("converts rupees to paise accurately", () => {
    expect(toPaise(249)).toBe(24900);
    expect(toPaise(199.5)).toBe(19950);
  });

  it("converts paise to rupees", () => {
    expect(toRupees(24900)).toBe(249);
    expect(toRupees(19950)).toBe(199.5);
  });

  it("formats rupees with currency symbol", () => {
    expect(formatRupees(24900)).toBe("₹249");
    expect(formatRupees(24950)).toBe("₹249.50");
  });
});

describe("Pricing Service", () => {
  const sampleItems: CartItem[] = [
    {
      id: "cart-1",
      itemId: "margherita-pizza",
      name: "Classic Margherita",
      foodType: "veg",
      size: "Medium",
      unitPrice: toPaise(249),
      qty: 1,
      addOns: [{ id: "extra-cheese", name: "Extra Mozzarella", price: toPaise(40) }],
    },
    {
      id: "cart-2",
      itemId: "signature-cold-coffee",
      name: "Signature Cold Coffee",
      foodType: "veg",
      unitPrice: toPaise(129),
      qty: 2,
    },
  ];

  it("computes exact subtotal, 5% GST, and packaging fee for pickup", () => {
    // line 1: (249 + 40) * 1 = 289
    // line 2: 129 * 2 = 258
    // subtotal = 547
    const result = calculateOrderPrice({
      items: sampleItems,
      orderType: "PICKUP",
    });

    expect(result.subtotal).toBe(toPaise(547));
    expect(result.itemCount).toBe(3);
    expect(result.packagingFee).toBe(toPaise(10));
    expect(result.deliveryFee).toBe(0);

    // GST on 547: 547 * 0.025 = 13.675 -> 13.68 (rounded in paise: 54700 * 0.025 = 1368 paise = 13.68)
    // CGST: 1368 paise, SGST: 1368 paise, Total Tax: 2736 paise = 27.36
    expect(result.tax.cgstAmount).toBe(1368);
    expect(result.tax.sgstAmount).toBe(1368);
    expect(result.tax.totalTax).toBe(2736);

    // pre-round = 54700 + 2736 + 1000 = 58436 paise (₹584.36)
    // 36 paise < 50 paise -> rounds down by -36 paise
    // total = 58400 paise = ₹584
    expect(result.roundOff).toBe(-36);
    expect(result.total).toBe(58400);
  });

  it("applies promo coupon discount correctly", () => {
    const result = calculateOrderPrice({
      items: sampleItems,
      orderType: "DELIVERY",
      couponCode: "FLAT50",
    });

    // Subtotal = 547
    // Discount = 50
    // Taxable = 497
    expect(result.discount).toBe(toPaise(50));
    expect(result.taxableAmount).toBe(toPaise(497));
    expect(result.deliveryFee).toBe(0); // Free delivery because subtotal >= 400
    expect(result.packagingFee).toBe(toPaise(15));
  });
});
