import { Address, CallbacksType } from "@axis-finance/types";
import { useBaseDTLCallback } from "../hooks/use-base-dtl-callback";
import useERC20Balance from "loaders/use-erc20-balance";
import { formatUnits } from "viem";
import { trimCurrency } from "utils/currency";
import { Text } from "@bltzr-gg/ui";
import { useEffect } from "react";
import { useAuctionSuspense } from "@/hooks/use-auction";

export function SettleAuctionDtlCallbackBalance({
  setHasSufficientBalanceForCallbacks,
}: {
  setHasSufficientBalanceForCallbacks: (hasSufficientBalance: boolean) => void;
}) {
  const { data: auction } = useAuctionSuspense();
  const { data: dtlCallbackConfiguration } = useBaseDTLCallback({
    chainId: auction.chainId,
    lotId: auction.lotId.toString(),
    baseTokenDecimals: auction.baseToken.decimals,
    callback: auction.callbacks,
  });
  // Get the balance of the base token
  // This is used as settlement may result in the seller transferring the base token to a DTL callback
  const { data: sellerBaseTokenBalance } = useERC20Balance({
    tokenAddress: auction.baseToken.address,
    balanceAddress: auction.seller as Address,
  });

  const sellerBaseTokenBalanceDecimal: number = sellerBaseTokenBalance
    ? Number(formatUnits(sellerBaseTokenBalance, auction.baseToken.decimals))
    : 0;
  const hasSufficientBalanceForCallbacks: boolean =
    // No callback
    auction.callbacksType == CallbacksType.NONE ||
    // Not a DTL callback
    (auction.callbacksType != CallbacksType.UNIV2_DTL &&
      auction.callbacksType != CallbacksType.UNIV3_DTL) ||
    // Sufficient balance for the DTL callback
    (sellerBaseTokenBalanceDecimal > 0 &&
      dtlCallbackConfiguration !== undefined &&
      sellerBaseTokenBalanceDecimal >=
        Number(auction.capacity) *
          dtlCallbackConfiguration.proceedsUtilisationPercent);

  // Pass the result to the parent component
  useEffect(() => {
    setHasSufficientBalanceForCallbacks(hasSufficientBalanceForCallbacks);
  }, [hasSufficientBalanceForCallbacks, setHasSufficientBalanceForCallbacks]);

  return (
    !hasSufficientBalanceForCallbacks && (
      <div>
        <Text size="xs" className="text-feedback-alert">
          The seller has insufficient balance (
          {trimCurrency(sellerBaseTokenBalanceDecimal)}) of the payout token to
          settle the auction, since a Direct to Liquidity callback is enabled.
        </Text>
      </div>
    )
  );
}
