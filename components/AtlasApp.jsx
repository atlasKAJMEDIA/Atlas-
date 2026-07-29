"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Wallet, LayoutDashboard, Building2, Radar, Network, GitBranch,
  ArrowLeft, ArrowRight, RefreshCw, Copy, Check, Sparkles, ExternalLink,
} from "lucide-react";

/* ============================================================
   ATLAS — AI Business Development OS for Robinhood Chain
   "Discover Partners. Find Grants. Raise Capital. Grow Faster."

   DESIGN TOKENS  (premium, minimal — Robinhood-native)
   bg:        #FFFFFF        card:      #F8F8F8
   border:    #EAEAEA        text-1:    #0E0F12
   text-2:    #6B7280        text-3:    #9CA3AF
   accent:    #00C264  (Robinhood-native green — single attention color)
   accent-hi: #E9FBF1  (accent wash)
   radius:    18px cards / 10px controls
   NOTE: accent is one token (--acc). Swap to #FA4616 to revert to orange.
   ============================================================ */

const CSS = `
  .at { --acc:#00C264; --acc-hi:#E9FBF1; min-height:100vh; background:#FFFFFF; color:#0E0F12;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif; display:flex; }
  .at * { box-sizing:border-box; }

  .at-side { width:236px; flex-shrink:0; background:#FAFAFA; border-right:1px solid #EAEAEA;
    padding:26px 16px; display:flex; flex-direction:column; gap:24px; position:sticky; top:0; height:100vh; }
  .at-logo { display:flex; align-items:center; gap:9px; padding:0 8px; font-size:16px; font-weight:700; letter-spacing:-0.02em; }
  .at-logo .mark { width:22px; height:22px; border-radius:6px; background:var(--acc); display:flex; align-items:center; justify-content:center; }
  .at-nav { display:flex; flex-direction:column; gap:2px; }
  .at-navitem { display:flex; align-items:center; gap:11px; padding:10px 12px; border-radius:10px; font-size:14px;
    color:#6B7280; cursor:pointer; transition:background .15s,color .15s; background:none; border:none; width:100%; text-align:left; }
  .at-navitem:hover { background:#F1F1F1; }
  .at-navitem.active { background:var(--acc-hi); color:#0E0F12; font-weight:600; }
  .at-navitem:disabled { opacity:.4; cursor:not-allowed; }
  .at-side-foot { margin-top:auto; }
  .at-wallet-chip { background:#FFFFFF; border:1px solid #EAEAEA; border-radius:12px; padding:11px 13px; font-size:12.5px; }
  .at-wallet-chip .addr { font-family:ui-monospace,monospace; font-weight:600; color:#0E0F12; }
  .at-wallet-chip .net { color:#6B7280; margin-top:3px; display:flex; align-items:center; gap:6px; }
  .at-live { width:7px; height:7px; border-radius:50%; background:var(--acc); box-shadow:0 0 0 3px var(--acc-hi); }

  .at-main { flex:1; min-width:0; padding:40px 40px 100px; max-width:780px; }
  .at-right { width:288px; flex-shrink:0; padding:40px 26px; border-left:1px solid #EAEAEA; display:flex; flex-direction:column; gap:16px; }
  @media (max-width:1080px){ .at-right{ display:none; } }
  @media (max-width:780px){ .at-side{ display:none; } .at-main{ padding:26px 20px 80px; } }

  .at-hero { font-size:33px; line-height:1.18; font-weight:700; letter-spacing:-0.02em; margin:0 0 12px; max-width:600px; }
  .at-sub { color:#6B7280; font-size:16px; line-height:1.6; max-width:540px; margin-bottom:34px; }
  .at-eyebrow { font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--acc); margin-bottom:14px; }

  .at-field { margin-bottom:24px; }
  .at-label { font-size:13px; font-weight:600; margin-bottom:8px; display:block; }
  .at-input, .at-textarea { width:100%; background:#FFFFFF; border:1px solid #EAEAEA; border-radius:10px;
    padding:12px 14px; font-size:14.5px; font-family:inherit; color:#0E0F12; resize:vertical; transition:border-color .15s; }
  .at-input:focus, .at-textarea:focus { outline:none; border-color:var(--acc); }

  .at-chip-row { display:flex; flex-wrap:wrap; gap:8px; }
  .at-chip { border:1px solid #EAEAEA; background:#FFFFFF; padding:9px 15px; border-radius:100px; font-size:13.5px;
    font-weight:500; cursor:pointer; transition:all .15s; }
  .at-chip:hover { border-color:#0E0F12; }
  .at-chip.on { background:var(--acc); border-color:var(--acc); color:#FFFFFF; }

  .at-btn { background:var(--acc); color:#FFFFFF; border:none; padding:13px 24px; border-radius:10px; font-size:14.5px;
    font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:8px; transition:opacity .15s,transform .15s; }
  .at-btn:hover { opacity:.92; transform:scale(1.01); }
  .at-btn:disabled { background:#EAEAEA; color:#9CA3AF; cursor:not-allowed; transform:none; }
  .at-btn-ghost { background:#FFFFFF; border:1px solid #EAEAEA; color:#0E0F12; padding:12px 20px; border-radius:10px;
    font-size:14px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:8px; transition:border-color .15s; }
  .at-btn-ghost:hover { border-color:#0E0F12; }
  .at-btn-sm { padding:8px 14px; font-size:13px; }
  .at-actions { display:flex; gap:12px; margin-top:8px; flex-wrap:wrap; }

  .at-card { background:#F8F8F8; border:1px solid #EAEAEA; border-radius:18px; padding:22px 24px; margin-bottom:14px;
    box-shadow:0 2px 8px rgba(0,0,0,.05); }
  .at-card h3 { font-weight:700; font-size:15.5px; margin:0 0 12px; letter-spacing:-0.01em; }
  .at-bullet { display:flex; gap:11px; font-size:14.5px; line-height:1.6; margin-bottom:9px; }
  .at-bullet .n { color:var(--acc); font-weight:700; font-size:12.5px; padding-top:2px; width:20px; flex-shrink:0; }

  /* opportunity cards */
  .at-opp { display:flex; gap:16px; align-items:flex-start; border:1px solid #EAEAEA; border-radius:16px;
    padding:18px 20px; margin-bottom:12px; cursor:pointer; background:#FFFFFF; transition:border-color .15s,box-shadow .15s; }
  .at-opp:hover { border-color:var(--acc); box-shadow:0 2px 12px rgba(0,194,100,.08); }
  .at-score { flex-shrink:0; width:56px; height:56px; border-radius:14px; background:var(--acc-hi); color:#049a4f;
    display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:700; }
  .at-score .v { font-size:19px; line-height:1; }
  .at-score .l { font-size:9px; letter-spacing:0.06em; text-transform:uppercase; margin-top:2px; }
  .at-opp-body { flex:1; min-width:0; }
  .at-opp-kind { font-size:11px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#9CA3AF; margin-bottom:4px; }
  .at-opp-name { font-weight:700; font-size:15.5px; margin-bottom:5px; letter-spacing:-0.01em; }
  .at-opp-why { font-size:13.5px; color:#6B7280; line-height:1.55; }

  .at-tabs { display:flex; gap:6px; margin-bottom:20px; }
  .at-tab { padding:8px 14px; border-radius:100px; font-size:13px; font-weight:500; cursor:pointer; border:1px solid #EAEAEA; background:#FFFFFF; }
  .at-tab.on { background:#0E0F12; color:#FFFFFF; border-color:#0E0F12; }

  .at-channel-row { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:16px; }
  .at-channel { padding:8px 14px; border-radius:10px; font-size:13px; font-weight:500; cursor:pointer;
    border:1px solid #EAEAEA; background:#FFFFFF; }
  .at-channel.on { background:var(--acc-hi); border-color:var(--acc); color:#049a4f; }

  .at-msg { background:#F8F8F8; border:1px solid #EAEAEA; border-radius:16px; padding:20px 22px; margin-bottom:14px; }
  .at-msg .ch { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--acc); margin-bottom:9px; }
  .at-msg .subj { font-weight:700; font-size:14.5px; margin-bottom:9px; }
  .at-msg .body { font-size:14px; line-height:1.65; color:#333; white-space:pre-wrap; }

  .at-onchain { background:#0E0F12; color:#F8F8F8; border-radius:16px; padding:18px 20px; margin-top:8px; }
  .at-onchain .t { font-size:12px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:#9CA3AF; margin-bottom:8px; }
  .at-onchain .hash { font-family:ui-monospace,monospace; font-size:12.5px; color:var(--acc); word-break:break-all; margin-top:8px; display:flex; align-items:center; gap:6px; }

  .at-back { background:none; border:none; color:#6B7280; font-size:13.5px; cursor:pointer; margin-bottom:20px; padding:0; display:flex; align-items:center; gap:6px; }
  .at-back:hover { color:#0E0F12; }
  .at-loading { display:flex; align-items:center; gap:10px; color:#6B7280; font-size:13.5px; margin-bottom:16px; }
  .at-dot { width:6px; height:6px; border-radius:50%; background:var(--acc); animation:atp 1.1s infinite ease-in-out; }
  .at-dot:nth-child(2){animation-delay:.15s} .at-dot:nth-child(3){animation-delay:.3s}
  @keyframes atp { 0%,80%,100%{opacity:.25} 40%{opacity:1} }
  .at-err { color:#D64545; font-size:13.5px; margin-top:10px; }

  .at-widget { background:#F8F8F8; border:1px solid #EAEAEA; border-radius:16px; padding:16px 18px; }
  .at-widget .wt { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#9CA3AF; margin-bottom:10px; }
  .at-widget .wb { font-size:13.5px; line-height:1.55; }
  .at-widget .muted { color:#9CA3AF; }
  .at-rep { display:flex; align-items:baseline; gap:6px; }
  .at-rep .big { font-size:26px; font-weight:700; letter-spacing:-0.02em; }
  .at-rep .max { font-size:13px; color:#9CA3AF; }

  .at-connect { min-height:100vh; display:flex; align-items:center; justify-content:center; width:100%; padding:40px; }
  .at-connect-inner { max-width:440px; text-align:center; }
  .at-connect .mark-lg { width:56px; height:56px; border-radius:16px; background:var(--acc); margin:0 auto 22px;
    display:flex; align-items:center; justify-content:center; }
  .at-connect h1 { font-size:30px; font-weight:700; letter-spacing:-0.02em; margin:0 0 10px; }
  .at-connect p { color:#6B7280; font-size:15.5px; line-height:1.6; margin:0 0 28px; }
  .at-wallet-opts { display:flex; flex-direction:column; gap:8px; margin-bottom:18px; }
  .at-wallet-opt { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border:1px solid #EAEAEA;
    border-radius:12px; background:#FFFFFF; cursor:pointer; font-size:14.5px; font-weight:500; transition:border-color .15s; }
  .at-wallet-opt:hover { border-color:var(--acc); }
  .at-note { font-size:12px; color:#9CA3AF; line-height:1.5; }
`;

