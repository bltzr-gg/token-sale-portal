import { useAuctionSuspense } from "@/hooks/use-auction";
import { useBaseDTLCallback } from "./hooks/use-base-dtl-callback";
import { useBaselineDTLCallback } from "./hooks/use-baseline-dtl-callback";

export function DtlProceedsDisplay() {
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

  const utilizationAmount =
    dtlCallbackConfiguration?.proceedsUtilisationPercent ??
    baselineCallbackConfiguration?.poolPercent ??
    0;

  return `${utilizationAmount * 100}%`;
}
