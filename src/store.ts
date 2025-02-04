import { create } from 'zustand'
import { PairInfo } from './lib/utils/meteora';
import DLMM from '@meteora-ag/dlmm';

interface MeteOraSwapState {
  pairHash: string;
  pairInfo: PairInfo | null;
  tokenxDecimals: number;
  tokenyDecimals: number;
  dlmmPool: DLMM | null;
  sellingAmount: string;
  setPairHash: (pairHash: string) => void;
  setPairInfo: (pairInfo: PairInfo) => void;
  setTokenxDecimals: (tokenxDecimals: number) => void;
  setTokenyDecimals: (tokenyDecimals: number) => void;
  setSellingAmount: (sellingAmount: string) => void;
  setDLMMPool: (dlmmPool: DLMM) => void;
}

export const useMeteOraStore = create<MeteOraSwapState>((set) => ({
  pairHash: '',
  pairInfo: null,
  tokenxDecimals: 0,
  dlmmPool: null,
  tokenyDecimals: 0,
  sellingAmount: "",
  setDLMMPool: (dlmmPool: DLMM) => set({ dlmmPool }),
  setSellingAmount: (sellingAmount: string) => set({ sellingAmount }),
  setPairHash: (pairHash: string) => set({ pairHash }),
  setPairInfo: (pairInfo: PairInfo) => set({ pairInfo }),
  setTokenxDecimals: (tokenxDecimals: number) => set({ tokenxDecimals }),
  setTokenyDecimals: (tokenyDecimals: number) => set({ tokenyDecimals }),
}))
