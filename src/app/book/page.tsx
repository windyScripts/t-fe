'use client'

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchTimings, SafariTiming, SafariTicket } from "../lib/api";
import { daysFrom, formatRange, startOfToday } from "../lib/dates";
import { formatCurrency } from "../lib/format";
import { useBooking } from "../providers/booking-context";

export default function BookPage() {
  const router = useRouter();
  const {
    updateSelection,
    quantity,
    total,
    price,
    ticketType,
    showTicketId,
    showId,
    setQuantity,
  } = useBooking();
  const [timings, setTimings] = useState<SafariTiming[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const start = startOfToday();
        const end = daysFrom(start, 7);
        const data = await fetchTimings({ start, end, limit: 30 });
        setTimings(data.results);
        const firstAvailable = data.results.find((s) => s.tickets.some((t) => !t.soldOut));
        if (firstAvailable && !showTicketId) {
          const ticket = firstAvailable.tickets.find((t) => !t.soldOut);
          if (ticket) {
            applySelection(firstAvailable, ticket, quantity);
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to load slots.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentShow = useMemo(
    () => timings.find((s) => s.showId === showId),
    [showId, timings]
  );

  const currentTicket = useMemo(() => {
    const show = timings.find((s) => s.showId === showId);
    return show?.tickets.find((t) => t.showTicketId === showTicketId);
  }, [showId, showTicketId, timings]);

  const applySelection = (show: SafariTiming, ticket: SafariTicket, qty: number) => {
    updateSelection({
      showId: show.showId,
      showTicketId: ticket.showTicketId,
      ticketType: ticket.ticketKind ?? "regular_ticket",
      startTime: show.startTime,
      endTime: show.endTime,
      price: Number(ticket.price ?? 0),
      quantity: qty,
    });
  };

  const handleQuantity = (delta: number) => {
    const next = Math.max(1, quantity + delta);
    const max = currentTicket?.remainingTickets ?? next;
    const capped = Math.min(next, max);
    setQuantity(capped);
  };

  const proceed = () => {
    if (!showTicketId) {
      setError("Pick a safari slot first.");
      return;
    }
    router.push("/summary");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="glass p-5 flex-1 w-full space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[--muted]">Booking</p>
              <h1 className="text-2xl font-semibold">Choose ticket type & timing</h1>
            </div>
            <span className="pill px-3 py-1 text-xs text-[--muted]">Auto-calculates total</span>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-[--muted]">
              <div className="h-4 w-4 rounded-full border-2 border-[--accent] border-t-transparent animate-spin" />
              Loading availability…
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="space-y-3">
            {timings.map((show) => (
              <div key={show.showId} className="border border-[--stroke] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-[--muted] uppercase tracking-[0.12em]">Safari</p>
                    <p className="font-semibold">{formatRange(show.startTime, show.endTime)}</p>
                  </div>
                  <span className="pill px-3 py-1 text-xs">
                    {new Date(show.startTime).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {show.tickets.map((ticket) => {
                    const active = ticket.showTicketId === showTicketId;
                    return (
                      <button
                        key={ticket.showTicketId}
                        onClick={() => applySelection(show, ticket, quantity)}
                        disabled={ticket.soldOut}
                        className={`text-left border rounded-lg p-3 transition-all ${
                          active
                            ? "border-[--accent] shadow-md"
                            : "border-[--stroke] hover:border-[--accent]"
                        } ${ticket.soldOut ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold capitalize">
                              {ticket.ticketKind?.replace("_", " ") || "Regular"}
                            </p>
                            <p className="text-xs text-[--muted]">
                              {ticket.remainingTickets} left · {formatCurrency(ticket.price)}
                            </p>
                          </div>
                          {active && (
                            <span className="tag text-xs bg-[--accent] text-white">Selected</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-5 w-full lg:w-96 space-y-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[--muted]">Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Ticket</span>
              <span className="font-semibold capitalize">
                {ticketType?.replace("_", " ") || "Select a type"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Slot</span>
              <span className="font-semibold">
                {currentShow ? formatRange(currentShow.startTime, currentShow.endTime) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Price</span>
              <span className="font-semibold">
                {price ? formatCurrency(price) : "Pick a ticket"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  className="pill px-3 py-1 text-sm font-semibold bg-[--accent-soft] text-[--accent-strong]"
                  onClick={() => handleQuantity(-1)}
                  aria-label="Decrease quantity"
                >
                  –
                </button>
                <span className="font-semibold min-w-6 text-center">{quantity}</span>
                <button
                  className="pill px-3 py-1 text-sm font-semibold bg-[--accent] text-white disabled:opacity-60"
                  onClick={() => handleQuantity(1)}
                  aria-label="Increase quantity"
                  disabled={(currentTicket?.remainingTickets ?? Infinity) <= quantity}
                >
                  +
                </button>
              </div>
            </div>
            <div className="fade-border" />
            <div className="flex items-center justify-between text-base">
              <span>Total</span>
              <span className="font-semibold">{formatCurrency(total)}</span>
            </div>
          </div>
          <button className="w-full btn font-semibold disabled:opacity-60" onClick={proceed} disabled={!showTicketId || !price}>
            Continue to summary
          </button>
        </div>
      </div>
    </div>
  );
}
