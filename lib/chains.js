/* Multi-chain registry.
 *
 * Spec: "Architecture designed to expand from Robinhood Chain to Ethereum,
 * Base, Solana, Avalanche, Arbitrum, Optimism, Polygon, Monad, Sui, Aptos
 * with chain-specific opportunities and analytics."
 *
 * Robinhood Chain is live. The rest are declared but gated behind `enabled`
 * so the UI can show the expansion path without pretending to support it.
 * Flip `enabled` once a chain's indexer + contract deployment exist.
 */

export const CHAINS = {
  robinhoodTestnet: {
    id: 46630,
    idHex: "0xB626",
    key: "robinhoodTestnet",
    name: "Robinhood Chain Testnet",
    short: "Robinhood",
    rpc: "https://rpc.testnet.chain.robinhood.com",
    explorer: "https://explorer.testnet.chain.robinhood.com",
    faucet: "https://faucet.testnet.chain.robinhood.com",
    docs: "https://docs.robinhood.com/chain/connecting",
    currency: { name: "Ether", symbol: "ETH", decimals: 18 },
    testnet: true,
    enabled: true,
    // Robinhood Chain is an Arbitrum Orbit L2 settling to Ethereum, using
    // blobs for data availability and ETH as the native gas token.
    stack: "Arbitrum Orbit L2",
  },
  robinhoodMainnet: {
    id: 4663,
    idHex: "0x1237",
    key: "robinhoodMainnet",
    name: "Robinhood Chain",
    short: "Robinhood",
    rpc: "https://rpc.mainnet.chain.robinhood.com",
    explorer: "https://robinhoodchain.blockscout.com",
    currency: { name: "Ether", symbol: "ETH", decimals: 18 },
    testnet: false,
    enabled: false,
    stack: "Arbitrum Orbit L2",
  },
};

/* Declared expansion targets from the spec. Not yet indexed. */
export const EXPANSION_CHAINS = [
  { key: "ethereum", name: "Ethereum", id: 1 },
  { key: "base", name: "Base", id: 8453 },
  { key: "arbitrum", name: "Arbitrum", id: 42161 },
  { key: "optimism", name: "Optimism", id: 10 },
  { key: "polygon", name: "Polygon", id: 137 },
  { key: "avalanche", name: "Avalanche", id: 43114 },
  { key: "monad", name: "Monad", id: null },
  { key: "solana", name: "Solana", id: null, evm: false },
  { key: "sui", name: "Sui", id: null, evm: false },
  { key: "aptos", name: "Aptos", id: null, evm: false },
];

export const DEFAULT_CHAIN = CHAINS.robinhoodTestnet;

export function chainById(id) {
  return Object.values(CHAINS).find((c) => c.id === Number(id)) || null;
}

export function enabledChains() {
  return Object.values(CHAINS).filter((c) => c.enabled);
}
