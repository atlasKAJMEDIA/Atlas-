# Atlas — build status against the spec

Audited against `Atlas on Robinhood Chain` (the product PDF). Last updated with the
Virtuals AI wiring + design-system rebuild.

**One-line summary:** the *product surface* is largely built — every screen in the spec's
"Frontend Evolution" exists and works end to end. The *data layer underneath it is not*.
Every AI output today comes from the model's general knowledge, not from indexed Robinhood
Chain data, and nothing persists between page refreshes. Those two gaps are what separate
this from the "Bloomberg Terminal for Robinhood Chain" in the vision.

---

## ✅ Done

| Spec area | What's actually working |
|---|---|
| **Frontend evolution** (all 5 screens) | Project Discovery, Organization Profile, AI Ecosystem Intelligence, Partnership Workspace, Opportunity Pipeline all exist and navigate. The full spec'd mapping is complete. |
| **Robinhood-native workflow** | Connect → understand project → discover → score → explain why → generate outreach → log on-chain runs start to finish. |
| **Chain configuration** | Chain ID 46630, RPC, ETH currency, explorer — all correct, and the app auto-prompts `wallet_addEthereumChain` on connect. |
| **Opportunity Discovery Engine** | Scores 0–100, mixes partnership/grant/investor, gives a reason per opportunity, filterable by kind, sorted by score. Matches the spec's "opportunities not contacts" philosophy. |
| **AI Research Agent (report layer)** | Generates an executive brief per opportunity: summary, fit points, suggested next action. |
| **Outreach Engine** | All 6 spec'd channels — Email, Telegram, Discord, Farcaster, X, LinkedIn — each generating channel-native copy. Copy-to-clipboard works. |
| **Smart contracts (6 of 10) written** | ProjectRegistry, OrganizationRegistry, PartnershipRegistry, GrantRegistry, InvestorRegistry, ReputationRegistry — written, self-contained, compile with plain `forge build`. |
| **Deployment** | Live-deployable on Vercel. AI key held server-side only, never shipped to the browser. |
| **Design system** | Rebuilt to the reference: ring gauges, colored opportunity tiles, progress bars, pill nav, black feature cards. |

---

## 🟡 Partial — works, but not the way the spec describes

| Spec area | What's there | What's missing |
|---|---|---|
| **Wallet integration** | All 5 wallets listed (MetaMask, WalletConnect, Coinbase, Rabby, Robinhood); injected providers (MetaMask/Rabby) genuinely connect. | WalletConnect and Coinbase need their own SDKs — right now every button uses the injected flow, and falls back to a simulated wallet when none is present. `scaffold/lib/wagmi.ts` has the config ready but isn't wired into the app. |
| **On-chain identity** | Register mints an Organization ID and returns a tx hash; Partnership logging does the same. | **Both are simulated** (`setTimeout` + a generated hash). The contracts exist but are not deployed, and the frontend does not call them. This is the single biggest "looks done but isn't" item. |
| **AI Project Intelligence** | Produces category, strengths, gaps, ecosystem position, funding readiness. | The spec says Atlas understands a project *automatically from website, docs, GitHub, whitepaper, smart contract, wallet, and social accounts*. Today the founder types a description and the AI reasons from that alone. No crawling, no repo reading, no contract inspection. Competitor analysis isn't generated at all. |
| **AI Research Agent (depth)** | Executive brief per opportunity. | Spec calls for real research into audits, tokenomics, TVL, transaction volume, roadmap, team, community, wallet activity. None of those sources are actually consulted. |
| **Dashboard** | Answers "who should we partner with next, and why". | The other 6 dashboard questions in the spec — which projects launched this week, which grants opened recently, which investors are active, which integrations are highest-impact, who viewed our profile, what's time-sensitive — all require the ecosystem indexer that doesn't exist yet. |
| **Outreach** | Generates the message. | Doesn't *send* anything. No channel integrations, no reply tracking, no "tracks conversations" step from the workflow. |

---

## ❌ Not started

| Spec area | Why it matters |
|---|---|
| **Robinhood Ecosystem Intelligence (the indexer)** | The spec's core asset: continuously index projects, developers, wallets, infra, protocols, DEXs, bridges, hackathons, grants, foundation programs, governance, announcements, GitHub activity. **Nothing indexes anything today.** Opportunities are plausible archetypes the model invents, not real counterparties. This is the difference between a demo and the actual product. |
| **AI Memory** | Spec: remember prior outreach, meetings, grant submissions, investor conversations, follow-ups, accepted/rejected partnerships, and improve recommendations over time. There is **no persistence of any kind** — all state is in-memory React state and is lost on refresh. No database, no user accounts. |
| **Relationship Graph** | The interactive ecosystem map connecting projects, investors, foundations, partners, developers, protocols, hackathons, grant programs, communities. Not built. |
| **4 remaining contracts** | ProposalRegistry, IdentityRegistry, NotificationRegistry, ActivityRegistry — named in the spec, not yet written. |
| **Team workspace** | Spec promises a team workspace with members/permissions/departments on connect. `OrganizationRegistry.sol` supports roles, but there's no UI and no auth. |
| **Reputation Engine (real)** | Currently a display-only number derived from local UI state. Spec wants it computed from integrations, grants, governance, contributions, collaborations. |
| **Multi-chain expansion** | Ethereum, Base, Solana, Avalanche, Arbitrum, Optimism, Polygon, Monad, Sui, Aptos. Chain config is currently a single hardcoded object — it's a clean refactor, but nothing exists yet. |

---

## Recommended order of work

1. **Persistence first.** Add a database (Postgres/Supabase) + wallet-based auth. Without it, AI Memory, the pipeline, and the dashboard can't exist — and everything a user does today is thrown away. This unblocks the most spec'd features per unit of effort.
2. **Deploy the 6 contracts and wire them up.** Replace the simulated `setTimeout` writes with real `wagmi` `useWriteContract` calls. Removes the biggest credibility gap in a demo.
3. **Build a minimal indexer.** Even a thin version — read Robinhood Chain testnet contracts/deployments + a curated grants/investors list — moves opportunities from "invented" to "real", which is the entire product thesis.
4. **Then** the relationship graph and the remaining 4 contracts, which both depend on 1–3 to have anything to show.

---

## Note on the AI provider

The app calls the **Virtuals compute gateway** (`compute.virtuals.io/v1`), not the Anthropic API
directly. Virtuals fronts Claude models behind an OpenAI-compatible `/chat/completions`
endpoint, so `app/api/claude/route.js` speaks the OpenAI request/response shape and reads
`VIRTUALS_API_KEY`. Model defaults to `claude-opus-4-7-fast`; override with `VIRTUALS_MODEL`.

One consequence of the switch: the original code passed Anthropic's `web_search` tool on the
intelligence run. That tool is Anthropic-API-specific and does not exist in the chat-completions
contract, so it was removed. Live web grounding now has to come from the indexer in item 3
above rather than from the model call — which is the right place for it anyway.
