import { FormField } from "@bltzr-gg/ui";
import { useFormContext } from "react-hook-form";
import { TokenAmountInput } from "components/token-amount-input";
import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { BidForm } from "./auction-purchase";
import { useAuctionSuspense } from "@/hooks/use-auction";
import { AuctionType } from "@axis-finance/types";

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
  const [bidPrice, setBidPrice] = useState<string>("");

  const getMinAmountOut = (amountIn: bigint, price: bigint): bigint => {
    if (!amountIn || !price) {
      return BigInt(0);
    }

    return (amountIn * parseUnits("1", auction.baseToken.decimals)) / price;
  };

  const handleAmountOutChange = (amountIn: bigint) => {
    const price =
      auction.type === AuctionType.SEALED_BID
        ? parseUnits(bidPrice, auction.quoteToken.decimals)
        : parseUnits(auction.fixedPrice!.price, auction.baseToken.decimals);

    const minAmountOut = getMinAmountOut(amountIn, price);
    const minAmountOutDecimal = formatUnits(
      minAmountOut,
      auction.baseToken.decimals,
    );
    form.setValue("baseTokenAmount", minAmountOutDecimal);
  };

  return (
    <div className="grid lg:grid-cols-2 lg:gap-3">
      <FormField
        name="quoteTokenAmount"
        control={form.control}
        render={({ field }) => (
          <div>
            <TokenAmountInput
              {...field}
              disabled={disabled}
              label="Spend Amount"
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
            <p className="text-destructive -mt-2 ml-2 empty:hidden">
              {form.formState.errors.quoteTokenAmount?.message}
            </p>
          </div>
        )}
      />
      {auction.type === AuctionType.SEALED_BID && (
        <FormField
          name="bidPrice"
          control={form.control}
          render={({ field }) => (
            <div>
              <TokenAmountInput
                {...field}
                label="Bid Price"
                tokenLabel={`${auction.quoteToken.symbol} per ${auction.baseToken.symbol}`}
                disabled={disabled}
                disableMaxButton={true}
                token={auction.quoteToken}
                onChange={(e) => {
                  field.onChange(e);
                  // Update amount out value
                  const rawPrice = e as string;
                  setBidPrice(rawPrice);
                  const price = parseUnits(
                    rawPrice,
                    auction.quoteToken.decimals,
                  );

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
                }}
              />
              <p className="text-destructive -mt-2 ml-2 empty:hidden">
                {form.formState.errors.bidPrice?.message}
              </p>
            </div>
          )}
        />
      )}
    </div>
  );
}
