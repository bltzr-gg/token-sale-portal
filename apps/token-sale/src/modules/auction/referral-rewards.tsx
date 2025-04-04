import { useState } from "react";
import { Button, Card, Metric } from "@bltzr-gg/ui";
import { useReferralRewards } from "./hooks/use-referral-rewards";
import { RequiresChain } from "components/requires-chain";
import { ClaimReferralRewardsTxn } from "./claim-referral-rewards-txn";
import { useAuctionSuspense } from "@/hooks/use-auction";

export function ReferralRewards() {
  const { data: auction } = useAuctionSuspense();
  const [isTxnDialogOpen, setIsTxnDialogOpen] = useState(false);

  const rewards = useReferralRewards();

  const hasRewards = rewards != null && rewards > 0;

  return (
    <Card title="Referral">
      <div className="gap-y-md flex flex-col">
        <div className="bg-light-tertiary p-sm rounded">
          <Metric size="l" label="Claimable rewards">
            {rewards} {auction.quoteToken.symbol}
          </Metric>
        </div>

        {!hasRewards && (
          <p className="mt-5">
            You can claim your referral rewards as soon as the users you&apos;ve
            referred have successfully claimed their bids.
          </p>
        )}

        <RequiresChain chainId={auction.chainId}>
          <Button
            disabled={!hasRewards}
            className="mt-8 w-full"
            onClick={() => setIsTxnDialogOpen(true)}
          >
            {hasRewards ? "Claim rewards" : "No rewards to claim"}
          </Button>
        </RequiresChain>
      </div>

      {isTxnDialogOpen && (
        <ClaimReferralRewardsTxn onClose={() => setIsTxnDialogOpen(false)} />
      )}
    </Card>
  );
}
