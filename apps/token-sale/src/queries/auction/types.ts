export type BatchAuctionLot = {
  id: string;
  chain: string;
  auctionHouse: string;
  aborted: { date: string };
  cancelled: { date: string };
  lotId: string;
  createdBlockNumber: string;
  createdBlockTimestamp: string;
  createdDate: string;
  createdTransactionHash: string;
  capacityInitial: string;
  start: string;
  conclusion: string;
  auctionType: string;
  seller: string;
  derivativeType: string;
  wrapDerivative: boolean;
  callbacks: string;
  curator: string;
  curatorApproved: boolean;
  curatorFee: string;
  protocolFee: string;
  referrerFee: string;
  capacity: string;
  sold: string;
  purchased: string;
  lastUpdatedBlockNumber: string;
  lastUpdatedBlockTimestamp: string;
  lastUpdatedDate: string;
  lastUpdatedTransactionHash: string;
  linearVesting: {
    id: string;
    startDate: string;
    expiryDate: string;
    startTimestamp: string;
    expiryTimestamp: string;
    redemptions: {
      id: string;
      bidder: string;
      redeemed: string;
      remaining: string;
    }[];
  };
  baseToken: {
    totalSupply: string;
    address: string;
    decimals: string;
    symbol: string;
    name: string;
  };
  quoteToken: {
    address: string;
    decimals: string;
    symbol: string;
    name: string;
  };
  created: {
    infoHash: string;
  };
  curated: {
    curator: string;
  };
  info: {
    key: string;
    name: string;
    description: string;
    tagline: string;
    links: {
      linkId: string;
      url: string;
    }[];
    allowlist: {
      values: string[];
    };
  }[];
  maxBidId: string;
  bids: {
    bidId: string;
    bidder: string;
    blockTimestamp: string;
    date: string;
    amountIn: string;
    rawAmountIn: string;
    rawAmountOut: string;
    rawMarginalPrice: string;
    rawSubmittedPrice: string;
    submittedPrice: string;
    settledAmountIn: string;
    settledAmountInRefunded: string;
    settledAmountOut: string;
    status: string;
    outcome: string;
    referrer: string;
    claimed: {
      id: string;
    }[];
  }[];
  bidsDecrypted: {
    id: string;
  }[];
  bidsClaimed: {
    id: string;
  }[];
  bidsRefunded: {
    id: string;
  }[];
  encryptedMarginalPrice: {
    id: string;
    status: string;
    settlementSuccessful: boolean;
    minPrice: string;
    minFilled: string;
    minBidSize: string;
    marginalPrice: string;
    hasPartialFill: boolean;
  };
  fixedPrice: {
    id: string;
    status: string;
    settlementSuccessful: boolean;
    price: string;
    minFilled: string;
    hasPartialFill: boolean;
    partialBidId: string;
  };
  settled: {
    id: string;
  }[];
};

export type GetSimpleAuctionByIdResponse = {
  batchAuctionLot: BatchAuctionLot | null;
};

export interface ByIdRequest {
  id: string;
}
