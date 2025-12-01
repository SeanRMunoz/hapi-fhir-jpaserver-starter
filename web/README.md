# HAPI FHIR Frontend (Next.js + Clerk)

This is a minimal Next.js App Router (TypeScript) frontend that uses Clerk for authentication.

## Prerequisites
- Node.js 18.18+ (or 20+)
- Clerk project with Publishable and Secret keys

## Setup
1. Copy env example and fill in your Clerk keys:
   ```bash
   cd web
   copy .env.local.example .env.local   # Windows PowerShell: cp .env.local.example .env.local
   ```
   Edit `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
   CLERK_SECRET_KEY=sk_test_your_key
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```
   App runs at http://localhost:3000

## Routes
- `/` Public landing page
- `/sign-in` Clerk Sign In
- `/sign-up` Clerk Sign Up
- `/dashboard` Protected page (requires auth)

Middleware protects all non-public routes. Public routes are declared in `middleware.ts`.

## Notes
- This frontend is currently standalone and not wired to the Java backend. Add API calls/fetchers as needed.
- To customize Clerk components or theming, see Clerk docs: https://clerk.com/docs
