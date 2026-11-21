import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Award,
  Check,
  CheckCircle2,
  Clock3,
  Coffee,
  Droplets,
  Flame,
  Heart,
  Layers,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  ShoppingBag,
  Sparkles,
  Star,
  UtensilsCrossed,
  Wheat,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cafeSite, menuCategories, type MenuCategory, type MenuItem } from "@/config/site";
import { CafeOpenStatus } from "@/components/cafe/cafe-status";
import { MenuItemCard, FoodMarker, formatPrice, itemPrice } from "@/components/cafe/menu-card";
import menuData from "@/data/menu.json";
import burgerSticker from "@/assets/7-bites-burger-sticker.png";
import coffeeSticker from "@/assets/7-bites-coffee-dessert-sticker.png";
import momosSticker from "@/assets/7-bites-momos-sticker.png";
import pizzaSticker from "@/assets/7-bites-pizza-sticker.png";

type DietFilter = "all" | "veg" | "non-veg";
type MenuSize = NonNullable<MenuItem["sizes"]>[number]["label"];
type OrderPick = { key: string; item: MenuItem; size?: MenuSize | undefined };

const items = menuData as MenuItem[];
const signatureIds = ["pizza-1", "burgers-2", "momos-3", "cold-coffee-1", "desserts-1"];

const galleryImages = [
  { src: pizzaSticker, alt: "Cheesy loaded pizza", label: "Artisan Wood-Fired Pizza" },
  { src: coffeeSticker, alt: "Chilled iced cold coffee", label: "Thick Signature Cold Coffee" },
  { src: burgerSticker, alt: "Crispy gourmet smash burger", label: "Handcrafted Gourmet Burger" },
  { src: momosSticker, alt: "Steamed Himalayan momos", label: "Himalayan Steamed Momos" },
  { src: coffeeSticker, alt: "Sizzling brownie dessert", label: "Sizzling Choco Brownie" },
  { src: pizzaSticker, alt: "Farmhouse veggie pizza", label: "Farmhouse Loaded Pizza" },
  { src: momosSticker, alt: "Kurkure fried momos", label: "Crispy Peri-Peri Momos" },
  { src: burgerSticker, alt: "Double cheese smash burger", label: "Double Cheese Paneer Burger" },
];

const customerReviews = [
  {
    name: "Rohit Sharma",
    role: "Local Foodie · Jabalpur",
    rating: 5,
    text: "Best pizza in Jabalpur hands down! The crust is light and crispy, cheese pull is insane, and the cold coffee is thick and perfectly brewed.",
    initials: "RS",
  },
  {
    name: "Priya Patel",
    role: "Regular Guest",
    rating: 5,
    text: "Such a warm and cozy café! Perfect ambiance for evening hangout with friends. Loved their paneer tikka pizza and sizzling brownie.",
    initials: "PP",
  },
  {
    name: "Aman Verma",
    role: "College Student",
    rating: 5,
    text: "Super fast service and very hygienic open kitchen. The steamed momos and peri-peri fries are genuinely addictive. Must visit!",
    initials: "AV",
  },
  {
    name: "Neha Gupta",
    role: "Family Dining",
    rating: 5,
    text: "Finally a great quality café in Jabalpur! Beautiful interior, gentle music, and delicious white sauce pasta that my kids loved.",
    initials: "NG",
  },
  {
    name: "Vikrant Singh",
    role: "Food Blogger",
    rating: 5,
    text: "Ordered the Family Weekend combo, everyone at home was impressed. Generous portions, authentic flavors, and pocket-friendly rates.",
    initials: "VS",
  },
  {
    name: "Ananya Soni",
    role: "Local Resident",
    rating: 5,
    text: "My go-to spot for cold coffee after work. Consistent taste, super polite staff, and the burgers are always freshly grilled.",
    initials: "AS",
  },
];

const comboDeals = [
  {
    tag: "Most Popular",
    title: "Pizza & Chill Combo",
    description: "1 Medium Farmhouse Pizza + 2 Signature Cold Coffees + 1 Cheesy Garlic Bread",
    originalPrice: "₹519",
    comboPrice: "₹399",
    saving: "Save ₹120",
  },
  {
    tag: "Student Saver",
    title: "Burger Frenzy Combo",
    description: "2 Gourmet Smash Burgers + 1 Large Peri-Peri Fries + 2 Chilled Soft Drinks",
    originalPrice: "₹439",
    comboPrice: "₹349",
    saving: "Save ₹90",
  },
  {
    tag: "Snack Special",
    title: "Momo & Pasta Delight",
    description: "1 Steamed Himalayan Momo Platter + 1 Creamy Alfredo Pasta + 1 Peach Iced Tea",
    originalPrice: "₹409",
    comboPrice: "₹329",
    saving: "Save ₹80",
  },
  {
    tag: "Weekend Feast",
    title: "Family Celebration Box",
    description: "2 Large Specialty Pizzas + Loaded Cheesy Fries + 1 Choco Lava Cake",
    originalPrice: "₹909",
    comboPrice: "₹699",
    saving: "Save ₹210",
  },
];

