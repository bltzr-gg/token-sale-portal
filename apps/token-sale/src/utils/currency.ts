import { formatUnits } from "viem";

export const currencyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/* Trims decimal based on the number of decimal places */
export function trimCurrency(input: string | number): string {
  if (Number.isNaN(Number(input))) return "?";

  const value = Number(input);

  if (value === 0) return "0";

  if (!isFinite(value)) {
    throw new Error(`trimCurrency received infinite value:(${value})`);
  }

  if (value < 1 && value !== 0) {
    const absLog = -Math.floor(Math.log10(Math.abs(value)));
    const decimalPlaces = Math.min(8, absLog); // Allow at least 2 significant figures
    const adjustedValue = Number(value.toFixed(decimalPlaces));
    return adjustedValue.toString();
  } else {
    return currencyFormatter.format(value);
  }
}

/**
 * Formats a balance represented as a bigint to a string with specified options.
 * The function handles localization and number formatting based on provided options.
 *
 * @param {bigint} balance - The balance in the smallest unit.
 * @param {Object} [options] - Optional settings to format the balance.
 * @param {number} [options.decimals=18] - Number of decimals to consider for the balance.
 * @param {number} [options.precision=6] - Precision to display after the decimal point.
 * @param {string} [options.locale='en-US'] - Locale to use for formatting the number.
 * @returns {string} The formatted balance as a localized string.
 */
export const formatCurrencyUnits = (
  balance: bigint,
  options?: {
    decimals?: number;
    precision?: number;
    minPrecision?: number;
    locale?: string;
    symbol?: string;
    compact?: boolean; // Add this line for compact display option
  },
): string => {
  const optionsWithDefaults = Object.assign(
    {
      decimals: 18,
      precision: 6,
      minPrecision: 2,
      locale: "en-US",
      compact: false, // Default to false
    },
    options,
  );

  const formatted = formatUnits(balance, optionsWithDefaults.decimals);
  const dotIndex = formatted.indexOf(".");

  let trimmed;
  if (dotIndex !== -1) {
    const neededLength = dotIndex + optionsWithDefaults.precision + 1;
    trimmed =
      formatted.length > neededLength
        ? formatted.slice(0, neededLength)
        : formatted;
  } else {
    trimmed = formatted;
  }

  const currencyIsFiat = optionsWithDefaults.symbol?.includes("USD");
  const currencyIsToken = optionsWithDefaults.symbol && !currencyIsFiat;

  // Use Intl.NumberFormat to localize the number
  const number = parseFloat(trimmed);
  return `${currencyIsFiat ? "$" : ""}${new Intl.NumberFormat(
    optionsWithDefaults.locale,
    {
      minimumFractionDigits: Math.min(
        optionsWithDefaults.minPrecision,
        optionsWithDefaults.precision,
      ),
      maximumFractionDigits: optionsWithDefaults.precision,
      notation: optionsWithDefaults.compact ? "compact" : "standard", // Add this line to toggle notation
    },
  ).format(
    number,
  )}${optionsWithDefaults.symbol ? ` ${currencyIsToken ? "$" : ""}${optionsWithDefaults.symbol}` : ""}`;
};
