import { AuctionCoreMetrics } from "../auction-core-metrics";

export function AuctionLivePreview() {
  return (
    <div className="flex w-[1024px] items-center justify-center gap-y-8">
      <AuctionCoreMetrics />
    </div>
  );
}
