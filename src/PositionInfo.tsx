import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Skeleton } from "./components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useMeteOraStore } from "./store";
import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { LbPosition } from "@meteora-ag/dlmm";
import {
  getToken0Name,
  getToken1Name,
  removePositionLiquidity,
} from "./lib/utils/meteora";
import { Transaction } from "@solana/web3.js";
import { toast, Toaster } from "sonner";
import { Search } from "lucide-react";

const PositionInfo = () => {
  const dlmmPool = useMeteOraStore((state) => state.dlmmPool);
  const userPositions = useMeteOraStore((state) => state.userPositions);
  const creatingPosition = useMeteOraStore((state) => state.creatingPosition);
  const pairInfo = useMeteOraStore((state) => state.pairInfo);
  const tokenXName = getToken0Name(pairInfo);
  const tokenYName = getToken1Name(pairInfo);
  const tokenxDecimals = useMeteOraStore((state) => state.tokenxDecimals);
  const tokenyDecimals = useMeteOraStore((state) => state.tokenyDecimals);
  const { publicKey, sendTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const [fetchingUser, setFetchingUser] = useState(false);
  const getUserPositions = async () => {
    if (!dlmmPool || !publicKey) {
      return [];
    }
    setFetchingUser(true);
    const positions = await dlmmPool.getPositionsByUserAndLbPair(publicKey);
    useMeteOraStore.setState({ userPositions: positions.userPositions });
    setFetchingUser(false);
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
      toast.error((error as any).message, {
        action: (
          <Button
            onClick={() => {
              handleClaimAndClose(position);
            }}
          >
            Claim&Close
          </Button>
        ),
      });
    }
  };

  useEffect(() => {
    if (!creatingPosition) {
      getUserPositions();
    }
  }, [dlmmPool, publicKey, creatingPosition]);
  const renderPositionInfo = () => {
    if (!dlmmPool || fetchingUser) {
      return <Skeleton className="w-full h-10" />;
    }
    if (userPositions.length === 0) {
      return (
        <div className="flex items-center justify-center flex-col h-40">
          <div className="w-10 h-10 bg-[#141526] flex items-center justify-center rounded-full">
            <Search />
          </div>
          <div className="text-lg font-semibold mt-2">No Positions Found</div>
          <div className="text-sm text-[#8585a1] mt-2">You don't have any liquidities in this pool. </div>
        </div>
      );
    }
    return (
      <>
        <Toaster theme="dark" position="bottom-left" />
        <Accordion type="single" collapsible>
          {userPositions.map((position, index) => {
            const {
              minPositionPrice,
              maxPositionPrice,
              tokenXAmount,
              tokenYAmount,
              tokenXFee,
              tokenYFee,
            } = getPositionInfo(position);
            return (
              <AccordionItem value={`item-${index}`}>
                <AccordionTrigger>
                  <div>
                    <div className="font-semibold">
                      {minPositionPrice} - {maxPositionPrice}
                    </div>
                    <div className="text-xs text-[#F5F5FF66]">
                      {tokenYName} per {tokenXName}
                    </div>
                  </div>
                  {/* <div>
                    <div className="font-semibold">67.3% SOL</div>
                    <div className="font-semibold">22.7% USDC</div>
                  </div> */}
                </AccordionTrigger>
                <AccordionContent className="max-h-40">
                  <div className="grid grid-cols-2">
                    <div className="col-span-1">
                      <div className="text-[#F5F5FF66]">Current Balance</div>
                      <div>
                        <span className="font-semibold ">{tokenXAmount}</span>{" "}
                        SOL
                      </div>
                      <div>
                        <span className="font-semibold ">{tokenYAmount}</span>{" "}
                        USDC
                      </div>
                      <div className="text-[#F5F5FF66]">Unclaimed Fee</div>
                      <div>
                        <span className="font-semibold">{tokenXFee}</span> SOL
                      </div>
                      <div>
                        <span className="font-semibold">{tokenYFee}</span> USDC
                      </div>
                    </div>
                    <div>
                      <Button
                        variant="secondary"
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
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                          handleWithdraw(position, {
                            percentOfLiquidity: 100,
                            shouldClaimAndClose: true,
                          });
                        }}
                      >
                        Withdraw & Close
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </>
    );
  };
  return <>{renderPositionInfo()}</>;
};

export default PositionInfo;
