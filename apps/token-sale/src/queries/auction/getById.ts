import { gql, TypedDocumentNode } from "@apollo/client";
import { ByIdRequest } from "./types";

export const GET_AUCTION_BY_ID_QUERY: TypedDocumentNode<
  { batchAuctionLot: unknown },
  ByIdRequest
> = gql`
  fragment BatchCommonFields on BatchAuctionLot {
    id
    chain
    auctionHouse
    aborted {
      date
    }
    cancelled {
      date
    }
    lotId
    createdBlockNumber
    createdBlockTimestamp
    createdDate
    createdTransactionHash
    capacityInitial
    start

    info(orderBy: createdAt, orderDirection: desc, first: 1) {
      key
      name
      description
      tagline
      links {
        linkId
        url
      }
      allowlist {
        values
      }
    }

    conclusion
    auctionType
    seller
    derivativeType
    wrapDerivative
    callbacks
    curator
    curatorApproved
    curatorFee
    protocolFee
    referrerFee
    capacity
    sold
    purchased
    lastUpdatedBlockNumber
    lastUpdatedBlockTimestamp
    lastUpdatedDate
    lastUpdatedTransactionHash

    linearVesting {
      id
      startDate
      expiryDate
      startTimestamp
      expiryTimestamp
      redemptions {
        id
        bidder
        redeemed
        remaining
      }
    }

    baseToken {
      totalSupply
      address
      decimals
      symbol
      name
    }

    quoteToken {
      address
      decimals
      symbol
      name
    }
    created {
      infoHash
    }
    curated {
      curator
    }
  }

  fragment BatchAuctionFields on BatchAuctionLot {
    maxBidId
    bids(first: 10000) {
      bidId
      bidder
      blockTimestamp
      date
      amountIn
      rawAmountIn
      rawAmountOut
      rawMarginalPrice
      rawSubmittedPrice
      submittedPrice
      settledAmountIn
      settledAmountInRefunded
      settledAmountOut
      status
      outcome
      referrer
      claimed {
        id
      }
    }

    bidsDecrypted {
      id
    }

    bidsClaimed {
      id
    }

    bidsRefunded {
      id
    }

    encryptedMarginalPrice {
      id
      status
      settlementSuccessful
      minPrice
      minFilled
      minBidSize
      marginalPrice
      hasPartialFill
    }
    fixedPrice {
      id
      status
      settlementSuccessful
      price
      minFilled
      hasPartialFill
      partialBidId
    }
    settled {
      id
    }
  }

  query GetAuctionById($id: String!) {
    batchAuctionLot(id: $id) {
      ...BatchCommonFields
      ...BatchAuctionFields
    }
  }
`;
