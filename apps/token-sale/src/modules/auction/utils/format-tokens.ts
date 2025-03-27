import type { Address, Auction, Token, TokenBase } from "@axis-finance/types";
import { Token as SubgraphToken } from "@axis-finance/subgraph-client";
import { getChainId } from "utils/chain";
import { formatUnits } from "viem";
import { getLinkUrl } from "./auction-details";

type InputToken = Omit<SubgraphToken, "id" | "decimals" | "totalSupply"> & {
  decimals: number | string;
  totalSupply?: bigint | string | undefined;
};

type PartialAuction = Pick<Auction, "info" | "chain"> & {
  quoteToken?: InputToken;
  baseToken?: InputToken;
};

export function formatAuctionToken(
  token: InputToken | undefined,
  auction: PartialAuction,
  getToken: (token: TokenBase) => Token | undefined,
  tokenType: "quote" | "base",
) {
  if (token == null) return;

  const chainId = getChainId(auction.chain);
  let formattedToken;

  if (tokenType === "quote") {
    formattedToken =
      getToken({ address: token.address as Address, chainId }) ?? token;
  } else {
    formattedToken = {
      ...token,
      logoURI: getLinkUrl("payoutTokenLogo", auction),
    };
  }

  return parseToken(formattedToken, chainId);
}

export function parseToken(
  token: InputToken & {
    logoURI?: string | undefined;
  },
  chainId: number,
): Token {
  const totalSupply = token.totalSupply?.toString();

  return {
    ...token,
    totalSupply: totalSupply
      ? formatUnits(BigInt(totalSupply ?? ""), Number(token.decimals))
      : undefined,
    decimals: Number(token.decimals),
    address: token.address as Address,
    chainId,
  };
}
