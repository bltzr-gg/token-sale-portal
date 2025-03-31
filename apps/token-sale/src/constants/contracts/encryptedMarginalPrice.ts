import { axisContracts } from "@axis-finance/deployments";
import { AUCTION_CHAIN_ID } from "../../app-config";

if (!axisContracts.addresses[AUCTION_CHAIN_ID]) {
  throw new Error(
    `No auction house contract found for chain ${AUCTION_CHAIN_ID}`,
  );
}

export const encryptedMarginalPrice = {
  abi: axisContracts.abis.encryptedMarginalPrice,
  address: axisContracts.addresses[AUCTION_CHAIN_ID].encryptedMarginalPrice,
} as const;
