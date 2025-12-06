"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main>
      <header className="nav">
        <Link className="link" href="/">HAPI FHIR Frontend</Link>
        <div className="actions">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn">Sign in</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <section className="card">
        <h1>Welcome</h1>
        <p>This minimal Next.js app uses Clerk for authentication.</p>
        <p style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link className="btn" href="/dashboard">Go to Dashboard</Link>
          <Link className="btn" href="/patient-query">Patient Query</Link>
        </p>
      </section>
    </main>
  );
}
