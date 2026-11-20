# 7 Bites Cafe — Foundation and Hero

## Build

- Replace the blank home screen with a complete, mobile-first 7 Bites Cafe hero page, using the brief’s playful sticker-and-doodle art direction, warm palette, and short Hinglish copy.
- Add a compact responsive navigation with Menu, Story, Offers, Gallery, Visit, and Order Now links; mobile navigation opens as a full-screen menu.
- Establish the global type and semantic color tokens, accessible focus states, light-only visual treatment, paper texture, and restrained motion that honors reduced-motion settings.
- Add the hero food visual, hand-drawn supporting accents, two calls to action, and a scalloped transition into a simple quick-info ribbon. Keep later story, menu, offer, gallery, review, and visit content out of scope until requested.
- Use clearly marked placeholders for business details; do not invent phone numbers, address, hours, ratings, or reviews.
- Add app-specific metadata for the home page and keep the page semantic and keyboard accessible.

## Technical approach

- Preserve the project’s TanStack Start and Tailwind v4 setup; these are fixed by the workspace, so do not migrate to Next.js.
- Use the existing UI/button conventions and CSS-based animation rather than adding animation/scroll dependencies for a single initial screen.
- Keep the hero’s food artwork in project assets and avoid remote hotlinked imagery.
