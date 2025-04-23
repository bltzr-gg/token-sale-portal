import { useAuctionSuspense } from "@/hooks/use-auction";

export function AmountOutCell({ value }: { value: number }) {
  const { data: auction } = useAuctionSuspense();
  return (
    <>
      {value} ${auction.baseToken.symbol}
    </>
  );
}
