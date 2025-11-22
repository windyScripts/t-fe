'use client'

import { useEffect, useState } from "react";
import AuthPanel from "../components/AuthPanel";
import { BookingRecord, listBookings } from "../lib/api";
import { useBooking } from "../providers/booking-context";

export default function HistoryPage() {
  const { auth } = useBooking();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 8;

  useEffect(() => {
    if (!auth.token) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await listBookings(auth.token as string, { limit, page });
        setBookings(res.bookings || []);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to fetch history.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auth.token, limit, page]);

  if (!auth.token) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-[--muted]">History</p>
          <h1 className="text-2xl font-semibold mb-2">Login to view booking history</h1>
          <p className="text-sm text-[--muted]">
            History is locked to your account so we can pull your bookings directly from the API.
          </p>
        </div>
        <AuthPanel title="Authenticate to load bookings" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[--muted]">History</p>
          <h1 className="text-2xl font-semibold">Past bookings</h1>
        </div>
        <span className="pill px-3 py-1 text-xs text-[--muted]">{bookings.length} records</span>
      </div>
      {loading && (
        <div className="glass p-4 flex items-center gap-2 text-sm text-[--muted]">
          <div className="h-4 w-4 rounded-full border-2 border-[--accent] border-t-transparent animate-spin" />
          Loading bookings…
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid-auto">
        {bookings.map((booking) => (
          <div key={booking.id} className="glass p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Booking #{booking.id}</p>
              <span className="tag text-xs capitalize">{booking.status || "pending"}</span>
            </div>
            <p className="text-sm text-[--muted]">
              Tickets: {booking.quantity} · Show ticket ID: {booking.showTicketId}
            </p>
            <p className="text-xs text-[--muted]">
              {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "Created"}
            </p>
          </div>
        ))}
        {bookings.length === 0 && !loading && (
          <div className="glass p-5 text-sm text-[--muted]">No bookings found yet.</div>
        )}
      </div>
      {auth.token && (
        <div className="flex items-center justify-end gap-2">
          <button
            className="btn btn-secondary text-sm"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            className="btn text-sm disabled:opacity-60"
            disabled={bookings.length < limit || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
