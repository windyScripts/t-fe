import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "./components/AppShell";
import BookingProvider from "./providers/booking-context";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "National Park Booking",
  description: "Reserve safari tickets, pay, and view your park bookings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${geistMono.variable} antialiased`}>
        <BookingProvider>
          <AppShell>{children}</AppShell>
        </BookingProvider>
      </body>
    </html>
  );
}
