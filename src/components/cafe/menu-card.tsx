import { useState } from "react";
import { Plus, Sparkles, Check } from "lucide-react";
import type { MenuItem } from "@/config/site";
import { getMenuItemImage, getMenuItemFallbackSticker } from "@/lib/menu-images";

type MenuSize = NonNullable<MenuItem["sizes"]>[number]["label"];

export function FoodMarker({ diet }: { diet: MenuItem["diet"] }) {
  const isVeg = diet === "veg";
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded-md border-2 bg-white/95 backdrop-blur-xs shadow-2xs ${
        isVeg ? "border-emerald-600 text-emerald-600" : "border-rose-600 text-rose-600"
      }`}
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isVeg ? "bg-emerald-600" : "bg-rose-600"
        }`}
      />
    </span>
  );
}

export function formatPrice(value: number) {
  return `₹${value}`;
}

export function itemPrice(item: MenuItem, size?: MenuSize) {
  return item.sizes?.find((option) => option.label === size)?.price ?? item.price;
}

export function MenuItemCard({
  item,
  onAdd,
}: {
  item: MenuItem;
  onAdd: (item: MenuItem, size?: MenuSize) => void;
}) {
  const defaultSize = item.sizes?.[1]?.label || item.sizes?.[0]?.label;
  const [size, setSize] = useState<MenuSize | undefined>(defaultSize);
  const [isAdded, setIsAdded] = useState(false);
  const currentPrice = itemPrice(item, size);
  const image = getMenuItemImage(item);
  const fallback = getMenuItemFallbackSticker(item);

  const handleAdd = () => {
    onAdd(item, size);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <article className="group relative flex flex-col rounded-3xl bg-white border border-[#1C1410]/10 hover:border-[#C83B1E]/30 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Top Food Image Container */}
      <div className="relative w-full h-52 overflow-hidden bg-[#FAF7F2]">
        <img
          src={image}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.currentTarget.src = fallback;
          }}
        />

        {/* Subtle Dark Gradient at bottom of image for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

        {/* Badges on Top Corners */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <FoodMarker diet={item.diet} />

          {item.tag || item.bestseller ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-[#1C1410]/85 text-[#F59E0B] border border-[#F59E0B]/30 backdrop-blur-xs shadow-xs">
              <Sparkles className="w-3 h-3 text-[#F59E0B]" />
              {item.tag || "Bestseller"}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-[#5C564B] uppercase tracking-wider backdrop-blur-xs">
              {item.category}
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="text-[11px] font-bold text-[#8A8375] uppercase tracking-wider mb-1">
            {item.category}
          </div>
          <h3 className="font-display font-extrabold text-lg text-[#1C1410] leading-snug group-hover:text-[#C83B1E] transition-colors line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs text-[#5C564B] leading-relaxed line-clamp-2 mt-1.5 mb-3">
            {item.description}
          </p>

          {/* Inline Sleek Size Pills if multiple sizes exist */}
          {item.sizes && item.sizes.length > 0 && (
            <div className="flex items-center gap-1.5 mb-4">
              <span className="text-[10px] font-bold text-[#8A8375] uppercase tracking-wider mr-1">
                Size:
              </span>
              {item.sizes.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setSize(opt.label)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition ${
                    size === opt.label
                      ? "bg-[#1C1410] text-white border-[#1C1410] shadow-2xs"
                      : "bg-[#FAF7F2] text-[#5C564B] border-[#1C1410]/15 hover:border-[#1C1410]/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer: Price & Energetic ADD Button */}
        <div className="pt-3 border-t border-[#1C1410]/10 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-medium text-[#8A8375]">Price</div>
            <div className="font-display font-black text-xl text-[#C83B1E] font-mono">
              {formatPrice(currentPrice)}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 ${
              isAdded
                ? "bg-emerald-600 text-white shadow-emerald-200"
                : "bg-[#C83B1E] hover:bg-[#B33419] text-white shadow-[#C83B1E]/20 hover:shadow-md"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ ADD</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
