import { useState } from "react";
import { useAccount } from "wagmi";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";

import { Badge, Button, Card, Metric } from "@bltzr-gg/ui";
import type { PropsWithAuction } from "@axis-finance/types";
import { RequiresChain } from "components/requires-chain";
import { TransactionDialog } from "modules/transaction/transaction-dialog";
import { useClaimBids } from "modules/auction/hooks/use-claim-bids";
import { UserBidInfoCard } from "./user-bid-info-card";
import { shorten } from "@/utils/number";

export function UserBidsCard({ auction }: PropsWithAuction) {
  const { address } = useAccount();
  const [isTxnDialogOpen, setTxnDialogOpen] = useState(false);
  const claimBidsTxn = useClaimBids();

  const userBids = auction.bids.filter(
    (bid) => bid.bidder.toLowerCase() === address?.toLowerCase(),
  );

  const userTotalSuccessfulBidAmount = userBids.reduce(
    (acc, bid) => acc + Number(bid.settledAmountIn ?? 0),
    0,
  );

  const userHasClaimed = userBids.every(
    (bid) => bid.status === "claimed" || bid.status === "refunded",
  );

  const buttonText =
    userTotalSuccessfulBidAmount > 0 ? "Claim winnings" : "Claim refund";
  const badgeText = userTotalSuccessfulBidAmount > 0 ? "You Won!" : "You Lost";
  const badgeColour = userTotalSuccessfulBidAmount > 0 ? "active" : "alert";

  const userTotalBidAmount = userBids.reduce(
    (acc, bid) => acc + Number(bid.amountIn ?? 0),
    0,
  );

  const userTotalUnsuccessfulBidAmount = userBids.reduce(
    (acc, bid) => acc + Number(bid.settledAmountInRefunded ?? 0),
    0,
  );

  const userTotalTokensWon = auction.bids
    .filter((bid) => bid.bidder.toLowerCase() === address?.toLowerCase())
    .reduce((acc, bid) => acc + Number(bid.settledAmountOut ?? 0), 0);

  return (
    <div className="gap-y-md flex flex-col">
      <Card
        title="Claim"
        headerRightElement={<Badge color={badgeColour}>{badgeText}</Badge>}
      >
        <RequiresChain chainId={auction.chainId}>
          <div className="gap-y-md flex flex-col">
            <Metric size="l" label="You Bid">
              {shorten(userTotalBidAmount)} {auction.quoteToken.symbol}
            </Metric>
            {userTotalUnsuccessfulBidAmount > 0 && (
              <Metric size="l" label="Your Refund">
                {shorten(userTotalUnsuccessfulBidAmount)}{" "}
                {auction.quoteToken.symbol}
              </Metric>
            )}
            <Metric size="l" label="You Get">
              {shorten(userTotalTokensWon)} {auction.baseToken.symbol}
            </Metric>

            {!userHasClaimed && (
              <Button
                size="lg"
                className="w-full"
                onClick={() => setTxnDialogOpen(true)}
              >
                {buttonText}
              </Button>
            )}
            {userHasClaimed && (
              <>
                <p>You&apos;ve claimed all your winnings.</p>
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
          onConfirm={claimBidsTxn.handleClaim}
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

      <UserBidInfoCard auction={auction} />
    </div>
  );
}
