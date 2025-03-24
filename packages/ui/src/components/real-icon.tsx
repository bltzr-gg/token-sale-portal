import { cva } from 'class-variance-authority';
import { cn } from '@/lib/cn';

type Props = {
  border?: boolean;
  size?: 'lg' | 'md' | 'sm' | 'xs';
  className?: string;
};

const iconClass = cva(
  'ml-2 inline-flex flex-col items-center justify-center rounded-full bg-black text-primary',
  {
    variants: {
      border: {
        true: 'border-primary',
        false: 'border-black',
      },
      size: {
        lg: 'border-2 size-12 p-1.5 mt-1',
        md: 'border-2 size-8 p-1 mt-1',
        sm: 'border size-6 p-1 mt-1',
        xs: 'border size-5 p-[3px]',
      },
    },
    defaultVariants: {
      border: true,
      size: 'md',
    },
  },
);

const RealIcon = ({ border, size, className }: Props) => {
  return (
    <span className={cn(iconClass({ border, size }), className)}>
      <svg
        className="aspect-square"
        viewBox="0 4.25 26 13.5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 0.502 13.664 L 0.502 21.229 L 6.218 21.229 L 6.226 13.664 L 0.502 13.664 Z"
          fill="currentColor"
          transform="matrix(1, 0, 0, 1, 0, 8.881784197001252e-16)"
        />
        <path
          d="M 19.582 21.229 L 19.582 13.664 C 19.582 13.664 21.4 13.66 22.465 13.997 C 23.984 14.476 24.875 15.633 25.207 16.98 C 25.271 17.242 25.306 17.699 25.306 17.842 L 25.306 21.229 L 19.582 21.229 Z"
          fill="currentColor"
          transform="matrix(1, 0, 0, 1, 0, 8.881784197001252e-16)"
        />
        <path
          d="M 18.147 13.664 L 5.758 13.664 L 5.758 8.798 L 18.147 8.798 C 19.193 8.798 20.044 8.013 20.044 7.045 C 20.044 6.078 19.193 5.293 18.147 5.293 L 5.766 5.293 L 5.766 8.777 L 0.502 8.777 L 0.502 0.425 L 18.147 0.425 C 22.095 0.425 25.306 3.397 25.306 7.045 C 25.306 10.695 22.095 13.664 18.147 13.664 Z"
          fill="currentColor"
          transform="matrix(1, 0, 0, 1, 0, 8.881784197001252e-16)"
        />
      </svg>
    </span>
  );
};

export { RealIcon };
