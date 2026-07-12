# JWT Auth Security Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 7 confirmed JWT auth vulnerabilities from `docs/superpowers/specs/2026-07-12-jwt-auth-security-design.md` while keeping the existing localStorage + Bearer architecture.

**Architecture:** Backend fixes in the auth module (revocation, hashing, rate limiting, secret checks, validation); one frontend fix in the axios client (single-flight refresh). No schema migrations — existing nullable columns are reused.

**Tech Stack:** Node/Express/TypeORM/MySQL backend, Next.js/axios frontend, `express-rate-limit` (new dependency, backend only).

## Global Constraints

- Backend API mounts at `/v1` (NOT `/api/v1`): base URL for tests is `http://localhost:5000/v1`.
- No test framework exists. Verification = `npx tsc --noEmit` + live API calls + MySQL checks. This is the established pattern for this repo.
- The backend dev server must be running for live checks: `cd D:\rahul\shopping-site\backend; npm run dev` (nodemon auto-restarts on file changes; wait ~10s after edits before curling).
- MySQL: host `localhost`, port `3307`, user `root`, password `StrongRootPassword@123`, database `ecommerce_db`. Client: `& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"`.
- NEVER commit `backend/.env`. It is gitignored; keep it that way.
- All commands below are Windows PowerShell syntax.
- Commit messages end with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

## File Structure

| File | Responsibility | Tasks |
|---|---|---|
| `backend/src/entities/user.entity.ts` | Widen 3 nullable auth column TS types to accept `null` | 1 |
| `backend/src/modules/auth/auth.service.ts` | Revocation fixes + refresh-token hashing | 1, 2 |
| `backend/src/modules/auth/auth.validator.ts` | Password max length | 3 |
| `backend/src/utils/jwt.ts` | Pin HS256 algorithm | 3 |
| `backend/src/config/env.ts` | Production secret guard | 4 |
| `backend/.env` (NOT committed) | Replace placeholder secrets | 4 |
| `backend/src/app.ts` | General API rate limiter + trust proxy | 5 |
| `backend/src/modules/auth/auth.routes.ts` | Strict auth rate limiter | 5 |
| `frontend/src/services/apiClient.ts` | Single-flight token refresh | 6 |

Task order note: rate limiting is Task 5 (last backend task) on purpose — its verification hammers the login endpoint, and earlier tasks' verifications must not get 429s.

---

### Task 1: Fix token revocation (logout + password reset)

**Files:**
- Modify: `backend/src/entities/user.entity.ts:47-54`
- Modify: `backend/src/modules/auth/auth.service.ts:126-129` (logout), `:151-171` (resetPassword)

**Interfaces:**
- Consumes: existing `userRepo` (TypeORM `Repository<User>`).
- Produces: `User.refreshToken?: string | null`, `User.passwordResetToken?: string | null`, `User.passwordResetExpires?: Date | null` — Task 2 relies on `refreshToken` accepting `null`.

**Background for the implementer:** TypeORM silently strips `undefined` values from `update()` payloads and `save()` entities. The current code "clears" tokens by setting them to `undefined`, which produces a no-op — the tokens stay valid in the DB. The fix is explicit `null`, which TypeORM persists.

- [ ] **Step 1: Reproduce the bug live (failing test)**

With the backend dev server running:

```powershell
$body = '{"firstName":"Sec","lastName":"TestOne","email":"sectest-t1@example.com","password":"Password123!"}'
$reg = Invoke-RestMethod -Uri http://localhost:5000/v1/auth/register -Method POST -ContentType 'application/json' -Body $body
$login = Invoke-RestMethod -Uri http://localhost:5000/v1/auth/login -Method POST -ContentType 'application/json' -Body '{"email":"sectest-t1@example.com","password":"Password123!"}'
$rt = $login.data.refreshToken
Invoke-RestMethod -Uri http://localhost:5000/v1/auth/logout -Method POST -Headers @{Authorization="Bearer $($login.data.accessToken)"}
# BUG: refresh with the "revoked" token still succeeds:
$refresh = Invoke-RestMethod -Uri http://localhost:5000/v1/auth/refresh -Method POST -ContentType 'application/json' -Body (@{refreshToken=$rt} | ConvertTo-Json)
$refresh.success
```

