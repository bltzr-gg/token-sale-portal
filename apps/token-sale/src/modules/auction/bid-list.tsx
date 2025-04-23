import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { BlockExplorerLink } from "components/blockexplorer-link";
import { Button, Card, DataTable, Text } from "@bltzr-gg/ui";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { TransactionDialog } from "modules/transaction/transaction-dialog";
import { LoadingIndicator } from "modules/app/loading-indicator";
import React, { useMemo } from "react";
import { useAuctionSuspense } from "@/hooks/use-auction";
import { useBidIndex } from "./hooks/use-bid-index";
import { format } from "date-fns";
import { useStorageBids } from "state/bids/handlers";
import { CSVDownloader } from "components/csv-downloader";
import { arrayToCSV } from "utils/csv";
import { PriceCell } from "./cells/PriceCell";
import { AmountInCell } from "./cells/AmountInCell";
import { AmountOutCell } from "./cells/AmountOutCell";
import { FilterIcon } from "lucide-react";
import { auctionHouse } from "@/constants/contracts";
import { AuctionBid } from "@/hooks/use-auction/types";
import { AUCTION_CHAIN_ID } from "../../app-config";
import { sortBy } from "lodash";

export const bidListColumnHelper = createColumnHelper<AuctionBid>();

export const timestampCol = bidListColumnHelper.accessor("blockTimestamp", {
  header: "Date",
  enableSorting: true,
  cell: (info) => {
    // Convert to Date
    const date = new Date(Number(info.getValue()) * 1000);

    // Format to YYYY.MM.DD
    const dateString = format(date, "yyyy.MM.dd");
    const timeString = format(date, "HH:mm z");

    return (
      <div className="flex flex-col items-start">
        <Text size="sm">{dateString}</Text>
        <Text size="xs" color="secondary">
          {timeString}
        </Text>
      </div>
    );
  },
});
const priceCol = bidListColumnHelper.accessor("submittedPrice", {
  header: "Bid Price",
  enableSorting: true,

  cell: (info) => {
    return (
      <PriceCell bid={info.row.original} value={Number(info.getValue())} />
    );
  },
});

export const amountInCol = bidListColumnHelper.accessor("amountIn", {
  header: "Amount In",
  enableSorting: true,
  cell: (info) => <AmountInCell value={+info.getValue()} />,
});

export const amountOutCol = bidListColumnHelper.accessor("rawAmountOut", {
  header: "Amount Out",
  enableSorting: true,
  cell: (info) => <AmountOutCell value={+info.getValue()!} />,
});

export const bidderCol = bidListColumnHelper.accessor("bidder", {
  header: "Bidder",
  enableSorting: true,
  cell: (info) => {
    // Define the outcome or status of the bid
    const bid = info.row.original;
    const bidStatus = bid.status;
    const bidOutcome = bid.outcome;
    const amountOut = bid.settledAmountOut;
    const isRefunded = bidStatus === "claimed" && !amountOut;
    const status = isRefunded ? "refunded" : bidOutcome;
    const statusColour =
      status === "won" || status === "won - partial fill"
        ? "text-green-500"
        : "text-red-500";
    const cancelledBid =
      !bid.rawSubmittedPrice && Number(bid.settledAmountInRefunded);

    return (
      <div className="flex flex-col">
        <BlockExplorerLink
          chainId={AUCTION_CHAIN_ID}
          address={info.getValue()}
          icon={true}
          trim
        />
        {!cancelledBid && (
          <Text size="xs" className={statusColour}>
            {status}
          </Text>
        )}
      </div>
    );
  },
});

const fixedPriceCols = [
  timestampCol,
  amountInCol,
  amountOutCol,
  bidderCol,
] as const;
const sealedBidCols = [timestampCol, priceCol, amountInCol, bidderCol] as const;

const screens = {
  idle: {
    title: "Refund Bid",
    Component: () => (
      <div className="text-center">
        Are you sure you want to refund this bid?
      </div>
    ),
  },
  success: {
    title: "Transaction Confirmed",
    Component: () => <div className="text-center">Bid refunded!</div>,
  },
};

