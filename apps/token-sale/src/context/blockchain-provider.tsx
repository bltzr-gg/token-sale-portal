import { hashFn } from "wagmi/query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import WalletProvider from "./wallet-provider";
import * as chains from "viem/chains";
import { chain } from "@/app-config";

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
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <WagmiProvider config={config}>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
          {!disableDevTools && <ReactQueryDevtools />}
        </WagmiProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}