Expected (bug present): `True` — the old refresh token still works after logout.

- [ ] **Step 2: Widen the entity types**

In `backend/src/entities/user.entity.ts`, replace lines 47–54 with:

```typescript
  @Column({ name: 'refresh_token', nullable: true, select: false })
  refreshToken?: string | null;

  @Column({ name: 'password_reset_token', nullable: true, select: false })
  passwordResetToken?: string | null;

  @Column({ name: 'password_reset_expires', nullable: true, type: 'datetime', select: false })
  passwordResetExpires?: Date | null;
```

- [ ] **Step 3: Fix logout**

In `backend/src/modules/auth/auth.service.ts`, replace the `logout` method with:

```typescript
  public async logout(userId: string) {
    // Explicit null — TypeORM drops undefined fields, which made this a no-op
    await this.userRepo.update(userId, { refreshToken: null });
    logAuth('LOGOUT', userId);
  }
```

- [ ] **Step 4: Fix resetPassword**

In the same file, replace the body of `resetPassword` from `const hashedPassword = ...` through `await this.userRepo.save(user);` with:

```typescript
    const hashedPassword = await hashPassword(newPassword);
    user.passwordHash = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    // A password reset must also log out every existing session
    user.refreshToken = null;
    await this.userRepo.save(user);
```

- [ ] **Step 5: Typecheck**

Run: `cd D:\rahul\shopping-site\backend; npx tsc --noEmit`
Expected: no output (exit 0).

- [ ] **Step 6: Verify the fix live (test goes green)**

Wait ~10s for nodemon restart, then:

```powershell
$login = Invoke-RestMethod -Uri http://localhost:5000/v1/auth/login -Method POST -ContentType 'application/json' -Body '{"email":"sectest-t1@example.com","password":"Password123!"}'
$rt = $login.data.refreshToken
Invoke-RestMethod -Uri http://localhost:5000/v1/auth/logout -Method POST -Headers @{Authorization="Bearer $($login.data.accessToken)"}
try { Invoke-RestMethod -Uri http://localhost:5000/v1/auth/refresh -Method POST -ContentType 'application/json' -Body (@{refreshToken=$rt} | ConvertTo-Json) } catch { $_.Exception.Response.StatusCode.value__ }
```

Expected: `401` — refresh after logout is now rejected.

DB double-check:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -h localhost -P 3307 -u root -p"StrongRootPassword@123" ecommerce_db -e "SELECT refresh_token FROM users WHERE email='sectest-t1@example.com';"
```

Expected: `NULL`.

- [ ] **Step 7: Verify reset-token single use**

Seed a known reset token directly (email delivery can't be read in tests), then use it twice:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -h localhost -P 3307 -u root -p"StrongRootPassword@123" ecommerce_db -e "UPDATE users SET password_reset_token = SHA2('plan-test-token', 256), password_reset_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email='sectest-t1@example.com';"
$resetBody = '{"token":"plan-test-token","newPassword":"NewPassword456!"}'
(Invoke-RestMethod -Uri http://localhost:5000/v1/auth/reset-password -Method POST -ContentType 'application/json' -Body $resetBody).success
try { Invoke-RestMethod -Uri http://localhost:5000/v1/auth/reset-password -Method POST -ContentType 'application/json' -Body $resetBody } catch { $_.Exception.Response.StatusCode.value__ }
```

Expected: `True` then `400` — second use of the same reset link is rejected.

- [ ] **Step 8: Commit**

