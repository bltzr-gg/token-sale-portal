import { useEffect, useRef, useState } from "react";

interface UseAnimatedNumberOptions {
  duration?: number;
  decimals?: number;
  locale?: string;
  compact?: boolean;
  delay?: number;
  easing?: "linear" | "ease-in" | "ease-out";
}

const parseNumber = (value: string | number | bigint) =>
  typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);

// Easing functions
const easingFunctions = {
  linear: (t: number) => t,
  "ease-in": (t: number) => t * t,
  "ease-out": (t: number) => t * (2 - t),
};

export const useAnimatedNumber = (
  value: number | bigint | string,
  options: UseAnimatedNumberOptions = {},
) => {
  const {
    duration = 350,
    decimals = 0,
    locale,
    delay = 0,
    easing = "linear",
  } = options;
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef<number>(0);

  useEffect(() => {
    const startValue = previousValueRef.current;
    let start: number;
    let rAF: number;

    const animate = (timestamp: number) => {
      if (!start) {
        start = timestamp;
      }
      const progress = timestamp - start;
      const progressPercentage = Math.min(progress / duration, 1);

      // Use the easing function based on the selected easing type
      const easedProgress = easingFunctions[easing](progressPercentage);

      let currentNumber =
        startValue + easedProgress * (parseNumber(value) - startValue);

      if (isNaN(currentNumber)) {
        currentNumber = 0;
      }

      setDisplayValue(currentNumber);

      if (progress < duration) {
        rAF = requestAnimationFrame(animate);
      }
    };

    // Set a delay before starting the animation
    const timeoutId = setTimeout(() => {
      rAF = requestAnimationFrame(animate);
    }, delay);

    // Update the previous value reference
    const parsedValue = parseNumber(value);
    previousValueRef.current = isNaN(parsedValue) ? 0 : parsedValue;

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rAF);
    };
  }, [value, duration, delay, easing]);

  const finalDisplayValue = isNaN(displayValue) ? 0 : displayValue;

  // Localize the number using Intl.NumberFormat
  const formattedValue = locale
    ? new Intl.NumberFormat(locale, {
        notation: options.compact ? "compact" : "standard",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(finalDisplayValue)
    : finalDisplayValue.toFixed(decimals);

  return formattedValue;
};
