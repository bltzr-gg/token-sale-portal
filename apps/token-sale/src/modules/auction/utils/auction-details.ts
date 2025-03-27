import { Auction } from "@/hooks/use-auction";
import {
  type AuctionDerivativeTypes,
  CallbacksType,
} from "@axis-finance/types";

const hasDerivative = (
  derivativeType: AuctionDerivativeTypes,
  auction: Auction,
): boolean => {
  if (typeof auction?.derivativeType !== "string") {
    return false;
  }

  const auctionDerivativeType = auction.derivativeType.slice(-3);
  return auctionDerivativeType.toLowerCase() === derivativeType.toLowerCase();
};

const isAllowlistCallback = (callback: CallbacksType) => {
  return callback.toLowerCase().includes("allowlist");
};

export { hasDerivative, isAllowlistCallback };
