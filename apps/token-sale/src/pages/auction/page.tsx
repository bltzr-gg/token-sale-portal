import React from "react";
import {
  AuctionDecrypted,
  DecryptMarginalPriceSection,
} from "modules/auction/status";
import { BidList } from "modules/auction/bid-list";
import { AuctionCountdown } from "modules/auction/countdown";
import { useAccount, useSwitchChain } from "wagmi";
import Hero from "components/hero";
import { Button } from "@bltzr-gg/ui";
import { ArrowBigDown } from "lucide-react";
import { AUCTION_CHAIN_ID, AUCTION_ID } from "../../app-config";
import { useAuction } from "@/hooks/use-auction";
import { AuctionMetrics } from "@/modules/auction/auction-metrics";
import { AuctionPurchase } from "@/modules/auction/auction-purchase";
import { SettledAuctionCard } from "@/modules/auction/settled-auction-card";
import { UserBidsCardContainer } from "@/modules/auction/user-bids";
import { ReferralRewards } from "@/modules/auction/referral-rewards";

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

  // Forcefully switch chain
  React.useEffect(() => {
    if (isConnected && AUCTION_CHAIN_ID !== connectedChainId) {
      switchChain({ chainId: AUCTION_CHAIN_ID });
    }
  }, [connectedChainId, isConnected, switchChain]);

  if (auction === undefined) return null;

  if (auction === null)
    return (
      <div className="absolute inset-0 -top-40 flex h-full flex-col items-center justify-center text-center">
        <h4>
          Auction doesn&apos;t seem to exist
          <span className="ml-1 italic">yet</span>
        </h4>
        <pre className="mt-5">{AUCTION_ID}</pre>
        <p className="text-axis-light-mid mt-10 max-w-sm text-xs">
          If you just created it, try refreshing below to see the subgraph has
          indexed it
        </p>
      </div>
    );

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
        </div>
        <div className="absolute bottom-[3.5%] z-30 flex w-full flex-col items-center">
          {auction.status === "live" && (
            <Button
              onClick={() => {
                scrollElementIntoView("auction-bids");
              }}
              className="my-8 h-14 rounded-xl px-10 text-2xl"
            >
              <ArrowBigDown className="mt-2" />
              &nbsp;&nbsp;Place your bids&nbsp;&nbsp;
              <ArrowBigDown className="mt-2" />
            </Button>
          )}
          <AuctionCountdown />
        </div>
      </Hero>
      <div className="space-y-8">
        <AuctionMetrics />
        {auction.status === "live" && (
          <>
            <div className="motion-preset-slide-right motion-delay-500">
              <AuctionPurchase />
            </div>
            <div className="motion-preset-slide-left motion-delay-500">
              <BidList />
            </div>
          </>
        )}
        {auction.status === "decrypted" && <AuctionDecrypted />}
        {auction.status === "concluded" && <DecryptMarginalPriceSection />}
        {["settled", "aborted", "cancelled"].includes(auction?.status) && (
          <>
            <SettledAuctionCard />
            <UserBidsCardContainer />
            {isConnected && <ReferralRewards />}
          </>
        )}
      </div>
    </>
  );
}
