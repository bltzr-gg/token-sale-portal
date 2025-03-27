import { TooltipProvider } from "@bltzr-gg/ui";
import { ToggleProvider } from "modules/auction/hooks/use-toggle";
import { BlockchainProvider } from "./blockchain-provider";
import { OriginSdkProvider } from "@axis-finance/sdk/react";
import { createSdk } from "@axis-finance/sdk";
import { getCloakServer, getCuratorServer } from "@axis-finance/env";
import { DialogProvider } from "./dialog-provider";
import { environment } from "utils/environment";
import ObserverProvider from "./observer";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { SUBGRAPH_URL } from "../../../../app-config";

const client = new ApolloClient({
  uri: SUBGRAPH_URL,
  cache: new InMemoryCache(),
});

const sdk = createSdk({
  environment: environment.current,
  cloak: {
    url: getCloakServer(environment.current).url,
  },
  curator: {
    url: getCuratorServer(environment.current).url,
  },
});

type ProviderProps = React.PropsWithChildren<{
  disableDialogProvider?: boolean;
}>;

export function Providers(props: ProviderProps) {
  return (
    <ApolloProvider client={client}>
      <ToggleProvider initialToggle={true}>
        <BlockchainProvider
          disableDevTools={
            import.meta.env.VITE_DISABLE_REACT_QUERY_DEV_TOOLS === "true"
          }
        >
          <OriginSdkProvider sdk={sdk}>
            <TooltipProvider delayDuration={350}>
              <DialogProvider disabled={props.disableDialogProvider}>
                <ObserverProvider>{props.children}</ObserverProvider>
              </DialogProvider>
            </TooltipProvider>
          </OriginSdkProvider>
        </BlockchainProvider>
      </ToggleProvider>
    </ApolloProvider>
  );
}
