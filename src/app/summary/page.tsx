'use client'

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthPanel from "../components/AuthPanel";
import { createBooking } from "../lib/api";
import { formatCurrency } from "../lib/format";
import { formatRange } from "../lib/dates";
import { useBooking } from "../providers/booking-context";
import Button from "../components/ui/Button";

export default function SummaryPage() {
  const router = useRouter();
  const {
    userDetails,
    setUserDetails,
    quantity,
    total,
    price,
    startTime,
    endTime,
    ticketType,
    showTicketId,
    auth,
    setLoadingLabel,
    setBookingReceipt,
  } = useBooking();

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (auth.user?.name && !userDetails.name) {
      setUserDetails({ name: auth.user.name });
    }
    if (auth.user?.email && !userDetails.email) {
      setUserDetails({ email: auth.user.email });
    }
  }, [auth.user, setUserDetails, userDetails.email, userDetails.name]);

  const validate = () => {
    if (!showTicketId) return "Select a slot on the booking page.";
    if (!userDetails.name.trim()) return "Name is required.";
    if (!userDetails.email.includes("@")) return "Enter a valid email.";
    if (userDetails.phone && userDetails.phone.length < 10) return "Enter a valid phone.";
    if (!auth.token) return "Login is required to create a booking.";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoadingLabel("Reserving your seats…");
      const res = await createBooking(auth.token as string, {
        id: showTicketId as number,
        quantity,
      });
      setBookingReceipt({ bookingId: res.bookingId, status: res.status });
      setMessage("Booking created. Proceed to payment.");
      router.push("/payment");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not create booking.";
      setError(message);
    } finally {
      setLoadingLabel(null);
    }
  };

  const missingSelection = !showTicketId;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] items-start">
      <div className="glass p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[--muted]">Summary</p>
            <h1 className="text-2xl font-semibold">Review your booking</h1>
          </div>
          <span className="pill px-3 py-1 text-xs text-[--muted]">Step 2 of 4</span>
        </div>
        {missingSelection ? (
          <div className="glass p-4 bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">
              No selection found. Please pick a safari and ticket on the booking page.
            </p>
            <button
              className="pill px-4 py-2 bg-[--accent] text-white text-sm font-semibold mt-3"
              onClick={() => router.push("/book")}
            >
              Go to booking
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 border border-[--stroke] rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[--muted]">Ticket</p>
                  <p className="font-semibold capitalize">
                    {ticketType?.replace("_", " ") || "Regular"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[--muted]">Total</p>
                  <p className="font-semibold">{formatCurrency(total)}</p>
                </div>
              </div>
              <p className="text-sm text-[--muted]">
                {quantity} × {formatCurrency(price)} • {formatRange(startTime as string, endTime as string)}
              </p>
            </div>
            <form className="grid gap-3" onSubmit={handleSubmit}>
              <label className="text-sm flex flex-col gap-1">
                <span className="text-[--muted]">Full name</span>
                <input
                  className="glass px-3 py-2 focus-ring"
                  value={userDetails.name}
                  onChange={(e) => setUserDetails({ name: e.target.value })}
                  placeholder="Ranger Kavya"
                  required
                />
              </label>
              <label className="text-sm flex flex-col gap-1">
                <span className="text-[--muted]">Email</span>
                <input
                  className="glass px-3 py-2 focus-ring"
                  type="email"
                  value={userDetails.email}
                  onChange={(e) => setUserDetails({ email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label className="text-sm flex flex-col gap-1">
                <span className="text-[--muted]">Phone</span>
                <input
                  className="glass px-3 py-2 focus-ring"
                  type="tel"
                  value={userDetails.phone}
                  onChange={(e) => setUserDetails({ phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-[--accent]">{message}</p>}
              <Button
                type="submit"
                className="w-full font-semibold disabled:opacity-60"
                disabled={missingSelection || !auth.token}
              >
                Create booking & continue
              </Button>
            </form>
          </div>
        )}
      </div>
      <div className="space-y-4">
        {!auth.token && <AuthPanel title="Login before payment" />}
        {auth.token && (
          <div className="glass p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[--muted] mb-2">Signed in</p>
            <p className="font-semibold">{auth.user?.name || auth.user?.email}</p>
            <p className="text-sm text-[--muted]">{auth.user?.email}</p>
            <p className="text-xs text-[--muted] mt-2">You can change details above if needed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
