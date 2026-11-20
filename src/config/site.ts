export const cafeSite = {
  name: "7 Bites Cafe",
  tagline: "Pizza, Coffee & Good Times",
  city: "Jabalpur",
  region: "Madhya Pradesh",
  address: "Gohalpur Amkhera, Jagriti Nagar, Jabalpur, Madhya Pradesh 482001",
  postalCode: "482001",
  phone: "+91 98765 43210",
  whatsapp: "+919876543210",
  hours: "11:00 AM – 11:00 PM (Daily)",
  openTime: "11:00",
  closeTime: "23:00",
  instagram: "@7bitescafe_jabalpur",
  googleMapsSearchUrl:
    "https://www.google.com/maps/search/?api=1&query=7+Bites+Cafe+Gohalpur+Amkhera+Jagriti+Nagar+Jabalpur+Madhya+Pradesh+482001",
  offerValidity: "Limited Time Offers · Valid Every Day",
  foundedYear: "2022",
  stats: [
    { label: "Pizzas baked daily", value: "250+" },
    { label: "Happy foodies", value: "15,000+" },
    { label: "Google Rating", value: "4.8 ★" },
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
