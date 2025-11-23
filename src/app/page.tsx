'use client'

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchTimings, SafariTiming, SafariTicket } from "./lib/api";
import { daysFrom, formatRange, startOfToday } from "./lib/dates";
import { formatCurrency } from "./lib/format";
import { useBooking } from "./providers/booking-context";
import { DateTimeRow } from "./components/DateTimeParts";
import Button from "./components/ui/Button";

const ticketCopy = [
  {
    title: "Regular",
    price: "100",
    description: "Park entry + guided pathway. Good for families.",
  },
  {
    title: "Priority",
    price: "500",
    description: "Skip the queue, earlier boarding, premium seating.",
  },
];

export default function Home() {
  const [timings, setTimings] = useState<SafariTiming[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [startInput, setStartInput] = useState(() =>
    startOfToday().toISOString().slice(0, 16)
  );
  const [endInput, setEndInput] = useState(() =>
    daysFrom(startOfToday(), 7).toISOString().slice(0, 16)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { updateSelection } = useBooking();

  const startDate = useMemo(() => new Date(startInput), [startInput]);
  const endDate = useMemo(() => new Date(endInput), [endInput]);
  const inputsValid = useMemo(
    () =>
      !Number.isNaN(startDate.getTime()) &&
      !Number.isNaN(endDate.getTime()) &&
      startDate < endDate,
    [startDate, endDate]
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!inputsValid) {
          setError("Enter a valid start and end time (start must be before end).");
          setTimings([]);
          return;
        }
        setError(null);
        const data = await fetchTimings({ start: startDate, end: endDate, limit, page });
        setTimings(data.results);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to load timings.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [limit, page, startDate, endDate, inputsValid]);

  const onSelect = (show: SafariTiming, ticket: SafariTicket) => {
    updateSelection({
      showId: show.showId,
      showTicketId: ticket.showTicketId,
      ticketType: ticket.ticketKind ?? "regular_ticket",
      startTime: show.startTime,
      endTime: show.endTime,
      price: Number(ticket.price ?? 0),
      quantity: 1,
    });
    router.push("/book");
  };

  return (
    <div className="space-y-10">
      <section className="glass p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="tag">Overview</span>
              <span className="text-xs text-[--muted] uppercase tracking-[0.14em]">
                Bandipur National Park
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-semibold leading-tight">
              Safaris, shows, and seamless ticketing.
            </h1>
            <p className="text-[--muted] max-w-2xl">
              Explore grasslands, teak forests, and wildlife in one pass. Book regular or priority
              tickets, pick a safari window, and move to payment without friction.
            </p>
          </div>
          <div className="glass p-4 w-full lg:w-96">
            <p className="text-xs uppercase tracking-[0.14em] text-[--muted] mb-2">Ticket types</p>
            <div className="grid gap-3">
              {ticketCopy.map((ticket) => (
                <div key={ticket.title} className="p-3 border border-[--stroke] rounded-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{ticket.title}</h3>
                    <span className="text-sm text-[--muted]">{formatCurrency(ticket.price)}</span>
                  </div>
                  <p className="text-sm text-[--muted] mt-1">{ticket.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[--muted]">Available safaris</p>
            <h2 className="text-xl font-semibold">Pick a time slot</h2>
          </div>
          <div className="text-sm text-[--muted]">
            Auto-refreshes daily • configurable window • Live availability
          </div>
        </div>
        <div className="glass p-4 grid gap-3 md:grid-cols-4">
          <DateTimeRow
            label="Start"
            value={startInput}
            onChange={(v) => {
              setStartInput(v);
              setPage(1);
            }}
            min={startOfToday().toISOString().slice(0, 10)}
          />
          <DateTimeRow
            label="End"
            value={endInput}
            onChange={(v) => {
              setEndInput(v);
              setPage(1);
            }}
            min={startOfToday().toISOString().slice(0, 10)}
          />
          <label className="text-sm flex flex-col gap-1">
            <span className="text-[--muted]">Entries</span>
            <select
              className="glass px-3 py-2 focus-ring"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value) || 9);
                setPage(1);
              }}
            >
              {[6, 9, 12, 15, 20].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
        {loading && (
          <div className="glass p-6 flex items-center gap-3">
            <div className="h-4 w-4 rounded-full border-2 border-[--accent] border-t-transparent animate-spin" />
            <p className="text-sm">Loading timings…</p>
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="space-y-3">
            <div className="grid-auto">
              {timings.map((show) => (
                <div key={show.showId} className="glass p-4 flex flex-col gap-3">
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
                  <div className="space-y-2">
                    {show.tickets.map((ticket) => (
                      <div
                        key={ticket.showTicketId}
                        className={`p-3 rounded-lg border transition-all ${
                          ticket.soldOut
                            ? "border-red-300 bg-red-50 text-red-700"
                            : "border-[--stroke] bg-[--card] hover:border-[--accent] hover:bg-[--accent-soft] hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold capitalize">
                            {ticket.ticketKind?.replace("_", " ") || "Regular"}
                          </p>
                          <p className="text-xs text-[--muted]">
                            {ticket.remainingTickets} left · {formatCurrency(ticket.price)}
                          </p>
                        </div>
                        <Button
                          disabled={ticket.soldOut}
                          size="sm"
                          className="px-3 py-2 disabled:opacity-50"
                          onClick={() => onSelect(show, ticket)}
                        >
                          {ticket.soldOut ? "Sold out" : "Book this"}
                        </Button>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              ))}
              {timings.length === 0 && (
                <div className="glass p-6 text-sm text-[--muted]">No safaris in this window.</div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                className="disabled:opacity-60"
                disabled={timings.length < limit || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
