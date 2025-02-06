import DLMM, {
  LbPosition,
  StrategyParameters,
  TQuoteCreatePositionParams,
} from "@meteora-ag/dlmm";
import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export type PairInfo = {
  address: string;
  apr: number;
  apy: number;
  base_fee_percentage: string;
  bin_step: number;
  cumulative_fee_volume: string;
  cumulative_trade_volume: string;
  current_price: number;
  farm_apr: number;
  farm_apy: number;
  fees_24h: number;
  hide: boolean;
  is_blacklisted: boolean;
  liquidity: string;
  max_fee_percentage: string;
  mint_x: string;
  mint_y: string;
  name: string;
  protocol_fee_percentage: string;
  reserve_x: string;
  reserve_x_amount: number;
  reserve_y: string;
  reserve_y_amount: number;
  reward_mint_x: string;
  reward_mint_y: string;
  today_fees: number;
  trade_volume_24h: number;
};
export const getToken0Name = (pairInfo: PairInfo | null) => {
  if (!pairInfo?.name) {
    return "";
  }
  return pairInfo?.name.split("-")[0];
};
export const getToken1Name = (pairInfo: PairInfo | null) => {
  if (!pairInfo?.name) {
    return "";
  }
  return pairInfo?.name.split("-")[1];
};

export async function fetchPairInfo(params: { pairHash: string }) {
  try {
    const res = await fetch(
      `https://app.meteora.ag/clmm-api/pair/${params.pairHash}`,
      {
        method: "GET",
      }
    );
    const pairInfo: PairInfo = await res.json();
    if (!pairInfo) {
      throw new Error("未找到池信息！");
    }
    return pairInfo;
  } catch (error) {
    console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
    throw error;
  }
}

export const getActiveBin = async (dlmmPool: DLMM) => {
  // Get pool state
  const activeBin = await dlmmPool.getActiveBin();
  return activeBin;
};
// 创建仓位报价
export const quoteCreatePosition = async (
  dlmmPool: DLMM,
  { strategy }: TQuoteCreatePositionParams
) => {
  const quote = await dlmmPool.quoteCreatePosition({ strategy });
  return quote;
};

export const createOneSidePositions = async (
  dlmmPool: DLMM,
  params: {
    connection: Connection;
    user: PublicKey;
    positionPubKey: PublicKey;
    totalXAmount: BN;
    totalYAmount: BN;
    strategy: StrategyParameters;
  }
) => {
  const { totalXAmount, positionPubKey, user, totalYAmount, strategy } = params;
  const createPositionTx =
    await dlmmPool.initializePositionAndAddLiquidityByStrategy({
      positionPubKey: positionPubKey,
      user,
      totalXAmount,
      totalYAmount,
      strategy,
    });
  return createPositionTx;
};

export const removePositionLiquidity = async (
  dlmmPool: DLMM,
  params: {
    positionPub: PublicKey;
    userPub: PublicKey;
    percentOfLiquidity: number;
    shouldClaimAndClose: boolean;
  }
) => {
  const { positionPub, userPub, percentOfLiquidity, shouldClaimAndClose } =
    params;
  const position = await dlmmPool.getPosition(positionPub);
  // Remove Liquidity
  const binIdsToRemove = position.positionData.positionBinData.map(
    (bin) => bin.binId
  );
  const removeLiquidityTx = await dlmmPool.removeLiquidity({
    position: positionPub,
    user: userPub,
    binIds: binIdsToRemove,
    bps: new BN(100 * percentOfLiquidity), // 100% of liquidity
    shouldClaimAndClose: shouldClaimAndClose, // should claim swap fee and close position together
  });
  return removeLiquidityTx;
};
