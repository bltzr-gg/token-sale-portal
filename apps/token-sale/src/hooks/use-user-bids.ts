import { useAccount } from "wagmi";
import { useAuctionSuspense } from "./use-auction";
import { useMemo } from "react";
import { BID_OUTCOME } from "@/modules/auction/hooks/use-sorted-bids";

const useUserBids = () => {
  const { address } = useAccount();
  const { data: auction } = useAuctionSuspense();

  const bids = useMemo(
    () =>
      auction.bids.filter(
        (bid) => bid.bidder.toLowerCase() === address?.toLowerCase(),
      ),
    [auction.bids, address],
  );

  const totalAmount = bids.reduce(
    (acc, bid) => acc + Number(bid.amountIn ?? 0),
    0,
  );

  const hasFullyClaimed = useMemo(
    () =>
      bids.every(
        (bid) => bid.status === "refunded" || bid.status === "claimed",
      ),
    [bids],
  );

  const refundTotal = useMemo(
    () =>
      bids.reduce(
        (acc, bid) => acc + Number(bid.settledAmountInRefunded ?? 0),
        0,
      ),
    [bids],
  );

  const unsuccessfulBids = useMemo(
    () => bids.filter((bid) => bid.outcome === BID_OUTCOME.LOST, 0).length,
    [bids],
  );

  const tokensWon = useMemo(
    () => bids.reduce((acc, bid) => acc + Number(bid.settledAmountOut ?? 0), 0),
    [bids],
  );

  return {
    bids,
    totalAmount,
    hasFullyClaimed,
    refundTotal,
    unsuccessfulBids,
    tokensWon,
  };
};

export { useUserBids };
