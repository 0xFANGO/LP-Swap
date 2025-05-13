import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";
import { CUSTOM_RPC0 } from "./constants";
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletProviderWrapperProps {
  children: ReactNode;
}
console.log("CUSTOM_RPC0", CUSTOM_RPC0, import.meta.env);
const WalletProviderWrapper: FC<WalletProviderWrapperProps> = ({
  children,
}) => {
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={CUSTOM_RPC0}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletProviderWrapper;
