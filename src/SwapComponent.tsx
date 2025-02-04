import { FC, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ArchiveIcon } from "@radix-ui/react-icons";
import { ArrowUpDown } from "lucide-react";
import DLMM, { BinLiquidity } from "@meteora-ag/dlmm";
import DecimalInput from "./components/DecimalInput";
import { useMeteOraStore } from "./store";
import {
  getActiveBin,
  getToken0Name,
  getToken1Name,
} from "./lib/utils/meteora";
import { getWalletBalance } from "./lib/utils/meteora/money";

const SwapComponent: FC = () => {
  const [fromToken, setFromToken] = useState<"x" | "y">("x");
  const sellingAmount = useMeteOraStore((state) => state.sellingAmount);
  const setSellingAmount = useMeteOraStore((state) => state.setSellingAmount);
  const pairInfo = useMeteOraStore((state) => state.pairInfo);
  const { publicKey } = useWallet();
  const dlmmPool = useMeteOraStore((state) => state.dlmmPool);
  const [walletBalance, setWalletBalance] = useState(0);
  const [activeBin, setActiveBin] = useState<BinLiquidity | null>(null);
  const [limitPrice, setLimitPrice] = useState("");
  const [limitPercentage, setLimitPercentage] = useState("");
  const activePrice =
    fromToken === "x"
      ? activeBin?.pricePerToken
      : String(1 / Number(activeBin?.pricePerToken));
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (!dlmmPool) {
        return;
      }
      const activeBin = await getActiveBin(dlmmPool);
      setActiveBin(activeBin);
    }, 1000); // 每1秒轮询一次

    return () => clearInterval(intervalId); // 清除定时器
  }, [dlmmPool]); // 每次 dlmmPool 改变时触发 useEffect

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
  }, [fromToken, pairInfo]);
  const sellingTokenName =
    fromToken === "x" ? getToken0Name(pairInfo) : getToken1Name(pairInfo);
  const buyingTokenName =
    fromToken === "x" ? getToken1Name(pairInfo) : getToken0Name(pairInfo);
  const handleSwitchToken = () => {
    setFromToken(fromToken === "x" ? "y" : "x");
  };
  const handleLimitPriceChange = (v: string) => { };
  const handlePercentageChange = (v: string) => { };
  const handleSwap = async () => {};

  return (
    <div className="bg-[#1a1a2e] p-6 rounded-lg shadow-lg w-full">
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
        <div className="text-sm mr-2">
          {parseFloat(activePrice || "0").toFixed(6)} {buyingTokenName}/
          {sellingTokenName}
        </div>
      </div>
      <div className="w-full p-1">
        <div>
          <label className="block text-xs mr-2 text-gray-500">
            {fromToken === "x" ? "Selling" : "Buying"}{" "}
            <span className="text-white">
              {fromToken === "x" ? sellingTokenName : buyingTokenName}
            </span>{" "}
            at {fromToken === "x" ? "Max" : "Min"} Price
          </label>
          <div className="grid grid-cols-3">
            <DecimalInput
              value={limitPrice}
              onChange={handleLimitPriceChange}
              className="mt-2 h-full w-full col-span-2 border-[rgb(44, 46, 73)] border-2 focus:border-[[rgb(44, 46, 73)]] text-xl pr-2 focus:outline-none text-right"
            />
            <DecimalInput
              value={limitPercentage}
              onChange={handlePercentageChange}
              className="mt-2 h-full w-full border-l-0 border-[rgb(44, 46, 73)] border-2 focus:border-[[rgb(44, 46, 73)]] text-xl pr-2 focus:outline-none text-right"
            />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-xs mr-2 text-gray-500">
          Maximum <span className="text-white">{buyingTokenName}</span> output
        </label>
        <div className="text-sm font-semibold mt-2">30000 {buyingTokenName}</div>
      </div>
      <Button
        onClick={handleSwap}
        className="w-full py-2 rounded-lg text-xl mt-6"
      >
        Swap
      </Button>
    </div>
  );
};

export default SwapComponent;
