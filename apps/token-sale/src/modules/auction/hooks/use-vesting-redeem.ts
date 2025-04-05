import { useEffect } from "react";
import {
  usePublicClient,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import type { Address } from "@axis-finance/types";
import { abis } from "@axis-finance/abis";
import { useAuctionSuspense } from "@/hooks/use-auction";
import { useMutation } from "@tanstack/react-query";
import { decodeEventLog } from "viem";

export function useVestingRedeem({
  vestingTokenId,
  derivativeModuleAddress,
  onSuccess,
}: {
  vestingTokenId?: bigint;
  derivativeModuleAddress?: Address;
  onSuccess?: () => void;
}) {
  const { data: auction, refetch } = useAuctionSuspense();
  const redeemCall = useSimulateContract({
    abi: abis.batchLinearVesting,
    address: derivativeModuleAddress,
    chainId: auction?.chainId,
    functionName: "redeemMax",
    args: [vestingTokenId || 0n],
    query: {
      enabled:
        !!derivativeModuleAddress &&
        !!vestingTokenId &&
        Number.isInteger(auction?.chainId),
    },
  });

  const redeemTx = useWriteContract();
  const redeemReceipt = useWaitForTransactionReceipt({ hash: redeemTx.data });

  useEffect(() => {
    if (redeemReceipt.isSuccess && onSuccess) {
      redeemTx.reset();
      onSuccess();
    }
  }, [redeemReceipt.isSuccess, onSuccess, redeemTx]);

  const client = usePublicClient();

  const handleRedeem = useMutation({
    mutationFn: async () => {
      if (redeemCall.data) {
        const tx = await redeemTx.writeContractAsync(redeemCall.data.request!);
        const receipt = await client!.waitForTransactionReceipt({ hash: tx });

        for (const log of receipt.logs) {
          const decoded = decodeEventLog({
            abi: abis.batchLinearVesting,
            data: log.data,
            topics: log.topics,
          });

          switch (decoded.eventName) {
            default:
              break;
          }
        }
      }
    },
    onSuccess: async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await refetch();
    },
  });

  const handleRedeemSelected = useMutation({
    mutationFn: async () => {
      if (!derivativeModuleAddress) {
        throw new Error("No derivative module address");
      }

      if (!vestingTokenId) {
        throw new Error("No vesting token id");
      }

      const tx = await redeemTx.writeContractAsync({
        abi: abis.batchLinearVesting,
        address: derivativeModuleAddress,
        chainId: auction.chainId,
        functionName: "redeemMax",
        args: [vestingTokenId],
      });

      const receipt = await client!.waitForTransactionReceipt({ hash: tx });

      for (const log of receipt.logs) {
        const decoded = decodeEventLog({
          abi: abis.batchLinearVesting,
          data: log.data,
          topics: log.topics,
        });

        switch (decoded.eventName) {
          default:
            break;
        }
      }
    },
    onSuccess: async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await refetch();
    },
  });

  const isWaiting =
    redeemCall.isPending ||
    redeemCall.isLoading ||
    redeemTx.isPending ||
    redeemReceipt.isLoading;
  handleRedeem.isPending;

  return {
    handleRedeem: handleRedeem.mutate,
    handleRedeemSelected: handleRedeemSelected.mutate,
    redeemCall,
    redeemReceipt,
    redeemTx,
    isWaiting,
  };
}
