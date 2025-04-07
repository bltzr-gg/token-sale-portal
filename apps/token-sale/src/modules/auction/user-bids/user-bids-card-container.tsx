import { useAccount } from "wagmi";
import { AuctionDerivativeTypes } from "@axis-finance/types";
import { NotConnectedClaimCard } from "./not-connected";
import { VestingCard } from "./vesting-card";
import { hasDerivative } from "../utils/auction-details";
import { NoUserBidsCard } from "./no-user-bids-card";
import { UserBidsCard } from "./user-bids-card";
import { useAuctionSuspense } from "@/hooks/use-auction";
import { useUserBids } from "@/hooks/use-user-bids";

type CardStatus =
  | "NOT_CONNECTED"
  | "AUCTION_FAILED"
  | "USER_HAS_NO_BIDS"
  | "USER_HAS_BIDS"
  | "AUCTION_VESTING"
  | "ERROR";

const useCardStatus = (): CardStatus => {
  const { isConnected: isWalletConnected } = useAccount();
  const { data: auction } = useAuctionSuspense();
  const { bids } = useUserBids();
  const auctionIsVesting = hasDerivative(
    AuctionDerivativeTypes.LINEAR_VESTING,
    auction,
  );

  if (!isWalletConnected) {
    return "NOT_CONNECTED";
  }

  if (!auction.settled || auction.status === "cancelled") {
    return "AUCTION_FAILED";
  }

  if (auctionIsVesting) {
    return "AUCTION_VESTING";
  }

  if (bids.length > 0) {
    return "USER_HAS_BIDS";
  }

  if (bids.length === 0) {
    return "USER_HAS_NO_BIDS";
  }

  return "ERROR";
};

export function UserBidsCardContainer() {
  const status = useCardStatus();

  switch (status) {
    case "NOT_CONNECTED": {
      return <NotConnectedClaimCard />;
    }

    case "AUCTION_FAILED": {
      return null;
    }

    case "AUCTION_VESTING": {
      return <VestingCard />;
    }

    case "USER_HAS_BIDS": {
      return <UserBidsCard />;
    }

    case "USER_HAS_NO_BIDS": {
      return <NoUserBidsCard />;
    }

    case "ERROR": {
      return null;
    }

    default: {
      return null;
    }
  }
}
