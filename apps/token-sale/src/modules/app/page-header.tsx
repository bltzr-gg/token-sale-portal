import { cn } from "@bltzr-gg/ui";

type PageHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  backNavigationPath?: string;
  backNavigationText?: string;
};

export function PageHeader({ className, children }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-2 grid-rows-2 items-center justify-between justify-items-center gap-y-4 lg:my-5 lg:mt-2 lg:flex lg:justify-center",
        className,
      )}
    >
      <div className="col-span-2 row-start-2 mx-auto ">{children}</div>
    </div>
  );
}
