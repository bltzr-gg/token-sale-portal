import React, { useCallback } from "react";
import { toHex, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { useBid } from "@axis-finance/sdk/react";
import { useReferrer } from "state/referral";
import { useAuctionSuspense } from "@/hooks/use-auction";
import { useAllowance } from "@/loaders/use-allowance";
import { auctionHouse } from "@/constants/contracts";

export const useBidAuction = (
  lotId: string | number,
  amountIn: bigint,
  amountOut: bigint,
  callbackData: `0x${string}`,
  onSuccess?: () => void,
) => {
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

    // Consumer can pass optional callback to be executed after the bid is successful
    onSuccess?.();
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
