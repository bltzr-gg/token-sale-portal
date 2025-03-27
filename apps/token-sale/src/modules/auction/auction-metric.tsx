import {
  AuctionDerivativeTypes,
  type PropsWithAuction,
} from "@axis-finance/types";
import { Metric, MetricProps } from "@bltzr-gg/ui";
import { useToggle } from "./hooks/use-toggle";
import { trimCurrency } from "utils/currency";
import { shorten, formatPercentage } from "utils/number";
import { hasDerivative } from "./utils/auction-details";
import { formatDate, getDaysBetweenDates } from "utils/date";
import { Format } from "components/format";
import { UsdAmount } from "./usd-amount";
import { ToggledUsdAmount } from "./toggled-usd-amount";
import { DtlProceedsDisplay } from "./dtl-proceeds-display";
import { useAuction, Auction } from "@/hooks/use-auction";
import { formatDistanceToNow } from "date-fns";

export const getMaxTokensLaunched = (
  totalBidAmount?: number,
  targetRaise?: number,
  price?: number,
): number | undefined => {
  if (
    totalBidAmount === undefined ||
    price === undefined ||
    price === 0 ||
    targetRaise === undefined
  )
    return undefined;

  // The total bid amount can exceed the target raise, but the number of tokens launched should be capped at the target raise.
  const bidAmount = Math.min(totalBidAmount, targetRaise);

  return bidAmount / price;
};

type MetricHandlers = Record<
  string,
  {
    label: string;
    handler: (auction: Auction) => React.ReactNode;
    tooltip?: string;
  }
>;

