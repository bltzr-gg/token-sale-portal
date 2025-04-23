import { z } from "zod";

export const BatchAuctionLotSchema = z
  .object({
    id: z.string(),
    chain: z.string(),
    auctionHouse: z.string(),
    aborted: z.object({ date: z.string() }).nullable(),
    cancelled: z.object({ date: z.string() }).nullable(),
    lotId: z.string(),
    createdBlockNumber: z.string(),
    createdBlockTimestamp: z.string(),
    createdDate: z.string(),
    createdTransactionHash: z.string(),
    capacityInitial: z.string(),
    start: z.string(),
    conclusion: z.string(),
    auctionType: z.enum(["01EMPA", "01FPBA"], {
      errorMap: (issue, ctx) => {
        if (issue.code === "invalid_enum_value") {
          return { message: "Unsupported auction type" };
        }
        return { message: ctx.defaultError };
      },
    }),
    seller: z.string(),
    derivativeType: z.string().nullable(),
    wrapDerivative: z.boolean(),
    callbacks: z.string(),
    curator: z.string().nullable(),
    curatorApproved: z.boolean(),
    curatorFee: z.string(),
    protocolFee: z.string(),
    referrerFee: z.string(),
    capacity: z.string(),
    sold: z.string(),
    purchased: z.string(),
    lastUpdatedBlockNumber: z.string(),
    lastUpdatedBlockTimestamp: z.string(),
    lastUpdatedDate: z.string(),
    lastUpdatedTransactionHash: z.string(),
    linearVesting: z
      .object({
        id: z.string(),
        startDate: z.string(),
        expiryDate: z.string(),
        startTimestamp: z.string(),
        expiryTimestamp: z.string(),
        redemptions: z.array(
          z.object({
            id: z.string(),
            bidder: z.string(),
            redeemed: z.string(),
            remaining: z.string(),
          }),
        ),
      })
      .nullable(),
    baseToken: z.object({
      totalSupply: z.string(),
      address: z.string(),
      decimals: z.number(),
      symbol: z.string(),
      name: z.string(),
    }),
    quoteToken: z.object({
      address: z.string(),
      decimals: z.number(),
      symbol: z.string(),
      name: z.string(),
    }),
    created: z.object({ infoHash: z.string() }),
    curated: z.object({ curator: z.string() }).nullable(),
    maxBidId: z.string(),
    bids: z.array(
      z.object({
        bidId: z.string(),
        bidder: z.string(),
        blockTimestamp: z.string(),
        date: z.string(),
        amountIn: z.string(),
        rawAmountIn: z.string(),
        rawAmountOut: z.string().nullable(),
        rawMarginalPrice: z.string().nullable(),
        rawSubmittedPrice: z.string().nullable(),
        submittedPrice: z.string().nullable(),
        settledAmountIn: z.string().nullable(),
        settledAmountInRefunded: z.string().nullable(),
        settledAmountOut: z.string().nullable(),
        status: z.string(),
        outcome: z.string().nullable(),
        referrer: z.string().nullable(),
        claimed: z
          .object({
            id: z.string(),
          })
          .nullable(),
      }),
    ),
    bidsDecrypted: z.array(z.object({ id: z.string() })),
    bidsClaimed: z.array(z.object({ id: z.string() })),
    bidsRefunded: z.array(z.object({ id: z.string() })),
    encryptedMarginalPrice: z
      .object({
        id: z.string(),
        status: z.string(),
        settlementSuccessful: z.boolean(),
        minPrice: z.string(),
        minFilled: z.string(),
        minBidSize: z.string(),
        marginalPrice: z.string().nullable(),
        hasPartialFill: z
          .boolean()
          .nullable()
          .transform((v) => v ?? false),
      })
      .nullable(),
    fixedPrice: z
      .object({
        id: z.string(),
        status: z.string(),
        settlementSuccessful: z.boolean(),
        price: z.string(),
        minFilled: z.string(),
        hasPartialFill: z
          .boolean()
          .nullable()
          .transform((v) => v ?? false),
        partialBidId: z.string().nullable(),
      })
      .nullable(),
    settled: z.object({ id: z.string() }).nullable(),
  })
  .nullable();

export type BatchAuctionLot = NonNullable<
  z.infer<typeof BatchAuctionLotSchema>
>;

export const GetSimpleAuctionByIdResponseSchema = z.object({
  batchAuctionLot: BatchAuctionLotSchema.nullable(),
});

export const ByIdRequestSchema = z.object({
  id: z.string(),
});

export type GetSimpleAuctionByIdResponse = {
  batchAuctionLot: BatchAuctionLot | null;
};

export interface ByIdRequest {
  id: string;
}
