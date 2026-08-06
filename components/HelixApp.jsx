"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Wallet, Home, BarChart3, Zap, Leaf, Building2, Network, Send, Plus, Trash2,
  ArrowLeft, ArrowRight, RefreshCw, Copy, Check, Sparkles, ExternalLink, ShieldCheck,
  Radar, Users,
} from "lucide-react";
import {
  loadState, saveState, remember, memoryDigest, MEMORY_KINDS, PIPELINE_STATUSES,
  LEAD_STATUSES, makeLead, parseLeads,
} from "../lib/store";
import { DEFAULT_CHAIN, EXPANSION_CHAINS } from "../lib/chains";

/* ============================================================
   ATLAS — AI Business Development OS for Robinhood Chain
   "Discover Partners. Find Grants. Raise Capital. Grow Faster."

   DESIGN SYSTEM
   page       #E3E3E1   surface    #F4F4F2   raised   #FFFFFF
   ink-1      #14151A   ink-2      #6B7076   ink-3    #9AA0A6
   feature    #101114 (black card, light type)
   tiles      orange #F9BE7C · green #A9DDC2 · yellow #F5D46E · blue #B7D5F5
   primary    #93E3B0 (green, dark type)   contrast #101114 (black, light type)
   radius     28 card · 20 tile · 16 control · 100 pill
   ============================================================ */

