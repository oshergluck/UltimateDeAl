import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { logoOfWebsite, menu, usdcoinusdclogo, WethLogo, QCoin } from "../assets";
import { createThirdwebClient, getContract, readContract } from "thirdweb";
import { base } from "thirdweb/chains";
import { createWallet, walletConnect } from "thirdweb/wallets";
import { ConnectButton } from "thirdweb/react";
import { useStateContext } from "../context";
import { useCart } from '../context/CartContext';
import { Base } from "@thirdweb-dev/chains";

const HeaderMobile = () => {
  const navigate = useNavigate();
  const { address, Blockchain, CrowdFunding } = useStateContext();
  const { totalItems } = useCart();

  // --- UI state ---
  const [open, setOpen] = useState(false);

  // prevent body scroll when menu is open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  const toggle = useCallback(() => setOpen((s) => !s), []);
  const close = useCallback(() => setOpen(false), []);

  // --- Wallets / client ---
  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    walletConnect(),
    createWallet("com.trustwallet.app"),
    createWallet("io.zerion.wallet"),
  ];
  const client = createThirdwebClient({ clientId: import.meta.env.VITE_THIRDWEB_CLIENT });

  // --- Supported tokens ---
  const staticTokens = [
    { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", name: "USD Coin", symbol: "USDC", icon: usdcoinusdclogo },
    { address: "0x4200000000000000000000000000000000000006", name: "Wrapped ETH", symbol: "WETH", icon: WethLogo },
  ];
  const allSupportedTokens = { [base.chainId]: staticTokens };

  // --- Nav helpers ---
  const go = (path, shouldClose = true) => () => {
    if (shouldClose) close();
    navigate(path);
  };

  // --- Icons ---
  const IconWrap = ({ children }) => <span className="inline-flex w-6 h-6 text-cyan-400 group-hover:text-yellow-300 transition-colors duration-300">{children}</span>;
  
  const HomeIcon = () => (
    <IconWrap>
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M3 12l9-8 9 8v8a2 2 0 01-2 2h-3a2 2 0 01-2-2v-4H10v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </IconWrap>
  );
  const BlogIcon = () => (
    <IconWrap>
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M4 7h12M4 12h12M4 17h8M18 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </IconWrap>
  );

  const UserIcon = () => (
    <IconWrap>
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c1.5-4 14.5-4 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </IconWrap>
  )

  const PlusIcon = () => (
    <IconWrap>
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </IconWrap>
  );
  const GridIcon = () => (
    <IconWrap>
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </IconWrap>
  );
  const StarIcon = () => (
    <IconWrap>
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 3l2.9 5.88 6.5.95-4.7 4.58 1.1 6.41L12 18.77 6.2 20.82l1.1-6.41L2.6 9.83l6.5-.95L12 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </IconWrap>
  );
  const FolderIcon = () => (
    <IconWrap>
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M4 7h6l2 3h8v7a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </IconWrap>
  );

  const WalletIcon = () => (
    <IconWrap>
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M3 7h18v10H3zM17 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </IconWrap>
  )

  // close on Esc
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  // Reusable Nav Button Style
  const navBtnClass = "group w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900/60 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-300 backdrop-blur-md";
  const navTextClass = "text-base font-medium text-slate-200 group-hover:text-white transition-colors";

  return (
    <>
      {/* Fixed header */}
      <header className="fixed top-0 inset-x-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="bg-black/80 backdrop-blur-lg border-b border-white/5">
          <div className="mx-auto max-w-6xl px-3 sm:px-4">
            <div className="h-[64px] sm:h-[72px] flex items-center justify-between">
              {/* Brand */}
              <button
                onClick={go("/")}
                className="flex items-center gap-2 active:scale-95 transition"
                aria-label="Go to home"
              >
                <img
                  src={logoOfWebsite}
                  alt="UltraShop logo"
                  className="w-9 h-9 rounded-xl bg-black/20 backdrop-blur object-contain border border-white/10"
                />
                <div className="flex items-baseline leading-none">
                  <span className="text-white font-epilogue font-semibold sm:text-xl text-[13px] tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Ultra</span>
                  <span className="text-[#FFDD00] font-epilogue font-semibold sm:text-xl text-[13px] tracking-tight drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]">Shop</span>
                </div>
              </button>

              {/* Wallet button & Menu */}
              <div className="shrink-0 flex items-center gap-2">
                <div className="relative cursor-pointer group" onClick={() => navigate('/cart')}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-slate-300 group-hover:text-[#FFDD00] group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] transition duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-[0_0_10px_rgba(236,72,153,0.8)]">
                            {totalItems}
                        </span>
                    )}
                </div>

                <ConnectButton
                  autoConnect={true}
                  client={client}
                  wallets={wallets}
                  theme="dark"
                  connectButton={{ label: "Connect" }}
                  auth={{
                      getLoginPayload: async ({ address }) => {
                          const now = new Date();
                          const expiration = new Date(now.getTime() + 5 * 60 * 60 * 1000); 
                          const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                          return {
                              domain: window.location.host,
                              address: address,
                              statement: "I authorize this session for the UltraShop",
                              version: "1",
                              nonce: randomString,
                              chain_id: "8453",
                              issued_at: now.toISOString(),
                              expiration_time: expiration.toISOString(),
                              uri: window.location.origin,
                          };
                      },
                      doLogin: async (params) => {
                          console.log("User signed in successfully", params);
                          const expirationTime = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
                          localStorage.setItem("auth_token", "signed_in");
                          localStorage.setItem("auth_expiry", expirationTime);
                      },
                      isLoggedIn: async () => {
                          const token = localStorage.getItem("auth_token");
                          const expiry = localStorage.getItem("auth_expiry");
                          if (!token || !expiry) return false;
                          if (new Date() > new Date(expiry)) {
                              localStorage.removeItem("auth_token");
                              localStorage.removeItem("auth_expiry");
                              return false;
                          }
                          return true;
                      },
                      doLogout: async () => {
                          localStorage.removeItem("auth_token");
                          localStorage.removeItem("auth_expiry");
                          console.log("User logged out");
                      },
                  }}
                  connectModal={{
                      size: "wide",
                      title: "UltraShop",
                      titleIcon: logoOfWebsite,
                      welcomeScreen: {
                          title: "UltraShop",
                          subtitle: "Create your own coin or invest in other coins",
                          img: { src: logoOfWebsite, width: 150, height: 150 },
                      },
                      termsOfServiceUrl: "https://ultrashop.tech/terms",
                      privacyPolicyUrl: "https://ultrashop.tech/privacy-policy",
                      showThirdwebBranding: true,
                  }}
                  supportedTokens={allSupportedTokens}
                  detailsButton={{
                      displayBalanceToken: { [Base.chainId]: import.meta.env.VITE_DEAL_COIN_ADDRESS },
                  }}
                  chain={base}
                  chains={[base]}
                />
              </div>

              {/* Menu button */}
              <button
                onClick={toggle}
                className="ml-2 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-cyan-400 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                aria-label="Open menu"
                aria-expanded={open}
              >
                <img src={menu} alt="" className="w-6 h-6 invert opacity-80" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-[64px] sm:h-[72px]" />

      {/* Backdrop */}
      <div
        onClick={close}
        className={`fixed inset-0 z-40 transition ${
          open ? "visible bg-black/60 backdrop-blur-sm" : "invisible bg-transparent"
        } duration-200`}
        aria-hidden={!open}
      />

      {/* Slide-in mobile menu (Cyberpunk Style) */}
      <aside
        className={`fixed top-0 right-0 z-50 h-dvh w-[88%] max-w-sm bg-black border-l border-cyan-500/20 shadow-[-10px_0_40px_rgba(6,182,212,0.15)]
        transition-transform duration-300 overflow-hidden ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Mobile navigation"
      >
        {/* BACKGROUND AURAS (Matching App.jsx) */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_70%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.25),_transparent_60%)] opacity-80" />
        {/* CYBER GRID (Matching App.jsx) */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 mix-blend-soft-light" />
        
        {/* Content Container (z-10 to sit above background) */}
        <div className="relative z-10 flex flex-col h-full">
            
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold tracking-wider drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">MENU</span>
              </div>
              <button
                onClick={close}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800/50 hover:bg-red-500/20 border border-transparent hover:border-red-500/50 text-slate-400 hover:text-red-400 transition-all duration-300"
                aria-label="Close menu"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <nav className="px-4 py-6 overflow-y-auto custom-scrollbar">
              <ul className="space-y-3">
                <li>
                  <button onClick={go("/")} className={navBtnClass}>
                    <HomeIcon /> <span className={navTextClass}>Home</span>
                  </button>
                </li>
                <li>
                  <button onClick={go("/about")} className={navBtnClass}>
                    <GridIcon /> <span className={navTextClass}>About</span>
                  </button>
                </li>
                <li>
                  <button onClick={go("/deploy-esh")} className={navBtnClass}>
                    <StarIcon /> <span className={navTextClass}>Create Coin</span>
                  </button>
                </li>
                <li>
                  <button onClick={go("/coin-launcher")} className={navBtnClass}>
                  <PlusIcon /> <span className={navTextClass}>Launch Coin</span>
                  </button>
                </li>
                {address && (
                  <li>
                    <button onClick={go("/my-coins")} className={navBtnClass}>
                      <FolderIcon /> <span className={navTextClass}>My Coins</span>
                    </button>
                  </li>
                )}
                {address && (
                  <li>
                    <button onClick={go("/dashboard")} className={navBtnClass}>
                      <UserIcon /> <span className={navTextClass}>Dashboard</span>
                    </button>
                  </li>
                )}
                <li>
                  <button onClick={go("/home")} className={navBtnClass}>
                    <WalletIcon /> <span className={navTextClass}>Shops</span>
                  </button>
                </li>
              </ul>
            </nav>

            {/* Footer / tagline */}
            <div className="mt-auto px-4 pb-8 pt-4">
              <div className="rounded-2xl border border-fuchsia-500/20 bg-black/40 p-5 backdrop-blur-md shadow-[0_0_20px_rgba(236,72,153,0.1)]">
                <div className="text-white font-bold tracking-wide">UltraShop on Base</div>
                <div className="text-slate-400 text-sm mt-1 leading-relaxed">
                  Launch, invest, and trade coins. <span className="text-cyan-400">Simple UX</span>, gas-efficient, and fast.
                </div>
              </div>
            </div>
        </div>
      </aside>
    </>
  );
};

export default HeaderMobile;