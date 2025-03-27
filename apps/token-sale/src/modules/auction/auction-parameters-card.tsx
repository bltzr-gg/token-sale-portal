import React from "react";
import { Link } from "react-router-dom";
import { Button, Card, IconedLabel, cn } from "@bltzr-gg/ui";
import { AuctionMetric } from "./auction-metric";
import { AuctionStatusBadge } from "./auction-status-badge";
import { CountdownChip } from "./countdown-chip";
import { useAuctionSuspense } from "@/hooks/use-auction";

type AuctionCardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Whether the card renders in list or grid view */
  isGrid?: boolean;
  /** Added to control the button in previews */
  disabledViewButton?: boolean;
};

function AuctionCardDetails(props: {
  isGrid?: boolean;
  disabledViewButton?: boolean;
}) {
  const { data: auction } = useAuctionSuspense();
  const detailsPageUrl = `${auction.chainId}/${auction?.lotId}`;
  const isLive = auction.status === "live";

  return (
    <div className={cn("flex w-full flex-col justify-between")}>
      <div>
        <div className={cn("mb-4 flex items-center justify-between ")}>
          <IconedLabel large alt={auction.baseToken.symbol}>
            {auction.baseToken.symbol}
          </IconedLabel>

          {isLive ? (
            <CountdownChip />
          ) : (
            <AuctionStatusBadge status={auction.status} />
          )}
        </div>
      </div>

      <AuctionMetric id="targetRaise" />
      <AuctionMetric id="minRaise" />
      <AuctionMetric id="minPrice" size="s" />
      <AuctionMetric id="tokensAvailable" size="s" />

      <div className={cn("mt-4 flex items-end justify-center")}>
        <Link className={"flex self-end"} to={detailsPageUrl}>
          <Button
            disabled={props.disabledViewButton}
            size="lg"
            className={"self-end uppercase transition-all "}
          >
            View Launch
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function AuctionParameterCard({ ...props }: AuctionCardProps) {
  return (
    <Card
      className={cn(
        "border-surface-outline group size-full overflow-hidden ",
        props.className,
      )}
    >
      <div className={cn("flex h-full gap-x-8")}>
        <AuctionCardDetails
          isGrid={props.isGrid}
          disabledViewButton={props.disabledViewButton}
        />
      </div>
    </Card>
  );
}
