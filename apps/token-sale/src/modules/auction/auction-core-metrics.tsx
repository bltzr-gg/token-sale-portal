import { Card, cn, Link, Skeleton, trimAddress } from "@bltzr-gg/ui";
import { AuctionMetric } from "./auction-metric";
import { useAuctionSuspense } from "@/hooks/use-auction";
import useBaseTokenAuctionStats from "@/hooks/use-base-token-auction-stats";
import { formatCurrencyUnits } from "@/utils/currency";
import { PropsWithChildren } from "react";
import { intervalToDuration } from "date-fns";
import { LinkIcon } from "lucide-react";

const Label = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => (
  <div
    className={cn(
      "bg-primary text-primary-foreground inline-block px-1 py-0.5 font-mono text-sm uppercase leading-none tracking-[1.2px]",
      className,
    )}
  >
    {children}
  </div>
);

const Value = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => (
  <h4
    className={cn(
      "text-foreground-primary font-regular text-lg tracking-wide",
      className,
    )}
  >
    {children}
  </h4>
);

const getDurationBetweenDates = (start: Date, end: Date) => {
  const duration = intervalToDuration({ end, start });

  const parts = [];
  if (duration.years && duration.years > 0)
    parts.push(`${duration.years} years`);
  if (duration.months && duration.months > 0)
    parts.push(`${duration.months} months`);
  if (duration.days && duration.days > 0) parts.push(`${duration.days} days`);
  if (duration.hours && duration.hours > 0)
    parts.push(`${duration.hours} hours`);
  return parts.join(", ");
};

export function AuctionCoreMetrics({ className }: { className?: string } = {}) {
  const { data: auction } = useAuctionSuspense();
  const isSuccessful = auction.settled;
  const baseTokenStats = useBaseTokenAuctionStats();

  return (
    <Card
      className={className}
      title="$REAL Token Launch"
      headerRightElement={
        <div>
          <Label>Token Address</Label>
          <Value>
            <Link
              href={`https://etherscan.io/token/${auction.baseToken.address}`}
            >
              {trimAddress(auction.baseToken.address)}
              <LinkIcon className="inline size-4" />
            </Link>
          </Value>
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
                (baseTokenStats.data?.totalSupply ?? 0n) * auction.minPrice,
                {
                  decimals:
                    auction.quoteToken.decimals + auction.baseToken.decimals,
                  symbol: auction.quoteToken.symbol,
                  compact: true,
                },
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

        {auction.vesting && (
          <div>
            <Label>Vesting Duration</Label>
            <Value>
              {getDurationBetweenDates(
                auction.vesting.start,
                auction.vesting.end,
              )}
            </Value>
          </div>
        )}
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
