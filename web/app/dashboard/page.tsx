import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

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

  return (
    <main>
      <header className="nav">
        <Link className="link" href="/">HAPI FHIR Frontend</Link>
      </header>
      <section className="card">
        <h1>Dashboard</h1>
        <p>Welcome, {user.firstName ?? user.username ?? user.emailAddresses[0]?.emailAddress ?? "user"}!</p>
        <p>Your user ID is <code>{user.id}</code>.</p>
        <p>
          <Link className="btn" href="/">Back home</Link>
        </p>
      </section>
    </main>
  );
}