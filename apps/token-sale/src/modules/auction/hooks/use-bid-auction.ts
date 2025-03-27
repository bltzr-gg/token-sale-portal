import React from "react";
import { toHex, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { useBid } from "@axis-finance/sdk/react";
import { useReferrer } from "state/referral";
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

  if (!auction) throw new Error(`Unable to find auction ${id}`);
  const { address: bidderAddress } = useAccount();
  const referrer = useReferrer();

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

  const bidTx = bid.transaction;

  const bidReceipt = bid.receipt;

  const handleBid = async () => {
    if (bidderAddress === undefined) {
      throw new Error("Not connected. Try connecting your wallet.");
    }

    bid.submit?.();
  };

  React.useEffect(() => {
    if (bid.simulation.isError) {
      bid.simulation.refetch();
    }
  }, [bid.simulation]);

  React.useEffect(() => {
    if (bidReceipt == null || !bidReceipt.isSuccess) return;

    // Consumer can pass optional callback to be executed after the bid is successful
    onSuccess?.();
  }, [bidReceipt, onSuccess]);

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
