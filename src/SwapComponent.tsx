import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { ArchiveIcon } from "@radix-ui/react-icons";
import DLMM from "@meteora-ag/dlmm";
import DecimalInput from "./components/DecimalInput";

const SwapComponent: FC = () => {
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [amount, setAmount] = useState("");
  const { connection } = useConnection();

  const handleSwap = async () => {
    const res = await connection.getBalance(
      new PublicKey("So11111111111111111111111111111111111111112")
    );
    // Swap logic here
    console.log(`res--`, res);
  };

  return (
    <div className="bg-[#1a1a2e] p-6 rounded-lg shadow-lg w-full">
      <div className="mb-4">
        <div className="flex justify-between">
          <label className="block text-xs mb-2">Selling</label>
          <div className="text-xs text-[#E8F9FF40] flex justify-between">
            <ArchiveIcon className="mr-1" />
            100 SOL
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm font-semibold">SOL</div>
          <DecimalInput
            className="bg-transparent outline-none appearance-none placeholder-gray-500 text-2xl text-right"
            value={fromToken}
            onChange={(v) => {
              setFromToken(v);
            }}
          />
        </div>
      </div>
      <div className="mb-4 flex items-center">
        <label className="block text-xs mr-2">Buying</label>
      </div>
      <Button onClick={handleSwap} className="w-full py-2 rounded-lg text-xl">
        Swap
      </Button>
    </div>
  );
};

export default SwapComponent;
