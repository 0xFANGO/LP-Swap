import { BoxReveal } from "@/components/ui/box-reveal";
import { ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";

function LPSwap() {
  return (
    <div className="pt-1 mx-auto">
      <BoxReveal boxColor={"#5046e6"} duration={0.5}>
        <p className="text-[3.5rem] font-semibold">
          LP Swap<span className="text-[#512da8]">.</span>
        </p>
      </BoxReveal>
      <BoxReveal boxColor={"#512da8"} duration={0.5}>
        <div className="mt-6">
          <p>
            -&gt; Utilizes advanced v3 pool strategies to ensure{" "}
            <b className="text-[#ff8861]">Low Cost Swap</b>
            <br />
            -&gt; Support for{" "}
            <b className="text-[#ff8861]">multiple V3 Pools</b>
            <div className="flex items-center mt-2">
              <span className="flex items-center mr-5">
                <img src="/meteora.svg" alt="meteora" />
                <b>Meteora</b>
                <a target="_blank" href="https://app.meteora.ag/">
                  <ExternalLink className="w-5 h-5 ml-1 cursor-pointer hover:text-[#ff8861]" />
                </a>
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center text-gray-600">
                      <img src="/Raydium.webp" alt="Raydium" className="mr-1" />
                      <b>Raydium</b>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Comming Soon</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </p>
        </div>
      </BoxReveal>
    </div>
  );
}

export default LPSwap;
