# ModernShop Frontend - Next.js Premium Storefront

A high-performance, responsive eCommerce frontend built with Next.js (App Router), Tailwind CSS, and Shadcn UI.

## 🚀 Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms/Validation**: Zod
- **Icons**: Lucide-React

## 🛍 Storefront Features
- **Multi-Currency Support**: Instant switching between `USD ($)` and `INR (₹)` with automatic site-wide price formatting and conversion.
- **Global Search**: High-performance functional search bar in the navbar that queries product names, descriptions, and SKUs.
- **Account Dashboard**: Integrated User Profile, Address Manager, and Order History.
- **Smart Checkout**: Intelligent address selection (stored vs. new address) and multiple payment methods (Stripe, PayPal, COD).
- **Product Details**: Immersive gallery with multi-image support (Carousel/Grid) and variant status.
- **Admin Dashboard**: Real-time sales monitoring and customer order tracking.
- **Responsive Navigation**: Premium-feel sidebar and sticky navbar with cart synchronization.

## 📂 Project Structure
```text
frontend/
├── src/
│   ├── app/              # Routes & Pages (App Router logic)
│   │   ├── (auth)/       # Grouped authentication routes
│   │   ├── admin/        # Protected admin dashboard pages
│   │   ├── products/     # Product catalog and details
│   │   └── ...           # Cart, Checkout, Profile
│   ├── components/       # Reusable UI parts
│   │   ├── ui/           # Shadcn base components
│   │   ├── layout/       # Navbar, Footer
│   │   └── product/      # Product-specific cards/grids
│   ├── hooks/            # Custom hooks for API calls (React Query)
│   ├── services/         # Axios instance and API client setup
│   ├── store/            # Zustand stores (Auth, Cart)
│   ├── types/            # Global TypeScript interfaces
│   └── utils/            # Formatting and helper functions
└── public/               # Static assets
```

## 🏗 Design System & Patterns
### 1. Theme Configuration
Premium aesthetics are managed via CSS variables in `globals.css` and tokens in `tailwind.config.ts`.
### 2. Client Boundary
Next.js uses Server Components by default. Use `'use client'` only for interactive components (Forms, Cart management).
### 3. Hydration Safety
Components accessing browser APIs or global state during initial render (like `Navbar`) must use a `mounted` check to prevent SSR hydration mismatches.
```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

## 🛠 Adding a New Feature
1. **API Service**: Define the endpoint call in `src/services/apiClient.ts` if it's a new domain.
2. **Hook**: Create a custom hook in `src/hooks/` using `useQuery` or `useMutation`.
3. **Component**: Build the UI in `src/components/`, prioritizing Shadcn primitives.
4. **Page**: Add the route in `src/app/` and consume your hook.

## 🤖 Guide for AI Agents
- **Icons**: Use `Lucide-React`.
- **Forms**: Use Shadcn `Form` or standalone `Input`/`Button` with React State + Zod.
- **State**: `authStore` handles login state/tokens. `cartStore` handles checkout items.
- **Images**: Use standard `img` for external Unsplash photos to avoid `next/image` domain whitelist restrictions unless specifically requested.
- **Loading**: Use the `Loader2` spinner from Lucide for consistent loading states.