const sevenBitesSteps = [
  {
    num: "01",
    tag: "Freshly Baked",
    sensation: "🔥 The Sizzle",
    title: "The Sizzle & Aroma",
    desc: "Fresh handmade dough baked to golden perfection with aromatic Italian herbs straight out of the stone oven.",
    micro: "Wood-fired stone oven",
    accent: "#F59E0B",
    bgTint: "rgba(245, 158, 11, 0.08)",
    borderTint: "rgba(245, 158, 11, 0.25)",
    icon: Flame,
    iconColor: "#D97706",
  },
  {
    num: "02",
    tag: "Crispy Crunch",
    sensation: "🌾 First Bite",
    title: "The Golden Crust",
    desc: "Hand-stretched, 24-hour slow fermented dough that gives that irresistible, loud and satisfying first crunch.",
    micro: "Fermented 24 hrs",
    accent: "#EAB308",
    bgTint: "rgba(234, 179, 8, 0.08)",
    borderTint: "rgba(234, 179, 8, 0.25)",
    icon: Wheat,
    iconColor: "#CA8A04",
  },
  {
    num: "03",
    tag: "100% Mozzarella",
    sensation: "🧀 Cheesy Bliss",
    title: "The Molten Cheese Pull",
    desc: "Pure real dairy mozzarella stretched generously in every single hot slice — zero blends or artificial oils.",
    micro: "Pure dairy mozzarella",
    accent: "#EA580C",
    bgTint: "rgba(234, 88, 12, 0.08)",
    borderTint: "rgba(234, 88, 12, 0.25)",
    icon: Layers,
    iconColor: "#EA580C",
  },
  {
    num: "04",
    tag: "Herb-Infused",
    sensation: "🌿 Slow Simmered",
    title: "The Sauce Symphony",
    desc: "Slow-simmered rich tomato sauce infused with fresh garden basil, crushed garlic, and aged oregano.",
    micro: "Garden fresh basil",
    accent: "#E11D48",
    bgTint: "rgba(225, 29, 72, 0.08)",
    borderTint: "rgba(225, 29, 72, 0.25)",
    icon: Droplets,
    iconColor: "#E11D48",
  },
  {
    num: "05",
    tag: "Signature Brew",
    sensation: "❄️ Ice & Mocha",
    title: "The Chilled Sips",
    desc: "Signature thick cold brews and blended shakes balancing the piping-hot oven warmth with silky coolness.",
    micro: "Arabica & thick gelato",
    accent: "#0284C7",
    bgTint: "rgba(2, 132, 199, 0.08)",
    borderTint: "rgba(2, 132, 199, 0.25)",
    icon: Coffee,
    iconColor: "#0284C7",
  },
  {
    num: "06",
    tag: "Good Vibes",
    sensation: "💛 Cozy Memories",
    title: "The Shared Laughter",
    desc: "Good food enjoyed best around a cozy wooden table, catching up with best friends and family in Jabalpur.",
    micro: "Jabalpur's favorite spot",
    accent: "#DB2777",
    bgTint: "rgba(219, 39, 119, 0.08)",
    borderTint: "rgba(219, 39, 119, 0.25)",
    icon: Heart,
    iconColor: "#DB2777",
  },
  {
    num: "07",
    tag: "Ek Bite. Phir Saat.",
    sensation: "✨ Grand Finale",
    title: "The Inevitable Craving",
    desc: "The lingering satisfaction that brings you right back for another bite. Ek baar chakh liya, to baar baar aana pade!",
    micro: "The 7 Bites promise",
    accent: "#C83B1E",
    bgTint: "rgba(200, 59, 30, 0.08)",
    borderTint: "rgba(200, 59, 30, 0.3)",
    icon: Sparkles,
    iconColor: "#C83B1E",
  },
];

function SectionHeading({
  eyebrow,
  title,
  note,
  titleId,
}: {
  eyebrow: string;
  title: string;
  note?: string;
  titleId?: string;
}) {
  return (
    <div className="cafe-section-heading">
      <p className="cafe-section-eyebrow">
        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 id={titleId}>{title}</h2>
      {note ? <p className="cafe-section-note">{note}</p> : null}
    </div>
  );
}

