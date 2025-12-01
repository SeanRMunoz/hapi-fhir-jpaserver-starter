"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <SignIn signUpUrl="/sign-up" />
    </main>
  );
}
