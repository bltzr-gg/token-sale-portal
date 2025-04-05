import { useMemo } from "react";
import {
  useAccount,
  usePublicClient,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useSdk } from "@axis-finance/sdk/react";
import { useAuctionSuspense } from "@/hooks/use-auction";
import { useMutation } from "@tanstack/react-query";
import assert from "assert";
import { decodeEventLog } from "viem";
import { auctionHouse } from "@/constants/contracts";
import { useApolloClient } from "@apollo/client";
import { AuctionBid } from "@/hooks/use-auction/types";

export function useClaimBids() {
  const { data: auction } = useAuctionSuspense();
  const { address: userAddress } = useAccount();
  const sdk = useSdk();

  const bids = useMemo(
    () =>
      auction.bids
        .filter(
          (b) =>
            b.bidder.toLowerCase() === userAddress?.toLowerCase() &&
            b.status !== "claimed" &&
            b.status !== "refunded",
        )
        .map((b) => Number(b.bidId)) ?? [],
    [auction.bids, userAddress],
  );
  const { abi, address, functionName, args } = sdk.claimBids({
    lotId: Number(auction.lotId),
    bids,
    auctionType: auction.type,
    chainId: auction.chainId,
  });

  const claimCall = useSimulateContract({
    abi,
    address,
    functionName,
    args,
    chainId: auction.chainId,
  });

  const claimTx = useWriteContract();
  const claimReceipt = useWaitForTransactionReceipt({ hash: claimTx.data });

  const client = usePublicClient();
  const apollo = useApolloClient();

  const handleClaim = useMutation({
    mutationFn: async () => {
      assert(claimCall.data, "claimCall.data is null");
      if (claimCall.data) {
        const tx = await claimTx.writeContractAsync(claimCall.data.request!);
        const receipt = await client!.waitForTransactionReceipt({ hash: tx });

        for (const log of receipt.logs) {
          const decoded = decodeEventLog({
            abi: auctionHouse.abi,
            data: log.data,
            topics: log.topics,
          });

          switch (decoded.eventName) {
            case "ClaimBid":
              apollo.cache.modify({
                id: apollo.cache.identify({
                  __typename: "BatchAuctionLot",
                  id: auction.id,
                }),
                fields: {
                  bids(existingBids) {
                    const index = existingBids.findIndex(
                      (bid: AuctionBid) =>
                        bid.bidId === decoded.args.bidId.toString(),
                    );

                    if (index === -1) {
                      throw new Error("Bid not found");
                    }

                    return existingBids.map((bid: AuctionBid, i: number) => {
                      if (i === index) {
                        return {
                          ...bid,
                          status: "claimed",
                        };
                      }

                      return bid;
                    });
                  },
                },
              });
              break;
            case "RefundBid":
              apollo.cache.modify({
                id: apollo.cache.identify({
                  __typename: "BatchAuctionLot",
                  id: auction.id,
                }),
                fields: {
                  bids(existingBids) {
                    const index = existingBids.findIndex(
                      (bid: AuctionBid) =>
                        bid.bidId === decoded.args.bidId.toString(),
                    );

                    if (index === -1) {
                      throw new Error("Bid not found");
                    }

                    return existingBids.map((bid: AuctionBid, i: number) => {
                      if (i === index) {
                        return {
                          ...bid,
                          status: "refunded",
                        };
                      }

                      return bid;
                    });
                  },
                },
              });
              break;
          }
        }
      }
    },
  });

  const isWaiting =
    claimTx.isPending ||
    claimReceipt.isLoading ||
    claimCall.isPending ||
    claimCall.isLoading;

  const error = [claimReceipt, claimTx, claimCall].find(
    (m) => m.isError,
  )?.error;

  return {
    handleClaim,
    claimCall: claimCall as ReturnType<typeof useSimulateContract>,
    claimReceipt,
    claimTx,
    isWaiting,
    error: error as Error | undefined,
  };
}
