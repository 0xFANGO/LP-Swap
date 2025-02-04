import { useEffect, useState } from "react";
import { motion, Variant } from "motion/react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { fetchPairInfo, PairInfo } from "./lib/utils/meteora";
import { MagicCard } from "./components/ui/magic-card";
import { useTheme } from "next-themes";
import { useFetchMoneyDecimals } from "./lib/utils/meteora/money";
import SwapComponent from "./SwapComponent";

const MeteoraLPSwap = () => {
  const { theme } = useTheme();
  const [pairHash, setpairHash] = useState("");
  const [pairInfo, setPairInfo] = useState<PairInfo>();
  const [tokenxDecimals, setTokenxDecimals] = useState<number>(0);
  const [tokenyDecimals, setTokenyDecimals] = useState<number>(0);

  const [pairLoading, setPairLoading] = useState(false);
  const variants: {
    [key: string]: Variant;
  } = {
    active: {
      rotate: 90,
      transition: { duration: 0.5, repeat: Infinity },
    },
    inactive: {
      transition: undefined,
    },
  };
  const getToken0Name = () => {
    if (!pairInfo?.name) {
      return "";
    }
    return pairInfo?.name.split("-")[0];
  };
  const getToken1Name = () => {
    if (!pairInfo?.name) {
      return "";
    }
    return pairInfo?.name.split("-")[1];
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
  }, [fetchDecimal, pairInfo?.mint_x, pairInfo?.mint_y]);
  const handleSearchPair = async () => {
    if (!pairHash) {
      return;
    }
    try {
      setPairLoading(true);
      const pairInfo = await fetchPairInfo({ pairHash });
      setPairInfo(pairInfo);
      console.log("🚀 ~ pairInfo:", pairInfo);
      setPairLoading(false);
    } catch (error: any) {
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
          onChange={(e) => setpairHash(e.target.value)}
        />
        <Button type="submit" onClick={handleSearchPair}>
          <motion.div
            variants={variants}
            className="bg-[#ff8861] w-5 h-5"
            animate={pairLoading ? "active" : "inactive"}
          ></motion.div>
          Swap In This Pool
        </Button>
      </div>
      {pairInfo ? (
        <div className="grid grid-cols-2 gap-2 gap-y-2 mt-4">
          <SwapComponent />
          <div className="grid grid-rows-2">
            <MagicCard
              className="p-6 cursor-pointer shadow-2xl"
              gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
            >
              <div className="text-xl font-bold">Pool Info</div>
              <div className="mt-4 flex justify-start">
                <div className="flex justify-center items-center mr-1">
                  {getToken0Name()}
                </div>
                <div className="mr-1">—</div>
                <div className="flex justify-center items-center mr-5">
                  {getToken1Name()}
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
                  {getToken1Name()}/{getToken0Name()}
                </span>
              </div>
            </MagicCard>
            <MagicCard
              className="p-6 mt-4 cursor-pointer shadow-2xl"
              gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
            >
              <div className="text-xl font-bold">Your Positions</div>
              <div className="mt-4">
                <div className="text-xl">No Positions Found</div>
              </div>
            </MagicCard>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MeteoraLPSwap;
