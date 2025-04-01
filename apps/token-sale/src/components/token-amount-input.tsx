import React from "react";
import type { Token } from "@/hooks/use-auction/types";
import { Text, Button, cn, NumberInput, NumberInputProps } from "@bltzr-gg/ui";

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
      tokenLabel = token?.symbol,
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
          "border-light group rounded border-2 px-4 py-2",
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
          {token && (
            <div className="flex items-start">
              <Text size="xs" color="secondary">
                {!value && "≈ $0"}
                {value && "≈ "}
                {value}
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
