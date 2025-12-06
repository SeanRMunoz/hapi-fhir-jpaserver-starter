import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import Link from "next/link";
import CopyToClipboardButton from "../../components/CopyToClipboardButton";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    // In middleware, non-public routes are protected, so this is a fallback.
    return (
      <main>
        <section className="card">
          <h1>Not signed in</h1>
          <p>
            Please <Link className="btn" href="/sign-in">sign in</Link> to continue.
          </p>
        </section>
      </main>
    );
  }

  // In Next.js App Router, cookies() should be awaited before accessing values.
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("Authorization")?.value;

  return (
    <main>
      <header className="nav">
        <Link className="link" href="/">HAPI FHIR Frontend</Link>
      </header>
      <section className="card">
        <h1>Dashboard</h1>
        <p>Welcome, {user.firstName ?? user.username ?? user.emailAddresses[0]?.emailAddress ?? "user"}!</p>
        <p>Your user ID is: <code>{user.id}</code></p>
        {authCookie && (
          <div>
            <label htmlFor="authCookie">Authorization cookie:</label>
            <div>
              <input
                id="authCookie"
                type="text"
                readOnly
                value={authCookie}
                style={{ width: "100%", fontFamily: "monospace" }}
              />
              <div style={{ marginTop: "0.5rem" }}>
                <CopyToClipboardButton text={authCookie} label="Copy cookie" className="btn" />
              </div>
            </div>
          </div>
        )}
        <p style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link className="btn" href="/">Back home</Link>
          <Link className="btn" href="/patient-query">Patient Query</Link>
        </p>
      </section>
    </main>
  );
}