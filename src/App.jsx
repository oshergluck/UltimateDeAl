import React, { useState, useEffect } from "react";
import { logoOfWebsiteCoin, ESH, logoOfWebsite, usdcoinusdclogo } from "./assets";
import { Route, Routes, useParams, useLocation } from "react-router-dom";
import "./styles/Home.css";
import {
  Header,
  BackgroundMusic,
  Footer,
  CookieAlert,
  Loader,
  AccessibilityMenu,
  Search,
  HeaderMobile,
  FooterMobile,
  SearchEngine,
} from "./components";
import { useStateContext } from "./context";
import {
  ListingInfo,
  Swapper,
  QuantumBusinessInterface,
  EditStore,
  City,
  Extra,
  CreateCampaign,
  Profile,
  CoinPage,
  MyNFTs,
  CampaignDetails,
  CoinLauncher,
  AllCampaigns,
  EditCampaign,
  Cart,
  News,
  VIPRegister,
  Admin,
  ClientAdminPage,
  About,
  Terms,
  PrivacyPolicy,
  Post,
  NewPost,
  EditPost,
  StorePage,
  RegisterNewStore,
  SetOfficialStore,
  EditOfficialStore,
  Home,
  Product,
  ContractDeployForm,
  LuckMachine,
  ESHVoting,
  DeployPublishedContractPage,
  MyCoins,
  DeployRentals,
  DeploySales,
  DeployInvoices,
  DeployVotes,
  RecentCoins,
} from "./pages";
import { useMediaQuery } from "react-responsive";

