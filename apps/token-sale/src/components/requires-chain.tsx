import { useChainId, useSwitchChain } from "wagmi";
import { RequiresWalletConnection } from "./requires-wallet-connection";
import { chains } from "@axis-finance/env";
import { Button, cn } from "@bltzr-gg/ui";
import { environment } from "utils/environment";

const activeChains = chains.activeChains(environment.isTestnet);

export function RequiresChain({
  chainId,
  children,
  buttonClass,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & {
  chainId: number;
  buttonClass?: string;
}) {
  const currentChainId = useChainId();
  const isCorrectChain = currentChainId === chainId;
  const chainName = activeChains.find((c) => c.id === chainId)?.name;
  const { switchChain } = useSwitchChain();

  return (
    <RequiresWalletConnection
      className={props.className}
      buttonClass={buttonClass}
    >
      {isCorrectChain ? (
        <>{children}</>
      ) : (
        <Button
          size="lg"
          className={cn("w-full uppercase", props.className)}
          onClick={() => switchChain({ chainId })}
        >
          Switch to {chainName}
        </Button>
      )}
    </RequiresWalletConnection>
  );
}
