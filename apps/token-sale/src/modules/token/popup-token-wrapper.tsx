import { Popover, PopoverTrigger } from "@bltzr-gg/ui";
import { TokenWrapper } from "./token-wrapper";
import { getChainById } from "utils/chain";
import { Auction, useAuctionSuspense } from "@/hooks/use-auction";

export function PopupTokenWrapper() {
  const { data: auction } = useAuctionSuspense();
  const { nativeCurrency } = getChainById(auction.chainId);
  const isQuoteAGasToken = isQuoteAWrappedGasToken(auction);

  if (isQuoteAGasToken && nativeCurrency.wrapperContract) {
    return (
      <Popover>
        <PopoverTrigger>
          <TokenWrapper />
        </PopoverTrigger>
      </Popover>
    );
  }

  return null;
}

export function isQuoteAWrappedGasToken(
  auction: Pick<Auction, "quoteToken" | "chainId">,
) {
  const quoteSymbol = auction.quoteToken.symbol.toLowerCase();
  const { nativeCurrency } = getChainById(auction.chainId);
  return `w${nativeCurrency.symbol}`.toLowerCase() === quoteSymbol;
}
