/* Atlas persistence layer.
 *
 * Spec calls for AI Memory: Atlas should remember prior outreach, grant
 * submissions, investor conversations, follow-ups, accepted and rejected
 * partnerships — and improve recommendations from that history.
 *
 * Storage is a swappable driver. Today it's localStorage keyed by wallet
 * address, which survives refreshes and needs no credentials. When a
 * DATABASE_URL exists, point `remoteDriver` at /api/state and the same
 * interface keeps working — no component changes required.
 */

const VERSION = 1;
const NS = "atlas:v" + VERSION + ":";

const EMPTY = {
  org: { name: "", category: "", website: "", desc: "" },
  orgRegistered: false,
  orgTx: null,
  intel: null,
  opps: [],
  members: [],
  // AI Memory — an append-only log of everything the operator has done.
  memory: [],
  pipeline: {}, // opportunityId -> { status, channel, sentAt, hash }
};

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" ? v : fallback;
  } catch {
    return fallback;
  }
}

/* ---------------- localStorage driver (default, zero credentials) -------- */

const localDriver = {
  read(key) {
    if (typeof window === "undefined") return null;
    try {
      return safeParse(window.localStorage.getItem(NS + key), null);
    } catch {
      return null; // private mode / storage disabled
    }
  },
  write(key, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(NS + key, JSON.stringify(value));
    } catch {
      /* quota or disabled — degrade to in-memory for this session */
    }
  },
  clear(key) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(NS + key);
    } catch {}
  },
};

/* ---------------- public API -------------------------------------------- */

export function loadState(address) {
  if (!address) return { ...EMPTY };
  const stored = localDriver.read(address.toLowerCase());
  return stored ? { ...EMPTY, ...stored } : { ...EMPTY };
}

export function saveState(address, state) {
  if (!address) return;
  const slim = {
    org: state.org,
    orgRegistered: state.orgRegistered,
    orgTx: state.orgTx,
    intel: state.intel,
    opps: state.opps,
    members: state.members,
    memory: (state.memory || []).slice(-200), // cap growth
    pipeline: state.pipeline,
  };
  localDriver.write(address.toLowerCase(), slim);
}

export function clearState(address) {
  if (!address) return;
  localDriver.clear(address.toLowerCase());
}

/* ---------------- AI Memory helpers -------------------------------------- */

export const MEMORY_KINDS = {
  ORG_REGISTERED: "org_registered",
  INTEL_RUN: "intel_run",
  DISCOVERY_RUN: "discovery_run",
  OPP_OPENED: "opp_opened",
  OUTREACH_DRAFTED: "outreach_drafted",
  OUTREACH_SENT: "outreach_sent",
  PARTNERSHIP_LOGGED: "partnership_logged",
  STATUS_CHANGED: "status_changed",
};

export function remember(memory, kind, detail) {
  const entry = { id: Date.now() + "-" + Math.random().toString(36).slice(2, 7), kind, detail, at: Date.now() };
  return [...(memory || []), entry];
}

/* Compact the memory log into a prompt fragment so later AI calls are
 * informed by what already happened — this is what makes recommendations
 * improve over time rather than restarting cold every run. */
export function memoryDigest(memory, limit = 12) {
  if (!memory?.length) return "";
  const recent = memory.slice(-limit);
  const lines = recent.map((m) => {
    const when = new Date(m.at).toISOString().slice(0, 10);
    switch (m.kind) {
      case MEMORY_KINDS.OUTREACH_SENT:
        return `${when}: sent ${m.detail.channel} outreach to ${m.detail.name}`;
      case MEMORY_KINDS.OUTREACH_DRAFTED:
        return `${when}: drafted ${m.detail.channel} message for ${m.detail.name}`;
      case MEMORY_KINDS.PARTNERSHIP_LOGGED:
        return `${when}: logged partnership with ${m.detail.name}`;
      case MEMORY_KINDS.STATUS_CHANGED:
        return `${when}: ${m.detail.name} moved to ${m.detail.status}`;
      case MEMORY_KINDS.OPP_OPENED:
        return `${when}: researched ${m.detail.name} (${m.detail.kind})`;
      case MEMORY_KINDS.DISCOVERY_RUN:
        return `${when}: ran discovery, ${m.detail.count} opportunities surfaced`;
      case MEMORY_KINDS.INTEL_RUN:
        return `${when}: ran ecosystem intelligence`;
      default:
        return `${when}: ${m.kind}`;
    }
  });
  return "Prior activity Atlas remembers (do not repeat suggestions already acted on):\n" + lines.join("\n");
}

/* ---------------- pipeline ---------------------------------------------- */

export const PIPELINE_STATUSES = ["draft", "sent", "negotiating", "accepted", "signed", "completed", "rejected"];
