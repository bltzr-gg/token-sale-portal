import { Tooltip } from "@bltzr-gg/ui";
import { trimCurrency } from "utils/currency";
import { LockClosedIcon, LockOpen1Icon } from "@radix-ui/react-icons";
import { AuctionBid } from "@/hooks/use-auction/transform";
import { useAuctionSuspense } from "@/hooks/use-auction";

type PriceCellProps = {
  value: number;
  bid: AuctionBid;
};

export function PriceCell({ value, bid }: PriceCellProps) {
  const { data: auction } = useAuctionSuspense();

  const amountOut = parseFloat(bid.settledAmountOut ?? "0");

  const isUserBid = amountOut && ["live", "concluded"].includes(auction.status);

  if (isUserBid) {
    value = Number(bid.amountIn) / amountOut;
  }

  let display = value ? (
    <>
      {value}
      <LockOpen1Icon />
    </>
  ) : (
    <>
      ████████ <LockClosedIcon />
    </>
  );

  if (!bid.rawSubmittedPrice && Number(bid.settledAmountInRefunded)) {
    display = <span className="text-feedback-alert">Cancelled</span>;
  }

  return (
    <Tooltip
      content={
        isUserBid ? (
          <>
            Your estimate payout out at this price is {trimCurrency(amountOut)}{" "}
            {auction.quoteToken.symbol}.<br />
            Only you can see your bid price until the auction concludes and
            settles.
          </>
        ) : (
          <>
            Other users&apos; bid prices are private until the auction concludes
            and settles.
          </>
        )
      }
    >
      <div className="flex items-center gap-x-1">{display}</div>
    </Tooltip>
  );
}
