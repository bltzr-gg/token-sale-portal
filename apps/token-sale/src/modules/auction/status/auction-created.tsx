import { AuctionCoreMetrics } from "../auction-core-metrics";

export function AuctionCreated() {
  return (
    <div className="auction-action-container h-full items-stretch justify-center gap-x-4 lg:flex">
      <div className="w-full ">
        <AuctionCoreMetrics />
      </div>
    </div>
  );
}
