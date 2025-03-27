import { transform } from "./transform";

type GetArrayElementType<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
export type Auction = ReturnType<typeof transform>;
export type AuctionBid = GetArrayElementType<Auction["bids"]>;
export type Token = Auction["baseToken"] | Auction["quoteToken"];
