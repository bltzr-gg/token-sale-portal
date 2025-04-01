import { AuctionType, CallbacksType } from "@axis-finance/types";
import type { BatchAuctionLot } from "../../queries/auction/types";
import { AUCTION_CHAIN_ID } from "../../app-config";
import { z } from "zod";
import { zeroAddress } from "viem";
import { axisContracts } from "@axis-finance/deployments";
import assert from "assert";
import { AuctionStatusSchema } from "./types";

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

function getAuctionStatus({
  start,
  conclusion,
  encryptedMarginalPrice,
}: Pick<
  BatchAuctionLot,
  "start" | "conclusion" | "encryptedMarginalPrice"
>): z.infer<typeof AuctionStatusSchema> {
  assert(
    encryptedMarginalPrice !== null,
    "encryptedMarginalPrice is null, are you sure this is a Sealed Auction?",
  );
  const currentTime = Date.now();
  const startTime = new Date(Number(start) * 1000).getTime();
  const conclusionTime = new Date(Number(conclusion) * 1000).getTime();
  const subgraphStatus = encryptedMarginalPrice.status.toLowerCase();

  if (subgraphStatus === "created") {
    if (currentTime > conclusionTime) return "concluded";
    if (currentTime > startTime) return "live";
  }

  return AuctionStatusSchema.parse(subgraphStatus);
}

export const transform = (auction: BatchAuctionLot) => {
  assert(
    auction.encryptedMarginalPrice !== null,
    "encryptedMarginalPrice is null, are you sure this is a Sealed Auction?",
  );
  assert(auction.callbacks?.startsWith("0x"));
  assert(auction.quoteToken.address.startsWith("0x"));
  assert(auction.baseToken.address.startsWith("0x"));

  const status = getAuctionStatus(auction);
  const price = BigInt(auction.encryptedMarginalPrice?.minPrice ?? "0");
  const minFilled = BigInt(auction.encryptedMarginalPrice?.minFilled ?? "0");
  const callbacks = auction.callbacks as `0x${string}`;
  // START BULLSHIT: I SHOULDNT HAVE TO DO THIS, IT SHOULD BE IN 18 DECIMAL PLACE ALREADY
  const initialCapacity = BigInt(auction.capacityInitial) * 10n ** 18n;
  // END BULLSHIT
  const baseModifier = 10n ** BigInt(auction.baseToken.decimals);
  const targetRaise = (initialCapacity * price) / baseModifier;

  return {
    amount: auction.bids.reduce((total, b) => total + Number(b.amountIn), 0),
    baseToken: {
      name: auction.baseToken.name,
      decimals: auction.baseToken.decimals,
      symbol: auction.baseToken.symbol,
      address: auction.baseToken.address as `0x${string}`,
    },
    bidStats: {
      totalAmount: auction.bids.reduce(
        (total, b) => total + BigInt(b.amountIn),
        0n,
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
    capacity: BigInt(auction.capacity ?? "0"),
    initialCapacity,
    chainId: AUCTION_CHAIN_ID,
    end: new Date(Number(auction.conclusion) * 1000),
    derivativeType: auction.derivativeType,
    id: auction.id,
    linearVesting: auction.linearVesting,
    lotId: Number(auction.lotId),
    marginalPrice: BigInt(auction.encryptedMarginalPrice?.marginalPrice ?? "0"),
    minBidSize: BigInt(auction.encryptedMarginalPrice?.minBidSize ?? "0"),
    minFilled,
    minPrice: price,
    minRaise: minFilled * price,

    purchased: BigInt(auction.purchased ?? "0"),
    quoteToken: {
      ...auction.quoteToken,
      address: auction.quoteToken.address as `0x${string}`,
    },
    urlPath: `/${AUCTION_CHAIN_ID}/${auction.id}`,
    referrerFee: parseFloat(auction.referrerFee) * 100,
    seller: auction.seller as `0x${string}`,
    settled: !!auction.encryptedMarginalPrice?.settlementSuccessful,
    sold: BigInt(auction.sold ?? "0"),
    start: new Date(Number(auction.start) * 1000),
    status,
    symbol: `${auction.quoteToken.symbol}/${auction.baseToken.symbol}`,
    targetRaise,
    type: AuctionType.SEALED_BID,
  };
};
type GetArrayElementType<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
export type Auction = ReturnType<typeof transform>;
export type AuctionBid = GetArrayElementType<Auction["bids"]>;