const CSS = `
  .hx { --page:#F1F1EC; --surface:#FFFFFF; --raised:#FFFFFF;
        --ink:#0E0E0E; --ink2:#5F6360; --ink3:#9A9E99; --line:#E6E6DF;
        --lime:#C6F24E; --lime-2:#A8E62E; --lime-3:#DCF7A0; --lime-4:#7FD63F;
        --green:#2FBF4E; --green-dk:#14532D; --blue:#1E7FD4;
        min-height:100vh; background:var(--page); color:var(--ink);
        font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Helvetica,Arial,sans-serif;
        -webkit-font-smoothing:antialiased; display:flex; justify-content:center; }
  .hx * { box-sizing:border-box; }
  .hx button { font-family:inherit; }
  .hx .g { color:var(--green); }
  .hx .b { color:var(--blue); }

  .hx-shell { width:100%; max-width:580px; background:var(--page); min-height:100vh;
    padding:34px 26px 132px; position:relative; }
  @media (min-width:640px){
    .hx { padding:34px 20px; align-items:flex-start; }
    .hx-shell { min-height:auto; border-radius:30px; box-shadow:0 18px 60px rgba(0,0,0,.09); padding:38px 32px 132px; }
  }

  /* pill badge like the "Features" tag */
  .hx-badge { display:inline-block; background:var(--green-dk); color:#EAFBE7; font-size:12px;
    font-weight:600; letter-spacing:.01em; padding:7px 16px; border-radius:100px; margin-bottom:16px; }
  /* persistent brand wordmark, top of every page */
  .hx-brand { display:flex; align-items:center; gap:9px; margin-bottom:26px; }
  .hx-brand .m { width:27px; height:27px; border-radius:8px; background:var(--lime);
    display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .hx-brand .w { font-size:19px; font-weight:700; letter-spacing:-.04em; color:var(--ink); }
  .hx-brand .w b { color:var(--green); font-weight:700; }
  /* connect-gate wordmark, sits above the logo */
  .hx-wordmark { font-size:20px; font-weight:700; letter-spacing:.14em; text-transform:uppercase;
    color:var(--green-dk); margin-bottom:18px; }
  .hx-eyebrow { font-size:12px; font-weight:500; color:var(--ink2); margin-bottom:14px; }
  .hx-h1 { font-size:36px; line-height:1.1; font-weight:700; letter-spacing:-.035em; margin:0 0 24px; }
  .hx-h1.tight { margin-bottom:14px; }
  .hx-sub { color:var(--ink2); font-size:15px; line-height:1.6; margin:-8px 0 26px; }
  .hx-sec { font-size:13px; font-weight:600; color:var(--ink); margin:30px 0 13px; }
  .hx-note-r { font-size:12.5px; color:var(--ink2); text-align:right; margin-bottom:10px; }

  /* ---------- black feature card ---------- */
  .hx-feature { background:#0A0A0A; color:#F7F7F5; border-radius:26px; padding:24px 26px 26px; }
  .hx-feature .k { font-size:12px; font-weight:500; color:#8C918C; margin-bottom:16px;
    display:flex; align-items:center; gap:8px; }
  .hx-feature .big { font-size:44px; font-weight:700; letter-spacing:-.04em; line-height:1; margin-bottom:14px; }
  .hx-feature .t { font-size:19px; font-weight:600; letter-spacing:-.02em; margin-bottom:6px; }
  .hx-feature .d { font-size:14px; color:#9BA09B; line-height:1.5; }
  .hx-seg { display:flex; gap:8px; margin-top:22px; }
  .hx-seg span { height:5px; border-radius:100px; flex:1; }

  /* ---------- lime band ---------- */
  .hx-band { background:var(--lime); border-radius:26px; padding:26px 26px 28px; margin-bottom:12px;
    position:relative; overflow:hidden; }
  .hx-band h3 { font-size:24px; font-weight:700; letter-spacing:-.03em; margin:0 0 18px; color:#0E0E0E; }
  .hx-step { display:flex; gap:13px; align-items:flex-start; margin-bottom:15px; }
  .hx-step:last-child { margin-bottom:0; }
  .hx-step .ic { width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,.55);
    display:flex; align-items:center; justify-content:center; flex-shrink:0; color:var(--green-dk); }
  .hx-step .tx { font-size:14px; line-height:1.5; color:#16301B; padding-top:5px; }
  .hx-step .tx strong { font-weight:700; color:#0E0E0E; }

  /* ---------- numbered rows ---------- */
  .hx-row { display:flex; align-items:center; gap:15px; padding:15px 0; border-bottom:1px solid var(--line); }
  .hx-row:last-child { border-bottom:none; }
  .hx-num { width:32px; height:32px; border-radius:50%; background:var(--lime); color:var(--green-dk);
    font-size:12.5px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .hx-row .lb { flex:1; font-size:15.5px; font-weight:500; letter-spacing:-.01em; }
  .hx-row .rt { font-size:14px; color:var(--ink2); flex-shrink:0; }

  /* ---------- tiles ---------- */
  .hx-tiles { display:grid; grid-template-columns:1fr 1fr; gap:11px; }
  .hx-tile { border-radius:20px; padding:19px 20px 20px; min-height:152px;
    display:flex; flex-direction:column; cursor:pointer; transition:transform .15s; }
  .hx-tile:hover { transform:translateY(-2px); }
  .hx-tile .k { font-size:12.5px; font-weight:700; color:#16301B; margin-bottom:10px; line-height:1.3; }
  .hx-tile .v { font-size:34px; font-weight:700; letter-spacing:-.04em; line-height:1; color:#0E0E0E; }
  .hx-tile .n { margin-top:auto; font-size:12.5px; font-weight:500; color:#2A3D2C; line-height:1.4;
    overflow:hidden; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; }

  /* ---------- cards ---------- */
  .hx-card { background:var(--surface); border-radius:22px; padding:22px 24px; margin-bottom:11px; }
  .hx-card h3 { font-size:17px; font-weight:700; letter-spacing:-.025em; margin:0 0 14px; }
  .hx-card p { font-size:14.5px; line-height:1.6; color:var(--ink2); margin:0; }
  .hx-kicker { display:flex; align-items:center; gap:8px; font-size:12.5px; font-weight:600;
    color:var(--green-dk); margin-bottom:14px; }
  .hx-bullet { display:flex; gap:12px; font-size:14.5px; line-height:1.55; margin-bottom:10px; color:var(--ink); }
  .hx-bullet:last-child { margin-bottom:0; }
  .hx-bullet .bt { color:var(--green); font-weight:700; flex-shrink:0; width:14px; }

  /* ---------- bars ---------- */
  .hx-bar { margin-bottom:17px; }
  .hx-bar:last-child { margin-bottom:0; }
  .hx-bar .hd { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:9px; }
  .hx-bar .hd .l { font-size:14.5px; font-weight:500; }
  .hx-bar .hd .v { font-size:14.5px; font-weight:700; }
  .hx-bar .tr { height:8px; border-radius:100px; background:#E9E9E2; overflow:hidden; }
  .hx-bar .fl { height:100%; border-radius:100px; }

  /* ---------- ring ---------- */
  .hx-ring { display:flex; flex-direction:column; align-items:center; margin:6px 0 4px; }
  .hx-ring .wrap { position:relative; }
  .hx-ring .ctr { position:absolute; inset:0; display:flex; flex-direction:column;
    align-items:center; justify-content:center; }
  .hx-ring .num { font-size:54px; font-weight:700; letter-spacing:-.045em; line-height:1; }
  .hx-ring .of { font-size:11.5px; font-weight:600; letter-spacing:.06em; color:var(--ink3); margin-top:7px; }
  .hx-ring .lbl { font-size:19px; font-weight:700; letter-spacing:-.025em; margin-top:18px; }
  .hx-ring .cap { font-size:14.5px; color:var(--ink2); text-align:center; margin-top:7px; line-height:1.5; max-width:340px; }

  /* ---------- controls ---------- */
  .hx-btn { width:100%; background:var(--green); color:#FFFFFF; border:none; padding:17px 24px;
    border-radius:100px; font-size:15.5px; font-weight:600; letter-spacing:-.01em; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px; transition:filter .15s; }
  .hx-btn:hover { filter:brightness(1.06); }
  .hx-btn:disabled { background:#E4E4DD; color:var(--ink3); cursor:not-allowed; }
  .hx-btn-dark { background:#0A0A0A; color:#F7F7F5; }
  .hx-btn-dark:hover { filter:brightness(1.7); }
  .hx-btn-lime { background:var(--lime); color:var(--green-dk); }
  .hx-btn-ghost { background:transparent; color:var(--green-dk); border:1.5px solid #CFCFC4; }
  .hx-btn-ghost:hover { border-color:var(--green-dk); filter:none; }
  .hx-stack { display:flex; flex-direction:column; gap:10px; margin-top:22px; }

  .hx-field { margin-bottom:18px; }
  .hx-label { font-size:14px; font-weight:600; margin-bottom:9px; display:block; letter-spacing:-.01em; }
  .hx-input, .hx-textarea { width:100%; background:#FFFFFF; border:1.5px solid #E6E6DF;
    border-radius:16px; padding:15px 17px; font-size:15px; font-family:inherit; color:var(--ink);
    resize:vertical; transition:border-color .15s; }
  .hx-input::placeholder, .hx-textarea::placeholder { color:var(--ink3); }
  .hx-input:focus, .hx-textarea:focus { outline:none; border-color:var(--green); }

  .hx-chips { display:flex; flex-wrap:wrap; gap:8px; }
  .hx-chip { border:1.5px solid #DDDDD4; background:#FFFFFF; color:var(--ink); padding:10px 16px;
    border-radius:100px; font-size:13.5px; font-weight:500; cursor:pointer; transition:all .15s; }
  .hx-chip:hover { border-color:var(--green); }
  .hx-chip.on { background:var(--green-dk); border-color:var(--green-dk); color:#EAFBE7; }

  .hx-tabs { display:flex; gap:7px; margin-bottom:16px; flex-wrap:wrap; }
  .hx-tab { border:1.5px solid #DDDDD4; background:#FFFFFF; color:var(--ink2); padding:9px 15px;
    border-radius:100px; font-size:13px; font-weight:500; cursor:pointer; }
  .hx-tab.on { background:var(--green-dk); color:#EAFBE7; border-color:var(--green-dk); }

  /* ---------- list rows ---------- */
  .hx-opp { display:flex; gap:15px; align-items:center; background:var(--surface); border-radius:20px;
    padding:16px 18px; margin-bottom:10px; cursor:pointer; transition:transform .15s; }
  .hx-opp:hover { transform:translateY(-2px); }
  .hx-opp .sc { width:54px; height:54px; border-radius:16px; flex-shrink:0; display:flex;
    flex-direction:column; align-items:center; justify-content:center; font-weight:700; color:#0E0E0E; }
  .hx-opp .sc .v { font-size:17px; letter-spacing:-.035em; line-height:1; }
  .hx-opp .sc .l { font-size:8px; letter-spacing:.06em; text-transform:uppercase; margin-top:3px; opacity:.7; }
  .hx-opp .bd { flex:1; min-width:0; }
  .hx-opp .kd { font-size:11px; font-weight:600; letter-spacing:.04em; text-transform:uppercase;
    color:var(--ink3); margin-bottom:4px; }
  .hx-opp .nm { font-size:15.5px; font-weight:700; letter-spacing:-.02em; margin-bottom:4px; }
  .hx-opp .wy { font-size:13.5px; color:var(--ink2); line-height:1.45;
    overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }

  /* ---------- outreach ---------- */
  .hx-chans { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:14px; }
  .hx-chan { border:1.5px solid #DDDDD4; background:#FFFFFF; color:var(--ink2); padding:10px 15px;
    border-radius:100px; font-size:13px; font-weight:500; cursor:pointer; }
  .hx-chan.on { background:var(--lime); border-color:var(--lime); color:var(--green-dk); font-weight:700; }
  .hx-msg { background:var(--surface); border-radius:22px; padding:21px 23px; margin-bottom:11px; }
  .hx-msg .ch { font-size:11.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
    color:var(--green-dk); margin-bottom:11px; }
  .hx-msg .sj { font-size:15.5px; font-weight:700; letter-spacing:-.02em; margin-bottom:10px; }
  .hx-msg .bd { font-size:14.5px; line-height:1.65; color:var(--ink2); white-space:pre-wrap; }

  /* ---------- on-chain receipt ---------- */
  .hx-chain { background:#0A0A0A; color:#F7F7F5; border-radius:22px; padding:20px 22px; margin-top:12px; }
  .hx-chain .k { font-size:11.5px; font-weight:600; letter-spacing:.06em; text-transform:uppercase;
    color:#8C918C; margin-bottom:9px; }
  .hx-chain .d { font-size:14px; line-height:1.5; color:#C4C9C4; }
  .hx-chain .h { font-family:ui-monospace,SFMono-Regular,monospace; font-size:12.5px; color:var(--lime);
    margin-top:11px; display:flex; align-items:center; gap:7px; word-break:break-all; }

  /* ---------- misc ---------- */
  .hx-backc { width:38px; height:38px; border-radius:50%; background:#FFFFFF; border:1.5px solid #E6E6DF;
    display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
  .hx-hdr { display:flex; align-items:center; gap:13px; margin-bottom:20px; }
  .hx-load { display:flex; align-items:center; gap:10px; color:var(--ink2); font-size:14px; padding:14px 0; }
  .hx-dot { width:7px; height:7px; border-radius:50%; background:var(--green); animation:hxp 1.1s infinite ease-in-out; }
  .hx-dot:nth-child(2){animation-delay:.15s} .hx-dot:nth-child(3){animation-delay:.3s}
  @keyframes hxp { 0%,80%,100%{opacity:.22} 40%{opacity:1} }
  .hx-err { background:#FDECEA; color:#A8342A; border-radius:16px; padding:14px 17px;
    font-size:14px; line-height:1.5; margin-top:14px; }
  .hx-note { font-size:12.5px; color:var(--ink3); line-height:1.55; }

  /* ---------- bottom nav ---------- */
  .hx-nav { position:fixed; bottom:18px; left:50%; transform:translateX(-50%);
    width:calc(100% - 52px); max-width:526px; background:#FFFFFF; border-radius:24px;
    padding:9px 7px; display:flex; box-shadow:0 8px 32px rgba(0,0,0,.12); z-index:40; }
  @media (min-width:640px){ .hx-nav { position:sticky; bottom:22px; width:100%; max-width:none;
    transform:none; left:auto; margin:26px 0 -104px; } }
  .hx-navit { flex:1; min-width:0; border:none; background:none; border-radius:15px; padding:9px 1px 8px;
    display:flex; flex-direction:column; align-items:center; gap:5px; cursor:pointer;
    color:var(--ink3); transition:background .15s,color .15s; }
  .hx-navit span { font-size:9.5px; font-weight:500; letter-spacing:-.01em; max-width:100%;
    overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .hx-navit:hover:not(:disabled) { color:var(--ink2); }
  .hx-navit.on { background:var(--lime); color:var(--green-dk); }
  .hx-navit.on span { font-weight:700; }
  .hx-navit:disabled { opacity:.32; cursor:not-allowed; }

  /* ---------- connect gate ---------- */
  .hx-gate { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:30px 22px; }
  @media (min-width:640px){ .hx-gate { min-height:620px; } }
  .hx-gate-in { width:100%; max-width:400px; text-align:center; }
  .hx-mark { width:62px; height:62px; border-radius:20px; background:var(--lime); margin:0 auto 24px;
    display:flex; align-items:center; justify-content:center; }
  .hx-gate h1 { font-size:36px; font-weight:700; letter-spacing:-.035em; margin:0 0 12px; line-height:1.1; }
  .hx-gate .p { color:var(--ink2); font-size:15.5px; line-height:1.6; margin:0 0 28px; }
  .hx-wopts { display:flex; flex-direction:column; gap:9px; margin-bottom:20px; }
  .hx-wopt { display:flex; align-items:center; justify-content:space-between; padding:16px 20px;
    border:1.5px solid #E6E6DF; border-radius:100px; background:#FFFFFF; cursor:pointer; font-size:15px;
    font-weight:500; color:var(--ink); transition:border-color .15s; }
  .hx-wopt:hover { border-color:var(--green); }
`;

/* --- Robinhood Chain config (from lib/chains.js) --- */
const RH_CHAIN = {
  chainIdHex: DEFAULT_CHAIN.idHex,
  chainId: DEFAULT_CHAIN.id,
  name: DEFAULT_CHAIN.name,
  rpc: DEFAULT_CHAIN.rpc,
  explorer: DEFAULT_CHAIN.explorer,
  currency: DEFAULT_CHAIN.currency.symbol,
};

/* --- AI helper ---
   Calls our own /api/claude route, which proxies to the Virtuals compute
   gateway server-side. The API key never reaches the browser. */
async function callAI({ system, user }) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, user }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed (" + res.status + ")");
  return (data.text || "").trim();
}

function parseJsonLoose(text) {
  const c = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const s = c.indexOf("{"), e = c.lastIndexOf("}");
  return JSON.parse(s >= 0 && e >= 0 ? c.slice(s, e + 1) : c);
}

