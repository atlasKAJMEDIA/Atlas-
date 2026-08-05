/* Robinhood Chain ecosystem index — seed layer.
 *
 * Spec: "Atlas continuously indexes Robinhood Chain ecosystem data including
 * projects, developers, wallets, infrastructure, protocols, DEXs, bridges, AI
 * applications, hackathons, grants, foundation programs, governance,
 * announcements, GitHub activity, and ecosystem partners."
 *
 * This is the first real layer of that: verified facts about the chain plus a
 * curated set of ecosystem entities, so opportunity discovery can be grounded
 * in things that actually exist instead of being invented wholesale by the
 * model. Live chain stats come from the public RPC (see /api/ecosystem).
 *
 * Every entry carries a `source` so nothing here is mistaken for a claim Atlas
 * made up. Entries marked `archetype: true` are category placeholders, not
 * assertions that a specific named org exists.
 */

export const CHAIN_FACTS = {
  name: "Robinhood Chain",
  stack: "Arbitrum Orbit Layer-2 settling to Ethereum",
  dataAvailability: "Ethereum blobs",
  gasToken: "ETH",
  testnetChainId: 46630,
  testnetLaunched: "2026-02-10",
  permissionlessDeployment: true,
  languages: ["Solidity", "Vyper"],
  tooling: ["Foundry", "Hardhat"],
  rpc: "https://rpc.testnet.chain.robinhood.com",
  explorer: "https://explorer.testnet.chain.robinhood.com",
  faucet: "https://faucet.testnet.chain.robinhood.com",
  docs: "https://docs.robinhood.com/chain/connecting",
  deployDocs: "https://docs.robinhood.com/chain/deploy-smart-contracts",
  developerContact: "chain-developers-group@robinhood.com",
  recommendedInfra: "Alchemy",
  source: "docs.robinhood.com + chainid.network, retrieved 2026-08",
};

/* Verified, real entry points a builder can act on today. */
export const REAL_ENTITIES = [
  {
    id: "rh-docs",
    kind: "resource",
    name: "Robinhood Chain developer docs",
    url: CHAIN_FACTS.docs,
    why: "Canonical network config, deployment guides for Foundry and Hardhat.",
    source: "docs.robinhood.com",
  },
  {
    id: "rh-faucet",
    kind: "resource",
    name: "Robinhood Chain testnet faucet",
    url: CHAIN_FACTS.faucet,
    why: "Fund a deployer wallet before shipping contracts to testnet.",
    source: "docs.robinhood.com",
  },
  {
    id: "rh-devgroup",
    kind: "partnership",
    name: "Robinhood Chain developer group",
    url: "mailto:" + CHAIN_FACTS.developerContact,
    why: "Direct line to the chain team — the practical route to ecosystem support and grant questions, since no public grants portal exists yet.",
    source: "docs.robinhood.com",
  },
  {
    id: "rh-explorer",
    kind: "resource",
    name: "Testnet block explorer",
    url: CHAIN_FACTS.explorer,
    why: "Verify deployments and inspect ecosystem contract activity.",
    source: "explorer.testnet.chain.robinhood.com",
  },
  {
    id: "alchemy",
    kind: "partnership",
    name: "Alchemy (infrastructure)",
    url: "https://www.alchemy.com/rpc/robinhood-testnet",
    why: "Recommended RPC/infra provider for Robinhood Chain — a natural first integration partner for anything needing reliable reads.",
    source: "alchemy.com",
  },
];

/* Category archetypes used to round out discovery. Explicitly flagged so the
 * UI and the model never present these as verified named counterparties. */
export const ARCHETYPES = [
  { kind: "partnership", name: "DEX / swap venues on Robinhood Chain", archetype: true, why: "Earliest liquidity surface; integration here compounds as the chain grows." },
  { kind: "partnership", name: "Bridges & cross-chain messaging", archetype: true, why: "TradFi inflows need routes in and out; bridge partners gate that traffic." },
  { kind: "partnership", name: "Custody & wallet providers", archetype: true, why: "Distribution to the TradFi users the chain is designed to onboard." },
  { kind: "partnership", name: "Oracle / price feed providers", archetype: true, why: "Any settlement or trading product needs a trusted price source early." },
  { kind: "grant", name: "Ecosystem hackathon tracks", archetype: true, why: "Cheapest way to generate public proof points and reach the chain team." },
  { kind: "grant", name: "Foundation infrastructure funding", archetype: true, why: "Infra primitives are typically the first funding priority on a new chain." },
  { kind: "investor", name: "TradFi-crossover seed funds", archetype: true, why: "Thesis match for regulated capital moving onchain." },
  { kind: "investor", name: "Angel operators from payments/brokerage", archetype: true, why: "Domain angels de-risk a TradFi go-to-market story." },
];

/* What the dashboard can honestly answer today vs. what needs deeper indexing. */
export const INDEX_COVERAGE = {
  covered: ["Chain configuration & tooling", "Official developer entry points", "Live chain head (via RPC)", "Deployment surface"],
  notYetCovered: ["Per-project deployment feed", "GitHub activity per team", "Grant program calendar", "Governance proposals", "Profile view tracking"],
};

export function seedOpportunities() {
  const real = REAL_ENTITIES.filter((e) => e.kind !== "resource").map((e, i) => ({
    id: "real-" + e.id,
    kind: e.kind,
    name: e.name,
    why: e.why,
    verified: true,
    url: e.url,
    score: 88 - i * 6,
  }));
  const arche = ARCHETYPES.map((a, i) => ({
    id: "arch-" + i,
    kind: a.kind,
    name: a.name,
    why: a.why,
    verified: false,
    score: 78 - i * 4,
  }));
  return [...real, ...arche].sort((a, b) => b.score - a.score);
}
