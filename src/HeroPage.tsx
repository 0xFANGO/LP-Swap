import { BoxReveal } from "@/components/ui/box-reveal";
import MeteoraLPSwap from "./MeteoraLPSwap";

function LPSwap() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="size-full max-w-3xl items-center justify-center overflow-hidden pt-1">
        <BoxReveal boxColor={"#5046e6"} duration={0.5}>
          <p className="text-[3.5rem] font-semibold">
            LP Swap<span className="text-[#512da8]">.</span>
          </p>
        </BoxReveal>

        <BoxReveal boxColor={"#512da8"} duration={0.5}>
          <h2 className="mt-[.5rem] text-[1rem]">
            Revolutionary Swap Platform for{" "}
            <b className="text-[#ff8861]">Low Slippage</b> and{" "}
            <b className="text-[#ff8861]">Zero Fees</b>
          </h2>
        </BoxReveal>
        <BoxReveal boxColor={"#512da8"} duration={0.5}>
          <div className="mt-6">
            <p>
              -&gt; Utilizes advanced v3 pool strategies to ensure low-cost
              transactions and real-time liquidity adjustments.
              <br />
              -&gt; Support Swapping in{" "}
              <a href="https://edge.meteora.ag/" className="text-[#ff8861]">
                Meteora
              </a>
            </p>
          </div>
        </BoxReveal>
        <MeteoraLPSwap />
      </div>
    </div>
  );
}

export default LPSwap;
