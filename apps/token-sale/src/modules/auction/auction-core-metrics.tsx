import { Card, Metric, Skeleton } from "@bltzr-gg/ui";
import { BlockExplorerLink } from "components/blockexplorer-link";
import { AuctionMetric } from "./auction-metric";
import { useAuctionSuspense } from "@/hooks/use-auction";
import useBaseTokenAuctionStats from "@/hooks/use-base-token-auction-stats";
import { formatCurrencyUnits } from "@/utils/currency";

const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-primary text-primary-foreground inline-block px-1 py-0.5 font-mono text-sm uppercase leading-none tracking-[1.2px]">
    {children}
  </div>
);

const Value = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-foreground-primary font-regular text-lg tracking-wide">
    {children}
  </h4>
);

export function AuctionCoreMetrics({ className }: { className?: string } = {}) {
  const { data: auction } = useAuctionSuspense();
  const isSuccessful = auction.settled;
  const isVested = !!auction.linearVesting;
  const baseTokenStats = useBaseTokenAuctionStats();

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
      <p className="text-red-600 empty:hidden">
        {baseTokenStats.error?.message &&
          "Error fetching base token metrics. Are you sure it implements the ERC20 standard?"}
      </p>
      <div className="grid grid-cols-2 gap-5 gap-x-8 md:grid-cols-4 xl:grid-cols-6">
        <AuctionMetric id="targetRaise" />
        <AuctionMetric id="minRaise" />
        <AuctionMetric id="minPrice" />
        <div>
          <Label>MIN PRICE FDV</Label>
          <Value>
            {baseTokenStats.isLoading ? (
              <Skeleton />
            ) : (
              formatCurrencyUnits(
                baseTokenStats.data?.totalSupply ?? 0n,
                auction.baseToken,
              )
            )}
          </Value>
        </div>
        <div>
          <Label>Total Supply</Label>
          <Value>
            {baseTokenStats.isLoading ? (
              <Skeleton />
            ) : (
              formatCurrencyUnits(
                baseTokenStats.data?.totalSupply ?? 0n,
                auction.baseToken,
              )
            )}
          </Value>
        </div>

        <div>
          <Label>Tokens Available</Label>
          <Value>
            {baseTokenStats.isLoading ? (
              <Skeleton />
            ) : (
              <>
                {formatCurrencyUnits(
                  auction.initialCapacity,
                  auction.baseToken,
                )}{" "}
                ({baseTokenStats.data?.auctionSupplyPercentage}%)
              </>
            )}
          </Value>
        </div>

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
