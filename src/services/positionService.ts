import { API_URL } from '../config';

export type OperationStatus = 'MONITORING' | 'COMPLETED' | 'DEPERATED';

export interface LiquidityOperation {
  userAddress: string;
  gasAmount: number;
  rentCost: number;
  pairId: string;
  positionId: string;
  sellToken: string;
  buyingToken: string;
  sellingAmount: number;
  buyingAmount: number;
  status: OperationStatus;
  networkFee?: number;
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
}

export interface User {
  address: string;
  name?: string;
  operations: LiquidityOperation[];
  tempWallets: TempWallet[];
}

export interface TempWallet {
  id: number;
  address: string;
  userAddress: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export const createPosition = async (data: LiquidityOperation) => {
  try {
    const response = await fetch(`${API_URL}/position/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create position');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating position:', error);
    throw error;
  }
};

// getUserPositions
export const getAllUserPositions: (address: string) => Promise<User> = async (userAddress: string) => {
  try {
    const response = await fetch(`${API_URL}/user/allPositions?userAddress=${userAddress}`);

    if (!response.ok) {
      throw new Error('Failed to check position');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking position:', error);
    throw error;
  }
};