import pizzaSticker from "@/assets/7-bites-pizza-sticker.png";
import burgerSticker from "@/assets/7-bites-burger-sticker.png";
import momosSticker from "@/assets/7-bites-momos-sticker.png";
import coffeeSticker from "@/assets/7-bites-coffee-dessert-sticker.png";
import type { MenuItem } from "@/config/site";

const categoryImages: Record<string, string[]> = {
  Pizza: [
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
  ],
  Burgers: [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
  ],
  Sandwiches: [
    "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=600&q=80",
  ],
  Pasta: [
    "https://images.unsplash.com/photo-1621996346565-e3d5d6281290?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=600&q=80",
  ],
  Momos: [
    "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
  ],
  "Fries & Sides": [
    "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80",
  ],
  Shakes: [
    "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80",
  ],
  "Cold Coffee": [
    "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80",
  ],
  "Hot Beverages": [
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80",
  ],
  Desserts: [
    "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
  ],
};

export function getMenuItemImage(item: MenuItem): string {
  const images = categoryImages[item.category];
  if (images && images.length > 0) {
    // Generate consistent index based on id
    let hash = 0;
    for (let i = 0; i < item.id.length; i++) {
      hash = (hash * 31 + item.id.charCodeAt(i)) & 0xffffffff;
    }
    const idx = Math.abs(hash) % images.length;
    return images[idx];
  }

  // Fallback to sticker
  if (item.category === "Pizza") return pizzaSticker;
  if (item.category === "Burgers") return burgerSticker;
  if (item.category === "Momos") return momosSticker;
  return coffeeSticker;
}

export function getMenuItemFallbackSticker(item: MenuItem): string {
  if (item.category === "Pizza") return pizzaSticker;
  if (item.category === "Burgers") return burgerSticker;
  if (item.category === "Momos") return momosSticker;
  return coffeeSticker;
}
