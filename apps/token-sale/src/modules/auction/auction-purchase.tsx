import {
  Button,
  Card,
  Link,
  Metric,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from "@bltzr-gg/ui";
import { formatUnits, parseUnits } from "viem";
import { AuctionBidInput } from "./auction-bid-input";
import { Auction, AuctionType } from "@axis-finance/types";
import { TransactionDialog } from "modules/transaction/transaction-dialog";
import { LoadingIndicator } from "modules/app/loading-indicator";
import { LockIcon } from "lucide-react";
import { trimCurrency } from "utils";
import { useBidAuction } from "./hooks/use-bid-auction";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RequiresChain } from "components/requires-chain";
import React, { useEffect, useMemo, useState } from "react";
import { UseWriteContractReturnType, useAccount, useChainId } from "wagmi";
import useERC20Balance from "loaders/use-erc20-balance";
import { getDeployment } from "@axis-finance/deployments";
import {
  PopupTokenWrapper,
  isQuoteAWrappedGasToken,
} from "modules/token/popup-token-wrapper";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { useAuction } from "./hooks/use-auction";

const schema = z.object({
  baseTokenAmount: z.string(),
  quoteTokenAmount: z.string(),
  bidPrice: z.string().optional(), // Only used for bids that require the bid price to be specified
});

export type BidForm = z.infer<typeof schema>;

