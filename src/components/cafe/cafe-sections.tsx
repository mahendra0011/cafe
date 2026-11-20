import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  CircleDot,
  Clock3,
  Coffee,
  MapPin,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cafeSite, menuCategories, type MenuCategory, type MenuItem } from "@/config/site";
import { CafeOpenStatus } from "@/components/cafe/cafe-status";
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
const stickerImages = [pizzaSticker, burgerSticker, momosSticker, coffeeSticker];
const galleryImages = [
  { src: pizzaSticker, alt: "Illustrated cheesy pizza slice", label: "A little extra cheese" },
  { src: coffeeSticker, alt: "Illustrated iced coffee and brownie", label: "Sip, then repeat" },
  { src: burgerSticker, alt: "Illustrated burger and fries", label: "Big-bite energy" },
  { src: momosSticker, alt: "Illustrated momos with dipping sauce", label: "Momo mood" },
  { src: coffeeSticker, alt: "Illustrated brownie and coffee", label: "Sweet little pause" },
  { src: pizzaSticker, alt: "Illustrated pizza topped with pepperoni", label: "Slice of happy" },
  { src: momosSticker, alt: "Illustrated plate of momos", label: "Dip. Bite. Smile." },
  { src: burgerSticker, alt: "Illustrated cafe burger", label: "Stacked just right" },
];

function formatPrice(value: number) {
  return `₹${value}`;
}

function itemPrice(item: MenuItem, size?: MenuSize) {
  return item.sizes?.find((option) => option.label === size)?.price ?? item.price;
}

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
        <span aria-hidden="true">✳</span>
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
            <Sparkles />
          </span>
        ))}
      </div>
    </div>
  );
}

function OrderButton({
  item,
  onAdd,
  label = "Add to order",
}: {
  item: MenuItem;
  onAdd: (item: MenuItem, size?: MenuSize) => void;
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant="cheese"
      size="sm"
      className="cafe-button cafe-add-button"
      onClick={() => onAdd(item, item.sizes?.[1]?.label)}
    >
      <Plus aria-hidden="true" />
      {label}
    </Button>
  );
}

