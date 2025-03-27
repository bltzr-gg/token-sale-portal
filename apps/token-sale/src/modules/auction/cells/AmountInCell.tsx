import { ToggledUsdAmount } from "../toggled-usd-amount";
import { useToggle } from "../hooks/use-toggle";
import { useAuctionSuspense } from "@/hooks/use-auction";

export function AmountInCell({ value }: { value: number }) {
  const { data: auction } = useAuctionSuspense();
  const { isToggled } = useToggle();
  return (
    <>
      <ToggledUsdAmount format token={auction.quoteToken} amount={value} />{" "}
      {!isToggled && auction.quoteToken.symbol}
    </>
  );
}
