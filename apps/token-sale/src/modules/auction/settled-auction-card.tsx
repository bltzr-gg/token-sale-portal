import type { Token } from "@/hooks/use-auction/types";
import {
  Card,
  cn,
  Metric,
  type MetricProps,
  type TextWeight,
} from "@bltzr-gg/ui";
import { SettledAuctionChart } from "./settled-auction-chart";
import { useAuctionSuspense } from "@/hooks/use-auction";
import { formatCurrencyUnits } from "@/utils/currency";

type FormatUnitProps = {
  label: string;
  token: Token;
  amount: bigint;
  timestamp?: Date;
  weight?: TextWeight;
  className?: string;
} & Pick<MetricProps, "size">;

const FormatUnits = ({
  label,
  token,
  amount,
  className,
  size,
  weight = "default",
}: FormatUnitProps) => {
  return (
    <Metric
      label={label}
      className={cn("flex-grow", className)}
      size={size}
      metricWeight={weight}
    >
      {formatCurrencyUnits(amount, token)}
    </Metric>
  );
};

const AuctionHeader = () => {
  const { data: auction } = useAuctionSuspense();

  const clearingPrice = auction.marginalPrice;
  const fdv = auction.baseToken.totalSupply ?? 0n * clearingPrice;

  return (
    <div className="flex- flex items-end gap-x-[8px] pb-[16px]">
      {auction.settled && (
        <>
          <FormatUnits
            label="Clearing price"
            amount={clearingPrice}
            token={auction.quoteToken}
            timestamp={auction.end}
            className="min-w-[292px]"
          />
          <FormatUnits
            label={` Raised`}
            amount={auction.purchased}
            token={auction.quoteToken}
            timestamp={auction.end}
            className="min-w-[188px]"
          />
          <FormatUnits
            label="FDV"
            token={auction.quoteToken}
            amount={fdv ?? 0}
            timestamp={auction.end}
            className="min-w-[188px]"
          />
        </>
      )}
      <Metric label="Participants" className="min-w-[188px] flex-grow">
        {auction.bidStats.unique}
      </Metric>
    </div>
  );
};

const SettledAuctionCard = () => {
  return (
    <Card className="min-h-64 md:aspect-video">
      <AuctionHeader />
      <SettledAuctionChart />
    </Card>
  );
};

export { SettledAuctionCard };
