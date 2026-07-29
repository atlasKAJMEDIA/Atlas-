# Atlas — AI Business Development OS for Robinhood Chain

A Next.js app wrapping the Atlas product UI (`components/AtlasApp.jsx`), ready to deploy on Vercel.

## What's in this repo

- `app/` — Next.js App Router entry (`page.jsx`, `layout.jsx`) and the `api/claude` route.
- `components/AtlasApp.jsx` — the Atlas UI. Calls `/api/claude` instead of the Anthropic API directly, so no API key is ever shipped to the browser.
- `app/api/claude/route.js` — server-side proxy that attaches `ANTHROPIC_API_KEY` and forwards requests to Anthropic.
- `scaffold/` — optional on-chain layer (Foundry contracts + wagmi config) for wiring the app to real wallets/contracts on Robinhood Chain instead of the built-in simulated wallet. Not required to deploy the web app.

## Credentials you need

| Credential | Where to get it | Required for |
|---|---|---|
| **Anthropic API key** | [console.anthropic.com](https://console.anthropic.com) → Settings → API Keys → Create Key. Requires a billing method on the account. | The AI features (Intelligence, Discover, reports, outreach). Set as `ANTHROPIC_API_KEY` — server-side only, in Vercel's Environment Variables, never in a `NEXT_PUBLIC_*` var or committed to git. |
| **GitHub account access to this repo** | You already have this — `atlaskajmedia/atlas-`. | Hosting the source and letting Vercel auto-deploy on push. |
| **Vercel account** | [vercel.com/signup](https://vercel.com/signup) → sign up/in with GitHub. | Building and hosting the live site. |
| **WalletConnect / Reown Project ID** *(optional)* | [cloud.reown.com](https://cloud.reown.com) → create a project → copy Project ID. | Only needed if you wire up the real `walletConnect` connector in `scaffold/lib/wagmi.ts`. The deployed app works today with MetaMask/injected or a simulated wallet without this. |
| **A funded testnet wallet private key** *(optional)* | Any wallet (e.g. MetaMask) exported private key, funded with Robinhood Chain testnet ETH. | Only needed once, locally, to run `forge script script/DeployAll.s.sol` in `scaffold/` to deploy the registry contracts. Never put this in Vercel or commit it — it's a local `export PRIVATE_KEY=...` for the deploy script only. |
| **Custom domain** *(optional)* | Your domain registrar (Namecheap, GoDaddy, Google Domains, etc.) or buy one through Vercel. | Only if you want `yourdomain.com` instead of the default `*.vercel.app` URL. Add it in Vercel → Project → Settings → Domains, then add the DNS records Vercel shows you at your registrar. |

## Deploy to Vercel

1. Push this branch/repo to GitHub (already done if you're reading this from the repo).
2. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub, and import `atlaskajmedia/atlas-`.
3. Vercel auto-detects Next.js — no build config changes needed.
4. Before the first deploy (or right after), add environment variables in **Project → Settings → Environment Variables**:
   - `ANTHROPIC_API_KEY` = your key from the table above.
5. Click **Deploy**. You'll get a live URL like `atlas-xyz.vercel.app`.
6. Every future push to this branch/main will auto-redeploy.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in ANTHROPIC_API_KEY
npm run dev
```

## Optional: real on-chain wiring

See `scaffold/README.md` for deploying the registry contracts to Robinhood Chain testnet and swapping the simulated wallet/transactions in `AtlasApp.jsx` for real `wagmi` hooks. Not required for the app to run or deploy.