/* --- Robinhood Chain config (from project spec) --- */
const RH_CHAIN = {
  chainIdHex: "0xB626", // 46630
  chainId: 46630,
  name: "Robinhood Chain Testnet",
  rpc: "https://rpc.testnet.chain.robinhood.com",
  explorer: "https://explorer.testnet.chain.robinhood.com",
  currency: "ETH",
};

/* --- Claude API helper ---
   Calls our own /api/claude route instead of api.anthropic.com directly.
   The Anthropic API key lives server-side only (see app/api/claude/route.js) —
   never expose it in client code. */
async function callClaude({ system, user, tools }) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, user, tools }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API " + res.status);
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
}
function parseJsonLoose(text) {
  const c = text.replace(/```json/g, "").replace(/```/g, "").trim();
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
  return <div className="at-loading"><span className="at-dot" /><span className="at-dot" /><span className="at-dot" /><span>{label}</span></div>;
}

const CATEGORIES = ["DeFi Protocol", "Consumer App", "AI Application", "Infrastructure", "Wallet / Trading", "Stablecoin / Payments"];
const CHANNELS = ["Email", "Telegram", "Discord", "Farcaster", "X", "LinkedIn"];

export default function App() {
  const [wallet, setWallet] = useState(null); // {address, simulated}
  const [view, setView] = useState("dashboard"); // dashboard | org | intel | opps | workspace
  const [connecting, setConnecting] = useState(false);

  // org profile
  const [org, setOrg] = useState({ name: "", category: "", website: "", desc: "" });
  const [orgRegistered, setOrgRegistered] = useState(false);
  const [orgTx, setOrgTx] = useState(null);

  // intel
  const [intel, setIntel] = useState(null);
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelErr, setIntelErr] = useState("");

  // opportunities
  const [opps, setOpps] = useState([]);
  const [oppLoading, setOppLoading] = useState(false);
  const [oppErr, setOppErr] = useState("");
  const [oppFilter, setOppFilter] = useState("all");

  // workspace
  const [active, setActive] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [channel, setChannel] = useState("Email");
  const [outreach, setOutreach] = useState({});
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [logged, setLogged] = useState(null);
  const [copied, setCopied] = useState(false);

  const shortAddr = wallet ? wallet.address.slice(0, 6) + "…" + wallet.address.slice(-4) : "";

  /* ---------- wallet ---------- */
  const connect = async (simulate) => {
    setConnecting(true);
    try {
      if (!simulate && typeof window !== "undefined" && window.ethereum) {
        const accts = await window.ethereum.request({ method: "eth_requestAccounts" });
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: RH_CHAIN.chainIdHex, chainName: RH_CHAIN.name,
              rpcUrls: [RH_CHAIN.rpc], nativeCurrency: { name: "Ether", symbol: RH_CHAIN.currency, decimals: 18 },
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

  /* ---------- register org (on-chain, simulated in preview) ---------- */
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
        '{"position":"2-3 sentences on where this project sits in the ecosystem","strengths":["...","..."],"gaps":["...","..."],"ecosystem_moves":["one timely move","another"],"funding_readiness":"one line assessment"}';
      const user = `Project: ${org.name} (${org.category}). ${org.website ? "Site: " + org.website + ". " : ""}What they're building: ${org.desc}`;
      const text = await callClaude({ system, user, tools: [{ type: "web_search_20250305", name: "web_search" }] });
      setIntel(parseJsonLoose(text));
    } catch (e) {
      setIntelErr("Intelligence run failed (" + e.message + "). Try again.");
    } finally {
      setIntelLoading(false);
    }
  }, [org]);

  /* ---------- opportunity discovery ---------- */
  const discover = useCallback(async () => {
    setOppLoading(true); setOppErr("");
    try {
      const system =
        "You are Atlas's opportunity discovery engine for Robinhood Chain. Given a project, surface concrete BD opportunities: partnerships, grants, and investors it should pursue. For a testnet ecosystem, generate realistic, plausible opportunity types (protocols to integrate with, grant programs, VC/angel profiles) — clearly archetypal, not fabricated specific claims. Respond ONLY with valid JSON, no fences: " +
        '{"opportunities":[{"id":"1","kind":"partnership","name":"...","score":0-100,"why":"one sentence reason grounded in the project"},{"id":"2","kind":"grant","name":"...","score":0-100,"why":"..."},{"id":"3","kind":"investor","name":"...","score":0-100,"why":"..."}]}. Return 6 total, mixed kinds, scores varied and realistic.';
      const user = `Project: ${org.name} (${org.category}). Building: ${org.desc}. ${intel ? "Ecosystem position: " + intel.position : ""}`;
      const text = await callClaude({ system, user });
      const parsed = parseJsonLoose(text);
      setOpps((parsed.opportunities || []).sort((a, b) => b.score - a.score));
    } catch (e) {
      setOppErr("Discovery failed (" + e.message + "). Try again.");
    } finally {
      setOppLoading(false);
    }
  }, [org, intel]);

  const openOpp = (o) => {
    setActive(o); setReport(null); setOutreach({}); setLogged(null); setChannel("Email");
    setView("workspace");
    genReport(o);
  };

  const genReport = async (o) => {
    setReportLoading(true);
    try {
      const system =
        "You are Atlas's AI research agent. Produce a tight executive brief on why this opportunity fits the project and how to approach it. Respond ONLY with valid JSON, no fences: " +
        '{"summary":"2-3 sentences","fit_points":["...","...","..."],"suggested_action":"one concrete next step"}';
      const user = `Our project: ${org.name} (${org.category}), building ${org.desc}.\nOpportunity: ${o.kind} — ${o.name}. Score ${o.score}. Reason: ${o.why}`;
      const text = await callClaude({ system, user });
      setReport(parseJsonLoose(text));
    } catch (e) {
      setReport({ summary: "Could not generate report.", fit_points: [], suggested_action: "" });
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
      const text = await callClaude({ system, user });
      const parsed = parseJsonLoose(text);
      setOutreach((prev) => ({ ...prev, [ch]: parsed }));
    } catch (e) {
      setOutreach((prev) => ({ ...prev, [ch]: { subject: "", body: "Generation failed — try again." } }));
    } finally {
      setOutreachLoading(false);
    }
  };
  useEffect(() => { if (active && !outreach["Email"]) genOutreach("Email"); /* eslint-disable-next-line */ }, [active]);

  const logToChain = () => {
    setLogged({ pending: true });
    setTimeout(() => setLogged({ pending: false, hash: fakeHash() }), 1300);
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
        <div className="at-connect">
          <div className="at-connect-inner">
            <div className="mark-lg"><Network size={26} color="#fff" /></div>
            <h1>Atlas</h1>
            <p>The AI Business Development OS for Robinhood Chain. Discover partners, find grants, raise capital — grow faster.</p>
            <div className="at-wallet-opts">
              {["MetaMask", "WalletConnect", "Coinbase Wallet", "Robinhood Wallet"].map((w) => (
                <button key={w} className="at-wallet-opt" onClick={() => connect(false)} disabled={connecting}>
                  <span>{w}</span><Wallet size={17} color="#9CA3AF" />
                </button>
              ))}
            </div>
            <p className="at-note">
              {connecting ? "Requesting connection…" : "Connects on Robinhood Chain Testnet (Chain ID 46630). No injected wallet in this preview? A simulated testnet wallet is used so you can explore the flow."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ================= APP SHELL ================= */
  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, on: true },
    { id: "org", label: "Organization", icon: Building2, on: true },
    { id: "intel", label: "Intelligence", icon: Sparkles, on: orgRegistered },
    { id: "opps", label: "Opportunities", icon: Radar, on: orgRegistered },
    { id: "workspace", label: "Pipeline", icon: GitBranch, on: !!active },
  ];

  return (
    <div className="at">
      <style>{CSS}</style>

      <div className="at-side">
        <div className="at-logo"><span className="mark"><Network size={14} color="#fff" /></span>Atlas</div>
        <div className="at-nav">
          {NAV.map((n) => (
            <button key={n.id} className={"at-navitem" + (view === n.id ? " active" : "")} disabled={!n.on} onClick={() => setView(n.id)}>
              <n.icon size={16} /><span>{n.label}</span>
            </button>
          ))}
        </div>
        <div className="at-side-foot">
          <div className="at-wallet-chip">
            <div className="addr">{shortAddr}</div>
            <div className="net"><span className="at-live" />{wallet.simulated ? "Testnet (simulated)" : "Robinhood Testnet"}</div>
          </div>
        </div>
      </div>

      <div className="at-main">
        {/* ---------- DASHBOARD ---------- */}
        {view === "dashboard" && (
          <>
            <div className="at-eyebrow">Robinhood Chain · BD Operating System</div>
            <h1 className="at-hero">Who should you work with next — and why?</h1>
            <p className="at-sub">Atlas indexes the ecosystem, scores opportunities, and explains every recommendation. Start by registering your organization on-chain.</p>

            {!orgRegistered ? (
              <div className="at-card">
                <h3>Get started</h3>
                <div className="at-bullet"><span className="n">01</span><span>Register your organization — mints your on-chain identity.</span></div>
                <div className="at-bullet"><span className="n">02</span><span>Run ecosystem intelligence to map your position.</span></div>
                <div className="at-bullet"><span className="n">03</span><span>Discover scored partnership, grant & investor opportunities.</span></div>
                <div className="at-actions" style={{ marginTop: 16 }}>
                  <button className="at-btn" onClick={() => setView("org")}>Set up organization<ArrowRight size={15} /></button>
                </div>
              </div>
            ) : (
              <>
                <div className="at-card">
                  <h3>Today's signal</h3>
                  <div className="at-bullet"><span className="n">→</span><span>{opps.length ? `${opps.length} opportunities discovered — top score ${opps[0].score}/100 (${opps[0].name}).` : "Run discovery to surface today's opportunities."}</span></div>
                  <div className="at-bullet"><span className="n">→</span><span>{intel ? intel.funding_readiness : "Ecosystem intelligence not run yet."}</span></div>
                  <div className="at-actions" style={{ marginTop: 14 }}>
                    <button className="at-btn" onClick={() => setView("opps")}>View opportunities<ArrowRight size={15} /></button>
                    <button className="at-btn-ghost" onClick={() => setView("intel")}>Intelligence</button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ---------- ORGANIZATION ---------- */}
        {view === "org" && (
          <>
            <div className="at-eyebrow">Organization Profile</div>
            <h1 className="at-hero">Tell Atlas about your project.</h1>
            <p className="at-sub">This becomes your on-chain identity — every opportunity Atlas scores is relative to it.</p>

            <div className="at-field">
              <label className="at-label">Project name</label>
              <input className="at-input" value={org.name} placeholder="e.g. Meridian Protocol" onChange={(e) => setOrg({ ...org, name: e.target.value })} />
            </div>
            <div className="at-field">
              <label className="at-label">Category</label>
              <div className="at-chip-row">
                {CATEGORIES.map((c) => (
                  <button key={c} className={"at-chip" + (org.category === c ? " on" : "")} onClick={() => setOrg({ ...org, category: c })}>{c}</button>
                ))}
              </div>
            </div>
            <div className="at-field">
              <label className="at-label">Website / docs (optional)</label>
              <input className="at-input" value={org.website} placeholder="https://" onChange={(e) => setOrg({ ...org, website: e.target.value })} />
            </div>
            <div className="at-field">
              <label className="at-label">What you're building</label>
              <textarea className="at-textarea" rows={5} value={org.desc} placeholder="What the product does, who it's for, what you need next (partners, grants, capital)..." onChange={(e) => setOrg({ ...org, desc: e.target.value })} />
            </div>

            {orgRegistered && orgTx?.hash && (
              <div className="at-onchain">
                <div className="t">On-chain identity minted</div>
                <div style={{ fontSize: 13.5 }}>Registered to ProjectRegistry — you now have an Organization ID.</div>
                <div className="hash">{orgTx.hash.slice(0, 22)}… <ExternalLink size={12} /></div>
              </div>
            )}

            <div className="at-actions" style={{ marginTop: 18 }}>
              {!orgRegistered ? (
                <button className="at-btn" disabled={!org.name || !org.category || !org.desc || orgTx?.pending} onClick={registerOrg}>
                  {orgTx?.pending ? "Writing to chain…" : "Register on-chain"}<ArrowRight size={15} />
                </button>
              ) : (
                <button className="at-btn" onClick={() => { setView("intel"); if (!intel) runIntel(); }}>Run intelligence<ArrowRight size={15} /></button>
              )}
            </div>
          </>
        )}

        {/* ---------- INTELLIGENCE ---------- */}
        {view === "intel" && (
          <>
            <button className="at-back" onClick={() => setView("org")}><ArrowLeft size={14} />Organization</button>
            <div className="at-eyebrow">AI Ecosystem Intelligence</div>
            <h1 className="at-hero">{org.name || "Your project"} — ecosystem position.</h1>
            {!intel && !intelLoading && (
              <div className="at-actions"><button className="at-btn" onClick={runIntel}><Sparkles size={15} />Run intelligence</button></div>
            )}
            {intelLoading && <LoadingDots label="Indexing ecosystem & analyzing position…" />}
            {intelErr && <div className="at-err">{intelErr}</div>}
            {intel && !intelLoading && (
              <>
                <div className="at-card">
                  <h3>Position</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.65, margin: 0, color: "#333" }}>{intel.position}</p>
                </div>
                <div className="at-card">
                  <h3>Strengths</h3>
                  {(intel.strengths || []).map((s, i) => <div className="at-bullet" key={i}><span className="n">+</span><span>{s}</span></div>)}
                  <h3 style={{ marginTop: 16 }}>Gaps</h3>
                  {(intel.gaps || []).map((s, i) => <div className="at-bullet" key={i}><span className="n">–</span><span>{s}</span></div>)}
                </div>
                <div className="at-card">
                  <h3>Timely moves</h3>
                  {(intel.ecosystem_moves || []).map((s, i) => <div className="at-bullet" key={i}><span className="n">→</span><span>{s}</span></div>)}
                </div>
                <div className="at-actions">
                  <button className="at-btn-ghost" onClick={runIntel}><RefreshCw size={14} />Re-run</button>
                  <button className="at-btn" onClick={() => { setView("opps"); if (!opps.length) discover(); }}>Discover opportunities<ArrowRight size={15} /></button>
                </div>
              </>
            )}
          </>
        )}

        {/* ---------- OPPORTUNITIES ---------- */}
        {view === "opps" && (
          <>
            <button className="at-back" onClick={() => setView("intel")}><ArrowLeft size={14} />Intelligence</button>
            <div className="at-eyebrow">Opportunity Discovery</div>
            <h1 className="at-hero">Opportunities, not contacts.</h1>
            <p className="at-sub">Scored and explained. Partnerships, grants, and investors worth pursuing right now.</p>

            {!opps.length && !oppLoading && (
              <div className="at-actions"><button className="at-btn" onClick={discover}><Radar size={15} />Discover opportunities</button></div>
            )}
            {oppLoading && <LoadingDots label="Scanning ecosystem for opportunities…" />}
            {oppErr && <div className="at-err">{oppErr}</div>}

            {opps.length > 0 && !oppLoading && (
              <>
                <div className="at-tabs">
                  {["all", "partnership", "grant", "investor"].map((f) => (
                    <button key={f} className={"at-tab" + (oppFilter === f ? " on" : "")} onClick={() => setOppFilter(f)}>
                      {f[0].toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
                {opps.filter((o) => oppFilter === "all" || o.kind === oppFilter).map((o) => (
                  <div className="at-opp" key={o.id} onClick={() => openOpp(o)}>
                    <div className="at-score"><span className="v">{o.score}</span><span className="l">score</span></div>
                    <div className="at-opp-body">
                      <div className="at-opp-kind">{o.kind}</div>
                      <div className="at-opp-name">{o.name}</div>
                      <div className="at-opp-why">{o.why}</div>
                    </div>
                  </div>
                ))}
                <div className="at-actions" style={{ marginTop: 8 }}>
                  <button className="at-btn-ghost" onClick={discover}><RefreshCw size={14} />Re-discover</button>
                </div>
              </>
            )}
          </>
        )}

        {/* ---------- WORKSPACE ---------- */}
        {view === "workspace" && active && (
          <>
            <button className="at-back" onClick={() => setView("opps")}><ArrowLeft size={14} />Opportunities</button>
            <div className="at-eyebrow">{active.kind} · Partnership Workspace</div>
            <h1 className="at-hero">{active.name}</h1>
            <p className="at-sub">{active.why}</p>

            {reportLoading && <LoadingDots label="Researching this opportunity…" />}
            {report && !reportLoading && (
              <>
                <div className="at-card">
                  <h3>Why this fits — score {active.score}/100</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.65, margin: "0 0 14px", color: "#333" }}>{report.summary}</p>
                  {(report.fit_points || []).map((p, i) => <div className="at-bullet" key={i}><span className="n">→</span><span>{p}</span></div>)}
                  {report.suggested_action && <p style={{ fontSize: 14, marginTop: 12, color: "#049a4f", fontWeight: 600 }}>Next: {report.suggested_action}</p>}
                </div>

                <h3 style={{ fontSize: 15.5, fontWeight: 700, margin: "24px 0 12px" }}>Outreach</h3>
                <div className="at-channel-row">
                  {CHANNELS.map((ch) => (
                    <button key={ch} className={"at-channel" + (channel === ch ? " on" : "")} onClick={() => genOutreach(ch)}>{ch}</button>
                  ))}
                </div>
                {outreachLoading && !outreach[channel] && <LoadingDots label={"Writing " + channel + " message…"} />}
                {outreach[channel] && (
                  <div className="at-msg">
                    <div className="ch">{channel}</div>
                    {outreach[channel].subject && <div className="subj">{outreach[channel].subject}</div>}
                    <div className="body">{outreach[channel].body}</div>
                  </div>
                )}
                <div className="at-actions">
                  <button className="at-btn-ghost at-btn-sm" onClick={copyMsg}>{copied ? <><Check size={14} />Copied</> : <><Copy size={14} />Copy</>}</button>
                  <button className="at-btn at-btn-sm" disabled={logged?.pending} onClick={logToChain}>
                    {logged?.pending ? "Logging…" : logged?.hash ? "Logged on-chain" : "Log to Partnership Registry"}
                  </button>
                </div>
                {logged?.hash && (
                  <div className="at-onchain">
                    <div className="t">Partnership logged · status: draft</div>
                    <div style={{ fontSize: 13.5 }}>Recorded to PartnershipRegistry — visible in your Opportunity Pipeline.</div>
                    <div className="hash">{logged.hash.slice(0, 24)}… <ExternalLink size={12} /></div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ---------- RIGHT PANEL ---------- */}
      <div className="at-right">
        <div className="at-widget">
          <div className="wt">On-chain identity</div>
          <div className="wb">
            <div className="addr" style={{ fontFamily: "ui-monospace,monospace", fontWeight: 600 }}>{shortAddr}</div>
            <div className="muted" style={{ marginTop: 4 }}>{orgRegistered ? org.name + " · Org registered" : "Org not registered"}</div>
          </div>
        </div>
        <div className="at-widget">
          <div className="wt">Reputation</div>
          <div className="at-rep"><span className="big">{orgRegistered ? (intel ? 42 : 12) + opps.length * 3 : 0}</span><span className="max">/ 1000</span></div>
          <div className="wb muted" style={{ marginTop: 6 }}>Grows with integrations, grants & governance.</div>
        </div>
        <div className="at-widget">
          <div className="wt">Network</div>
          <div className="wb"><div style={{ display: "flex", alignItems: "center", gap: 7 }}><span className="at-live" />Robinhood Chain Testnet</div><div className="muted" style={{ marginTop: 4 }}>Chain ID 46630</div></div>
        </div>
        {opps.length > 0 && (
          <div className="at-widget">
            <div className="wt">Pipeline</div>
            <div className="wb">{opps.length} opportunities · top {opps[0].score}/100</div>
          </div>
        )}
      </div>
    </div>
  );
}
