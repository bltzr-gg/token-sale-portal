import assert from "assert";
import { sepolia, mainnet } from "viem/chains";
import { GetObjectValueType } from "./types";

// add chain here if needed
export const supportedChains = { sepolia, mainnet } as const;

export type Chain = GetObjectValueType<typeof supportedChains>;
export type ChainId = GetObjectValueType<typeof supportedChains>["id"];
export type ChainKey = keyof typeof supportedChains;

export const networkIdExists = (id: string | number): id is ChainId =>
  Object.values(supportedChains).some(
    (chain) => chain.id === parseInt(id.toString()),
  );

const isHexString = (str: string): str is `0x${string}` => str.startsWith("0x");
assert(
  !import.meta.env.VITE_AUCTION_CHAIN_ID ||
    networkIdExists(import.meta.env.VITE_AUCTION_CHAIN_ID),
  "Invalid chain id",
);
assert(
  !import.meta.env.VITE_AUCTION_HOUSE_CONTRACT_ADDRESS ||
    isHexString(import.meta.env.VITE_AUCTION_HOUSE_CONTRACT_ADDRESS),
  "Invalid auction house contract address",
);

// define these
const AUCTION_LOT_ID = parseInt(import.meta.env.VITE_AUCTION_LOT_ID ?? "1");
const AUCTION_HOUSE_CONTRACT_ADDRESS =
  (import.meta.env.VITE_AUCTION_HOUSE_CONTRACT_ADDRESS as
    | `0x${string}`
    | undefined) ?? "0xba000020fed3cf3bf473f09ca0a72ba123e20926";
export const AUCTION_CHAIN_ID = parseInt(
  import.meta.env.VITE_AUCTION_CHAIN_ID ?? "1",
);
export const chainName = Object.entries(supportedChains).find(
  ([, key]) => key.id === AUCTION_CHAIN_ID,
)?.[0] as keyof typeof supportedChains;
export const SUBGRAPH_URL = `https://subgraph.satsuma-prod.com/44c4cc082f74/spaces-team/axis-origin-${chainName}/version/v1.0.6.3/api`;
// end

export const chain = supportedChains[chainName];
export const AUCTION_ID = `${chainName}-${AUCTION_HOUSE_CONTRACT_ADDRESS}-${AUCTION_LOT_ID}`;
