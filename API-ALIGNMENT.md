# API alignment: Frontend (Pay4Edge) ↔ Backend

Frontend uses the same backend (`apps/backend`). Base URL: `VITE_API_URL` or `http://localhost:5000/api/v1`.

## Initiation

- **HTTP:** `src/lib/api.ts` — `API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"`. All `api.get/post/put/patch/delete` and `api.publicGet/publicPost` use this base.
- **Socket:** `src/contexts/SocketContext.tsx` — Socket.io connects to the **base** URL (with `/api/v1` stripped) so the server root receives the socket connection. Uses same `VITE_API_URL` with safe fallback when env is missing.
- **Auth:** Token stored in `localStorage` as `pay4edge_token`; user as `pay4edge_user`. Sent as `Authorization: Bearer <token>` on every request.
- **401:** On 401 (except on login), token/user are cleared and redirect to `/login` (frontend has a dedicated Login page).

## Aligned endpoints

| Feature | Frontend call | Backend route | Status |
|--------|----------------|---------------|--------|
| Login | `POST auth/login` | `POST /api/v1/auth/login` | ✅ |
| Register | `POST auth/register` | `POST /api/v1/auth/register` | ✅ |
| Profile | `PATCH auth/profile` | `PATCH /api/v1/auth/profile` | ✅ |
| Deposits | `GET payments` | `GET /api/v1/payments` | ✅ |
| Verify payment | `GET payments/:id/verify` | `GET /api/v1/payments/:id/verify` | ✅ |
| Balance | `GET wallets/balance` | `GET /api/v1/wallets/balance` | ✅ |
| Dashboard stats | `GET dashboard/stats` | `GET /api/v1/dashboard/stats` | ✅ |
| Dashboard activity | `GET dashboard/activity` | `GET /api/v1/dashboard/activity` | ✅ |
| Dashboard chart | `GET dashboard/chart` | `GET /api/v1/dashboard/chart` | ✅ |
| Staff links | `GET dashboard/staff-links` | `GET /api/v1/dashboard/staff-links` | ✅ |
| Webhook logs | `GET payments/webhooks/logs` | `GET /api/v1/payments/webhooks/logs` | ✅ |
| Staff list | `GET admin/staff` | `GET /api/v1/admin/staff` | ✅ |
| Agents list | `GET admin/agents` | `GET /api/v1/admin/agents` | ✅ |
| Add staff | `POST admin/staff` | `POST /api/v1/admin/staff` | ✅ |
| Add agent | `POST admin/agents` | `POST /api/v1/admin/agents` | ✅ |
| Edit staff | `PUT admin/staff/:id` or `PUT agent/staff/:id` | `PUT /api/v1/admin/staff/:id` or `/agent/staff/:id` | ✅ |
| Delete staff | `DELETE admin/staff/:id` | `DELETE /api/v1/admin/staff/:id` | ✅ |
| Withdrawals (link) | `GET withdrawals/all?source=link` | `GET /api/v1/withdrawals/all?source=link` | ✅ |
| Withdrawal link | `POST admin/withdrawal-link` | `POST /api/v1/admin/withdrawal-link` | ✅ |
| Approve/Reject | `PUT withdrawals/:id` | `PUT /api/v1/withdrawals/:id` | ✅ |
| Token sent | `PATCH withdrawals/:id/token-sent` | `PATCH /api/v1/withdrawals/:id/token-sent` | ✅ |
| Payout balance/links/history | `GET admin/payout-*` | `GET /api/v1/admin/payout-*` | ✅ |
| Create payout link | `POST admin/create-link` | `POST /api/v1/admin/create-link` | ✅ |
| Add payout balance | `POST admin/add-payout-balance` | `POST /api/v1/admin/add-payout-balance` | ✅ |
| Generate deposit link | `POST payments/generate-link` | `POST /api/v1/payments/generate-link` | ✅ |
| Pay link details | `GET payments/link/:id` | `GET /api/v1/payments/link/:id` | ✅ |
| Pay via link | `POST payments/link/:id/pay` | `POST /api/v1/payments/link/:id/pay` | ✅ |
| Link status/orders | `GET payments/link/:id/status`, `.../orders` | Same under `/api/v1/payments` | ✅ |
| Public order | `GET payments/public/:id` | `GET /api/v1/payments/public/:id` | ✅ |
| Withdraw-request (public) | `GET/POST withdraw-request/:token` | `GET/POST /api/v1/withdraw-request/:token` | ✅ |
| Payout claim (public) | `GET payout/:code`, `.../status`, `POST .../submit` | Same under `/api/v1/payout` | ✅ |
| Disputes | `GET disputes`, `GET disputes/:id` | `GET /api/v1/disputes`, etc. | ✅ |
| Dispute reply/assign/resolve | `POST staff/disputes/:id/reply`, `admin/disputes/:id/assign|resolve` | Same under `/api/v1` | ✅ |
| Notifications | `GET/PUT/DELETE notifications` | Same under `/api/v1/notifications` | ✅ |
| Players | `GET players` | `GET /api/v1/players` | ✅ |

## Fix applied

- **SocketContext:** `VITE_API_URL` was used without fallback; `replace()` on `undefined` could throw. Now uses `(import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1")` and strips `/api/v1` to get socket base URL safely.
- **Dashboard staff-links summary:** Backend returns `summary: { totalLinksCreated, totalPayments, totalRevenue, totalPending }`. Frontend expects `StaffStats` with `totalGeneratedAmount`, `totalReceivedAmount`, `totalPendingAmount`. Dashboard now maps backend fields to the expected shape (`totalRevenue` → both Generated and Received).

## Env

- **VITE_API_URL** — Backend API base including path, e.g. `http://localhost:5000/api/v1` or `https://api.pay4edge.com/api/v1`. Used for all HTTP calls; socket connects to the same origin without `/api/v1`.
