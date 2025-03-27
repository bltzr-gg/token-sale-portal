import { createColumnHelper } from "@tanstack/react-table";
import { formatUnits } from "viem";
import { Card, DataTable, Text } from "@bltzr-gg/ui";
import { trimCurrency } from "utils/currency";
import { shorten } from "utils/number";
import { useUserBids } from "@/hooks/use-user-bids";
import { useAuctionSuspense } from "@/hooks/use-auction";
import { useMemo } from "react";
import { AuctionBid } from "@/hooks/use-auction/types";

const TableCell = ({ top, bottom }: { top: string; bottom: string }) => {
  return (
    <div className="flex flex-col">
      <Text mono size="md">
        {top}
      </Text>
      <Text mono size="sm" color="secondary">
        {bottom}
      </Text>
    </div>
  );
};

const TableHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col">{children}</div>;
};

const column = createColumnHelper<AuctionBid>();

export function UserBidInfoCard() {
  const { data: auction } = useAuctionSuspense();
  const userBids = useUserBids();

  const columns = [
    column.accessor("amountIn", {
      header: () => <TableHeader>Amount</TableHeader>,
      cell: (info) => {
        const amountIn = Number(info.getValue() as string);
        return (
          <TableCell
            top={shorten(amountIn)}
            bottom={auction.quoteToken.symbol}
          />
        );
      },
    }),
    column.accessor("submittedPrice", {
      header: "Price",
      cell: (info) => {
        const submittedPrice = Number(info.getValue() as string);
        return (
          <TableCell
            top={trimCurrency(submittedPrice)}
            bottom={auction.quoteToken.symbol}
          />
        );
      },
    }),
    column.accessor("rawAmountOut", {
      header: "Expected",
      cell: (info) => {
        const amountOut = BigInt(info.getValue() as string);
        const prettyAmountOut = shorten(
          Number(formatUnits(amountOut, auction.baseToken.decimals)),
        );
        return (
          <TableCell top={prettyAmountOut} bottom={auction.baseToken.symbol} />
        );
      },
    }),
    column.accessor("settledAmountOut", {
      header: "Won",
      cell: (info) => {
        const settledAmountOut = shorten(Number(info.getValue() as string));
        return (
          <TableCell top={settledAmountOut} bottom={auction.baseToken.symbol} />
        );
      },
    }),
    column.accessor("settledAmountIn", {
      header: "Refund",
      cell: (info) => {
        const settledAmountIn = Number(info.getValue() as string);
        const bid = info.row.original;
        const refundAmount = shorten(Number(bid.amountIn) - settledAmountIn);
        return (
          <TableCell top={refundAmount} bottom={auction.quoteToken.symbol} />
        );
      },
    }),
  ];

  const bidIdRemapped = useMemo(
    () =>
      userBids.bids.map((bid) => ({
        ...bid,
        id: bid.bidId,
      })),
    [userBids.bids],
  );

  return (
    <Card title="Bid Info">
      <DataTable columns={columns} data={bidIdRemapped} />
    </Card>
  );
}