function CafeRibbon({ reverse = false, children }: { reverse?: boolean; children: string }) {
  return (
    <div className={`cafe-marquee${reverse ? " cafe-marquee-reverse" : ""}`} aria-label={children}>
      <div className="cafe-marquee-track" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index}>
            {children}
            <span className="text-amber-400">🍕</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function SignatureDishes({ onAdd }: { onAdd: (item: MenuItem, size?: MenuSize) => void }) {
  const featured = signatureIds
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is MenuItem => Boolean(item));

  const imageFor = (item: MenuItem) =>
    item.category === "Pizza"
      ? pizzaSticker
      : item.category === "Burgers"
        ? burgerSticker
        : item.category === "Momos"
          ? momosSticker
          : coffeeSticker;

  return (
    <section className="cafe-signature-section" id="signature" aria-labelledby="signature-title">
      <div className="cafe-section-inner">
        <SectionHeading
          eyebrow="Crowd Favourites"
          title="Our Signature Bites"
          titleId="signature-title"
          note="Handcrafted recipes that keep Jabalpur coming back for more."
        />
        <div className="cafe-signature-grid">
          {featured.map((item) => (
            <article className="cafe-signature-item" key={item.id}>
              <div className="cafe-signature-art">
                <img src={imageFor(item)} alt={item.name} loading="lazy" />
                <span className="cafe-signature-sticker">{item.tag ?? "Bestseller"}</span>
              </div>
              <div className="cafe-signature-copy">
                <div className="cafe-signature-category">
                  <FoodMarker diet={item.diet} />
                  <span>{item.category}</span>
                </div>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="cafe-signature-bottom">
                  <span className="cafe-signature-price">{formatPrice(item.price)}</span>
                  <button
                    type="button"
                    className="cafe-add-button"
                    onClick={() => onAdd(item, item.sizes?.[1]?.label)}
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MenuListing({
  selected,
  onAdd,
  onRemove,
}: {
  selected: OrderPick[];
  onAdd: (item: MenuItem, size?: MenuSize) => void;
  onRemove: (key: string) => void;
}) {
  const homeFeatured = useMemo(() => {
    const featuredIds = ["pizza-1", "pizza-2", "burgers-2", "momos-1", "cold-coffee-1", "pasta-1"];
    return featuredIds
      .map((id) => items.find((item) => item.id === id))
      .filter((item): item is MenuItem => Boolean(item))
      .slice(0, 6);
  }, []);

  const totalAmount = useMemo(
    () => selected.reduce((sum, { item, size }) => sum + itemPrice(item, size), 0),
    [selected],
  );

  return (
    <section className="cafe-menu-section" id="full-menu" aria-labelledby="menu-title">
      <div className="cafe-section-inner">
        <SectionHeading
          eyebrow="Crafted With Love"
          title="Explore Our Full Menu"
          titleId="menu-title"
          note="From stone-baked pizzas to chilled artisan coffees, find your favorite craving."
        />

        <div className="cafe-menu-controls mb-8">
          <div className="cafe-category-tabs" role="group" aria-label="Explore menu categories">
            <Link
              to="/menu"
              className="cafe-filter-pill cafe-button is-active"
            >
              All
            </Link>
            {menuCategories.map((value) => (
              <Link
                key={value}
                to="/menu"
                className="cafe-filter-pill cafe-button cafe-button-outline"
              >
                {value}
              </Link>
            ))}
          </div>
        </div>

        {/* 6 Featured Cards with Food Images */}
        <div className="cafe-menu-grid">
          {homeFeatured.map((item) => (
            <MenuItemCard key={item.id} item={item} onAdd={onAdd} />
          ))}
        </div>

        {/* View Full Menu CTA Button */}
        <div className="cafe-view-full-menu-wrap">
          <Link to="/menu" className="cafe-view-full-menu-btn">
            View Full Menu (50+ Items) <ArrowRight className="w-5 h-5 ml-1" aria-hidden="true" />
          </Link>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Explore all 10 categories with custom sizes & instant WhatsApp ordering
          </p>
        </div>

        {selected.length ? (
          <div className="cafe-order-tray" aria-live="polite">
            <div className="cafe-tray-info">
              <div className="cafe-tray-icon">
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="cafe-tray-text">
                <strong>
                  {selected.length} items added ({formatPrice(totalAmount)})
                </strong>
                <span>
                  {selected
                    .map(({ item, size }) => `${item.name}${size ? ` (${size})` : ""}`)
                    .join(", ")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="pepperoni" size="sm" className="cafe-button">
                <a href="#order">
                  Proceed to Order / Table Booking <ArrowUpRight className="w-4 h-4" />
                </a>
              </Button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-black/5 text-gray-500 hover:text-black"
                aria-label="Clear selected items"
                onClick={() => selected.forEach(({ key }) => onRemove(key))}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Gallery() {
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (direction: number) =>
      setActive((index) =>
        index === null ? null : (index + direction + galleryImages.length) % galleryImages.length,
      ),
    [],
  );

  useEffect(() => {
    if (active === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, close, step]);

  return (
    <section className="cafe-gallery-section" id="gallery" aria-labelledby="gallery-title">
      <div className="cafe-section-inner">
        <SectionHeading
          eyebrow="Visual Feast"
          title="A Glimpse of the Good Stuff"
          titleId="gallery-title"
          note="Every dish is prepared fresh with premium ingredients and rich flavors."
        />
        <div className="cafe-gallery-grid">
          {galleryImages.map((image, index) => (
            <div
              key={`${image.label}-${index}`}
              className="cafe-gallery-card"
              onClick={() => setActive(index)}
              role="button"
              tabIndex={0}
              aria-label={`View ${image.label}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setActive(index);
              }}
            >
              <img src={image.src} alt={image.alt} loading="lazy" />
              <span className="cafe-gallery-caption">{image.label}</span>
            </div>
          ))}
        </div>
      </div>

      {active !== null ? (
        <div
          ref={dialogRef}
          className="cafe-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <figure>
            <button
              type="button"
              className="cafe-lightbox-close"
              aria-label="Close"
              onClick={close}
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <img
              src={galleryImages[active]?.src}
              alt={galleryImages[active]?.alt ?? "Cafe food"}
            />
            <figcaption>{galleryImages[active]?.label}</figcaption>
          </figure>
        </div>
      ) : null}
    </section>
  );
}

function ReservationForm({ selected }: { selected: OrderPick[] }) {
  const [requestSummary, setRequestSummary] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get("name")?.toString() || "";
    const phone = data.get("phone")?.toString() || "";
    const date = data.get("date")?.toString() || "";
    const time = data.get("time")?.toString() || "";
    const guests = data.get("guests")?.toString() || "2";
    const note = data.get("note")?.toString() || "—";
    const itemsList = selected.length
      ? selected
          .map(
            ({ item, size }) =>
              `${item.name}${size ? ` (${size})` : ""} - ${formatPrice(itemPrice(item, size))}`,
          )
          .join("\n• ")
      : "No items pre-selected";

    const text = `*New Table Booking / Order Enquiry - 7 Bites Cafe*\n\n` +
      `*Name:* ${name}\n` +
      `*Phone:* ${phone}\n` +
      `*Date:* ${date}\n` +
      `*Time:* ${time}\n` +
      `*Guests:* ${guests}\n` +
      `*Note:* ${note}\n\n` +
      `*Pre-selected Dishes:*\n• ${itemsList}`;

    const encoded = encodeURIComponent(text);
    const waUrl = `https://wa.me/${cafeSite.whatsapp.replace(/\D/g, "")}?text=${encoded}`;

    setRequestSummary(text);
    setWhatsappLink(waUrl);
    setSubmitted(true);
  };

  return (
    <div className="cafe-reservation" id="reserve">
      <span id="order" className="sr-only" aria-hidden="true" />
      <div className="cafe-reservation-heading">
        <p className="cafe-section-eyebrow">
          <UtensilsCrossed className="w-3.5 h-3.5" aria-hidden="true" />
          Planning a Visit?
        </p>
        <h3>Reserve a Table or Pre-Order</h3>
        <p>
          Fill your visit details below. You can also send this enquiry directly to our WhatsApp
          for instant confirmation!
        </p>
      </div>

      <form className="cafe-reservation-form" onSubmit={handleSubmit}>
        <label>
          Full Name
          <input name="name" autoComplete="name" placeholder="e.g. Rahul Sharma" required />
        </label>
        <label>
          Phone Number
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="e.g. 98765 43210"
            required
          />
        </label>
        <label>
          Date of Visit
          <input name="date" type="date" required />
        </label>
        <label>
          Time
          <input name="time" type="time" required />
        </label>
        <label>
          Number of Guests
          <input name="guests" type="number" min="1" max="50" defaultValue="2" required />
        </label>
        <label className="cafe-reservation-note">
          Special Requests / Note (Optional)
          <input name="note" placeholder="e.g. Birthday decoration, window seat, extra cheese..." />
        </label>

        {selected.length ? (
          <div className="col-span-full p-4 rounded-xl bg-white border border-amber-900/10 text-sm">
            <span className="font-bold text-gray-900">Pre-selected Dishes ({selected.length}): </span>
            <span className="text-gray-600">
              {selected.map(({ item, size }) => `${item.name}${size ? ` (${size})` : ""}`).join(", ")}
            </span>
          </div>
        ) : null}

        <div className="cafe-reservation-submit flex flex-wrap gap-3 items-center">
          <Button type="submit" variant="pepperoni" size="lg" className="cafe-button">
            Confirm & Generate WhatsApp Enquiry <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {submitted ? (
        <div className="cafe-form-result" role="status">
          <Check className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          <div className="flex-1">
            <strong className="text-emerald-800 text-base">Booking Enquiry Prepared!</strong>
            <p className="text-sm text-gray-700 mt-1">
              Click below to send your reservation directly to 7 Bites Cafe on WhatsApp:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild variant="pepperoni" size="sm" className="cafe-button">
                <a href={whatsappLink} target="_blank" rel="noreferrer">
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  Send to WhatsApp Now
                </a>
              </Button>
            </div>
            <pre className="mt-3">{requestSummary}</pre>
          </div>
          <button
            type="button"
            className="p-1 hover:bg-black/5 rounded"
            aria-label="Dismiss summary"
            onClick={() => setSubmitted(false)}
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function CafeSections() {
  const [selected, setSelected] = useState<OrderPick[]>([]);
  const addItem = (item: MenuItem, size?: MenuSize) =>
    setSelected((current) => [
      ...current,
      { key: `${item.id}-${Date.now()}-${current.length}`, item, size },
    ]);
  const removeItem = (key: string) =>
    setSelected((current) => current.filter((pick) => pick.key !== key));

  return (
    <>
      {/* Marquee & Quick Info Strip */}
      <section className="cafe-marquee-section" aria-label="Cafe highlights and quick information">
        <div className="cafe-ribbon-stack">
          <CafeRibbon>
            ARTISAN PIZZAS · GOLDEN CHEESE PULLS · COLD COFFEE · CRISPY BURGERS · STEAMED MOMOS · PASTA · FRESH DOUGH BAKED DAILY · EK BITE. PHIR SAAT ·
          </CafeRibbon>
        </div>

        <div className="cafe-quick-info" id="quick-info">
          <a
            className="cafe-info-card"
            href={cafeSite.googleMapsSearchUrl}
            target="_blank"
            rel="noreferrer"
          >
            <div className="cafe-info-icon">
              <MapPin className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="cafe-info-content">
              <strong>Location</strong>
              <span>
                {cafeSite.city}, {cafeSite.region}
              </span>
            </div>
          </a>

          <div className="cafe-info-card">
            <div className="cafe-info-icon">
              <Clock3 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="cafe-info-content">
              <strong>
                Daily Hours <CafeOpenStatus />
              </strong>
              <span>{cafeSite.hours}</span>
            </div>
          </div>

          <div className="cafe-info-card">
            <div className="cafe-info-icon">
              <Coffee className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="cafe-info-content">
              <strong>Dining Options</strong>
              <span>Dine-In · Takeaway · Delivery</span>
            </div>
          </div>

          <a className="cafe-info-card" href="#order">
            <div className="cafe-info-icon">
              <UtensilsCrossed className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="cafe-info-content">
              <strong>Table Booking</strong>
              <span>Reserve spot in 1 click</span>
            </div>
          </a>
        </div>
      </section>

      {/* Story Section ("Why 7 Bites?") */}
      <section className="cafe-story-section" id="story" aria-labelledby="story-title">
        <div className="cafe-section-inner">
          <div className="cafe-story-inner">
            <div className="cafe-story-copy">
              <p className="cafe-section-eyebrow">
                <Heart className="w-3.5 h-3.5" aria-hidden="true" />
                Our Story
              </p>
              <h2 id="story-title">
                Why <span>7 Bites Cafe?</span>
              </h2>
              <p>
                People often ask: <em>"Why the name 7 Bites?"</em> Because real culinary magic happens
                in moments. The first bite excites the senses; the second brings the molten cheese pull;
                and by the seventh bite, you're already planning your next visit.
              </p>
              <p>
                Nestled in Gohalpur Amkhera, Jabalpur, 7 Bites Cafe was born from a simple passion: to serve
                mouth-watering artisan pizzas with real mozzarella, handcrafted burgers, steaming
                Himalayan momos, and thick iced cold coffees in an inviting, cheerful ambiance.
              </p>

              <div className="cafe-story-stats">
                {cafeSite.stats.map((stat) => (
                  <div className="cafe-stat-card" key={stat.label}>
                    <strong>{stat.value}</strong>
                    <small>{stat.label}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="cafe-story-collage">
              <figure className="cafe-story-card">
                <img src={pizzaSticker} alt="Cheesy pizza slice" loading="lazy" />
                <figcaption>100% Real Cheese Pull</figcaption>
              </figure>
              <figure className="cafe-story-card">
                <img src={coffeeSticker} alt="Thick cold coffee" loading="lazy" />
                <figcaption>Signature Cold Brews</figcaption>
              </figure>
              <figure className="cafe-story-card">
                <img src={burgerSticker} alt="Gourmet burger" loading="lazy" />
                <figcaption>Crispy Handcrafted Burgers</figcaption>
              </figure>
              <figure className="cafe-story-card">
                <img src={momosSticker} alt="Steamed momos" loading="lazy" />
                <figcaption>Steamed Himalayan Momos</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Bites */}
      <SignatureDishes onAdd={addItem} />

      {/* Full Menu */}
      <MenuListing selected={selected} onAdd={addItem} onRemove={removeItem} />

      {/* The 7 Bites Philosophy (Light & Creative Redesign) */}
      <section className="cafe-seven-section" id="philosophy" aria-labelledby="seven-title">
        <div className="cafe-section-inner">
          <SectionHeading
            eyebrow="The 7 Bites Philosophy"
            title="Every Bite Tells a Story"
            titleId="seven-title"
            note="From that first sizzling crunch to the craving that brings you back — discover what makes each bite special."
          />

          <div className="cafe-seven-grid">
            {sevenBitesSteps.slice(0, 6).map((step) => {
              const IconComponent = step.icon;
              return (
                <div className="cafe-seven-card group" key={step.num}>
                  {/* Watermark in background */}
                  <span className="cafe-seven-watermark" aria-hidden="true">
                    {step.num}
                  </span>

                  <div className="cafe-seven-card-top">
                    <div
                      className="cafe-seven-icon-box"
                      style={{
                        backgroundColor: step.bgTint,
                        borderColor: step.borderTint,
                        color: step.iconColor,
                      }}
                    >
                      <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="cafe-seven-num-pill">{step.num}</span>
                      <span
                        className="cafe-seven-sensation"
                        style={{ color: step.iconColor, backgroundColor: step.bgTint }}
                      >
                        {step.sensation}
                      </span>
                    </div>
                  </div>

                  <div className="cafe-seven-text">
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>

                  <div className="cafe-seven-card-footer">
                    <span className="cafe-seven-micro">
                      <span
                        className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ backgroundColor: step.accent }}
                      />
                      {step.micro}
                    </span>
                    <span className="cafe-seven-tag-subtle">{step.tag}</span>
                  </div>
                </div>
              );
            })}

            {/* Step 07 - Grand Finale Banner Spanning Full Width */}
            <div className="cafe-seven-feature-card">
              <div className="cafe-seven-feature-aura" aria-hidden="true" />

              <div className="cafe-seven-feature-content">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="cafe-seven-num-pill bg-red-600 text-white font-extrabold border-0 shadow-sm px-2.5 py-1 text-xs">
                    BITE 07
                  </span>
                  <span className="cafe-seven-tag bg-amber-500/15 text-amber-800 font-bold border border-amber-300/40">
                    ★ The Grand Finale · Ek Bite. Phir Saat.
                  </span>
                  <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Taste Guarantee
                  </span>
                </div>

                <h3 className="cafe-seven-feature-title">The Inevitable Craving</h3>
                <p className="cafe-seven-feature-desc">
                  Ek bite se shuru, aur saat pe khatam... lekin craving kabhi khatam nahi hoti! Har dish ko hum fresh handmade dough, 100% pure dairy mozzarella, aur secret Italian herbs ke sath banate hain — taaki pehle bite se aakhri slice tak har pal memorable rahe.
                </p>

                {/* Trust Badges */}
                <div className="cafe-seven-badges-row">
                  <div className="cafe-seven-trust-badge">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% Real Dairy Mozzarella</span>
                  </div>
                  <div className="cafe-seven-trust-badge">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Stone-Baked Hand-Stretched</span>
                  </div>
                  <div className="cafe-seven-trust-badge">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Handcrafted in Jabalpur</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button asChild variant="pepperoni" size="sm" className="cafe-button shadow-md hover:shadow-lg">
                    <a href="#order">
                      Book Table / Order Now <ArrowUpRight className="w-4 h-4 ml-1" />
                    </a>
                  </Button>
                  <Button asChild variant="paper" size="sm" className="cafe-button border border-stone-300">
                    <Link to="/menu">
                      Explore All 50+ Dishes <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="cafe-seven-feature-art" aria-hidden="true">
                <div className="cafe-seven-art-glow" />
                <img src={pizzaSticker} alt="7 Bites Special Pizza" loading="lazy" />
                <div className="cafe-seven-art-chip top-chip">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Crispy & Cheesy</span>
                </div>
                <div className="cafe-seven-art-chip bottom-chip">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Loved in Jabalpur</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Combos & Offers */}
      <section className="cafe-offers-section" id="offers" aria-labelledby="offers-title">
        <div className="cafe-section-inner">
          <SectionHeading
            eyebrow="Value Specials"
            title="Delicious Combos & Deals"
            titleId="offers-title"
            note="Handpicked bundles crafted for sharing with friends and family at great savings."
          />

          <div className="cafe-offer-grid">
            {comboDeals.map((deal) => (
              <article className="cafe-offer-card" key={deal.title}>
                <span className="cafe-offer-badge">{deal.tag}</span>
                <h3>{deal.title}</h3>
                <p>{deal.description}</p>
                <div className="cafe-offer-footer">
                  <div>
                    <span className="text-xs text-gray-500 line-through mr-1.5">
                      {deal.originalPrice}
                    </span>
                    <strong className="cafe-offer-price">{deal.comboPrice}</strong>
                    <span className="ml-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {deal.saving}
                    </span>
                  </div>
                  <a className="cafe-offer-btn" href="#order">
                    Order <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <Gallery />

      {/* Customer Reviews */}
      <section className="cafe-reviews-section" id="reviews" aria-labelledby="reviews-title">
        <div className="cafe-section-inner">
          <div className="cafe-reviews-header">
            <SectionHeading
              eyebrow="Loved in Jabalpur"
              title="Words from Our Foodies"
              titleId="reviews-title"
              note="Read what our guests have to say about our food, coffee, and cafe ambiance."
            />
            <div className="cafe-review-badge">
              <strong>4.8</strong>
              <div>
                <div className="cafe-stars">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <small className="font-semibold text-gray-500">Based on 450+ Google Reviews</small>
              </div>
            </div>
          </div>

          <div className="cafe-review-grid">
            {customerReviews.map((rev) => (
              <article className="cafe-review-card" key={rev.name}>
                <div className="cafe-stars">
                  {Array.from({ length: rev.rating }, (_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p>"{rev.text}"</p>
                <div className="cafe-reviewer">
                  <div className="cafe-avatar">{rev.initials}</div>
                  <div>
                    <strong>{rev.name}</strong>
                    <small>{rev.role}</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="cafe-faq-section py-16 bg-[#FAF7F2] border-t border-[#1C1410]/10" id="faq" aria-labelledby="faq-title">
        <div className="cafe-section-inner">
          <SectionHeading
            eyebrow="Got Questions?"
            title="Frequently Asked Questions"
            titleId="faq-title"
            note="Everything you need to know about dining in, table reservations, and QR ordering at 7 Bites Cafe."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-4xl mx-auto">
            <div className="bg-white p-5 rounded-2xl border border-[#1C1410]/10 shadow-xs">
              <h4 className="font-bold text-sm text-[#1C1410]">Can I reserve a table in advance?</h4>
              <p className="text-xs text-[#5C564B] mt-2 leading-relaxed">
                Yes! You can reserve your table online directly through our website or call us at +91 98765 43210. We host birthday parties, anniversary dinners, and family celebrations with custom seating.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#1C1410]/10 shadow-xs">
              <h4 className="font-bold text-sm text-[#1C1410]">How does Table QR Ordering work?</h4>
              <p className="text-xs text-[#5C564B] mt-2 leading-relaxed">
                Each of our 12 cafe tables has a unique QR code. Simply scan it with your phone camera, browse our full live menu with food photos, customize your pizza/burger, and send your order straight to our kitchen KDS screen without waiting for a waiter!
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#1C1410]/10 shadow-xs">
              <h4 className="font-bold text-sm text-[#1C1410]">Do you offer online home delivery?</h4>
              <p className="text-xs text-[#5C564B] mt-2 leading-relaxed">
                7 Bites is an authentic offline cafe experience! We focus purely on warm dine-in hospitality, stone-oven baking, and fresh counter takeaway. We do not do third-party home delivery to ensure our pizzas are always enjoyed fresh and molten.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#1C1410]/10 shadow-xs">
              <h4 className="font-bold text-sm text-[#1C1410]">Do you use 100% pure dairy mozzarella?</h4>
              <p className="text-xs text-[#5C564B] mt-2 leading-relaxed">
                Yes, 100%! We strictly use real dairy mozzarella cheese with zero palm oil blends and zero cheap analogues, giving you that golden, irresistible cheese pull in every single slice.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#1C1410]/10 shadow-xs">
              <h4 className="font-bold text-sm text-[#1C1410]">What are your cafe opening hours?</h4>
              <p className="text-xs text-[#5C564B] mt-2 leading-relaxed">
                We are open every day from 11:00 AM to 11:00 PM in Gohalpur Amkhera, Jabalpur. Hot stone-baked pizzas, freshly brewed cold coffee, and snacks are served all day without breaks.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#1C1410]/10 shadow-xs">
              <h4 className="font-bold text-sm text-[#1C1410]">What payment methods do you accept?</h4>
              <p className="text-xs text-[#5C564B] mt-2 leading-relaxed">
                We accept all UPI apps (Google Pay, PhonePe, Paytm, BHIM), debit/credit cards, and cash at our counter POS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visit & Reservation */}
      <section className="cafe-visit-section" id="visit" aria-labelledby="visit-title">
        <div className="cafe-section-inner">
          <div className="cafe-visit-inner">
            <div className="cafe-visit-copy">
              <p className="cafe-section-eyebrow">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                Come Say Hi
              </p>
              <h2 id="visit-title">
                Find Your Way to <span>7 Bites Cafe.</span>
              </h2>

              <div className="cafe-visit-detail">
                <div className="cafe-visit-icon">
                  <MapPin className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <strong>Address</strong>
                  <p>{cafeSite.address}</p>
                </div>
              </div>

              <div className="cafe-visit-detail">
                <div className="cafe-visit-icon">
                  <Clock3 className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <strong>Opening Hours</strong>
                  <p>
                    {cafeSite.hours} <CafeOpenStatus />
                  </p>
                </div>
              </div>

              <div className="cafe-visit-detail">
                <div className="cafe-visit-icon">
                  <Phone className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <strong>Direct Contact</strong>
                  <p>Call: {cafeSite.phone} · WhatsApp: {cafeSite.phone}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <Button asChild variant="pepperoni" size="sm" className="cafe-button">
                  <a href={cafeSite.googleMapsSearchUrl} target="_blank" rel="noreferrer">
                    Get Google Maps Directions <ArrowUpRight className="w-4 h-4" />
                  </a>
                </Button>
                <Button asChild variant="paper" size="sm" className="cafe-button">
                  <a
                    href={`https://wa.me/${cafeSite.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    Chat on WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            <div className="cafe-map-frame">
              <iframe
                title="7 Bites Cafe location on Google Maps in Jabalpur"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://maps.google.com/maps?q=Gohalpur%20Amkhera%2C%20Jagriti%20Nagar%2C%20Jabalpur%2C%20Madhya%20Pradesh%20482001&output=embed"
              />
            </div>
          </div>

          <ReservationForm selected={selected} />
        </div>
      </section>

      {/* Footer */}
      <footer className="cafe-footer">
        <div className="cafe-section-inner">
          <div className="cafe-footer-top">
            <a className="cafe-footer-mark" href="#top">
              <img
                src="/logo.png"
                alt="7 Bites Cafe Logo"
                className="w-8 h-8 rounded-full object-contain bg-white border border-[#1C1410]/15 shadow-xs"
              />
              7 Bites <span>Cafe</span>
            </a>

            <div className="cafe-footer-links">
              <a href="#full-menu">Menu</a>
              <a href="#signature">Signature</a>
              <a href="#story">Our Story</a>
              <a href="#offers">Deals</a>
              <a href="#gallery">Gallery</a>
              <a href="#visit">Location</a>
              <a href="#order">Book Table</a>
            </div>

            <a className="cafe-back-top" href="#top">
              <ArrowUp className="w-4 h-4" />
              Back to top
            </a>
          </div>

          <div className="cafe-footer-bottom">
            <span>
              © {new Date().getFullYear()} {cafeSite.name}. Handcrafted with love in Jabalpur, Madhya Pradesh.
            </span>
            <span>All rights reserved. Dine-In, Takeaway & Delivery.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
