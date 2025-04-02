import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  Card,
  cn,
  Link,
  Skeleton,
  trimAddress,
} from "@bltzr-gg/ui";
import { AuctionMetric } from "./auction-metric";
import { useAuctionSuspense } from "@/hooks/use-auction";
import useBaseTokenAuctionStats from "@/hooks/use-base-token-auction-stats";
import { formatCurrencyUnits } from "@/utils/currency";
import { PropsWithChildren } from "react";
import { ExternalLink } from "lucide-react";
import { getDurationBetweenDates } from "./utils/get-duration-between-dates";

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

const largeNumberOptions = {
  minPrecision: 0,
  precision: 2,
  compact: true,
} as const;

export function AuctionMetrics({ className }: { className?: string } = {}) {
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
              <ExternalLink className="mb-1 ml-0.5 inline size-4" />
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
        {auction.bidStats.totalAmount > 0n && (
          <div>
            <Label>Total Raised</Label>
            <Value>
              {formatCurrencyUnits(
                auction.bidStats.totalAmount,
                auction.quoteToken,
              )}
            </Value>
          </div>
        )}
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
                  ...largeNumberOptions,
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
              formatCurrencyUnits(baseTokenStats.data?.totalSupply ?? 0n, {
                ...auction.baseToken,
                ...largeNumberOptions,
              })
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
                {formatCurrencyUnits(auction.initialCapacity, {
                  ...auction.baseToken,
                  ...largeNumberOptions,
                })}{" "}
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
        <p className="mb-2 text-lg text-white/90">
          <strong>$REAL</strong> is not just a token, it&apos;s Conor
          McGregor&apos;s unstoppable spirit, delivering a knockout punch in the
          fight for real change. By channeling the fearless energy of the
          Notorious, <strong>$REAL</strong> is bringing citizens together to
          champion bold new ways of funding and shaping leadership, putting
          power back in the hands of the people.
        </p>
        <p className="mb-2 text-lg text-white/90">
          This one-of-a-kind coin merges high-stakes spectacle with high-impact
          ideals, forging a movement that hits harder, goes further, and demands
          a new level of accountability - both in the ring and in the halls of
          power.
        </p>
        <AccordionRoot collapsible type="single">
          <AccordionItem
            value={"item-0"}
            className="flex flex-col justify-center"
          >
            <AccordionTrigger className="self-start">
              Why a Token Auction?
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p className="text-lg text-white/90">
                We&apos;re using a{" "}
                <Link
                  className="text-primary"
                  href="https://axis.finance/docs/dapp/sealed-bid-auctions"
                >
                  Sealed Bid Auction{" "}
                  <ExternalLink className="mb-1 inline size-4" />
                </Link>{" "}
                to give the <strong>$REAL</strong> community a truly fair and
                transparent launch, free from the frantic chaos of traditional
                token sales. Here&apos;s what makes it different:
              </p>
              <ul className="ml-6 list-disc space-y-2 text-lg text-white/90">
                <li>
                  <strong>No Sniping:</strong> In many token sales, timing can
                  be everything. People rush in right before the sale closes, or
                  bots swoop in early to gain an unfair edge. With sealed-bid
                  auctions, all bids remain private until settlement, meaning no
                  one can “snipe” at the last second by monitoring on-chain
                  activity.
                </li>
                <li>
                  <strong>Efficient, Equitable Distribution:</strong> Once
                  bidding closes, bids are sorted highest to lowest, and tokens
                  are allocated starting from the top until they&apos;re all
                  distributed. Everyone who meets or exceeds the final clearing
                  price gets tokens at that single, uniform price so you&apos;ll
                  never overpay if you happened to bid higher.
                </li>
                <li>
                  <strong>No Gas Wars:</strong> By decoupling timing from token
                  allocation, sealed-bid auctions eliminate the common “gas war”
                  problem. You can place your bid with confidence at any time
                  before the auction ends, without fighting to get in first or
                  pay exorbitant network fees to front-run other buyers.
                </li>
                <li>
                  <strong>Smooth Post-Sale Dynamics:</strong> After the auction
                  settles, <strong>$REAL</strong> will be available in Uniswap
                  liquidity pools, giving everyone (bidders or not) quick and
                  orderly access. This approach typically reduces volatility,
                  because the price is anchored to the fair clearing price
                  discovered during the auction.
                </li>
              </ul>
              <p className="text-lg text-white/90">
                Ultimately with this sealed-bid auction, the{" "}
                <strong>$REAL</strong> token sale aims to deliver a no-drama,
                no-FUD experience. One that ensures participants get a fair shot
                at the tokens they want, at a fair market price.
              </p>
            </AccordionContent>
          </AccordionItem>
        </AccordionRoot>
      </div>
    </Card>
  );
}
