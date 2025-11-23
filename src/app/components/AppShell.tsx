'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useBooking } from "../providers/booking-context";
import { registerUnauthorizedHandler } from "../lib/auth-events";
import Button from "./ui/Button";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuOpenedPath, setMenuOpenedPath] = useState(pathname);
  const [logoutNotice, setLogoutNotice] = useState(false);
  const navLinks = [
    { href: "/", label: "Book tickets" },
    { href: "/history", label: "View booking history" },
    ...(auth.role === "admin" || auth.role === "owner"
      ? [{ href: "/admin", label: "Admin dashboard" }]
      : []),
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

  useEffect(() => {
    const unsubscribe = registerUnauthorizedHandler(() => {
      setLogoutNotice(true);
      window.setTimeout(() => setLogoutNotice(false), 4500);
    });
    return unsubscribe;
  }, []);

  const isMenuOpen = menuOpen && pathname === menuOpenedPath;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="shell relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="glass px-3 py-2 pill text-sm font-semibold uppercase tracking-[0.12em] text-[--accent]">
            Bandipur
          </div>
          <p className="text-sm text-[--muted] hidden sm:block">
            National Park ticketing · minimal, reliable, fast
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={`${isMenuOpen ? "Close" : "Open"} navigation menu`}
            aria-expanded={isMenuOpen}
            onClick={() =>
              setMenuOpen((prev) => {
                const next = !prev;
                if (next) {
                  setMenuOpenedPath(pathname);
                }
                return next;
              })
            }
            className="md:hidden glass h-10 w-10 flex items-center justify-center rounded-xl border border-[--stroke] text-[--ink] transition hover:opacity-90"
          >
            {isMenuOpen ? (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-6 w-6 stroke-current"
              >
                <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-6 w-6 stroke-current"
              >
                <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`btn text-sm px-4 py-2 ${
                    active ? "btn-secondary cursor-default" : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <Button
            aria-label="Toggle light or dark theme"
            onClick={toggleTheme}
            variant="ghost"
            size="sm"
            className="px-3 py-2 text-sm font-semibold border border-[--accent] text-[--accent-strong] bg-[--accent-soft] hover:opacity-90"
          >
            {theme === "light" ? "☀️ Light" : "🌙 Dark"}
          </Button>
          {auth.token ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden sm:inline text-[--muted]">
                {auth.user?.name || "Signed in"}
              </span>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  clearAuth();
                  router.push("/");
                }}
              >
                Log out
              </Button>
            </div>
          ) : (
            <Link
              href="/summary"
              aria-current={pathname === "/summary" ? "page" : undefined}
              className={`btn text-sm px-4 py-2 ${
                pathname === "/summary" ? "btn-secondary cursor-default" : ""
              }`}
            >
              Login to book
            </Link>
          )}
        </div>
        {isMenuOpen && (
          <div className="absolute left-0 right-0 top-full z-20 md:hidden">
            <div className="px-[clamp(1rem,3vw,2.2rem)] pt-2">
              <div className="glass p-3 flex flex-col gap-2">
                {navLinks.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`btn text-sm px-4 py-2 text-center ${
                        active ? "btn-secondary cursor-default" : ""
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1 shell w-full">{children}</main>
      <footer className="shell text-sm text-[--muted] flex flex-wrap items-center justify-between gap-2 pb-8">
        <span>Built for the park operations team · real-time availability.</span>
        <span>APIs: bookings, timings, payments.</span>
      </footer>
      {logoutNotice && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="glass px-4 py-3 shadow-lg border border-[--stroke] text-sm font-semibold text-[--accent-strong]">
            Session expired. You’ve been logged out.
          </div>
        </div>
      )}
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
