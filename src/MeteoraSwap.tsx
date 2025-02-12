import { ExternalLink, Info, Settings } from "lucide-react";
import SwapComponent from "./SwapComponent";
import {
  fetchPairInfo,
  getToken0Name,
  getToken1Name,
} from "./lib/utils/meteora";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import { Label } from "./components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
import { Switch } from "./components/ui/switch";
import { Input } from "./components/ui/input";
import PositionInfo from "./PositionInfo";
import { useMeteOraStore } from "./store";
import { useConnection } from "@solana/wallet-adapter-react";
import { useToast } from "./hooks/use-toast";
import DLMM from "@meteora-ag/dlmm";
import { PublicKey } from "@solana/web3.js";
import { useFetchMoneyDecimals } from "./lib/utils/meteora/money";
import { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./components/ui/breadcrumb";
import { Skeleton } from "./components/ui/skeleton";
import { useNavigate, useParams } from "react-router";
import MeteoraPoolInfo from "./MeteoraPoolInfo";

const MeteoraSwap = () => {
  const {
    pairInfo,
    setPairInfo,
    setTokenxDecimals,
    setTokenyDecimals,
    setDLMMPool,
    alertAtPercent,
    autoAlertAndRemove,
  } = useMeteOraStore((state) => state);
  const [fetching, setFetching] = useState(true);
  const { fetchDecimal } = useFetchMoneyDecimals();
  const params = useParams();
  const pairHash = params?.poolId || "";
  const navigate = useNavigate();
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

  const { connection } = useConnection();
  const { toast } = useToast();
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
    if (!pairHash) {
      return;
    }
    try {
      setFetching(true);
      const pairInfo = await fetchPairInfo({ pairHash });
      setPairInfo(pairInfo);
      console.log("🚀 ~ pairInfo:", pairInfo);
      await handleConnectToPool();
      setFetching(false);
    } catch (error: any) {
      toast({
        title: "Can not find the pool information",
      });
      console.log("🚀 ~ error:", error);
      setFetching(false);
    }
  };
  const renderPairInfo = () => {
    if (fetching) {
      return (
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      );
    }
    if (pairInfo) {
      return (
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
              <div className="mt-1">
                <PositionInfo />
              </div>
            </div>
          </div>
          <MeteoraPoolInfo />
        </>
      );
    }
    return null;
  };
  useEffect(() => {
    handleSearchPair();
  }, [pairHash]);
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              className="cursor-pointer"
              onClick={() => {
                navigate(`/`);
              }}
            >
              Pools
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="cursor-pointer">
              {fetching ? <Skeleton className="h-4 w-10" /> : pairInfo?.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {renderPairInfo()}
    </>
  );
};

export default MeteoraSwap;