export function BidList() {
  const { data: auction, refetch: refetchAuction } = useAuctionSuspense();
  const { address } = useAccount();

  const cols = auction?.marginalPrice ? sealedBidCols : fixedPriceCols;

  const userBids = useStorageBids({
    auctionId: auction.id,
    address,
  });

  const refund = useWriteContract();
  const refundReceipt = useWaitForTransactionReceipt({ hash: refund.data });
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [bidToRefund, setBidToRefund] = React.useState<AuctionBid>();
  const [onlyUserBids, setOnlyUserBids] = React.useState(false);
  const { index: bidIndex } = useBidIndex(BigInt(bidToRefund?.bidId ?? -1));

  const mappedBids = useMemo(
    () =>
      sortBy(
        auction.bids
          .filter(
            (b) =>
              !onlyUserBids ||
              address?.toLowerCase() === b.bidder.toLowerCase(),
          )
          .map((bid) => {
            //Checks if its a user bid and in local storage
            const storedBid =
              userBids.find(
                (storageBid) =>
                  storageBid.bidId === bid.bidId &&
                  bid.bidder.toLowerCase() === address?.toLowerCase(),
              ) ?? {};

            return {
              ...bid,
              ...storedBid,
              auction: auction,
            };
          }),
        (bid) => -new Date(bid.date).getTime(),
      ),
    [onlyUserBids, address, userBids, auction],
  );

  const isLoading = refund.isPending || refundReceipt.isLoading;

  const handleRefund = (bidId?: string) => {
    if (bidId === undefined || bidIndex === undefined) {
      throw new Error("Unable to get bidId for refund");
    }

    refund.writeContract({
      abi: auctionHouse.abi,
      address: auctionHouse.address,
      functionName: "refundBid",
      args: [BigInt(auction.lotId), BigInt(bidId), BigInt(bidIndex)],
    });
  };

  // Add a refund button to the columns
  const columns = React.useMemo(
    () => [
      ...cols,
      bidListColumnHelper.display({
        id: "actions",
        cell: (info) => {
          const bid = info.row.original;
          const isLive = auction.status === "live";
          if (!address || !isLive) return;
          if (bid.bidder.toLowerCase() !== address.toLowerCase()) return;
          if (bid.status === "claimed" && !bid.settledAmountOut) return;
          // Can refund if the auction is live, other "refunds" are handled by claim bids after the auction ends

          const isCurrentBid = bidToRefund?.bidId === bid.bidId;

          if (isLive) {
            return (
              <Button
                size="sm"
                onClick={() => {
                  setBidToRefund(bid);
                  setDialogOpen(true);
                }}
              >
                {isLoading && isCurrentBid ? (
                  <div className="flex items-center gap-x-1">
                    <p>Waiting</p>
                    <LoadingIndicator className="size-4 fill-black" />
                  </div>
                ) : (
                  "Refund"
                )}
              </Button>
            );
          }
        },
      }),
    ],
    [auction.status, address, bidToRefund?.bidId, isLoading],
  );

  React.useEffect(() => {
    if (refund.isSuccess) {
      refetchAuction();
    }
  }, [refetchAuction, refund.isSuccess]);

  // Format bids for CSV download
  const [headers, body] = React.useMemo(() => {
    const values = auction.bids.map((b) => ({
      date: b.date,
      amountIn: b.amountIn,
      settledAmountOut: b.settledAmountOut,
      submittedPrice: b.submittedPrice,
      bidder: b.bidder,
    }));

    return arrayToCSV(values ?? []);
  }, [auction]);

  return (
    <div className="motion-preset-slide-up">
      <Card
        headerRightElement={
          <div className="flex justify-end gap-3 px-3 py-2">
            <Button
              variant="ghost"
              className="min-w-0"
              onClick={() => setOnlyUserBids((prev) => !prev)}
            >
              <FilterIcon className="mr-1" />
              {onlyUserBids ? "My" : "All"} Bids
            </Button>
            <Button asChild variant="ghost" className="min-w-0">
              <CSVDownloader
                tooltip="Download this bid history in CSV format."
                filename={`bids-${auction.type}-${auction.id}`}
                headers={headers}
                data={body}
              />
            </Button>
          </div>
        }
        title={"Bid History"}
      >
        <DataTable
          emptyText={
            auction.status == "created" || auction.status == "live"
              ? "No bids yet"
              : onlyUserBids
                ? "No bids from this address"
                : "No bids received"
          }
          // hate doing a cast here but the type error is too huge/complex
          columns={columns as ColumnDef<AuctionBid>[]}
          data={mappedBids}
        />

        <TransactionDialog
          signatureMutation={refund}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) refund.reset();
          }}
          onConfirm={() => handleRefund(bidToRefund?.bidId)}
          mutation={refundReceipt}
          chainId={auction.chainId}
          hash={refund.data}
          error={refundReceipt.error}
          disabled={isLoading}
          screens={screens}
        />
      </Card>
    </div>
  );
}
