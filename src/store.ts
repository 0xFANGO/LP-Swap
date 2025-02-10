import { create } from "zustand";
import { PairInfo } from "./lib/utils/meteora";
import DLMM, {
  LbPosition,
  PositionData,
  PositionVersion,
} from "@meteora-ag/dlmm";
import { PublicKey } from "@solana/web3.js";

export type UserPosition = {
  publicKey: PublicKey;
  positionData: PositionData & {
    sellingAmount?: string;
    sellingToken?: string;
    maxOutPut?: string;
  };
  version: PositionVersion;
};

export type SortKey = "volume" | "tvl" | "feetvlratio";

export type QueryParams = {
  page: number;
  limit: number;
  search_term?: string;
  sort_key: SortKey;
  order_by?: "asc" | "desc";
  include_token_mints?: string[];
  include_pool_token_pairs?: string[];
  hide_low_tvl: number;
};

interface MeteOraSwapState {
  pairInfo: PairInfo | null;
  pairLoading: boolean;
  queryParams: QueryParams;
  tokenxDecimals: number;
  tokenyDecimals: number;
  dlmmPool: DLMM | null;
  sellingAmount: string;
  userPositions: UserPosition[];
  creatingPosition: boolean;
  alertAtPercent: number;
  autoAlertAndRemove: boolean;
  tableMetaData: {
    total: number;
    groups: {
      name: string;
      pairs: PairInfo[];
    }[];
  };
  setPairInfo: (pairInfo: PairInfo) => void;
  setTokenxDecimals: (tokenxDecimals: number) => void;
  setTokenyDecimals: (tokenyDecimals: number) => void;
  setSellingAmount: (sellingAmount: string) => void;
  setDLMMPool: (dlmmPool: DLMM) => void;
  setUserPositions: (userPositions: UserPosition[]) => void;
}

export const useMeteOraStore = create<MeteOraSwapState>((set) => ({
  pairInfo: null,
  pairLoading: true,
  tokenxDecimals: 0,
  tableMetaData: {
    total: 0,
    groups: [],
  },
  queryParams: {
    page: 0,
    limit: 10,
    hide_low_tvl: 600,
    sort_key: "volume",
  },
  dlmmPool: null,
  tokenyDecimals: 0,
  sellingAmount: "",
  userPositions: [],
  creatingPosition: false,
  alertAtPercent: 100,
  autoAlertAndRemove: true,
  setDLMMPool: (dlmmPool: DLMM) => set({ dlmmPool }),
  setSellingAmount: (sellingAmount: string) => set({ sellingAmount }),
  setPairInfo: (pairInfo: PairInfo) => set({ pairInfo }),
  setTokenxDecimals: (tokenxDecimals: number) => set({ tokenxDecimals }),
  setTokenyDecimals: (tokenyDecimals: number) => set({ tokenyDecimals }),
  setUserPositions: (userPositions: LbPosition[]) => set({ userPositions }),
}));
