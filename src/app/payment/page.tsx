'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { initiatePayment, verifyPayment } from "../lib/api";
import { formatCurrency } from "../lib/format";
import { formatRange } from "../lib/dates";
import { PaymentMethod, useBooking } from "../providers/booking-context";

const methods: { key: PaymentMethod; label: string; hint: string }[] = [
  { key: "upi", label: "UPI", hint: "Instant UPI apps" },
  { key: "netbanking", label: "Netbanking", hint: "Secure redirect" },
  { key: "card", label: "Debit Card", hint: "Visa / Mastercard" },
];

export default function PaymentPage() {
  const router = useRouter();
  const {
    bookingId,
    bookingStatus,
    paymentMethod,
    setPaymentMethod,
    total,
    startTime,
    endTime,
    ticketType,
    quantity,
    price,
    auth,
    setLoadingLabel,
    setPaymentReceipt,
  } = useBooking();
  const [error, setError] = useState<string | null>(null);

  if (!bookingId) {
    return (
      <div className="glass p-6">
        <p className="text-sm text-red-700">
          No booking found. Please complete the summary step before paying.
        </p>
        <button
          className="pill px-4 py-2 bg-[--accent] text-white text-sm font-semibold mt-3"
          onClick={() => router.push("/summary")}
        >
          Go to summary
        </button>
      </div>
    );
  }

  const handlePay = async () => {
    setError(null);
    if (!paymentMethod) {
      setError("Select a payment method.");
      return;
    }
    if (!auth.token) {
      setError("Login required before payment.");
      return;
    }

    try {
      setLoadingLabel("Processing payment… Please do not refresh.");
      const init = await initiatePayment(auth.token, bookingId);
      setPaymentReceipt({ paymentId: init.paymentId, status: init.status, bookingStatus });
      const verify = await verifyPayment(auth.token, init.paymentId);
      setPaymentReceipt({
        paymentId: init.paymentId,
        status: verify.status,
        bookingStatus: "paid",
      });
      router.push("/history");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment failed.";
      setError(message);
    } finally {
      setLoadingLabel(null);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] items-start">
      <div className="glass p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[--muted]">Payment</p>
            <h1 className="text-2xl font-semibold">Choose a payment method</h1>
          </div>
          <span className="pill px-3 py-1 text-xs text-[--muted]">Step 3 of 4</span>
        </div>
        <div className="space-y-2">
          {methods.map((method) => (
            <label
              key={method.key}
              className={`border rounded-xl p-3 flex items-center justify-between cursor-pointer ${
                paymentMethod === method.key ? "border-[--accent]" : "border-[--stroke]"
              }`}
            >
              <div>
                <p className="font-semibold">{method.label}</p>
                <p className="text-xs text-[--muted]">{method.hint}</p>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === method.key}
                onChange={() => setPaymentMethod(method.key)}
              />
            </label>
          ))}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn w-full font-semibold" onClick={handlePay}>
          Pay now
        </button>
      </div>

      <div className="glass p-5 space-y-3">
        <p className="text-xs uppercase tracking-[0.14em] text-[--muted]">Booking</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[--muted]">Booking ID</span>
          <span className="font-semibold">#{bookingId}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[--muted]">Ticket</span>
          <span className="font-semibold capitalize">{ticketType?.replace("_", " ")}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[--muted]">Slot</span>
          <span className="font-semibold">
            {formatRange(startTime as string, endTime as string)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[--muted]">Quantity</span>
          <span className="font-semibold">{quantity}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[--muted]">Price</span>
          <span className="font-semibold">{formatCurrency(price)}</span>
        </div>
        <div className="fade-border" />
        <div className="flex items-center justify-between text-base">
          <span>Total payable</span>
          <span className="font-semibold">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
