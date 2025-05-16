import { FC } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
// import { Notifications } from "./PositionNotification";

const Header: FC = () => {
  return (
    <header className="text-white p-4 pr-16 flex items-center justify-end space-x-4">

        {/* <Notifications  /> */}
        <WalletMultiButton  className="ml-10"/>
 
    </header>
  );
};

export default Header;
