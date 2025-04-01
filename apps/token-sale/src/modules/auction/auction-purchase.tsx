import {
  Button,
  Card,
  Link,
  Metric,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@bltzr-gg/ui";
import { formatUnits, parseUnits } from "viem";
import { AuctionBidInput } from "./auction-bid-input";
import { TransactionDialog } from "modules/transaction/transaction-dialog";
import { LoadingIndicator } from "modules/app/loading-indicator";
import { LockIcon } from "lucide-react";
import { trimCurrency } from "utils";
import { useBidAuction } from "./hooks/use-bid-auction";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RequiresChain } from "components/requires-chain";
import React, { useMemo } from "react";
import { UseWriteContractReturnType, useAccount, useChainId } from "wagmi";
import useERC20Balance from "loaders/use-erc20-balance";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { useAuctionSuspense } from "@/hooks/use-auction";

const schema = z.object({
  baseTokenAmount: z.string(),
  quoteTokenAmount: z.string(),
  bidPrice: z.string().optional(), // Only used for bids that require the bid price to be specified
});

export type BidForm = z.infer<typeof schema>;

export function AuctionPurchase() {
  const { data: auction } = useAuctionSuspense();
  const [open, setOpen] = React.useState(false);
  const currentChainId = useChainId();
  const walletAccount = useAccount();

  const maxBidAmount = useMemo(() => {
    const remaining = auction.initialCapacity - auction.bidStats.totalAmount;
    return (
      +formatUnits(remaining, auction.baseToken.decimals) *
      +formatUnits(auction.minPrice, auction.quoteToken.decimals)
    );
  }, [auction]);

  const totalUserBidAmount =
    auction?.bids
      .filter(
        (b) => b.bidder.toLowerCase() === walletAccount.address?.toLowerCase(),
      )
      .reduce((total, b) => {
        total += BigInt(b.rawAmountIn);
        return total;
      }, 0n) ?? 0n;

  const formattedUserBidAmount = useMemo(
    () =>
      auction && formatUnits(totalUserBidAmount, auction.quoteToken.decimals),
    [auction, totalUserBidAmount],
  );

  const form = useForm<BidForm>({
    mode: "onChange",
    delayError: 600,
    resolver: zodResolver(
      schema
        .refine(
          (data) =>
            parseUnits(data.quoteTokenAmount, auction.quoteToken.decimals) >
            BigInt(0),
          {
            message: "Amount must be greater than 0",
            path: ["quoteTokenAmount"],
          },
        )
        .refine(
          (data) =>
            parseUnits(data.bidPrice ?? "0", auction.quoteToken.decimals) >
            BigInt(0),
          {
            message: "Bid price must be greater than 0",
            path: ["bidPrice"],
          },
        )
        .refine(
          (data) =>
            parseUnits(data.quoteTokenAmount, auction.quoteToken.decimals) >=
            parseUnits(
              auction.minBidSize.toString(),
              auction.quoteToken.decimals,
            ),
          {
            message: `Minimum bid is ${auction.minBidSize}`,
            path: ["quoteTokenAmount"],
          },
        )
        .refine(
          (data) =>
            parseUnits(data.bidPrice ?? "0", auction.quoteToken.decimals) >=
            parseUnits(
              auction.minPrice.toString(),
              auction.quoteToken.decimals,
            ),
          {
            message: `Min rate is ${auction.minPrice} ${auction.quoteToken.symbol}/${auction.baseToken.symbol}`,
            path: ["bidPrice"],
          },
        )
        .refine(
          (data) =>
            parseUnits(data.quoteTokenAmount, auction.quoteToken.decimals) <=
            (quoteTokenBalance ?? BigInt(0)),
          {
            message: `Insufficient balance`,
            path: ["quoteTokenAmount"],
          },
        )
        .refine(
          (data) =>
            parseUnits(data.baseTokenAmount, auction.baseToken.decimals) <=
            parseUnits(auction.capacity.toString(), auction.baseToken.decimals),
          {
            message: "Amount out exceeds capacity",
            path: ["baseTokenAmount"],
          },
        )
        .refine(
          (data) =>
            maxBidAmount === undefined ||
            parseUnits(data.quoteTokenAmount, auction.quoteToken.decimals) <=
              maxBidAmount,
          {
            message: `Exceeds remaining capacity of ${maxBidAmount} ${auction.quoteToken.symbol}`,
            path: ["quoteTokenAmount"],
          },
        ),
    ),
  });

  const [amountIn, minAmountOut] = form.watch([
    "quoteTokenAmount",
    "baseTokenAmount",
  ]);

  const parsedAmountIn = amountIn
    ? parseUnits(amountIn, auction.quoteToken.decimals)
    : BigInt(0);

  const parsedMinAmountOut = minAmountOut
    ? parseUnits(minAmountOut, auction.baseToken.decimals)
    : BigInt(0);

  const { balance: quoteTokenBalance, refetch: refetchQuoteTokenBalance } =
    useERC20Balance({
      chainId: auction.chainId,
      tokenAddress: auction.quoteToken.address,
      balanceAddress: walletAccount.address,
    });

  const handleSuccessfulBid = () => {
    form.reset();
    refetchQuoteTokenBalance();
  };

  const bid = useBidAuction(
    auction.chainId,
    auction.lotId,
    parsedAmountIn,
    parsedMinAmountOut,
    "0x0",
    handleSuccessfulBid,
  );

  // TODO Permit2 signature
  const handleSubmit = () => {
    bid.handleBid();
  };

  const isValidInput = form.formState.isValid;

  const shouldDisable =
    !isValidInput ||
    bid?.bidReceipt?.isLoading ||
    bid?.bidTx?.isPending ||
    !bid.isSimulationSuccess;

  const isWaiting = bid.isWaiting;
  const actionKeyword = "Bid";

  const isWalletChainIncorrect =
    auction.chainId !== currentChainId || !walletAccount.isConnected;

  return (
    <div id="auction-bids" className="mx-auto lg:min-w-[477px]">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Card
            title={
              <>
                Place your bid{" "}
                <Popover>
                  <PopoverTrigger className="inline-block">
                    <QuestionMarkCircledIcon className="text-primary pointer-cur inline-block size-6" />
                  </PopoverTrigger>
                  <PopoverContent className="bg min-w-[400px]">
                    <h3>
                      This form allows you to participate in a{" "}
                      <Link
                        className="text-primary font-bold"
                        href="https://axis.finance/docs/dapp/sealed-bid-auctions"
                      >
                        Sealed Bid Auction
                      </Link>{" "}
                      for purchasing the Notorious $REAL Token.
                    </h3>
                    <ul className="ml-4 mt-2 list-disc">
                      <li>
                        <strong>Spend Amount</strong> is your total bid size.
                      </li>
                      <li>
                        <strong>Bid Price</strong> is the maximum amount
                        you&apos;re willing to pay per token
                      </li>
                    </ul>
                  </PopoverContent>
                </Popover>
              </>
            }
          >
            <AuctionBidInput
              balance={quoteTokenBalance}
              disabled={isWalletChainIncorrect}
            />
            <div className="gap-x-xl mx-auto mt-4 flex w-full empty:hidden">
              {totalUserBidAmount > 0n && (
                <Metric childrenClassName={"text-tertiary-300"} label="You bid">
                  {trimCurrency(formattedUserBidAmount)}{" "}
                  {auction.quoteToken.symbol}
                </Metric>
              )}
            </div>
            <RequiresChain
              buttonClass="w-full"
              chainId={auction.chainId}
              className="mt-4 "
            >
              <div className="mt-4 w-full">
                <Button type="submit" className="w-full" disabled={isWaiting}>
                  {!isWaiting && actionKeyword.toUpperCase()}
                  {isWaiting && (
                    <div className="flex">
                      Waiting for confirmation...
                      <div className="w-1/2"></div>
                      <LoadingIndicator />
                    </div>
                  )}
                </Button>
              </div>
            </RequiresChain>
          </Card>

          <TransactionDialog
            open={open}
            signatureMutation={bid.bidTx as UseWriteContractReturnType}
            error={bid.error}
            onConfirm={handleSubmit}
            mutation={bid.bidReceipt}
            chainId={auction.chainId}
            onOpenChange={(open) => {
              if (!open) {
                bid.bidTx?.reset();
              }
              setOpen(open);
            }}
            hash={bid.bidTx.data}
            disabled={shouldDisable || isWaiting}
            screens={{
              idle: {
                Component: () => (
                  <div className="text-center">
                    {`You're about to place a bid of ${trimCurrency(amountIn)} ${
                      auction.quoteToken.symbol
                    }`}
                  </div>
                ),
                title: `Confirm ${actionKeyword}`,
              },
              success: {
                Component: () => (
                  <div className="flex justify-center text-center">
                    <LockIcon className="mr-1" />
                    Bid encrypted and stored successfully!
                  </div>
                ),
                title: "Transaction Confirmed",
              },
            }}
          />
        </form>
      </FormProvider>
    </div>
  );
}
