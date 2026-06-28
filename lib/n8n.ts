/**
 * Server-side helper: POSTs the app's input to the n8n webhook and returns the
 * parsed JSON the workflow's "Respond to Webhook" node sends back.
 *
 * The webhook URL lives in N8N_WEBHOOK_URL (server env only) so it is never
 * shipped to the browser. Call this from a route handler or server action,
 * not from client components.
 */

export type N8nResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string; status?: number };

export async function callN8n(
  input: unknown,
  init?: { signal?: AbortSignal; timeoutMs?: number }
): Promise<N8nResult> {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) {
    return { ok: false, error: "N8N_WEBHOOK_URL is not set" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    init?.timeoutMs ?? 60_000
  );

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Skip ngrok's free-tier browser interstitial when n8n is tunneled.
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(input ?? {}),
      signal: init?.signal ?? controller.signal,
      cache: "no-store",
    });

    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      // Non-JSON response — hand back the raw text so the caller can surface it.
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error:
          typeof parsed === "string"
            ? parsed || `Webhook returned ${res.status}`
            : `Webhook returned ${res.status}`,
      };
    }

    return { ok: true, data: parsed };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      error: aborted
        ? "Request to n8n timed out"
        : err instanceof Error
        ? err.message
        : "Unknown error calling n8n",
    };
  } finally {
    clearTimeout(timeout);
  }
}
