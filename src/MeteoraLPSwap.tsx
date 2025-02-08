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
import { ExternalLink, Forward, Info, Loader, Settings } from "lucide-react";
import PositionInfo from "./PositionInfo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import { Label } from "./components/ui/label";
import { Switch } from "./components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
// import { PoolDataTable } from "./PoolDataTable";

const MeteoraLPSwap = () => {
  const {
    pairHash,
    pairInfo,
    setPairHash,
    setPairInfo,
    setTokenxDecimals,
    setTokenyDecimals,
    setDLMMPool,
    alertAtPercent,
    autoAlertAndRemove,
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
      {/* <PoolDataTable /> */}
      {pairInfo ? (
        <>
          <div className="grid grid-cols-2 gap-2 gap-y-2 mt-4">
            <SwapComponent />
            <div className="bg-[#1a1a2e] p-6 rounded-lg shadow-lg w-full">
              <div className="mt-2 font-bold text-xl flex justify-start items-center">
                <ExternalLink
                  className="w-4 h-4 cursor-pointer hover:text-[#FF8861] mr-1"
                  onClick={() =>
                    window.open(
                      `https://edge.meteora.ag/dlmm/${pairHash}`,
                      "_blank"
                    )
                  }
                />
                <div className="flex justify-center items-center mr-1">
                  {getToken0Name(pairInfo)}
                </div>
                <div className="mr-1">—</div>
                <div className="flex justify-center items-center mr-1">
                  {getToken1Name(pairInfo)}
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Settings className="ml-1 w-4 h-4 cursor-pointer hover:text-[#FF8861]" />
                  </PopoverTrigger>
                  <PopoverContent className="w-100">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">
                          Swap Settings
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Configure your Swap preferences.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-start">
                          <Label htmlFor="autoMonitor" className="mr-2 w-32">
                            <div className="flex items-center">
                              Auto Monitor
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-4 h-4 ml-1" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-sm text-[#8585a1] w-80">
                                      Automatically monitor the liquidity and
                                      alert you when the swap reaches the
                                      specified percentage.
                                      <br />
                                      <strong>Note:</strong> You will need to
                                      manually sign the transaction when the
                                      price reaches the specified percentage.
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </Label>
                          <Switch
                            checked={autoAlertAndRemove}
                            onCheckedChange={(checked) => {
                              useMeteOraStore.setState({
                                autoAlertAndRemove: checked,
                              });
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-start">
                          <Label
                            htmlFor="withdrawPercentage"
                            className="mr-2 w-32"
                          >
                            Alert at Percent
                          </Label>
                          <Input
                            id="withdrawPercentage"
                            type="number"
                            min="0"
                            max="100"
                            value={alertAtPercent}
                            step="0.01"
                            className="h-8 w-20"
                            onChange={(e) => {
                              const target = e.target as HTMLInputElement;
                              if (Number(target.value) < 0) {
                                useMeteOraStore.setState({
                                  alertAtPercent: 0,
                                });
                              } else if (Number(target.value) > 100) {
                                useMeteOraStore.setState({
                                  alertAtPercent: 100,
                                });
                              } else {
                                useMeteOraStore.setState({
                                  alertAtPercent: Number(
                                    Number(target.value).toFixed(2)
                                  ),
                                });
                              }
                            }}
                          />
                          <span className="ml-1">%</span>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              {/* <div className="mt-2">
                <span className="text-[#8585a1] text-sm mr-5">
                  current price
                </span>
                <span className="text-sm">
                  {parseFloat(String(pairInfo.current_price)).toFixed(2)}{" "}
                  {getToken1Name(pairInfo)}/{getToken0Name(pairInfo)}
                </span>
              </div> */}
              <div className="mt-1">
                <PositionInfo />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default MeteoraLPSwap;
