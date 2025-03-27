import { SettledAuctionCard } from "modules/auction/settled-auction-card";
import { AuctionCoreMetrics } from "../auction-core-metrics";
import { UserBidsCardContainer } from "../user-bids";
import { ReferralRewards } from "../referral-rewards";
import { useAccount } from "wagmi";

export function AuctionSettled() {
  const { isConnected } = useAccount();

  return (
    <div className="space-y-8">
      <SettledAuctionCard />
      <AuctionCoreMetrics />
      <UserBidsCardContainer />
      {isConnected && <ReferralRewards />}
    </div>
  );
}
