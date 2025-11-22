'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useBooking } from "../providers/booking-context";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, clearAuth, loadingLabel } = useBooking();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem("park-theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return stored ?? (prefersDark ? "dark" : "light");
  });
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/history", label: "History" },
    ...(auth.role === "admin" || auth.role === "owner" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (typeof window !== "undefined") {
      document.body.dataset.theme = next;
      window.localStorage.setItem("park-theme", next);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="shell flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="glass px-3 py-2 pill text-sm font-semibold uppercase tracking-[0.12em] text-[--accent]">
            Bandipur
          </div>
          <p className="text-sm text-[--muted] hidden sm:block">
            National Park ticketing · minimal, reliable, fast
          </p>
        </div>
        <div className="flex items-center gap-3">
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-semibold pill transition-colors ${
                    active
                      ? "bg-[--accent] text-white border-transparent"
                      : "hover:bg-[--accent-soft] text-[--accent-strong]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <button
            aria-label="Toggle light or dark theme"
            onClick={toggleTheme}
            className="pill px-3 py-2 text-sm font-semibold bg-[--accent-soft] text-[--accent-strong] hover:opacity-90 transition-opacity"
          >
            {theme === "light" ? "☀️ Light" : "🌙 Dark"}
          </button>
          {auth.token ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden sm:inline text-[--muted]">
                {auth.user?.name || "Signed in"}
              </span>
              <button
                className="btn btn-secondary text-sm font-semibold px-3 py-2"
                onClick={() => {
                  clearAuth();
                  router.push("/");
                }}
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/summary"
              className="btn text-sm px-4 py-2"
            >
              Login to book
            </Link>
          )}
        </div>
      </header>
      <main className="flex-1 shell w-full">{children}</main>
      <footer className="shell text-sm text-[--muted] flex flex-wrap items-center justify-between gap-2 pb-8">
        <span>Built for the park operations team · real-time availability.</span>
        <span>APIs: bookings, timings, payments.</span>
      </footer>
      {loadingLabel && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass px-6 py-5 flex items-center gap-3">
            <div className="h-4 w-4 rounded-full border-2 border-[--accent] border-t-transparent animate-spin" />
            <p className="text-sm font-medium">{loadingLabel}</p>
          </div>
        </div>
      )}
    </div>
  );
}
