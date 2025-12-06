import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt: string | undefined = body?.prompt;
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Missing 'prompt'" }, { status: 400 });
    }

    const url = process.env.N8N_AGENT_URL;
    if (!url) {
      return NextResponse.json(
        { error: "Server not configured: N8N_AGENT_URL is missing" },
        { status: 500 }
      );
    }

    const outboundHeaders: Record<string, string> = {
      "content-type": "application/json",
    };

    // Forward the app's Authorization cookie as a Bearer token if present
    try {
      const cookieStore = await cookies();
      const authCookie = cookieStore.get("Authorization")?.value;
      if (authCookie) {
        outboundHeaders["authorization"] = `Bearer ${authCookie}`;
      }
    } catch {
      // no-op, cookies might not be available
    }

    const upstream = await fetch(url, {
      method: "POST",
      headers: outboundHeaders,
      body: JSON.stringify({ prompt }),
    });

    const ct = upstream.headers.get("content-type") || "";
    const buff = await upstream.arrayBuffer();

    return new NextResponse(buff, {
      status: upstream.status,
      headers: { "content-type": ct || "text/plain" },
    });
  } catch (e: any) {
    const message = e?.message || "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
