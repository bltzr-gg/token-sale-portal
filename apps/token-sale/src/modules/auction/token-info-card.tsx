import { Card, Metric } from "@bltzr-gg/ui";
import { useBaseDTLCallback } from "modules/auction/hooks/use-base-dtl-callback";
import { AuctionMetrics } from "./auction-metrics";
import { AuctionMetric } from "./auction-metric";
import { useBaselineDTLCallback } from "./hooks/use-baseline-dtl-callback";
import { useAuctionSuspense } from "@/hooks/use-auction";

export function TokenInfoCard() {
  const { data: auction } = useAuctionSuspense();
  const { data: dtlCallbackConfiguration } = useBaseDTLCallback({
    chainId: auction.chainId,
    lotId: auction.lotId.toString(),
    baseTokenDecimals: auction.baseToken.decimals,
    callback: auction.callbacks,
  });
  const { data: baselineCallbackConfiguration } = useBaselineDTLCallback({
    chainId: auction.chainId,
    lotId: auction.lotId.toString(),
    callback: auction.callbacks,
  });

  const isVested = !!auction.linearVesting;

  return (
    <Card title="Token Info">
      <AuctionMetrics className="mt-4">
        <AuctionMetric id="minPriceFDV" />
        <AuctionMetric id="totalSupply" />
        <AuctionMetric id="tokensAvailable" />
        {isVested && <AuctionMetric id="vestingDuration" />}
        {dtlCallbackConfiguration && (
          // TODO fix alignment of metric title
          <Metric
            label="Direct to Liquidity"
            size="m"
            tooltip="The percentage of proceeds that will be automatically deposited into the liquidity pool"
          >
            {dtlCallbackConfiguration.proceedsUtilisationPercent * 100}%
          </Metric>
        )}
        {baselineCallbackConfiguration && (
          // TODO fix alignment of metric title
          <Metric
            label="Direct to Liquidity"
            size="m"
            tooltip="The percentage of proceeds that will be automatically deposited into the liquidity pool"
          >
            {baselineCallbackConfiguration.poolPercent * 100}%
          </Metric>
        )}
      </AuctionMetrics>
    </Card>
  );
}
