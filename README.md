# 7 Bites Cafe website

TanStack Start + Tailwind CSS v4 site for 7 Bites Cafe (Chhatarpur, Madhya Pradesh).

## Edit content

- Business details: `src/config/site.ts` (name, city, region, address, phone, WhatsApp, hours, openTime, closeTime, instagram, googleMapsSearchUrl, offerValidity, foundedYear).
- Menu: `src/data/menu.json` (categories, items with name, description, price in INR, diet, tag, bestseller, sizes).
- Offers/reviews/gallery copy: `src/components/cafe/cafe-sections.tsx`.

## Scripts

- `bun run dev` — dev server
- `bun run build` — production build
- `bun run lint` — eslint
- `bun run test` — vitest
- `bun run format` — prettier

## Notes

- Light theme only. Placeholders are marked with `[ADD ...]`; replace with real values before publishing.
- Do not invent phone numbers, addresses, hours, ratings or reviews.
- Small animated doodles ship as CSS/SVG keyframe animations; Lottie assets can be swapped into `CafeLottie` later if desired.
  EOF
