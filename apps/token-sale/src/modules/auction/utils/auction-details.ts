import {
  type BatchAuction,
  type Auction,
  type AuctionDerivativeTypes,
  type AuctionLinkId,
  CallbacksType,
} from "@axis-finance/types";

const getPrice = (
  auction: Pick<Auction, "encryptedMarginalPrice">,
): number | undefined => Number(auction.encryptedMarginalPrice?.minPrice);

const getMinFilled = (
  auction: Pick<BatchAuction, "encryptedMarginalPrice">,
): number | undefined => Number(auction.encryptedMarginalPrice?.minFilled);

type PartialAuction = Pick<Auction, "info">;

const getLinkUrl = (id: AuctionLinkId, auction: PartialAuction) => {
  return auction?.info?.links?.find?.((link) => link.linkId === id)?.url;
};

const hasDerivative = (
  derivativeType: AuctionDerivativeTypes,
  auction: BatchAuction,
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

export {
  getPrice,
  getMinFilled,
  getLinkUrl,
  hasDerivative,
  isAllowlistCallback,
};
