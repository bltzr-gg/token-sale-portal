import { useAccount } from "wagmi";
import ConnectButton from "./connect-button";
import { cn } from "@bltzr-gg/ui";

/** Renders a Connect Button if no connection detected, renders children otherwise */
export function RequiresWalletConnection(
  props: React.HTMLAttributes<HTMLDivElement> & {
    rootClassName?: string;
    buttonClass?: string;
  },
) {
  const account = useAccount();

  return account.isConnected ? (
    <>{props.children}</>
  ) : (
    <ConnectButton
      className={cn(props.className, props.buttonClass)}
      size="lg"
    />
  );
}
