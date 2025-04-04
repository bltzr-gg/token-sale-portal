import { useState } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { Button, Card, Metric, Progress } from "@bltzr-gg/ui";
import { formatDate } from "utils/date";
import { RequiresChain } from "components/requires-chain";
import { trimCurrency } from "utils/currency";
import { useVestingTokenId } from "modules/auction/hooks/use-vesting-tokenid";
import { useVestingRedeemable } from "modules/auction/hooks/use-vesting-redeemable";
import { useDerivativeModule } from "modules/auction/hooks/use-derivative-module";
import { ClaimVestingDervivativeTxn } from "./claim-vesting-derivative-txn";
import { RedeemVestedTokensTxn } from "./redeem-vested-tokens-txn";
import { shorten } from "@/utils/number";
import { useAuctionSuspense } from "@/hooks/use-auction";

const calculateVestingProgress = (
  auctionEnd?: number,
  vestingStart?: number,
  vestingEnd?: number,
): number => {
  if (vestingStart == null || vestingEnd == null) {
    return 0;
  }

  // If the difference between start and end is less than 1 minute,
  // we only care about how soon the vesting starts, not the duration
  if (!!auctionEnd && vestingEnd - vestingStart < 60) {
    const now = Date.now() / 1000;
    const auctionEndSeconds = auctionEnd / 1000;

    const total = vestingStart - auctionEndSeconds;
    const elapsed = now - auctionEndSeconds;
    return Math.min(100, (elapsed / total) * 100);
  }

  // Return the percentage of time elapsed between the start and end, expressed as 0-100
  const now = Date.now() / 1000;
  const elapsed = now - vestingStart;
  const total = vestingEnd - vestingStart;

  return Math.min(100, (elapsed / total) * 100);
};

const calculateVestingTerm = (start?: number, end?: number): string => {
  if (start == null || end == null) {
    return "0";
  }

  // If less than 1 minute, return "instant"
  if (end - start < 60) {
    return "Instant";
  }

  const termDays = (end - start) / 60 / 60 / 24;

  // If less than a day, return hours
  if (termDays < 1) {
    return `${Math.floor(termDays * 24)}H`;
  }

  // If less than a month, return days
  if (termDays < 31) {
    return `${Math.floor(termDays)}D`;
  }

  // Return months
  return `${Math.floor(termDays / 30)}M`;
};

