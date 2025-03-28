import { hashFn } from "wagmi/query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import WalletProvider from "./wallet-provider";
import { sepolia } from "viem/chains";
import { connectors } from "./wallet-provider";

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

const development = createConfig({
  chains: [sepolia],
  multiInjectedProviderDiscovery: false,
  connectors,
  transports: {
    [sepolia.id]: http(
      `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`,
    ),
  },
});

// const production = createConfig({
//   chains: [mainnet],
//   multiInjectedProviderDiscovery: false,
//   connectors,
//   transports: {
//     [mainnet.id]: http(
//       `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`,
//     ),
//   },
// });

export function BlockchainProvider({
  children,
  disableDevTools,
}: {
  children: React.ReactNode;
  disableDevTools?: boolean;
}) {
  return (
    <WagmiProvider config={development}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>{children}</WalletProvider>
        {!disableDevTools && <ReactQueryDevtools />}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
