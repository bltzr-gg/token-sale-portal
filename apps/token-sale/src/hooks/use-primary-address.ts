import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Address } from "viem";

const usePrimaryAddress = () => {
  const { primaryWallet } = useDynamicContext();

  return primaryWallet?.address as Address | undefined;
};

export default usePrimaryAddress;
