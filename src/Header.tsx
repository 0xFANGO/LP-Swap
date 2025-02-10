import { FC } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

const Header: FC = () => {

  return (
    <header className="text-white p-4 pr-16 flex justify-end">
      <WalletMultiButton />
    </header>
  );
};

export default Header;
