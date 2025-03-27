import { toHex } from "viem";
import {
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { contracts } from "@/constants";
import { useAuctionSuspense } from "@/hooks/use-auction";

type SettleAuctionProps = {
  callbackData?: `0x${string}`;
};

/** Used to settle an auction after decryption*/
export function useSettleAuction({ callbackData }: SettleAuctionProps) {
  const { data: auction } = useAuctionSuspense();
  const { data: settleCall, ...settleCallStatus } = useSimulateContract({
    abi: contracts.auctionHouse.abi,
    address: contracts.auctionHouse.address,
    functionName: "settle",
    chainId: auction.chainId,
    args: [
      BigInt(auction.lotId),
      100n, // number of bids to settle at once, TODO replace with value based on chain & gas limits
      callbackData || toHex(""),
    ],
  });

  const settleTx = useWriteContract();
  const settleReceipt = useWaitForTransactionReceipt({ hash: settleTx.data });

  const handleSettle = () => settleTx.writeContract(settleCall!.request);

  const error = [settleCallStatus, settleTx, settleReceipt].find(
    (tx) => tx.isError,
  )?.error;

  return {
    handleSettle,
    settleTx,
    settleReceipt,
    settleCallStatus,
    error: error as Error | undefined,
  };
}
