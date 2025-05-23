import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Skeleton } from "./components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useMeteOraStore, UserPosition } from "./store";
import { useEffect, useRef } from "react";
import { Button } from "./components/ui/button";
import { LbPosition } from "@meteora-ag/dlmm";
import {
  getToken0Name,
  getToken1Name,
  removePositionLiquidity,
} from "./lib/utils/meteora";
import { Transaction } from "@solana/web3.js";
import { toast, Toaster } from "sonner";
import { Info, Search, TriangleAlert } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
import { Badge } from "./components/ui/badge";
import { useSolNetWork } from "./hooks/use-sol-network";
import { EmptyState, VStack } from "@chakra-ui/react";
import { Progress } from "./components/ui/progress";

const PositionInfo = () => {
  const { buildOptimalTransaction } = useSolNetWork();
  const dlmmPool = useMeteOraStore((state) => state.dlmmPool);
  const userPositions = useMeteOraStore((state) => state.userPositions);
  // const mockUserPositions = useMeteOraStore((state) => state.mockUserPositions);
  const mock = useMeteOraStore((state) => state.useMockData);
  const creatingPosition = useMeteOraStore((state) => state.creatingPosition);
  const pairInfo = useMeteOraStore((state) => state.pairInfo);
  const tokenXName = getToken0Name(pairInfo);
  const tokenYName = getToken1Name(pairInfo);
  const tokenxDecimals = useMeteOraStore((state) => state.tokenxDecimals);
  const tokenyDecimals = useMeteOraStore((state) => state.tokenyDecimals);
  const alertAtPercent = useMeteOraStore((state) => state.alertAtPercent);
  const { publicKey, sendTransaction } = useWallet();
  // const allPositions = useQuery({
  //   queryKey: ["publicKey", publicKey],
  //   queryFn: async () => {
  //     if (!publicKey) {
  //       return [];
  //     }
  //     if (mock) {
  //       return [];
  //     }
  //     const allPos =  await getAllUserPositions(publicKey.toBase58());
  //     return allPos?.operations || [];
  //   },
  //   enabled: !!publicKey,
  // });
  const autoAlertAndRemove = useMeteOraStore(
    (state) => state.autoAlertAndRemove
  );
  const withdrawingPositionMap = useRef<{
    [key: string]: boolean;
  }>({});
  const { connection } = useConnection();
  const getUserPositions = async () => {
    if (!dlmmPool || !publicKey) {
      return [];
    }
    // const allPosInfo =  await allPositions.refetch();
    const positions = await dlmmPool.getPositionsByUserAndLbPair(publicKey);
    console.log("positions", positions);
    const positionMap = localStorage.getItem("positionMap") || "{}";
    const positionMapObj: any = positionMap ? JSON.parse(positionMap) : {};
    const formatPositions: UserPosition[] = positions.userPositions.map(
      (position) => {
        const additionPositionData =
          positionMapObj[position.publicKey.toString()];
        return {
          ...position,
          positionData: additionPositionData
            ? {
                ...additionPositionData,
                ...position.positionData,
              }
            : position.positionData,
        };
      }
    );
    formatPositions.sort((a, b) => {
      return (
        a.positionData.positionBinData[0].binId -
        b.positionData.positionBinData[0].binId
      );
    });
    console.log("formatPositions", formatPositions);
    useMeteOraStore.setState({ userPositions: formatPositions });
    return formatPositions;
  };
  const getPositionInfo = (position: LbPosition) => {
    const maxPositionPrice =
      position.positionData.positionBinData[
        position.positionData.positionBinData.length - 1
      ].pricePerToken;
    const minPositionPrice =
      position.positionData.positionBinData[0].pricePerToken;
    const tokenXAmount = position.positionData.totalXAmount;
    const tokenYAmount = position.positionData.totalYAmount;
    const tokenXFee = position.positionData.feeX.toString();
    const tokenYFee = position.positionData.feeY.toString();
    return {
      maxPositionPrice: parseFloat(maxPositionPrice).toFixed(2),
      minPositionPrice: parseFloat(minPositionPrice).toFixed(2),
      tokenXAmount: parseFloat(
        String(Number(tokenXAmount) / 10 ** tokenxDecimals)
      ).toFixed(6),
      tokenYAmount: parseFloat(
        String(Number(tokenYAmount) / 10 ** tokenyDecimals)
      ).toFixed(6),
      tokenXFee: parseFloat(
        String(Number(tokenXFee) / 10 ** tokenxDecimals)
      ).toFixed(6),
      tokenYFee: parseFloat(
        String(Number(tokenYFee) / 10 ** tokenyDecimals)
      ).toFixed(6),
    };
  };
  const handleClaimAndClose = async (position: LbPosition) => {
    if (!dlmmPool || !publicKey) {
      return;
    }
    const claimTx = await dlmmPool.claimAllRewardsByPosition({
      owner: publicKey,
      position,
    });
    try {
      toast.promise(
        async () => {
          const confirmation = await sendTransaction(claimTx[0], connection);
          await connection.confirmTransaction(confirmation);
          toast.promise(
            async () => {
              const closeTx = await dlmmPool.closePosition({
                owner: publicKey,
                position,
              });
              const result = await buildOptimalTransaction(closeTx);
              if (!result) {
                return;
              }
              const { opTx } = result;
              const confirmation = await sendTransaction(opTx, connection);
              await connection.confirmTransaction(confirmation);
              toast.success("Position Closed");
              getUserPositions();
            },
            {
              loading: "Closing Position...",
              success: "Position Closed",
              error: "Error Closing Position",
            }
          );
        },
        {
          loading: "Claiming Position Reward fees...",
          success: "Claimed Position Reward fees",
          error: "Error Claiming Position Reward fees",
        }
      );
    } catch (error) {
      // no liquidity to withdraw
      toast.error((error as any).message);
    }
  };
  const handleWithdraw = async (
    position: LbPosition,
    {
      percentOfLiquidity,
      shouldClaimAndClose,
    }: {
      percentOfLiquidity: number;
      shouldClaimAndClose: boolean;
    }
  ) => {
    if (!dlmmPool || !publicKey) {
      return;
    }
    withdrawingPositionMap.current[position.publicKey.toString()] = true;
    const tx = (await removePositionLiquidity(dlmmPool, {
      positionPub: position.publicKey,
      userPub: publicKey,
      percentOfLiquidity,
      shouldClaimAndClose,
    })) as Transaction;
    const result = await buildOptimalTransaction(tx);
    if (!result) {
      return;
    }
    const { opTx } = result;
    try {
      toast("Withdrawing...");
      const confirmation = await sendTransaction(opTx, connection);
      await connection.confirmTransaction(confirmation);
      getUserPositions();
      toast.success("Liquidity Withdrawn");
    } catch (e: any) {
      withdrawingPositionMap.current[position.publicKey.toString()] = false;
      toast.error("Error Withdrawing Liquidity", e.message);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (!creatingPosition) {
        const positions = await getUserPositions();
        for (const position of positions) {
          const percent = calculatePercent(position);
          const isWithdrawing =
            withdrawingPositionMap.current[position.publicKey.toString()];

          if (
            autoAlertAndRemove &&
            percent >= alertAtPercent &&
            !isWithdrawing
          ) {
            await handleWithdraw(position, {
              percentOfLiquidity: 100,
              shouldClaimAndClose: false,
            });
          }
        }
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [
    dlmmPool,
    publicKey,
    creatingPosition,
    autoAlertAndRemove,
    alertAtPercent,
  ]);
  const isEmpty = (position: LbPosition) => {
    return (
      Number(position.positionData.totalXAmount) === 0 &&
      Number(position.positionData.totalYAmount) === 0
    );
  };
  const getBuyingTokenName = (position: UserPosition) => {
    return position.positionData.sellingToken === tokenXName
      ? tokenYName
      : tokenXName;
  };
  const calculatePercent = (position: UserPosition) => {
    const tokenXName = getToken0Name(pairInfo);
    const sellingTokenAmount =
      position.positionData.sellingToken === tokenXName
        ? Number(position.positionData.totalXAmount) / 10 ** tokenxDecimals
        : Number(position.positionData.totalYAmount) / 10 ** tokenyDecimals;
    const percentage =
      ((Number(position.positionData.sellingAmount) - sellingTokenAmount) /
        Number(position.positionData.sellingAmount)) *
      100;
    return percentage <=0 ? 0 : percentage;
  };
  const getMarketPrice = (position: UserPosition) => {
    const { minPositionPrice, maxPositionPrice } = getPositionInfo(position);
    if (!position.positionData.sellingAmount) {
      return `${minPositionPrice} - ${maxPositionPrice}`;
    }
    if (position.positionData.sellingToken === tokenXName) {
      return `${minPositionPrice} - ${maxPositionPrice}`;
    }
    return `${(1 / Number(maxPositionPrice)).toFixed(6)} - ${(
      1 / Number(minPositionPrice)
    ).toFixed(6)}`;
  };
  const getXYOrder = (position: UserPosition) => {
    if (!position.positionData.sellingToken) {
      return `${tokenYName}/${tokenXName}`;
    }
    if (position.positionData.sellingToken === tokenXName) {
      return `${tokenYName}/${tokenXName}`;
    }
    return `${tokenXName}/${tokenYName}`;
  };
  const renderPositionInfo = () => {
    if (!dlmmPool && !mock) {
      return <Skeleton className="w-full h-10" />;
    }
    
    if (mock) {
      // Create static mock position data for UI display
      const mockPosition = {
        publicKey: { toString: () => "mock-position-id" },
        positionData: {
          positionBinData: [
            { binId: 100, pricePerToken: "125" },
            { binId: 110, pricePerToken: "175" },
          ],
          totalXAmount: (10 * 10 ** tokenxDecimals).toString(),
          totalYAmount: (25 * 10 ** tokenyDecimals).toString(),
          feeX: (0.05 * 10 ** tokenxDecimals).toString(),
          feeY: (0.12 * 10 ** tokenyDecimals).toString(),
          sellingAmount: "10",
          sellingToken: tokenXName,
          maxOutPut: "25",
        },
      };

      return (
        <>
          <Toaster theme="dark" position="bottom-left" />
          <Accordion
            type="single"
            collapsible
            className="max-h-96 overflow-y-auto"
          >
            <AccordionItem
              key={mockPosition.publicKey.toString()}
              value="item-0"
            >
              <AccordionTrigger className="items-start hover:no-underline cursor-default">
                <div>
                  <div className="font-semibold">
                    <div className="flex items-center">
                      125 - 175
                    </div>
                    <div className="text-xs text-[#F5F5FF66]">
                      {tokenYName}/{tokenXName}
                    </div>
                  </div>

                  <div className="text-xs mt-2 text-[#F5F5FF66]">
                    <div> Selling 10 {tokenXName}</div>
                    <div> for 25 {tokenYName}</div>
                  </div>
                </div>
                <div>
                  <div className="flex flex-col items-start gap-2">
                    <div className="font-semibold flex items-center">
                      42.50% {tokenXName}
                      <Badge variant="secondary" className="ml-2">
                        Swapped
                      </Badge>
                    </div>
                    <Progress value={42.5} />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="max-h-40">
                <div className="grid grid-cols-2">
                  <div className="col-span-1">
                    <div className="text-[#F5F5FF66]">Current Balance</div>
                    <div>
                      <span className="font-semibold">10.000000</span>{" "}
                      {tokenXName}
                    </div>
                    <div>
                      <span className="font-semibold">25.000000</span>{" "}
                      {tokenYName}
                    </div>
                    <div className="text-[#F5F5FF66] flex items-center">
                      Unclaimed Fee
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-4 h-4 ml-1" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div>
                              <span className="font-semibold">0.050000</span>{" "}
                              {tokenXName}
                            </div>
                            <div>
                              <span className="font-semibold">0.120000</span>{" "}
                              {tokenYName}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        toast.success("Withdraw action triggered (mock)");
                      }}
                    >
                      Withdraw Liquidity
                    </Button>
                    <Button
                      variant="secondary"
                      className="mt-2 text-[#AA84FF] bg-[#8756F53D]"
                      onClick={() => {
                        toast.success("Claim & Close action triggered (mock)");
                      }}
                    >
                      Claim Fee & Close
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      );
    }
    
    if (userPositions.length === 0) {
      return (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <Search />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title className="text-xl font-semibold">
                No Positions Found
              </EmptyState.Title>
              <EmptyState.Description>
                You don't have any liquidities in this pool.{" "}
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      );
    }
    return (
      <>
        <Toaster theme="dark" position="bottom-left" />
        <Accordion
          type="single"
          collapsible
          className="max-h-96 overflow-y-auto"
        >
          {userPositions.map((position, index) => {
            const { tokenXAmount, tokenYAmount, tokenXFee, tokenYFee } =
              getPositionInfo(position);
            return (
              <>
                <AccordionItem
                  key={position.publicKey?.toString()}
                  value={`item-${index}`}
                >
                  <AccordionTrigger className="items-start hover:no-underline cursor-default">
                    <div>
                      <div className="font-semibold">
                        <div className="flex items-center">
                          {getMarketPrice(position)}{" "}
                        </div>
                        <div className="text-xs text-[#F5F5FF66]">
                          {getXYOrder(position)}
                        </div>
                      </div>

                      <div className="text-xs mt-2 text-[#F5F5FF66]">
                        {position.positionData.sellingAmount && (
                          <>
                            <div>
                              {" "}
                              Selling {position.positionData.sellingAmount}{" "}
                              {position.positionData.sellingToken}
                            </div>
                            <div>
                              {" "}
                              for {position.positionData.maxOutPut}{" "}
                              {getBuyingTokenName(position)}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      {isEmpty(position) ? (
                        <div className="flex items-start">
                          <TriangleAlert className="mr-1 text-[#f2be00]" /> No
                          Liquidity
                        </div>
                      ) : (
                        position.positionData.sellingAmount && (
                          <div className="flex flex-col items-start gap-2">
                            <div className="font-semibold flex items-center">
                              {calculatePercent(position).toFixed(2)}%{" "}
                              {position.positionData.sellingToken}
                              <Badge variant="secondary" className="ml-2">
                                Swapped
                              </Badge>
                            </div>
                            <Progress value={calculatePercent(position)} />
                          </div>
                        )
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="max-h-40">
                    <div className="grid grid-cols-2">
                      <div className="col-span-1">
                        <div className="text-[#F5F5FF66]">Current Balance</div>
                        <div>
                          <span className="font-semibold ">{tokenXAmount}</span>{" "}
                          {tokenXName}
                        </div>
                        <div>
                          <span className="font-semibold ">{tokenYAmount}</span>{" "}
                          {tokenYName}
                        </div>
                        <div className="text-[#F5F5FF66] flex items-center">
                          Unclaimed Fee
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 h-4 ml-1" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div>
                                  <span className="font-semibold">
                                    {tokenXFee}
                                  </span>{" "}
                                  {tokenXName}
                                </div>
                                <div>
                                  <span className="font-semibold">
                                    {tokenYFee}
                                  </span>{" "}
                                  {tokenYName}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            handleWithdraw(position, {
                              percentOfLiquidity: 100,
                              shouldClaimAndClose: false,
                            });
                          }}
                        >
                          Withdraw Liquidity
                        </Button>
                        <Button
                          variant="secondary"
                          className="mt-2 text-[#AA84FF] bg-[#8756F53D]"
                          onClick={() => {
                            handleClaimAndClose(position);
                          }}
                        >
                          Claim Fee & Close
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </>
            );
          })}
        </Accordion>
      </>
    );
  };
  return <>{renderPositionInfo()}</>;
};

export default PositionInfo;
