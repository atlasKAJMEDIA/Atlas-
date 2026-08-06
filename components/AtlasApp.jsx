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
  .at { --page:#E3E3E1; --surface:#F4F4F2; --raised:#FFFFFF;
        --ink:#14151A; --ink2:#6B7076; --ink3:#9AA0A6; --line:#E4E4E0;
        --green:#93E3B0; --tile-o:#F9BE7C; --tile-g:#A9DDC2; --tile-y:#F5D46E; --tile-b:#B7D5F5;
        min-height:100vh; background:var(--page); color:var(--ink);
        font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Helvetica,Arial,sans-serif;
        -webkit-font-smoothing:antialiased; display:flex; justify-content:center; }
  .at * { box-sizing:border-box; }
  .at button { font-family:inherit; }

  .at-shell { width:100%; max-width:560px; background:var(--surface); min-height:100vh;
    padding:34px 26px 132px; position:relative; }
  @media (min-width:640px){
    .at { padding:34px 20px; align-items:flex-start; }
    .at-shell { min-height:auto; border-radius:34px; box-shadow:0 18px 60px rgba(0,0,0,.10); padding:38px 32px 132px; }
  }

  .at-eyebrow { font-size:11.5px; font-weight:600; letter-spacing:.12em; text-transform:uppercase;
    color:var(--ink3); margin-bottom:12px; }
  .at-h1 { font-size:34px; line-height:1.12; font-weight:600; letter-spacing:-.032em; margin:0 0 26px; }
  .at-h1.tight { margin-bottom:16px; }
  .at-sub { color:var(--ink2); font-size:15px; line-height:1.55; margin:-14px 0 26px; }
  .at-sec { font-size:11.5px; font-weight:600; letter-spacing:.12em; text-transform:uppercase;
    color:var(--ink3); margin:28px 0 12px; }

  /* ---------- feature (black) card ---------- */
  .at-feature { background:#101114; color:#F6F6F4; border-radius:24px; padding:24px 26px 26px; }
  .at-feature .k { font-size:11.5px; font-weight:600; letter-spacing:.12em; text-transform:uppercase;
    color:#8A9099; margin-bottom:14px; }
  .at-feature .big { font-size:42px; font-weight:600; letter-spacing:-.03em; line-height:1; margin-bottom:14px; }
  .at-feature .t { font-size:19px; font-weight:600; letter-spacing:-.02em; margin-bottom:6px; }
  .at-feature .d { font-size:14px; color:#9AA0A8; line-height:1.5; }
  .at-seg { display:flex; gap:9px; margin-top:22px; }
  .at-seg span { height:5px; border-radius:100px; flex:1; }

  /* ---------- numbered list ---------- */
  .at-row { display:flex; align-items:center; gap:15px; padding:15px 0; border-bottom:1px solid var(--line); }
  .at-row:last-child { border-bottom:none; }
  .at-num { width:31px; height:31px; border-radius:50%; background:#E8E8E4; color:var(--ink2);
    font-size:12.5px; font-weight:600; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .at-row .lb { flex:1; font-size:15.5px; font-weight:500; letter-spacing:-.01em; }
  .at-row .rt { font-size:14px; color:var(--ink2); flex-shrink:0; }

  /* ---------- tiles ---------- */
  .at-tiles { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .at-tile { border-radius:20px; padding:19px 20px 20px; min-height:152px;
    display:flex; flex-direction:column; cursor:pointer; transition:transform .15s; }
  .at-tile:hover { transform:translateY(-2px); }
  .at-tile .k { font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
    color:rgba(20,21,26,.62); margin-bottom:10px; }
  .at-tile .v { font-size:33px; font-weight:600; letter-spacing:-.035em; line-height:1; }
  .at-tile .n { margin-top:auto; font-size:13.5px; font-weight:500; color:rgba(20,21,26,.78);
    line-height:1.35; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }

  /* ---------- cards ---------- */
  .at-card { background:var(--raised); border-radius:22px; padding:22px 24px; margin-bottom:12px; }
  .at-card h3 { font-size:16.5px; font-weight:600; letter-spacing:-.02em; margin:0 0 14px; }
  .at-card p { font-size:14.5px; line-height:1.6; color:var(--ink2); margin:0; }
  .at-kicker { display:flex; align-items:center; gap:8px; font-size:11.5px; font-weight:600;
    letter-spacing:.1em; text-transform:uppercase; color:var(--ink3); margin-bottom:14px; }
  .at-bullet { display:flex; gap:12px; font-size:14.5px; line-height:1.55; margin-bottom:10px; color:var(--ink); }
  .at-bullet:last-child { margin-bottom:0; }
  .at-bullet .b { color:var(--ink3); font-weight:600; flex-shrink:0; width:14px; }

  /* ---------- bars ---------- */
  .at-bar { margin-bottom:17px; }
  .at-bar:last-child { margin-bottom:0; }
  .at-bar .hd { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:9px; }
  .at-bar .hd .l { font-size:14.5px; font-weight:500; }
  .at-bar .hd .v { font-size:14.5px; font-weight:600; }
  .at-bar .tr { height:7px; border-radius:100px; background:#E7E7E3; overflow:hidden; }
  .at-bar .fl { height:100%; border-radius:100px; }

  /* ---------- ring ---------- */
  .at-ring { display:flex; flex-direction:column; align-items:center; margin:6px 0 4px; }
  .at-ring .wrap { position:relative; }
  .at-ring .ctr { position:absolute; inset:0; display:flex; flex-direction:column;
    align-items:center; justify-content:center; }
  .at-ring .num { font-size:54px; font-weight:600; letter-spacing:-.04em; line-height:1; }
  .at-ring .of { font-size:11.5px; font-weight:600; letter-spacing:.1em; color:var(--ink3); margin-top:7px; }
  .at-ring .lbl { font-size:19px; font-weight:600; letter-spacing:-.02em; margin-top:18px; }
  .at-ring .cap { font-size:14.5px; color:var(--ink2); text-align:center; margin-top:7px; line-height:1.5; max-width:330px; }

  /* ---------- controls ---------- */
  .at-btn { width:100%; background:var(--green); color:#0F1613; border:none; padding:17px 24px;
    border-radius:17px; font-size:15.5px; font-weight:600; letter-spacing:-.01em; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px; transition:filter .15s; }
  .at-btn:hover { filter:brightness(.96); }
  .at-btn:disabled { background:#E4E4E0; color:var(--ink3); cursor:not-allowed; }
  .at-btn-dark { background:#101114; color:#FAFAF8; }
  .at-btn-dark:hover { filter:brightness(1.25); }
  .at-btn-ghost { background:var(--raised); color:var(--ink); }
  .at-btn-ghost:hover { filter:brightness(.98); }
  .at-stack { display:flex; flex-direction:column; gap:10px; margin-top:22px; }

  .at-field { margin-bottom:20px; }
  .at-label { font-size:14px; font-weight:600; margin-bottom:9px; display:block; letter-spacing:-.01em; }
  .at-input, .at-textarea { width:100%; background:var(--raised); border:1px solid transparent;
    border-radius:16px; padding:15px 17px; font-size:15px; font-family:inherit; color:var(--ink);
    resize:vertical; transition:border-color .15s; }
  .at-input::placeholder, .at-textarea::placeholder { color:var(--ink3); }
  .at-input:focus, .at-textarea:focus { outline:none; border-color:#0F1613; }

  .at-chips { display:flex; flex-wrap:wrap; gap:8px; }
  .at-chip { border:none; background:var(--raised); color:var(--ink); padding:11px 16px;
    border-radius:100px; font-size:13.5px; font-weight:500; cursor:pointer; transition:all .15s; }
  .at-chip:hover { filter:brightness(.97); }
  .at-chip.on { background:#101114; color:#FAFAF8; }

  .at-tabs { display:flex; gap:7px; margin-bottom:16px; flex-wrap:wrap; }
  .at-tab { border:none; background:var(--raised); color:var(--ink2); padding:9px 15px;
    border-radius:100px; font-size:13px; font-weight:500; cursor:pointer; }
  .at-tab.on { background:#101114; color:#FAFAF8; }

  /* ---------- opportunity list ---------- */
  .at-opp { display:flex; gap:15px; align-items:center; background:var(--raised); border-radius:20px;
    padding:17px 19px; margin-bottom:10px; cursor:pointer; transition:transform .15s; }
  .at-opp:hover { transform:translateY(-2px); }
  .at-opp .sc { width:52px; height:52px; border-radius:15px; flex-shrink:0; display:flex;
    flex-direction:column; align-items:center; justify-content:center; font-weight:600; color:#14151A; }
  .at-opp .sc .v { font-size:17px; letter-spacing:-.03em; line-height:1; }
  .at-opp .sc .l { font-size:8.5px; letter-spacing:.08em; text-transform:uppercase; margin-top:3px; opacity:.65; }
  .at-opp .bd { flex:1; min-width:0; }
  .at-opp .kd { font-size:10.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
    color:var(--ink3); margin-bottom:4px; }
  .at-opp .nm { font-size:15.5px; font-weight:600; letter-spacing:-.015em; margin-bottom:4px; }
  .at-opp .wy { font-size:13.5px; color:var(--ink2); line-height:1.45;
    overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }

  /* ---------- outreach ---------- */
  .at-chans { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:14px; }
  .at-chan { border:none; background:var(--raised); color:var(--ink2); padding:10px 15px;
    border-radius:100px; font-size:13px; font-weight:500; cursor:pointer; }
  .at-chan.on { background:var(--green); color:#0F1613; font-weight:600; }
  .at-msg { background:var(--raised); border-radius:22px; padding:21px 23px; margin-bottom:12px; }
  .at-msg .ch { font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
    color:var(--ink3); margin-bottom:11px; }
  .at-msg .sj { font-size:15.5px; font-weight:600; letter-spacing:-.015em; margin-bottom:10px; }
  .at-msg .bd { font-size:14.5px; line-height:1.65; color:var(--ink2); white-space:pre-wrap; }

  /* ---------- on-chain receipt ---------- */
  .at-chain { background:#101114; color:#F6F6F4; border-radius:22px; padding:20px 22px; margin-top:12px; }
  .at-chain .k { font-size:11px; font-weight:600; letter-spacing:.12em; text-transform:uppercase;
    color:#8A9099; margin-bottom:9px; }
  .at-chain .d { font-size:14px; line-height:1.5; color:#C9CDD2; }
  .at-chain .h { font-family:ui-monospace,SFMono-Regular,monospace; font-size:12.5px; color:var(--green);
    margin-top:11px; display:flex; align-items:center; gap:7px; word-break:break-all; }

  /* ---------- misc ---------- */
  .at-back { background:none; border:none; color:var(--ink2); font-size:14px; cursor:pointer;
    margin-bottom:18px; padding:0; display:flex; align-items:center; gap:7px; }
  .at-back:hover { color:var(--ink); }
  .at-backc { width:38px; height:38px; border-radius:50%; background:var(--raised); border:none;
    display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
  .at-hdr { display:flex; align-items:center; gap:13px; margin-bottom:20px; }
  .at-load { display:flex; align-items:center; gap:10px; color:var(--ink2); font-size:14px; padding:14px 0; }
  .at-dot { width:6px; height:6px; border-radius:50%; background:var(--ink3); animation:atp 1.1s infinite ease-in-out; }
  .at-dot:nth-child(2){animation-delay:.15s} .at-dot:nth-child(3){animation-delay:.3s}
  @keyframes atp { 0%,80%,100%{opacity:.22} 40%{opacity:1} }
  .at-err { background:#FBE9E7; color:#B4362C; border-radius:16px; padding:14px 17px;
    font-size:14px; line-height:1.5; margin-top:14px; }

  /* ---------- bottom nav ---------- */
  .at-nav { position:fixed; bottom:18px; left:50%; transform:translateX(-50%);
    width:calc(100% - 52px); max-width:508px; background:var(--raised); border-radius:23px;
    padding:9px 8px; display:flex; box-shadow:0 8px 30px rgba(0,0,0,.10); z-index:40; }
  @media (min-width:640px){ .at-nav { position:sticky; bottom:22px; width:100%; max-width:none;
    transform:none; left:auto; margin:26px 0 -104px; } }
  .at-navit { flex:1; min-width:0; border:none; background:none; border-radius:14px; padding:9px 1px 8px;
    display:flex; flex-direction:column; align-items:center; gap:5px; cursor:pointer;
    color:var(--ink3); transition:background .15s,color .15s; }
  .at-navit span { font-size:9.5px; font-weight:500; letter-spacing:-.01em; max-width:100%;
    overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .at-navit:hover:not(:disabled) { color:var(--ink2); }
  .at-navit.on { background:#DFF3E7; color:var(--ink); }
  .at-navit.on span { font-weight:600; }
  .at-navit:disabled { opacity:.32; cursor:not-allowed; }

  /* ---------- connect gate ---------- */
  .at-gate { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:30px 26px; }
  @media (min-width:640px){ .at-gate { min-height:640px; } }
  .at-gate-in { width:100%; max-width:390px; text-align:center; }
  .at-mark { width:60px; height:60px; border-radius:19px; background:var(--green); margin:0 auto 24px;
    display:flex; align-items:center; justify-content:center; }
  .at-gate h1 { font-size:33px; font-weight:600; letter-spacing:-.032em; margin:0 0 11px; }
  .at-gate .p { color:var(--ink2); font-size:15.5px; line-height:1.55; margin:0 0 28px; }
  .at-wopts { display:flex; flex-direction:column; gap:9px; margin-bottom:20px; }
  .at-wopt { display:flex; align-items:center; justify-content:space-between; padding:16px 19px;
    border:none; border-radius:17px; background:var(--raised); cursor:pointer; font-size:15px;
    font-weight:500; color:var(--ink); transition:filter .15s; }
  .at-wopt:hover { filter:brightness(.97); }
  .at-note { font-size:12.5px; color:var(--ink3); line-height:1.55; }
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
    <div className="at-load">
      <span className="at-dot" /><span className="at-dot" /><span className="at-dot" />
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
          <linearGradient id="atlas-ring" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F5C86B" />
            <stop offset="52%" stopColor="#F79055" />
            <stop offset="100%" stopColor="#F2645C" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E7E7E3" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#atlas-ring)"
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
    <div className="at-bar">
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
  const kindColor = { partnership: "#F9BE7C", grant: "#A9DDC2", investor: "#B7D5F5", resource: "#F5D46E" };
  const placed = nodes.slice(0, 9).map((n, i, arr) => {
    const a = (i / arr.length) * Math.PI * 2 - Math.PI / 2;
    const r = R * (0.62 + 0.38 * ((n.score ?? 60) / 100));
    return { ...n, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {placed.map((n) => (
        <line key={"l" + n.id} x1={cx} y1={cy} x2={n.x} y2={n.y}
          stroke="#D4D4CF" strokeWidth={1 + ((n.score ?? 50) / 100) * 2} />
      ))}
      {placed.map((n) => (
        <g key={n.id} onClick={() => onSelect?.(n)} style={{ cursor: "pointer" }}>
          <circle cx={n.x} cy={n.y} r={17} fill={kindColor[n.kind] || "#E0E0DC"} />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#14151A">
            {n.score ?? "·"}
          </text>
          <text x={n.x} y={n.y + 31} textAnchor="middle" fontSize="8.5" fill="#6B7076">
            {(n.name || "").slice(0, 16)}
          </text>
        </g>
      ))}
      <circle cx={cx} cy={cy} r={31} fill="#101114" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="#F6F6F4">
        {(center || "You").slice(0, 9)}
      </text>
    </svg>
  );
}

const CATEGORIES = ["DeFi Protocol", "Consumer App", "AI Application", "Infrastructure", "Wallet / Trading", "Stablecoin / Payments"];
const ROLES = ["Owner", "Admin", "Member", "Viewer"];
const CHANNELS = ["Email", "Telegram", "Discord", "Farcaster", "X", "LinkedIn"];
const TILE_COLORS = ["var(--tile-o)", "var(--tile-g)", "var(--tile-y)", "var(--tile-b)"];
const BAR_COLORS = ["#F2795E", "#F5C24E", "#5FCBA4", "#7FB2ED"];

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
        "You are Atlas, an ecosystem intelligence engine for projects building on Robinhood Chain (an EVM chain bringing TradFi users into crypto). Analyze the given project's position and the broader Web3/onchain BD landscape. Respond ONLY with valid JSON, no fences: " +
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
        "You are Atlas's opportunity discovery engine for Robinhood Chain. Given a project, surface concrete BD opportunities: partnerships, grants, and investors it should pursue. For a testnet ecosystem, generate realistic, plausible opportunity types (protocols to integrate with, grant programs, VC/angel profiles) — clearly archetypal, not fabricated specific claims. Respond ONLY with valid JSON, no fences: " +
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
        "You are Atlas's lead qualification engine. Given a lead and the project reaching out, produce a tight brief. Respond ONLY with valid JSON, no fences: " +
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
        "You are Atlas's follow-up sequence engine. Write a multi-touch outreach sequence that escalates politely, gets shorter each step, and always gives the recipient an explicit exit. Respond ONLY with valid JSON, no fences: " +
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
        "You are Atlas's AI research agent. Produce a tight executive brief on why this opportunity fits the project and how to approach it. Respond ONLY with valid JSON, no fences: " +
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
        "You are Atlas's outreach engine. Write a personalized " + ch + " message from our project to this opportunity, referencing real ecosystem context, not generic templates. Respond ONLY with valid JSON, no fences: " +
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
      <div className="at">
        <style>{CSS}</style>
        <div className="at-shell" style={{ paddingBottom: 34 }}>
          <div className="at-gate">
            <div className="at-gate-in">
              <div className="at-mark"><Leaf size={27} color="#0F1613" /></div>
              <h1>Atlas</h1>
              <p className="p">The AI Business Development OS for Robinhood Chain. Discover partners, find grants, raise capital — grow faster.</p>
              <div className="at-wopts">
                {["MetaMask", "WalletConnect", "Coinbase Wallet", "Rabby", "Robinhood Wallet"].map((w) => (
                  <button key={w} className="at-wopt" onClick={connect} disabled={connecting}>
                    <span>{w}</span><Wallet size={18} color="#9AA0A6" />
                  </button>
                ))}
              </div>
              <p className="at-note">
                {connecting
                  ? "Requesting connection…"
                  : "Connects on Robinhood Chain Testnet (Chain ID 46630). No injected wallet? A simulated testnet wallet lets you explore the full flow."}
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
    <div className="at">
      <style>{CSS}</style>
      <div className="at-shell">

        {/* ---------- DASHBOARD ---------- */}
        {view === "dashboard" && (
          <>
            <div className="at-eyebrow">Robinhood Chain · BD Operating System</div>
            <h1 className="at-h1">Who should you work with next?</h1>

            <div className="at-feature">
              <div className="k">On-chain identity</div>
              <div className="big">{reputation}</div>
              <div className="t">{orgRegistered ? org.name || "Your organization" : "Not registered yet"}</div>
              <div className="d">
                {orgRegistered
                  ? `${shortAddr} · reputation ${reputation}/100`
                  : "Register to mint your Organization ID and start scoring opportunities."}
              </div>
              <div className="at-seg">
                <span style={{ background: orgRegistered ? "#5FCBA4" : "#2A2C31" }} />
                <span style={{ background: intel ? "#F5C24E" : "#2A2C31" }} />
                <span style={{ background: opps.length ? "#F2795E" : "#2A2C31" }} />
                <span style={{ background: logged?.hash ? "#7FB2ED" : "#2A2C31" }} />
              </div>
            </div>

            <div className="at-sec">Next steps</div>
            <div className="at-card" style={{ padding: "6px 22px" }}>
              <div className="at-row">
                <span className="at-num">1</span>
                <span className="lb">Register organization</span>
                <span className="rt">{orgRegistered ? "Done" : "2 min"}</span>
              </div>
              <div className="at-row">
                <span className="at-num">2</span>
                <span className="lb">Run ecosystem intelligence</span>
                <span className="rt">{intel ? "Done" : orgRegistered ? "Ready" : "Locked"}</span>
              </div>
              <div className="at-row">
                <span className="at-num">3</span>
                <span className="lb">Discover opportunities</span>
                <span className="rt">{opps.length ? `${opps.length} found` : orgRegistered ? "Ready" : "Locked"}</span>
              </div>
            </div>

            {(opps.length > 0 || intel) && (
              <div className="at-card" style={{ marginTop: 12 }}>
                <div className="at-kicker"><Zap size={13} /> Today's signal</div>
                {opps.length > 0 && (
                  <div className="at-bullet"><span className="b">→</span><span>{opps.length} opportunities scored — top is <strong>{opps[0].name}</strong> at {opps[0].score}/100.</span></div>
                )}
                {intel && <div className="at-bullet"><span className="b">→</span><span>{intel.funding_readiness}</span></div>}
              </div>
            )}

            {Object.keys(pipeline).length > 0 && (
              <div className="at-card">
                <div className="at-kicker"><Leaf size={13} /> Opportunity pipeline</div>
                {Object.entries(pipeline).slice(0, 5).map(([id, p]) => (
                  <div className="at-bullet" key={id}>
                    <span className="b">·</span>
                    <span><strong>{p.name}</strong> — {p.status}</span>
                  </div>
                ))}
              </div>
            )}

            {memory.length > 0 && (
              <div className="at-card">
                <div className="at-kicker"><Sparkles size={13} /> What Atlas remembers</div>
                {memory.slice(-4).reverse().map((m) => (
                  <div className="at-bullet" key={m.id}>
                    <span className="b">·</span>
                    <span style={{ color: "var(--ink2)" }}>
                      {new Date(m.at).toLocaleDateString()} — {m.kind.replace(/_/g, " ")}
                      {m.detail?.name ? `: ${m.detail.name}` : ""}
                    </span>
                  </div>
                ))}
                <p style={{ fontSize: 12.5, color: "var(--ink3)", marginTop: 10, lineHeight: 1.5 }}>
                  {memory.length} events remembered. Future intelligence and discovery runs are told what you've already done.
                </p>
              </div>
            )}

            <div className="at-stack">
              {!orgRegistered ? (
                <button className="at-btn" onClick={() => setView("org")}>Set up organization<ArrowRight size={16} /></button>
              ) : (
                <>
                  <button className="at-btn" onClick={() => { setView("opps"); if (!opps.length && !oppLoading) discover(); }}>
                    View opportunities<ArrowRight size={16} />
                  </button>
                  <button className="at-btn at-btn-ghost" onClick={() => { setView("intel"); if (!intel && !intelLoading) runIntel(); }}>
                    Run intelligence
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* ---------- ORGANIZATION ---------- */}
        {view === "org" && (
          <>
            <div className="at-eyebrow">Organization profile</div>
            <h1 className="at-h1 tight">Tell Atlas about your project.</h1>
            <p className="at-sub">This becomes your on-chain identity — every opportunity Atlas scores is relative to it.</p>

            <div className="at-field">
              <label className="at-label">Project name</label>
              <input className="at-input" value={org.name} placeholder="e.g. Meridian Protocol"
                onChange={(e) => setOrg({ ...org, name: e.target.value })} />
            </div>
            <div className="at-field">
              <label className="at-label">Category</label>
              <div className="at-chips">
                {CATEGORIES.map((c) => (
                  <button key={c} className={"at-chip" + (org.category === c ? " on" : "")}
                    onClick={() => setOrg({ ...org, category: c })}>{c}</button>
                ))}
              </div>
            </div>
            <div className="at-field">
              <label className="at-label">Website / docs <span style={{ color: "var(--ink3)", fontWeight: 400 }}>optional</span></label>
              <input className="at-input" value={org.website} placeholder="https://"
                onChange={(e) => setOrg({ ...org, website: e.target.value })} />
            </div>
            <div className="at-field">
              <label className="at-label">What you're building</label>
              <textarea className="at-textarea" rows={5} value={org.desc}
                placeholder="What the product does, who it's for, what you need next (partners, grants, capital)…"
                onChange={(e) => setOrg({ ...org, desc: e.target.value })} />
            </div>

            {orgRegistered && orgTx?.hash && (
              <div className="at-chain">
                <div className="k">On-chain identity minted</div>
                <div className="d">Registered to ProjectRegistry — you now have an Organization ID.</div>
                <div className="h">{orgTx.hash.slice(0, 26)}… <ExternalLink size={12} /></div>
              </div>
            )}

            {orgRegistered && (
              <>
                <div className="at-sec">Team workspace</div>
                <div className="at-card">
                  <h3>Members & roles</h3>
                  <div className="at-row">
                    <span className="at-num">1</span>
                    <span className="lb">{shortAddr}</span>
                    <span className="rt">Owner</span>
                  </div>
                  {members.map((m, i) => (
                    <div className="at-row" key={m.addr + i}>
                      <span className="at-num">{i + 2}</span>
                      <span className="lb" style={{ fontFamily: "ui-monospace,monospace", fontSize: 13.5 }}>
                        {m.addr.slice(0, 6)}…{m.addr.slice(-4)}
                      </span>
                      <span className="rt">{m.role}</span>
                      <button className="at-backc" style={{ width: 30, height: 30 }}
                        onClick={() => setMembers(members.filter((_, j) => j !== i))}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                    <input className="at-input" style={{ flex: "1 1 180px" }} placeholder="0x wallet address"
                      value={newMember.addr} onChange={(e) => setNewMember({ ...newMember, addr: e.target.value })} />
                    <select className="at-input" style={{ flex: "0 0 120px" }} value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}>
                      {ROLES.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <button className="at-btn at-btn-ghost" style={{ marginTop: 10 }}
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

            <div className="at-stack">
              {!orgRegistered ? (
                <button className="at-btn at-btn-dark"
                  disabled={!org.name || !org.category || !org.desc || orgTx?.pending}
                  onClick={registerOrgWithMemory}>
                  {orgTx?.pending ? "Writing to chain…" : "Register on-chain"}
                  {!orgTx?.pending && <ArrowRight size={16} />}
                </button>
              ) : (
                <button className="at-btn" onClick={() => { setView("intel"); if (!intel && !intelLoading) runIntel(); }}>
                  Run intelligence<ArrowRight size={16} />
                </button>
              )}
            </div>
          </>
        )}

        {/* ---------- INTELLIGENCE ---------- */}
        {view === "intel" && (
          <>
            <div className="at-hdr">
              <button className="at-backc" onClick={() => setView("dashboard")}><ArrowLeft size={17} /></button>
              <div className="at-eyebrow" style={{ margin: 0 }}>Ecosystem intelligence</div>
            </div>

            {!intel && !intelLoading && (
              <>
                <h1 className="at-h1 tight">{org.name || "Your project"} — ecosystem position.</h1>
                <p className="at-sub">Atlas maps where you sit, what you're strong at, and what's missing.</p>
                <div className="at-stack" style={{ marginTop: 4 }}>
                  <button className="at-btn" onClick={runIntel}><Sparkles size={16} />Run intelligence</button>
                </div>
              </>
            )}

            {intelLoading && (
              <>
                <h1 className="at-h1 tight">Reading the ecosystem…</h1>
                <LoadingDots label="Indexing Robinhood Chain & analyzing position" />
              </>
            )}

            {intelErr && <div className="at-err">{intelErr}</div>}

            {intel && !intelLoading && (
              <>
                <h1 className="at-h1 tight">Your ecosystem read</h1>
                <div className="at-ring">
                  <Ring value={Math.round(intel.readiness_score ?? reputation ?? 68)} max={100} />
                  <div className="lbl">{intel.readiness_label || "Emerging"}</div>
                  <div className="cap">{intel.funding_readiness}</div>
                </div>

                <div className="at-card" style={{ marginTop: 22 }}>
                  <h3>What drives it</h3>
                  {drivers.map((d, i) => (
                    <Bar key={i} label={d.label} value={Math.round(d.value)} color={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </div>

                <div className="at-card">
                  <h3>Position</h3>
                  <p>{intel.position}</p>
                </div>

                <div className="at-card">
                  <h3>Strengths</h3>
                  {(intel.strengths || []).map((s, i) => (
                    <div className="at-bullet" key={i}><span className="b">+</span><span>{s}</span></div>
                  ))}
                  <h3 style={{ marginTop: 20 }}>Gaps</h3>
                  {(intel.gaps || []).map((s, i) => (
                    <div className="at-bullet" key={i}><span className="b">–</span><span>{s}</span></div>
                  ))}
                </div>

                <div className="at-card">
                  <h3>Timely moves</h3>
                  {(intel.ecosystem_moves || []).map((s, i) => (
                    <div className="at-bullet" key={i}><span className="b">→</span><span>{s}</span></div>
                  ))}
                </div>

                <div className="at-stack">
                  <button className="at-btn" onClick={() => { setView("opps"); if (!opps.length && !oppLoading) discover(); }}>
                    Discover opportunities<ArrowRight size={16} />
                  </button>
                  <button className="at-btn at-btn-ghost" onClick={runIntel}><RefreshCw size={15} />Re-run</button>
                </div>
              </>
            )}
          </>
        )}

        {/* ---------- OPPORTUNITIES ---------- */}
        {view === "opps" && (
          <>
            <div className="at-eyebrow">Opportunity discovery</div>
            <h1 className="at-h1 tight">Your top opportunities</h1>

            {!opps.length && !oppLoading && (
              <>
                <p className="at-sub">Scored and explained — partnerships, grants, and investors worth pursuing right now.</p>
                <div className="at-stack" style={{ marginTop: 4 }}>
                  <button className="at-btn" onClick={discover}><Zap size={16} />Discover opportunities</button>
                </div>
              </>
            )}

            {oppLoading && <LoadingDots label="Scanning the ecosystem for opportunities" />}
            {oppErr && <div className="at-err">{oppErr}</div>}

            {opps.length > 0 && !oppLoading && (
              <>
                <div className="at-tiles">
                  {topOpps.map((o, i) => (
                    <div key={o.id ?? i} className="at-tile"
                      style={{ background: TILE_COLORS[i % TILE_COLORS.length] }}
                      onClick={() => openOpp(o)}>
                      <div className="k">{o.kind}</div>
                      <div className="v">{o.score}</div>
                      <div className="n">{o.name}</div>
                    </div>
                  ))}
                </div>

                <div className="at-card" style={{ marginTop: 14 }}>
                  <div className="at-kicker"><Zap size={13} /> Strongest signal</div>
                  <h3 style={{ marginBottom: 10 }}>{opps[0].name}</h3>
                  <p>{opps[0].why}</p>
                  <div className="at-sec" style={{ margin: "18px 0 5px" }}>Match score</div>
                  <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-.02em" }}>{opps[0].score} / 100 · {opps[0].kind}</div>
                </div>

                <div className="at-sec">All opportunities</div>
                <div className="at-tabs">
                  {["all", "partnership", "grant", "investor"].map((f) => (
                    <button key={f} className={"at-tab" + (oppFilter === f ? " on" : "")} onClick={() => setOppFilter(f)}>
                      {f[0].toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                {opps.filter((o) => oppFilter === "all" || o.kind === oppFilter).map((o, i) => (
                  <div className="at-opp" key={o.id ?? i} onClick={() => openOpp(o)}>
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

                <div className="at-stack">
                  <button className="at-btn at-btn-ghost" onClick={discover}><RefreshCw size={15} />Re-discover</button>
                </div>
              </>
            )}
          </>
        )}

        {/* ---------- LEADS ---------- */}
        {view === "leads" && !activeLead && (
          <>
            <div className="at-eyebrow">Lead list</div>
            <h1 className="at-h1 tight">Your leads</h1>
            <p className="at-sub">Add or paste a list, let Atlas brief each one, then generate a follow-up sequence that actually escalates.</p>

            <div className="at-tiles" style={{ marginBottom: 14 }}>
              <div className="at-tile" style={{ background: "var(--tile-b)", minHeight: 108, cursor: "default" }}>
                <div className="k">Total</div>
                <div className="v">{leads.length}</div>
              </div>
              <div className="at-tile" style={{ background: "var(--tile-g)", minHeight: 108, cursor: "default" }}>
                <div className="k">Contacted</div>
                <div className="v">{leads.filter((l) => l.status !== "new").length}</div>
              </div>
            </div>

            <div className="at-stack" style={{ marginTop: 0, marginBottom: 16 }}>
              <button className="at-btn at-btn-ghost" onClick={() => setShowImport(!showImport)}>
                <Plus size={15} />{showImport ? "Close import" : "Paste a lead list"}
              </button>
            </div>

            {showImport && (
              <div className="at-card">
                <h3>Paste CSV or TSV</h3>
                <p style={{ marginBottom: 12 }}>One lead per line: <code>name, company, role, contact, notes</code>. A header row is detected automatically.</p>
                <textarea className="at-textarea" rows={6} value={importText}
                  placeholder={"Jane Doe, Acme Protocol, Head of BD, jane@acme.xyz, met at ETHDenver\nSam Lee, Northwind, CTO, sam@northwind.io, warm intro from Priya"}
                  onChange={(e) => setImportText(e.target.value)} />
                <button className="at-btn" style={{ marginTop: 12 }} disabled={!importText.trim()} onClick={importLeads}>
                  Import {parseLeads(importText).length || ""} leads
                </button>
              </div>
            )}

            <div className="at-card">
              <h3>Add one manually</h3>
              <div className="at-field" style={{ marginBottom: 10 }}>
                <input className="at-input" placeholder="Name *" value={leadDraft.name}
                  onChange={(e) => setLeadDraft({ ...leadDraft, name: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input className="at-input" placeholder="Company" value={leadDraft.company}
                  onChange={(e) => setLeadDraft({ ...leadDraft, company: e.target.value })} />
                <input className="at-input" placeholder="Role" value={leadDraft.role}
                  onChange={(e) => setLeadDraft({ ...leadDraft, role: e.target.value })} />
              </div>
              <div className="at-field" style={{ marginBottom: 10 }}>
                <input className="at-input" placeholder="Contact (email / handle)" value={leadDraft.contact}
                  onChange={(e) => setLeadDraft({ ...leadDraft, contact: e.target.value })} />
              </div>
              <textarea className="at-textarea" rows={2} placeholder="Brief note — where they came from, what they care about"
                value={leadDraft.notes} onChange={(e) => setLeadDraft({ ...leadDraft, notes: e.target.value })} />
              <button className="at-btn" style={{ marginTop: 12 }} disabled={!leadDraft.name.trim()} onClick={addLead}>
                <Plus size={15} />Add lead
              </button>
            </div>

            {leads.length > 0 && <div className="at-sec">All leads</div>}
            {leads.map((l, i) => (
              <div className="at-opp" key={l.id} onClick={() => setActiveLead(l)}>
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
              <p className="at-note" style={{ marginTop: 8 }}>No leads yet. Paste a list or add one above.</p>
            )}
          </>
        )}

        {/* ---------- LEAD DETAIL ---------- */}
        {view === "leads" && activeLead && (
          <>
            <div className="at-hdr">
              <button className="at-backc" onClick={() => setActiveLead(null)}><ArrowLeft size={17} /></button>
              <div className="at-eyebrow" style={{ margin: 0 }}>Lead</div>
            </div>
            <h1 className="at-h1 tight">{activeLead.name}</h1>
            <p className="at-sub">
              {[activeLead.role, activeLead.company].filter(Boolean).join(" · ") || "No role or company on file"}
              {activeLead.contact ? ` · ${activeLead.contact}` : ""}
            </p>

            <div className="at-sec">Status</div>
            <div className="at-tabs">
              {LEAD_STATUSES.map((s) => (
                <button key={s} className={"at-tab" + (activeLead.status === s ? " on" : "")}
                  onClick={() => setLeadStatus(activeLead, s)}>
                  {s[0].toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {activeLead.brief ? (
              <>
                <div className="at-ring">
                  <Ring value={Math.round(activeLead.brief.priority || 0)} max={100} size={168} />
                  <div className="lbl">Priority</div>
                </div>
                <div className="at-card" style={{ marginTop: 20 }}>
                  <h3>Overview</h3>
                  <p style={{ marginBottom: 14 }}>{activeLead.brief.overview}</p>
                  {activeLead.brief.fit && <div className="at-bullet"><span className="b">→</span><span>{activeLead.brief.fit}</span></div>}
                  {activeLead.brief.angle && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                      <div className="at-sec" style={{ margin: "0 0 6px" }}>Opening angle</div>
                      <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>{activeLead.brief.angle}</div>
                    </div>
                  )}
                  {(activeLead.brief.risks || []).map((r, i) => (
                    <div className="at-bullet" key={i} style={{ marginTop: 10 }}><span className="b">!</span><span>{r}</span></div>
                  ))}
                </div>
              </>
            ) : (
              <div className="at-card">
                <p style={{ marginBottom: 14 }}>{activeLead.notes || "No notes yet."}</p>
                <button className="at-btn" disabled={leadBusy === "brief"} onClick={() => briefLead(activeLead)}>
                  <Sparkles size={15} />{leadBusy === "brief" ? "Briefing…" : "Generate brief"}
                </button>
              </div>
            )}
            {leadBusy === "brief" && <LoadingDots label="Researching this lead" />}

            <div className="at-sec">Follow-up sequence</div>
            {!activeLead.sequence && leadBusy !== "seq" && (
              <div className="at-card">
                <p style={{ marginBottom: 14 }}>A multi-touch cadence that gets shorter each step and always gives them an exit.</p>
                <button className="at-btn" onClick={() => sequenceLead(activeLead)}>
                  <Send size={15} />Generate follow-ups
                </button>
              </div>
            )}
            {leadBusy === "seq" && <LoadingDots label="Writing the follow-up cadence" />}
            {activeLead.sequence && leadBusy !== "seq" && (
              <>
                {(activeLead.sequence.sequence || []).map((s, i) => (
                  <div className="at-msg" key={i}>
                    <div className="ch">Step {s.step} · {s.when} · {s.channel}</div>
                    {s.subject && <div className="sj">{s.subject}</div>}
                    <div className="bd">{s.body}</div>
                    <button className="at-btn at-btn-ghost" style={{ marginTop: 12 }}
                      onClick={() => { navigator.clipboard.writeText((s.subject ? s.subject + "\n\n" : "") + s.body).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                      <Copy size={14} />Copy step {s.step}
                    </button>
                  </div>
                ))}
                {activeLead.sequence.cadence_note && (
                  <div className="at-card">
                    <div className="at-kicker"><Sparkles size={13} /> Cadence logic</div>
                    <p>{activeLead.sequence.cadence_note}</p>
                  </div>
                )}
                <div className="at-stack">
                  <button className="at-btn at-btn-ghost" onClick={() => sequenceLead(activeLead)}>
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
            <div className="at-eyebrow">Ecosystem map</div>
            <h1 className="at-h1 tight">Your relationship graph</h1>
            <p className="at-sub">Every opportunity Atlas scores, positioned around your organization. Distance reflects match strength.</p>

            <div className="at-card" style={{ padding: 18 }}>
              <RelationshipGraph
                center={org.name || "You"}
                nodes={opps.length ? opps : (eco?.seed || [])}
                onSelect={(n) => { if (n.score) openOpp(n); }}
              />
            </div>

            {eco?.live && (
              <div className="at-card">
                <div className="at-kicker"><ShieldCheck size={13} /> Live chain index</div>
                <div className="at-bullet"><span className="b">→</span><span>Block height <strong>{eco.live.blockNumber.toLocaleString()}</strong> on chain ID {eco.live.chainId}{eco.live.chainIdMatches ? " (verified)" : ""}.</span></div>
                <div className="at-bullet"><span className="b">→</span><span>{eco.facts.stack} · gas in {eco.facts.gasToken} · data availability via {eco.facts.dataAvailability}.</span></div>
              </div>
            )}
            {eco && !eco.live && (
              <div className="at-card">
                <div className="at-kicker"><ShieldCheck size={13} /> Chain index</div>
                <p>Live RPC unreachable from this deployment ({eco.liveError}). Showing verified static facts only.</p>
              </div>
            )}

            {eco?.entities?.length > 0 && (
              <div className="at-card">
                <h3>Verified entry points</h3>
                {eco.entities.map((e) => (
                  <div className="at-bullet" key={e.id}>
                    <span className="b">·</span>
                    <span>
                      <strong>{e.name}</strong> — {e.why}
                      {e.url && <> <a href={e.url} target="_blank" rel="noreferrer" style={{ color: "#0F1613" }}>open ↗</a></>}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {eco?.coverage && (
              <div className="at-card">
                <h3>Index coverage</h3>
                {eco.coverage.covered.map((c, i) => (
                  <div className="at-bullet" key={"c" + i}><span className="b">✓</span><span>{c}</span></div>
                ))}
                <h3 style={{ marginTop: 18 }}>Not yet indexed</h3>
                {eco.coverage.notYetCovered.map((c, i) => (
                  <div className="at-bullet" key={"n" + i}><span className="b">–</span><span>{c}</span></div>
                ))}
              </div>
            )}

            <div className="at-card">
              <h3>Expansion targets</h3>
              <p style={{ marginBottom: 12 }}>Architecture supports these; indexers not yet built.</p>
              <div className="at-chips">
                {EXPANSION_CHAINS.map((c) => (
                  <span key={c.key} className="at-chip" style={{ cursor: "default", opacity: .65 }}>{c.name}</span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ---------- WORKSPACE ---------- */}
        {view === "workspace" && active && (
          <>
            <div className="at-hdr">
              <button className="at-backc" onClick={() => setView("opps")}><ArrowLeft size={17} /></button>
              <div className="at-eyebrow" style={{ margin: 0 }}>{active.kind} workspace</div>
            </div>

            <h1 className="at-h1 tight">{active.name}</h1>
            <p className="at-sub">{active.why}</p>

            <div className="at-ring">
              <Ring value={active.score} max={100} size={172} />
              <div className="lbl">Match score</div>
            </div>

            {reportLoading && <LoadingDots label="Researching this opportunity" />}

            {report && !reportLoading && (
              <>
                <div className="at-card" style={{ marginTop: 22 }}>
                  <h3>Why this fits</h3>
                  <p style={{ marginBottom: 16 }}>{report.summary}</p>
                  {(report.fit_points || []).map((p, i) => (
                    <div className="at-bullet" key={i}><span className="b">→</span><span>{p}</span></div>
                  ))}
                  {report.suggested_action && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                      <div className="at-sec" style={{ margin: "0 0 6px" }}>Next action</div>
                      <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>{report.suggested_action}</div>
                    </div>
                  )}
                </div>

                {/* ---- live opportunity scan ---- */}
                <div className="at-sec">What's open right now</div>
                {!scans[active.id] && !scanLoading && (
                  <div className="at-card">
                    <p style={{ marginBottom: 14 }}>
                      Discovery told you <strong>who</strong> to approach. Scan {active.name} to find <strong>what</strong> is actually open there — applications, tracks, and rounds you can act on today.
                    </p>
                    <button className="at-btn" onClick={() => runScan(active)}><Radar size={15} />Scan for live openings</button>
                  </div>
                )}
                {scanLoading && <LoadingDots label={"Scanning " + active.name + " for current openings"} />}
                {scans[active.id] && !scanLoading && (
                  <>
                    <div className="at-card">
                      <div className="at-kicker">
                        <Radar size={13} />
                        {scans[active.id].searchMode === "live" ? "Live scan · verified sources" : "Inferred scan · confirm before acting"}
                      </div>
                      <p>{scans[active.id].summary || scans[active.id].error}</p>
                    </div>
                    {(scans[active.id].openings || []).map((op, i) => (
                      <div className="at-opp" key={i} style={{ cursor: "default" }}>
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
                      <div className="at-card">
                        <div className="at-sec" style={{ margin: "0 0 6px" }}>Best next step</div>
                        <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>{scans[active.id].next_step}</div>
                      </div>
                    )}
                    {(scans[active.id].where_to_check || []).length > 0 && (
                      <div className="at-card">
                        <h3>Where to confirm</h3>
                        {scans[active.id].where_to_check.map((u, i) => (
                          <div className="at-bullet" key={i}>
                            <span className="b">·</span>
                            <a href={u} target="_blank" rel="noreferrer" style={{ color: "#0F1613", wordBreak: "break-all" }}>{u}</a>
                          </div>
                        ))}
                      </div>
                    )}
                    <button className="at-btn at-btn-ghost" onClick={() => runScan(active)} style={{ marginBottom: 4 }}>
                      <RefreshCw size={15} />Re-scan
                    </button>
                  </>
                )}

                <div className="at-sec">Outreach</div>
                <div className="at-chans">
                  {CHANNELS.map((ch) => (
                    <button key={ch} className={"at-chan" + (channel === ch ? " on" : "")}
                      onClick={() => genOutreach(ch)}>{ch}</button>
                  ))}
                </div>

                {outreachLoading && !outreach[channel] && <LoadingDots label={"Writing " + channel + " message"} />}

                {outreach[channel] && (
                  <div className="at-msg">
                    <div className="ch">{channel}</div>
                    {outreach[channel].subject && <div className="sj">{outreach[channel].subject}</div>}
                    <div className="bd">{outreach[channel].body}</div>
                  </div>
                )}

                {logged?.hash && (
                  <div className="at-chain">
                    <div className="k">Partnership logged · status draft</div>
                    <div className="d">Recorded to PartnershipRegistry — visible in your Opportunity Pipeline.</div>
                    <div className="h">{logged.hash.slice(0, 26)}… <ExternalLink size={12} /></div>
                  </div>
                )}

                <div className="at-sec">Pipeline status</div>
                <div className="at-tabs">
                  {PIPELINE_STATUSES.map((s) => (
                    <button key={s}
                      className={"at-tab" + ((pipeline[active.id]?.status || "draft") === s ? " on" : "")}
                      onClick={() => setStatus(active.id, s, active.name)}>
                      {s[0].toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>

                {sendState && !sendState.pending && (
                  <div className={sendState.sent ? "at-card" : "at-err"} style={sendState.sent ? { marginTop: 4 } : {}}>
                    {sendState.sent
                      ? <><div className="at-kicker"><Check size={13} /> Sent</div><p>Delivered via {channel}. Pipeline moved to sent.</p></>
                      : (sendState.reason || sendState.error)}
                  </div>
                )}

                <div className="at-stack">
                  <button className="at-btn at-btn-dark" disabled={logged?.pending} onClick={logToChain}>
                    {logged?.pending ? "Logging…" : logged?.hash ? "Logged on-chain" : "Log to Partnership Registry"}
                  </button>
                  <button className="at-btn" disabled={sendState?.pending} onClick={sendOutreach}>
                    <Send size={15} />{sendState?.pending ? "Sending…" : "Send " + channel}
                  </button>
                  <button className="at-btn at-btn-ghost" onClick={copyMsg}>
                    {copied ? <><Check size={15} />Copied</> : <><Copy size={15} />Copy message</>}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ---------- BOTTOM NAV ---------- */}
        <div className="at-nav">
          {NAV.map((n) => (
            <button key={n.id} className={"at-navit" + (view === n.id ? " on" : "")}
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
