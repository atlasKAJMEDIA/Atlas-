/* Outreach send layer.
 *
 * Spec: the outreach engine should generate AND send across Email, Telegram,
 * Discord, Farcaster, X, LinkedIn — then track the conversation.
 *
 * Each channel is a driver that activates only when its credential exists.
 * With no credentials configured the endpoint reports `configured: false` and
 * the UI stays in draft-and-copy mode rather than pretending a send happened.
 * Nothing here silently no-ops: an unconfigured send returns an explicit
 * reason naming the env var that would enable it.
 */

export const runtime = "nodejs";
export const maxDuration = 30;

const DRIVERS = {
  Email: {
    env: "RESEND_API_KEY",
    extra: ["OUTREACH_FROM_EMAIL"],
    async send({ to, subject, body }) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.OUTREACH_FROM_EMAIL,
          to: [to],
          subject: subject || "(no subject)",
          text: body,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Resend ${res.status}`);
      return { id: data?.id };
    },
  },

  Telegram: {
    env: "TELEGRAM_BOT_TOKEN",
    extra: ["TELEGRAM_CHAT_ID"],
    async send({ body }) {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.description || `Telegram ${res.status}`);
      return { id: String(data?.result?.message_id ?? "") };
    },
  },

  Discord: {
    env: "DISCORD_WEBHOOK_URL",
    async send({ subject, body }) {
      const res = await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: (subject ? `**${subject}**\n` : "") + body }),
      });
      if (!res.ok) throw new Error(`Discord webhook ${res.status}`);
      return { id: "webhook" };
    },
  },

  Farcaster: {
    env: "NEYNAR_API_KEY",
    extra: ["NEYNAR_SIGNER_UUID"],
    async send({ body }) {
      const res = await fetch("https://api.neynar.com/v2/farcaster/cast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEYNAR_API_KEY,
        },
        body: JSON.stringify({ signer_uuid: process.env.NEYNAR_SIGNER_UUID, text: body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Neynar ${res.status}`);
      return { id: data?.cast?.hash };
    },
  },

  // X and LinkedIn require per-user OAuth, not a static key. Declared so the
  // UI can show them as "needs OAuth" rather than silently missing.
  X: { env: "X_API_BEARER_TOKEN", oauth: true },
  LinkedIn: { env: "LINKEDIN_ACCESS_TOKEN", oauth: true },
};

function driverStatus() {
  return Object.fromEntries(
    Object.entries(DRIVERS).map(([channel, d]) => {
      const missing = [d.env, ...(d.extra || [])].filter((k) => !process.env[k]);
      return [channel, { configured: missing.length === 0 && !d.oauth, missing, oauth: !!d.oauth }];
    })
  );
}

export async function GET() {
  return Response.json({ channels: driverStatus() });
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { channel, to, subject, body } = payload || {};
  const driver = DRIVERS[channel];
  if (!driver) {
    return Response.json({ error: `Unknown channel "${channel}".` }, { status: 400 });
  }

  const missing = [driver.env, ...(driver.extra || [])].filter((k) => !process.env[k]);
  if (driver.oauth) {
    return Response.json(
      {
        sent: false,
        configured: false,
        reason: `${channel} sending requires per-user OAuth, which isn't set up. Draft is ready to paste manually.`,
      },
      { status: 200 }
    );
  }
  if (missing.length) {
    return Response.json(
      {
        sent: false,
        configured: false,
        reason: `${channel} sending is not configured. Set ${missing.join(" and ")} in your environment to enable it. Draft is ready to paste manually.`,
      },
      { status: 200 }
    );
  }

  // Email is the one channel that needs a recipient; catch an empty one early
  // with a clear message instead of letting the provider fail cryptically.
  if (channel === "Email" && !(to && String(to).includes("@"))) {
    return Response.json(
      { sent: false, configured: true, reason: "This lead has no email address on file. Add one to send." },
      { status: 200 }
    );
  }

  if (!body || !String(body).trim()) {
    return Response.json(
      { sent: false, configured: true, reason: "Nothing to send — the message body is empty." },
      { status: 200 }
    );
  }

  try {
    const result = await driver.send({ to, subject, body });
    return Response.json({ sent: true, configured: true, channel, ...result });
  } catch (e) {
    return Response.json({ sent: false, configured: true, error: e.message }, { status: 502 });
  }
}
