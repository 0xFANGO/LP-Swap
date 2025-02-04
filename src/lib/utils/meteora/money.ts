import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export const useFetchMoneyDecimals = () => {
  const { connection } = useConnection();
  const fetchDecimal = async (mintAddress: string) => {
    const res = await connection.getParsedAccountInfo(
      new PublicKey(mintAddress)
    );
    if (!res.value) {
      return 0;
    }
    return (res.value.data as any).parsed.info.decimals;
  }
  return {
    fetchDecimal
  }
};

export const formatMoney = (
  amount: number | string,
  options?: {
    precision?: number;
    fractionDigits?: number;
  }
) => {
  if (!amount) {
    return "0";
  }
  const { precision = 9, fractionDigits = 2 } = options || {};
  const factor = new BN(10).pow(new BN(precision)); // 10^9
  const displayAmount = amount.toString(); // 转换为字符串

  // 先除以 10^9 来得到 SOL（单位转换）
  const result = new BN(displayAmount).div(factor);

  // 格式化成小数形式（保留 9 位小数）
  const formattedAmount = parseFloat(result.toString()).toFixed(fractionDigits);
  return formattedAmount;
};
