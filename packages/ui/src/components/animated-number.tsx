import type { FC } from "react";

import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

type AnimatedNumberProps = {
  value: number | bigint | string;
  duration?: number;
  className?: string;
  decimals?: number;
};

const AnimatedNumber: FC<AnimatedNumberProps> = ({
  value,
  duration = 350,
  className,
  decimals = 0,
}) => {
  const animatedNumber = useAnimatedNumber(value, {
    duration,
    decimals,
    locale: "en-US",
  });

  return <span className={className}>{animatedNumber}</span>;
};

export { AnimatedNumber };
