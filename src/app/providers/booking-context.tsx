'use client'

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { registerUnauthorizedHandler } from "../lib/auth-events";

export type PaymentMethod = "upi" | "netbanking" | "card";

type UserDetails = { name: string; email: string; phone: string };

type AuthState = {
  token?: string;
  user?: { name: string; email: string };
  role?: string;
};

type BookingState = {
  ticketType?: string;
  showTicketId?: number;
  showId?: number;
  startTime?: string;
  endTime?: string;
  price?: number;
  quantity: number;
  total: number;
  paymentMethod?: PaymentMethod;
  userDetails: UserDetails;
  bookingId?: number;
  bookingStatus?: string;
  paymentId?: number;
  paymentStatus?: string;
  loadingLabel?: string | null;
};

type BookingContextValue = BookingState & {
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
  clearAuth: () => void;
  updateSelection: (payload: Partial<BookingState>) => void;
  setQuantity: (quantity: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setUserDetails: (details: Partial<UserDetails>) => void;
  setBookingReceipt: (payload: { bookingId: number; status?: string }) => void;
  setPaymentReceipt: (payload: {
    paymentId: number;
    status?: string;
    bookingStatus?: string;
  }) => void;
  setLoadingLabel: (label: string | null) => void;
  resetBookingFlow: () => void;
};

const defaultState: BookingState = {
  quantity: 1,
  total: 0,
  userDetails: { name: "", email: "", phone: "" },
};

const BookingContext = createContext<BookingContextValue | null>(null);

export default function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingState>(defaultState);
  const [auth, setAuthState] = useState<AuthState>(() => {
    if (typeof window === "undefined") return {};
    const stored = window.localStorage.getItem("park-auth");
    if (!stored) return {};
    try {
      return JSON.parse(stored) as AuthState;
    } catch {
      window.localStorage.removeItem("park-auth");
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (auth.token) {
      window.localStorage.setItem("park-auth", JSON.stringify(auth));
    } else {
      window.localStorage.removeItem("park-auth");
    }
  }, [auth]);

  const setAuth = (next: AuthState) => {
    setAuthState(next);
  };

  const clearAuth = () => {
    setAuthState({});
  };

  useEffect(() => {
    const unsubscribe = registerUnauthorizedHandler(() => setAuthState({}));
    return unsubscribe;
  }, []);

  const updateSelection = (payload: Partial<BookingState>) => {
    setState((prev) => {
      const next = { ...prev, ...payload };
      const price = payload.price ?? prev.price ?? 0;
      const qty = payload.quantity ?? prev.quantity ?? 1;
      return { ...next, total: price * qty };
    });
  };

  const setQuantity = (quantity: number) => {
    setState((prev) => {
      const safeQty = quantity < 1 ? 1 : quantity;
      const price = prev.price ?? 0;
      return { ...prev, quantity: safeQty, total: price * safeQty };
    });
  };

  const setPaymentMethod = (method: PaymentMethod) => {
    setState((prev) => ({ ...prev, paymentMethod: method }));
  };

  const setUserDetails = (details: Partial<UserDetails>) => {
    setState((prev) => ({ ...prev, userDetails: { ...prev.userDetails, ...details } }));
  };

  const setBookingReceipt = (payload: { bookingId: number; status?: string }) => {
    setState((prev) => ({
      ...prev,
      bookingId: payload.bookingId,
      bookingStatus: payload.status ?? prev.bookingStatus,
    }));
  };

  const setPaymentReceipt = (payload: {
    paymentId: number;
    status?: string;
    bookingStatus?: string;
  }) => {
    setState((prev) => ({
      ...prev,
      paymentId: payload.paymentId,
      paymentStatus: payload.status ?? prev.paymentStatus,
      bookingStatus: payload.bookingStatus ?? prev.bookingStatus,
    }));
  };

  const setLoadingLabel = (label: string | null) => {
    setState((prev) => ({ ...prev, loadingLabel: label }));
  };

  const resetBookingFlow = () => {
    setState((prev) => ({
      ...defaultState,
      userDetails: prev.userDetails,
      paymentMethod: prev.paymentMethod,
    }));
  };

  const value = useMemo(
    () => ({
      ...state,
      auth,
      setAuth,
      clearAuth,
      updateSelection,
      setQuantity,
      setPaymentMethod,
      setUserDetails,
      setBookingReceipt,
      setPaymentReceipt,
      setLoadingLabel,
      resetBookingFlow,
    }),
    [auth, state]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return ctx;
}
