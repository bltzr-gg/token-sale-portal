// Auction Configuration
export const AUCTION_CHAIN_ID =
  import.meta.env.VITE_AUCTION_CHAIN_ID ?? 11155111;
export const AUCTION_LOT_ID = import.meta.env.VITE_AUCTION_LOT_ID ?? 1;

export const SUBGRAPH_URL =
  import.meta.env.VITE_SUBGRAPH_URL ??
  "https://subgraph.satsuma-prod.com/44c4cc082f74/spaces-team/axis-origin-sepolia/version/v1.0.6/api";
// export const SUBGRAPH_URL =
//  "https://subgraph.satsuma-prod.com/44c4cc082f74/spaces-team/axis-origin-mainnet/version/v1.0.6/api";