```powershell
cd D:\rahul\shopping-site
git add backend/src/entities/user.entity.ts backend/src/modules/auth/auth.service.ts
git commit -m @'
fix(auth): actually revoke tokens on logout and password reset

TypeORM drops undefined fields from update()/save(), so the previous
code never cleared refresh/reset tokens. Use explicit null, and clear
the refresh token on password reset to kill existing sessions.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 2: Hash refresh tokens at rest

**Files:**
- Modify: `backend/src/modules/auth/auth.service.ts` (`login`, `refresh`; add module-level helper)

**Interfaces:**
- Consumes: `User.refreshToken?: string | null` (Task 1). `crypto` is already imported in this file.
- Produces: DB column `users.refresh_token` now stores 64-char hex SHA-256, never the raw JWT. `refresh()` still accepts the raw JWT from clients — no API change.

- [ ] **Step 1: Add the hash helper**

In `backend/src/modules/auth/auth.service.ts`, directly above `export class AuthService {`, add:

```typescript
const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');
```

- [ ] **Step 2: Store the hash on login**

In `login()`, replace `user.refreshToken = tokens.refreshToken;` with:

```typescript
    user.refreshToken = hashToken(tokens.refreshToken);
```

- [ ] **Step 3: Compare and store hashes on refresh**

In `refresh()`, replace:

```typescript
      if (!user || user.refreshToken !== token) {
        throw AppError.unauthorized('Invalid refresh token');
      }
```

with:

```typescript
      if (!user || !user.refreshToken || user.refreshToken !== hashToken(token)) {
        throw AppError.unauthorized('Invalid refresh token');
      }
```

and replace `user.refreshToken = tokens.refreshToken;` with:

```typescript
      user.refreshToken = hashToken(tokens.refreshToken);
```

- [ ] **Step 4: Typecheck**

Run: `cd D:\rahul\shopping-site\backend; npx tsc --noEmit`
Expected: no output.

- [ ] **Step 5: Verify live**

Wait ~10s for nodemon restart, then:

```powershell
$login = Invoke-RestMethod -Uri http://localhost:5000/v1/auth/login -Method POST -ContentType 'application/json' -Body '{"email":"sectest-t1@example.com","password":"NewPassword456!"}'
$rt = $login.data.refreshToken
# 1) DB stores a 64-char hex hash, not a JWT (JWTs contain dots):
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -h localhost -P 3307 -u root -p"StrongRootPassword@123" ecommerce_db -e "SELECT refresh_token REGEXP '^[0-9a-f]{64}$' AS is_hash FROM users WHERE email='sectest-t1@example.com';"
# 2) Raw token still refreshes (rotation):
$new = Invoke-RestMethod -Uri http://localhost:5000/v1/auth/refresh -Method POST -ContentType 'application/json' -Body (@{refreshToken=$rt} | ConvertTo-Json)
$new.success
# 3) The OLD (pre-rotation) token is now rejected:
try { Invoke-RestMethod -Uri http://localhost:5000/v1/auth/refresh -Method POST -ContentType 'application/json' -Body (@{refreshToken=$rt} | ConvertTo-Json) } catch { $_.Exception.Response.StatusCode.value__ }
```

Expected: `is_hash` = `1`, then `True`, then `401`.

- [ ] **Step 6: Commit**

```powershell
cd D:\rahul\shopping-site
git add backend/src/modules/auth/auth.service.ts
git commit -m @'
feat(auth): store refresh tokens as SHA-256 hashes at rest

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 3: Password max length + JWT algorithm pinning

**Files:**
- Modify: `backend/src/modules/auth/auth.validator.ts:7` and `:25`
- Modify: `backend/src/utils/jwt.ts:26-36`

**Interfaces:**
- Consumes: nothing new.
- Produces: no signature changes — `verifyAccessToken`/`verifyRefreshToken` keep their existing signatures.

- [ ] **Step 1: Cap password length**

In `backend/src/modules/auth/auth.validator.ts`, in `registerSchema` replace the password line with:

```typescript
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be at most 128 characters'),
```

In `resetPasswordSchema` replace the newPassword line with:

```typescript
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be at most 128 characters'),
```

- [ ] **Step 2: Pin the JWT algorithm**

In `backend/src/utils/jwt.ts`, replace both verify functions with:

```typescript
export const verifyAccessToken = (token: string): JwtAccessPayload => {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] }) as JwtAccessPayload;
  if (payload.type !== 'access') throw new Error('Invalid token type');
  return payload;
};

export const verifyRefreshToken = (token: string): JwtRefreshPayload => {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] }) as JwtRefreshPayload;
  if (payload.type !== 'refresh') throw new Error('Invalid token type');
  return payload;
};
```

- [ ] **Step 3: Typecheck**

Run: `cd D:\rahul\shopping-site\backend; npx tsc --noEmit`
Expected: no output.

- [ ] **Step 4: Verify live**

Wait ~10s, then:

```powershell
# Oversized password rejected:
$longPw = 'a' * 200
$body = (@{firstName='Sec'; lastName='TestLong'; email='sectest-long@example.com'; password=$longPw} | ConvertTo-Json)
try { Invoke-RestMethod -Uri http://localhost:5000/v1/auth/register -Method POST -ContentType 'application/json' -Body $body } catch { $_.Exception.Response.StatusCode.value__ }
# Normal login still works (valid token still verifies with pinned algorithm):
(Invoke-RestMethod -Uri http://localhost:5000/v1/auth/login -Method POST -ContentType 'application/json' -Body '{"email":"sectest-t1@example.com","password":"NewPassword456!"}').success
```

Expected: `400` (or `422` — whatever the validate middleware returns for Zod failures; the point is a 4xx rejection), then `True`.

- [ ] **Step 5: Commit**

```powershell
cd D:\rahul\shopping-site
git add backend/src/modules/auth/auth.validator.ts backend/src/utils/jwt.ts
git commit -m @'
feat(auth): cap password length and pin JWT verification to HS256

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 4: Secret hygiene

**Files:**
- Modify: `backend/src/config/env.ts` (after the `requiredEnvVars` loop, before `export const env`)
- Modify: `backend/.env` (NOT committed — replace both JWT secrets)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed by other tasks. Note: rotating the local secrets invalidates all existing dev sessions and any refresh flows started earlier — later tasks always log in fresh, so this is safe.

- [ ] **Step 1: Add the production guard**

In `backend/src/config/env.ts`, insert after the `for (const envVar of requiredEnvVars) { ... }` loop:

```typescript
// Refuse to boot production with placeholder or weak JWT secrets
if (process.env.NODE_ENV === 'production') {
  for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
    const value = process.env[key]!;
    if (value.includes('change_in_production') || value.length < 32) {
      throw new Error(
        `${key} is not a secure production secret. Set a random value of at least 32 characters.`
      );
    }
  }
}
```

- [ ] **Step 2: Verify the guard fires**

```powershell
cd D:\rahul\shopping-site\backend
$env:NODE_ENV = 'production'
npx ts-node -r tsconfig-paths/register -e "require('./src/config/env')"
$env:NODE_ENV = 'development'
```

Expected: throws `Error: JWT_ACCESS_SECRET is not a secure production secret...` (the current `.env` still has placeholders at this point). Reset `NODE_ENV` afterwards as shown.

- [ ] **Step 3: Rotate the local secrets**

Generate two fresh secrets:

```powershell
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(48).toString('hex')); console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(48).toString('hex'))"
```

Edit `backend/.env` and replace the two `JWT_ACCESS_SECRET=...` / `JWT_REFRESH_SECRET=...` lines with the generated output. Do NOT commit `.env`.

- [ ] **Step 4: Verify the guard passes with real secrets + server still boots**

```powershell
cd D:\rahul\shopping-site\backend
$env:NODE_ENV = 'production'
npx ts-node -r tsconfig-paths/register -e "require('./src/config/env'); console.log('env OK')"
$env:NODE_ENV = 'development'
```

Expected: `env OK`. Then confirm nodemon restarted cleanly and `Invoke-RestMethod -Uri http://localhost:5000/v1/auth/login -Method POST -ContentType 'application/json' -Body '{"email":"sectest-t1@example.com","password":"NewPassword456!"}'` returns success (fresh login works under the new secrets).

