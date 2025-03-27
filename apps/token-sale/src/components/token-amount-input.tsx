import React from "react";
import type { Token } from "@axis-finance/types";
import { Text, Button, cn, NumberInput, NumberInputProps } from "@bltzr-gg/ui";
import { UsdAmount } from "modules/auction/usd-amount";
import { Format } from "./format";

type TokenAmountInputProps = React.HTMLProps<HTMLInputElement> & {
  /** the input's label */
  label: string;
  /** the input's token label, defaults to the token's symbol */
  tokenLabel?: string;
  /** the input's token type */
  token?: Token;
  /** whether to show the USD price of the token */
  showUsdPrice?: boolean;
  /** the user's balance */
  balance?: string | number;
  /** limit on how much the user can spend */
  limit?: string;
  /** an optional error message */
  error?: string;
  /** an optional status message */
  message?: string;
  /** the current input value */
  value?: string | undefined;
  /** whether to disable the input */
  disabled?: boolean;
  /** whether to disable the max button */
  disableMaxButton?: boolean;
  /** callback when the max button is clicked */
  onClickMaxButton?: () => void;
  /** the prefix to add to the amount */
  amountPrefix?: string;

  onChange: NumberInputProps["onChange"];
};

export const TokenAmountInput = React.forwardRef<
  HTMLInputElement,
  TokenAmountInputProps
>(
  (
    {
      label,
      token,
      showUsdPrice = true,
      tokenLabel = token?.symbol,
      balance,
      limit,
      error,
      message,
      value,
      disabled,
      disableMaxButton,
      onClickMaxButton,
      amountPrefix,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={cn(
          "border-light group rounded border-2 p-4",
          error && "border-feedback-alert",
          disabled && "opacity-50",
        )}
      >
        <div className="flex">
          <div className="flex-start">
            <Text uppercase color="secondary">
              {label}
            </Text>
          </div>
        </div>
        <div className="mt-0.5 flex items-center">
          <Text size="xl" className="font-light">
            {amountPrefix}
          </Text>
          <NumberInput
            value={value === undefined ? "" : value}
            disabled={disabled}
            placeholder="0"
            className={cn("w-full pl-3", error && "text-feedback-alert")}
            style={{ padding: 0 }}
            {...props}
            size="md"
            ref={ref}
            endAdornment={
              <Text className="text-nowrap" color="secondary" size="lg">
                {tokenLabel}{" "}
              </Text>
            }
          />

          {!disableMaxButton && (
            <Button
              className="mx-3"
              disabled={disabled}
              variant="outline"
              size="sm"
              onClick={() => {
                onClickMaxButton?.();
              }}
            >
              Max
            </Button>
          )}
        </div>
        <div className="flex justify-between">
          {token && showUsdPrice && (
            <div className="flex items-start">
              <Text size="xs" color="secondary">
                {!value && "≈ $0"}
                {value && "≈ "}
                {value && <UsdAmount token={token} amount={Number(value)} />}
              </Text>
            </div>
          )}
          {balance && (
            <div className="gap-x-sm">
              <Text size="xs" color="secondary" uppercase>
                {limit ? `Limit: ${limit}` : ""}
              </Text>
              <Text size="xs" color="secondary" uppercase>
                Balance: <Format value={balance} />
              </Text>
            </div>
          )}
        </div>
        {error && (
          <div className="bg-feedback-alert mt-1.5 rounded p-2">
            <Text color="tertiary">{error}</Text>
          </div>
        )}

        {message && (
          <div className="mt-1.5 rounded border border-neutral-500 p-2">
            <Text>{message}</Text>
          </div>
        )}
      </div>
    );
  },
);

TokenAmountInput.displayName = "TokenAmountInput";
