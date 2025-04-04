import { cn } from '@/lib/cn';
import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

const TooltipProvider = TooltipPrimitive.Provider;

const TooltipRoot = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'font-aeonpro z-50 overflow-hidden rounded-md bg-light px-3 py-1.5 text-xs text-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    {...props}
  />
));

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

function Tooltip(
  props: React.PropsWithChildren<{
    content: React.ReactNode;
    triggerClassName?: string;
    contentClassName?: string;
    asChild?: boolean;
  }>,
) {
  if (!props.content) return <>{props.children}</>;
  return (
    <TooltipRoot>
      <TooltipTrigger
        className={cn('cursor-help', props.triggerClassName)}
        asChild={!!props.asChild}
      >
        {props.children}
      </TooltipTrigger>
      <TooltipContent className={cn('max-w-xs', props.contentClassName)}>
        <p>{props.content}</p>
      </TooltipContent>
    </TooltipRoot>
  );
}

export {
  Tooltip,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
};
