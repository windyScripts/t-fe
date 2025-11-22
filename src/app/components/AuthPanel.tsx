'use client'

import { FormEvent, useState } from "react";
import { loginUser, registerUser } from "../lib/api";
import { useBooking } from "../providers/booking-context";

type Mode = "login" | "register";

export default function AuthPanel({ title = "Sign in to continue" }: { title?: string }) {
  const { setAuth, setLoadingLabel } = useBooking();
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    if (mode === "register" && !form.name) {
      setError("Name is required for registration.");
      return;
    }

    try {
      setBusy(true);
      setLoadingLabel("Authorizing...");
      if (mode === "register") {
        await registerUser({ name: form.name, email: form.email, password: form.password });
      }
      const login = await loginUser({ email: form.email, password: form.password });
      setAuth({ token: login.token, user: login.user, role: login.role });
      setMessage(mode === "register" ? "Registered and signed in." : "Signed in.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed.";
      setError(message);
    } finally {
      setBusy(false);
      setLoadingLabel(null);
    }
  };

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[--muted]">Access</p>
          <h3 className="text-lg font-semibold text-[--ink]">{title}</h3>
        </div>
        <div className="pill text-xs px-3 py-1 bg-[--accent-soft] text-[--accent] font-semibold">
          {mode === "login" ? "Login" : "Register"}
        </div>
      </div>
      <form className="space-y-3" onSubmit={handleSubmit}>
        {mode === "register" && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[--muted]">Full name</span>
            <input
            className="glass px-3 py-2 focus-ring"
            placeholder="Ranger Arjun"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[--muted]">Email</span>
          <input
            className="glass px-3 py-2 focus-ring"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[--muted]">Password</span>
          <input
            className="glass px-3 py-2 focus-ring"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-[--accent]">{message}</p>}
        <div className="flex items-center justify-between gap-2">
          <button
            type="submit"
            disabled={busy}
            className="btn px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {busy ? "Working..." : mode === "login" ? "Login" : "Create account"}
          </button>
          <button
            type="button"
            onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
            className="text-sm text-[--muted] underline underline-offset-4"
          >
            {mode === "login" ? "Need an account?" : "Have an account?"}
          </button>
        </div>
      </form>
    </div>
  );
}
