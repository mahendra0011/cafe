export const cafeSite = {
  name: "7 Bites Cafe",
  city: "Chhatarpur",
  region: "Madhya Pradesh",
  address: "[ADD CAFE STREET ADDRESS]",
  phone: "[ADD CAFE PHONE NUMBER]",
  whatsapp: "[ADD WHATSAPP NUMBER WITH COUNTRY CODE]",
  hours: "[ADD OPENING HOURS]",
  openTime: "[ADD OPEN TIME HH:MM]",
  closeTime: "[ADD CLOSE TIME HH:MM]",
  instagram: "[ADD INSTAGRAM HANDLE]",
  googleMapsSearchUrl:
    "https://www.google.com/maps/search/?api=1&query=7%20Bites%20Cafe%2C%20Chhatarpur%2C%20Madhya%20Pradesh",
  offerValidity: "[ADD OFFER VALIDITY DATES]",
  foundedYear: "[ADD YEAR]",
  stats: [
    { label: "Pizzas baked daily", value: "1,284" },
    { label: "Happy visits", value: "9,861" },
    { label: "Locked since", value: "[ADD YEAR]" },
  ],
};

export const menuCategories = [
  "Pizza",
  "Burgers",
  "Sandwiches",
  "Pasta",
  "Momos",
  "Fries & Sides",
  "Shakes",
  "Cold Coffee",
  "Hot Beverages",
  "Desserts",
] as const;

export type MenuCategory = (typeof menuCategories)[number];

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  diet: "veg" | "non-veg";
  tag?: string;
  bestseller: boolean;
  price: number;
  sizes?: { label: "Regular" | "Medium" | "Large"; price: number }[];
};
