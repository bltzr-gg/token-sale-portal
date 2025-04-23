import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

import { PropsWithChildren } from "react";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";

export default function WalletProvider(props: PropsWithChildren) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      {props.children}
    </DynamicContextProvider>
  );
}
