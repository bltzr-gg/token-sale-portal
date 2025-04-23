import { useChainId, useSwitchChain } from "wagmi";
import { RequiresWalletConnection } from "./requires-wallet-connection";
import { Button, cn } from "@bltzr-gg/ui";
import { activeChains } from "src/utils/chain";

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
