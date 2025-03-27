import { useEffect, useMemo, useState } from "react";
import { Badge, Metric } from "@bltzr-gg/ui";
import { getCountdown } from "utils";
import { useAuctionSuspense } from "@/hooks/use-auction";

export function CountdownChip() {
  const { data: auction } = useAuctionSuspense();
  const [now, setNow] = useState(new Date());
  const auctionStarted = useMemo(
    () => auction.start > now,
    [auction.start, now],
  );
  const inProgress = useMemo(() => now < auction.end, [auction.end, now]);
  const target = useMemo(
    () => (auctionStarted ? auction.end : auction.start),
    [auction.start, auction.end, auctionStarted],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (inProgress) {
        setNow(new Date());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [inProgress]);

  if (!inProgress) return null;

  return (
    <Badge size={"s"} className="">
      <Metric
        size={"s"}
        className="text-center"
        isLabelSpaced
        label={auctionStarted ? "Remaining" : "Upcoming in"}
        childrenClassName="min-w-[120px]"
      >
        {getCountdown(target)}
      </Metric>
    </Badge>
  );
}
