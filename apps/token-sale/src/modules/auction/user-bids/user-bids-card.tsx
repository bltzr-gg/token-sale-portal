import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";

import { Badge, Button, Card, Metric } from "@bltzr-gg/ui";
import { RequiresChain } from "components/requires-chain";
import { TransactionDialog } from "modules/transaction/transaction-dialog";
import { useClaimBids } from "modules/auction/hooks/use-claim-bids";
import { UserBidInfoCard } from "./user-bid-info-card";
import { shorten } from "@/utils/number";
import { useUserBids } from "@/hooks/use-user-bids";
import { useAuctionSuspense } from "@/hooks/use-auction";

export function UserBidsCard() {
  const { data: auction } = useAuctionSuspense();
  const [isTxnDialogOpen, setTxnDialogOpen] = useState(false);
  const claimBidsTxn = useClaimBids();
  const userBids = useUserBids();

  const buttonText =
    userBids.unsuccessfulBids > 0 ? "Claim winnings" : "Claim refund";
  const badgeText = userBids.unsuccessfulBids > 0 ? "You Won!" : "You Lost";
  const badgeColour = userBids.unsuccessfulBids > 0 ? "active" : "alert";

  return (
    <div className="gap-y-md flex flex-col">
      <Card
        title="Claim"
        headerRightElement={<Badge color={badgeColour}>{badgeText}</Badge>}
      >
        <RequiresChain chainId={auction.chainId}>
          <div className="gap-y-md flex flex-col">
            <Metric size="l" label="Your Bid">
              {shorten(userBids.totalAmount)} {auction.quoteToken.symbol}
            </Metric>
            {userBids.unsuccessfulBids > 0 && (
              <Metric size="l" label="Your Refund">
                {shorten(userBids.refundTotal)} {auction.quoteToken.symbol}
              </Metric>
            )}
            <Metric size="l" label="Tokens Won">
              {shorten(userBids.tokensWon)} {auction.baseToken.symbol}
            </Metric>

            {!userBids.hasFullyClaimed && (
              <Button
                size="lg"
                className="w-full"
                onClick={() => setTxnDialogOpen(true)}
              >
                {buttonText}
              </Button>
            )}
            {userBids.hasFullyClaimed && (
              <>
                <p>
                  You&apos;ve claimed all your winnings and/or refunded tokens.
                </p>
                <Link to="/auctions">
                  <Button size="lg" variant="secondary" className="w-full">
                    View live auctions <ArrowRightIcon className="size-6" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </RequiresChain>

        <TransactionDialog
          open={isTxnDialogOpen}
          signatureMutation={claimBidsTxn.claimTx}
          error={claimBidsTxn.claimCall.error || claimBidsTxn.claimTx.error} // Catch both simulation and execution errors
          onConfirm={() => claimBidsTxn.handleClaim.mutateAsync()}
          mutation={claimBidsTxn.claimReceipt}
          chainId={auction.chainId}
          onOpenChange={(open: boolean) => {
            if (!open) {
              claimBidsTxn.claimTx.reset();
            }
            setTxnDialogOpen(open);
          }}
          hash={claimBidsTxn.claimTx.data}
          disabled={claimBidsTxn.isWaiting}
          screens={{
            idle: {
              Component: () => (
                <div className="text-center">
                  You&apos;re about to claim all of your outstanding refunds and
                  payouts for this auction.
                </div>
              ),
              title: `Confirm Claim Bids`,
            },
            success: {
              Component: () => (
                <div className="flex justify-center text-center">
                  <p>Bids claimed successfully!</p>
                </div>
              ),
              title: "Transaction Confirmed",
            },
          }}
        />
      </Card>

      <UserBidInfoCard />
    </div>
  );
}
