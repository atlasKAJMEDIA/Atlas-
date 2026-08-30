# KAJ Media Command

A client progress tracker & KPI dashboard for KAJ Media — appointment setting + personal branding tracks, with soft sign-in, per-edit attribution, an activity feed, an agency business roll-up (MRR / ARPU / LTV / churn), and live client-facing reports.

It's a **single static file** (`index.html`) — no build step, no dependencies.

## Deploy on Vercel (2 minutes)

1. Go to **vercel.com → Add New → Project**.
2. Import the GitHub repo **`atlasKAJMEDIA/Atlas-`** (authorize Vercel for GitHub if asked).
3. In the import screen:
   - **Root Directory** → click *Edit* → select **`client-dashboard`**
   - **Framework Preset** → **Other**
   - Build & Output settings → leave empty (it's static)
   - **Production Branch** → pick the branch this lives on (`claude/client-progress-dashboard-5xxkt2`, or `main` after you merge it)
4. Click **Deploy**. You'll get a live URL like `kaj-media-command.vercel.app` — share it with your team and clients.

Every push to that branch auto-redeploys.

## How data is saved

- **Inside Claude (the artifact link):** state is saved to a shared file, so everyone on the link sees the same data live.
- **On Vercel (this hosted version):** state is saved in each visitor's **browser (localStorage)** — fully usable and private per device, but **not shared across people or devices**.

### Want real shared logins + synced data across everyone?
That needs a small backend (a database + auth). Recommended: **Supabase** (free tier) or **Vercel KV**. The app is structured so this is a drop-in upgrade — ask and it can be wired up:
- `state` is a single JSON object loaded on boot and saved on change (see `boot()` / `doSave()`), so swapping localStorage for a Supabase table is a contained change.
- Sign-in already captures identity + role (team/client) and stamps every edit, ready to map onto real auth.

## Local preview

Just open `index.html` in a browser, or:

```bash
cd client-dashboard
python3 -m http.server 8080   # then visit http://localhost:8080
```
