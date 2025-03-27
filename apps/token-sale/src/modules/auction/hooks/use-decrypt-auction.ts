import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Auction } from "@axis-finance/types";
import {
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Hex } from "viem";
import { cloakClient } from "utils/cloak-client";
import { contracts } from "@/constants";
import { useAuctionSuspense } from "@/hooks/use-auction";

/** Used to manage decrypting the next set of bids */
export const useDecryptedBids = () => {
  const { data: auction } = useAuctionSuspense();
  //Fixed priced auctions dont require decryption

  const params = {
    xChainId: auction.chainId,
    lotId: Number(auction.lotId),
  };

  const privateKeyQuery = useQuery({
    queryKey: [
      "get_private_key",
      auction.id,
      contracts.auctionHouse.address,
      params,
    ],
    queryFn: () =>
      cloakClient.keysApi.privateKeyLotIdGet({
        ...params,
        xAuctionHouse: contracts.auctionHouse.address,
      }),
    placeholderData: keepPreviousData,
    enabled:
      auction.bids.length === 0 ||
      auction.bids.length - auction.bidStats.refunded >
        auction.bidStats.decrypted,
  });

  const DECRYPT_NUM = 100; // TODO determine limit on amount per chain

  const hintsQuery = useQuery({
    queryKey: [
      "hints",
      auction.id,
      contracts.auctionHouse.address,
      params,
      DECRYPT_NUM,
    ],
    queryFn: () =>
      cloakClient.keysApi.hintsLotIdNumGet({
        ...params,
        xAuctionHouse: contracts.auctionHouse.address,
        num: DECRYPT_NUM,
      }),
  });

  const hints = hintsQuery.data as Hex[];

  //Send bids to the contract for decryption
  const { data: decryptCall, ...decryptCallQuery } = useSimulateContract({
    address: contracts.encryptedMarginalPrice.address,
    abi: contracts.encryptedMarginalPrice.abi,
    functionName: "submitPrivateKey",
    chainId: auction.chainId,
    args: [
      BigInt(auction.lotId),
      BigInt(privateKeyQuery.data ?? 0),
      BigInt(hints?.length ?? 0),
      hints,
    ],
    query: { enabled: privateKeyQuery.isSuccess },
  });

  const decrypt = useWriteContract();
  const decryptReceipt = useWaitForTransactionReceipt({ hash: decrypt.data });

  const handleDecryption = () => decrypt.writeContract(decryptCall!.request);

  const error = [
    privateKeyQuery,
    decrypt,
    decryptCallQuery,
    decryptReceipt,
  ].find((tx) => tx.isError)?.error;

  return {
    nextBids: privateKeyQuery,
    decryptTx: decrypt,
    decryptReceipt,
    handleDecryption,
    error: error as Error | undefined,
    isWaiting: decrypt.isPending || decryptReceipt.isLoading,
  };
};
