import { Toaster } from "@/components/ui/toaster";
import HeroPage from "./HeroPage";
import WalletProviderWrapper from "./WalletProviderWrapper";
import ThemeProviderWrapper from "./ThemeProviderWrapper";
import Header from "./Header";
import { Provider } from "./components/ui/provider";
import MeteoraLPSwap from "./MeteoraLPSwap";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./components/ui/breadcrumb";

const Home = () => {
  return (
    <ThemeProviderWrapper>
      <Provider>
        <div className="h-full">
          <WalletProviderWrapper>
            <Header />
            <div className="w-full max-w-7xl mx-auto px-16">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Pools</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/docs/components">
                      SOL-USDC
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
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
