import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patriot Marketplace · Team Starter",
  description: "The shared development foundation for Patriot Marketplace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <header>
          <Link className="brand" href="/">Patriot<span>Marketplace</span></Link>
          <nav aria-label="Main navigation">
            <Link href="/">Home</Link><Link href="/sell">Sell</Link>
            <Link href="/messages">Messages</Link><Link href="/profile">Profile</Link>
            <Link href="/login">Sign in</Link>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer>Student-built. GMU email verification is planned. This starter is not an operational marketplace.</footer>
      </body>
    </html>
  );
}
