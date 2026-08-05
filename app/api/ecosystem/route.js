/* Live ecosystem index endpoint.
 *
 * Reads the public Robinhood Chain RPC for real chain state (no credentials
 * required — the RPC is public) and merges it with the curated seed index.
 * If the RPC is unreachable, the seed layer still returns so the UI degrades
 * to "verified facts only" rather than failing.
 */

import { CHAIN_FACTS, REAL_ENTITIES, ARCHETYPES, INDEX_COVERAGE, seedOpportunities } from "../../../lib/ecosystem";

export const runtime = "nodejs";
export const revalidate = 60;

async function rpc(method, params = []) {
  const res = await fetch(CHAIN_FACTS.rpc, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(6000),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

export async function GET() {
  let live = null;
  let liveError = null;

  try {
    const [blockHex, chainIdHex, gasHex] = await Promise.all([
      rpc("eth_blockNumber"),
      rpc("eth_chainId"),
      rpc("eth_gasPrice").catch(() => null),
    ]);
    live = {
      blockNumber: parseInt(blockHex, 16),
      chainId: parseInt(chainIdHex, 16),
      gasPriceWei: gasHex ? parseInt(gasHex, 16) : null,
      chainIdMatches: parseInt(chainIdHex, 16) === CHAIN_FACTS.testnetChainId,
      at: new Date().toISOString(),
    };
  } catch (e) {
    liveError = e.message || "RPC unreachable";
  }

  return Response.json({
    facts: CHAIN_FACTS,
    live,
    liveError,
    entities: REAL_ENTITIES,
    archetypes: ARCHETYPES,
    coverage: INDEX_COVERAGE,
    seed: seedOpportunities(),
  });
}
