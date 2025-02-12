import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import BN from "bn.js";

const SOL_MINT = "So11111111111111111111111111111111111111112";

export const getWalletBalance = async ({
  mintAddress,
  connection,
  publicKey,
}: {
  mintAddress: string;
  connection: Connection;
  publicKey: PublicKey;
}) => {
  // 判断是否为 SOL 代币（即原生代币）
  const isSol = mintAddress === SOL_MINT;

  if (isSol) {
    // 如果是原生 SOL，使用 getBalance 查询
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // 将 Lamports 转换为 SOL
  } else {
    // 如果是 SPL Token，使用 getTokenAccountsByOwner 查询
    const tokenMint = new PublicKey(mintAddress);

    const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
      mint: tokenMint,
    });

    if (tokenAccounts.value.length === 0) {
      // console.log("该账户没有持有该 SPL Token");
      return 0;
    }

    const tokenAccount = tokenAccounts.value[0];
    const balance = await connection.getTokenAccountBalance(
      tokenAccount.pubkey
    );

    // console.log("SPL Token 余额:", balance.value.uiAmount);
    return balance.value.uiAmount || 0;
  }
};

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
  };
  return {
    fetchDecimal,
  };
};

export const getTrueAmount = (amount: number | string, decimals: number) => {
  const factor = Math.pow(10, decimals);
  return new BN(Number(amount) * factor);
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
export const formatNumber = (num: BigNumber) => {
  return `$${num.toFormat(2)}`;
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[$,]/g, ""));
};

export const formatMintAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const getTokenURL = (mintAddress: string) => {
  return `https://img-v1.raydium.io/icon/${mintAddress}.png`;
};
