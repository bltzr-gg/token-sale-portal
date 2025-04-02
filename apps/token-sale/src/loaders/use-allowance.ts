import { useEffect } from "react";
import { Address, erc20Abi } from "viem";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSimulateContract,
} from "wagmi";

export type UseAllowanceProps = {
  tokenAddress?: Address;
  chainId?: number;
  decimals?: number;
  ownerAddress?: Address;
  spenderAddress?: Address;
  amount: bigint;
};

/** Used to manage an address' allowance for a given token */
export const useAllowance = (args: UseAllowanceProps) => {
  const writeContract = useWriteContract();
  const approveReceipt = useWaitForTransactionReceipt({
    hash: writeContract.data,
  });

  const allowance = useReadContract({
    abi: erc20Abi,
    chainId: args.chainId,
    address: args.tokenAddress,
    functionName: "allowance",
    args: [args.ownerAddress as Address, args.spenderAddress as Address],
    query: {
      enabled:
        !!args.chainId &&
        !!args.tokenAddress &&
        !!args.spenderAddress &&
        !!args.ownerAddress,
    },
  });

  const amountToApprove = args.amount;

  const { data: approveCall } = useSimulateContract({
    abi: erc20Abi,
    address: args.tokenAddress!,
    functionName: "approve",
    args: [args.spenderAddress!, amountToApprove],
  });

  const execute = () => writeContract.writeContractAsync(approveCall!.request);

  useEffect(() => {
    if (approveReceipt.isSuccess) {
      allowance.refetch();
    }
  }, [allowance, approveReceipt.isSuccess]);

  return {
    data: allowance.data,
    approveTx: writeContract,
    approveReceipt,
    allowance,
    execute,
    isSufficientAllowance:
      allowance.isSuccess && allowance.data >= amountToApprove,
    isLoading: allowance.isLoading,
    isSuccess: allowance.isSuccess,
  };
};
