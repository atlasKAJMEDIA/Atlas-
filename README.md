# Helix — AI Business Development OS for Robinhood Chain

A Next.js app wrapping the Helix product UI (`components/HelixApp.jsx`), ready to deploy on Vercel.

## What's in this repo

- `app/` — Next.js App Router entry (`page.jsx`, `layout.jsx`) and the `api/claude` route.
- `components/HelixApp.jsx` — the Helix UI. Calls `/api/claude` instead of the Anthropic API directly, so no API key is ever shipped to the browser.
- `app/api/claude/route.js` — server-side proxy that attaches `VIRTUALS_API_KEY` and forwards requests to the Virtuals compute gateway (OpenAI-compatible `/chat/completions`, model `claude-opus-4-7-fast`).
- `STATUS.md` — what's built vs. what's left, audited against the product PDF.
- `scaffold/` — optional on-chain layer (Foundry contracts + wagmi config) for wiring the app to real wallets/contracts on Robinhood Chain instead of the built-in simulated wallet. Not required to deploy the web app.

## AI backend & cost

The app has two modes, chosen automatically at request time:

- **Demo mode (free, $0).** Leave `VIRTUALS_API_KEY` unset — or set `HELIX_DEMO_MODE=1` — and the app generates realistic, project-specific content locally for every AI feature. No API calls, no billing, nothing can fail from a bad key or blocked network. **This is the recommended setting for demonstrations.**
- **Live mode.** Set `VIRTUALS_API_KEY` and the app calls the Virtuals compute gateway (which fronts Claude — this is *not* an Anthropic key and does not bill Anthropic). If the gateway is ever unreachable, it silently falls back to demo content so the UI never breaks.

To run a full demo for free: deploy with **no** `VIRTUALS_API_KEY`, or add `HELIX_DEMO_MODE=1`. That's the only setting change needed.

## Credentials you need

| Credential | Where to get it | Required for |
|---|---|---|
| **Virtuals API key** (`acp-…`) *(optional)* | Your Virtuals compute account. This is **not** an Anthropic key — Virtuals fronts Claude behind an OpenAI-compatible endpoint. | Only for **live** AI. The app runs fully in free demo mode without it. Set as `VIRTUALS_API_KEY` — server-side only, in Vercel's Environment Variables, never in a `NEXT_PUBLIC_*` var or committed to git. |
| **GitHub account access to this repo** | You already have this — `helixkajmedia/helix-`. | Hosting the source and letting Vercel auto-deploy on push. |
| **Vercel account** | [vercel.com/signup](https://vercel.com/signup) → sign up/in with GitHub. | Building and hosting the live site. |
| **WalletConnect / Reown Project ID** *(optional)* | [cloud.reown.com](https://cloud.reown.com) → create a project → copy Project ID. | Only needed if you wire up the real `walletConnect` connector in `scaffold/lib/wagmi.ts`. The deployed app works today with MetaMask/injected or a simulated wallet without this. |
| **A funded testnet wallet private key** *(optional)* | Any wallet (e.g. MetaMask) exported private key, funded with Robinhood Chain testnet ETH. | Only needed once, locally, to run `forge script script/DeployAll.s.sol` in `scaffold/` to deploy the registry contracts. Never put this in Vercel or commit it — it's a local `export PRIVATE_KEY=...` for the deploy script only. |
| **Custom domain** *(optional)* | Your domain registrar (Namecheap, GoDaddy, Google Domains, etc.) or buy one through Vercel. | Only if you want `yourdomain.com` instead of the default `*.vercel.app` URL. Add it in Vercel → Project → Settings → Domains, then add the DNS records Vercel shows you at your registrar. |

## Deploy to Vercel

1. Push this branch/repo to GitHub (already done if you're reading this from the repo).
2. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub, and import `helixkajmedia/helix-`.
3. Vercel auto-detects Next.js — no build config changes needed.
4. **For a free demo, add nothing** — just deploy. (Or set `HELIX_DEMO_MODE=1` in **Project → Settings → Environment Variables** to be explicit.) Every feature works at $0.
5. **For live AI later**, add `VIRTUALS_API_KEY` (and optionally `VIRTUALS_MODEL` / `VIRTUALS_BASE_URL`) in the same Environment Variables screen, then redeploy.
6. Click **Deploy**. You'll get a live URL like `helix-xyz.vercel.app`. Every future push auto-redeploys.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in VIRTUALS_API_KEY
npm run dev
```

## Optional: real on-chain wiring

See `scaffold/README.md` for deploying the registry contracts to Robinhood Chain testnet and swapping the simulated wallet/transactions in `HelixApp.jsx` for real `wagmi` hooks. Not required for the app to run or deploy.
