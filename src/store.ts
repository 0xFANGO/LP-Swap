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

interface MeteOraSwapState {
  pairHash: string;
  pairInfo: PairInfo | null;
  tokenxDecimals: number;
  tokenyDecimals: number;
  dlmmPool: DLMM | null;
  sellingAmount: string;
  userPositions: UserPosition[];
  creatingPosition: boolean;
  alertAtPercent: number;
  autoAlertAndRemove: boolean;
  setPairHash: (pairHash: string) => void;
  setPairInfo: (pairInfo: PairInfo) => void;
  setTokenxDecimals: (tokenxDecimals: number) => void;
  setTokenyDecimals: (tokenyDecimals: number) => void;
  setSellingAmount: (sellingAmount: string) => void;
  setDLMMPool: (dlmmPool: DLMM) => void;
  setUserPositions: (userPositions: UserPosition[]) => void;
}

export const useMeteOraStore = create<MeteOraSwapState>((set) => ({
  pairHash: "",
  pairInfo: null,
  tokenxDecimals: 0,
  dlmmPool: null,
  tokenyDecimals: 0,
  sellingAmount: "",
  userPositions: [],
  creatingPosition: false,
  alertAtPercent: 90,
  autoAlertAndRemove: true,
  setDLMMPool: (dlmmPool: DLMM) => set({ dlmmPool }),
  setSellingAmount: (sellingAmount: string) => set({ sellingAmount }),
  setPairHash: (pairHash: string) => set({ pairHash }),
  setPairInfo: (pairInfo: PairInfo) => set({ pairInfo }),
  setTokenxDecimals: (tokenxDecimals: number) => set({ tokenxDecimals }),
  setTokenyDecimals: (tokenyDecimals: number) => set({ tokenyDecimals }),
  setUserPositions: (userPositions: LbPosition[]) => set({ userPositions }),
}));
