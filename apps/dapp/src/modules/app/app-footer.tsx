import { Link } from "@bltzr-gg/ui";
import AxisWordmark from "./axis-wordmark";

export function AppFooter() {
  return (
    <div className="pb-5">
      <div className="bg-lighter flex h-12 items-center justify-end rounded-full px-5">
        <PoweredByAxis />
      </div>
    </div>
  );
}

function PoweredByAxis() {
  return (
    <span className="text-foreground">
      <Link href="https://axis.finance/docs/overview">
        Powered by{" "}
        <AxisWordmark className="fill-foreground -mt-0.5 inline size-10" />
      </Link>
    </span>
  );
}
