import { NextResponse } from "next/server";
import { callN8n } from "@/lib/n8n";

// Forwards the browser's JSON body to the n8n webhook and returns the
// workflow's response. Keeps N8N_WEBHOOK_URL on the server.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const result = await callN8n(body);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 502 }
    );
  }

  return NextResponse.json(result.data);
}
