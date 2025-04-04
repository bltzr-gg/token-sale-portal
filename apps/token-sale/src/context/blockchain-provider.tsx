import { hashFn } from "wagmi/query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import WalletProvider from "./wallet-provider";
import * as chains from "viem/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  rainbowWallet,
  frameWallet,
  walletConnectWallet,
  metaMaskWallet,
  phantomWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { chain } from "@/app-config";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

const connectors = connectorsForWallets(
  [
    {
      groupName: "Supported Wallets",
      wallets: [
        metaMaskWallet,
        phantomWallet,
        rainbowWallet,
        injectedWallet,
        frameWallet,
        walletConnectWallet,
      ],
    },
  ],
  { projectId, appName: "$REAL Public Token Sale" },
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /*
        TanStack Query can't handle bigint queryKey data type by default.
        Wagmi hashFn handles bigints for this purpose.
      */
      queryKeyHashFn: hashFn,
      refetchOnWindowFocus: false,
    },
  },
});

const config = createConfig({
  chains: [chain],
  multiInjectedProviderDiscovery: false,
  connectors,
  transports: {
    [chains.mainnet.id]: http(
      `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`,
    ),
    [chains.sepolia.id]: http(
      `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`,
    ),
  },
});

export function BlockchainProvider({
  children,
  disableDevTools,
}: {
  children: React.ReactNode;
  disableDevTools?: boolean;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>{children}</WalletProvider>
        {!disableDevTools && <ReactQueryDevtools />}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
