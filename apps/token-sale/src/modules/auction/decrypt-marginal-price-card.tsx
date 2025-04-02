import React from "react";
import { Button, Card, Text } from "@bltzr-gg/ui";
import { TransactionDialog } from "modules/transaction/transaction-dialog";
import { useDecryptedBids } from "./hooks/use-decrypt-auction";
import { RequiresChain } from "components/requires-chain";
import { LoadingIndicator } from "modules/app/loading-indicator";
import { useAuctionSuspense } from "@/hooks/use-auction";

export function DecryptMarginalPriceSection() {
  const { data: auction } = useAuctionSuspense();
  const [open, setOpen] = React.useState(false);
  const decrypt = useDecryptedBids();

  const totalBidsRemaining = auction.bidStats.total - auction.bidStats.claimed;

  return (
    <div className="mt-8 w-full">
      <TransactionDialog
        signatureMutation={decrypt.decryptTx}
        disabled={decrypt.isWaiting}
        chainId={auction.chainId}
        hash={decrypt.decryptTx.data!}
        error={decrypt.error}
        onConfirm={decrypt.handleDecryption}
        mutation={decrypt.decryptReceipt}
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (decrypt.decryptReceipt.isSuccess || decrypt.decryptTx.isError) {
            decrypt.decryptTx.reset();
          }
        }}
      />
      <Card title="Concluded" className="mt-4 w-full lg:mt-0">
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Text size="xl" className="text-center">
              Decrypt bids before settling the auction
            </Text>
          </div>
        </div>
        <div className="bg-secondary text-foreground flex justify-center gap-x-2 rounded-sm p-4">
          <div>
            <h1 className="text-4xl">{auction.bidStats.decrypted}</h1>
            <p>Bids Decrypted</p>
          </div>

          <p className="text-6xl">/</p>

          <div>
            <h1 className="text-4xl">{totalBidsRemaining}</h1>
            <p>Total Remaining Bids</p>
          </div>
        </div>
        <RequiresChain chainId={auction.chainId} className="mt-4">
          <div className="mt-4 w-full">
            <Button
              className="w-full"
              disabled={decrypt.isWaiting}
              onClick={() => setOpen(true)}
            >
              {decrypt.isWaiting ? (
                <div className="flex">
                  Waiting for confirmation...
                  <div className="w-1/2"></div>
                  <LoadingIndicator />
                </div>
              ) : (
                "Decrypt Bids"
              )}
            </Button>
          </div>
        </RequiresChain>
      </Card>
    </div>
  );
}
