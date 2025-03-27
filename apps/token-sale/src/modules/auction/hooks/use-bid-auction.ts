import React, { useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Address, formatUnits, fromHex, toHex, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import type { GetBatchAuctionLotQuery } from "@axis-finance/subgraph-client";
import { AuctionType } from "@axis-finance/types";
import { useBid } from "@axis-finance/sdk/react";
import { useReferrer } from "state/referral";
import { useStoreBid } from "state/bids/handlers";
import {
  auction as auctionCache,
  optimisticUpdate,
} from "modules/auction/utils/optimistic";
import { getAuctionId } from "../utils/get-auction-id";
import { useAuctionSuspense } from "@/hooks/use-auction";

export const useBidAuction = (
  chainId: string | number,
  lotId: string | number,
  amountIn: bigint,
  amountOut: bigint,
  callbackData: `0x${string}`,
  onSuccess?: () => void,
) => {
  const { data: auction } = useAuctionSuspense();

  const id = getAuctionId(chainId, lotId);

  const storeBidLocally = useStoreBid();

  if (!auction) throw new Error(`Unable to find auction ${id}`);

  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["auction", chainId, lotId], [chainId, lotId]);
  const { address: bidderAddress } = useAccount();
  const referrer = useReferrer();

  const bid = useBid({
    lotId: Number(lotId),
    amountIn,
    amountOut,
    chainId: Number(auction.chainId),
    auctionType: auction.type,
    referrerAddress:
      referrer === zeroAddress ? (auction.seller as Address) : referrer,
    bidderAddress: bidderAddress!,
    signedPermit2Approval: toHex(""), // TODO implement permit2
    callbackData,
  });

  const bidTx = bid.transaction;

  const bidReceipt = bid.receipt;

  // Main action, calls SDK which encrypts the bid and returns contract configuration data
  const handleBid = async () => {
    if (bidderAddress === undefined) {
      throw new Error("Not connected. Try connecting your wallet.");
    }

    bid.submit?.();
  };

  // Store confirmed bids to prevent the React effect running multiple times due to tree rerenders.
  // (bidReceipt.isSuccess will be true until the user dismisses the modal, in that time the react tree can update)
  const confirmedBids = useRef(new Set<string>([]));

  //Ensures the bid tx gets simulated after an approval
  React.useEffect(() => {
    if (bid.simulation.isError) {
      bid.simulation.refetch();
    }
  }, [bid.simulation]);

  React.useEffect(() => {
    if (bidReceipt == null || !bidReceipt.isSuccess) return;

    // Get bid id from transaction logs
    const hexBidId = bidReceipt.data.logs[1].topics[2];
    const bidId = fromHex(hexBidId!, "number").toString();
    const hasAlreadyHandledBid = confirmedBids.current.has(bidId);

    if (hasAlreadyHandledBid) return;
    confirmedBids.current.add(bidId);

    // If this is a blind auction, store the user's unencrypted bid locally
    // so they can view it later
    if (auction.type === AuctionType.SEALED_BID) {
      storeBidLocally({
        auctionId: auction.id,
        address: bidderAddress!,
        bidId,
        amountOut: formatUnits(amountOut, Number(auction.baseToken.decimals)),
      });
    }

    // Cache the bid locally, to prevent subgraph update delays not returning the user's bid
    optimisticUpdate(
      queryClient,
      queryKey,
      (cachedAuction: GetBatchAuctionLotQuery) =>
        auctionCache.insertBid(
          cachedAuction,
          bidId,
          bidderAddress!,
          amountIn,
          amountOut,
        ),
    );

    // Consumer can pass optional callback to be executed after the bid is successful
    onSuccess?.();
  }, [
    amountIn,
    amountOut,
    auction,
    bidReceipt,
    bidderAddress,
    queryClient,
    queryKey,
    storeBidLocally,
    bidTx,
    onSuccess,
  ]);

  return {
    handleBid,
    bidReceipt,
    bidTx,
    isWaiting: bid.isWaiting,
    isSimulationSuccess: bid.simulation.isSuccess,
    receipt: bidReceipt,
    error: bid.error as Error | undefined,
  };
};
