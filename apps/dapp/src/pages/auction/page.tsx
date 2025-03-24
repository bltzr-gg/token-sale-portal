import React, { useMemo } from "react";
import {
  type PropsWithAuction,
  type AuctionStatus,
  Auction,
} from "@axis-finance/types";
import {
  EncryptedMarginalPriceAuctionConcluded,
  AuctionCreated,
  AuctionDecrypted,
  AuctionSettled,
  AuctionLive,
} from "modules/auction/status";
import { BidList } from "modules/auction/bid-list";
import { Countdown } from "modules/auction/countdown";
import { useAccount, useSwitchChain } from "wagmi";
import { useAuctions } from "modules/auction/hooks/use-auctions";
import Hero from "components/hero";
import { Progress } from "@bltzr-gg/ui";

const statuses: Record<
  AuctionStatus,
  (props: PropsWithAuction) => React.ReactNode
> = {
  registering: () => null, // Registration state is not handled in this component, but in auction-registering.tsx
  created: AuctionCreated,
  live: AuctionLive,
  concluded: EncryptedMarginalPriceAuctionConcluded,
  decrypted: AuctionDecrypted,
  settled: AuctionSettled,
  aborted: AuctionSettled,
  cancelled: AuctionSettled,
};

const LOT_ID = 0;
const CHAIN_ID = 84532;

export default function AuctionPage(props: { auction?: Auction }) {
  const { data } = useAuctions();
  const auction = useMemo(
    () =>
      props.auction ??
      data.find(
        (a) => a.lotId === String(LOT_ID) && a.chainId === Number(CHAIN_ID),
      ),
    [data, props.auction],
  );
  const { isConnected, chainId: connectedChainId } = useAccount();
  const { switchChain } = useSwitchChain();

  // Forcefully switch chain
  React.useEffect(() => {
    const auctionChainId = CHAIN_ID;

    if (isConnected && auctionChainId !== connectedChainId) {
      switchChain({ chainId: CHAIN_ID });
    }
  }, [connectedChainId, isConnected, switchChain]);

  if (!auction)
    return (
      <div className="absolute inset-0 -top-40 flex h-full flex-col items-center justify-center text-center">
        <h4>
          This auction doesn&apos;t seem to exist
          <span className="ml-1 italic">yet</span>
        </h4>
        <p className="text-axis-light-mid mt-10 max-w-sm text-xs">
          If you just created it, try refreshing below to see the subgraph has
          indexed it
        </p>
      </div>
    );

  const AuctionElement = statuses[auction.status];

  return (
    <>
      <Hero>
        <div className="absolute inset-0 pt-64 text-center">
          <h1 className="text-shadow-lg motion-preset-blur-up motion-ease-in motion-duration-1500 px-3 text-4xl font-black sm:text-5xl md:px-5 md:text-6xl lg:text-7xl">
            The Notorious $REAL Token
          </h1>
          <p className="text-shadow-md motion-preset-blur-up motion-ease-in motion-delay-500 motion-duration-1500 mt-3 text-2xl font-light sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            Where Champions Play 👑🥊
          </p>
          <div className="mt-24 px-5">
            <Progress
              variant="primary"
              value={50}
              className="h-8 rounded-lg border-2 border-black/80"
            />
            <div className="mt-4 flex items-center justify-between gap-x-2"></div>
          </div>
        </div>
        <div className="flex justify-center">
          <Countdown auction={auction} />
        </div>
      </Hero>
      <AuctionElement auction={auction} />
      <BidList auction={auction} />
    </>
  );
}
