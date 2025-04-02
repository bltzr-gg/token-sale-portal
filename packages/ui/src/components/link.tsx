import { cn } from '@/lib/cn';
import React from 'react';

const Link = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'>
>((props, ref) => (
  <a
    target="_blank"
    rel="noopener"
    {...props}
    className={cn('inline leading-none hover:text-primary', props.className)}
    ref={ref}
  />
));

Link.displayName = 'Link';

export { Link };