const handlers: MetricHandlers = {
  derivative: {
    label: "Derivative",
    handler: (auction) => {
      if (hasDerivative(AuctionDerivativeTypes.LINEAR_VESTING, auction)) {
        return "Linear Vesting";
      }

      return "None";
    },
  },
  minFill: {
    label: "Min Fill",
    handler: (auction) => {
      return `${trimCurrency(auction.minFilled)} ${auction.baseToken.symbol}`;
    },
  },
  protocolFee: {
    label: "Protocol Fee",
    handler: (auction) => {
      return `${+auction.protocolFee}%`;
    },
  },
  referrerFee: {
    label: "Referrer Fee",
    handler: (auction) => {
      return `${+auction.referrerFee}%`;
    },
  },
  duration: {
    label: "Duration",
    handler: (auction) => {
      const days = getDaysBetweenDates(
        new Date(+auction.end * 1000),
        new Date(+auction.start * 1000),
      );

      //The minimum an auction can run for is 24h
      return `${days || 1} days`;
    },
  },
  start: {
    label: "Start",
    handler: (auction) => {
      return formatDate.simple(new Date(+auction.start * 1000));
    },
  },
  totalRaised: {
    label: "Total Raised",
    handler: (auction) => {
      return `${auction.purchased} ${auction.quoteToken.symbol}`;
    },
  },
  targetRaise: {
    label: "Target Raise",
    handler: (auction) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { isToggled: isUsdToggled } = useToggle();

      if (isUsdToggled) {
        return (
          <UsdAmount token={auction.quoteToken} amount={auction.targetRaise} />
        );
      }
      return `${trimCurrency(auction.targetRaise)} ${auction.quoteToken.symbol}`;
    },
  },
  minRaise: {
    label: "Min Raise",
    handler: (auction) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { isToggled: isUsdToggled } = useToggle();

      if (isUsdToggled) {
        return (
          <UsdAmount token={auction.quoteToken} amount={auction.minRaise} />
        );
      }

      return `${trimCurrency(auction.minRaise)} ${auction.quoteToken.symbol}`;
    },
  },

  minPrice: {
    label: "Min Price",
    handler: (auction) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { isToggled: isUsdToggled } = useToggle();

      if (isUsdToggled) {
        return (
          <UsdAmount token={auction.quoteToken} amount={auction.minPrice} />
        );
      }

      return (
        <>
          <Format value={auction.minPrice} /> {auction.quoteToken.symbol}
        </>
      );
    },
  },
  totalBids: {
    label: "Total Bids",
    handler: (auction) => {
      return `${auction.bidStats.total}`;
    },
  },
  totalBidAmount: {
    label: "Total Bid Amount",
    handler: (auction) =>
      `${auction.bidStats.totalAmount} ${auction.quoteToken.symbol}`,
  },

  capacity: {
    label: "Tokens Available",
    handler: (auction) =>
      `${shorten(auction.capacity)} ${auction.baseToken.symbol}`,
  },

  totalSupply: {
    label: "Total Supply",
    handler: (auction) => shorten(Number(auction.baseToken.totalSupply)),
  },

  price: {
    label: "Price",
    handler: (auction) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { isToggled: isUsdToggled } = useToggle();

      if (isUsdToggled) {
        return (
          <UsdAmount token={auction.quoteToken} amount={auction.minPrice} />
        );
      }

      return (
        <>
          <Format value={auction.minPrice ?? 0} /> {auction.quoteToken.symbol}
        </>
      );
    },
  },

  fixedPrice: {
    label: "Price",
    handler: (auction) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { isToggled: isUsdToggled } = useToggle();

      if (isUsdToggled) {
        return (
          <UsdAmount token={auction.quoteToken} amount={auction.minPrice} />
        );
      }

      return (
        <>
          <Format value={auction.minPrice ?? 0} /> {auction.quoteToken.symbol}
        </>
      );
    },
  },

  sold: {
    label: "Sold",
    handler: (auction) => `${auction.sold} ${auction.baseToken.symbol}`,
  },

  tokensAvailable: {
    label: "Tokens Available",
    handler: (auction) => {
      const supplyPercentage =
        (Number(auction.capacityInitial) /
          Number(auction.baseToken.totalSupply)) *
        100;

      const availableTokens = shorten(+auction.capacityInitial);

      return `${availableTokens} (${formatPercentage(supplyPercentage)}%)`;
    },
  },
  vestingDuration: {
    label: "Vesting",
    handler: (auction) => {
      if (!auction.linearVesting) {
        return "None";
      }

      const start = new Date(+auction.linearVesting.startTimestamp * 1000);
      const end = new Date(+auction.linearVesting.expiryTimestamp * 1000);

      const duration = getDaysBetweenDates(end, start);

      return `${duration} days`;
    },
  },
  minPriceFDV: {
    label: "Min Price FDV",
    handler: (auction) => {
      const fdv = Number(auction.baseToken.totalSupply) * auction.minPrice;

      return (
        <ToggledUsdAmount
          token={auction.quoteToken}
          amount={fdv}
          untoggledFormat={(amount) =>
            `${shorten(amount)} ${auction.quoteToken.symbol}`
          }
        />
      );
    },
  },
  fixedPriceFDV: {
    label: "Fixed Price FDV",
    handler: (auction) => {
      const fdv = Number(auction.baseToken.totalSupply) * auction.minPrice;

      return (
        <ToggledUsdAmount
          token={auction.quoteToken}
          amount={fdv}
          untoggledFormat={(amount) =>
            `${shorten(amount)} ${auction.quoteToken.symbol}`
          }
        />
      );
    },
  },
  rate: {
    label: "Rate",
    handler: (auction) => {
      return `${trimCurrency(auction?.marginalPrice)} ${auction.symbol}`;
    },
  },
  started: {
    label: "Started",
    handler: (auction) => {
      return `${formatDistanceToNow(auction.start)} ago`;
    },
  },
  ended: {
    label: "Ended",
    handler: (auction) => {
      return `${formatDistanceToNow(auction.end)} ago`;
    },
  },
  saleType: {
    label: "Sale Type",
    handler: () => "Public",
  },
  result: {
    label: "Result",
    handler: (auction) => {
      if (auction.bidStats.totalAmount >= auction.targetRaise)
        return "Target Met";
      if (auction.bidStats.totalAmount >= auction.minRaise)
        return "Min Raise Met";

      return "Failed";
    },
  },
  maxTokensLaunched: {
    label: "Max Tokens Launched",
    handler: (auction) => {
      const maxTokensLaunched = getMaxTokensLaunched(
        auction.bidStats.totalAmount,
        auction.targetRaise,
        auction.minPrice,
      );
      if (maxTokensLaunched === undefined) return undefined;

      return `${shorten(maxTokensLaunched)} ${auction.baseToken.symbol}`;
    },
  },
  clearingPrice: {
    label: "Clearing Price",
    handler: (auction) => {
      return `${trimCurrency(auction.marginalPrice)} ${auction.quoteToken.symbol}`;
    },
  },
  tokensLaunched: {
    label: "Tokens Launched",
    handler: (auction) => {
      const tokensLaunched = auction.purchased / auction.marginalPrice;

      return `${trimCurrency(tokensLaunched)} ${auction.baseToken.symbol}`;
    },
  },
  dtlProceeds: {
    label: "Direct to Liquidity",
    tooltip:
      "The percentage of proceeds that will be automatically deposited into the liquidity pool",
    handler: (auction) => <DtlProceedsDisplay auction={auction} />,
  },
};

type AuctionMetricProps = Partial<PropsWithAuction> & {
  id: keyof typeof handlers;
  className?: string;
} & Partial<Pick<MetricProps, "size">>;

export function AuctionMetric(props: AuctionMetricProps) {
  const element = handlers[props.id];
  const { data: auction } = useAuction();

  if (!auction || !element) return null;

  const value = element.handler(auction);

  return (
    <Metric size={props.size} label={element.label} tooltip={element.tooltip}>
      {value || "-"}
    </Metric>
  );
}
