import { AuctionType, Token } from "@axis-finance/types";
import type { BatchAuctionLot } from "../../queries/auction/types";
import { AUCTION_CHAIN_ID } from "../../../../../app-config";
import { z } from "zod";
import { formatUnits } from "viem";

const AuctionStatus = z.enum([
  "created",
  "live",
  "concluded",
  "decrypted",
  "settled",
  "aborted",
  "cancelled",
]);

function calculateAuctionProgress(
  auction: Pick<
    BatchAuctionLot,
    | "capacityInitial"
    | "encryptedMarginalPrice"
    | "bids"
    | "purchased"
    | "quoteToken"
  >,
  status: z.infer<typeof AuctionStatus>,
) {
  const rawCurrentAmount = auction.bids.reduce((total, b) => {
    return (total += BigInt(b.rawAmountIn));
  }, 0n);

  const preSettlementAmount = +formatUnits(
    rawCurrentAmount,
    Number(auction.quoteToken.decimals),
  );

  const isSettled = status === "settled";

  const currentAmount = isSettled ? +auction.purchased : preSettlementAmount;
  const minFilled = Number(auction.encryptedMarginalPrice?.minFilled ?? 0);
  const minPrice = Number(auction.encryptedMarginalPrice?.minPrice ?? 0);
  const minRaise = minFilled * minPrice;
  const targetAmount = minPrice * Number(auction.capacityInitial);

  const minTarget = Math.round((minRaise / targetAmount) * 100);
  const currentPercent = Math.min(
    Math.round((preSettlementAmount / targetAmount) * 100),
    100,
  );

  return {
    currentPercent,
    minTarget,
    currentAmount,
    targetAmount,
  };
}

function getAuctionStatus({
  start,
  conclusion,
  encryptedMarginalPrice,
}: Pick<
  BatchAuctionLot,
  "start" | "conclusion" | "encryptedMarginalPrice"
>): z.infer<typeof AuctionStatus> {
  const currentTime = Date.now();
  const startTime = new Date(Number(start) * 1000).getTime();
  const conclusionTime = new Date(Number(conclusion) * 1000).getTime();
  const subgraphStatus = encryptedMarginalPrice.status.toLowerCase();

  if (subgraphStatus === "created") {
    if (currentTime > conclusionTime) return "concluded";
    if (currentTime > startTime) return "live";
  }

  return AuctionStatus.parse(subgraphStatus);
}

export const transform = (auction: BatchAuctionLot, tokens: Token[] = []) => {
  const baseToken = tokens.find(
    (t) =>
      t.address === auction.baseToken.address && t.chainId === AUCTION_CHAIN_ID,
  );
  const quoteToken = tokens.find(
    (t) =>
      t.address === auction.quoteToken.address &&
      t.chainId === AUCTION_CHAIN_ID,
  );
  const status = getAuctionStatus(auction);
  const progress = calculateAuctionProgress(auction, status);

  if (!baseToken) {
    throw new Error(
      `Unable to find base token ${auction.baseToken.address} for auction ${auction.id}`,
    );
  }

  if (!quoteToken) {
    throw new Error(
      `Unable to find quote token ${auction.quoteToken.address} for auction ${auction.id}`,
    );
  }

  return {
    id: auction.id,
    bids: auction.bids,
    lotId: Number(auction.lotId),
    type: AuctionType.SEALED_BID,
    sold: parseFloat(auction.sold ?? "0"),
    purchased: parseFloat(auction.purchased ?? "0"),
    minPrice: parseFloat(auction.encryptedMarginalPrice?.minPrice ?? "0"),
    minBidSize: parseFloat(auction.encryptedMarginalPrice?.minBidSize ?? "0"),
    marginalPrice: parseFloat(
      auction.encryptedMarginalPrice?.marginalPrice ?? "0",
    ),
    capacity: parseFloat(auction.capacity ?? "0"),
    totalSupply: parseFloat(auction.baseToken.totalSupply ?? "0"),
    symbol: `${auction.quoteToken.symbol}/${auction.baseToken.symbol}`,
    bidStats: {
      refunded: auction.bidsRefunded.length,
      amount: auction.bids.reduce((total, b) => total + Number(b.amountIn), 0),
      claimed: auction.bids.filter((b) => b.status === "claimed").length,
      total: auction.bids.length,
      decrypted: auction.bids.filter((b) => b.status === "decrypted").length,
      unique: auction.bids
        .map((b) => b.bidder)
        .filter((b, i, a) => a.lastIndexOf(b) === i).length,
    },
    settled: !!auction.encryptedMarginalPrice?.settlementSuccessful,
    symbols: `${auction.quoteToken.symbol}/${auction.baseToken.symbol}`,
    baseToken,
    quoteToken,
    status,
    progress,
    chainId: AUCTION_CHAIN_ID,
    seller: auction.seller as `0x${string}`,
    start: auction.start,
    conclusion: auction.conclusion,
  };
};
