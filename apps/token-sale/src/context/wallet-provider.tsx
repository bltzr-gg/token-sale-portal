import "@rainbow-me/rainbowkit/styles.css";

import { PropsWithChildren } from "react";
import {
  RainbowKitProvider,
  connectorsForWallets,
  midnightTheme,
} from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  rainbowWallet,
  frameWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { APP_NAME } from "../../../../app-config";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export const connectors = connectorsForWallets(
  [
    {
      groupName: "Common",
      wallets: [
        injectedWallet,
        rainbowWallet,
        frameWallet,
        walletConnectWallet,
      ],
    },
  ],
  { projectId, appName: APP_NAME },
);

export default function WalletProvider(props: PropsWithChildren) {
  return (
    <RainbowKitProvider
      appInfo={{
        appName: APP_NAME,
        learnMoreUrl: "https://docs.axis.finance",
      }}
      theme={midnightTheme()}
      modalSize="compact"
    >
      {props.children}
    </RainbowKitProvider>
  );
}
