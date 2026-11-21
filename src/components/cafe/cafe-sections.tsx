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
  {
    src: pizzaSticker,
    alt: "Cheesy loaded artisan wood-fired pizza",
    label: "Artisan Wood-Fired Pizza",
    category: "Pizza",
    tag: "★ Bestseller",
    desc: "100% pure dairy mozzarella, stone-baked thin crust with aromatic Italian herbs.",
  },
  {
    src: coffeeSticker,
    alt: "Chilled thick iced cold coffee",
    label: "Thick Signature Cold Coffee",
    category: "Cold Brew",
    tag: "Signature Blend",
    desc: "Double shot Arabica beans blended with rich creamy gelato and cocoa drizzle.",
  },
  {
    src: burgerSticker,
    alt: "Handcrafted gourmet paneer burger",
    label: "Handcrafted Gourmet Burger",
    category: "Burgers",
    tag: "Handcrafted",
    desc: "Crispy paneer patty, melted cheddar slice, smoky sauce on a toasted sesame bun.",
  },
  {
    src: momosSticker,
    alt: "Steamed Himalayan momos with chutney",
    label: "Himalayan Steamed Momos",
    category: "Momos",
    tag: "Authentic Recipe",
    desc: "Delicate hand-pleated dumplings filled with spiced garden veggies, served piping hot.",
  },
  {
    src: coffeeSticker,
    alt: "Sizzling choco lava brownie dessert",
    label: "Sizzling Choco Brownie",
    category: "Dessert",
    tag: "Hot & Sweet",
    desc: "Bubbling warm fudge brownie served with vanilla gelato and melted chocolate ganache.",
  },
  {
    src: pizzaSticker,
    alt: "Farmhouse garden fresh loaded pizza",
    label: "Farmhouse Loaded Pizza",
    category: "Specialty Pizza",
    tag: "Chef's Special",
    desc: "Golden sweet corn, crisp green capsicum, sliced red onion and molten mozzarella.",
  },
  {
    src: momosSticker,
    alt: "Crispy fried peri-peri momos",
    label: "Crispy Peri-Peri Momos",
    category: "Momos",
    tag: "Crispy Crunch",
    desc: "Extra crunchy golden dumplings tossed generously in hot peri-peri spice herbs.",
  },
  {
    src: burgerSticker,
    alt: "Double cheese smash burger",
    label: "Double Cheese Paneer Burger",
    category: "Burgers",
    tag: "Double Loaded",
    desc: "Two layers of molten cheese, crisp lettuce, juicy tomato and zesty house dressing.",
  },
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
    pillBg: "#D82103",
    emoji: "🔥",
    title: "The Sizzle",
    subtitle: "The Sizzle & Aroma",
    desc: "Fresh handmade dough baked to golden perfection with aromatic Italian herbs straight out of the stone oven.",
    badge1: { icon: "🔥", text: "Wood-fired stone oven" },
    badge2: { icon: "🍞", text: "Freshly Baked" },
    image: "/philosophy-card-1.png",
  },
  {
    num: "02",
    pillBg: "#0B7E1B",
    emoji: "🌾",
    title: "First Bite",
    subtitle: "The Golden Crust",
    desc: "Hand-stretched, 24-hour slow fermented dough that gives that irresistible, loud and satisfying first crunch.",
    badge1: { icon: "⏱️", text: "Fermented 24 hrs" },
    badge2: { icon: "⭐", text: "Crispy Crunch" },
    image: "/philosophy-card-2.png",
  },
  {
    num: "03",
    pillBg: "#D82103",
    emoji: "🧀",
    title: "Cheesy Bliss",
    subtitle: "The Molten Cheese Pull",
    desc: "Pure real dairy mozzarella stretched generously in every single hot slice — zero blends or artificial oils.",
    badge1: { icon: "🥛", text: "Pure dairy mozzarella" },
    badge2: { icon: "✓", text: "100% Mozzarella" },
    image: "/philosophy-card-3.png",
  },
  {
    num: "04",
    pillBg: "#0B7E1B",
    emoji: "🍃",
    title: "Slow Simmered",
    subtitle: "The Sauce Symphony",
    desc: "Slow-simmered rich tomato sauce infused with fresh garden basil, crushed garlic, and aged oregano.",
    badge1: { icon: "🍃", text: "Garden fresh basil" },
    badge2: { icon: "❤️", text: "Herb-Infused" },
    image: "/philosophy-card-4.png",
  },
  {
    num: "05",
    pillBg: "#D82103",
    emoji: "❄️",
    title: "Ice & Mocha",
    subtitle: "The Chilled Sips",
    desc: "Signature thick cold brews and blended shakes balancing the piping-hot oven warmth with silky coolness.",
    badge1: { icon: "☕", text: "Arabica & thick gelato" },
    badge2: { icon: "⭐", text: "Signature Brew" },
    image: "/philosophy-card-5.png",
  },
  {
    num: "06",
    pillBg: "#0B7E1B",
    emoji: "❤️",
    title: "Cozy Memories",
    subtitle: "The Shared Laughter",
    desc: "Good food enjoyed best around a cozy wooden table, catching up with best friends and family in Jabalpur.",
    badge1: { icon: "📍", text: "Jabalpur's favorite spot" },
    badge2: { icon: "😊", text: "Good Vibes" },
    image: "/philosophy-card-6.png",
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
        {/* Eyebrow & 3D Title */}
        <div className="cafe-gallery-header">
          <div className="cafe-gallery-eyebrow-wrap">
            <div className="cafe-gallery-eyebrow">
              <span className="cafe-gallery-green-dot" />
              <span>Visual Feast</span>
            </div>
            {/* 3 Red Burst Rays */}
            <svg
              className="cafe-gallery-burst"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="6" y1="18" x2="2" y2="14" />
              <line x1="12" y1="17" x2="12" y2="10" />
              <line x1="18" y1="18" x2="22" y2="14" />
            </svg>
          </div>

          <h2 className="cafe-gallery-title" id="gallery-title">
            <span className="cafe-gallery-title-brown">A Glimpse of the </span>
            <span className="cafe-gallery-title-red">
              Good Stuff
              {/* Curved swoop underline */}
              <svg
                className="cafe-gallery-swoop"
                viewBox="0 0 140 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M4 14C45 4 95 6 136 12C105 15 50 16 4 14Z" fill="#D82103" />
              </svg>
            </span>
          </h2>

          <p className="cafe-gallery-subtitle">
            Every dish is prepared fresh with premium ingredients and rich flavors.
          </p>

          {/* Pizza Divider */}
          <div className="cafe-gallery-divider" aria-hidden="true">
            <span className="cafe-gallery-divider-line" />
            <span className="cafe-gallery-divider-icon">🍕</span>
            <span className="cafe-gallery-divider-line" />
          </div>
        </div>

        {/* 8 Gallery Cards Grid */}
        <div className="cafe-gallery-grid">
          {galleryImages.map((image, index) => (
            <div
              key={`${image.label}-${index}`}
              className="cafe-gallery-card group"
              onClick={() => setActive(index)}
              role="button"
              tabIndex={0}
              aria-label={`View ${image.label}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setActive(index);
              }}
            >
              <div className="cafe-gallery-card-top">
                <span className="cafe-gallery-category-pill">{image.category}</span>
                <span className="cafe-gallery-tag-pill">{image.tag}</span>
              </div>

              <div className="cafe-gallery-img-wrap">
                <div className="cafe-gallery-plate-glow" aria-hidden="true" />
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="cafe-gallery-img"
                />
              </div>

              <div className="cafe-gallery-info">
                <h3 className="cafe-gallery-name">{image.label}</h3>
                <p className="cafe-gallery-desc">{image.desc}</p>
              </div>

              <div className="cafe-gallery-footer">
                <span className="cafe-gallery-zoom-hint">
                  <span>Click to preview</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
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
          <figure className="cafe-lightbox-card">
            <button
              type="button"
              className="cafe-lightbox-close"
              aria-label="Close"
              onClick={close}
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <div className="cafe-lightbox-img-wrap">
              <img
                src={galleryImages[active]?.src}
                alt={galleryImages[active]?.alt ?? "Cafe food"}
              />
            </div>
            <figcaption className="cafe-lightbox-caption">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {galleryImages[active]?.category}
                </span>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  {galleryImages[active]?.tag}
                </span>
              </div>
              <h3>{galleryImages[active]?.label}</h3>
              <p>{galleryImages[active]?.desc}</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <Button asChild variant="pepperoni" size="sm" className="cafe-button shadow-md">
                  <a href="#order" onClick={close}>
                    Book Table / Order Now <ArrowUpRight className="w-4 h-4 ml-1" />
                  </a>
                </Button>
              </div>
            </figcaption>
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
      {/* Marquee Ticker Strip */}
      <section className="cafe-marquee-section" aria-label="Cafe highlights">
        <div className="cafe-ribbon-stack">
          <CafeRibbon>
            ARTISAN PIZZAS · GOLDEN CHEESE PULLS · COLD COFFEE · CRISPY BURGERS · STEAMED MOMOS · PASTA · FRESH DOUGH BAKED DAILY · EK BITE. PHIR SAAT ·
          </CafeRibbon>
        </div>
      </section>

      {/* 2nd Section: Why 7 Bites? (Our Story) */}
      <section className="cafe-story-section" id="story" aria-labelledby="story-title">
        {/* Decorative corner dot grids */}
        <div className="cafe-story-dot-grid cafe-dot-grid-tl" aria-hidden="true">
          {Array.from({ length: 15 }).map((_, i) => (
            <span key={i} className="cafe-dot" />
          ))}
        </div>
        <div className="cafe-story-dot-grid cafe-dot-grid-br" aria-hidden="true">
          {Array.from({ length: 15 }).map((_, i) => (
            <span key={i} className="cafe-dot" />
          ))}
        </div>

        {/* Decorative corner organic green waves */}
        <div className="cafe-story-wave-bl" aria-hidden="true">
          <svg viewBox="0 0 240 80" fill="none" className="w-full h-full">
            <path d="M0 80 C 60 70, 120 40, 180 70 C 210 82, 230 86, 240 80 L0 80 Z" fill="rgba(190, 242, 100, 0.45)" />
            <path d="M0 80 C 40 60, 90 30, 150 60 C 180 72, 210 78, 240 80 L0 80 Z" fill="rgba(163, 230, 53, 0.35)" />
          </svg>
        </div>
        <div className="cafe-story-wave-br" aria-hidden="true">
          <svg viewBox="0 0 240 80" fill="none" className="w-full h-full">
            <path d="M240 80 C 180 70, 120 40, 60 70 C 30 82, 10 86, 0 80 L240 80 Z" fill="rgba(190, 242, 100, 0.45)" />
            <path d="M240 80 C 200 60, 150 30, 90 60 C 60 72, 30 78, 0 80 L240 80 Z" fill="rgba(163, 230, 53, 0.35)" />
          </svg>
        </div>

        <div className="cafe-story-layout">
          <div className="cafe-story-copy">
            {/* Eyebrow badge */}
            <div className="cafe-story-eyebrow">
              <span className="cafe-story-eyebrow-dot" aria-hidden="true" />
              <span>Our Story</span>
            </div>

            {/* 3D Title: Why 7 Bites? */}
            <h2 className="cafe-story-title" id="story-title">
              <span className="cafe-story-title-why">
                Why
                {/* Accent burst marks above Why */}
                <span className="cafe-story-burst" aria-hidden="true">
                  <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
                    <path d="M4 18L1 13" stroke="#D82103" strokeWidth="2.8" strokeLinecap="round" />
                    <path d="M14 11V2" stroke="#D82103" strokeWidth="2.8" strokeLinecap="round" />
                    <path d="M24 18L27 13" stroke="#D82103" strokeWidth="2.8" strokeLinecap="round" />
                  </svg>
                </span>
              </span>
              <span className="cafe-story-title-bites">
                7 Bites?
                {/* Curved swoop underline under 7 Bites? */}
                <span className="cafe-story-swoop" aria-hidden="true">
                  <svg viewBox="0 0 230 18" fill="none" className="w-full h-auto overflow-visible">
                    <path d="M4 6 C 70 18, 150 18, 226 4" stroke="#D82103" strokeWidth="4.5" strokeLinecap="round" />
                  </svg>
                </span>
              </span>
            </h2>

            {/* Quote paragraph */}
            <p className="cafe-story-quote">
              “People often ask: <strong>“Why the name 7 Bites?”</strong> Because real culinary magic happens in moments. The first bite excites the senses; the second brings the molten cheese pull; and by the seventh bite, you're already planning your next visit.”
            </p>

            {/* Description with green bar */}
            <div className="cafe-story-desc">
              <p>
                Nestled in Gohalpur Amkhera, Jabalpur, 7 Bites Cafe was born from a simple passion: to serve mouth-watering artisan pizzas with real mozzarella, handcrafted burgers, steaming Himalayan momos, and thick iced cold coffees in an inviting, cheerful ambiance.
              </p>
            </div>

            {/* Stats Card */}
            <div className="cafe-story-stats-card">
              <div className="cafe-story-stat-item">
                <span className="cafe-story-stat-icon" aria-hidden="true">🍕</span>
                <div className="cafe-story-stat-text">
                  <strong className="cafe-story-stat-val">250+</strong>
                  <span className="cafe-story-stat-lbl">Pizzas baked daily</span>
                </div>
              </div>

              <div className="cafe-story-stat-divider" aria-hidden="true" />

              <div className="cafe-story-stat-item">
                <span className="cafe-story-stat-icon text-[#DE2407]" aria-hidden="true">👥</span>
                <div className="cafe-story-stat-text">
                  <strong className="cafe-story-stat-val">15,000+</strong>
                  <span className="cafe-story-stat-lbl">Happy foodies</span>
                </div>
              </div>

              <div className="cafe-story-stat-divider" aria-hidden="true" />

              <div className="cafe-story-stat-item">
                <div className="cafe-story-stat-google" aria-hidden="true">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.43 7.35 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.57 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </div>
                <div className="cafe-story-stat-text">
                  <strong className="cafe-story-stat-val flex items-center gap-1">
                    4.8 <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B] inline-block" />
                  </strong>
                  <span className="cafe-story-stat-lbl">Google Rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Feast Area with Floating Callouts & Doodle Arrows */}
          <div className="cafe-story-feast-area" aria-label="7 Bites food feast highlights">
            {/* Callout 1: 100% Real Cheese Pull */}
            <div className="cafe-story-callout cafe-callout-cheesepull">
              <span className="cafe-callout-burst" aria-hidden="true">
                <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
                  <path d="M3 15L1 11" stroke="#D82103" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M11 9V1" stroke="#D82103" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M19 15L21 11" stroke="#D82103" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </span>
              <div className="cafe-callout-card">
                <span className="cafe-callout-top">100% Real</span>
                <span className="cafe-callout-bottom">Cheese Pull</span>
              </div>
              {/* Doodle curved arrow pointing down-right */}
              <div className="cafe-callout-arrow cafe-arrow-down-right" aria-hidden="true">
                <svg width="38" height="34" viewBox="0 0 38 34" fill="none">
                  <path d="M6 4 C 10 18, 20 28, 32 28" stroke="#251610" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M24 23 L 33 28 L 27 33" stroke="#251610" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Callout 2: Signature Cold Brews */}
            <div className="cafe-story-callout cafe-callout-coldbrew">
              <div className="cafe-callout-card">
                <span className="cafe-callout-top">Signature</span>
                <span className="cafe-callout-bottom">Cold Brews</span>
              </div>
              {/* Doodle curved arrow pointing down-right */}
              <div className="cafe-callout-arrow cafe-arrow-coldbrew" aria-hidden="true">
                <svg width="34" height="36" viewBox="0 0 34 36" fill="none">
                  <path d="M4 4 C 8 20, 18 30, 28 32" stroke="#251610" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M20 28 L 29 32 L 25 36" stroke="#251610" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Callout 3: Crispy Handcrafted Burgers */}
            <div className="cafe-story-callout cafe-callout-burger">
              <div className="cafe-callout-card">
                <span className="cafe-callout-top">Crispy Handcrafted</span>
                <span className="cafe-callout-bottom">Burgers</span>
              </div>
              {/* Doodle curved arrow pointing up-right */}
              <div className="cafe-callout-arrow cafe-arrow-burger" aria-hidden="true">
                <svg width="36" height="32" viewBox="0 0 36 32" fill="none">
                  <path d="M4 26 C 14 24, 24 16, 30 6" stroke="#251610" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M22 8 L 31 5 L 32 14" stroke="#251610" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Callout 4: Steamed Himalayan Momos */}
            <div className="cafe-story-callout cafe-callout-momos">
              <div className="cafe-callout-card">
                <span className="cafe-callout-top">Steamed</span>
                <span className="cafe-callout-bottom">Himalayan Momos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Strip */}
      <section className="cafe-quickinfo-section" aria-label="Cafe quick information">
        <div className="cafe-section-inner">
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
        </div>
      </section>

      {/* Signature Bites */}
      <SignatureDishes onAdd={addItem} />

      {/* Full Menu */}
      <MenuListing selected={selected} onAdd={addItem} onRemove={removeItem} />

      {/* The 7 Bites Philosophy */}
      <section className="cafe-seven-section" id="philosophy" aria-labelledby="seven-title">
        <div className="cafe-section-inner">
          {/* Eyebrow & 3D Title */}
          <div className="cafe-philosophy-header">
            <div className="cafe-philosophy-eyebrow-wrap">
              <div className="cafe-philosophy-eyebrow">
                <span className="cafe-philosophy-green-dot" />
                <span>The 7 Bites Philosophy</span>
              </div>
              {/* 3 Red Burst Rays */}
              <svg
                className="cafe-philosophy-burst"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="6" y1="18" x2="2" y2="14" />
                <line x1="12" y1="17" x2="12" y2="10" />
                <line x1="18" y1="18" x2="22" y2="14" />
              </svg>
            </div>

            <h2 className="cafe-philosophy-title" id="seven-title">
              <span className="cafe-philosophy-title-brown">Every Bite Tells a </span>
              <span className="cafe-philosophy-title-red">
                Story
                {/* Curved swoop underline */}
                <svg
                  className="cafe-philosophy-swoop"
                  viewBox="0 0 140 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M4 14C45 4 95 6 136 12C105 15 50 16 4 14Z" fill="#D82103" />
                </svg>
              </span>
            </h2>

            <p className="cafe-philosophy-subtitle">
              From that first sizzling crunch to the craving that brings you back — discover what makes each bite special.
            </p>

            {/* Pizza Divider */}
            <div className="cafe-philosophy-divider" aria-hidden="true">
              <span className="cafe-philosophy-divider-line" />
              <span className="cafe-philosophy-divider-icon">🍕</span>
              <span className="cafe-philosophy-divider-line" />
            </div>
          </div>

          {/* 6 Cards Grid */}
          <div className="cafe-philosophy-grid">
            {sevenBitesSteps.map((step) => (
              <div className="cafe-philosophy-card" key={step.num}>
                <div className="cafe-philosophy-card-body">
                  <div className="cafe-philosophy-card-header">
                    <span
                      className="cafe-philosophy-card-pill"
                      style={{ backgroundColor: step.pillBg }}
                    >
                      {step.num}
                    </span>
                    <span className="cafe-philosophy-card-emoji">{step.emoji}</span>
                  </div>

                  <h3 className="cafe-philosophy-card-title">{step.title}</h3>
                  <h4 className="cafe-philosophy-card-subtitle">{step.subtitle}</h4>
                  <p className="cafe-philosophy-card-desc">{step.desc}</p>

                  <div className="cafe-philosophy-card-badges">
                    <span className="cafe-philosophy-tag">
                      <span className="cafe-philosophy-tag-icon">{step.badge1.icon}</span>
                      <span>{step.badge1.text}</span>
                    </span>
                    <span className="cafe-philosophy-tag">
                      <span className="cafe-philosophy-tag-icon">{step.badge2.icon}</span>
                      <span>{step.badge2.text}</span>
                    </span>
                  </div>
                </div>

                <img
                  src={step.image}
                  alt={step.title}
                  className="cafe-philosophy-card-photo"
                  loading="lazy"
                />
              </div>
            ))}
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
            {/* Eyebrow badge */}
            <div className="cafe-reviews-eyebrow-wrap">
              <div className="cafe-reviews-eyebrow">
                <span className="cafe-reviews-green-heart">💚</span>
                <span>Loved in Jabalpur</span>
              </div>
              {/* 3 Red Burst Rays */}
              <svg
                className="cafe-reviews-burst"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="6" y1="18" x2="2" y2="14" />
                <line x1="12" y1="17" x2="12" y2="10" />
                <line x1="18" y1="18" x2="22" y2="14" />
              </svg>
            </div>

            {/* 3D Headline */}
            <h2 className="cafe-reviews-title" id="reviews-title">
              <span className="cafe-reviews-title-brown">Words from Our </span>
              <span className="cafe-reviews-title-red">
                Foodies
                {/* Curved swoop underline */}
                <svg
                  className="cafe-reviews-swoop"
                  viewBox="0 0 140 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M4 14C45 4 95 6 136 12C105 15 50 16 4 14Z" fill="#D82103" />
                </svg>
              </span>
            </h2>

            {/* Subtitle */}
            <p className="cafe-reviews-subtitle">
              Read what our guests have to say about our food, coffee, and cafe ambiance.
            </p>

            {/* Google Rating Pill Flanked by Dividers */}
            <div className="cafe-reviews-rating-bar" aria-label="4.8 Google rating from 450+ reviews">
              <span className="cafe-reviews-divider-line" />
              <div className="cafe-reviews-google-badge">
                <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <div className="cafe-reviews-google-text">
                  <div className="flex items-center gap-2">
                    <strong className="cafe-reviews-score">4.8</strong>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>
                  </div>
                  <span className="cafe-reviews-sublabel">Based on 450+ Google Reviews</span>
                </div>
              </div>
              <span className="cafe-reviews-divider-line" />
            </div>
          </div>

          {/* 6 Review Cards Grid */}
          <div className="cafe-review-grid">
            {customerReviews.map((rev) => (
              <article className="cafe-review-card" key={rev.name}>
                <div className="cafe-review-card-top">
                  <div className="cafe-reviewer">
                    <div className="cafe-avatar">{rev.initials}</div>
                    <div className="cafe-reviewer-meta">
                      <strong>{rev.name}</strong>
                      <small>{rev.role}</small>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-[#16A34A] shrink-0 opacity-80" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                <div className="cafe-stars">
                  {Array.from({ length: rev.rating }, (_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="cafe-review-quote">“{rev.text}”</p>
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
