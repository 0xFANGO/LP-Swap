import { useEffect, useState } from "react";
import { motion, Variant } from "motion/react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import {
  fetchPairInfo,
  getToken0Name,
  getToken1Name,
} from "./lib/utils/meteora";
import { useFetchMoneyDecimals } from "./lib/utils/meteora/money";
import SwapComponent from "./SwapComponent";
import { useMeteOraStore } from "./store";
import { useToast } from "./hooks/use-toast";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import DLMM from "@meteora-ag/dlmm";
import { PublicKey } from "@solana/web3.js";
import { Forward, Loader } from "lucide-react";
import { Card } from "./components/ui/card";

const MeteoraLPSwap = () => {
  const {
    pairHash,
    pairInfo,
    setPairHash,
    setPairInfo,
    setTokenxDecimals,
    setTokenyDecimals,
    setDLMMPool,
  } = useMeteOraStore((state) => state);

  const [pairLoading, setPairLoading] = useState(false);
  const { connected } = useWallet();
  const { connection } = useConnection();
  const { toast } = useToast();
  const variants: {
    [key: string]: Variant;
  } = {
    active: {
      rotate: 360,
      transition: { duration: 0.5, repeat: Infinity },
    },
    inactive: {
      transition: undefined,
    },
  };

  const { fetchDecimal } = useFetchMoneyDecimals();
  useEffect(() => {
    if (!pairInfo) {
      return;
    }
    fetchDecimal(pairInfo.mint_x).then((res) => {
      setTokenxDecimals(res);
    });
    fetchDecimal(pairInfo.mint_y).then((res) => {
      setTokenyDecimals(res);
    });
  }, [pairHash, pairInfo]);
  const handleConnectToPool = async () => {
    if (!pairHash) {
      return;
    }
    try {
      const dlmmPool = await DLMM.create(connection, new PublicKey(pairHash), {
        cluster: "mainnet-beta",
      });
      setDLMMPool(dlmmPool);
    } catch (e) {
      console.log("error", e);
      toast({
        title: "Can not connect to the pool",
      });
    }
  };
  const handleSearchPair = async () => {
    if (!connected) {
      toast({
        title: "Please connect your wallet",
      });
      return;
    }
    if (!pairHash) {
      return;
    }
    try {
      setPairLoading(true);
      const pairInfo = await fetchPairInfo({ pairHash });
      setPairInfo(pairInfo);
      console.log("🚀 ~ pairInfo:", pairInfo);
      await handleConnectToPool();
      setPairLoading(false);
    } catch (error: any) {
      toast({
        title: "Can not find the pool information",
      });
      console.log("🚀 ~ error:", error);
      setPairLoading(false);
    }
  };
  return (
    <div>
      <div className="flex w-full pl-2 items-center space-x-1 mt-6">
        <Input
          className="w-[98%]"
          placeholder="Input Meteora DLMM Pool hash here"
          value={pairHash}
          onChange={(e) => setPairHash(e.target.value)}
        />
        <Button
          variant="ghost"
          className="mr-1"
          type="submit"
          onClick={handleSearchPair}
        >
          {pairLoading ? (
            <motion.div
              variants={variants}
              className="text-[#ff8861]"
              animate={pairLoading ? "active" : "inactive"}
            >
              <Loader className="w-5 h-5" />
            </motion.div>
          ) : (
            <Forward className="text-[#ff8861] text-lg" />
          )}
          Swap In This Pool
        </Button>
      </div>
      {pairInfo ? (
        <div className="grid grid-cols-2 gap-2 gap-y-2 mt-4">
          <SwapComponent />
          <div className="grid grid-rows-2">
            <Card className="p-6 cursor-pointer shadow-2xl">
              <div className="text-xl font-bold">Pool Info</div>
              <div className="mt-4 flex justify-start">
                <div className="flex justify-center items-center mr-1">
                  {getToken0Name(pairInfo)}
                </div>
                <div className="mr-1">—</div>
                <div className="flex justify-center items-center mr-5">
                  {getToken1Name(pairInfo)}
                </div>
              </div>
              <div className="mt-2">
                <span className="text-[#8585a1] text-sm mr-5">bin step</span>
                <span className="text-sm">{pairInfo.bin_step}</span>
              </div>
              <div className="mt-2">
                <span className="text-[#8585a1] text-sm mr-5">
                  current price
                </span>
                <span className="text-sm">
                  {parseFloat(String(pairInfo.current_price)).toFixed(2)}{" "}
                  {getToken1Name(pairInfo)}/{getToken0Name(pairInfo)}
                </span>
              </div>
            </Card>
            <Card className="p-6 mt-4 cursor-pointer shadow-2xl">
              <div className="text-xl font-bold">Your Positions</div>
              <div className="mt-4">
                <div className="text-xl">No Positions Found</div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MeteoraLPSwap;