export function VestingCard() {
  const { data: auction, refetch } = useAuctionSuspense();
  const { address } = useAccount();
  const [isTxnDialogOpen, setIsTxnDialogOpen] = useState(false);

  const { data: vestingModuleAddress } = useDerivativeModule({
    lotId: auction.lotId.toString(),
    chainId: auction.chainId,
    auctionType: auction.type,
  });

  const { data: vestingTokenId } = useVestingTokenId({
    linearVestingStartTimestamp: Number(auction?.vesting?.startTimestamp),
    linearVestingExpiryTimestamp: Number(auction?.vesting?.expiryTimestamp),
    baseToken: auction.baseToken,
    derivativeModuleAddress: vestingModuleAddress,
  });

  /**
   * Gotcha: redeemableAmount will be `undefined` until the user has claimed their derivative ERC6909 token.
   * Once the user has claimed their derivative, redeemableAmount will be the number of tokens they can redeem right now.
   */
  const { data: redeemableAmount, refetch: refetchRedeemable } =
    useVestingRedeemable({
      account: address,
      tokenId: vestingTokenId,
      chainId: auction.chainId,
      derivativeModuleAddress: vestingModuleAddress,
    });

  const redeemedAmount =
    auction.vesting?.redemptions
      .filter(
        (redemption) =>
          redemption.bidder.toLowerCase() === address?.toLowerCase(),
      )
      .reduce((acc, redemption) => acc + Number(redemption.redeemed), 0) ?? 0;

  const userBids = auction.bids.filter(
    (bid) => bid.bidder.toLowerCase() === address?.toLowerCase(),
  );

  const userHasClaimedVestingDerivative = userBids.every(
    (bid) => bid.status === "claimed" || bid.status === "refunded",
  );

  const userTotalSuccessfulOutAmount = userBids.reduce(
    (acc, bid) => acc + Number(bid.settledAmountOut ?? 0),
    0,
  );

  const hasVestingPeriodStarted =
    Date.now() / 1000 > Number(auction?.vesting?.startTimestamp);

  const userHasUnvestedTokens = redeemedAmount < userTotalSuccessfulOutAmount;

  const vestingProgress = calculateVestingProgress(
    Number(auction?.end),
    Number(auction?.vesting?.startTimestamp),
    Number(auction?.vesting?.expiryTimestamp),
  );

  const vestingTerm = calculateVestingTerm(
    Number(auction?.vesting?.startTimestamp),
    Number(auction?.vesting?.expiryTimestamp),
  );

  const redeemableAmountDecimal = Number(
    formatUnits(redeemableAmount ?? BigInt(0), auction.baseToken.decimals),
  );

  const userTotalTokensWon = auction.bids
    .filter((bid) => bid.bidder.toLowerCase() === address?.toLowerCase())
    .reduce((acc, bid) => acc + Number(bid.settledAmountOut ?? 0), 0);

  // LinearVesting smart contract doesn't allow you to see how much you can
  // redeem until after you've claimed the derivative ERC6909.
  // We can calculate it on the frontend proactively for improved UX.
  // i.e. don't show 0 when they have vested tokens > 0.
  const derivedRedeemableAmount =
    redeemableAmountDecimal ??
    (hasVestingPeriodStarted
      ? (vestingProgress / 100) * userTotalTokensWon
      : 0);

  // Allow user to eagerly claim the vesting derivative, if the vesting period hasn't started yet
  const shouldShowClaimVesting = !userHasClaimedVestingDerivative;

  // Otherwise, if the vesting period has started, just show "redeem" option
  // which triggers either: one txn to redeem, or, two txns to claim vesting derivative and then redeem
  const shouldShowRedeem =
    hasVestingPeriodStarted &&
    userHasUnvestedTokens &&
    userHasClaimedVestingDerivative;

  const shouldShowVestingNotStarted =
    !hasVestingPeriodStarted && userHasClaimedVestingDerivative;

  const userTotalBidAmount = userBids.reduce(
    (acc, bid) => acc + Number(bid.amountIn ?? 0),
    0,
  );

  const userTotalUnsuccessfulBidAmount = userBids.reduce(
    (acc, bid) => acc + Number(bid.settledAmountInRefunded ?? 0),
    0,
  );

  return (
    <Card title={`${shouldShowClaimVesting ? "Claim" : "Redeem"}`}>
      <div className="mb-5 grid grid-cols-2 gap-5 md:grid-cols-4">
        <div className="col-span-full grid grid-cols-subgrid gap-5">
          <Metric size="l" label="Your Bid">
            {shorten(userTotalBidAmount)} {auction.quoteToken.symbol}
          </Metric>
          {userTotalUnsuccessfulBidAmount > 0 && (
            <Metric size="l" label="Your Refund">
              {shorten(userTotalUnsuccessfulBidAmount)}{" "}
              {auction.quoteToken.symbol}
            </Metric>
          )}
          <Metric size="l" label="You Won">
            {shorten(userTotalTokensWon)} {auction.baseToken.symbol}
          </Metric>
        </div>
        <Metric className="col-span-full" size="s" label="Vesting Progress">
          <Progress value={vestingProgress} className="mt-2" />
        </Metric>
        <div className="col-span-full grid grid-cols-subgrid">
          {vestingTerm !== "Instant" && (
            <Metric size="s" label="Term">
              {vestingTerm}
            </Metric>
          )}
          {vestingTerm !== "Instant" && (
            <Metric size="s" label="Vesting Begins" childrenClassName="text-sm">
              {auction.vesting?.startDate != null &&
                formatDate.fullLocal(new Date(auction.vesting.startDate))}
            </Metric>
          )}
          <Metric size="s" label="Vesting Ends" childrenClassName="text-sm">
            {auction.vesting?.startDate != null &&
              formatDate.fullLocal(new Date(auction.vesting.expiryDate))}
          </Metric>
        </div>

        <Metric label="Redeemable">
          {trimCurrency(derivedRedeemableAmount)} {auction.baseToken.symbol}
        </Metric>
        <Metric label="Redeemed">
          {trimCurrency(Number(redeemedAmount))} {auction.baseToken.symbol}
        </Metric>
      </div>

      <RequiresChain chainId={auction.chainId}>
        <Button
          className="w-full"
          disabled={!shouldShowClaimVesting && !shouldShowRedeem}
          onClick={() => setIsTxnDialogOpen(true)}
        >
          {shouldShowClaimVesting && (
            <>Claim vesting {auction.baseToken.symbol}</>
          )}
          {shouldShowRedeem && <>Redeem {auction.baseToken.symbol}</>}
          {shouldShowVestingNotStarted && <>Vesting hasn&apos;t started yet</>}
          {!userHasUnvestedTokens && <>You redeemed all your tokens</>}
        </Button>
      </RequiresChain>

      {shouldShowClaimVesting && isTxnDialogOpen && (
        <ClaimVestingDervivativeTxn onClose={() => setIsTxnDialogOpen(false)} />
      )}
      {shouldShowRedeem && isTxnDialogOpen && (
        <RedeemVestedTokensTxn
          onClose={() => setIsTxnDialogOpen(false)}
          onSuccess={() => {
            refetchRedeemable();
            refetch();
          }}
        />
      )}
    </Card>
  );
}
