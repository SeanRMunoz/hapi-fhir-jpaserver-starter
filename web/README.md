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
- `/patient-query` Patient Query UI (posts prompts to an n8n agent)

## Patient Query setup
1. Configure the n8n agent endpoint in `.env.local`:
   ```
   N8N_AGENT_URL=http://localhost:5678/webhook/patient-agent
   ```
2. Start the dev server and open http://localhost:3000/patient-query
3. Enter a prompt. The frontend calls `POST /api/patient-query`, which forwards `{ prompt }` to `N8N_AGENT_URL`.
   - If signed in, the app will forward the `Authorization` cookie as `Bearer <token>` to the n8n endpoint.
   - Agent responses may include Markdown. The UI renders Markdown (GitHub Flavored Markdown via `react-markdown` + `remark-gfm`). Raw HTML in responses is not executed.

## Notes
- This frontend is currently standalone and not wired to the Java backend. Add API calls/fetchers as needed.
- To customize Clerk components or theming, see Clerk docs: https://clerk.com/docs
