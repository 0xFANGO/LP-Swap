import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Skeleton } from "./components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useMeteOraStore, UserPosition } from "./store";
import { useEffect } from "react";
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

const PositionInfo = () => {
  const dlmmPool = useMeteOraStore((state) => state.dlmmPool);
  const userPositions = useMeteOraStore((state) => state.userPositions);
  const creatingPosition = useMeteOraStore((state) => state.creatingPosition);
  const pairInfo = useMeteOraStore((state) => state.pairInfo);
  const tokenXName = getToken0Name(pairInfo);
  const tokenYName = getToken1Name(pairInfo);
  const tokenxDecimals = useMeteOraStore((state) => state.tokenxDecimals);
  const tokenyDecimals = useMeteOraStore((state) => state.tokenyDecimals);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const getUserPositions = async () => {
    if (!dlmmPool || !publicKey) {
      return [];
    }
    const positions = await dlmmPool.getPositionsByUserAndLbPair(publicKey);
    const positionMap = localStorage.getItem("positionMap");
    const positionMapObj = positionMap ? JSON.parse(positionMap) : {};
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
    useMeteOraStore.setState({ userPositions: formatPositions });
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
              const confirmation = await sendTransaction(closeTx, connection);
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
    try {
      const tx = (await removePositionLiquidity(dlmmPool, {
        positionPub: position.publicKey,
        userPub: publicKey,
        percentOfLiquidity,
        shouldClaimAndClose,
      })) as Transaction;
      toast.promise(
        async () => {
          const confirmation = await sendTransaction(tx, connection);
          await connection.confirmTransaction(confirmation);
          getUserPositions();
        },
        {
          loading: "Withdrawing...",
          success: "Liquidity Withdrawn",
          error: "Error Withdrawing Liquidity",
        }
      );
    } catch (error) {
      // no liquidity to withdraw
      toast.error((error as any).message);
    }
  };

  useEffect(() => {
    if (!creatingPosition) {
      getUserPositions();
    }

    const intervalId = setInterval(() => {
      if (!creatingPosition) {
        getUserPositions();
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [dlmmPool, publicKey, creatingPosition]);
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
    return `${percentage.toFixed(2)}%`;
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
    if (!dlmmPool) {
      return <Skeleton className="w-full h-10" />;
    }
    if (userPositions.length === 0) {
      return (
        <div className="flex items-center justify-center flex-col h-40">
          <div className="w-10 h-10 bg-[#141526] flex items-center justify-center rounded-full">
            <Search />
          </div>
          <div className="text-lg font-semibold mt-2">No Positions Found</div>
          <div className="text-sm text-[#8585a1] mt-2">
            You don't have any liquidities in this pool.{" "}
          </div>
        </div>
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
                  <AccordionTrigger className="items-start">
                    <div>
                      <div className="font-semibold">
                        {getMarketPrice(position)}{" "}
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
                          <>
                            <div className="font-semibold">
                              {calculatePercent(position)}{" "}
                              {position.positionData.sellingToken}
                            </div>
                            <Badge variant="secondary" className="mt-1">
                              Swapped
                            </Badge>
                          </>
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
