# Rajesh Industries Backend - Clean Architecture eCommerce

This is the backend service for the Rajesh Industries eCommerce platform, built with Node.js, Express, and TypeORM. It follows **Clean Architecture** and **SOLID** principles to ensure scalability, maintainability, and security.

## 🚀 Tech Stack
- **Runtime**: Node.js (TypeScript)
- **Framework**: Express.js
- **Database**: MySQL (TypeORM)
- **Caching/Sessions**: Redis
- **Auth**: JWT (AccessToken + RefreshToken)
- **Logging**: Winston + Morgan (requestLogger)
- **Validation**: Zod

## 🚀 Core Features
- **Product Management**: 
  - Support for multi-file image uploads and variant-level pricing.
  - **Global Search**: High-performance multi-field search (Name, Description, SKU) using TypeORM QueryBuilder.
- **Order System**: Robust checkout flow with inventory deduction and status history.
- **Payment Integration**: 
  - **COD (Cash on Delivery)**: Handles pending payments and processing order cycles.
  - **Stripe/Mock**: Extensible provider pattern for digital payments.
- **User Account**: Comprehensive address management (Shipping/Billing types, Default flags).
- **Admin Tools**: Advanced order visibility and management endpoints.

## 📂 Project Structure
```text
backend/
├── src/
│   ├── api/ v1/          # Route versioning and entry points
│   ├── config/           # Environment, database, logger, redis configs
│   ├── entities/         # TypeORM entities (Database Schema)
│   ├── middleware/       # Auth, RBAC, Validation, Error, Logger middlewares
│   ├── modules/          # Domain Logic (Feature-based)
│   │   ├── auth/         # Login, Register, Tokens
│   │   ├── products/     # Catalog management
│   │   ├── orders/       # Cart & Checkout logic
│   │   └── ...           # Users, Categories, Coupons, Payments
│   ├── services/         # Cross-cutting concerns (Mail, S3, etc.)
│   ├── utils/            # AppError, JWT helpers, Pagination, Seeds
│   ├── types/            # TypeScript type augmentations (Express Request)
│   └── app.ts & server.ts# App initialization
└── logs/                 # Persistent log files
```

## 🏗 Coding Standards & Patterns
### 1. Unified Error Handling
Always use the `AppError` class. It ensures consistent JSON responses and automatic logging via `errorHandler`.
```typescript
throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
```

### 2. Module Pattern
Each domain feature (e.g., `products`) exists in `src/modules` and contains:
- `*.controller.ts`: Handles HTTP request/response.
- `*.service.ts`: Contains business logic.
- `*.dto.ts`: Zod schemas for input validation.
- `*.routes.ts`: Binds controller methods to paths.

### 3. Repository Pattern
Handled by TypeORM. Use `AppDataSource.getRepository(Entity)` within services.

### 4. Logging
Use the centralized `logger` from `@config/logger`. Significant events (Orders, Auth) should use specific helper methods (`logAuth`, `logOrder`).

## 🛠 Adding a New Feature
1. **Define Entity**: Create a new file in `src/entities/` and add it to `src/entities/index.ts`.
2. **Create Module**: Add a new folder in `src/modules/` with controller, service, and DTOs.
3. **Validate**: Create a Zod schema in `*.dto.ts` and use `validate(schema)` middleware in routes.
4. **Register Routes**: Add your routes to `src/api/v1/routes.ts`.
5. **Secure**: Use `protect` and `restrictTo('admin')` middlewares for protected paths.

## 🤖 Guide for AI Agents
- **Strict Typing**: Use interfaces for all payloads. Avoid `any`.
- **Paths**: Use `@alias` paths defined in `tsconfig.json`.
- **Circular Dependencies**: Always export Entities and Enums from `src/entities/index.ts` to avoid metadata initialization failures.
- **Middleware Order**: `requestLogger` -> `helmet` -> `cors` -> `json` -> `routes` -> `errorHandler`.
- **AUTOMATIC DOCUMENTATION**: **IMPORTANT:** Whenever you build a new feature, fix a bug, or make any structural change, you MUST automatically update this `README.md` file to reflect those changes without waiting for the user to ask you. Keep this document as the living source of truth.
