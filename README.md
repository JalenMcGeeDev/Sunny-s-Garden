# Sunny's Garden 🌻

Handcrafted cedar planter boxes — the Sunny Collection. Built with Next.js, Tailwind CSS, and Stripe Elements.

**Domain:** [sunnys.garden](https://sunnys.garden)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```
STRIPE_SECRET_KEY=              # Stripe secret key (test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # Stripe publishable key (test mode)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CONTACT_EMAIL=hello@sunnys.garden
INSTAGRAM_URL=https://instagram.com/sunnysgarden
```

The site runs without Stripe keys (UI demo only). Add Stripe test keys to enable checkout.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home — hero, product previews, brand story
│   ├── shop/page.tsx      # Shop — full product listings with Buy Now
│   ├── about/page.tsx     # About — brand story and photos
│   ├── checkout/page.tsx  # Checkout — Stripe Elements payment form
│   ├── order-confirmation/page.tsx  # Post-payment receipt
│   └── api/create-payment-intent/   # PaymentIntent creation endpoint
├── components/            # Reusable UI components
├── data/                  # Demo product & about data (swap for Supabase later)
├── lib/                   # Data access layer, Stripe client, utilities
└── types/                 # TypeScript type definitions
```

## Tech Stack

- **Next.js 16** (App Router, Server Components)
- **Tailwind CSS v4** (utility-first responsive styling)
- **Stripe Elements** (on-site payment — buyer never leaves the site)
- **TypeScript** (full type safety)

## Architecture Notes

- **Data access layer** (`src/lib/data.ts`): All product data flows through this abstraction. Currently returns hardcoded demo data. Designed for a clean swap to Supabase queries.
- **Stripe Elements** (not Stripe Checkout): Payment is embedded on-site using `PaymentElement`. Card data never touches our server.
- **Dynamic catalog**: Product schema supports any number of products (not fixed at 3).

## What's Next (Deferred)

- Supabase integration (database, auth, storage)
- Admin backend (order management, product CRUD, about CMS)
- Stripe webhooks for server-side order creation
- Email notifications (Resend + React Email)
- Product photo uploads via admin