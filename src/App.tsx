import { Toaster } from "@/components/ui/toaster";
import HeroPage from "./HeroPage";
import WalletProviderWrapper from "./WalletProviderWrapper";
import ThemeProviderWrapper from "./ThemeProviderWrapper";
import Header from "./Header";

const Home = () => {
  return (
    <ThemeProviderWrapper>
      <div className="bg-[#140f1c] h-full">
        <WalletProviderWrapper>
          <Header />
          <HeroPage />
          <Toaster />
        </WalletProviderWrapper>
      </div>
    </ThemeProviderWrapper>
  );
};

export default Home;
