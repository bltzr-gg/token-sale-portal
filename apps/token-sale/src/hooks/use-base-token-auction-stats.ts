import { useReadContract } from "wagmi";
import { useAuctionSuspense } from "./use-auction";
import { erc20Abi } from "viem";
import { useMemo } from "react";

const useBaseTokenAuctionStats = () => {
  const { data: auction } = useAuctionSuspense();

  const totalSupply = useReadContract({
    abi: erc20Abi,
    address: auction.baseToken.address,
    functionName: "totalSupply",
    chainId: auction.chainId,
  });

  const data = useMemo(
    () =>
      totalSupply.data !== undefined
        ? {
            totalSupply: totalSupply.data,
            auctionSupplyPercentage: Number(
              (auction.initialCapacity * 100n) / totalSupply.data,
            ).toFixed(2),
            minPriceFDV:
              (totalSupply.data * auction.minPrice) /
              10n ** BigInt(auction.baseToken.decimals),
          }
        : undefined,
    [
      auction.baseToken.decimals,
      auction.initialCapacity,
      auction.minPrice,
      totalSupply.data,
    ],
  );

  return {
    ...totalSupply,
    data,
  };
};

export default useBaseTokenAuctionStats;
