const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPPORT" | "STAFF" | "PLAYER" | "AGENT";
  location?: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export interface Order {
  _id: string;
  user: { _id: string; name: string; location?: string } | string;
  amount: number;
  currency?: string;
  status: string;
  gateway: string;
  gatewayOrderId?: string;
  paymentLink?: string;
  location?: string;
  generatedBy?: { _id: string; name: string; role: string };
  feePercent?: number;
  webhookLogs?: Array<{ event: string; timestamp: string; processed: boolean; reason?: string }>;
  createdAt: string;
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
  total: number;
}

export interface WalletBalance {
  success: boolean;
  balance: number;
}

export interface CreateOrderResponse {
  success: boolean;
  order: Order;
  feePercent?: number;
  amountCredited?: number;
  amountCharged?: number;
}

export interface FeeConfigResponse {
  feePercent: number;
}

export interface Message {
  _id: string;
  sender: { _id: string; name: string; role: string };
  text: string;
  attachments: string[];
  createdAt: string;
}

export interface Dispute {
  _id: string;
  user: { _id: string; name: string; email: string };
  orderId?: string;
  amount?: number;
  reason: string;
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  assignedStaff?: { _id: string; name: string };
  messages: Message[];
  resolution?: { outcome: string; note?: string; refundAmount?: number; resolvedAt?: string; resolvedBy?: string };
  createdAt: string;
  updatedAt: string;
}

export interface DisputesResponse {
  success: boolean;
  disputes: Dispute[];
  stats?: { open: number; resolved: number };
}

export interface StaffMember {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  location?: string;
  createdAt?: string;
}

export interface StaffListResponse {
  success: boolean;
  staff: StaffMember[];
}

export interface AddStaffResponse {
  success: boolean;
  user: { id: string; name: string; email: string; role: string };
}

export interface WithdrawRequest {
  _id: string;
  user: { _id?: string; name?: string; email?: string };
  amount: number;
  status: string;
  payoutMethod: string;
  payoutDetail?: unknown;
  screenshotUrl?: string;
  reviewNote?: string;
  createdAt: string;
}

export interface WithdrawRequestsResponse {
  success: boolean;
  requests: WithdrawRequest[];
}

export interface Player {
  _id?: string;
  id?: string;
  name?: string;
  fullName?: string;
  email: string;
  totalDeposits?: number;
  depositCount?: number;
  status?: string;
  createdAt?: string;
  createdAtDate?: string;
  username?: string;
}

export interface PlayersResponse {
  success: boolean;
  players: Player[];
  pagination?: { page: number; total: number; pages: number };
}

function getToken(): string | null {
  return localStorage.getItem("pay4edge_token");
}

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const base = API_URL.replace(/\/$/, "");
  const pathNorm = path.replace(/^\//, "");
  const url =
    options.params && Object.keys(options.params).length > 0
      ? `${base}/${pathNorm}?${new URLSearchParams(options.params).toString()}`
      : `${base}/${pathNorm}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    localStorage.removeItem("pay4edge_token");
    localStorage.removeItem("pay4edge_user");
    window.location.href = "/login";
    return Promise.reject(new Error("Unauthorized"));
  }
  if (!res.ok) {
    return Promise.reject(
      new Error((data as { message?: string }).message || `Request failed: ${res.status}`)
    );
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, config?: { params?: Record<string, string> }) =>
    request<T>(path, { method: "GET", params: config?.params }),
  post: <T>(path: string, body?: object) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: object) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: object) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
