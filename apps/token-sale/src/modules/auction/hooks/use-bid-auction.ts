import React, { useCallback } from "react";
import { formatUnits, toHex, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { useBid } from "@axis-finance/sdk/react";
import { useReferrer } from "state/referral";
import { useAuctionSuspense } from "@/hooks/use-auction";
import { useAllowance } from "@/loaders/use-allowance";
import { auctionHouse } from "@/constants/contracts";
import { useApolloClient } from "@apollo/client";
import { BatchAuctionBid } from "@axis-finance/types";

let id = 0;

export const useBidAuction = (
  lotId: string | number,
  amountIn: bigint,
  amountOut: bigint,
  callbackData: `0x${string}`,
  onSuccess?: () => void,
) => {
  const apollo = useApolloClient();
  const { data: auction } = useAuctionSuspense();
  const { address: bidderAddress } = useAccount();
  const referrer = useReferrer();

  const allowance = useAllowance({
    ownerAddress: bidderAddress,
    spenderAddress: auctionHouse.address,
    tokenAddress: auction.quoteToken.address,
    decimals: Number(auction.quoteToken.decimals),
    chainId: auction.chainId,
    amount: amountIn,
  });

  const bid = useBid({
    lotId: Number(lotId),
    amountIn,
    amountOut,
    chainId: Number(auction.chainId),
    auctionType: auction.type,
    referrerAddress: referrer === zeroAddress ? auction.seller : referrer,
    bidderAddress: bidderAddress!,
    signedPermit2Approval: toHex(""), // TODO implement permit2
    callbackData,
  });

  const handleBid = useCallback(async () => {
    if (bidderAddress === undefined) {
      throw new Error("Not connected. Try connecting your wallet.");
    }

    if (!allowance.isSufficientAllowance) {
      await allowance.execute();
    }

    bid.submit?.();
  }, [allowance, bid, bidderAddress]);

  React.useEffect(() => {
    if (bid.receipt == null || !bid.receipt.isSuccess) return;

    const currentBid: BatchAuctionBid = {
      status: "pending",
      bidId: `optimistic-${id++}`,
      date: (new Date().getTime() / 1000).toString(),
      bidder: bidderAddress as `0x${string}`,
      blockTimestamp: (new Date().getTime() / 1000).toString(),
      amountIn: formatUnits(amountIn, auction.quoteToken.decimals),
      rawAmountIn: amountIn.toString(),
      rawAmountOut: null,
      rawMarginalPrice: null,
      rawSubmittedPrice: null,
      submittedPrice: null,
      settledAmountIn: null,
      settledAmountInRefunded: null,
      settledAmountOut: null,
      outcome: null,
      referrer: null,
    };

    // optimistically update the bids
    apollo.cache.modify({
      id: apollo.cache.identify({
        __typename: "BatchAuctionLot",
        id: auction.id,
      }),
      fields: {
        bids(existingBids) {
          return [...existingBids, currentBid];
        },
      },
    });

    onSuccess?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bid.receipt, onSuccess]);

  return {
    handleBid,
    bidReceipt: bid.receipt,
    bidTx: bid.transaction,
    isWaiting: bid.isWaiting,
    simulation: bid.simulation,
    receipt: bid.receipt,
    error: bid.error as Error | undefined,
    allowance,
  };
};
