const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-4-5-20250929";

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Server is missing ANTHROPIC_API_KEY. Set it in your Vercel project's Environment Variables." },
      { status: 500 }
    );
  }

  const { system, user, tools } = await request.json();

  const body = {
    model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
    max_tokens: 1000,
    system,
    messages: [{ role: "user", content: user }],
  };
  if (tools) body.tools = tools;

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": ANTHROPIC_VERSION,
  };
  if (Array.isArray(tools) && tools.some((t) => t.type?.startsWith("web_search"))) {
    headers["anthropic-beta"] = "web-search-2025-03-05";
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!res.ok) {
    return Response.json({ error: data?.error?.message || `Anthropic API ${res.status}` }, { status: res.status });
  }
  return Response.json(data);
}
