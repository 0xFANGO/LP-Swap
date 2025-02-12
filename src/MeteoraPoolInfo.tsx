"use client";
import { ExternalLink, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMeteOraStore } from "./store";
import { Skeleton } from "./components/ui/skeleton";
import BigNumber from "bignumber.js";
import { formatNumber, getTokenURL } from "./lib/utils/meteora/money";
import { getToken0Name, getToken1Name } from "./lib/utils/meteora";

export default function MeteoraPoolInfo() {
  const pairInfo = useMeteOraStore((state) => state.pairInfo);
  const tokenxDecimals = useMeteOraStore((state) => state.tokenxDecimals);
  const tokenyDecimals = useMeteOraStore((state) => state.tokenyDecimals);
  const renderSkeleton = () => {
    return <Skeleton className="w-20 h-4" />;
  };
  const formatMintAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <TooltipProvider>
      <div className="w-full mt-2 bg-[#1a1a2e] text-white rounded-xl">
        <div className="h-full p-5 flex flex-col">
          {/* Header with Total Value */}
          <div className="flex items-baseline gap-3 pb-4 border-b border-gray-800">
            <div className="text-3xl font-bold tracking-tight">
              {pairInfo
                ? formatNumber(new BigNumber(pairInfo.liquidity || "0"))
                : renderSkeleton()}
            </div>
            <div className="text-gray-400 text-sm">Total Value Locked</div>
          </div>

          {/* Main Content */}
          <div className="flex gap-8 flex-1 pt-4">
            {/* Left Column - Liquidity */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-medium">Liquidity Allocation</h2>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Current distribution of liquidity across tokens
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="space-y-3">
                {/* SOL Token */}
                <div className="group flex items-center justify-between bg-white/5 rounded-lg p-3 hover:bg-white/[0.07] transition-colors">
                  <div className="flex items-center gap-3">
                    {pairInfo ? (
                      <img
                        src={getTokenURL(pairInfo?.mint_x)}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <Skeleton className="w-8 h-8 rounded-full" />
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-medium">
                          {getToken0Name(pairInfo)}
                        </span>
                        <ExternalLink
                          onClick={() => {
                            window.open(
                              `https://solscan.io/token/${pairInfo?.mint_x}`,
                              "_blank"
                            );
                          }}
                          className="w-3.5 h-3.5 cursor-pointer text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <div className="text-gray-400 text-xs">
                        {pairInfo
                          ? formatMintAddress(pairInfo?.mint_x || "")
                          : renderSkeleton()}
                      </div>
                    </div>
                  </div>
                  <div className="font-medium">
                    {pairInfo
                      ? new BigNumber(
                          pairInfo.reserve_x_amount / 10 ** tokenxDecimals
                        ).toFormat(2)
                      : renderSkeleton()}
                  </div>
                </div>

                {/* USDC Token */}
                <div className="group flex items-center justify-between bg-white/5 rounded-lg p-3 hover:bg-white/[0.07] transition-colors">
                  <div className="flex items-center gap-3">
                    {pairInfo ? (
                      <img
                        src={getTokenURL(pairInfo?.mint_y)}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <Skeleton className="w-8 h-8 rounded-full" />
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-medium">
                          {getToken1Name(pairInfo)}
                        </span>
                        <ExternalLink
                          onClick={() => {
                            window.open(
                              `https://solscan.io/token/${pairInfo?.mint_y}`,
                              "_blank"
                            );
                          }}
                          className="w-3.5 h-3.5 cursor-pointer text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <div className="text-gray-400 text-xs">
                        {pairInfo
                          ? formatMintAddress(pairInfo?.mint_y || "")
                          : renderSkeleton()}
                      </div>
                    </div>
                  </div>
                  <div className="font-medium">
                    {pairInfo
                      ? new BigNumber(
                          pairInfo.reserve_y_amount / 10 ** tokenyDecimals
                        ).toFormat(2)
                      : renderSkeleton()}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Fees */}
            <div className="w-72 space-y-2">
              <h2 className="text-sm font-medium mb-3">Fee Structure</h2>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="col-span-2 flex justify-between items-center bg-white/5 rounded-lg p-2.5">
                  <div className="text-gray-400">24h Fee</div>
                  <div className="font-medium text-green-400">
                    {pairInfo
                      ? formatNumber(new BigNumber(pairInfo.fees_24h))
                      : renderSkeleton()}
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white/5 rounded-lg p-2.5">
                  <div className="text-gray-400">Bin Step</div>
                  <div>{pairInfo ? pairInfo?.bin_step : renderSkeleton()}</div>
                </div>

                <div className="flex justify-between items-center bg-white/5 rounded-lg p-2.5">
                  <Tooltip>
                    <TooltipTrigger className="text-gray-400">
                      Base Fee
                    </TooltipTrigger>
                    <TooltipContent>
                      Minimum fee charged for all transactions
                    </TooltipContent>
                  </Tooltip>
                  <div>
                    {pairInfo ? pairInfo.base_fee_percentage : renderSkeleton()}
                    %
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white/5 rounded-lg p-2.5">
                  <Tooltip>
                    <TooltipTrigger className="text-gray-400">
                      Max Fee
                    </TooltipTrigger>
                    <TooltipContent>
                      Maximum fee that can be charged
                    </TooltipContent>
                  </Tooltip>
                  <div>
                    {pairInfo ? pairInfo.max_fee_percentage : renderSkeleton()}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
