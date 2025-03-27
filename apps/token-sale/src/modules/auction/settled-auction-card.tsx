import type { Token } from "@/hooks/use-auction/types";
import {
  Card,
  cn,
  Metric,
  type MetricProps,
  type TextWeight,
} from "@bltzr-gg/ui";
import { SettledAuctionChart } from "./settled-auction-chart";
import { useToggleUsdAmount } from "./hooks/use-toggle-usd-amount";
import { useAuctionSuspense } from "@/hooks/use-auction";

type ToggledAmountProps = {
  label: string;
  token: Token;
  amount: number;
  timestamp?: Date;
  weight?: TextWeight;
  className?: string;
} & Pick<MetricProps, "size">;

const ToggledAmount = ({
  label,
  token,
  amount,
  timestamp,
  className,
  size,
  weight = "default",
}: ToggledAmountProps) => {
  const toggledAmount = useToggleUsdAmount({ token, amount, timestamp });
  return (
    <Metric
      label={label}
      className={cn("flex-grow", className)}
      size={size}
      metricWeight={weight}
    >
      {toggledAmount}
    </Metric>
  );
};

const AuctionHeader = () => {
  const { data: auction } = useAuctionSuspense();

  const clearingPrice = auction.marginalPrice;
  const fdv = Number(auction.baseToken.totalSupply ?? 0) * clearingPrice;

  return (
    <div className="flex- flex items-end gap-x-[8px] pb-[16px]">
      {auction.settled && (
        <>
          <ToggledAmount
            label="Clearing price"
            amount={clearingPrice}
            token={auction.quoteToken}
            timestamp={auction.end}
            className="min-w-[292px]"
          />
          <ToggledAmount
            label={` Raised`}
            amount={Number(auction.purchased) ?? 0}
            token={auction.quoteToken}
            timestamp={auction.end}
            className="min-w-[188px]"
          />
          <ToggledAmount
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
