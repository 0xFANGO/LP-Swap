import DLMM from "@meteora-ag/dlmm";

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

export const getActiveBin = async(dlmmPool: DLMM) => {
   // Get pool state
   const activeBin = await dlmmPool.getActiveBin();
   return activeBin;
}
