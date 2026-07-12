# JWT Auth Security Fixes — Design

**Date:** 2026-07-12
**Status:** Approved (Approach A — fix all confirmed issues, keep localStorage + Bearer architecture)
**Environment:** Dev only — breaking changes (forced logouts, secret rotation) are acceptable.

## Background

A security review of the JWT authentication/authorization implementation (backend `modules/auth`, `middleware/auth.middleware.ts`, `utils/jwt.ts`, `utils/bcrypt.ts`; frontend `store/authStore.ts`, `services/apiClient.ts`, `hooks/useAuth.ts`, admin layout) found four serious and three medium issues. Solid parts that stay unchanged: bcrypt cost 12, Zod validation, refresh-token rotation, SHA-256-hashed password-reset tokens, enumeration-safe forgot-password, server-side `requireAdmin` on all admin routes, helmet + restricted CORS, separate access/refresh secrets, `select: false` on sensitive columns.

## Confirmed issues

| # | Severity | Issue |
|---|----------|-------|
| 1 | High | `logout()` calls `userRepo.update(userId, { refreshToken: undefined })`. TypeORM drops `undefined` fields from the UPDATE, so the refresh token is never cleared — sessions stay valid for 7 days after logout. |
| 2 | High | `resetPassword()` sets `passwordResetToken`/`passwordResetExpires` to `undefined` before `save()` — same TypeORM behavior, so a used reset link keeps working for its full 1-hour window. |
| 3 | High | No rate limiting anywhere. `RATE_LIMIT_*` env vars exist but `express-rate-limit` is not installed or wired. Login/register/forgot-password are brute-forceable. |
| 4 | High | Placeholder JWT secrets (`your_super_secret_..._change_in_production`) in `.env`; nothing prevents production from booting with them. |
| 5 | Medium | Password reset does not invalidate existing sessions (refresh token untouched). |
| 6 | Medium | Refresh token stored in plaintext in `users.refresh_token` — a DB leak yields usable sessions. |
| 7 | Medium | Frontend: two concurrent 401s each trigger `/auth/refresh`; with rotation the second is rejected (`user.refreshToken !== token`) and the interceptor force-logs-out the user. |

Accepted risk (out of scope, by decision): access/refresh tokens remain in `localStorage` (Approach B — httpOnly cookie migration — deferred).

## Changes

### Backend

**`modules/auth/auth.service.ts`**
- `logout()`: persist `refreshToken: null` (via `update` with explicit `null`).
- `resetPassword()`: set `passwordResetToken = null`, `passwordResetExpires = null`, and `refreshToken = null` (kills all sessions on password reset).
- `login()` / `refresh()`: store `sha256(refreshToken)` (hex) in `users.refresh_token`; `refresh()` compares `sha256(incomingToken)` to the stored hash. No schema change (hash fits existing varchar column).

**`entities/user.entity.ts`** — widen the three nullable auth columns' TS types to accept `null` (`string | null`, `Date | null`) so the service can persist `null`.

**`app.ts` + `modules/auth/auth.routes.ts`** — add `express-rate-limit` (new dependency):
- General limiter on `/v1`: `RATE_LIMIT_MAX` (100) per `RATE_LIMIT_WINDOW_MS` (15 min) per IP.
- Strict limiter on `POST /auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`: 10 per 15 min per IP, message "Too many attempts, please try again later."
- `standardHeaders: true`, `legacyHeaders: false` on both.

**`config/env.ts`** — in production (`NODE_ENV === 'production'`), throw at startup if either JWT secret contains `change_in_production` or is shorter than 32 characters. Also: generate strong random secrets for the local `.env` (one-time; logs out current dev sessions).

**`modules/auth/auth.validator.ts`** — `password: z.string().min(8).max(128)` on register and reset-password schemas.

**`utils/jwt.ts`** — pin `{ algorithms: ['HS256'] }` in `verifyAccessToken` and `verifyRefreshToken`.

### Frontend

**`services/apiClient.ts`** — single-flight refresh: a module-level `refreshPromise: Promise<string> | null`. First 401 creates it; concurrent 401s `await` the same promise and retry with its result; promise cleared in `finally`. Refresh failure behavior unchanged (logout + reject). No changes to token storage, `authStore`, pages, or admin layout.

## Verification

1. `tsc --noEmit` clean in both `backend/` and `frontend/`.
2. Live API: login → logout → `POST /auth/refresh` with the old token → 401.
3. Live API: forgot-password → reset with token (succeeds) → reset with same token again → 400. Old refresh token also rejected after reset.
4. Rate limit: 11 rapid failed logins from one IP → 11th returns 429.
5. DB: `users.refresh_token` contains 64-char hex, not a JWT.
6. Frontend race: two parallel requests with an expired access token → backend logs show exactly one `/auth/refresh` call, both requests succeed.

## Non-goals

- httpOnly cookie token storage (Approach B) — deferred, revisit before launch.
- Account lockout / CAPTCHA beyond IP rate limiting.
- Refresh-token reuse detection (token-family tracking).
- Multi-device sessions (single stored refresh token per user remains; second login still invalidates the first device).
