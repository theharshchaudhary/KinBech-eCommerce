# KinBech 🛍️

**KinBech** is a full-stack, single-vendor e-commerce platform: a Laravel 13 REST
API backend and a React 19 (Vite) single-page storefront + admin panel.

This started as a plain-PHP student project (still preserved at the repo root
for reference — see [Legacy PHP version](#legacy-php-version) below) and was
rebuilt from the ground up into a modern, production-shaped SaaS-style app.

---

## Architecture

```
KinBech-eCommerce/
├── backend/    Laravel 13 API (MySQL, Sanctum SPA auth, Spatie roles/permissions)
├── frontend/   React 19 + Vite SPA (Tailwind v4, TanStack Query, Zustand)
├── scripts/    Local dev helper scripts
└── *.php       Original plain-PHP app, kept for reference/history
```

The frontend and backend are fully decoupled: the API knows nothing about the
UI, and the SPA talks to it purely over HTTP + cookies (Sanctum). This means
you could point a different client (mobile app, another frontend) at the same
API without touching it.

## Feature highlights

**Storefront**
- Catalog browsing with category tree, brand/price/rating filters, search, sort, pagination
- Product detail pages with image galleries, variants (size/color/etc.), specs, reviews
- Cart, wishlist, coupon codes, address book
- Checkout with Cash on Delivery or a simulated card flow (no real payment gateway wired up)
- Order history, order tracking timeline, cancellation
- Account profile, contact form

**Admin panel** (`/admin`)
- Dashboard with revenue/top-product charts and low-stock alerts
- Product management: images, variants, specifications, stock
- Category & brand management
- Order management with status updates that email the customer
- Customer management, review moderation, contact message inbox
- Coupon management
- **Granular, fully dynamic role-based access control** — create custom staff
  roles with any combination of ~15 permissions (Spatie laravel-permission);
  assign roles to staff accounts; every admin API route is gated by permission
- **Dynamic store settings** — general info, payment methods, shipping/tax
  rules, and social links are stored in the database and take effect
  immediately, no redeploy needed
- **Dynamic mail configuration** — configure SMTP (or use the `log` driver for
  local dev) from the settings screen, including a "send test email" button;
  the app overlays these DB-stored settings onto Laravel's mail config at
  runtime

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Laravel 13, MySQL, Sanctum (SPA cookie auth) |
| Authorization | spatie/laravel-permission (roles & granular permissions) |
| Audit | spatie/laravel-activitylog |
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Data fetching | TanStack Query, Axios |
| Client state | Zustand |
| Forms | react-hook-form + Zod |
| Charts | Recharts |
| Icons | lucide-react, react-icons (brand logos) |

---

## Local development setup

### Prerequisites

- PHP 8.3+ with the `pdo_mysql`, `mbstring`, `openssl`, `curl`, `fileinfo`,
  `gd`, `intl`, `zip` extensions
- Composer
- Node.js 20+ and npm
- MySQL 8+

### 1. Database

Create a database (default name used in `.env.example`: `kinbech`).

### 2. Backend

```bash
cd backend
composer install
cp .env.example .env      # then set DB_* and FRONTEND_URL
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --port=8000
```

Seeding creates:

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@kinbech.test | password |
| Store Manager | manager@kinbech.test | password |
| Customer | customer@kinbech.test | password |

...plus a demo catalog (9 products across 3 department trees, using the
original project's product photography), two demo coupons (`WELCOME10`,
`FLAT500`), and the full default role/permission set.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL should point at the backend
npm run dev
```

Storefront: http://localhost:5173 — Admin: http://localhost:5173/admin/login

### One-command start (Windows)

If your machine matches this repo's dev setup (MySQL running standalone
rather than as a service), `scripts/start-dev.ps1` starts MySQL, the Laravel
server, and the Vite dev server together. Adjust the hardcoded paths at the
top of the script for your machine first.

### End-to-end smoke test

`frontend/smoke-test.mjs` is a small Playwright script that loads the key
storefront and admin pages (with both servers already running) and flags any
console/page errors. Run it with:

```bash
cd frontend
npx playwright install chromium   # first time only
node smoke-test.mjs
```

---

## Configuration notes

- **CORS / Sanctum**: `backend/.env`'s `FRONTEND_URL` and `SANCTUM_STATEFUL_DOMAINS`
  must match wherever the SPA is actually served from (host **and** port —
  `localhost` and `127.0.0.1` are treated as different origins for cookies).
- **File storage**: uploaded images (products, categories, brands) are stored
  on the `public` disk; `php artisan storage:link` must have been run for
  `backend/public/storage` to resolve.
- **Mail**: defaults to the `log` driver (emails are written to
  `backend/storage/logs/laravel.log`, nothing is sent). Switch to SMTP from
  Admin → Settings → Mail, no `.env` edit or restart required.
- **Payments**: Cash on Delivery and a simulated card flow only — no real
  payment gateway is integrated. Both can be toggled independently from
  Admin → Settings → Payment.

---

## Legacy PHP version

The original plain-PHP/MySQL implementation (`shop_db`, XAMPP-based) is left
untouched at the repository root for reference — see the PHP files, `css/`,
`js/`, `images/`, and `admin/` directories. It is not used by, or connected
to, the Laravel/React app in `backend/` and `frontend/`.

## Contact

📧 harshchy143@gmail.com
