import React from "react";
import { type AuctionStatus } from "@axis-finance/types";
import {
  EncryptedMarginalPriceAuctionConcluded,
  AuctionCreated,
  AuctionDecrypted,
  AuctionSettled,
  AuctionLive,
} from "modules/auction/status";
import { BidList } from "modules/auction/bid-list";
import { AuctionCountdown } from "modules/auction/countdown";
import { useAccount, useSwitchChain } from "wagmi";
import Hero from "components/hero";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { Button } from "@bltzr-gg/ui";
import { ArrowBigDown } from "lucide-react";
import { AUCTION_CHAIN_ID } from "../../../../../app-config";
import { useAuction } from "@/hooks/use-auction";

const statuses: Record<AuctionStatus, () => React.ReactNode> = {
  created: AuctionCreated,
  live: AuctionLive,
  concluded: EncryptedMarginalPriceAuctionConcluded,
  decrypted: AuctionDecrypted,
  settled: AuctionSettled,
  aborted: AuctionSettled,
  cancelled: AuctionSettled,
};

function scrollElementIntoView(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function AuctionPage() {
  const { data: auction } = useAuction();
  const { isConnected, chainId: connectedChainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const animatedRaised = useAnimatedNumber(
    auction?.progress?.currentAmount ?? 0,
    {
      delay: 1000,
      duration: 3000,
      locale: "en-US",
      compact: true,
      easing: "ease-out",
    },
  );

  // Forcefully switch chain
  React.useEffect(() => {
    if (isConnected && AUCTION_CHAIN_ID !== connectedChainId) {
      switchChain({ chainId: AUCTION_CHAIN_ID });
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
            The Notorious $REAL
          </h1>
          <p className="text-shadow-md motion-preset-blur-up motion-ease-in motion-delay-500 motion-duration-1500 mt-3 text-2xl font-light sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            Public Token Sale
          </p>
          <div className="mt-16 empty:hidden">
            {auction.progress.currentAmount > 0 && (
              <p className="text-shadow-md motion-preset-blur-up motion-ease-in motion-delay-1000 motion-duration-1500 text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                {animatedRaised}$ Raised
              </p>
            )}
            {auction.status === "live" && (
              <Button
                onClick={() => {
                  scrollElementIntoView("auction-bids");
                }}
                className="mt-8 h-14 rounded-xl px-10 text-2xl"
              >
                <ArrowBigDown className="mt-2" />
                &nbsp;&nbsp;Place your bids&nbsp;&nbsp;
                <ArrowBigDown className="mt-2" />
              </Button>
            )}
          </div>
        </div>
        <div className="absolute bottom-24 z-30 flex w-full justify-center">
          <AuctionCountdown />
        </div>
      </Hero>
      <AuctionElement />
      <BidList />
    </>
  );
}
