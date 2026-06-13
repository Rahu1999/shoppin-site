# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Rajesh Industries** — a steel kitchen storage eCommerce site for a Mumbai-based manufacturer. Monorepo with two apps:

- **Backend**: Node.js + Express + TypeScript + TypeORM + MySQL + Redis — runs on port `5000`
- **Frontend**: Next.js 16.1.6 (App Router) + React 19 + Tailwind CSS v4 + Zustand + TanStack React Query v5 — runs on port `3000`

The brand sells premium food-grade stainless steel kitchen storage products (racks, organisers). All prices are in INR.

## Commands

### Backend (`cd backend`)
```bash
npm run dev            # nodemon watch mode (ts-node)
npm run build          # tsc compile to dist/
npm run start          # run compiled dist/server.js
npm run typecheck      # tsc --noEmit
npm run migration:run  # run pending TypeORM migrations
npm run migration:revert  # revert last migration
npm run seed           # seed the database
```

### Frontend (`cd frontend`)
```bash
npm run dev    # Next.js dev server
npm run build  # Next.js production build
npm run start  # serve production build
npm run lint   # ESLint
```

## Backend Architecture

### Module Pattern

Every feature lives in `src/modules/<name>/` with four files:
```
modules/<name>/
  ├── <name>.routes.ts      # Express Router + middleware wiring
  ├── <name>.controller.ts  # thin HTTP layer
  ├── <name>.service.ts     # business logic
  └── <name>.validator.ts   # Zod schemas
```

Modules present: `auth`, `users`, `products`, `categories`, `carts`, `orders`, `payments`, `reviews`, `wishlists`, `coupons`, `shipping`, `inventory`, `upload`, `audit-logs`

### Entities

All entities extend `BaseEntity` (`src/entities/base.entity.ts`):
- `id` — UUID primary key
- `createdAt` / `updatedAt` — timestamps
- `deletedAt` — soft-delete (nullable)

Full entity list: `User`, `Role`, `UserRole`, `Permission`, `RolePermission`, `Category`, `Brand`, `Product`, `ProductImage`, `ProductVariant`, `Inventory`, `InventoryLog`, `Cart`, `CartItem`, `Order`, `OrderItem`, `OrderStatusHistory`, `Payment`, `PaymentTransaction`, `Address`, `Review`, `Wishlist`, `WishlistItem`, `Coupon`, `CouponUsage`, `ShippingMethod`, `ShippingRate`, `AuditLog`

Product fields of note: `name`, `slug` (unique), `sku` (unique, optional), `basePrice`, `comparePrice`, `costPrice`, `weightGrams`, `attributes` (JSON), `tags` (JSON array), `isActive`, `isFeatured`, `shortDescription`, `description`, `metaTitle`, `metaDescription`

### Middleware

- `authMiddleware` — verifies JWT Bearer token, attaches `req.user`
- `optionalAuth` — attaches `req.user` if token present, never fails
- `requireAdmin` — checks roles, use after `authMiddleware`
- `validate(schema, target?)` — Zod validation; `target` defaults to `'body'`, pass `'query'` for GET params
- `upload` — multer disk storage in `public/uploads/`, 5 MB limit, jpg/png/webp only

### API Response Shape

```ts
// Success
{ success: true, message: string, data: T, meta?: PaginationMeta }

// Error
{ success: false, message: string, errorCode: string, errors?: Record<string, string[]> }

// Pagination meta
{ page, limit, total, totalPages, hasNext, hasPrev }
```

Use `successResponse`, `createdResponse`, `errorResponse`, `buildPaginationMeta` from `@utils/apiResponse`.

### Module Aliases (dev: tsconfig-paths, prod: module-alias)

| Alias | Path |
|---|---|
| `@config` | `src/config` / `dist/config` |
| `@entities` | `src/entities` / `dist/entities` |
| `@repositories` | `src/repositories` / `dist/repositories` |
| `@middleware` | `src/middleware` / `dist/middleware` |
| `@utils` | `src/utils` / `dist/utils` |
| `@types` | `src/types` / `dist/types` |
| `@modules` | `src/modules` / `dist/modules` |
| `@api` | `src/api` / `dist/api` |

### Other Backend Details

