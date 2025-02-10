import { Toaster } from "@/components/ui/toaster";
import HeroPage from "./HeroPage";
import WalletProviderWrapper from "./WalletProviderWrapper";
import ThemeProviderWrapper from "./ThemeProviderWrapper";
import Header from "./Header";
import { Provider } from "./components/ui/provider";
import MeteoraPools from "./MeteoraPools";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router";
import MeteoraSwap from "./MeteoraSwap";

const Home = () => {

  return (
    <ThemeProviderWrapper>
      <Provider>
        <div className="h-full">
          <WalletProviderWrapper>
            <Header />
            <div className="w-full max-w-7xl mx-auto px-16">
              <Router>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <>
                        <HeroPage />
                        <MeteoraPools />
                      </>
                    }
                  />
                  <Route
                    path="/meteora/:poolId"
                    element={
                      <>
                        <MeteoraSwap />
                      </>
                    }
                  />
                  {/* Add more routes here as needed */}
                </Routes>
              </Router>
            </div>
            <Toaster />
          </WalletProviderWrapper>
        </div>
      </Provider>
    </ThemeProviderWrapper>
  );
};

export default Home;
