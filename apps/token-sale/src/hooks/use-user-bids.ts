import { useAccount } from "wagmi";
import { useAuctionSuspense } from "./use-auction";
import { useMemo } from "react";

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

  const claimedFullRefund = useMemo(
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

  return {
    bids,
    totalAmount,
    claimedFullRefund,
    refundTotal,
  };
};

export { useUserBids };
