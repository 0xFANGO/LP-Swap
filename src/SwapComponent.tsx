import { FC, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ArchiveIcon } from "@radix-ui/react-icons";
import { ArrowUpDown } from "lucide-react";
import { BinLiquidity, StrategyType } from "@meteora-ag/dlmm";
import DecimalInput from "./components/DecimalInput";
import { useMeteOraStore } from "./store";
import {
  createOneSidePositions,
  getActiveBin,
  getToken0Name,
  getToken1Name,
  quoteCreatePosition,
  removePositionLiquidity,
} from "./lib/utils/meteora";
import { getTrueAmount, getWalletBalance } from "./lib/utils/meteora/money";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BN } from "bn.js";
import { Keypair } from "@solana/web3.js";
import { Skeleton } from "./components/ui/skeleton";
import { Toaster, toast as sonnerToast } from "sonner";

const SwapComponent: FC = () => {
  const [fromToken, setFromToken] = useState<"x" | "y">("x");
  const [quoteCreateInfo, setquoteCreateInfo] = useState<{
    binArraysCount: number;
    binArrayCost: number;
    positionCount: number;
    positionCost: number;
  }>({
    binArrayCost: 0,
    binArraysCount: 0,
    positionCost: 0,
    positionCount: 0,
  });
  const sellingAmount = useMeteOraStore((state) => state.sellingAmount);
  const setSellingAmount = useMeteOraStore((state) => state.setSellingAmount);
  const tokenxDecimals = useMeteOraStore((state) => state.tokenxDecimals);
  const tokenyDecimals = useMeteOraStore((state) => state.tokenyDecimals);
  const pairInfo = useMeteOraStore((state) => state.pairInfo);
  const { publicKey, sendTransaction, connected } = useWallet();
  const dlmmPool = useMeteOraStore((state) => state.dlmmPool);
  const [walletBalance, setWalletBalance] = useState(0);
  const [activeBin, setActiveBin] = useState<BinLiquidity | null>(null);
  const [binStep, setBinStep] = useState<number[]>([1]);
  const [popOverOpen, setPopOpen] = useState(false);
  const [limitPrice, setLimitPrice] = useState("");
  const [limitPercentage, setLimitPercentage] = useState("");
  const activePrice =
    fromToken === "x"
      ? activeBin?.pricePerToken
      : String(1 / Number(activeBin?.pricePerToken));
  const getMinBinId = (v: number[]) => {
    if (!activeBin || !dlmmPool || !v.length) {
      return 0;
    }
    const minBinId =
      fromToken === "x" ? activeBin.binId : activeBin.binId - v[0];
    return minBinId;
  };
  const getMaxBinId = (v: number[]) => {
    if (!activeBin || !dlmmPool || !v.length) {
      return 0;
    }
    const maxBinId =
      fromToken === "x" ? activeBin.binId + v[0] : activeBin.binId;
    return maxBinId;
  };
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (!dlmmPool) {
        return;
      }
      const activeBin = await getActiveBin(dlmmPool);
      setActiveBin(activeBin);
    }, 3000); // 每3秒轮询一次
    return () => clearInterval(intervalId); // 清除定时器
  }, [dlmmPool]); // 每次 dlmmPool 改变时触发 useEffect
  const handleChangeBinStep = async (v: number[]) => {
    if (!activeBin || !dlmmPool || !v.length) {
      return;
    }
    const minBin = getMinBinId(v);
    const maxBin = getMaxBinId(v);
    setBinStep(v);
    dlmmPool.getBinsBetweenLowerAndUpperBound(minBin, maxBin).then((res) => {
      const { bins } = res;
      if (!bins.length) {
        return;
      }
      if (fromToken === "x") {
        const maxPrice = bins[bins.length - 1].pricePerToken;
        // 设置最大价格
        setLimitPrice(parseFloat(maxPrice || "").toFixed(6));
        // 设置最大价格百分比
        // 1.2 - 1 = 0.2
        setLimitPercentage(
          `${parseFloat(
            (
              ((Number(maxPrice) - Number(activePrice)) / Number(activePrice)) *
              100
            ).toString()
          ).toFixed(2)}%`
        );
      } else {
        const maxPrice =
          bins[0].pricePerToken === "0"
            ? "0"
            : String(1 / Number(bins[0].pricePerToken));
        // 设置最大价格
        setLimitPrice(parseFloat(maxPrice || "").toFixed(6));
        // 设置最大价格百分比
        // 1.2 - 1 = 0.2
        setLimitPercentage(
          `${parseFloat(
            (
              ((Number(maxPrice) - Number(activePrice)) / Number(activePrice)) *
              100
            ).toString()
          ).toFixed(2)}%`
        );
      }
    });
  };
  useEffect(() => {
    handleChangeBinStep(binStep);
  }, [activeBin, dlmmPool, binStep, fromToken]);
  const maxOutPut = parseFloat(
    String(Number(sellingAmount) * Number(limitPrice))
  ).toFixed(6);
  const { connection } = useConnection();
  useEffect(() => {
    if (!pairInfo || !publicKey) {
      return;
    }
    const mintAddress = fromToken === "x" ? pairInfo.mint_x : pairInfo.mint_y;
    getWalletBalance({
      mintAddress,
      publicKey,
      connection,
    }).then((res) => {
      setWalletBalance(res);
    });
  }, [fromToken, pairInfo, connected]);
  const sellingTokenName =
    fromToken === "x" ? getToken0Name(pairInfo) : getToken1Name(pairInfo);
  const buyingTokenName =
    fromToken === "x" ? getToken1Name(pairInfo) : getToken0Name(pairInfo);
  const handleSwitchToken = () => {
    setFromToken(fromToken === "x" ? "y" : "x");
  };
  const handleQuote = async () => {
    if (!dlmmPool) {
      return;
    }
    const res = await quoteCreatePosition(dlmmPool, {
      strategy: {
        strategyType: StrategyType.SpotImBalanced,
        maxBinId: getMaxBinId(binStep),
        minBinId: getMinBinId(binStep),
      },
    });
    setquoteCreateInfo(res);
  };
  const getSwapText = () => {
    if (!publicKey) {
      return "Connect Wallet";
    }
    if (!sellingAmount) {
      return "Enter an amount";
    }
    if (walletBalance < Number(sellingAmount)) {
      return "Insufficient Amount";
    }
    return "Swap";
  };
  const swapDisabled =
    !publicKey || !sellingAmount || walletBalance < Number(sellingAmount);
  const handleSwap = async () => {
    if (!dlmmPool || !publicKey) {
      return;
    }
    setPopOpen(false);
    sonnerToast.promise(
      async () => {
        useMeteOraStore.setState({ creatingPosition: true });
        const totalXAmount =
          fromToken === "x"
            ? getTrueAmount(sellingAmount, tokenxDecimals)
            : new BN(0);
        const totalYAmount =
          fromToken === "x"
            ? new BN(0)
            : getTrueAmount(sellingAmount, tokenyDecimals);
        const positionKey = new Keypair();
        const txHash = await createOneSidePositions(dlmmPool, {
          connection,
          positionPubKey: positionKey.publicKey,
          user: publicKey,
          totalXAmount,
          totalYAmount,
          strategy: {
            strategyType: StrategyType.SpotImBalanced,
            maxBinId: getMaxBinId(binStep),
            minBinId: getMinBinId(binStep),
          },
        });

        txHash.partialSign(positionKey);
        const confirmation = await sendTransaction(txHash, connection);
        await connection.confirmTransaction(confirmation);
        useMeteOraStore.setState({ creatingPosition: false });
      },
      {
        loading: "Creating position...",
        success: "Position created!",
        error: "Error creating position",
      }
    );
  };

  return (
    <div className="bg-[#1a1a2e] p-6 rounded-lg shadow-lg w-full">
      <Toaster theme="dark" position="bottom-left" />
      <div className="mb-4 bg-black p-2 pb-6  relative">
        <div className="flex justify-between">
          <label className="block text-xs mb-2">Selling</label>
          <div className="text-xs text-[#E8F9FF40] flex justify-between">
            <ArchiveIcon className="mr-1" />
            {walletBalance}{" "}
            {fromToken === "x"
              ? getToken0Name(pairInfo)
              : getToken1Name(pairInfo)}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm font-semibold">{sellingTokenName}</div>
          <DecimalInput
            className="bg-transparent outline-none appearance-none placeholder-gray-500 text-2xl text-right"
            value={sellingAmount}
            onChange={(v) => {
              setSellingAmount(v);
            }}
          />
        </div>
        <div
          className="rounded-full w-7 h-7
        left-1/2 transform -translate-x-1/2
        absolute bottom-[-0.75rem] bg-[#0d131a]
        flex items-center justify-center
        group
        hover:border-[#FF8861] border-2 cursor-pointer
        "
          onClick={handleSwitchToken}
        >
          <ArrowUpDown className="w-4 h-4 cursor-pointer group-hover:text-[#FF8861]" />
        </div>
      </div>
      <div className="mb-2 p-1 flex items-center justify-start">
        <label className="block text-xs mr-2">Buying</label>
        <div className="text-sm font-semibold mr-2">{buyingTokenName}</div>
      </div>
      <div className="flex p-1 mb-2 items-end justify-start">
        <label className="block text-xs mr-2 text-gray-500">Active Price</label>
        {activeBin ? (
          <div className="text-sm mr-2">
            {parseFloat(activePrice || "0").toFixed(6)} {buyingTokenName}/
            {sellingTokenName}
          </div>
        ) : (
          <Skeleton className="w-20 h-5" />
        )}
      </div>
      <div className="w-full p-1">
        <div>
          <label className="block text-xs mr-2 text-gray-500">
            Selling <span className="text-white">{sellingTokenName}</span> at
            Max Price
          </label>
          <div className="grid grid-cols-3">
            <DecimalInput
              value={limitPrice}
              disabled
              className="mt-2 h-full w-full col-span-2 border-[rgb(44, 46, 73)] border-2 focus:border-[[rgb(44, 46, 73)]] text-xl pr-2 focus:outline-none text-right"
            />
            <DecimalInput
              value={limitPercentage}
              disabled
              className="mt-2 h-full w-full border-l-0 border-[rgb(44, 46, 73)] border-2 focus:border-[[rgb(44, 46, 73)]] text-xl pr-2 focus:outline-none text-right"
            />
          </div>
          <div className="mt-5">
            <Slider
              value={binStep}
              onValueChange={handleChangeBinStep}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-xs mr-2 text-gray-500">
          Maximum <span className="text-white">{buyingTokenName}</span> output
        </label>
        <div className="text-sm font-semibold mt-2">
          {maxOutPut} {buyingTokenName}
        </div>
      </div>
      <Popover open={popOverOpen} onOpenChange={setPopOpen}>
        <PopoverTrigger asChild>
          <Button
            disabled={swapDisabled}
            variant="outline"
            className="w-full py-3 rounded-lg text-lg mt-6"
            onClick={handleQuote}
          >
            {getSwapText()}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="text-lg">This will create positions</div>
          <div className="text-xs text-[#525269] mt-2">
            Positions needed for {getMaxBinId(binStep) - getMinBinId(binStep)}{" "}
            bins
          </div>
          <div className="text-xs">
            {quoteCreateInfo.positionCount} Positions
          </div>
          <div className="text-xs text-[#525269]">Positions rent</div>
          <div className="text-xs">
            {quoteCreateInfo.positionCount} x {quoteCreateInfo.positionCost} SOL
            = {quoteCreateInfo.positionCount * quoteCreateInfo.positionCost} SOL
          </div>
          <div className="text-xs text-[#525269]"> Number of transactions</div>
          <div className="text-xs">{quoteCreateInfo.positionCount}</div>
          <div className="text-xs text-[#525269]">Max Transaction Fee</div>
          <div className="text-xs">
            {" "}
            {quoteCreateInfo.positionCount} x 0.00005 SOL ={" "}
            {quoteCreateInfo.positionCount * 0.00005} SOL
          </div>
          <div className="mt-5 flex justify-end">
            <Button variant="secondary" onClick={handleSwap}>
              Confirm
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SwapComponent;
