// wagmi config — wire this into your Next.js app's provider
import { createConfig, http } from "wagmi";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { robinhoodTestnet } from "./robinhoodChain";

export const wagmiConfig = createConfig({
  chains: [robinhoodTestnet],
  connectors: [
    injected(),
    coinbaseWallet({ appName: "Helix" }),
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID as string }),
  ],
  transports: {
    [robinhoodTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
  ssr: true,
});

// Contract addresses (populated from .env.local after deployment)
export const CONTRACTS = {
  project:     process.env.NEXT_PUBLIC_PROJECT_REGISTRY as `0x${string}`,
  org:         process.env.NEXT_PUBLIC_ORG_REGISTRY as `0x${string}`,
  partnership: process.env.NEXT_PUBLIC_PARTNERSHIP_REGISTRY as `0x${string}`,
  grant:       process.env.NEXT_PUBLIC_GRANT_REGISTRY as `0x${string}`,
  investor:    process.env.NEXT_PUBLIC_INVESTOR_REGISTRY as `0x${string}`,
  reputation:  process.env.NEXT_PUBLIC_REPUTATION_REGISTRY as `0x${string}`,
};
