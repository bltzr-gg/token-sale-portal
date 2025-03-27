import React from "react";
import { formatUnits } from "viem";
import { Card, DataTable } from "@bltzr-gg/ui";
import { CSVDownloader } from "components/csv-downloader";
import { arrayToCSV } from "utils/csv";
import {
  amountInCol,
  bidListColumnHelper,
  bidderCol,
  timestampCol,
} from "./bid-list";
import { Format } from "components/format";
import { useAuctionSuspense } from "@/hooks/use-auction";

export function PurchaseList() {
  const { data: auction } = useAuctionSuspense();

  const amountOutCol = bidListColumnHelper.accessor("settledAmountOut", {
    header: "Amount Out",
    cell: (info) => {
      return (
        <>
          <Format value={info.getValue() ?? 0} /> {auction.baseToken.symbol}
        </>
      );
    },
  });

  const columns = [timestampCol, amountInCol, amountOutCol, bidderCol];

  const bids = auction.bids.map((b) => ({
    ...b,
    settledAmountOut:
      auction.status === "settled"
        ? b.settledAmountOut
        : formatUnits(BigInt(b.rawAmountOut ?? 0), auction.baseToken.decimals),
    auction,
  }));

  const [headers, body] = React.useMemo(() => {
    const values = bids.map((b) => ({
      date: b.date,
      amountIn: b.amountIn,
      settledAmountOut: b.settledAmountOut,
      bidder: b.bidder,
    }));

    return arrayToCSV(values ?? []);
  }, [bids]);

  return (
    <Card className="relative" title={"Purchase History"}>
      <CSVDownloader
        tooltip="Download this bid history in CSV format."
        filename={`purchases-${auction.type}-${auction.id}`}
        headers={headers}
        data={body}
      />
      <DataTable
        emptyText={
          auction.status == "created" || auction.status == "live"
            ? "No purchases yet"
            : "No purchases received"
        }
        columns={columns}
        data={bids}
      />
    </Card>
  );
}