- [ ] **Step 5: Typecheck and commit**

Run: `npx tsc --noEmit` (expected: no output), then:

```powershell
cd D:\rahul\shopping-site
git add backend/src/config/env.ts
git commit -m @'
feat(config): refuse to boot production with placeholder JWT secrets

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 5: Rate limiting

**Files:**
- Modify: `backend/package.json` (new dependency `express-rate-limit`)
- Modify: `backend/src/app.ts:27-46`
- Modify: `backend/src/modules/auth/auth.routes.ts`

**Interfaces:**
- Consumes: `env.RATE_LIMIT_WINDOW_MS` (900000) and `env.RATE_LIMIT_MAX` (100) — already defined in `config/env.ts`.
- Produces: nothing consumed by other tasks.

**Note:** the limiter store is in-memory, so a nodemon restart clears all counters. If the general limiter ever disturbs local development, raise `RATE_LIMIT_MAX` in `backend/.env` — do not remove the limiter.

- [ ] **Step 1: Install the dependency**

```powershell
cd D:\rahul\shopping-site\backend
npm install express-rate-limit
```

Expected: added to `dependencies` in `package.json`.

- [ ] **Step 2: General API limiter + trust proxy in app.ts**

In `backend/src/app.ts`, add to the imports:

```typescript
import rateLimit from 'express-rate-limit';
```

After `const app: Express = express();` add (production runs behind nginx, so trust exactly one proxy hop or every client shares nginx's IP):

```typescript
app.set('trust proxy', 1);
```

Then replace `app.use('/v1', v1Routes);` with:

```typescript
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/v1', apiLimiter, v1Routes);
```

- [ ] **Step 3: Strict limiter on sensitive auth routes**

In `backend/src/modules/auth/auth.routes.ts`, add to the imports:

```typescript
import rateLimit from 'express-rate-limit';
```

After `const controller = new AuthController();` add:

```typescript
// Strict limiter: these endpoints are brute-force targets
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later.', errorCode: 'RATE_LIMITED' },
});
```

Then add `authLimiter` before `validate(...)` on the four sensitive routes:

```typescript
router.post('/register', authLimiter, validate(registerSchema), controller.register);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshTokenSchema), controller.refresh);
router.post('/logout', authMiddleware, controller.logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), controller.resetPassword);
```

(`/refresh` stays on the general limiter only — legitimate clients refresh every 15 minutes and must not get locked out by the strict limiter.)

- [ ] **Step 4: Typecheck**

Run: `cd D:\rahul\shopping-site\backend; npx tsc --noEmit`
Expected: no output.

- [ ] **Step 5: Verify live**

Wait ~10s for nodemon restart, then:

```powershell
$codes = 1..11 | ForEach-Object {
  try {
    (Invoke-WebRequest -Uri http://localhost:5000/v1/auth/login -Method POST -ContentType 'application/json' -Body '{"email":"nobody@example.com","password":"wrongwrong"}' -UseBasicParsing).StatusCode
  } catch { $_.Exception.Response.StatusCode.value__ }
}
$codes -join ','
```

Expected: ten `401`s followed by `429` (i.e., `401,401,401,401,401,401,401,401,401,401,429`).

Restart the dev server afterwards (`rs` in the nodemon terminal or touch a file) to clear the limiter for subsequent tasks.

- [ ] **Step 6: Commit**

```powershell
cd D:\rahul\shopping-site
git add backend/package.json backend/package-lock.json backend/src/app.ts backend/src/modules/auth/auth.routes.ts
git commit -m @'
feat(security): add API and auth-endpoint rate limiting

General /v1 limiter from RATE_LIMIT_* env config, plus a strict
10-per-15-min limiter on login/register/forgot-password/reset-password.
trust proxy = 1 so per-client IPs work behind nginx in production.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 6: Frontend single-flight token refresh

**Files:**
- Modify: `frontend/src/services/apiClient.ts:33-63` (the response interceptor)

**Interfaces:**
- Consumes: backend `POST /v1/auth/refresh` (rotates the refresh token — this rotation is WHY parallel refreshes break: the second caller presents an already-rotated token and gets 401, which force-logs-out the user).
- Produces: no export changes — `apiClient`, `apiGet/apiPost/apiPut/apiPatch/apiDelete` keep their signatures.

- [ ] **Step 1: Rewrite the response interceptor with a shared refresh promise**

In `frontend/src/services/apiClient.ts`, replace the entire `// Handle Token Refresh` block (the `apiClient.interceptors.response.use(...)` call) with:

```typescript
// Handle Token Refresh — single-flight: concurrent 401s share one refresh call.
// Without this, refresh-token rotation rejects the second parallel refresh and
// the user gets randomly logged out.
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');

  const { data } = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
    refreshToken,
  });

  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
  useAuthStore.getState().setTokens(data.data.accessToken, data.data.refreshToken);
  return data.data.accessToken;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newAccessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

- [ ] **Step 2: Typecheck**

Run: `cd D:\rahul\shopping-site\frontend; npx tsc --noEmit`
Expected: no output.

- [ ] **Step 3: Verify single-flight behavior live**

Simulate the exact interceptor pattern against the real backend (two parallel refresh consumers must produce exactly ONE refresh call and both succeed):

```powershell
cd D:\rahul\shopping-site\frontend
node -e "
const axios = require('axios');
(async () => {
  const base = 'http://localhost:5000/v1';
  const { data: login } = await axios.post(base + '/auth/login', { email: 'sectest-t1@example.com', password: 'NewPassword456!' });
  let refreshToken = login.data.refreshToken;
  let calls = 0;
  let refreshPromise = null;
  const doRefresh = async () => {
    calls++;
    const { data } = await axios.post(base + '/auth/refresh', { refreshToken });
    refreshToken = data.data.refreshToken;
    return data.data.accessToken;
  };
  const getToken = () => {
    if (!refreshPromise) refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
    return refreshPromise;
  };
  const [a, b] = await Promise.all([getToken(), getToken()]);
  console.log('refresh calls:', calls, '| tokens equal:', a === b, '| both valid:', !!a && !!b);
})().catch(e => { console.error('FAIL', e.response ? e.response.status : e.message); process.exit(1); });
"
```

Expected: `refresh calls: 1 | tokens equal: true | both valid: true`. (Pre-fix behavior — two independent calls — would print `refresh calls: 2` and the second would 401.)

- [ ] **Step 4: Manual sanity check in the app**

Start the frontend (`cd D:\rahul\shopping-site\frontend; npm run dev`), log in at `http://localhost:3000/login` with `sectest-t1@example.com` / `NewPassword456!`, browse to `/orders` and `/account`. Expected: no unexpected logout, pages load.

- [ ] **Step 5: Commit**

```powershell
cd D:\rahul\shopping-site
git add frontend/src/services/apiClient.ts
git commit -m @'
fix(frontend): single-flight token refresh to stop random logouts

Concurrent 401s previously fired parallel /auth/refresh calls; with
rotation the second always failed and force-logged-out the user.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

## Final Verification (after all tasks)

- [ ] `cd D:\rahul\shopping-site\backend; npx tsc --noEmit` → clean
- [ ] `cd D:\rahul\shopping-site\frontend; npx tsc --noEmit` → clean
- [ ] Spec checklist: logout revokes (T1), reset link single-use + kills sessions (T1), rate limiting (T5), production secret guard + rotated local secrets (T4), refresh tokens hashed (T2), single-flight refresh (T6), password cap + HS256 pin (T3)
- [ ] Clean up test users: `& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -h localhost -P 3307 -u root -p"StrongRootPassword@123" ecommerce_db -e "DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'sectest-%'); DELETE FROM users WHERE email LIKE 'sectest-%';"`
