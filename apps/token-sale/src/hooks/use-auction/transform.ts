import { AuctionType, CallbacksType, Token } from "@axis-finance/types";
import type { BatchAuctionLot } from "../../queries/auction/types";
import { AUCTION_CHAIN_ID } from "../../../../../app-config";
import { z } from "zod";
import { formatUnits, zeroAddress } from "viem";
import { axisContracts } from "@axis-finance/deployments";

const AuctionStatus = z.enum([
  "created",
  "live",
  "concluded",
  "decrypted",
  "settled",
  "aborted",
  "cancelled",
]);

export function getCallbacksType(callbacks?: `0x${string}`): CallbacksType {
  if (!callbacks || callbacks === zeroAddress) {
    return CallbacksType.NONE;
  }

  const callbacksLower = callbacks.toLowerCase();
  const chainAddresses = axisContracts.addresses[AUCTION_CHAIN_ID];

  const callbackMapping: Partial<
    Record<keyof typeof chainAddresses, CallbacksType>
  > = {
    merkleAllowlist: CallbacksType.MERKLE_ALLOWLIST,
    cappedMerkleAllowlist: CallbacksType.CAPPED_MERKLE_ALLOWLIST,
    allocatedMerkleAllowlist: CallbacksType.ALLOCATED_MERKLE_ALLOWLIST,
    tokenAllowlist: CallbacksType.TOKEN_ALLOWLIST,
    uniV2Dtl: CallbacksType.UNIV2_DTL,
    uniV3Dtl: CallbacksType.UNIV3_DTL,
    uniswapV3DtlWithAllocatedMerkleAllowlist:
      CallbacksType.UNIV3_DTL_WITH_ALLOCATED_ALLOWLIST,
    baseline: CallbacksType.BASELINE,
    baselineAllowlist: CallbacksType.BASELINE_ALLOWLIST,
    baselineAllocatedAllowlist: CallbacksType.BASELINE_ALLOCATED_ALLOWLIST,
    baselineCappedAllowlist: CallbacksType.BASELINE_CAPPED_ALLOWLIST,
    baselineTokenAllowlist: CallbacksType.BASELINE_TOKEN_ALLOWLIST,
  };

  for (const [key, type] of Object.entries(callbackMapping)) {
    const addressList = chainAddresses[key as keyof typeof chainAddresses];
    const isMatch = Array.isArray(addressList)
      ? addressList.some((addr) => addr.toLowerCase() === callbacksLower)
      : addressList.toLowerCase() === callbacksLower;

    if (isMatch) {
      return type;
    }
  }

  return CallbacksType.CUSTOM;
}

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

  const price = parseFloat(auction.encryptedMarginalPrice?.minPrice ?? "0");
  const minFilled = parseFloat(
    auction.encryptedMarginalPrice?.minFilled ?? "0",
  );

  if (!auction.callbacks?.startsWith("0x")) {
    throw new Error(
      `Unable to find callback ${auction.callbacks} for auction ${auction.id}`,
    );
  }

  const callbacks = auction.callbacks as `0x${string}`;

  return {
    amount: auction.bids.reduce((total, b) => total + Number(b.amountIn), 0),
    baseToken,
    bidStats: {
      totalAmount: auction.bids.reduce(
        (total, b) => total + Number(b.amountIn),
        0,
      ),
      claimed: auction.bids.filter((b) => b.status === "claimed").length,
      decrypted: auction.bids.filter((b) => b.status === "decrypted").length,
      refunded: auction.bidsRefunded.length,
      total: auction.bids.length,
      unique: auction.bids
        .map((b) => b.bidder)
        .filter((b, i, a) => a.lastIndexOf(b) === i).length,
    },
    bids: auction.bids,
    callbacks,
    callbacksType: getCallbacksType(callbacks),
    capacity: parseFloat(auction.capacity ?? "0"),
    capacityInitial: auction.capacityInitial,
    chainId: AUCTION_CHAIN_ID,
    end: new Date(Number(auction.conclusion) * 1000),
    derivativeType: auction.derivativeType,
    id: auction.id,
    linearVesting: auction.linearVesting,
    lotId: Number(auction.lotId),
    marginalPrice: parseFloat(
      auction.encryptedMarginalPrice?.marginalPrice ?? "0",
    ),
    minBidSize: parseFloat(auction.encryptedMarginalPrice?.minBidSize ?? "0"),
    minFilled: parseFloat(auction.encryptedMarginalPrice?.minFilled ?? "0"),
    minPrice: price,
    minRaise: minFilled * price,
    progress,
    protocolFee: auction.protocolFee,
    purchased: parseFloat(auction.purchased ?? "0"),
    quoteToken,
    urlPath: `/${AUCTION_CHAIN_ID}/${auction.id}`,
    referrerFee: auction.referrerFee,
    seller: auction.seller as `0x${string}`,
    settled: !!auction.encryptedMarginalPrice?.settlementSuccessful,
    sold: parseFloat(auction.sold ?? "0"),
    start: new Date(Number(auction.start) * 1000),
    status,
    symbol: `${auction.quoteToken.symbol}/${auction.baseToken.symbol}`,
    symbols: `${auction.quoteToken.symbol}/${auction.baseToken.symbol}`,
    targetRaise: Number(auction.capacityInitial) * price,
    totalSupply: parseFloat(auction.baseToken.totalSupply ?? "0"),
    type: AuctionType.SEALED_BID,
  };
};
type GetArrayElementType<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
export type Auction = ReturnType<typeof transform>;
export type AuctionBid = GetArrayElementType<Auction["bids"]>;