function fakeHash() {
  const h = "0123456789abcdef";
  let s = "0x";
  for (let i = 0; i < 64; i++) s += h[Math.floor(Math.random() * 16)];
  return s;
}

function LoadingDots({ label }) {
  return (
    <div className="hx-load">
      <span className="hx-dot" /><span className="hx-dot" /><span className="hx-dot" />
      <span>{label}</span>
    </div>
  );
}

function Ring({ value, max = 100, size = 196 }) {
  const stroke = 19;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div className="wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="helix-ring" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DCF7A0" />
            <stop offset="45%" stopColor="#A8E62E" />
            <stop offset="100%" stopColor="#2FBF4E" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E9E9E2" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#helix-ring)"
          strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="ctr">
        <div className="num">{value}</div>
        <div className="of">OF {max}</div>
      </div>
    </div>
  );
}

function Bar({ label, value, color }) {
  return (
    <div className="hx-bar">
      <div className="hd"><span className="l">{label}</span><span className="v">{value}%</span></div>
      <div className="tr"><div className="fl" style={{ width: Math.max(0, Math.min(100, value)) + "%", background: color }} /></div>
    </div>
  );
}

/* Relationship graph — the spec's "live ecosystem graph connecting projects,
   investors, foundations, partners… via an interactive ecosystem map".
   Laid out radially around the org, colored by opportunity kind. */
