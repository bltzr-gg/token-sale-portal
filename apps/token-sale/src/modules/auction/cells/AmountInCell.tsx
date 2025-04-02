import { useAuctionSuspense } from "@/hooks/use-auction";

export function AmountInCell({ value }: { value: number }) {
  const { data: auction } = useAuctionSuspense();
  return (
    <>
      {value} ${auction.quoteToken.symbol}
    </>
  );
}
