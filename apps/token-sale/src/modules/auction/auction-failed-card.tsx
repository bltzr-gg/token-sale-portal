import { useMemo, useState } from "react";

import { Badge, Button, Card, Metric, Text } from "@bltzr-gg/ui";
import { useAuctionSuspense, type Auction } from "@/hooks/use-auction";
import { RequiresChain } from "components/requires-chain";
import { TransactionDialog } from "modules/transaction/transaction-dialog";
import { shorten } from "utils/number";
import { useClaimBids } from "modules/auction/hooks/use-claim-bids";
import { useUserBids } from "@/hooks/use-user-bids";

const getFailReason = (auction: Auction) => {
  // Auction was cancelled by the auction creator
  if (auction.status === "cancelled") {
    return "The auction was cancelled by the creator";
  }

  // Auction was aborted by someone
  if (auction.status === "aborted") {
    return "The auction was aborted";
  }

  // The raised amount was below the minimum fill
  if (Number(auction.sold) < auction.minFilled) {
    return "The auction did not raise the minimum amount";
  }

  // Unknown reason. RFC: should this condition ever trigger? I don't think it should.
  return "The auction did not settle successfully so there is nothing to claim";
};

const screens = {
  idle: {
    Component: () => (
      <div className="text-center">
        You&apos;re about to claim all of your outstanding refunds for this
        auction.
      </div>
    ),
    title: `Confirm refund`,
  },
  success: {
    Component: () => (
      <div className="flex justify-center text-center">
        <p>Bids refunded successfully!</p>
      </div>
    ),
    title: "Transaction Confirmed",
  },
};

export function AuctionFailedCard() {
  const { data: auction } = useAuctionSuspense();
  const [isTxnDialogOpen, setTxnDialogOpen] = useState(false);
  const claimBidsTxn = useClaimBids();
  const {
    totalAmount,
    hasFullyClaimed: claimedFullRefund,
    refundTotal,
  } = useUserBids();
  const failReason = useMemo(() => getFailReason(auction), [auction]);

  return (
    <Card
      title="Claim"
      headerRightElement={<Badge color="alert">Auction Failed</Badge>}
    >
      <RequiresChain chainId={auction.chainId}>
        <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-8">
          <Metric size="l" label="Your Bid">
            {shorten(totalAmount)} {auction.quoteToken.symbol}
          </Metric>

          {refundTotal > 0 && (
            <Metric size="l" label="Your Refund Amount">
              {shorten(refundTotal)} {auction.quoteToken.symbol}
            </Metric>
          )}

          <Metric size="l" label="Claim Amount">
            0 {auction.baseToken.symbol}
          </Metric>
        </div>

        <Text className="my-5 text-center text-red-500">{failReason}</Text>
        {!claimedFullRefund && (
          <Button
            size="lg"
            className="w-full"
            onClick={() => setTxnDialogOpen(true)}
          >
            Claim refund
          </Button>
        )}
      </RequiresChain>

      <TransactionDialog
        open={isTxnDialogOpen}
        signatureMutation={claimBidsTxn.claimTx}
        error={claimBidsTxn.error}
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
        screens={screens}
      />
    </Card>
  );
}
