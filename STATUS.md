# Atlas — build status against the spec

Audited against `Atlas on Robinhood Chain` (the product PDF — both uploaded copies are
byte-identical, so there is one spec, not two).

**Summary:** the product surface is complete, and the two structural gaps from the last
audit — no persistence, no ecosystem grounding — are now closed. What remains is almost
entirely **credential-gated**: the code paths exist and are wired, but they need a key, a
funded wallet, or a deployed contract address to switch from simulated to live.

---

## ✅ Done

| Spec area | State |
|---|---|
| **All frontend screens** | Project Discovery, Organization Profile, Ecosystem Intelligence, Partnership Workspace, Opportunity Pipeline, plus the Relationship Graph. Complete. |
| **AI Memory** | Every action (register, intel run, discovery, opportunity opened, outreach drafted/sent, partnership logged, status change) is recorded to an append-only log, persisted per wallet, and **fed back into later AI prompts** via `memoryDigest()` so recommendations account for what you already did. Verified surviving a hard page reload. |
| **Persistence** | `lib/store.js`, keyed by wallet address, versioned, quota-safe. Survives refresh with zero credentials. Swappable driver — point it at a DB later without touching components. |
| **Relationship graph** | Interactive radial ecosystem map; nodes colored by kind, distance from center reflects match score, click-through to the workspace. |
| **Ecosystem index (first real layer)** | `/api/ecosystem` reads the **public Robinhood Chain RPC** for live block height and chain ID (no credentials — the RPC is public), merged with a curated set of **verified** entry points: developer docs, testnet faucet, block explorer, the chain developer group, and Alchemy as recommended infra. Discovery prompts are now grounded in these real entities. |
| **Verified vs. archetype labeling** | Index entries are explicitly flagged. Category placeholders are never presented as real named counterparties. |
| **All 10 contracts written** | The core six plus **ProposalRegistry, IdentityRegistry, NotificationRegistry, ActivityRegistry** — self-contained, event-emitting, `forge build`-ready. `DeployAll.s.sol` deploys all ten and prints env-ready addresses. |
| **Team workspace** | Add/remove members with Owner/Admin/Member/Viewer roles, persisted. Maps to `OrganizationRegistry.setMember`. |
| **Opportunity pipeline** | Full spec'd lifecycle — draft → sent → negotiating → accepted → signed → completed → rejected — persisted and surfaced on the dashboard. |
| **Reputation** | Now derived from actual recorded activity (intel runs, opportunities, pipeline entries, team size) rather than a display-only constant. |
| **Multi-chain architecture** | `lib/chains.js` registry with Robinhood testnet/mainnet plus all 10 spec'd expansion targets declared and gated. |
| **Free demo mode** | Every feature runs at $0 with no key. See "AI provider" below. |
| **Outreach drafting** | All 6 channels, channel-native copy. |
| **Live opportunity scan** | After discovery names *who* to approach, `/api/scan` answers *what is open there right now* — applications, tracks, and rounds, each with status, deadline, and next action. With a search key it runs a real web search and marks results `verified` with source URLs; without one it marks everything `inferred` and surfaces the real links to confirm against. The distinction is visible in the UI, so inferred results are never mistaken for confirmed listings. |
| **Lead lists + follow-up engine** | Paste a CSV/TSV list (header auto-detected) or add leads one at a time. Atlas generates a per-lead brief — overview, fit, priority score, opening angle, and risks — then builds a 4-step follow-up cadence that shortens each touch and always gives an explicit exit. Per-step copy, six-stage lead status, fully persisted. |

---

## 🟡 Wired but credential-gated

These are **built and connected** — they flip from simulated to live the moment a value exists.
No code changes required.

| Feature | Switch | What it needs |
|---|---|---|
| **Real on-chain writes** | `NEXT_PUBLIC_*_REGISTRY` addresses | Deploy via `forge script script/DeployAll.s.sol` using a funded testnet wallet. `lib/contracts.js` `isLive()` already gates it. Until then, registration and partnership logging are simulated. |
| **Outreach sending** | Per-channel env vars | `RESEND_API_KEY`+`OUTREACH_FROM_EMAIL` (email), `TELEGRAM_BOT_TOKEN`+`TELEGRAM_CHAT_ID`, `DISCORD_WEBHOOK_URL`, `NEYNAR_API_KEY`+`NEYNAR_SIGNER_UUID` (Farcaster). `/api/outreach` reports exactly which var each channel is missing instead of silently no-opping. |
| **X / LinkedIn sending** | OAuth flow | These need per-user OAuth, not a static key — declared and surfaced as such rather than pretending. |
| **Live AI model** | `VIRTUALS_API_KEY` | Optional; demo mode covers demonstrations for free. |
| **Verified opportunity scanning** | `SERPER_API_KEY` or `TAVILY_API_KEY` | Turns the scanner from inferred to real-web-search-backed. Without it the feature still works and says so plainly. |
| **WalletConnect / Coinbase** | `NEXT_PUBLIC_WC_PROJECT_ID` | Injected wallets (MetaMask, Rabby) connect for real today. |

---

## ❌ Genuinely not built

| Gap | Note |
|---|---|
| **Deep per-project indexing** | The index covers chain config, official entry points, and live chain head. It does **not** yet crawl per-project deployments, GitHub activity per team, a grant calendar, governance proposals, or profile-view tracking. Those need a scheduled crawler + storage, and some need sources that don't publicly exist yet (there is no public Robinhood Chain grants portal — the developer group is the documented route). |
| **Automatic project understanding** | Spec wants Atlas to read your website, docs, GitHub, whitepaper, and socials automatically. Today the founder types a description. `IdentityRegistry` provides the on-chain half (handle claims + attestation); the crawler is not built. |
| **Server-side multi-user storage** | Persistence is per-browser. Shared team state needs a database and wallet auth. |
| **Expansion chains** | Declared in `lib/chains.js`, no indexers built. |

---

## Note on the AI provider & demo mode

Atlas does **not** call the Anthropic API and is not billed by Anthropic. Two modes, resolved
per request in `app/api/claude/route.js`:

- **Demo mode (free).** No `VIRTUALS_API_KEY`, or `ATLAS_DEMO_MODE=1` → realistic,
  input-tailored content generated locally. Zero cost. Recommended for demonstrations.
- **Live mode.** With a key, calls the **Virtuals compute gateway** (`compute.virtuals.io/v1`),
  which fronts Claude behind an OpenAI-compatible `/chat/completions` endpoint. Model defaults
  to `claude-opus-4-7-fast`. Falls back to demo content if the gateway is unreachable, so the
  UI can never render empty.

---

## Recommended next steps

1. **Deploy the 10 contracts** (needs only a faucet-funded throwaway testnet wallet) — removes
   the last "looks real but is simulated" surface.
2. **Add a database** for shared/team state and cross-device memory.
3. **Build the crawler** for per-project and GitHub signals — the remaining index depth.
