import { useCallback, useEffect, useMemo } from "react";
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useSdk } from "@axis-finance/sdk/react";
import { useAuctionSuspense } from "@/hooks/use-auction";

export function useClaimBids() {
  const { data: auction, refetch } = useAuctionSuspense();
  const { address: userAddress } = useAccount();
  const sdk = useSdk();

  const bids = useMemo(
    () =>
      auction.bids
        .filter(
          (b) =>
            b.bidder.toLowerCase() === userAddress?.toLowerCase() &&
            b.status !== "claimed" &&
            b.status !== "refunded",
        )
        .map((b) => Number(b.bidId)) ?? [],
    [auction.bids, userAddress],
  );
  const { abi, address, functionName, args } = sdk.claimBids({
    lotId: Number(auction.lotId),
    bids,
    auctionType: auction.type,
    chainId: auction.chainId,
  });

  const claimCall = useSimulateContract({
    abi,
    address,
    functionName,
    args,
    chainId: auction.chainId,
  });

  const claimTx = useWriteContract();
  const claimReceipt = useWaitForTransactionReceipt({ hash: claimTx.data });

  // When someone claims their bids, refetch the auction from the subgraph so the dapp has the latest data
  // TODO: we should optimistically update the auction bids here instead
  useEffect(() => {
    if (claimReceipt.isSuccess) {
      setTimeout(() => refetch(), 2500);
    }
  }, [claimReceipt.isSuccess, refetch]);

  const handleClaim = useCallback(() => {
    if (claimCall.data) {
      claimTx.writeContract(claimCall.data.request!);
    }
  }, [claimCall.data, claimTx]);

  const isWaiting =
    claimTx.isPending ||
    claimReceipt.isLoading ||
    claimCall.isPending ||
    claimCall.isLoading;

  const error = [claimReceipt, claimTx, claimCall].find(
    (m) => m.isError,
  )?.error;

  return {
    handleClaim,
    claimCall: claimCall as ReturnType<typeof useSimulateContract>,
    claimReceipt,
    claimTx,
    isWaiting,
    error: error as Error | undefined,
  };
}
