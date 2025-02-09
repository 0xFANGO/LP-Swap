import { Toaster } from "@/components/ui/toaster";
import HeroPage from "./HeroPage";
import WalletProviderWrapper from "./WalletProviderWrapper";
import ThemeProviderWrapper from "./ThemeProviderWrapper";
import Header from "./Header";
import { Provider } from "./components/ui/provider";
import MeteoraLPSwap from "./MeteoraLPSwap";

const Home = () => {
  return (
    <ThemeProviderWrapper>
      <Provider>
        <div className="h-full">
          <WalletProviderWrapper>
            <Header />
            <div className="flex max-w-3xl m-auto flex-col items-start justify-start h-full">
              <HeroPage />
              <MeteoraLPSwap />
            </div>
            <Toaster />
          </WalletProviderWrapper>
        </div>
      </Provider>
    </ThemeProviderWrapper>
  );
};

export default Home;
