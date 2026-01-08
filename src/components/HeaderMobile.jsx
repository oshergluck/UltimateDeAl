import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { logoOfWebsite, menu, usdcoinusdclogo, WethLogo, QCoin } from "../assets";
import { createThirdwebClient, getContract, readContract } from "thirdweb";
import { base } from "thirdweb/chains";
import { createWallet, walletConnect } from "thirdweb/wallets";
import { ConnectButton } from "thirdweb/react";
import { useStateContext } from "../context";
import { Base } from "@thirdweb-dev/chains";

const HeaderMobile = () => {
  const navigate = useNavigate();
  const { address, Blockchain, CrowdFunding } = useStateContext();

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

  // --- Supported tokens (static + optional dynamic if you want to re-enable later) ---
  const staticTokens = [
    { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", name: "USD Coin", symbol: "USDC", icon: usdcoinusdclogo },
    { address: "0x4200000000000000000000000000000000000006", name: "Wrapped ETH", symbol: "WETH", icon: WethLogo },
  ];
  const allSupportedTokens = { [base.chainId]: staticTokens }; // plug your dynamic list back here if desired

  // --- Nav helpers ---
  const go = (path, shouldClose = true) => () => {
    if (shouldClose) close();
    navigate(path);
  };

  // --- Icons (stroke inherits currentColor so they match text) ---
  const IconWrap = ({ children }) => <span className="inline-flex w-6 h-6">{children}</span>;
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

  // close on Esc
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <>
      {/* Fixed header */}
      <header className="fixed top-0 inset-x-0 z-50 shadow-lg">
        <div className="bg-black">
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
                  className="w-9 h-9 rounded-xl bg-black/20 backdrop-blur object-contain"
                />
                <div className="flex items-baseline leading-none">
                  <span className="text-white font-epilogue font-semibold sm:text-xl text-[16px] tracking-tight">Ultra</span>
                  <span className="text-[#FFDD00] font-epilogue font-semibold sm:text-xl text-[16px] tracking-tight">Shop</span>
                </div>
              </button>

              {/* Wallet button (kept visible on mobile) */}
              <div className="shrink-0">
              <ConnectButton
    autoConnect={true}
    client={client}
    wallets={wallets}
    theme="dark"
    connectButton={{ label: "Connect" }}
    auth={{
        // 1. יצירת הודעת החתימה עם כל השדות החובה
        getLoginPayload: async ({ address }) => {
            const now = new Date();
            const expiration = new Date(now.getTime() + 5 * 60 * 60 * 1000); // 5 שעות
            
            // יצירת מחרוזת רנדומלית (Nonce) - קריטי לאבטחה
            const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            return {
                domain: window.location.host, // או "ultrashop.tech"
                address: address,
                statement: "I authorize this session for the UltraShop Dashboard.",
                version: "1", // חובה!
                nonce: randomString, // חובה!
                chain_id: "8453", // Base Mainnet ID
                issued_at: now.toISOString(), // חובה!
                expiration_time: expiration.toISOString(),
                uri: window.location.origin, // חובה!
            };
        },
        
        // 2. מה קורה אחרי חתימה מוצלחת
        doLogin: async (params) => {
            console.log("User signed in successfully", params);
            // שומרים סימון שהמשתמש התחבר + זמן תפוגה בלוקל סטורג'
            // זה גורם לכפתור להבין שאנחנו מחוברים
            const expirationTime = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
            localStorage.setItem("auth_token", "signed_in");
            localStorage.setItem("auth_expiry", expirationTime);
        },

        // 3. בדיקה האם המשתמש כבר מחובר (בודק גם תוקף של 5 שעות)
        isLoggedIn: async () => {
            const token = localStorage.getItem("auth_token");
            const expiry = localStorage.getItem("auth_expiry");
            
            if (!token || !expiry) return false;
            
            // בדיקה אם עברו 5 שעות
            if (new Date() > new Date(expiry)) {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_expiry");
                return false;
            }
            
            return true;
        },

        // 4. התנתקות
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
                className="ml-2 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label="Open menu"
                aria-expanded={open}
              >
                <img src={menu} alt="" className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer so content doesn't hide under fixed header */}
      <div className="h-[64px] sm:h-[72px]" />

      {/* Backdrop */}
      <div
        onClick={close}
        className={`fixed inset-0 z-40 transition ${
          open ? "visible bg-black/50 backdrop-blur-sm" : "invisible bg-transparent"
        } duration-200`}
        aria-hidden={!open}
      />

      {/* Slide-in mobile menu (right drawer) */}
      <aside
        className={`fixed top-0 right-0 z-50 h-dvh w-[88%] max-w-sm linear-gradient1 border-l border-white/10 shadow-2xl
        transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-white/90 font-semibold">Menu</span>
          </div>
          <button
            onClick={close}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <nav className="px-3 pb-4">
          <ul className="space-y-2">
            <li>
              <button onClick={go("/")} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/90">
                <HomeIcon /> <span className="text-base font-medium">Home</span>
              </button>
            </li>
            <li>
              <button onClick={go("/about")} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/90">
                <GridIcon /> <span className="text-base font-medium">About</span>
              </button>
            </li>
            <li>
              <button onClick={go("/deploy-esh")} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/90">
                <StarIcon /> <span className="text-base font-medium">Create Coin</span>
              </button>
            </li>
            <li>
              <button onClick={go("/coin-launcher")} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/90">
              <PlusIcon /> <span className="text-base font-medium">Launch Coin</span>
              </button>
            </li>
            {address && (
              <li>
                <button onClick={go("/my-coins")} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/90">
                  <FolderIcon /> <span className="text-base font-medium">My Coins</span>
                </button>
              </li>
            )}
            <li>
              <button onClick={go("/home")} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/90">
                <BlogIcon /> <span className="text-base font-medium">Shops</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Footer / tagline */}
        <div className="mt-auto px-4 pb-6">
          <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
            <div className="text-white/90 font-semibold">UltraShop on Base</div>
            <div className="text-white/70 text-sm mt-1">
              Launch, invest, and trade coins. Simple UX, gas-efficient, and fast.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default HeaderMobile;
