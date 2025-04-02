import { AUCTION_CHAIN_ID } from "@/app-config";
import { Address, erc20Abi as abi, isAddress } from "viem";
import { useReadContract } from "wagmi";

/** Reads ERC20 details onchain */
export default function useERC20Balance({
  tokenAddress,
  balanceAddress,
}: {
  tokenAddress?: Address;
  balanceAddress?: Address;
}) {
  return useReadContract({
    query: {
      enabled:
        !!tokenAddress &&
        !!balanceAddress &&
        isAddress(tokenAddress) &&
        isAddress(balanceAddress),
    },
    abi,
    address: tokenAddress,
    chainId: AUCTION_CHAIN_ID,
    functionName: "balanceOf",
    args: balanceAddress ? [balanceAddress] : undefined,
  });
}
