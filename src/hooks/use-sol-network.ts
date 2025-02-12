import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

export const useSolNetWork = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const buildOptimalTransaction = async (transaction: Transaction) => {
    if (!publicKey) {
      return;
    }
    const recentBlockhash = await connection.getLatestBlockhash();
    // const [microLamports, simulateRes] = await Promise.all([
    //   100 /* Get optimal priority fees - https://solana.com/developers/guides/advanced/how-to-use-priority-fees*/,
    //   connection.simulateTransaction(transaction),
    // ]);

    // const units = simulateRes.value.unitsConsumed || 0;
    // const limitTx = ComputeBudgetProgram.setComputeUnitLimit({
    //   units: units, // 提高 CU 限制，提高优先级
    // });
    // const priceTx = ComputeBudgetProgram.setComputeUnitPrice({
    //   microLamports, // 提高 CU 价格，提高优先级
    // });
    const pTx = new Transaction();
    const opTx = new VersionedTransaction(
      new TransactionMessage({
        instructions: pTx.instructions.concat(transaction.instructions),
        recentBlockhash: recentBlockhash.blockhash,
        payerKey: publicKey,
      }).compileToV0Message([])
    );
    return opTx;
  };

  return { buildOptimalTransaction };
};