function FoodMarker({ diet }: { diet: MenuItem["diet"] }) {
  return (
    <span
      className={`cafe-food-marker ${diet === "veg" ? "is-veg" : "is-non-veg"}`}
      aria-label={diet === "veg" ? "Vegetarian" : "Non-vegetarian"}
      title={diet === "veg" ? "Vegetarian" : "Non-vegetarian"}
    >
      <span />
    </span>
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
  const [category, setCategory] = useState<MenuCategory | "All">("All");
  const [diet, setDiet] = useState<DietFilter>("all");
  const [query, setQuery] = useState("");
  const [bestsellers, setBestsellers] = useState(false);
  const [sizes, setSizes] = useState<Record<string, MenuSize>>({});

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchesCategory = category === "All" || item.category === category;
        const matchesDiet = diet === "all" || item.diet === diet;
        const matchesSearch = `${item.name} ${item.description} ${item.category}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        return matchesCategory && matchesDiet && matchesSearch && (!bestsellers || item.bestseller);
      }),
    [category, diet, query, bestsellers],
  );

  return (
    <section className="cafe-menu-section" id="full-menu" aria-labelledby="menu-title">
      <div className="cafe-section-inner">
        <SectionHeading
          eyebrow="Something for every craving"
          title="The full menu"
          titleId="menu-title"
          note="Sample menu & prices — confirm the final items and rates before publishing."
        />
        <div className="cafe-menu-controls">
          <div className="cafe-category-tabs" role="group" aria-label="Filter by menu category">
            {["All", ...menuCategories].map((value) => (
              <Button
                key={value}
                type="button"
                variant={category === value ? "pepperoni" : "paper"}
                size="sm"
                className="cafe-filter-pill"
                aria-pressed={category === value}
                onClick={() => setCategory(value as MenuCategory | "All")}
              >
                {value}
              </Button>
            ))}
          </div>
          <div className="cafe-filter-row">
            <label className="cafe-search-box">
              <Search aria-hidden="true" />
              <span className="sr-only">Search menu</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the menu"
              />
            </label>
            <label className="cafe-select-label">
              <span className="sr-only">Diet preference</span>
              <select value={diet} onChange={(event) => setDiet(event.target.value as DietFilter)}>
                <option value="all">All dishes</option>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-vegetarian</option>
              </select>
            </label>
            <Button
              type="button"
              variant={bestsellers ? "cheese" : "paper"}
              size="sm"
              className="cafe-filter-pill"
              aria-pressed={bestsellers}
              onClick={() => setBestsellers((value) => !value)}
            >
              <Star aria-hidden="true" />
              Best sellers
            </Button>
            <Button
              type="button"
              variant="paper"
              size="sm"
              className="cafe-filter-pill cafe-print-menu"
              onClick={() => window.print()}
            >
              Print / save menu
            </Button>
          </div>
        </div>

        <div className="cafe-menu-list" aria-live="polite">
          {filtered.length ? (
            filtered.map((item) => {
              const size = sizes[item.id] ?? item.sizes?.[1]?.label;
              return (
                <article className="cafe-menu-row" key={item.id}>
                  <div className="cafe-menu-item-copy">
                    <FoodMarker diet={item.diet} />
                    <div>
                      <h3>
                        {item.name}{" "}
                        {item.tag ? <span className="cafe-menu-tag">{item.tag}</span> : null}
                      </h3>
                      <p>{item.description}</p>
                    </div>
                  </div>
                  <div className="cafe-menu-item-actions">
                    {item.sizes?.length ? (
                      <label className="cafe-size-select">
                        <span className="sr-only">Size for {item.name}</span>
                        <select
                          value={size}
                          onChange={(event) =>
                            setSizes((state) => ({
                              ...state,
                              [item.id]: event.target.value as MenuSize,
                            }))
                          }
                        >
                          {item.sizes.map((option) => (
                            <option key={option.label} value={option.label}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                    <strong className="cafe-menu-price">
                      {formatPrice(itemPrice(item, size))}
                    </strong>
                    <OrderButton
                      item={item}
                      onAdd={(menuItem) => onAdd(menuItem, size)}
                      label="Add"
                    />
                  </div>
                </article>
              );
            })
          ) : (
            <p className="cafe-empty-menu">No dishes match that search. Try another craving.</p>
          )}
        </div>

        {selected.length ? (
          <div className="cafe-order-tray" aria-live="polite">
            <div>
              <ShoppingBag aria-hidden="true" />
              <strong>Your picks ({selected.length})</strong>
              <span>
                {selected
                  .map(({ item, size }) => `${item.name}${size ? ` · ${size}` : ""}`)
                  .join(" / ")}
              </span>
            </div>
            <div className="cafe-tray-actions">
              <Button asChild variant="pepperoni" size="sm" className="cafe-button">
                <a href="#order">
                  Plan an enquiry <ArrowUpRight aria-hidden="true" />
                </a>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Clear selected dishes"
                onClick={() => selected.forEach(({ key }) => onRemove(key))}
              >
                <X aria-hidden="true" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
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
          eyebrow="A few crowd-pleasers"
          title="Big bite energy"
          titleId="signature-title"
          note="Illustrated menu previews · sample prices shown."
        />
        <div className="cafe-signature-rail">
          {featured.map((item, index) => (
            <article className={`cafe-signature-item signature-tone-${index % 3}`} key={item.id}>
              <div className="cafe-signature-art">
                <img src={imageFor(item)} alt="" loading="lazy" />
                <span className="cafe-signature-sticker">{item.tag ?? "A good pick"}</span>
              </div>
              <div className="cafe-signature-copy">
                <span className="cafe-signature-category">
                  <FoodMarker diet={item.diet} />
                  {item.category}
                </span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="cafe-signature-bottom">
                  <strong>{formatPrice(item.price)}</strong>
                  <OrderButton item={item} onAdd={onAdd} />
                </div>
              </div>
            </article>
          ))}
        </div>
        <a className="cafe-text-link" href="#full-menu">
          Explore all the menu <ArrowDownRight aria-hidden="true" />
        </a>
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
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "Tab") {
        const focusable =
          dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
        const first = focusable?.item(0);
        const last = focusable?.item((focusable?.length ?? 1) - 1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [active]);

  return (
    <section className="cafe-gallery-section" id="gallery" aria-labelledby="gallery-title">
      <div className="cafe-section-inner">
        <div className="cafe-gallery-heading">
          <SectionHeading
            eyebrow="A little eye candy"
            title="A bite of the good stuff"
            titleId="gallery-title"
            note="Illustrated previews until the café’s real photos are added."
          />
          <span className="cafe-gallery-doodle" aria-hidden="true">
            made with
            <br />a little love <ArrowDownRight />
          </span>
        </div>
        <div className="cafe-gallery-grid">
          {galleryImages.map((image, index) => (
            <Button
              type="button"
              key={`${image.label}-${index}`}
              variant="ghost"
              className={`cafe-gallery-tile gallery-tile-${index + 1}`}
              onClick={() => setActive(index)}
              aria-label={`Open illustration: ${image.label}`}
            >
              <span className="cafe-gallery-photo">
                <img src={image.src} alt={image.alt} loading="lazy" />
              </span>
              <span className="cafe-gallery-caption">{image.label}</span>
            </Button>
          ))}
        </div>
      </div>
      {active !== null ? (
        <div
          ref={dialogRef}
          className="cafe-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Food illustration viewer"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
          tabIndex={-1}
        >
          <Button
            type="button"
            variant="paper"
            size="icon"
            className="cafe-lightbox-close"
            aria-label="Close illustration"
            onClick={close}
          >
            <X />
          </Button>
          <Button
            type="button"
            variant="paper"
            size="icon"
            className="cafe-lightbox-prev"
            aria-label="Previous illustration"
            onClick={() => step(-1)}
          >
            <ArrowLeft />
          </Button>
          <figure>
            <img
              src={galleryImages[active]?.src}
              alt={galleryImages[active]?.alt ?? "Cafe food illustration"}
            />
            <figcaption>{galleryImages[active]?.label}</figcaption>
          </figure>
          <Button
            type="button"
            variant="paper"
            size="icon"
            className="cafe-lightbox-next"
            aria-label="Next illustration"
            onClick={() => step(1)}
          >
            <ArrowRight />
          </Button>
        </div>
      ) : null}
    </section>
  );
}

function ReservationForm({ selected }: { selected: OrderPick[] }) {
  const [requestSummary, setRequestSummary] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const summary = [
      `Name: ${data.get("name") ?? ""}`,
      `Phone: ${data.get("phone") ?? ""}`,
      `Date: ${data.get("date") ?? ""}`,
      `Time: ${data.get("time") ?? ""}`,
      `Guests: ${data.get("guests") ?? ""}`,
      `Note: ${data.get("note") || "—"}`,
      `Menu picks: ${selected.length ? selected.map(({ item, size }) => `${item.name}${size ? ` (${size})` : ""} — ${formatPrice(itemPrice(item, size))}`).join(", ") : "None"}`,
    ].join("\n");
    setRequestSummary(summary);
    setSubmitted(true);
  };

  return (
    <div className="cafe-reservation" id="order">
      <div className="cafe-reservation-heading">
        <p className="cafe-section-eyebrow">
          <span aria-hidden="true">✳</span>Planning a visit?
        </p>
        <h3>Let’s save you a spot.</h3>
        <p>Share the details to prepare an enquiry. Nothing is sent or booked from this demo.</p>
      </div>
      <form className="cafe-reservation-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" autoComplete="name" placeholder="Your name" required />
        </label>
        <label>
          Phone
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Your phone number"
            required
          />
        </label>
        <label>
          Date
          <input name="date" type="date" required />
        </label>
        <label>
          Time
          <input name="time" type="time" required />
        </label>
        <label>
          Guests
          <input name="guests" type="number" min="1" inputMode="numeric" placeholder="2" required />
        </label>
        <label className="cafe-reservation-note">
          Anything else?
          <input name="note" placeholder="A little note (optional)" />
        </label>
        <Button
          type="submit"
          variant="pepperoni"
          size="lg"
          className="cafe-button cafe-reservation-submit"
        >
          Prepare enquiry <ArrowUpRight aria-hidden="true" />
        </Button>
      </form>
      {submitted ? (
        <div className="cafe-form-result" role="status">
          <Check aria-hidden="true" />
          <div>
            <strong>Your enquiry draft is ready.</strong>
            <p>We still need the café’s real WhatsApp number before it can be sent.</p>
            <pre>{requestSummary}</pre>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Dismiss enquiry draft"
            onClick={() => setSubmitted(false)}
          >
            <X />
          </Button>
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
      <section className="cafe-marquee-section" aria-label="Cafe highlights and quick information">
        <div className="cafe-ribbon-stack">
          <CafeRibbon>CHEESE PULL · COLD COFFEE · BURGERS · MOMOS · PASTA ·</CafeRibbon>
          <CafeRibbon reverse>EK BITE AUR? · CHHATARPUR · CAFÉ FAVOURITES ·</CafeRibbon>
        </div>
        <div className="cafe-quick-info" id="quick-info">
          <a
            className="cafe-info-item"
            href={cafeSite.googleMapsSearchUrl}
            target="_blank"
            rel="noreferrer"
          >
            <MapPin aria-hidden="true" />
            <span>
              {cafeSite.city}, {cafeSite.region}
            </span>
            <ArrowUpRight aria-hidden="true" />
          </a>
          <span className="cafe-info-item">
            <Clock3 aria-hidden="true" />
            <span>
              Hours <strong>[ADD OPENING HOURS]</strong> <CafeOpenStatus />
            </span>
          </span>
          <span className="cafe-info-item">
            <Coffee aria-hidden="true" />
            <span>Dine-in · Takeaway · Delivery</span>
          </span>
          <a className="cafe-info-item" href="#visit">
            <CircleDot aria-hidden="true" />
            <span>Plan a visit</span>
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="cafe-story-section" id="story" aria-labelledby="story-title">
        <div className="cafe-story-inner">
          <span className="cafe-story-seven" aria-hidden="true">
            7
          </span>
          <div className="cafe-story-copy">
            <p className="cafe-section-eyebrow">
              <span aria-hidden="true">✳</span>Our little story
            </p>
            <h2 id="story-title">
              Why <span>7 Bites?</span>
            </h2>
            <p>
              Seven bites? Naam mein thoda drama hai. The real idea is simple: ek achha bite makes
              you want one more.
            </p>
            <p>
              So here’s a little corner for cheesy cravings, cold sips, and the people you bring
              along. The details are yours to make true.
            </p>
            <div className="cafe-story-stats">
              {cafeSite.stats.map((stat) => (
                <span key={stat.label}>
                  <strong>{stat.value}</strong>
                  <small>{stat.label}</small>
                </span>
              ))}
            </div>
          </div>
          <div className="cafe-story-collage">
            <figure className="story-photo story-photo-one">
              <img src={pizzaSticker} alt="Illustrated pizza slice" loading="lazy" />
              <figcaption>one more bite?</figcaption>
            </figure>
            <figure className="story-photo story-photo-two">
              <img src={coffeeSticker} alt="Illustrated cold coffee" loading="lazy" />
              <figcaption>sip happens</figcaption>
            </figure>
            <span className="cafe-story-note">
              our little
              <br />
              food corner <ArrowDownRight aria-hidden="true" />
            </span>
          </div>
        </div>
      </section>

      <SignatureDishes onAdd={addItem} />
      <MenuListing selected={selected} onAdd={addItem} onRemove={removeItem} />

      <section className="cafe-seven-section" aria-labelledby="seven-title">
        <div className="cafe-seven-inner">
          <div className="cafe-seven-heading">
            <p className="cafe-section-eyebrow">
              <span aria-hidden="true">✳</span>A little list
            </p>
            <h2 id="seven-title">The 7 Bites</h2>
            <p>Seven small reasons to make room for one more bite.</p>
          </div>
          <div className="cafe-seven-list">
            {[
              "Cheese makes a good day better",
              "A menu for the whole table",
              "Something warm, something chilled",
              "A little spice, your way",
              "Sweet endings count too",
              "Made for sharing stories",
              "One more bite? Always.",
            ].map((line, index) => (
              <div className="cafe-seven-row" key={line}>
                <span className="cafe-seven-number">0{index + 1}</span>
                <p>{line}</p>
                <Sparkles aria-hidden="true" />
              </div>
            ))}
          </div>
          <span className="cafe-seven-slice" aria-hidden="true">
            7
          </span>
        </div>
      </section>

      <section className="cafe-offers-section" id="offers" aria-labelledby="offers-title">
        <div className="cafe-section-inner">
          <SectionHeading
            eyebrow="Good things, TBD"
            title="Combos & offers"
            titleId="offers-title"
            note="Offer names, inclusions, prices and dates are placeholders until confirmed."
          />
          <div className="cafe-offer-board">
            {["Pizza + Cold Coffee Combo", "Family Feast", "Student Saver", "Birthday Table"].map(
              (offer, index) => (
                <article
                  className={`cafe-offer-ticket offer-ticket-${index + 1} perforated`}
                  key={offer}
                >
                  <span className="cafe-offer-kicker">[ADD OFFER DETAILS]</span>
                  <h3>{offer}</h3>
                  <p>[ADD WHAT’S INCLUDED]</p>
                  <div className="cafe-offer-bottom">
                    <strong>[ADD PRICE]</strong>
                    <a href="#order">
                      Ask about it <ArrowUpRight aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ),
            )}
            <span className="cafe-offer-burst" aria-hidden="true">
              SAVE
              <br />
              MORE
            </span>
          </div>
          <p className="cafe-offer-validity">Validity: {cafeSite.offerValidity}</p>
        </div>
      </section>

      <Gallery />

      <section className="cafe-reviews-section" aria-labelledby="reviews-title">
        <div className="cafe-section-inner">
          <div className="cafe-reviews-intro">
            <SectionHeading
              eyebrow="Your words matter"
              title="Notes from the table"
              titleId="reviews-title"
              note="Review placeholders only — add genuine customer feedback before publishing."
            />
            <div className="cafe-review-score">
              <span className="cafe-stars" aria-label="Rating placeholder">
                ☆ ☆ ☆ ☆ ☆
              </span>
              <strong>[4.X]</strong>
              <small>on Google · placeholder</small>
            </div>
          </div>
          <div className="cafe-review-rail">
            {[0, 1].map((row) => (
              <div className="cafe-review-row" key={row}>
                {[0, 1, 2].map((slot) => (
                  <article
                    className={`cafe-review-slip review-slip-${slot + 1}`}
                    key={`${row}-${slot}`}
                  >
                    <span className="cafe-review-tape" aria-hidden="true" />
                    <span className="cafe-stars" aria-hidden="true">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} aria-hidden="true" />
                      ))}
                    </span>
                    <p>[DHEERE GENUINE REVIEW TEXT ADD KARO]</p>
                    <footer>
                      <strong>[CUSTOMER NAME]</strong>
                      <span>Google Review • placeholder</span>
                    </footer>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cafe-visit-section" id="visit" aria-labelledby="visit-title">
        <div className="cafe-visit-inner">
          <div className="cafe-visit-copy">
            <p className="cafe-section-eyebrow">
              <span aria-hidden="true">✳</span>Come say hi
            </p>
            <h2 id="visit-title">
              Find your way
              <br />
              to <span>good bites.</span>
            </h2>
            <div className="cafe-visit-detail">
              <MapPin aria-hidden="true" />
              <div>
                <strong>Where to find us</strong>
                <p>
                  {cafeSite.address}
                  <br />
                  {cafeSite.city}, {cafeSite.region}
                </p>
              </div>
            </div>
            <div className="cafe-visit-detail">
              <Clock3 aria-hidden="true" />
              <div>
                <strong>Opening hours</strong>
                <p>{cafeSite.hours}</p>
              </div>
            </div>
            <div className="cafe-visit-links">
              <Button asChild variant="pepperoni" size="sm" className="cafe-button">
                <a href={cafeSite.googleMapsSearchUrl} target="_blank" rel="noreferrer">
                  Get directions <ArrowUpRight aria-hidden="true" />
                </a>
              </Button>
              <span>[ADD PHONE NUMBER]</span>
            </div>
            <div className="cafe-social-links">
              <a href="#visit" aria-label="Instagram: handle to be added">
                Instagram · [ADD HANDLE]
              </a>
              <a href="#visit" aria-label="Zomato: link to be added">
                Zomato · [ADD LINK]
              </a>
              <a href="#visit" aria-label="Swiggy: link to be added">
                Swiggy · [ADD LINK]
              </a>
            </div>
          </div>
          <div className="cafe-map-frame">
            <iframe
              title="Map search for 7 Bites Cafe in Chhatarpur"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=7%20Bites%20Cafe%2C%20Chhatarpur%2C%20Madhya%20Pradesh&output=embed"
            />
            <span className="cafe-map-label">
              <MapPin aria-hidden="true" />7 Bites Cafe · Chhatarpur
            </span>
          </div>
        </div>
        <div className="cafe-section-inner">
          <ReservationForm selected={selected} />
        </div>
      </section>

      <footer className="cafe-footer">
        <div className="cafe-footer-top">
          <a className="cafe-footer-mark" href="#top" aria-label="7 Bites Cafe, back to top">
            7 Bites <span>Cafe</span>
          </a>
          <span className="cafe-footer-wordmark-big" aria-hidden="true">
            7 Bites Cafe
          </span>
          <div className="cafe-footer-links">
            <a href="#full-menu">Menu</a>
            <a href="#story">Our story</a>
            <a href="#offers">Offers</a>
            <a href="#gallery">Gallery</a>
            <a href="#visit">Visit</a>
          </div>
          <a className="cafe-back-top" href="#top">
            <ArrowUp aria-hidden="true" />
            Back to top
          </a>
        </div>
        <div className="cafe-footer-bottom">
          <span>
            © {new Date().getFullYear()} {cafeSite.name}. Made with a little extra cheese.
          </span>
          <span>Illustrations shown are artwork, not café photographs.</span>
        </div>
      </footer>
      <a className="cafe-mobile-visit" href="#visit" aria-label="Plan your visit">
        <MapPin aria-hidden="true" />
        <span>Visit</span>
      </a>
    </>
  );
}
