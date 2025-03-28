import { AuctionCoreMetrics } from "../auction-core-metrics";
import { AuctionPurchase } from "../auction-purchase";

export function AuctionLive() {
  return (
    <div>
      <div className="motion-preset-slide-left  motion-delay-500">
        <AuctionCoreMetrics />
      </div>
      <div className="motion-preset-slide-right motion-delay-500 mt-8">
        <AuctionPurchase />
      </div>
    </div>
  );
}
