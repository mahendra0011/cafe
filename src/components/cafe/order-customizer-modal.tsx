import { useState } from "react";
import { Check, Flame, MessageSquare, Minus, Plus, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatRupees, toPaise, type Paise } from "@/lib/money";
import { type CartAddon, type CartItem } from "@/lib/pricing-service";
import type { MenuItem } from "@/config/site";

interface CustomizerModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (cartItem: Omit<CartItem, "id">) => void;
}

const COMMON_ADDONS: CartAddon[] = [
  { id: "extra-cheese", name: "Extra Mozzarella Cheese", price: toPaise(40) },
  { id: "garlic-dip", name: "Artisan Garlic Mayo Dip", price: toPaise(30) },
  { id: "extra-toppings", name: "Grilled Herb Mushrooms & Olives", price: toPaise(35) },
  { id: "spicy-peri-dip", name: "Smoky Peri-Peri Dip", price: toPaise(25) },
];

export function OrderCustomizerModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
}: CustomizerModalProps) {
  if (!item) return null;

  const availableSizes = item.sizes || [];
  const [selectedSize, setSelectedSize] = useState<string>(
    availableSizes.length > 0 ? availableSizes[0].label : "Regular"
  );
  const [selectedAddons, setSelectedAddons] = useState<CartAddon[]>([]);
  const [spiceLevel, setSpiceLevel] = useState<"Mild" | "Medium" | "Hot">("Medium");
  const [specialNote, setSpecialNote] = useState("");
  const [qty, setQty] = useState(1);

  // Base price in paise
  const sizeObj = availableSizes.find((s) => s.label === selectedSize);
  const basePriceRupees = sizeObj ? sizeObj.price : item.price;
  const basePricePaise: Paise = toPaise(basePriceRupees);

  const addonsTotalPaise = selectedAddons.reduce((acc, a) => acc + a.price, 0);
  const unitPricePaise = basePricePaise;
  const lineTotalPaise = (unitPricePaise + addonsTotalPaise) * qty;

  const toggleAddon = (addon: CartAddon) => {
    setSelectedAddons((curr) =>
      curr.some((a) => a.id === addon.id)
        ? curr.filter((a) => a.id !== addon.id)
        : [...curr, addon]
    );
  };

  const handleAdd = () => {
    onAddToCart({
      itemId: item.id,
      name: item.name,
      image: item.image,
      foodType: (item.diet === "non-veg" ? "non-veg" : item.diet === "egg" ? "egg" : "veg") as "veg" | "non-veg" | "egg",
      size: availableSizes.length > 0 ? selectedSize : undefined,
      unitPrice: basePricePaise,
      qty,
      addOns: selectedAddons,
      specialNote: specialNote.trim() || undefined,
    });
    onClose();
    // Reset state
    setSelectedAddons([]);
    setSpecialNote("");
    setQty(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-[#FAF7F2] border-2 border-[#1C1410] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="relative p-5 bg-white border-b border-[#1C1410]/10 flex items-start gap-4">
          {item.image && (
            <div className="w-16 h-16 rounded-xl bg-[#FAF7F2] border border-[#1C1410]/10 p-1 flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="flex-1 pr-6">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center p-0.5 ${
                  item.diet === "veg"
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-rose-600 bg-rose-50"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    item.diet === "veg" ? "bg-emerald-600" : "bg-rose-600"
                  }`}
                />
              </span>
              <span className="text-xs font-semibold text-[#8A8375] uppercase tracking-wider">
                {item.category}
              </span>
            </div>
            <h3 className="font-bold text-lg text-[#1C1410] leading-snug">
              {item.name}
            </h3>
            <p className="text-xs text-[#5C564B] line-clamp-2 mt-1">
              {item.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#8A8375] hover:text-[#1C1410] hover:bg-[#FAF7F2] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Options */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-5">
          {/* Sizes */}
          {availableSizes.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-[#1C1410] uppercase tracking-wider mb-2.5">
                Choose Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {availableSizes.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setSelectedSize(s.label)}
                    className={`py-2.5 px-3 rounded-xl border text-center transition ${
                      selectedSize === s.label
                        ? "bg-[#1C1410] text-white border-[#1C1410] font-bold shadow-sm"
                        : "bg-white text-[#1C1410] border-[#1C1410]/15 hover:border-[#1C1410]/40"
                    }`}
                  >
                    <div className="text-sm font-semibold">{s.label}</div>
                    <div
                      className={`text-xs mt-0.5 ${
                        selectedSize === s.label ? "text-[#F59E0B]" : "text-[#5C564B]"
                      }`}
                    >
                      ₹{s.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Spice Level */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#1C1410] uppercase tracking-wider mb-2.5">
              <Flame className="w-3.5 h-3.5 text-[#C83B1E]" /> Spice Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Mild", "Medium", "Hot"] as const).map((spice) => (
                <button
                  key={spice}
                  type="button"
                  onClick={() => setSpiceLevel(spice)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                    spiceLevel === spice
                      ? "bg-[#C83B1E] text-white border-[#C83B1E]"
                      : "bg-white text-[#5C564B] border-[#1C1410]/15 hover:border-[#1C1410]/40"
                  }`}
                >
                  {spice}
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <label className="block text-xs font-bold text-[#1C1410] uppercase tracking-wider mb-2.5">
              Add-ons & Dips
            </label>
            <div className="space-y-2">
              {COMMON_ADDONS.map((addon) => {
                const isChecked = selectedAddons.some((a) => a.id === addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left ${
                      isChecked
                        ? "bg-white border-[#C83B1E] ring-1 ring-[#C83B1E]"
                        : "bg-white border-[#1C1410]/10 hover:border-[#1C1410]/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                          isChecked
                            ? "bg-[#C83B1E] border-[#C83B1E] text-white"
                            : "border-[#1C1410]/30 bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-sm font-medium text-[#1C1410]">
                        {addon.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#C83B1E]">
                      +{formatRupees(addon.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#1C1410] uppercase tracking-wider mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-[#8A8375]" /> Special Instructions
            </label>
            <textarea
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value.slice(0, 140))}
              placeholder="e.g. Less spicy, crispy crust, no onion..."
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-[#1C1410]/15 bg-white text-[#1C1410] placeholder:text-[#8A8375] focus:outline-none focus:border-[#1C1410]"
            />
            <div className="text-[10px] text-right text-[#8A8375] mt-0.5">
              {specialNote.length}/140
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-[#1C1410]/10 flex items-center justify-between gap-4">
          {/* Stepper */}
          <div className="flex items-center border border-[#1C1410]/20 rounded-xl bg-[#FAF7F2] p-1">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              disabled={qty <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1C1410] disabled:opacity-30 hover:bg-white transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-[#1C1410]">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty(qty + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1C1410] hover:bg-white transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button */}
          <Button
            type="button"
            onClick={handleAdd}
            className="flex-1 py-6 bg-[#C83B1E] hover:bg-[#B33419] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition text-base flex items-center justify-between px-5"
          >
            <span>Add to Order</span>
            <span className="font-mono bg-black/20 py-1 px-2.5 rounded-lg text-sm">
              {formatRupees(lineTotalPaise)}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
