import { cn } from "@bltzr-gg/ui";
import { UsdToggle } from "components/usd-toggle";

type PageHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  backNavigationPath?: string;
  backNavigationText?: string;
  toggle?: boolean;
  toggleSymbol?: string;
};

export function PageHeader({
  className,
  children,
  toggle,
  toggleSymbol = "Quote",
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-2 grid-rows-2 items-center justify-between justify-items-center gap-y-4 lg:my-5 lg:mt-2 lg:flex lg:justify-center",
        className,
      )}
    >
      <div className="col-span-2 row-start-2 mx-auto ">{children}</div>

      {toggle && (
        <div className="flex w-full items-center justify-end lg:w-1/5 lg:pr-0">
          {<UsdToggle currencySymbol={toggleSymbol} />}
        </div>
      )}
    </div>
  );
}
