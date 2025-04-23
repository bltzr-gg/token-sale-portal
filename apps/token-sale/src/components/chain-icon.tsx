import { Avatar } from "@bltzr-gg/ui";
import Eth from "src/assets/icons/chains/ethereum.svg";

import { activeChains } from "src/utils/chain";

type ChainIconProps = {
  chainId: number;
};

export function ChainIcon(props: ChainIconProps) {
  const chain = activeChains.find((c) => c.id === props.chainId);

  return (
    <Avatar alt={chain?.name + " Logo"}>
      <Eth />
    </Avatar>
  );
}
