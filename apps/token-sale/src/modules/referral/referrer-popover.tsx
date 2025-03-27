import {
  Button,
  Text,
  Input,
  LabelWrapper,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
} from "@bltzr-gg/ui";
import { useAccount } from "wagmi";
import { useReferralLink } from "./use-referral-link";
import { isAddress } from "viem";
import React, { useCallback } from "react";
import { useAuctionSuspense } from "@/hooks/use-auction";

export function ReferrerPopover() {
  const { data: auction } = useAuctionSuspense();
  const { address: connectedAddress } = useAccount();
  const [address, setAddress] = React.useState(connectedAddress);
  const { generateLink, copyLink, link } = useReferralLink(address);
  const [copied, setCopied] = React.useState(false);

  const handleGenerateLink = useCallback(() => {
    generateLink(auction.urlPath);
  }, [auction, generateLink]);

  const handleCopy = async () => {
    await copyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  React.useEffect(() => {
    handleGenerateLink();
  }, [address, handleGenerateLink]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm">
          Refer this launch
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-light min-w-[400px]">
        <div>
          <Text size="lg">Earn fees by referring bidders</Text>
          <LabelWrapper
            content="Address"
            className="mt-2"
            tooltip="Add your address to generate a referral link"
          >
            <Input
              defaultValue={address}
              onChange={(e) =>
                isAddress(e.target.value) && setAddress(e.target.value)
              }
            />
            <Text className="text-center">Your link:</Text>
            <Text size="xs" className="text-center">
              {link}
            </Text>
            <Text
              className={cn(
                "bg-feedback-success/50 bottom-12 right-4 mx-auto rounded-md p-1 px-2 text-center opacity-0 transition-all",
                copied && "bottom-14 opacity-100",
              )}
            >
              Copied to clipboard!
            </Text>
            <Button
              disabled={!address}
              className="inline uppercase"
              onClick={() => handleCopy()}
            >
              Copy Link
            </Button>
          </LabelWrapper>
        </div>
      </PopoverContent>
    </Popover>
  );
}
