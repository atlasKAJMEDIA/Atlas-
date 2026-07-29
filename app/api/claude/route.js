/* Atlas AI proxy — Virtuals compute gateway (OpenAI-compatible chat completions).
 *
 * Runs server-side only so VIRTUALS_API_KEY is never shipped to the browser.
 * Virtuals fronts Claude models through an OpenAI-shaped /chat/completions
 * endpoint, so the request/response shape here is OpenAI's, not Anthropic's.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_BASE = "https://compute.virtuals.io/v1";
const DEFAULT_MODEL = "claude-opus-4-7-fast";

export async function POST(request) {
  const apiKey = process.env.VIRTUALS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Server is missing VIRTUALS_API_KEY. Add it in Vercel → Settings → Environment Variables." },
      { status: 500 }
    );
  }

  let system, user;
  try {
    ({ system, user } = await request.json());
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const base = (process.env.VIRTUALS_BASE_URL || DEFAULT_BASE).replace(/\/+$/, "");
  const model = process.env.VIRTUALS_MODEL || DEFAULT_MODEL;

  let res, data;
  try {
    res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: 1200,
        temperature: 0.7,
      }),
    });
    data = await res.json();
  } catch (e) {
    return Response.json({ error: `Could not reach the Virtuals gateway: ${e.message}` }, { status: 502 });
  }

  if (!res.ok) {
    const detail = data?.error?.message || data?.message || `Virtuals API ${res.status}`;
    return Response.json({ error: detail }, { status: res.status });
  }

  // Standard OpenAI chat-completions shape. If the gateway ever returns a
  // different envelope, surface that instead of silently handing back "".
  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text) {
    return Response.json(
      { error: `Gateway returned no message content (top-level keys: ${Object.keys(data || {}).join(", ") || "none"}).` },
      { status: 502 }
    );
  }
  return Response.json({ text });
}