- **Logger**: Winston (`@config/logger`) + Morgan HTTP logger
- **Jobs**: `src/jobs/email.jobs.ts` — email job helpers
- **Events**: `src/events/order.events.ts` — order lifecycle events
- **AppError**: `@utils/AppError` — throw typed HTTP errors; has static helpers like `AppError.unauthorized(msg)`

## Backend Environment Variables

Required (server won't start without these):
```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
```

Optional with defaults:
```
PORT=5000
REDIS_HOST=localhost, REDIS_PORT=6379, REDIS_PASSWORD=
JWT_ACCESS_EXPIRES_IN=15m, JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
SMTP_HOST=smtp.gmail.com, SMTP_PORT=587, SMTP_USER=, SMTP_PASS=, SMTP_FROM=noreply@example.com
RATE_LIMIT_WINDOW_MS=900000, RATE_LIMIT_MAX=100
FRONTEND_URL=http://localhost:3000
```

## API Routes

All prefixed with `/api/v1/`:

| Route | Auth | Notes |
|---|---|---|
| `POST /auth/register` | public | |
| `POST /auth/login` | public | |
| `POST /auth/refresh` | public | |
| `POST /auth/logout` | required | |
| `GET /users/me` | required | own profile |
| `PATCH /users/me` | required | update profile |
| `GET /users/addresses` | required | |
| `POST /users/addresses` | required | |
| `PATCH /users/addresses/:id` | required | |
| `DELETE /users/addresses/:id` | required | |
| `GET /users/` | admin | list all users |
| `PATCH /users/:id` | admin | |
| `DELETE /users/:id` | admin | |
| `GET /products` | public | paginated, filterable |
| `GET /products/:slug` | public | |
| `POST /products` | admin | create |
| `PATCH /products/:id` | admin | update |
| `DELETE /products/:id` | admin | |
| `GET /categories/tree` | public | |
| `GET /carts` | optional auth | guest via `x-session-id` |
| `POST /carts/items` | optional auth | |
| `PATCH /carts/items/:id` | optional auth | |
| `DELETE /carts/items/:id` | optional auth | |
| `POST /orders/checkout` | required | |
| `GET /orders` | required | my orders |
| `GET /orders/:id` | required | |
| `GET /orders/admin/all` | admin | |
| `PATCH /orders/admin/:id/status` | admin | |
| `POST /payments/orders/:orderId` | required | process payment |
| `GET /payments/orders/:orderId` | required | |
| `GET /reviews` | public | |
| `POST /reviews` | required | |
| `GET /wishlists` | required | |
| `POST /wishlists/items` | required | |
| `DELETE /wishlists/items/:id` | required | |
| `GET /coupons/:code` | required | validate coupon |
| `GET /shipping/rates` | public | |
| `GET /inventory` | admin | |
| `PATCH /inventory/:id` | admin | |
| `POST /upload` | admin | image upload |
| `GET /health` | public | health check |

## Frontend Architecture

### State Management

- **Zustand stores** (client-only):
  - `authStore` (`src/store/authStore.ts`) — `user`, `accessToken`, `refreshToken`, `isAuthenticated`; methods: `setTokens`, `setUser`, `logout`
  - `cartStore` (`src/store/cartStore.ts`) — `items`, `cartId`, `itemCount`, `total`; methods: `setCart`, `clear`
  - `settingsStore` (`src/store/settingsStore.ts`) — placeholder; currency is INR-only

- **TanStack React Query v5** for server state. Hooks in `src/hooks/`:
  - `useProducts(query)` — paginated product list, 5-min stale time
  - `useProductDetail(slug)` — single product with variants/reviews
  - `useCategoriesTree()` — category tree, 15-min stale time
  - `useFetchCart()` — fetch cart, syncs to `cartStore`
  - `useAddToCart()`, `useUpdateCartItem()`, `useRemoveCartItem()` — mutations
  - `useAuth()` — auth operations

### API Client (`src/services/apiClient.ts`)

Axios instance pointing to `NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api/v1`).

Request interceptor:
- Attaches `Authorization: Bearer <accessToken>` from localStorage
- For guests (no token): sends `x-session-id` header from localStorage; generates UUID if none exists

