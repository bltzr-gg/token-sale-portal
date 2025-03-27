import { cn } from "@bltzr-gg/ui";
import { PropsWithAuction } from "@axis-finance/types";

import { ReferrerPopover } from "modules/referral/referrer-popover";

type ProjectInfoCardProps = PropsWithAuction &
  React.HTMLAttributes<HTMLDivElement> & {
    canRefer?: boolean;
  };

export function ProjectInfoCard({
  auction,
  children,
  ...props
}: ProjectInfoCardProps) {
  const description =
    auction.info?.description ?? "No description found for this project.";

  const canRefer = parseFloat(auction.referrerFee) > 0;

  return (
    <div
      className={cn(props.className, "flex h-full flex-col justify-between")}
      title={``}
    >
      <div className="flex justify-between">{children}</div>
      <div className="mb-4 flex">{description}</div>
      <div className="flex items-end justify-between space-x-4">
        {canRefer && <ReferrerPopover />}
      </div>
    </div>
  );
}