export default function App() {
  const isShop = window.location.pathname.split("/")[1];
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { term } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [Total, setTotal] = useState("");
  const { getTotal, CrowdFunding, address, refreshPage } = useStateContext();

  const fetchTotal = async () => {
    setIsLoading(true);
    const data = await getTotal();
    setIsLoading(false);
    setTotal(data * 1e-6);
    return data;
  };

  const formatNumberWithCommas = (number) => {
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTotal = async () => {
      try {
        setIsLoading(true);
        const data = await getTotal();
        const formattedTotal = formatNumberWithCommas(data * 1e-6);
        setTotal(formattedTotal);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    if (CrowdFunding) {
      fetchTotal();
    }
  }, [CrowdFunding]);

  return (
    <>
      <CookieAlert />
      {isLoading && <Loader />}

      {/* CYBERPUNK FUTURISTIC BACKGROUND */}
      <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
        {/* Neon gradient auras */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_60%),radial-gradient(circle_at_20%_80%,_rgba(236,72,153,0.35),_transparent_55%),radial-gradient(circle_at_80%_10%,_rgba(129,140,248,0.28),_transparent_60%)] opacity-80" />

        {/* Subtle cyber grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.15)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 mix-blend-soft-light" />

        {/* Vignette for depth */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0,_transparent_40%,_black_100%)] opacity-80" />

        {/* Main app content on top */}
        <div className="relative z-10">
          {isMobile ? <HeaderMobile /> : <Header />}

          <div className="mx-auto sm:mt-[50px] px-2 sm:px-6 lg:px-10">
            {/* Floating cyberpunk refresh button */}
            <div className="mb-[25px] mt-[10px]">
              <button
                onClick={() => refreshPage()}
                className="fixed bottom-3 right-3 z-[1000] h-[32px] w-[32px] rounded-md border border-yellow-300/60 bg-yellow-300/90 text-xs font-bold text-black shadow-[0_0_15px_rgba(250,204,21,0.9)] hover:scale-110 hover:bg-yellow-300 transition-transform duration-200 flex items-center justify-center"
              >
                R
              </button>
            </div>

            {/* Raised total block with neon card */}
            {Number(Total) > 1000000 ? (
              isMobile ? (
                <div className="mx-auto mb-6 max-w-md rounded-2xl border border-cyan-400/30 bg-black/40 px-4 py-5 backdrop-blur-md shadow-[0_0_25px_rgba(56,189,248,0.45)]">
                  <h3 className="text-center text-white font-bold sm:text-5xl text-2xl drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]">
                    UltraShop RAISED
                  </h3>
                  <h3 className="mt-2 text-center font-bold sm:text-5xl text-3xl text-[#38bdf8] drop-shadow-[0_0_18px_rgba(56,189,248,0.9)]">
                    {Total}
                  </h3>
                  <div className="mt-3 flex flex-col items-center gap-1">
                    <img
                      src={usdcoinusdclogo}
                      className="h-[35px] w-[35px] mx-auto"
                    />
                    <h3 className="text-center text-white font-semibold text-xl">
                      UNTIL NOW
                    </h3>
                  </div>
                </div>
              ) : (
                <div className="mx-auto mb-8 flex max-w-4xl flex-wrap items-center justify-center gap-3 rounded-2xl border border-fuchsia-500/30 bg-black/40 px-6 py-5 backdrop-blur-md shadow-[0_0_28px_rgba(236,72,153,0.45)]">
                  <span className="text-center text-white font-bold sm:text-5xl text-3xl drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                    Ultra
                  </span>
                  <span className="text-center text-[#facc15] font-bold sm:text-5xl text-3xl drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]">
                    Shop
                  </span>
                  <span className="text-center text-white font-bold sm:text-5xl text-3xl drop-shadow-[0_0_10px_rgba(15,23,42,0.9)]">
                    RAISED
                  </span>
                  <h3 className="text-center font-bold sm:text-5xl text-3xl text-[#38bdf8] drop-shadow-[0_0_18px_rgba(56,189,248,0.9)]">
                    {Total}
                  </h3>
                  <div className="flex items-center gap-3">
                    <img
                      src={usdcoinusdclogo}
                      className="h-[35px] w-[35px] mt-[6px]"
                    />
                    <h3 className="text-center text-white font-semibold text-2xl">
                      UNTIL NOW
                    </h3>
                  </div>
                </div>
              )
            ) : null}

            {/* Main routed pages in a subtle glass card */}
            <div className="mb-6 rounded-3xl border border-slate-700/70 bg-slate-950/60 px-2 py-4 sm:px-4 sm:py-6 lg:px-6 backdrop-blur-xl shadow-[0_0_45px_rgba(15,23,42,0.95)]">
              <Routes>
                <Route path="/coin/:tokenAddress" element={<CoinPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/coin-launcher" element={<CoinLauncher />} />
                <Route path="/deploy-esh" element={<DeployPublishedContractPage />} />
                <Route path="/deploy-rentals" element={<DeployRentals />} />
                <Route path="/deploy-sales" element={<DeploySales />} />
                <Route path="/deploy-votes" element={<DeployVotes />} />
                <Route path="/deploy-invoices" element={<DeployInvoices />} />
                <Route path="/bank" element={<ContractDeployForm />} />
                <Route path="/fight" element={<QuantumBusinessInterface />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/create-campaign" element={<CreateCampaign />} />
                <Route path="/my-campaigns" element={<Profile />} />
                <Route path="/home" element={<Home />} />
                <Route path="/campaign-details/:id" element={<CampaignDetails />} />
                <Route path="/all-campaigns" element={<AllCampaigns />} />
                <Route path="/blog" element={<News />} />
                <Route path="/edit-campaign/:id" element={<EditCampaign />} />
                <Route path="/post/:id" element={<Post />} />
                <Route path="/search/:term" element={<Search key={term} />} />
                <Route path="/vip" element={<VIPRegister />} />
                <Route path="/" element={<RecentCoins />} />
                <Route path="/my-coins" element={<MyCoins />} />
                <Route path="/super-admin" element={<Admin />} />
                <Route path="/dashboard" element={<ClientAdminPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/shop/:storepath/voting" element={<ESHVoting />} />
                <Route path="/newpost" element={<NewPost />} />
                <Route path="/edit-post" element={<EditPost />} />
                <Route path="/shop/:storepath" element={<StorePage />} />
                <Route path="/register-new-store" element={<RegisterNewStore />} />
                <Route path="/set-official-store" element={<SetOfficialStore />} />
                <Route path="/edit-official-store" element={<EditOfficialStore />} />
                <Route path="/edit-store" element={<EditStore />} />
                <Route
                  path="/shop/:storepath/products/:productBarCode"
                  element={<Product />}
                />
                <Route
                  path="/shop/:storepath/products/:productBarCode/extra"
                  element={<Extra />}
                />
                <Route path="/bonus" element={<LuckMachine />} />
                <Route path="/city/:cityofuser" element={<City />} />
                <Route path="/ListingInfo" element={<ListingInfo />} />
                <Route path="/nfts" element={<MyNFTs />} />
              </Routes>
            </div>

            <AccessibilityMenu />
            {isMobile ? <FooterMobile /> : <Footer />}
          </div>
        </div>
      </div>
    </>
  );
}