function RelationshipGraph({ center, nodes, onSelect }) {
  const W = 320, H = 320, cx = W / 2, cy = H / 2;
  const R = 118;
  const kindColor = { partnership: "#C6F24E", grant: "#7FD63F", investor: "#DCF7A0", resource: "#A8E62E" };
  const placed = nodes.slice(0, 9).map((n, i, arr) => {
    const a = (i / arr.length) * Math.PI * 2 - Math.PI / 2;
    const r = R * (0.62 + 0.38 * ((n.score ?? 60) / 100));
    return { ...n, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {placed.map((n) => (
        <line key={"l" + n.id} x1={cx} y1={cy} x2={n.x} y2={n.y}
          stroke="#D8D8CE" strokeWidth={1 + ((n.score ?? 50) / 100) * 2} />
      ))}
      {placed.map((n) => (
        <g key={n.id} onClick={() => onSelect?.(n)} style={{ cursor: "pointer" }}>
          <circle cx={n.x} cy={n.y} r={17} fill={kindColor[n.kind] || "#E0E0DC"} />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#0E0E0E">
            {n.score ?? "·"}
          </text>
          <text x={n.x} y={n.y + 31} textAnchor="middle" fontSize="8.5" fill="#5F6360">
            {(n.name || "").slice(0, 16)}
          </text>
        </g>
      ))}
      <circle cx={cx} cy={cy} r={31} fill="#0A0A0A" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="#F7F7F5">
        {(center || "You").slice(0, 9)}
      </text>
    </svg>
  );
}

const CATEGORIES = ["DeFi Protocol", "Consumer App", "AI Application", "Infrastructure", "Wallet / Trading", "Stablecoin / Payments"];
const ROLES = ["Owner", "Admin", "Member", "Viewer"];
const CHANNELS = ["Email", "Telegram", "Discord", "Farcaster", "X", "LinkedIn"];
const TILE_COLORS = ["var(--lime)", "var(--lime-4)", "var(--lime-3)", "var(--lime-2)"];
const BAR_COLORS = ["#2FBF4E", "#A8E62E", "#7FD63F", "#14532D"];

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [view, setView] = useState("dashboard");
  const [connecting, setConnecting] = useState(false);

  const [org, setOrg] = useState({ name: "", category: "", website: "", desc: "" });
  const [orgRegistered, setOrgRegistered] = useState(false);
  const [orgTx, setOrgTx] = useState(null);

  const [intel, setIntel] = useState(null);
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelErr, setIntelErr] = useState("");

  const [opps, setOpps] = useState([]);
  const [oppLoading, setOppLoading] = useState(false);
  const [oppErr, setOppErr] = useState("");
  const [oppFilter, setOppFilter] = useState("all");

  const [active, setActive] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [channel, setChannel] = useState("Email");
  const [outreach, setOutreach] = useState({});
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [logged, setLogged] = useState(null);
  const [copied, setCopied] = useState(false);

  // AI Memory + team + pipeline + live ecosystem index
  const [memory, setMemory] = useState([]);
  const [members, setMembers] = useState([]);
  const [pipeline, setPipeline] = useState({});
  const [newMember, setNewMember] = useState({ addr: "", role: "Member" });
  const [eco, setEco] = useState(null);
  const [sendState, setSendState] = useState(null);

  // Live opportunity scan + lead engine
  const [scans, setScans] = useState({});
  const [scanLoading, setScanLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [leadDraft, setLeadDraft] = useState({ name: "", company: "", role: "", contact: "", notes: "" });
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [activeLead, setActiveLead] = useState(null);
  const [leadBusy, setLeadBusy] = useState("");
  // Which address the in-memory state has been hydrated for. This is state,
  // not a ref, on purpose: it only flips on the render *after* the loaded
  // values commit, so the save effect can never write stale empties over them.
  const [hydratedFor, setHydratedFor] = useState(null);

  const shortAddr = wallet ? wallet.address.slice(0, 6) + "…" + wallet.address.slice(-4) : "";
  // Reputation now reflects real recorded activity, not just UI state.
  const reputation = orgRegistered
    ? Math.min(100, 12 + (intel ? 20 : 0) + opps.length * 3 + Object.keys(pipeline).length * 5 + members.length * 2)
    : 0;

  /* ---------- persistence: hydrate on connect, save on change ---------- */
  useEffect(() => {
    if (!wallet?.address || hydratedFor === wallet.address) return;
    const s = loadState(wallet.address);
    setOrg(s.org); setOrgRegistered(s.orgRegistered); setOrgTx(s.orgTx);
    setIntel(s.intel); setOpps(s.opps); setMembers(s.members);
    setMemory(s.memory); setPipeline(s.pipeline);
    setLeads(s.leads || []); setScans(s.scans || {});
    setHydratedFor(wallet.address);
  }, [wallet?.address, hydratedFor]);

  useEffect(() => {
    if (!wallet?.address || hydratedFor !== wallet.address) return;
    saveState(wallet.address, { org, orgRegistered, orgTx, intel, opps, members, memory, pipeline, leads, scans });
  }, [wallet?.address, hydratedFor, org, orgRegistered, orgTx, intel, opps, members, memory, pipeline, leads, scans]);

  /* ---------- live ecosystem index ---------- */
  useEffect(() => {
    if (!wallet) return;
    fetch("/api/ecosystem").then((r) => r.json()).then(setEco).catch(() => {});
  }, [wallet]);

  const log = useCallback((kind, detail) => setMemory((m) => remember(m, kind, detail)), []);

  /* ---------- wallet ---------- */
  const connect = async () => {
    setConnecting(true);
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accts = await window.ethereum.request({ method: "eth_requestAccounts" });
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: RH_CHAIN.chainIdHex, chainName: RH_CHAIN.name,
              rpcUrls: [RH_CHAIN.rpc],
              nativeCurrency: { name: "Ether", symbol: RH_CHAIN.currency, decimals: 18 },
              blockExplorerUrls: [RH_CHAIN.explorer],
            }],
          });
        } catch (_) {}
        setWallet({ address: accts[0], simulated: false });
      } else {
        setWallet({ address: "0x" + fakeHash().slice(2, 42), simulated: true });
      }
    } catch (e) {
      setWallet({ address: "0x" + fakeHash().slice(2, 42), simulated: true });
    } finally {
      setConnecting(false);
    }
  };

  const registerOrg = () => {
    setOrgTx({ pending: true });
    setTimeout(() => {
      setOrgRegistered(true);
      setOrgTx({ pending: false, hash: fakeHash() });
    }, 1400);
  };

  /* ---------- ecosystem intelligence ---------- */
  const runIntel = useCallback(async () => {
    setIntelLoading(true); setIntelErr("");
    try {
      const system =
        "You are Helix, an ecosystem intelligence engine for projects building on Robinhood Chain (an EVM chain bringing TradFi users into crypto). Analyze the given project's position and the broader Web3/onchain BD landscape. Voice: write like a sharp human copywriter — warm, emotionally intelligent, quietly witty, never corporate or buzzword-y. Confident, never cheesy. Respond ONLY with valid JSON, no fences: " +
        '{"position":"2-3 sentences on where this project sits in the ecosystem","readiness_score":0-100,"readiness_label":"one or two words e.g. Emerging / Strong / Elevated","strengths":["...","..."],"gaps":["...","..."],"drivers":[{"label":"Ecosystem fit","value":0-100},{"label":"Funding readiness","value":0-100},{"label":"Integration surface","value":0-100}],"ecosystem_moves":["one timely move","another"],"funding_readiness":"one line assessment"}';
      const digest = memoryDigest(memory);
      const user = `Project: ${org.name} (${org.category}). ${org.website ? "Site: " + org.website + ". " : ""}What they're building: ${org.desc}` +
        (digest ? "\n\n" + digest : "");
      const text = await callAI({ system, user });
      setIntel(parseJsonLoose(text));
      log(MEMORY_KINDS.INTEL_RUN, { at: Date.now() });
    } catch (e) {
      setIntelErr("Intelligence run failed — " + e.message);
    } finally {
      setIntelLoading(false);
    }
  }, [org, memory, log]);

  /* ---------- opportunity discovery ---------- */
  const discover = useCallback(async () => {
    setOppLoading(true); setOppErr("");
    try {
      const system =
        "You are Helix's opportunity discovery engine for Robinhood Chain. Given a project, surface concrete BD opportunities: partnerships, grants, and investors it should pursue. For a testnet ecosystem, generate realistic, plausible opportunity types (protocols to integrate with, grant programs, VC/angel profiles) — clearly archetypal, not fabricated specific claims. Voice: write like a sharp human copywriter — warm, emotionally intelligent, quietly witty, never corporate or buzzword-y. Confident, never cheesy. Respond ONLY with valid JSON, no fences: " +
        '{"opportunities":[{"id":"1","kind":"partnership","name":"...","score":0-100,"why":"one sentence reason grounded in the project"},{"id":"2","kind":"grant","name":"...","score":0-100,"why":"..."},{"id":"3","kind":"investor","name":"...","score":0-100,"why":"..."}]}. Return 6 total, mixed kinds, scores varied and realistic.';
      const digest = memoryDigest(memory);
      // Ground discovery in the real ecosystem index so results reference
      // things that actually exist, not only model-invented counterparties.
      const verified = eco?.entities?.length
        ? "\n\nVerified Robinhood Chain entities you may reference (real, from the ecosystem index): " +
          eco.entities.map((e) => `${e.name} (${e.kind})`).join("; ")
        : "";
      const user = `Project: ${org.name} (${org.category}). Building: ${org.desc}. ${intel ? "Ecosystem position: " + intel.position : ""}` +
        verified + (digest ? "\n\n" + digest : "");
      const text = await callAI({ system, user });
      const parsed = parseJsonLoose(text);
      const found = (parsed.opportunities || []).sort((a, b) => b.score - a.score);
      setOpps(found);
      log(MEMORY_KINDS.DISCOVERY_RUN, { count: found.length });
    } catch (e) {
      setOppErr("Discovery failed — " + e.message);
    } finally {
      setOppLoading(false);
    }
  }, [org, intel, memory, eco, log]);

  const openOpp = (o) => {
    setActive(o); setReport(null); setOutreach({}); setLogged(null); setChannel("Email");
    setSendState(null);
    setView("workspace");
    log(MEMORY_KINDS.OPP_OPENED, { name: o.name, kind: o.kind });
    genReport(o);
  };

  /* ---------- pipeline ---------- */
  const setStatus = (oppId, status, name) => {
    setPipeline((p) => ({ ...p, [oppId]: { ...(p[oppId] || {}), status, updatedAt: Date.now(), name } }));
    log(MEMORY_KINDS.STATUS_CHANGED, { name, status });
  };

  /* ---------- live opportunity scan ----------
     Discovery says WHO to approach; this says WHAT is open there right now. */
  const runScan = async (o) => {
    setScanLoading(true);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity: o, project: org }),
      });
      const data = await res.json();
      const parsed = parseJsonLoose(data.text);
      setScans((s) => ({ ...s, [o.id]: { ...parsed, searchMode: data.searchMode, sources: data.sources || [], at: Date.now() } }));
      log(MEMORY_KINDS.SCAN_RUN, { name: o.name });
    } catch (e) {
      setScans((s) => ({ ...s, [o.id]: { error: e.message } }));
    } finally {
      setScanLoading(false);
    }
  };

  /* ---------- lead engine ---------- */
  const addLead = () => {
    if (!leadDraft.name.trim()) return;
    setLeads((l) => [...l, makeLead(leadDraft)]);
    setLeadDraft({ name: "", company: "", role: "", contact: "", notes: "" });
  };

  const importLeads = () => {
    const parsed = parseLeads(importText);
    if (!parsed.length) return;
    setLeads((l) => [...l, ...parsed]);
    log(MEMORY_KINDS.LEADS_IMPORTED, { count: parsed.length });
    setImportText(""); setShowImport(false);
  };

  const updateLead = (id, patch) => setLeads((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const briefLead = async (lead) => {
    setLeadBusy("brief");
    try {
      const system =
        "You are Helix's lead qualification engine. Given a lead and the project reaching out, produce a tight brief. Voice: write like a sharp human copywriter — warm, emotionally intelligent, quietly witty, never corporate or buzzword-y. Confident, never cheesy. Respond ONLY with valid JSON, no fences: " +
        '{"overview":"2-3 sentences on who they are and why they matter","fit":"one line on why this lead fits","priority":0-100,"angle":"the specific hook to open with","risks":["one risk in approaching them"]}';
      const user =
        `Lead: ${lead.name}, at ${lead.company || "unknown company"}. Role: ${lead.role || "unknown"}. Notes: ${lead.notes || "none"}.\n` +
        `Project: ${org.name} (${org.category}). Building: ${org.desc}` +
        (memoryDigest(memory) ? "\n\n" + memoryDigest(memory) : "");
      const text = await callAI({ system, user });
      const brief = parseJsonLoose(text);
      updateLead(lead.id, { brief });
      setActiveLead((a) => (a && a.id === lead.id ? { ...a, brief } : a));
      log(MEMORY_KINDS.LEAD_BRIEFED, { name: lead.name });
    } catch (e) {
      updateLead(lead.id, { brief: { overview: "Brief failed — " + e.message, fit: "", priority: 0, angle: "", risks: [] } });
    } finally {
      setLeadBusy("");
    }
  };

  const sequenceLead = async (lead) => {
    setLeadBusy("seq");
    try {
      const system =
        "You are Helix's follow-up sequence engine. Write a multi-touch outreach sequence that escalates politely, gets shorter each step, and always gives the recipient an explicit exit. Voice: write like a sharp human copywriter — warm, emotionally intelligent, quietly witty, never corporate or buzzword-y. Confident, never cheesy. Respond ONLY with valid JSON, no fences: " +
        '{"sequence":[{"step":1,"when":"Day 0","channel":"Email","subject":"...","body":"under 80 words"}],"cadence_note":"one line on the cadence logic"}. Return 4 steps mixing Email and LinkedIn.';
      const user =
        `Lead: ${lead.name}, at ${lead.company || "unknown"}. Role: ${lead.role || "unknown"}. Notes: ${lead.notes || "none"}.\n` +
        (lead.brief ? `Angle: ${lead.brief.angle}. Fit: ${lead.brief.fit}.\n` : "") +
        `From: ${org.name} (${org.category}), building ${org.desc}`;
      const text = await callAI({ system, user });
      const seq = parseJsonLoose(text);
      updateLead(lead.id, { sequence: seq });
      setActiveLead((a) => (a && a.id === lead.id ? { ...a, sequence: seq } : a));
      log(MEMORY_KINDS.LEAD_SEQUENCED, { name: lead.name });
    } catch (e) {
      updateLead(lead.id, { sequence: { sequence: [], cadence_note: "Failed — " + e.message } });
    } finally {
      setLeadBusy("");
    }
  };

  const setLeadStatus = (lead, status) => {
    updateLead(lead.id, { status });
    setActiveLead((a) => (a && a.id === lead.id ? { ...a, status } : a));
    log(MEMORY_KINDS.LEAD_STATUS, { name: lead.name, status });
  };

  /* ---------- outreach send ---------- */
  const sendOutreach = async () => {
    const m = outreach[channel];
    if (!m || !active) return;
    setSendState({ pending: true });
    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, to: active.contact || "", subject: m.subject, body: m.body }),
      });
      const data = await res.json();
      setSendState(data);
      if (data.sent) {
        log(MEMORY_KINDS.OUTREACH_SENT, { name: active.name, channel });
        setStatus(active.id, "sent", active.name);
      }
    } catch (e) {
      setSendState({ sent: false, error: e.message });
    }
  };

  const genReport = async (o) => {
    setReportLoading(true);
    try {
      const system =
        "You are Helix's AI research agent. Produce a tight executive brief on why this opportunity fits the project and how to approach it. Voice: write like a sharp human copywriter — warm, emotionally intelligent, quietly witty, never corporate or buzzword-y. Confident, never cheesy. Respond ONLY with valid JSON, no fences: " +
        '{"summary":"2-3 sentences","fit_points":["...","...","..."],"suggested_action":"one concrete next step"}';
      const user = `Our project: ${org.name} (${org.category}), building ${org.desc}.\nOpportunity: ${o.kind} — ${o.name}. Score ${o.score}. Reason: ${o.why}`;
      const text = await callAI({ system, user });
      setReport(parseJsonLoose(text));
    } catch (e) {
      setReport({ summary: "Could not generate this brief — " + e.message, fit_points: [], suggested_action: "" });
    } finally {
      setReportLoading(false);
    }
  };

  const genOutreach = async (ch) => {
    setChannel(ch);
    if (outreach[ch]) return;
    setOutreachLoading(true);
    try {
      const system =
        "You are Helix's outreach engine. Write a personalized " + ch + " message from our project to this opportunity, referencing real ecosystem context, not generic templates. Voice: write like a sharp human copywriter — warm, emotionally intelligent, quietly witty, never corporate or buzzword-y. Confident, never cheesy. Respond ONLY with valid JSON, no fences: " +
        '{"subject":"(for email/linkedin; short line otherwise)","body":"under 90 words, native to the channel"}';
      const user = `From: ${org.name} (${org.category}), building ${org.desc}.\nTo: ${active.kind} — ${active.name}. Why: ${active.why}. Channel: ${ch}`;
      const text = await callAI({ system, user });
      setOutreach((prev) => ({ ...prev, [ch]: parseJsonLoose(text) }));
      log(MEMORY_KINDS.OUTREACH_DRAFTED, { name: active.name, channel: ch });
    } catch (e) {
      setOutreach((prev) => ({ ...prev, [ch]: { subject: "", body: "Generation failed — " + e.message } }));
    } finally {
      setOutreachLoading(false);
    }
  };

  useEffect(() => {
    if (active && !outreach["Email"]) genOutreach("Email");
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [active]);

  const logToChain = () => {
    setLogged({ pending: true });
    setTimeout(() => {
      const hash = fakeHash();
      setLogged({ pending: false, hash });
      if (active) {
        log(MEMORY_KINDS.PARTNERSHIP_LOGGED, { name: active.name, hash });
        setStatus(active.id, pipeline[active.id]?.status || "draft", active.name);
      }
    }, 1300);
  };

  const registerOrgWithMemory = () => {
    registerOrg();
    setTimeout(() => log(MEMORY_KINDS.ORG_REGISTERED, { name: org.name }), 1450);
  };

  const copyMsg = () => {
    const m = outreach[channel];
    if (!m) return;
    navigator.clipboard.writeText((m.subject ? m.subject + "\n\n" : "") + m.body).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  /* ================= CONNECT GATE ================= */
  if (!wallet) {
    return (
      <div className="hx">
        <style>{CSS}</style>
        <div className="hx-shell" style={{ paddingBottom: 34 }}>
          <div className="hx-gate">
            <div className="hx-gate-in">
              <div className="hx-wordmark">Helix</div>
              <div className="hx-mark"><Leaf size={27} color="#0F1613" /></div>
              <h1>Your unfair advantage in <span className="g">who to know next</span></h1>
              <p className="p">Everyone tells you to "network." Nobody tells you <em>who</em>, or <em>why</em>, or what to say. Helix does — the business development brain for Robinhood Chain. Partners, grants, capital. Less guessing, more growing.</p>
              <div className="hx-wopts">
                {["MetaMask", "WalletConnect", "Coinbase Wallet", "Rabby", "Robinhood Wallet"].map((w) => (
                  <button key={w} className="hx-wopt" onClick={connect} disabled={connecting}>
                    <span>{w}</span><Wallet size={18} color="#9AA0A6" />
                  </button>
                ))}
              </div>
              <p className="hx-note">
                {connecting
                  ? "Knocking on your wallet's door…"
                  : "Runs on Robinhood Chain Testnet (ID 46630). No wallet handy? We'll hand you a simulated one — kick the tires, no strings, no gas."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= NAV ================= */
  const NAV = [
    { id: "dashboard", label: "Today", icon: Home, on: true },
    { id: "org", label: "Org", icon: Building2, on: true },
    { id: "intel", label: "Intel", icon: BarChart3, on: orgRegistered },
    { id: "opps", label: "Opps", icon: Zap, on: orgRegistered },
    { id: "leads", label: "Leads", icon: Users, on: true },
    { id: "graph", label: "Graph", icon: Network, on: orgRegistered },
    { id: "workspace", label: "Pipeline", icon: Leaf, on: !!active },
  ];

  const topOpps = opps.slice(0, 4);
  const drivers = intel?.drivers?.length
    ? intel.drivers
    : [
        { label: "Ecosystem fit", value: 82 },
        { label: "Funding readiness", value: 61 },
        { label: "Integration surface", value: 30 },
      ];

  return (
    <div className="hx">
      <style>{CSS}</style>
      <div className="hx-shell">

        {/* ---------- BRAND (every page) ---------- */}
        <div className="hx-brand">
          <span className="m"><Leaf size={16} color="#14532D" /></span>
          <span className="w">Heli<b>x</b></span>
        </div>

        {/* ---------- DASHBOARD ---------- */}
        {view === "dashboard" && (
          <>
            <div className="hx-badge">Robinhood Chain</div>
            <h1 className="hx-h1">Who deserves your <span className="g">next email</span>?</h1>

            <div className="hx-feature">
              <div className="k">On-chain identity</div>
              <div className="big">{reputation}</div>
              <div className="t">{orgRegistered ? org.name || "Your organization" : "A blank slate (for now)"}</div>
              <div className="d">
                {orgRegistered
                  ? `${shortAddr} · reputation ${reputation}/100 and climbing`
                  : "Mint your on-chain identity and watch this number stop being zero."}
              </div>
              <div className="hx-seg">
                <span style={{ background: orgRegistered ? "#C6F24E" : "#242424" }} />
                <span style={{ background: intel ? "#A8E62E" : "#242424" }} />
                <span style={{ background: opps.length ? "#7FD63F" : "#242424" }} />
                <span style={{ background: logged?.hash ? "#2FBF4E" : "#242424" }} />
              </div>
            </div>

            <div className="hx-band" style={{ marginTop: 12 }}>
              <h3>Three steps. Then Helix does the staring-at-spreadsheets part.</h3>
              <div className="hx-step">
                <span className="ic"><Building2 size={16} /></span>
                <span className="tx"><strong>Introduce yourself.</strong> One quick profile mints your on-chain identity — {orgRegistered ? "done, and permanent." : "about two minutes, faster than your last standup."}</span>
              </div>
              <div className="hx-step">
                <span className="ic"><BarChart3 size={16} /></span>
                <span className="tx"><strong>Get read for filth (kindly).</strong> {intel ? "Done — your honest position is below." : orgRegistered ? "Ready when your ego is." : "Unlocks once you introduce yourself."}</span>
              </div>
              <div className="hx-step">
                <span className="ic"><Zap size={16} /></span>
                <span className="tx"><strong>Meet your shortlist.</strong> {opps.length ? `${opps.length} moves, ranked, no fluff.` : orgRegistered ? "Ready when you are." : "Unlocks once you introduce yourself."}</span>
              </div>
            </div>

            {(opps.length > 0 || intel) && (
              <div className="hx-card" style={{ marginTop: 12 }}>
                <div className="hx-kicker"><Zap size={13} /> The one thing worth reading today</div>
                {opps.length > 0 && (
                  <div className="hx-bullet"><span className="bt">→</span><span>{opps.length} opportunities scored — top is <strong>{opps[0].name}</strong> at {opps[0].score}/100.</span></div>
                )}
                {intel && <div className="hx-bullet"><span className="bt">→</span><span>{intel.funding_readiness}</span></div>}
              </div>
            )}

            {Object.keys(pipeline).length > 0 && (
              <div className="hx-card">
                <div className="hx-kicker"><Leaf size={13} /> Deals in motion</div>
                {Object.entries(pipeline).slice(0, 5).map(([id, p]) => (
                  <div className="hx-bullet" key={id}>
                    <span className="bt">·</span>
                    <span><strong>{p.name}</strong> — {p.status}</span>
                  </div>
                ))}
              </div>
            )}

            {memory.length > 0 && (
              <div className="hx-card">
                <div className="hx-kicker"><Sparkles size={13} /> Helix has a memory (unlike your CRM)</div>
                {memory.slice(-4).reverse().map((m) => (
                  <div className="hx-bullet" key={m.id}>
                    <span className="bt">·</span>
                    <span style={{ color: "var(--ink2)" }}>
                      {new Date(m.at).toLocaleDateString()} — {m.kind.replace(/_/g, " ")}
                      {m.detail?.name ? `: ${m.detail.name}` : ""}
                    </span>
                  </div>
                ))}
                <p style={{ fontSize: 12.5, color: "var(--ink3)", marginTop: 10, lineHeight: 1.5 }}>
                  {memory.length} things remembered — so Helix stops pitching you people you already emailed.
                </p>
              </div>
            )}

            <div className="hx-stack">
              {!orgRegistered ? (
                <button className="hx-btn" onClick={() => setView("org")}>Introduce yourself<ArrowRight size={16} /></button>
              ) : (
                <>
                  <button className="hx-btn" onClick={() => { setView("opps"); if (!opps.length && !oppLoading) discover(); }}>
                    Show me the shortlist<ArrowRight size={16} />
                  </button>
                  <button className="hx-btn hx-btn-ghost" onClick={() => { setView("intel"); if (!intel && !intelLoading) runIntel(); }}>
                    Read me for filth
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* ---------- ORGANIZATION ---------- */}
        {view === "org" && (
          <>
            <div className="hx-badge">Organization</div>
            <h1 className="hx-h1 tight">So, what are you <span className="g">actually</span> building?</h1>
            <p className="hx-sub">Be honest — this becomes your on-chain identity, and every match Helix makes is measured against it. Vague in, vague out.</p>

            <div className="hx-field">
              <label className="hx-label">Project name</label>
              <input className="hx-input" value={org.name} placeholder="e.g. Meridian Protocol"
                onChange={(e) => setOrg({ ...org, name: e.target.value })} />
            </div>
            <div className="hx-field">
              <label className="hx-label">Category</label>
              <div className="hx-chips">
                {CATEGORIES.map((c) => (
                  <button key={c} className={"hx-chip" + (org.category === c ? " on" : "")}
                    onClick={() => setOrg({ ...org, category: c })}>{c}</button>
                ))}
              </div>
            </div>
            <div className="hx-field">
              <label className="hx-label">Website / docs <span style={{ color: "var(--ink3)", fontWeight: 400 }}>optional</span></label>
              <input className="hx-input" value={org.website} placeholder="https://"
                onChange={(e) => setOrg({ ...org, website: e.target.value })} />
            </div>
            <div className="hx-field">
              <label className="hx-label">What you're building</label>
              <textarea className="hx-textarea" rows={5} value={org.desc}
                placeholder="What it does, who it's for, and what you actually need next — partners, grants, capital, a miracle. Plain words beat buzzwords here."
                onChange={(e) => setOrg({ ...org, desc: e.target.value })} />
            </div>

            {orgRegistered && orgTx?.hash && (
              <div className="hx-chain">
                <div className="k">On-chain identity minted</div>
                <div className="d">Written to ProjectRegistry. You exist on-chain now — no take-backs, and that's the point.</div>
                <div className="h">{orgTx.hash.slice(0, 26)}… <ExternalLink size={12} /></div>
              </div>
            )}

            {orgRegistered && (
              <>
                <div className="hx-sec">Team workspace</div>
                <div className="hx-card">
                  <h3>Members & roles</h3>
                  <div className="hx-row">
                    <span className="hx-num">1</span>
                    <span className="lb">{shortAddr}</span>
                    <span className="rt">Owner</span>
                  </div>
                  {members.map((m, i) => (
                    <div className="hx-row" key={m.addr + i}>
                      <span className="hx-num">{i + 2}</span>
                      <span className="lb" style={{ fontFamily: "ui-monospace,monospace", fontSize: 13.5 }}>
                        {m.addr.slice(0, 6)}…{m.addr.slice(-4)}
                      </span>
                      <span className="rt">{m.role}</span>
                      <button className="hx-backc" style={{ width: 30, height: 30 }}
                        onClick={() => setMembers(members.filter((_, j) => j !== i))}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                    <input className="hx-input" style={{ flex: "1 1 180px" }} placeholder="0x wallet address"
                      value={newMember.addr} onChange={(e) => setNewMember({ ...newMember, addr: e.target.value })} />
                    <select className="hx-input" style={{ flex: "0 0 120px" }} value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}>
                      {ROLES.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <button className="hx-btn hx-btn-ghost" style={{ marginTop: 10 }}
                    disabled={!/^0x[0-9a-fA-F]{40}$/.test(newMember.addr.trim())}
                    onClick={() => {
                      setMembers([...members, { addr: newMember.addr.trim(), role: newMember.role }]);
                      setNewMember({ addr: "", role: "Member" });
                    }}>
                    <Plus size={15} />Add member
                  </button>
                  <p style={{ fontSize: 12.5, color: "var(--ink3)", marginTop: 12, lineHeight: 1.5 }}>
                    Roles map to <code>OrganizationRegistry.setMember</code>. They persist locally now and write on-chain once contract addresses are configured.
                  </p>
                </div>
              </>
            )}

            <div className="hx-stack">
              {!orgRegistered ? (
                <button className="hx-btn hx-btn-dark"
                  disabled={!org.name || !org.category || !org.desc || orgTx?.pending}
                  onClick={registerOrgWithMemory}>
                  {orgTx?.pending ? "Etching you into the chain…" : "Make it official"}
                  {!orgTx?.pending && <ArrowRight size={16} />}
                </button>
              ) : (
                <button className="hx-btn" onClick={() => { setView("intel"); if (!intel && !intelLoading) runIntel(); }}>
                  See where I stand<ArrowRight size={16} />
                </button>
              )}
            </div>
          </>
        )}

        {/* ---------- INTELLIGENCE ---------- */}
        {view === "intel" && (
          <>
            <div className="hx-hdr">
              <button className="hx-backc" onClick={() => setView("dashboard")}><ArrowLeft size={17} /></button>
              <div className="hx-eyebrow" style={{ margin: 0 }}>Ecosystem intelligence</div>
            </div>

            {!intel && !intelLoading && (
              <>
                <h1 className="hx-h1 tight">{org.name || "Your project"}, <span className="g">without the flattery</span>.</h1>
                <p className="hx-sub">Where you sit, what you've got, and the gaps your pitch deck politely ignores. This is the friend who tells you there's spinach in your teeth.</p>
                <div className="hx-stack" style={{ marginTop: 4 }}>
                  <button className="hx-btn" onClick={runIntel}><Sparkles size={16} />Give it to me straight</button>
                </div>
              </>
            )}

            {intelLoading && (
              <>
                <h1 className="hx-h1 tight">Reading the room…</h1>
                <LoadingDots label="Indexing the ecosystem and forming honest opinions" />
              </>
            )}

            {intelErr && <div className="hx-err">{intelErr}</div>}

            {intel && !intelLoading && (
              <>
                <h1 className="hx-h1 tight">The <span className="g">honest</span> read</h1>
                <div className="hx-ring">
                  <Ring value={Math.round(intel.readiness_score ?? reputation ?? 68)} max={100} />
                  <div className="lbl">{intel.readiness_label || "Emerging"}</div>
                  <div className="cap">{intel.funding_readiness}</div>
                </div>

                <div className="hx-card" style={{ marginTop: 22 }}>
                  <h3>What drives it</h3>
                  {drivers.map((d, i) => (
                    <Bar key={i} label={d.label} value={Math.round(d.value)} color={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </div>

                <div className="hx-card">
                  <h3>Position</h3>
                  <p>{intel.position}</p>
                </div>

                <div className="hx-card">
                  <h3>Strengths</h3>
                  {(intel.strengths || []).map((s, i) => (
                    <div className="hx-bullet" key={i}><span className="bt">+</span><span>{s}</span></div>
                  ))}
                  <h3 style={{ marginTop: 20 }}>Gaps</h3>
                  {(intel.gaps || []).map((s, i) => (
                    <div className="hx-bullet" key={i}><span className="bt">–</span><span>{s}</span></div>
                  ))}
                </div>

                <div className="hx-card">
                  <h3>Timely moves</h3>
                  {(intel.ecosystem_moves || []).map((s, i) => (
                    <div className="hx-bullet" key={i}><span className="bt">→</span><span>{s}</span></div>
                  ))}
                </div>

                <div className="hx-stack">
                  <button className="hx-btn" onClick={() => { setView("opps"); if (!opps.length && !oppLoading) discover(); }}>
                    Fine — show me the moves<ArrowRight size={16} />
                  </button>
                  <button className="hx-btn hx-btn-ghost" onClick={runIntel}><RefreshCw size={15} />Re-run</button>
                </div>
              </>
            )}
          </>
        )}

        {/* ---------- OPPORTUNITIES ---------- */}
        {view === "opps" && (
          <>
            <div className="hx-badge">Discovery</div>
            <h1 className="hx-h1 tight">Your shortlist, <span className="g">ranked</span></h1>

            {!opps.length && !oppLoading && (
              <>
                <p className="hx-sub">Not a contact dump. Partners, grants, and investors worth your Tuesday — each one scored, each one explained, so you never cold-email into the void again.</p>
                <div className="hx-stack" style={{ marginTop: 4 }}>
                  <button className="hx-btn" onClick={discover}><Zap size={16} />Find my next move</button>
                </div>
              </>
            )}

            {oppLoading && <LoadingDots label="Hunting for people worth your time" />}
            {oppErr && <div className="hx-err">{oppErr}</div>}

            {opps.length > 0 && !oppLoading && (
              <>
                <div className="hx-tiles">
                  {topOpps.map((o, i) => (
                    <div key={o.id ?? i} className="hx-tile"
                      style={{ background: TILE_COLORS[i % TILE_COLORS.length] }}
                      onClick={() => openOpp(o)}>
                      <div className="k">{o.kind}</div>
                      <div className="v">{o.score}</div>
                      <div className="n">{o.name}</div>
                    </div>
                  ))}
                </div>

                <div className="hx-card" style={{ marginTop: 14 }}>
                  <div className="hx-kicker"><Zap size={13} /> If you only do one thing</div>
                  <h3 style={{ marginBottom: 10 }}>{opps[0].name}</h3>
                  <p>{opps[0].why}</p>
                  <div className="hx-sec" style={{ margin: "18px 0 5px" }}>Match score</div>
                  <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-.02em" }}>{opps[0].score} / 100 · {opps[0].kind}</div>
                </div>

                <div className="hx-sec">All opportunities</div>
                <div className="hx-tabs">
                  {["all", "partnership", "grant", "investor"].map((f) => (
                    <button key={f} className={"hx-tab" + (oppFilter === f ? " on" : "")} onClick={() => setOppFilter(f)}>
                      {f[0].toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                {opps.filter((o) => oppFilter === "all" || o.kind === oppFilter).map((o, i) => (
                  <div className="hx-opp" key={o.id ?? i} onClick={() => openOpp(o)}>
                    <div className="sc" style={{ background: TILE_COLORS[i % TILE_COLORS.length] }}>
                      <span className="v">{o.score}</span><span className="l">score</span>
                    </div>
                    <div className="bd">
                      <div className="kd">{o.kind}</div>
                      <div className="nm">{o.name}</div>
                      <div className="wy">{o.why}</div>
                    </div>
                  </div>
                ))}

                <div className="hx-stack">
                  <button className="hx-btn hx-btn-ghost" onClick={discover}><RefreshCw size={15} />Re-discover</button>
                </div>
              </>
            )}
          </>
        )}

        {/* ---------- LEADS ---------- */}
        {view === "leads" && !activeLead && (
          <>
            <div className="hx-badge">Leads</div>
            <h1 className="hx-h1 tight">Your <span className="g">list</span> (the good kind)</h1>
            <p className="hx-sub">Paste the names. Helix does the homework on each, then writes follow-ups that escalate with a spine — no "just circling back," no begging.</p>

            <div className="hx-tiles" style={{ marginBottom: 14 }}>
              <div className="hx-tile" style={{ background: "var(--tile-b)", minHeight: 108, cursor: "default" }}>
                <div className="k">Total</div>
                <div className="v">{leads.length}</div>
              </div>
              <div className="hx-tile" style={{ background: "var(--tile-g)", minHeight: 108, cursor: "default" }}>
                <div className="k">Contacted</div>
                <div className="v">{leads.filter((l) => l.status !== "new").length}</div>
              </div>
            </div>

            <div className="hx-stack" style={{ marginTop: 0, marginBottom: 16 }}>
              <button className="hx-btn hx-btn-ghost" onClick={() => setShowImport(!showImport)}>
                <Plus size={15} />{showImport ? "Close import" : "Paste a lead list"}
              </button>
            </div>

            {showImport && (
              <div className="hx-card">
                <h3>Drop the list in</h3>
                <p style={{ marginBottom: 12 }}>One lead per line: <code>name, company, role, contact, notes</code>. A header row is detected automatically.</p>
                <textarea className="hx-textarea" rows={6} value={importText}
                  placeholder={"Jane Doe, Acme Protocol, Head of BD, jane@acme.xyz, met at ETHDenver\nSam Lee, Northwind, CTO, sam@northwind.io, warm intro from Priya"}
                  onChange={(e) => setImportText(e.target.value)} />
                <button className="hx-btn" style={{ marginTop: 12 }} disabled={!importText.trim()} onClick={importLeads}>
                  Import {parseLeads(importText).length || ""} and get to work
                </button>
              </div>
            )}

            <div className="hx-card">
              <h3>Or add one by hand</h3>
              <div className="hx-field" style={{ marginBottom: 10 }}>
                <input className="hx-input" placeholder="Name *" value={leadDraft.name}
                  onChange={(e) => setLeadDraft({ ...leadDraft, name: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input className="hx-input" placeholder="Company" value={leadDraft.company}
                  onChange={(e) => setLeadDraft({ ...leadDraft, company: e.target.value })} />
                <input className="hx-input" placeholder="Role" value={leadDraft.role}
                  onChange={(e) => setLeadDraft({ ...leadDraft, role: e.target.value })} />
              </div>
              <div className="hx-field" style={{ marginBottom: 10 }}>
                <input className="hx-input" placeholder="Contact (email / handle)" value={leadDraft.contact}
                  onChange={(e) => setLeadDraft({ ...leadDraft, contact: e.target.value })} />
              </div>
              <textarea className="hx-textarea" rows={2} placeholder="Brief note — where they came from, what they care about"
                value={leadDraft.notes} onChange={(e) => setLeadDraft({ ...leadDraft, notes: e.target.value })} />
              <button className="hx-btn" style={{ marginTop: 12 }} disabled={!leadDraft.name.trim()} onClick={addLead}>
                <Plus size={15} />Add them
              </button>
            </div>

            {leads.length > 0 && <div className="hx-sec">All leads</div>}
            {leads.map((l, i) => (
              <div className="hx-opp" key={l.id} onClick={() => setActiveLead(l)}>
                <div className="sc" style={{ background: TILE_COLORS[i % TILE_COLORS.length] }}>
                  <span className="v">{l.brief?.priority ?? "–"}</span>
                  <span className="l">{l.brief ? "prio" : "new"}</span>
                </div>
                <div className="bd">
                  <div className="kd">{l.status}{l.company ? " · " + l.company : ""}</div>
                  <div className="nm">{l.name}</div>
                  <div className="wy">{l.brief?.fit || l.role || l.notes || "No brief yet — open to generate one."}</div>
                </div>
              </div>
            ))}

            {leads.length === 0 && !showImport && (
              <p className="hx-note" style={{ marginTop: 8 }}>Empty in here. Paste a list above and let's give these people a reason to reply.</p>
            )}
          </>
        )}

        {/* ---------- LEAD DETAIL ---------- */}
        {view === "leads" && activeLead && (
          <>
            <div className="hx-hdr">
              <button className="hx-backc" onClick={() => setActiveLead(null)}><ArrowLeft size={17} /></button>
              <div className="hx-eyebrow" style={{ margin: 0 }}>Lead</div>
            </div>
            <h1 className="hx-h1 tight">{activeLead.name}</h1>
            <p className="hx-sub">
              {[activeLead.role, activeLead.company].filter(Boolean).join(" · ") || "No role or company on file"}
              {activeLead.contact ? ` · ${activeLead.contact}` : ""}
            </p>

            <div className="hx-sec">Status</div>
            <div className="hx-tabs">
              {LEAD_STATUSES.map((s) => (
                <button key={s} className={"hx-tab" + (activeLead.status === s ? " on" : "")}
                  onClick={() => setLeadStatus(activeLead, s)}>
                  {s[0].toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {activeLead.brief ? (
              <>
                <div className="hx-ring">
                  <Ring value={Math.round(activeLead.brief.priority || 0)} max={100} size={168} />
                  <div className="lbl">Priority</div>
                </div>
                <div className="hx-card" style={{ marginTop: 20 }}>
                  <h3>Overview</h3>
                  <p style={{ marginBottom: 14 }}>{activeLead.brief.overview}</p>
                  {activeLead.brief.fit && <div className="hx-bullet"><span className="bt">→</span><span>{activeLead.brief.fit}</span></div>}
                  {activeLead.brief.angle && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                      <div className="hx-sec" style={{ margin: "0 0 6px" }}>Opening angle</div>
                      <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>{activeLead.brief.angle}</div>
                    </div>
                  )}
                  {(activeLead.brief.risks || []).map((r, i) => (
                    <div className="hx-bullet" key={i} style={{ marginTop: 10 }}><span className="bt">!</span><span>{r}</span></div>
                  ))}
                </div>
              </>
            ) : (
              <div className="hx-card">
                <p style={{ marginBottom: 14 }}>{activeLead.notes || "No notes yet."}</p>
                <button className="hx-btn" disabled={leadBusy === "brief"} onClick={() => briefLead(activeLead)}>
                  <Sparkles size={15} />{leadBusy === "brief" ? "Reading the tea leaves…" : "Do the homework"}
                </button>
              </div>
            )}
            {leadBusy === "brief" && <LoadingDots label="Doing the homework so you don't have to" />}

            <div className="hx-sec">The follow-up sequence</div>
            {!activeLead.sequence && leadBusy !== "seq" && (
              <div className="hx-card">
                <p style={{ marginBottom: 14 }}>Four touches that get shorter and braver, each one leaving the door open. Polite persistence, not desperation.</p>
                <button className="hx-btn" onClick={() => sequenceLead(activeLead)}>
                  <Send size={15} />Write the follow-ups
                </button>
              </div>
            )}
            {leadBusy === "seq" && <LoadingDots label="Drafting follow-ups with a backbone" />}
            {activeLead.sequence && leadBusy !== "seq" && (
              <>
                {(activeLead.sequence.sequence || []).map((s, i) => (
                  <div className="hx-msg" key={i}>
                    <div className="ch">Step {s.step} · {s.when} · {s.channel}</div>
                    {s.subject && <div className="sj">{s.subject}</div>}
                    <div className="bd">{s.body}</div>
                    <button className="hx-btn hx-btn-ghost" style={{ marginTop: 12 }}
                      onClick={() => { navigator.clipboard.writeText((s.subject ? s.subject + "\n\n" : "") + s.body).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                      <Copy size={14} />Copy step {s.step}
                    </button>
                  </div>
                ))}
                {activeLead.sequence.cadence_note && (
                  <div className="hx-card">
                    <div className="hx-kicker"><Sparkles size={13} /> Cadence logic</div>
                    <p>{activeLead.sequence.cadence_note}</p>
                  </div>
                )}
                <div className="hx-stack">
                  <button className="hx-btn hx-btn-ghost" onClick={() => sequenceLead(activeLead)}>
                    <RefreshCw size={15} />Regenerate
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ---------- RELATIONSHIP GRAPH ---------- */}
        {view === "graph" && (
          <>
            <div className="hx-badge">Network</div>
            <h1 className="hx-h1 tight">Your <span className="g">orbit</span></h1>
            <p className="hx-sub">Everyone worth knowing, drawn around you. The closer they sit, the more they want what you're building — proximity is destiny here.</p>

            <div className="hx-card" style={{ padding: 18 }}>
              <RelationshipGraph
                center={org.name || "You"}
                nodes={opps.length ? opps : (eco?.seed || [])}
                onSelect={(n) => { if (n.score) openOpp(n); }}
              />
            </div>

            {eco?.live && (
              <div className="hx-card">
                <div className="hx-kicker"><ShieldCheck size={13} /> Live chain index</div>
                <div className="hx-bullet"><span className="bt">→</span><span>Block height <strong>{eco.live.blockNumber.toLocaleString()}</strong> on chain ID {eco.live.chainId}{eco.live.chainIdMatches ? " (verified)" : ""}.</span></div>
                <div className="hx-bullet"><span className="bt">→</span><span>{eco.facts.stack} · gas in {eco.facts.gasToken} · data availability via {eco.facts.dataAvailability}.</span></div>
              </div>
            )}
            {eco && !eco.live && (
              <div className="hx-card">
                <div className="hx-kicker"><ShieldCheck size={13} /> Chain index</div>
                <p>Live RPC unreachable from this deployment ({eco.liveError}). Showing verified static facts only.</p>
              </div>
            )}

            {eco?.entities?.length > 0 && (
              <div className="hx-card">
                <h3>Verified entry points</h3>
                {eco.entities.map((e) => (
                  <div className="hx-bullet" key={e.id}>
                    <span className="bt">·</span>
                    <span>
                      <strong>{e.name}</strong> — {e.why}
                      {e.url && <> <a href={e.url} target="_blank" rel="noreferrer" style={{ color: "#0F1613" }}>open ↗</a></>}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {eco?.coverage && (
              <div className="hx-card">
                <h3>Index coverage</h3>
                {eco.coverage.covered.map((c, i) => (
                  <div className="hx-bullet" key={"c" + i}><span className="bt">✓</span><span>{c}</span></div>
                ))}
                <h3 style={{ marginTop: 18 }}>Not yet indexed</h3>
                {eco.coverage.notYetCovered.map((c, i) => (
                  <div className="hx-bullet" key={"n" + i}><span className="bt">–</span><span>{c}</span></div>
                ))}
              </div>
            )}

            <div className="hx-card">
              <h3>Expansion targets</h3>
              <p style={{ marginBottom: 12 }}>Architecture supports these; indexers not yet built.</p>
              <div className="hx-chips">
                {EXPANSION_CHAINS.map((c) => (
                  <span key={c.key} className="hx-chip" style={{ cursor: "default", opacity: .65 }}>{c.name}</span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ---------- WORKSPACE ---------- */}
        {view === "workspace" && active && (
          <>
            <div className="hx-hdr">
              <button className="hx-backc" onClick={() => setView("opps")}><ArrowLeft size={17} /></button>
              <div className="hx-eyebrow" style={{ margin: 0 }}>{active.kind} workspace</div>
            </div>

            <h1 className="hx-h1 tight">{active.name}</h1>
            <p className="hx-sub">{active.why}</p>

            <div className="hx-ring">
              <Ring value={active.score} max={100} size={172} />
              <div className="lbl">Match score</div>
            </div>

            {reportLoading && <LoadingDots label="Building the case, so you walk in prepared" />}

            {report && !reportLoading && (
              <>
                <div className="hx-card" style={{ marginTop: 22 }}>
                  <h3>Why this one’s worth it</h3>
                  <p style={{ marginBottom: 16 }}>{report.summary}</p>
                  {(report.fit_points || []).map((p, i) => (
                    <div className="hx-bullet" key={i}><span className="bt">→</span><span>{p}</span></div>
                  ))}
                  {report.suggested_action && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                      <div className="hx-sec" style={{ margin: "0 0 6px" }}>Your move</div>
                      <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>{report.suggested_action}</div>
                    </div>
                  )}
                </div>

                {/* ---- live opportunity scan ---- */}
                <div className="hx-sec">What's actually open right now</div>
                {!scans[active.id] && !scanLoading && (
                  <div className="hx-card">
                    <p style={{ marginBottom: 14 }}>
                      Discovery told you <strong>who</strong> to approach. Scan {active.name} to find <strong>what</strong> is actually open there — applications, tracks, and rounds you can act on today.
                    </p>
                    <button className="hx-btn" onClick={() => runScan(active)}><Radar size={15} />Show me what's open</button>
                  </div>
                )}
                {scanLoading && <LoadingDots label={"Scanning " + active.name + " for current openings"} />}
                {scans[active.id] && !scanLoading && (
                  <>
                    <div className="hx-card">
                      <div className="hx-kicker">
                        <Radar size={13} />
                        {scans[active.id].searchMode === "live" ? "Live scan · verified sources" : "Inferred scan · confirm before acting"}
                      </div>
                      <p>{scans[active.id].summary || scans[active.id].error}</p>
                    </div>
                    {(scans[active.id].openings || []).map((op, i) => (
                      <div className="hx-opp" key={i} style={{ cursor: "default" }}>
                        <div className="sc" style={{ background: op.confidence === "verified" ? "var(--tile-g)" : "var(--tile-y)", width: 56 }}>
                          <span className="l" style={{ fontSize: 8, marginTop: 0 }}>
                            {op.confidence === "verified" ? "VERIFIED" : "INFERRED"}
                          </span>
                        </div>
                        <div className="bd">
                          <div className="kd">{op.status_label || op.status}</div>
                          <div className="nm">{op.title}</div>
                          <div className="wy">{op.action}</div>
                          {op.deadline && (
                            <div style={{ fontSize: 12.5, color: "var(--ink3)", marginTop: 5 }}>Deadline: {op.deadline}</div>
                          )}
                          {op.url && (
                            <a href={op.url} target="_blank" rel="noreferrer"
                              style={{ fontSize: 12.5, color: "#0F1613", marginTop: 5, display: "inline-block" }}>
                              source ↗
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                    {scans[active.id].next_step && (
                      <div className="hx-card">
                        <div className="hx-sec" style={{ margin: "0 0 6px" }}>Do this next</div>
                        <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>{scans[active.id].next_step}</div>
                      </div>
                    )}
                    {(scans[active.id].where_to_check || []).length > 0 && (
                      <div className="hx-card">
                        <h3>Trust, but verify</h3>
                        {scans[active.id].where_to_check.map((u, i) => (
                          <div className="hx-bullet" key={i}>
                            <span className="bt">·</span>
                            <a href={u} target="_blank" rel="noreferrer" style={{ color: "#0F1613", wordBreak: "break-all" }}>{u}</a>
                          </div>
                        ))}
                      </div>
                    )}
                    <button className="hx-btn hx-btn-ghost" onClick={() => runScan(active)} style={{ marginBottom: 4 }}>
                      <RefreshCw size={15} />Re-scan
                    </button>
                  </>
                )}

                <div className="hx-sec">The part where you actually reach out</div>
                <div className="hx-chans">
                  {CHANNELS.map((ch) => (
                    <button key={ch} className={"hx-chan" + (channel === ch ? " on" : "")}
                      onClick={() => genOutreach(ch)}>{ch}</button>
                  ))}
                </div>

                {outreachLoading && !outreach[channel] && <LoadingDots label={"Writing " + channel + " message"} />}

                {outreach[channel] && (
                  <div className="hx-msg">
                    <div className="ch">{channel}</div>
                    {outreach[channel].subject && <div className="sj">{outreach[channel].subject}</div>}
                    <div className="bd">{outreach[channel].body}</div>
                  </div>
                )}

                {logged?.hash && (
                  <div className="hx-chain">
                    <div className="k">Partnership logged · status draft</div>
                    <div className="d">Recorded to PartnershipRegistry — visible in your Opportunity Pipeline.</div>
                    <div className="h">{logged.hash.slice(0, 26)}… <ExternalLink size={12} /></div>
                  </div>
                )}

                <div className="hx-sec">Where this deal stands</div>
                <div className="hx-tabs">
                  {PIPELINE_STATUSES.map((s) => (
                    <button key={s}
                      className={"hx-tab" + ((pipeline[active.id]?.status || "draft") === s ? " on" : "")}
                      onClick={() => setStatus(active.id, s, active.name)}>
                      {s[0].toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>

                {sendState && !sendState.pending && (
                  <div className={sendState.sent ? "hx-card" : "hx-err"} style={sendState.sent ? { marginTop: 4 } : {}}>
                    {sendState.sent
                      ? <><div className="hx-kicker"><Check size={13} /> Sent</div><p>Off it goes — delivered via {channel}. Now we wait, and the deal moves to sent.</p></>
                      : (sendState.reason || sendState.error)}
                  </div>
                )}

                <div className="hx-stack">
                  <button className="hx-btn hx-btn-dark" disabled={logged?.pending} onClick={logToChain}>
                    {logged?.pending ? "Committing to the record…" : logged?.hash ? "On the record" : "Put it on-chain"}
                  </button>
                  <button className="hx-btn" disabled={sendState?.pending} onClick={sendOutreach}>
                    <Send size={15} />{sendState?.pending ? "Sending…" : "Send " + channel}
                  </button>
                  <button className="hx-btn hx-btn-ghost" onClick={copyMsg}>
                    {copied ? <><Check size={15} />Copied</> : <><Copy size={15} />Copy message</>}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ---------- BOTTOM NAV ---------- */}
        <div className="hx-nav">
          {NAV.map((n) => (
            <button key={n.id} className={"hx-navit" + (view === n.id ? " on" : "")}
              disabled={!n.on} onClick={() => setView(n.id)}>
              <n.icon size={19} strokeWidth={1.9} />
              <span>{n.label}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