export function AuctionPurchase() {
  const { data: auction } = useAuction();
  const [open, setOpen] = React.useState(false);
  const currentChainId = useChainId();
  const walletAccount = useAccount();

  const auctionFormatted = auction?.formatted || undefined;

  const [maxBidAmount, setMaxBidAmount] = useState<bigint | undefined>();
  const deployment = useMemo(
    () => auction && getDeployment(auction.chainId),
    [auction],
  );

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
      auction &&
      formatUnits(totalUserBidAmount, Number(auction.quoteToken.decimals)),
    [auction, totalUserBidAmount],
  );

  // Cache the max bid amount
  useEffect(() => {
    if (!auction) {
      return;
    }
    // Only for FPB, since we don't know the amount out for each bid in EMP
    if (!auctionFormatted) {
      setMaxBidAmount(undefined);
      return;
    }

    // Calculate the remaining capacity in terms of quote tokens
    const capacityInQuoteTokens =
      (parseUnits(auction.capacityInitial, auction.baseToken.decimals) *
        parseUnits(
          (auctionFormatted.price ?? "0").replace(/,/g, ""),
          Number(auction.quoteToken.decimals),
        )) /
      parseUnits("1", auction.baseToken.decimals);

    const remainingQuoteTokens =
      capacityInQuoteTokens -
      parseUnits(
        (auctionFormatted.totalBidAmountFormatted ?? "0").replace(/,/g, ""),
        auction.quoteToken.decimals,
      );

    setMaxBidAmount(remainingQuoteTokens);
  }, [
    auction?.capacityInitial,
    auctionFormatted,
    auctionFormatted?.totalBidAmountFormatted,
    auction?.baseToken.decimals,
    auction?.quoteToken.decimals,
    auction,
  ]);

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
            isFixedPriceBatch ||
            parseUnits(data.bidPrice ?? "0", auction.quoteToken.decimals) >
              BigInt(0),
          {
            message: "Bid price must be greater than 0",
            path: ["bidPrice"],
          },
        )
        .refine(
          (data) =>
            isFixedPriceBatch ||
            parseUnits(data.quoteTokenAmount, auction.quoteToken.decimals) >=
              parseUnits(
                auction.encryptedMarginalPrice?.minBidSize ?? "0",
                auction.quoteToken.decimals,
              ),
          {
            message: `Minimum bid is ${auction.formatted?.minBidSize}`,
            path: ["quoteTokenAmount"],
          },
        )
        .refine(
          (data) =>
            isFixedPriceBatch ||
            parseUnits(data.bidPrice ?? "0", auction.quoteToken.decimals) >=
              parseUnits(
                auction.encryptedMarginalPrice?.minPrice ?? "0",
                auction.quoteToken.decimals,
              ),
          {
            message: `Min rate is ${auction.formatted?.minPrice} ${auction.quoteToken.symbol}/${auction.baseToken.symbol}`,
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
            parseUnits(auction.capacity, auction.baseToken.decimals),
          {
            message: "Amount out exceeds capacity",
            path: ["baseTokenAmount"],
          },
        )
        .refine(
          (data) =>
            !isFixedPriceBatch ||
            maxBidAmount === undefined ||
            parseUnits(data.quoteTokenAmount, auction.quoteToken.decimals) <=
              maxBidAmount,
          {
            message: `Exceeds remaining capacity of ${formatUnits(
              maxBidAmount ?? 0n,
              auction.quoteToken.decimals,
            )} ${auction.quoteToken.symbol}`,
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

  const amountInInvalid =
    parsedAmountIn > (quoteTokenBalance ?? BigInt(0)) || // greater than balance
    parsedAmountIn === undefined ||
    parsedAmountIn === BigInt(0); // zero or empty

  const amountOutInvalid =
    minAmountOut === undefined ||
    parsedMinAmountOut === BigInt(0) || // zero or empty
    parsedMinAmountOut >
      parseUnits(auction.capacity, auction.baseToken.decimals) || // exceeds capacity
    (isEMP &&
      (parsedAmountIn * parseUnits("1", auction.baseToken.decimals)) /
        parsedMinAmountOut <
        parseUnits(
          auction.encryptedMarginalPrice?.minPrice ?? "0",
          auction.quoteToken.decimals,
        )); // less than min price

  const isWalletChainIncorrect =
    auction.chainId !== currentChainId || !walletAccount.isConnected;

  return (
    <div id="auction-bids" className="mx-auto lg:min-w-[477px]">
      <FormProvider {...form}>
        <form onSubmit={(e) => e.preventDefault()}>
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
            headerRightElement={
              isQuoteAWrappedGasToken(auction) && (
                <Tooltip
                  content={`Wrap ${deployment?.chain.nativeCurrency.symbol} into ${auction.quoteToken.symbol}`}
                >
                  <PopupTokenWrapper auction={auction} />
                </Tooltip>
              )
            }
          >
            <AuctionBidInput
              balance={quoteTokenBalance}
              auction={auction}
              disabled={isWalletChainIncorrect}
            />
            <div className={"gap-x-xl mx-auto mt-4 flex w-full"}>
              {totalUserBidAmount > 0n && (
                <Metric
                  childrenClassName={"text-tertiary-300"}
                  label={`You ${isEMP ? "bid" : "spent"}`}
                >
                  {trimCurrency(formattedUserBidAmount)}{" "}
                  {auction.quoteToken.symbol}
                </Metric>
              )}
            </div>

            <RequiresChain chainId={auction.chainId} className="mt-4">
              <div className="mt-4 w-full">
                <Button
                  className="w-full"
                  disabled={isWaiting || amountInInvalid || amountOutInvalid}
                >
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
                    {getConfirmCardText(auction, amountIn, minAmountOut)}
                  </div>
                ),
                title: `Confirm ${actionKeyword}`,
              },
              success: {
                Component: () => (
                  <div className="flex justify-center text-center">
                    {isEMP ? (
                      <>
                        <LockIcon className="mr-1" />
                        Bid encrypted and stored successfully!
                      </>
                    ) : (
                      <p>Bid stored successfully!</p>
                    )}
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

function getConfirmCardText(
  auction: Auction,
  amountIn: string,
  amountOut: string,
) {
  const isEMP = auction.auctionType === AuctionType.SEALED_BID;
  const empText = `You're about to place a bid of ${trimCurrency(amountIn)} ${
    auction.quoteToken.symbol
  }`;
  const fpText = `You're about to place a bid of ${trimCurrency(amountOut)} ${
    auction.baseToken.symbol
  } for ${trimCurrency(amountIn)} ${auction.quoteToken.symbol}`;
  return isEMP ? empText : fpText;
}
