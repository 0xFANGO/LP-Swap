import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  ComputeBudgetProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
  Signer,
} from "@solana/web3.js";

export type OptimalTransactionResult = {
  opTx: VersionedTransaction;
  blockhash: string;
  lastValidBlockHeight: number;
  optimalUnits: number;
};

export const useSolNetWork = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const buildOptimalTransaction = async (
    transaction: Transaction,
    signers: Signer[] = [],
    cuBufferMultiplier = 1.5,
    microLamports = 10000
  ): Promise<OptimalTransactionResult | undefined> => {
    if (!publicKey) {
      return;
    }
    
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    // 1. 清理掉旧的 ComputeBudget 指令
    const filteredInstructions = transaction.instructions.filter(
      (ix) => !ix.programId.equals(ComputeBudgetProgram.programId)
    );
    console.log("filteredInstructions", filteredInstructions);
    // 2. 先用旧指令做一次 simulate
    const simMessageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: filteredInstructions,
    }).compileToV0Message();
    const simTxV0 = new VersionedTransaction(simMessageV0);

    const simResult = await connection.simulateTransaction(simTxV0, {
      // sigVerify: true,
    });

    if (simResult.value.err) {
      console.error("Simulation failed:", simResult.value.err);
      throw new Error(`Simulation Error: ${JSON.stringify(simResult.value.err)}`);
    }

    const consumedCU = simResult.value.unitsConsumed || 200_000;
    const optimalUnits = Math.min(Math.ceil(consumedCU * cuBufferMultiplier), 1_400_000);

    // 3. 构建最终含有 ComputeBudget 的指令
    const newComputeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: optimalUnits,
    });
    const newComputePriceIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports,
    });

    const finalInstructions = [
      newComputeLimitIx,
      newComputePriceIx,
      ...filteredInstructions,
    ];

    const finalTxMessage = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: finalInstructions,
    }).compileToV0Message();

    const opTx = new VersionedTransaction(finalTxMessage);
    
    // 为最终交易添加签名
    opTx.sign(signers);

    return { opTx, blockhash, lastValidBlockHeight, optimalUnits };
  };

  return { buildOptimalTransaction };
};
