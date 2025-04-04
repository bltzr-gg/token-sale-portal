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
import { useReadContract } from "wagmi";
import { erc20Abi } from "viem";

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
  const totalSupply = useReadContract({
    abi: erc20Abi,
    address: auction.baseToken.address,
    functionName: "totalSupply",
    chainId: auction.chainId,
  });

  const clearingPrice = auction.marginalPrice;
  const modifier = 10n ** BigInt(auction.baseToken.decimals);
  const fdv = totalSupply.data && (totalSupply.data * clearingPrice) / modifier;

  return (
    <div className="grid grid-cols-2 gap-3 pb-[16px] md:grid-cols-4">
      {auction.settled && totalSupply.isSuccess && (
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
            amount={fdv ?? 0n}
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
    <Card>
      <AuctionHeader />
      <div className="min-h-80 px-5 md:aspect-video md:px-8">
        <SettledAuctionChart />
      </div>
    </Card>
  );
};

export { SettledAuctionCard };
