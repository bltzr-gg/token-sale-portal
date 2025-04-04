import React, { useState } from "react";
import { Button, Card, Text } from "@bltzr-gg/ui";
import { useSettleAuction } from "../hooks/use-settle-auction";
import { TransactionDialog } from "modules/transaction/transaction-dialog";
import { RequiresChain } from "components/requires-chain";
import { LoadingIndicator } from "modules/app/loading-indicator";
import { SettleAuctionCallbackInput } from "./settle-callback-input";
import { SettleAuctionDtlCallbackBalance } from "./settle-dtl-callback-balance";
import { useAuctionSuspense } from "@/hooks/use-auction";

export function AuctionDecrypted() {
  const { data: auction } = useAuctionSuspense();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [
    hasSufficientBalanceForCallbacks,
    setHasSufficientBalanceForCallbacks,
  ] = React.useState(true);

  const hasCallbacks =
    auction.callbacks &&
    auction.callbacks != "0x0000000000000000000000000000000000000000";

  const [callbackData, setCallbackData] = useState<`0x${string}` | undefined>(
    undefined,
  );
  const [callbackDataIsValid, setCallbackDataIsValid] = useState(
    hasCallbacks ? false : true,
  );

  const settle = useSettleAuction({
    callbackData: callbackData,
  });

  const isWaiting = settle.settleTx.isPending || settle.settleReceipt.isLoading;

  return (
    <div>
      <div className="mt-8 w-full">
        <TransactionDialog
          signatureMutation={settle.settleTx}
          disabled={isWaiting}
          chainId={auction.chainId}
          hash={settle.settleTx.data!}
          error={settle.error}
          onConfirm={settle.handleSettle}
          mutation={settle.settleReceipt}
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (settle.settleReceipt.isSuccess || settle.settleTx.isError) {
              settle.settleTx.reset();
            }
          }}
        />
        <Card
          headerRightElement={
            <Text size="xl">All bids have been decrypted</Text>
          }
          title="Decrypted"
        >
          <div className="w-fill flex items-center justify-center">
            <div className="flex flex-col items-center gap-2"></div>
          </div>
          {hasCallbacks && (
            <div>
              <SettleAuctionCallbackInput
                setCallbackData={setCallbackData}
                setCallbackDataIsValid={setCallbackDataIsValid}
              />
            </div>
          )}
          {
            <SettleAuctionDtlCallbackBalance
              setHasSufficientBalanceForCallbacks={
                setHasSufficientBalanceForCallbacks
              }
            />
          }
          <RequiresChain chainId={auction.chainId} className="mt-4">
            <div className="mt-4 w-full">
              <Button
                className="w-full"
                disabled={
                  isWaiting ||
                  !callbackDataIsValid ||
                  !hasSufficientBalanceForCallbacks
                }
                onClick={() => setIsDialogOpen(true)}
              >
                {isWaiting ? (
                  <div className="flex">
                    Waiting for confirmation...
                    <div className="w-1/2"></div>
                    <LoadingIndicator />
                  </div>
                ) : (
                  "Settle"
                )}
              </Button>
            </div>
          </RequiresChain>
        </Card>
      </div>

      <TransactionDialog
        signatureMutation={settle.settleTx}
        error={settle.error}
        mutation={settle.settleReceipt}
        chainId={auction.chainId}
        hash={settle.settleTx.data!}
        onConfirm={settle.handleSettle}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);

          if (settle.settleTx.isError) {
            settle.settleTx.reset();
          }
        }}
      />
    </div>
  );
}
