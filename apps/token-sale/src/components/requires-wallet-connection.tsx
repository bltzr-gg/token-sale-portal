import { useAccount } from "wagmi";
import ConnectButton from "./connect-button";

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
      buttonClass={props.buttonClass}
      className={props.className}
      size="lg"
    />
  );
}
