import { useAuctionSuspense } from "@/hooks/use-auction";
import { axisContracts } from "@axis-finance/deployments";
import React from "react";
import { useReadContract } from "wagmi";

const BID_COUNT = 100n;

export function useBidIndex(bidId: bigint = -1n) {
  const { data: auction } = useAuctionSuspense();
  const address = axisContracts.addresses[auction.chainId].batchCatalogue;
  const abi = axisContracts.abis.batchCatalogue;
  const [startingIndex, setStartingIndex] = React.useState(0n);

  const numBidsQuery = useReadContract({
    address,
    abi,
    functionName: "getNumBids",
    args: [BigInt(auction.lotId)],
  });

  const bidsQuery = useReadContract({
    address,
    abi,
    functionName: "getBidIds",
    args: [BigInt(auction.lotId), startingIndex, BID_COUNT],
    query: {
      enabled: numBidsQuery.isSuccess,
    },
  });

  React.useEffect(() => {
    if (
      bidsQuery.isSuccess &&
      startingIndex + BID_COUNT < (numBidsQuery.data ?? 0n)
    ) {
      // Update query args to trigger a re-read
      setStartingIndex((index) => index + BID_COUNT);
    }
  }, [bidsQuery.isSuccess, numBidsQuery.data, startingIndex]);

  return {
    index: bidsQuery.data?.findIndex((b: bigint) => b === bidId),
    ...bidsQuery,
  };
}
