import { cn } from "@bltzr-gg/ui";
import { AxisWordmark } from "./axis-wordmark";

export function AppFooter() {
  return (
    <div className="max-w-limit mx-auto hidden w-full py-6 lg:block">
      <div
        className={cn(
          "flex h-12 items-center justify-between rounded-full",
          "bg-neutral-200 dark:bg-neutral-50",
        )}
      >
        <PoweredByAxis />
      </div>
    </div>
  );
}

function PoweredByAxis() {
  return (
    <div className="text-foreground ml-4 flex items-center dark:text-neutral-500">
      {" "}
      <a href="https://axis.finance/docs/overview">
        Powered by <AxisWordmark className="-mt-0.5 inline size-10" />
      </a>
    </div>
  );
}
