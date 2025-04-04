import {
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Area,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
  ReferenceDot,
  Line,
} from "recharts";
import { format } from "date-fns";
import { shorten } from "utils/number";
import { formatDate } from "utils/date";
import {
  BID_OUTCOME,
  type SortedBid,
  useSortedBids,
} from "./hooks/use-sorted-bids";
import { OriginIcon } from "./origin-icon";
import { useAuctionSuspense } from "@/hooks/use-auction";
import { formatUnits } from "viem";

type BidTooltipProps = TooltipProps<number, "timestamp" | "price" | "amountIn">;

type FormatterProps = {
  dataKey: string;
  name: "timestamp" | "price" | "amountIn";
  value: number;
};

const formatter = (value: unknown, _name: string, props: FormatterProps) => {
  if (props.dataKey === "timestamp" && typeof value == "number") {
    return format(new Date(value), "yyyy-MM-dd HH:mm:ss");
  }

  return value;
};

/*
  Recharts <Legend> component renders the legend text the same color as the legend icon color.
  This formatter renders default text color, without affecting the colored icons.
*/
const plainTextFormatter = (value: string) => (
  <span className="text-foreground">{value}</span>
);

const BidTooltip = (props: BidTooltipProps) => {
  const { data: auction } = useAuctionSuspense();

  const payload = props.payload?.[0]?.payload;

  // Ignore data points used for drawing the corners of first & last bid
  if (
    payload === undefined ||
    payload.price === 0 ||
    payload.cumulativeAmountIn === 0
  ) {
    return null;
  }

  const { timestamp, price, amountIn, settledAmountOut } = payload;

  return (
    <div className="bg-surface border-surface-outline text-foreground rounded-sm border p-4">
      <div>Amount: {amountIn}</div>
      <div>Price: {price}</div>
      <div>
        Settled: {shorten(settledAmountOut)} {auction?.baseToken.symbol}
      </div>
      <div>At: {formatDate.fullLocal(new Date(timestamp ?? 0))}</div>
    </div>
  );
};

const filterWinningBids = (bids: SortedBid[]) => {
  return bids.filter(
    (bid) =>
      bid.outcome === BID_OUTCOME.WON ||
      bid.outcome === BID_OUTCOME.PARTIAL_FILL,
  );
};

export const SettledAuctionChart = () => {
  const { data: auction } = useAuctionSuspense();
  const primary = `#f73b48`;
  const white = `#FFFFFF`;
  const textSecondary = `#b0bec5`;
  const light = `#212121`;

  const bids = useSortedBids();
  const clearingPrice = formatUnits(
    auction.marginalPrice,
    auction.quoteToken.decimals,
  );
  const winning = filterWinningBids(bids);
  const totalAmount = formatUnits(
    auction.bidStats.totalAmount,
    auction.quoteToken.decimals,
  );

  return (
    <div className="relative -ml-8 size-full pb-5 md:-ml-5 md:pb-20">
      <ResponsiveContainer className="min-h-64 font-mono">
        <ComposedChart data={bids}>
          <CartesianGrid
            stroke={light}
            strokeDasharray="0"
            strokeWidth={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="cumulativeAmountIn"
            type="number"
            tick={{ fill: primary, fontSize: 14 }}
            tickFormatter={(value) => shorten(value, 0)}
            tickLine={false}
          />
          <YAxis
            dataKey="price"
            type="number"
            tick={{ fill: primary, fontSize: 14 }}
            tickLine={false}
          />
          <Area
            data={winning}
            type="stepBefore"
            dataKey="price"
            dot={false}
            fill={primary}
            stroke="none"
          />
          <Line
            data={bids}
            type="stepBefore"
            dataKey="price"
            stroke={primary}
            dot={false}
            strokeWidth={2}
          />
          {bids?.map(
            (bid, index) =>
              bid.outcome !== BID_OUTCOME.PARTIAL_FILL && (
                <ReferenceLine
                  key={index}
                  segment={[
                    { x: bid.cumulativeAmountIn, y: 0 },
                    {
                      x: bid.cumulativeAmountIn,
                      y: bids[index + 1]?.price || bid.price,
                    },
                  ]}
                  stroke={textSecondary}
                  strokeWidth={1}
                />
              ),
          )}
          <ReferenceLine
            x={auction.bidStats.totalAmount.toString()}
            stroke={textSecondary}
            strokeDasharray="8 8"
            strokeWidth={2}
          />
          <ReferenceLine
            segment={[
              {
                x: totalAmount,
                y: clearingPrice,
              },
            ]}
            stroke={white}
            strokeDasharray="8 8"
            strokeWidth={2}
          />
          <ReferenceDot
            x={auction.bidStats.totalAmount.toString()}
            y={clearingPrice.toString()}
            isFront={true}
            shape={(props) => <OriginIcon cx={props.cx} cy={props.cy} />}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            // @ts-expect-error TODO
            formatter={formatter}
            content={(props) => <BidTooltip {...props} />}
          />
          <Legend
            align="left"
            wrapperStyle={{
              position: "relative",
              padding: 0,
              paddingLeft: 32,
              margin: 0,
              marginTop: -24,
            }}
            formatter={plainTextFormatter}
            payload={[
              {
                value: "Bid price (y) and Amount (x)",
                type: "plainline",
                color: primary,
                payload: { strokeDasharray: "1 0" },
              },
            ]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
