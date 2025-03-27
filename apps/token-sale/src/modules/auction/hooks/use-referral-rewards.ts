import { formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { useAuctionSuspense } from "@/hooks/use-auction";
import { auctionHouse } from "@/constants/contracts";

export function useReferralRewards(): number | undefined {
  const { data: auction } = useAuctionSuspense();
  const { address } = useAccount();

  const rewardsBigInt = useReadContract({
    abi: auctionHouse.abi,
    address: auctionHouse.address,
    chainId: auction.chainId,
    functionName: "getRewards",
    args: [address!, auction.quoteToken.address],
    query: { enabled: address != null },
  });

  const rewards = rewardsBigInt.isSuccess
    ? Number(formatUnits(rewardsBigInt.data, auction.baseToken.decimals))
    : undefined;

  return rewards;
}
