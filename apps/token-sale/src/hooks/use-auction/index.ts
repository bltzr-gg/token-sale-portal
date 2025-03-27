import { getAuctionId } from "@/modules/auction/utils/get-auction-id";
import { GET_AUCTION_BY_ID_QUERY } from "@/queries/auction/getById";
import { useQuery, useSuspenseQuery } from "@apollo/client";
import { useMemo } from "react";
import { transform } from "./transform";
import { AUCTION_CHAIN_ID, AUCTION_LOT_ID } from "../../../../../app-config";
import { useTokens } from "../use-tokens";

export const useAuction = () => {
  const tokens = useTokens();
  const query = useQuery(GET_AUCTION_BY_ID_QUERY, {
    variables: {
      id: getAuctionId(AUCTION_CHAIN_ID, AUCTION_LOT_ID),
    },
  });

  const data = useMemo(
    () =>
      query.data &&
      query.data.batchAuctionLot &&
      transform(query.data.batchAuctionLot, tokens),
    [query.data, tokens],
  );

  return {
    ...query,
    data,
  };
};

export const useAuctionSuspense = () => {
  const tokens = useTokens();
  const query = useSuspenseQuery(GET_AUCTION_BY_ID_QUERY, {
    variables: {
      id: getAuctionId(AUCTION_CHAIN_ID, AUCTION_LOT_ID),
    },
  });

  const data = useMemo(
    () =>
      query.data.batchAuctionLot &&
      transform(query.data.batchAuctionLot, tokens),
    [query.data, tokens],
  );

  if (data === null) {
    throw new Error(
      "No auction found in the subgraph. Might wanna check that out.",
    );
  }

  return {
    ...query,
    data,
  };
};

export type { Auction } from "./transform";
