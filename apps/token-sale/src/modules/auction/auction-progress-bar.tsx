import { Progress, Text, cn } from "@bltzr-gg/ui";
import { ToggledUsdAmount } from "./toggled-usd-amount";
import { trimCurrency } from "utils/currency";
import { useAuctionSuspense } from "@/hooks/use-auction";

type ProgressMetricProps = {
  label: string;
  value: number;
  className?: string;
};

function ProgressMetric({ className, label, value }: ProgressMetricProps) {
  const { data: auction } = useAuctionSuspense();
  return (
    <div className={cn("flex flex-col gap-y-0.5 px-2.5", className)}>
      <Text
        mono
        className="dark:text-background -mt-1 font-bold leading-none lg:text-lg"
      >
        <ToggledUsdAmount
          token={auction.quoteToken}
          amount={value}
          untoggledFormat={(val) =>
            trimCurrency(val) + " " + auction.quoteToken.symbol
          }
        />
      </Text>

      <Text
        mono
        uppercase
        className="text-foreground dark:text-background p-0 leading-none"
      >
        {label}
      </Text>
    </div>
  );
}

/** Renders a progress bar with the amount of tokens commited in bids*/
export default function AuctionProgressBar() {
  const { data: auction } = useAuctionSuspense();

  const showCurrentProgress =
    auction.status !== "created" && auction.amount > 0;

  return (
    <Progress
      hideMinTarget
      value={auction.progress.currentPercent}
      minTarget={auction.progress.minTarget}
      className="mt-1 flex h-[64px] w-[320px] items-center lg:w-[900px]"
    >
      <div
        className={cn(
          "flex w-[320px] justify-between lg:w-[900px] ",
          !showCurrentProgress && "justify-end",
        )}
      >
        {showCurrentProgress && (
          <ProgressMetric
            label="Raised"
            value={auction.progress.currentAmount}
          />
        )}
        <ProgressMetric
          label="Target"
          value={auction.progress.targetAmount}
          className="text-right"
        />
      </div>
    </Progress>
  );
}
