import {
  Button,
  Card,
  Link,
  Metric,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@bltzr-gg/ui";
import { parseUnits } from "viem";
import { AuctionBidInput } from "./auction-bid-input";
import { ExternalLink } from "lucide-react";
import { formatCurrencyUnits } from "utils";
import { useBidAuction } from "./hooks/use-bid-auction";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RequiresChain } from "components/requires-chain";
import { useCallback, useMemo } from "react";
import { useAccount, useChainId } from "wagmi";
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
  const currentChainId = useChainId();
  const walletAccount = useAccount();

  const maxBidAmount = useMemo(
    () => auction.initialCapacity - auction.bidStats.totalAmount,
    [auction],
  );

  const totalUserBidAmount = useMemo(
    () =>
      auction?.bids
        .filter(
          (b) =>
            b.bidder.toLowerCase() === walletAccount.address?.toLowerCase(),
        )
        .reduce((total, b) => {
          total += BigInt(b.rawAmountIn);
          return total;
        }, 0n) ?? 0n,
    [auction?.bids, walletAccount.address],
  );

  const quoteTokens = useERC20Balance({
    tokenAddress: auction.quoteToken.address,
    balanceAddress: walletAccount.address,
  });

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
            auction.minBidSize,

          {
            message: `Minimum bid is ${auction.minBidSize}`,
            path: ["quoteTokenAmount"],
          },
        )
        .refine(
          (data) =>
            parseUnits(data.bidPrice ?? "0", auction.quoteToken.decimals) >=
            auction.minPrice,
          {
            message: `Min rate is ${auction.minPrice} ${auction.quoteToken.symbol}/${auction.baseToken.symbol}`,
            path: ["bidPrice"],
          },
        )
        .refine(
          (data) =>
            parseUnits(data.quoteTokenAmount, auction.quoteToken.decimals) <=
            (quoteTokens.data ?? BigInt(0)),
          {
            message: `Insufficient balance`,
            path: ["quoteTokenAmount"],
          },
        )
        .refine(
          (data) =>
            parseUnits(data.baseTokenAmount, auction.baseToken.decimals) <=
            auction.capacity,
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

  const parsedAmountIn = useMemo(
    () =>
      amountIn ? parseUnits(amountIn, auction.quoteToken.decimals) : BigInt(0),
    [amountIn, auction.quoteToken.decimals],
  );

  const parsedMinAmountOut = useMemo(
    () =>
      minAmountOut
        ? parseUnits(minAmountOut, auction.baseToken.decimals)
        : BigInt(0),
    [minAmountOut, auction.baseToken.decimals],
  );

  const handleSuccessfulBid = useCallback(() => {
    form.reset();
    quoteTokens.refetch();
  }, [form, quoteTokens]);

  const bid = useBidAuction(
    auction.chainId,
    auction.lotId,
    parsedAmountIn,
    parsedMinAmountOut,
    "0x0",
    handleSuccessfulBid,
  );

  const isWalletChainIncorrect =
    auction.chainId !== currentChainId || !walletAccount.isConnected;

  return (
    <div id="auction-bids">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(bid.handleBid)}>
          <Card
            headerRightElement={
              <div className="empty:hidden">
                {totalUserBidAmount > 0n && (
                  <Metric
                    className="text-right"
                    childrenClassName={"text-tertiary-300"}
                    label="Your total bid"
                  >
                    {formatCurrencyUnits(
                      totalUserBidAmount,
                      auction.quoteToken,
                    )}
                  </Metric>
                )}
              </div>
            }
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
            {quoteTokens.isSuccess && quoteTokens.data > 0n && (
              <div className="flex gap-x-2">
                Balance:{" "}
                {formatCurrencyUnits(quoteTokens.data, auction.quoteToken)}
              </div>
            )}
            <p className="text-destructive empty:hidden">
              {bid.error?.message}
            </p>

            {quoteTokens.isSuccess && quoteTokens.data === 0n && (
              <p>
                You&apos;ll need a {auction.quoteToken.symbol} balance to
                bid.&nbsp;
                <Link
                  className="font-bold text-white"
                  href={`https://app.uniswap.org/swap?chain=${auction.chainName}&inputCurrency=NATIVE&outputCurrency=${auction.quoteToken.address}`}
                >
                  Luckily, you can get some here
                  <ExternalLink className="mb-0.5 ml-0.5 inline size-4" />.
                </Link>
              </p>
            )}
            <AuctionBidInput
              balance={quoteTokens.data}
              disabled={isWalletChainIncorrect}
            />
            {parseFloat(minAmountOut) > 0 && (
              <p className="px-1.5">
                A winning bid will award you a minimum of{" "}
                {parseFloat(minAmountOut).toLocaleString()} $
                {auction.baseToken.symbol}.
              </p>
            )}
            <RequiresChain
              buttonClass="w-full"
              chainId={auction.chainId}
              className="mt-4 "
            >
              <div className="mt-4 w-full">
                <Button
                  loading={
                    bid.isWaiting ||
                    bid.allowance.isLoading ||
                    bid.bidTx.isPending
                  }
                  type="submit"
                  className="w-full"
                >
                  {bid.allowance.isLoading
                    ? "Approving..."
                    : bid.isWaiting
                      ? "Waiting for confirmation..."
                      : bid.bidTx.isPending
                        ? "Bidding..."
                        : "Bid"}
                </Button>
              </div>
            </RequiresChain>
          </Card>
        </form>
      </FormProvider>
    </div>
  );
}
