import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AddressLookupTableAccount, ComputeBudgetProgram, Connection, Signer, Transaction, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";

export const useSolNetWork = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const setPrioty = async () => {
    if (!publicKey) {
      return;
    }
    try {
      const prioritizeIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: 2_000_000, // 提高 CU 价格，提高优先级
      });
      const priceTx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1_000_000, // 提高 CU 价格，提高优先级
      });
      const prioritizeTx = new Transaction().add(prioritizeIx, priceTx);
      // 4. 获取最新的 blockhash
      prioritizeTx.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      // 5. 设置交易发起人
      prioritizeTx.feePayer = publicKey;
      // 6. 发送交易
      const txid = await sendTransaction(prioritizeTx, connection);
      await connection.confirmTransaction(txid);
    } catch (e) {
      console.log(e);
    }
  };
};

// import { ... } from "@solana/web3.js"
 
export async function buildOptimalTransaction(
  connection: Connection,
  instructions: Array<TransactionInstruction>,
  signer: Signer,
  lookupTables?: Array<AddressLookupTableAccount>,
) {
  const [microLamports, units, recentBlockhash] = await Promise.all([
    100 /* Get optimal priority fees - https://solana.com/developers/guides/advanced/how-to-use-priority-fees*/,
    getSimulationComputeUnits(
      connection,
      instructions,
      signer.publicKey,
      lookupTables,
    ),
    connection.getLatestBlockhash(),
  ]);
 
  instructions.unshift(
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports }),
  );
  if (units) {
    // probably should add some margin of error to units
    instructions.unshift(ComputeBudgetProgram.setComputeUnitLimit({ units }));
  }
  return {
    transaction: new VersionedTransaction(
      new TransactionMessage({
        instructions,
        recentBlockhash: recentBlockhash.blockhash,
        payerKey: signer.publicKey,
      }).compileToV0Message(lookupTables),
    ),
    recentBlockhash,
  };
}