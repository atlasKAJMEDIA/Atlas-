# Atlas — Robinhood Chain scaffold

On-chain backend + config for Atlas, the BD Operating System for Robinhood Chain.
The front-end (`atlas_app.jsx`) is the product UI; this folder is what makes it real.

## What's here
- `contracts/AtlasRegistries.sol` — 6 core registries (Project, Organization, Partnership, Grant, Investor, Reputation). Self-contained, no external deps — builds with plain Foundry.
- `script/DeployAll.s.sol` — deploys all six and prints their addresses.
- `foundry.toml` — Robinhood testnet/mainnet RPC + explorer config.
- `.env.local.example` — environment template for the Next.js app.
- `lib/robinhoodChain.ts` — viem chain definition (Chain ID 46630).
- `lib/wagmi.ts` — wagmi config + connectors + contract address map.

## 1. Build & deploy the contracts
```bash
# from this folder, as a Foundry project
forge install foundry-rs/forge-std        # provides forge-std/Script.sol
forge build

export PRIVATE_KEY=0xYOUR_TESTNET_KEY
forge script script/DeployAll.s.sol:DeployAll \
  --rpc-url robinhood_testnet \
  --private-key $PRIVATE_KEY \
  --broadcast -vvvv
```
Copy the six printed addresses.

## 2. Wire the front-end
```bash
cp .env.local.example .env.local
# paste the deployed addresses + your WalletConnect project id into .env.local
```
Then in your Next.js app, wrap the tree in WagmiProvider using `wagmiConfig` from `lib/wagmi.ts`,
and replace the simulated wallet + simulated tx calls in `atlas_app.jsx` with real wagmi hooks
(`useAccount`, `useWriteContract`) pointed at `CONTRACTS.*`.

## Sanity checks (cast)
```bash
cast chain-id       --rpc-url https://rpc.testnet.chain.robinhood.com   # -> 46630
cast block-number   --rpc-url https://rpc.testnet.chain.robinhood.com
cast balance YOUR_WALLET --rpc-url https://rpc.testnet.chain.robinhood.com --ether
```

## Notes
- Deploy your own contracts with your own wallet. Store private keys securely.
- Don't hardcode addresses before deployment — fill `.env.local` after.
- `Reputation.add` and `Organization.setMember` are permissive for hackathon speed; gate them behind an authorized scorer / role check before mainnet.
- To make Organization identity a real NFT, swap `ProjectRegistry` to inherit OpenZeppelin `ERC721` and mint on `register()`.
