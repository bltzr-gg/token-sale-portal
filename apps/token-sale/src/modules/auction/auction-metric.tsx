import {
  AuctionDerivativeTypes,
  type PropsWithAuction,
} from "@axis-finance/types";
import { Metric, MetricProps } from "@bltzr-gg/ui";
import { formatCurrencyUnits } from "utils/currency";
import { hasDerivative } from "./utils/auction-details";
import { formatDate, getDaysBetweenDates } from "utils/date";
import { DtlProceedsDisplay } from "./dtl-proceeds-display";
import { Auction, useAuctionSuspense } from "@/hooks/use-auction";
import { formatDistanceToNow } from "date-fns";

const getMaxTokensLaunched = (
  totalBidAmount: bigint,
  targetRaise: bigint,
  price: bigint,
) => {
  const bidAmount = totalBidAmount < targetRaise ? totalBidAmount : targetRaise;

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
    handler: (auction) =>
      formatCurrencyUnits(auction.minFilled, auction.baseToken),
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
      const days = getDaysBetweenDates(auction.end, auction.start);

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
    handler: (auction) =>
      formatCurrencyUnits(auction.purchased, auction.quoteToken),
  },
  targetRaise: {
    label: "Target Raise",
    handler: (auction) =>
      formatCurrencyUnits(auction.targetRaise, auction.quoteToken),
  },
  minRaise: {
    label: "Min Raise",
    handler: (auction) =>
      formatCurrencyUnits(auction.minRaise, auction.quoteToken),
  },

  minPrice: {
    label: "Min Price",
    handler: (auction) =>
      formatCurrencyUnits(auction.minPrice, auction.quoteToken),
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
      formatCurrencyUnits(auction.bidStats.totalAmount, auction.quoteToken),
  },

  capacity: {
    label: "Tokens Available",
    handler: (auction) =>
      formatCurrencyUnits(auction.capacity, auction.baseToken),
  },

  price: {
    label: "Price",
    handler: (auction) =>
      formatCurrencyUnits(auction.minPrice, auction.quoteToken),
  },

  fixedPrice: {
    label: "Price",
    handler: (auction) =>
      formatCurrencyUnits(auction.minPrice, auction.quoteToken),
  },

  sold: {
    label: "Sold",
    handler: (auction) => formatCurrencyUnits(auction.sold, auction.baseToken),
  },
  rate: {
    label: "Rate",
    handler: (auction) =>
      formatCurrencyUnits(auction?.marginalPrice, auction.quoteToken),
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

      return formatCurrencyUnits(maxTokensLaunched, auction.baseToken);
    },
  },
  clearingPrice: {
    label: "Clearing Price",
    handler: (auction) =>
      formatCurrencyUnits(auction.marginalPrice, auction.quoteToken),
  },
  tokensLaunched: {
    label: "Tokens Launched",
    handler: (auction) => {
      const tokensLaunched = auction.purchased / auction.marginalPrice;

      return formatCurrencyUnits(tokensLaunched, auction.baseToken);
    },
  },
  dtlProceeds: {
    label: "Direct to Liquidity",
    tooltip:
      "The percentage of proceeds that will be automatically deposited into the liquidity pool",
    handler: () => <DtlProceedsDisplay />,
  },
};

type AuctionMetricProps = Partial<PropsWithAuction> & {
  id: keyof typeof handlers;
  className?: string;
} & Partial<Pick<MetricProps, "size">>;

export function AuctionMetric(props: AuctionMetricProps) {
  const { data: auction } = useAuctionSuspense();
  const element = handlers[props.id];

  if (!element) {
    throw new Error(`No element found for ${props.id}`);
  }

  const value = element.handler(auction);

  return (
    <Metric size={props.size} label={element.label} tooltip={element.tooltip}>
      {value || "-"}
    </Metric>
  );
}