Response interceptor:
- On 401: attempts token refresh via `POST /auth/refresh`, retries original request; on failure calls `authStore.logout()`

Helper wrappers (all return `data.data || data`):
- `apiGet<T>(url, params?)`
- `apiPost<T>(url, payload?)` — auto-sets `multipart/form-data` if payload is `FormData`
- `apiPut<T>(url, payload?)`
- `apiPatch<T>(url, payload?)`
- `apiDelete<T>(url)`

### Key Patterns

- `cn()` at `src/utils/cn.ts` — `clsx` + `tailwind-merge` for Tailwind class merging
- `BRAND` config at `src/config/brand.ts` — brand name, contact info, WhatsApp number, SEO text
- `theme` config at `src/config/theme.ts` — color palette, font, border radii
- `buildWhatsAppLink(msg?)` and `buildProductWhatsAppLink(productName)` from `src/config/brand.ts`
- Toast notifications via `sonner` (`<Toaster>` in root layout)
- Icons via `lucide-react`

### Brand (Rajesh Industries)

- **Phone**: +91 98702 12660
- **Email**: rajeshindustries29@gmail.com
- **Address**: Sonawala Road, Goregaon East, Mumbai – 400063
- **WhatsApp**: `https://wa.me/919870212660`
- **Domain**: steelkitchen.in

### Frontend Pages

```
/                    # Home: hero, featured products, why-us, WhatsApp CTA, contact form + map
/products            # All products (paginated)
/products/[id]       # Product detail with variants, reviews
/categories          # Category listing
/category/[slug]     # Products filtered by category
/cart                # Cart page
/checkout            # Checkout form
/orders              # My orders list
/orders/[id]         # Order detail
/wishlist            # Wishlist
/profile             # Profile redirect / alias
/account             # Profile + address management
/login               # Login page
/register            # Register page
/forgot-password     # Password reset
/search              # Search results
/admin               # Admin dashboard
/admin/products      # Product management
/admin/categories    # Category management
/admin/users         # User management
/admin/orders        # Order management
```

### Contact Form (Homepage)

Uses Next.js Server Action `sendEmailAction` (`src/app/actions/sendEmail.ts`) — sends enquiry emails via nodemailer/Gmail.

Frontend env vars required for contact form:
```
EMAIL_USER=<gmail address>
EMAIL_APP_PASSWORD=<gmail app password>
```

### Global Layout

Root layout (`src/app/layout.tsx`) wraps all pages with: `ReactQueryProvider`, `Navbar`, `Footer`, `WhatsAppButton` (floating), `Toaster`. Font: Inter (Google Fonts) + DM Sans.

## Frontend Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:5000/v1      # local dev (backend mounts at /v1)
# NEXT_PUBLIC_API_URL=https://steelkitchen.in/api/v1  # production (nginx strips /api prefix)
EMAIL_USER=<gmail for contact form>
EMAIL_APP_PASSWORD=<gmail app password>
```

## Key Architecture Notes

**API mount path**: Backend Express app mounts routes at `/v1` (not `/api/v1`). In production, nginx reverse proxy receives `/api/v1` and forwards to backend's `/v1`. Local dev must use `NEXT_PUBLIC_API_URL=http://localhost:5000/v1`.

**Image URLs**: Upload endpoint returns absolute URLs like `http://localhost:5000/uploads/filename.jpg`. `next.config.ts` rewrites `/uploads/:path*` to the backend origin. `unoptimized: true` is set on Next.js Image for remote images.

**Order status values**: Backend enum stores **lowercase** (`'pending'`, `'processing'`, `'shipped'`, `'delivered'`, `'cancelled'`, `'refunded'`). Always compare with lowercase in frontend.

**Cart guest session**: Guest users get `x-session-id` from `localStorage` (UUID, auto-generated). On login, the backend merges the guest cart into the user cart.

**Payment mock**: Online payments (non-COD) use a mock gateway that always succeeds in development. COD creates payment with `PaymentStatus.PENDING` and moves order to `processing`.

## Known Pending Features (not yet implemented)

- Category filter UI on `/category/[slug]` — checkboxes render but have no state binding
- Category page pagination — static UI, no dynamic handlers
- Promo code apply on cart — input exists but not wired to `/coupons` API
- Order status timeline visualization on customer order detail page
