/* Helix AI proxy.
 *
 * Thin wrapper over lib/ai-server.js, which owns the demo/live resolution.
 * Keeps the API key server-side — it never reaches the browser.
 */

import { runAI } from "../../../lib/ai-server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request) {
  let system, user;
  try {
    ({ system = "", user = "" } = await request.json());
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const result = await runAI({ system, user });
  return Response.json(result);
}
