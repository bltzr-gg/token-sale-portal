import { Card, Metric } from "@bltzr-gg/ui";
import { BlockExplorerLink } from "components/blockexplorer-link";
import { AuctionMetric } from "./auction-metric";
import { useAuctionSuspense } from "@/hooks/use-auction";

export function AuctionCoreMetrics({ className }: { className?: string } = {}) {
  const { data: auction } = useAuctionSuspense();
  const isSuccessful = auction.settled;
  const isVested = !!auction.linearVesting;

  return (
    <Card
      className={className}
      title="$REAL Token Launch"
      headerRightElement={
        <div className="flex gap-x-8">
          <Metric size="s" label="Token Address">
            <BlockExplorerLink
              trim
              chainId={auction.chainId}
              address={auction.baseToken.address}
            />
          </Metric>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-5 gap-x-8 md:grid-cols-4 xl:grid-cols-6">
        <AuctionMetric id="targetRaise" />
        <AuctionMetric id="minRaise" />
        <AuctionMetric id="minPrice" />
        <AuctionMetric id="minPriceFDV" />
        <AuctionMetric id="totalSupply" />
        <AuctionMetric id="tokensAvailable" />

        {isSuccessful && (
          <>
            <AuctionMetric id="tokensLaunched" />
          </>
        )}

        {isVested && <AuctionMetric id="vestingDuration" />}
      </div>
      <div className="mt-5">
        <h3 className="my-5 text-2xl font-light">
          The Notorious $REAL Token: Where Champions Play 👑🥊
        </h3>
        <p className="text-lg text-white/90">
          <strong>$REAL</strong> is more than a token—it&apos;s a movement. Born
          from the unshakable confidence and bold vision of{" "}
          <strong>Conor McGregor</strong>, <strong>$REAL</strong> is bringing
          the knockout power of crypto to high-stakes entertainment and gaming.
          This is your chance to be part of a legendary ecosystem that&apos;s
          redefining what it means to compete, earn, and live boldly.
        </p>
      </div>
    </Card>
  );
}
