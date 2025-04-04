import {
  Avatar,
  Card,
  cn,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
  trimAddress,
} from "@bltzr-gg/ui";
import { AuctionMetric } from "./auction-metric";
import { useAuctionSuspense } from "@/hooks/use-auction";
import useBaseTokenAuctionStats from "@/hooks/use-base-token-auction-stats";
import { formatCurrencyUnits } from "@/utils/currency";
import { PropsWithChildren } from "react";
import { ExternalLink, HelpCircle } from "lucide-react";
import { getDurationBetweenDates } from "./utils/get-duration-between-dates";
import graphImg from "@/assets/images/sealed-auction-graph.png";

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
    <Card className={className}>
      <div className="mb-4 flex w-full flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center">
          <h3 className="text-foreground-secondary inline-block font-mono text-[40px] font-light leading-[40px] tracking-tight">
            $REAL Token Launch
          </h3>
        </div>

        <Popover>
          <PopoverTrigger className="group flex items-center gap-3 pl-2 text-right">
            <div>
              <Label>Curated by </Label>
              <Value className="group-hover:text-primary whitespace-nowrap">
                Conor McGregor
                <HelpCircle className="mb-0.5 ml-0.5 inline size-4" />
              </Value>
            </div>
            <Avatar
              src="https://pbs.twimg.com/profile_images/1858650849959985152/6k3O-svn_400x400.jpg"
              className="mt-1 size-12"
            />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="grid w-screen grid-cols-[auto,1fr] gap-3 sm:w-80 sm:min-w-[460px]"
          >
            <Avatar
              src="https://pbs.twimg.com/profile_images/1858650849959985152/6k3O-svn_400x400.jpg"
              className="size-32"
            />
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="mb-0 text-xl leading-none md:mr-2 md:inline">
                  Conor McGregor
                </h3>
                <Link
                  href="https://x.com/TheNotoriousMMA"
                  className="text-muted-foreground text-sm"
                >
                  @TheNotoriousMMA
                </Link>
                <p className="text-muted-foreground mt-1 text-sm">
                  5 time World Champion. Pray EVERYDAY!! #GOD #FAMILY #TRUTH 🇮🇪
                </p>
              </div>
              <div className="text-right">
                <Link
                  className="group"
                  href="https://app.axis.finance/#/curator/369583954"
                >
                  Verified by{" "}
                  <svg
                    className="group-hover:fill-primary fill-foreground mb-0.5 inline h-7 w-10"
                    viewBox="0 0 498 160"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M399.568 114.238H417.877C417.877 131.211 430.464 143.226 448.963 143.226C465.746 143.226 479.477 132.928 479.477 117.48C479.477 102.032 468.225 91.7335 445.149 86.2027C415.97 78.9556 401.666 64.0799 401.666 41.9571C401.666 15.6386 422.454 0 448.772 0C475.091 0 495.688 18.3085 495.688 43.6735H477.761C477.761 28.6071 465.364 16.4014 448.2 16.4014C432.371 16.4014 419.784 26.5093 419.784 40.8128C419.784 55.1164 430.845 65.2242 453.349 70.7549C482.719 78.3835 497.786 93.4499 497.786 115.763C497.786 142.082 476.998 159.437 448.772 159.437C420.547 159.437 399.568 140.938 399.568 114.238ZM361.807 156.004V3.62357H378.971V156.004H361.807ZM189.211 145.133L201.607 157.721L267.213 92.1149L332.818 157.721L345.596 145.133L279.8 79.7185L345.596 13.7314L332.818 1.52571L267.213 67.1313L201.607 1.52571L189.211 13.7314L254.816 79.7185L189.211 145.133ZM18.3307 79.7185C18.3307 114.428 44.4586 141.319 80.3128 141.319C116.167 141.319 142.295 114.428 142.295 79.7185C142.295 45.0085 116.167 18.1178 80.3128 18.1178C44.4586 18.1178 18.3307 45.3899 18.3307 79.7185ZM0.212891 79.7185C0.212891 36.6171 35.8764 0 80.3128 0C114.641 0.381428 136.383 19.2621 148.779 42.9107L155.836 3.62357H173L159.459 79.7185L173 156.004H155.836L148.779 116.908C136.383 140.556 114.641 159.437 80.3128 159.437C35.8764 159.437 0.212891 123.201 0.212891 79.7185Z" />
                  </svg>
                  <ExternalLink className="mb-1 ml-1 inline size-4" />
                </Link>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <p className="text-red-600 empty:hidden">
        {baseTokenStats.error?.message &&
          "Error fetching base token metrics. Are you sure it implements the ERC20 standard?"}
      </p>
      <div className="grid grid-cols-2 gap-5 gap-x-8 md:grid-cols-4 xl:grid-cols-6">
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
            <Label>Unlock Cliff</Label>
            <Value>
              {getDurationBetweenDates(auction.end, auction.vesting.start)}
            </Value>
          </div>
        )}
      </div>
      <div className="mt-5">
        <h3 className="my-5 text-2xl font-light">Getting $REAL</h3>
        <p className="mb-2 text-lg text-white/90">
          The $REAL token is launching via a sealed-bid auction followed by a
          deployment on Uniswap. This ensures fair access for all participants
          and renders sniping impossible. The auction will be open for 28 hours,
          after which a single clearing price will be determined. Tokens will be
          locked for 12 hours after auction close to facilitate a snipe-free
          deployment of on-chain liquidity. Proceeds from the auction will seed
          this pool and fund the DAO treasury.
        </p>
        <p className="mb-2 text-lg text-white/90">
          Sealed-bid auctions clear at a single auction price. Anyone who bids
          above the final clearing price will receive extra $REAL tokens. Anyone
          who bids below the final clearing price will receive no $REAL tokens
          and be refunded their USDC.
        </p>
        <div className="flex justify-center px-2 py-6">
          <img
            src={graphImg}
            alt="Sealed Auction Graph"
            className="w-full max-w-3xl"
          />
        </div>
        <p className="mb-2 text-lg text-white/90">
          To read more about the sealed price auction mechanism, refer to the
          Axis Finance{" "}
          <Link
            className="text-primary"
            href="https://axis.finance/docs/dapp/sealed-bid-auctions"
          >
            documentation <ExternalLink className="mb-1 inline size-4" />
          </Link>
        </p>
      </div>
    </Card>
  );
}
