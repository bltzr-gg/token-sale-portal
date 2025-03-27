import { type PropsWithAuction } from "@axis-finance/types";
import { SettledAuctionCard } from "modules/auction/settled-auction-card";
import { AuctionCoreMetrics } from "../auction-core-metrics";
import { UserBidsCardContainer } from "../user-bids";
import { ReferralRewards } from "../referral-rewards";
import { useAccount } from "wagmi";

export function AuctionSettled({ auction }: PropsWithAuction) {
  const { isConnected } = useAccount();

  return (
    <div className="space-y-8">
      <SettledAuctionCard auction={auction} />
      <AuctionCoreMetrics auction={auction} />
      <UserBidsCardContainer auction={auction} />
      {isConnected && <ReferralRewards auction={auction} />}
    </div>
  );
}
