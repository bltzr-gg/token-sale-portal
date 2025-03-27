import { Badge, cn } from "@bltzr-gg/ui";
import { AuctionStatus } from "@axis-finance/types";

/** Displays a indicator with the auction's current status */
export function AuctionStatusBadge({
  status,
  className,
  large = false,
}: {
  status: AuctionStatus;
  large?: boolean;
} & React.HTMLAttributes<HTMLParagraphElement>) {
  const isLiveOrRegistering = ["live", "registering"].includes(status);

  return (
    <Badge
      size={status === "live" && large ? "xl" : "m"}
      className={cn(className)}
      color={isLiveOrRegistering ? "active" : "ghost"}
    >
      {status}
    </Badge>
  );
}
