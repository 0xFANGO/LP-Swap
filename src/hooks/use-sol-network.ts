import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getTokenMetadata } from "@solana/spl-token";

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

  const getTokenMeta = async (mintAddress: string) => {
    if (!publicKey) {
      return;
    }
    try {
      console.log("mintAddress:", mintAddress);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        {
          programId: TOKEN_PROGRAM_ID,
        }
      );
      for (const tokenAccount of tokenAccounts.value) {
        console.log("tokenAccount:", tokenAccount);
        // Retrieve and log the metadata pointer state
        const metaData = await getTokenMetadata(
          connection,
          new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
        );
        console.log("\nMetadata Pointer:", metaData);
      }
    } catch (error) {
      console.log("🚀 ~ error:", error);
    }
  };
  return { buildOptimalTransaction, getTokenMeta };
};
