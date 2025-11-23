const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
import { notifyUnauthorized } from "./auth-events";

type RequestOptions = RequestInit & { token?: string };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...rest } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...rest.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    const isAuthRequest = Boolean(token) || (!path.startsWith("/login") && !path.startsWith("/register"));
    if ((res.status === 401 || res.status === 403) && isAuthRequest) {
      notifyUnauthorized();
    }
    const payload =
      typeof data === "object" && data !== null ? (data as Record<string, unknown>) : undefined;
    const message =
      (payload?.message as string | undefined) ??
      (payload?.error as string | undefined) ??
      `Request to ${path} failed`;
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  if (typeof data !== "object" || data === null) {
    throw new Error("Malformed response from API.");
  }
  return data as T;
}

export async function registerUser(payload: { name: string; email: string; password: string }) {
  return request<{ message: string }>("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: { email: string; password: string }) {
  return request<{ token: string; role: string; user: { name: string; email: string } }>("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type SafariTicket = {
  showTicketId: number;
  ticketId: number;
  ticketKind?: string | null;
  price?: number | string | null;
  remainingTickets: number;
  soldOut: boolean;
};

export type SafariTiming = {
  showId: number;
  startTime: string;
  endTime: string;
  tickets: SafariTicket[];
};

export async function fetchTimings(params: {
  start: Date;
  end: Date;
  limit?: number;
  offset?: number;
  page?: number;
}) {
  const limit = params.limit ?? 12;
  const qs = new URLSearchParams({
    startTime: params.start.toISOString(),
    endTime: params.end.toISOString(),
    limit: String(limit),
    ...(params.page ? { page: String(params.page) } : {}),
    ...(params.offset ? { offset: String(params.offset) } : {}),
  });

  return request<{ results: SafariTiming[]; limit: number; offset: number }>(
    `/safari-timings?${qs.toString()}`
  );
}

export async function createBooking(token: string, payload: { id: number; quantity: number }) {
  return request<{ bookingId: number; status: string }>("/bookings", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export type BookingRecord = {
  id: number;
  showTicketId: number;
  quantity: number;
  status?: string;
  createdAt?: string;
};

export async function listBookings(
  token: string,
  params?: { limit?: number; page?: number; offset?: number }
): Promise<{ bookings: BookingRecord[] }> {
  const limit = params?.limit ?? 10;
  const query = new URLSearchParams({
    limit: String(limit),
    ...(params?.page ? { page: String(params.page) } : {}),
    ...(params?.offset ? { offset: String(params.offset) } : params?.page ? {} : {}),
  });
  return request<{ bookings: BookingRecord[] }>(`/bookings?${query.toString()}`, {
    method: "GET",
    token,
  });
}

export async function initiatePayment(token: string, bookingId: number) {
  return request<{ paymentId: number; status: string }>("/payments/initiate", {
    method: "POST",
    token,
    body: JSON.stringify({ bookingId }),
  });
}

export async function verifyPayment(token: string, paymentId: number) {
  return request<{ status: string }>("/payments/verify", {
    method: "POST",
    token,
    body: JSON.stringify({ paymentId }),
  });
}

export type AdminCreateUserPayload = { email: string; password: string; role?: string };
export async function adminCreateUser(token: string, payload: AdminCreateUserPayload) {
  return request<{ message: string }>("/admin/createUser", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export type AdminUpdateUserPayload = { email: string; role?: string; isEnabled?: boolean };
export async function adminUpdateUser(token: string, payload: AdminUpdateUserPayload) {
  return request<{ message: string }>("/admin/updateUser", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function adminBookingsByEmail(token: string, email: string) {
  return request<{ bookings: BookingRecord[] }>(`/admin/bookings/${encodeURIComponent(email)}`, {
    method: "GET",
    token,
  });
}

export type AdminShowTicketInput = { ticketId: number; remainingTickets: number };
export type AdminCreateShowPayload = {
  name: string;
  startTime: string;
  endTime: string;
  tickets?: AdminShowTicketInput[];
};
export async function adminCreateShow(token: string, payload: AdminCreateShowPayload) {
  return request<{ message: string; showName: string }>("/admin/createShow", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export { API_BASE };
