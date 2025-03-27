import { FormField } from "@bltzr-gg/ui";
import { useFormContext } from "react-hook-form";
import { TokenAmountInput } from "components/token-amount-input";
import { trimCurrency } from "utils/currency";
import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { BidForm } from "./auction-purchase";
import { useAuctionSuspense } from "@/hooks/use-auction";

export function AuctionBidInput({
  balance = BigInt(0),
  limit,
  disabled,
}: {
  balance?: bigint;
  limit?: bigint;
  disabled?: boolean;
}) {
  const { data: auction } = useAuctionSuspense();
  const form = useFormContext<BidForm>();

  const [formAmount] = form.watch(["quoteTokenAmount"]);

  const [minAmountOutFormatted, setMinAmountOutFormatted] =
    useState<string>("");
  const [bidPrice, setBidPrice] = useState<string>("");

  const showAmountOut =
    form.formState.isValid && isFinite(Number(minAmountOutFormatted));

  const getMinAmountOut = (amountIn: bigint, price: bigint): bigint => {
    if (!amountIn || !price) {
      return BigInt(0);
    }

    return (amountIn * parseUnits("1", auction.baseToken.decimals)) / price;
  };

  const handleAmountOutChange = (amountIn: bigint) => {
    const minAmountOut = getMinAmountOut(
      amountIn,
      parseUnits(bidPrice, auction.quoteToken.decimals),
    );
    const minAmountOutDecimal = formatUnits(
      minAmountOut,
      auction.baseToken.decimals,
    );
    form.setValue("baseTokenAmount", minAmountOutDecimal);
    setMinAmountOutFormatted(trimCurrency(minAmountOutDecimal));
  };

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <FormField
        name="quoteTokenAmount"
        control={form.control}
        render={({ field }) => (
          <TokenAmountInput
            {...field}
            disabled={disabled}
            label="Spend Amount"
            balance={formatUnits(balance, auction.quoteToken.decimals)}
            limit={
              limit
                ? trimCurrency(formatUnits(limit, auction.quoteToken.decimals))
                : undefined
            }
            token={auction.quoteToken}
            onChange={(e) => {
              field.onChange(e);

              // Display USD value of input amount
              const rawAmountIn = e as string;
              // Update amount out value
              handleAmountOutChange(
                parseUnits(rawAmountIn, auction.quoteToken.decimals),
              );
            }}
            onClickMaxButton={() => {
              // Take the minimum of the balance and the limit
              let maxSpend = balance;
              if (limit) {
                maxSpend = balance < limit ? balance : limit;
              }

              const maxSpendStr = formatUnits(
                maxSpend,
                auction.quoteToken.decimals,
              );

              form.setValue("quoteTokenAmount", maxSpendStr);
              // Force re-validation
              form.trigger("quoteTokenAmount");

              // Update amount out value
              handleAmountOutChange(maxSpend);
            }}
          />
        )}
      />
      <FormField
        name="bidPrice"
        control={form.control}
        render={({ field }) => (
          <TokenAmountInput
            {...field}
            label="Bid Price"
            tokenLabel={`${auction.quoteToken.symbol} per ${auction.baseToken.symbol}`}
            disabled={disabled}
            disableMaxButton={true}
            token={auction.quoteToken}
            message={
              showAmountOut
                ? `If successful, you will receive at least: ${trimCurrency(minAmountOutFormatted)} ${auction.baseToken.symbol}`
                : ""
            }
            onChange={(e) => {
              field.onChange(e);
              // Update amount out value
              const rawPrice = e as string;
              setBidPrice(rawPrice);
              const price = parseUnits(rawPrice, auction.quoteToken.decimals);

              let spendAmount = formAmount;

              if (formAmount === undefined || formAmount === "") {
                spendAmount = "0";
              }

              const minAmountOut = getMinAmountOut(
                parseUnits(spendAmount, auction.quoteToken.decimals),
                price,
              );
              const minAmountOutDecimal = formatUnits(
                minAmountOut,
                auction.baseToken.decimals,
              );
              form.setValue("baseTokenAmount", minAmountOutDecimal);
              setMinAmountOutFormatted(trimCurrency(minAmountOutDecimal));
            }}
          />
        )}
      />
    </div>
  );
}
