/* Contract address map + ABIs for real on-chain writes.
 *
 * Addresses come from env vars populated after running
 * `forge script script/DeployAll.s.sol` (see scaffold/README.md).
 *
 * `isLive()` is the switch the UI uses: when addresses are present the app
 * performs real transactions; when they're absent it falls back to the
 * simulated writes so the demo still runs end to end. This means deploying
 * contracts requires zero code changes — only env vars.
 */

export const CONTRACTS = {
  project:      process.env.NEXT_PUBLIC_PROJECT_REGISTRY || "",
  org:          process.env.NEXT_PUBLIC_ORG_REGISTRY || "",
  partnership:  process.env.NEXT_PUBLIC_PARTNERSHIP_REGISTRY || "",
  grant:        process.env.NEXT_PUBLIC_GRANT_REGISTRY || "",
  investor:     process.env.NEXT_PUBLIC_INVESTOR_REGISTRY || "",
  reputation:   process.env.NEXT_PUBLIC_REPUTATION_REGISTRY || "",
  proposal:     process.env.NEXT_PUBLIC_PROPOSAL_REGISTRY || "",
  identity:     process.env.NEXT_PUBLIC_IDENTITY_REGISTRY || "",
  notification: process.env.NEXT_PUBLIC_NOTIFICATION_REGISTRY || "",
  activity:     process.env.NEXT_PUBLIC_ACTIVITY_REGISTRY || "",
};

export function isLive(which) {
  const a = CONTRACTS[which];
  return typeof a === "string" && /^0x[0-9a-fA-F]{40}$/.test(a);
}

/* Minimal ABI fragments — only the functions the app calls. */
export const ABI = {
  project: [
    {
      type: "function",
      name: "register",
      stateMutability: "nonpayable",
      inputs: [
        { name: "name", type: "string" },
        { name: "category", type: "string" },
        { name: "metadataURI", type: "string" },
      ],
      outputs: [{ name: "id", type: "uint256" }],
    },
    {
      type: "function",
      name: "ownerToProject",
      stateMutability: "view",
      inputs: [{ name: "", type: "address" }],
      outputs: [{ name: "", type: "uint256" }],
    },
  ],
  partnership: [
    {
      type: "function",
      name: "log",
      stateMutability: "nonpayable",
      inputs: [
        { name: "fromOrg", type: "uint256" },
        { name: "counterparty", type: "string" },
        { name: "note", type: "string" },
      ],
      outputs: [{ name: "id", type: "uint256" }],
    },
    {
      type: "function",
      name: "setStatus",
      stateMutability: "nonpayable",
      inputs: [
        { name: "id", type: "uint256" },
        { name: "status", type: "uint8" },
      ],
      outputs: [],
    },
  ],
  activity: [
    {
      type: "function",
      name: "log",
      stateMutability: "nonpayable",
      inputs: [
        { name: "orgId", type: "uint256" },
        { name: "kind", type: "string" },
        { name: "subject", type: "string" },
        { name: "metaURI", type: "string" },
      ],
      outputs: [{ name: "id", type: "uint256" }],
    },
  ],
};

/* Encode a call with the browser wallet directly (no wagmi dependency needed).
 * Kept deliberately small: the app only performs a handful of writes, and this
 * avoids pulling in a full web3 stack for them. */
export async function sendTx({ ethereum, from, to, data, chainIdHex }) {
  if (!ethereum) throw new Error("No injected wallet available.");
  const current = await ethereum.request({ method: "eth_chainId" });
  if (chainIdHex && current !== chainIdHex) {
    await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chainIdHex }] });
  }
  return ethereum.request({
    method: "eth_sendTransaction",
    params: [{ from, to, data }],
  });
}
