import { Badge, Card, Text } from "@bltzr-gg/ui";
import { RequiresChain } from "components/requires-chain";
import { AUCTION_CHAIN_ID } from "../../../app-config";

export function NotConnectedClaimCard() {
  return (
    <Card title="Claim" headerRightElement={<Badge>Auction Closed</Badge>}>
      <div className="flex flex-col gap-y-4">
        <div className="green-gradient w-fill flex h-[464px] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <img
              className="w-[92.351]px h-[80px]"
              src="/images/axis-logo.svg"
            />
            <Text size="xl">Auction has ended</Text>
            <Text>Connect your wallet to claim your tokens</Text>
          </div>
        </div>
        <RequiresChain
          buttonClass="w-full"
          className="w-full"
          chainId={AUCTION_CHAIN_ID}
        />
      </div>
    </Card>
  );
}
