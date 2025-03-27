import { axisContracts } from "@axis-finance/deployments";
import { AUCTION_CHAIN_ID } from "../../../../../app-config";

if (!axisContracts.addresses[AUCTION_CHAIN_ID]) {
  throw new Error(
    `No auction house contract found for chain ${AUCTION_CHAIN_ID}`,
  );
}

export const auctionHouse = {
  abi: axisContracts.abis.batchAuctionHouse,
  address: axisContracts.addresses[AUCTION_CHAIN_ID].batchAuctionHouse,
} as const;
