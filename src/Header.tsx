import { FC } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useTheme } from "next-themes";
import "@solana/wallet-adapter-react-ui/styles.css";

const Header: FC = () => {
  // const { theme, setTheme } = useTheme();

  return (
    <header className="bg-[#130d17] text-white p-4 pr-16 flex justify-end">
      <WalletMultiButton />
    </header>
  );
};

export default Header;
