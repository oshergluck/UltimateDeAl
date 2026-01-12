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
  const { address, Blockchain, CrowdFunding,storeRegistery } = useStateContext();
  const { totalItems } = useCart();

  // --- UI state ---
  const [open, setOpen] = useState(false);
  
  // --- Token Logic State ---
  const [dynamicTokens, setDynamicTokens] = useState([]);
  const [tokensLoading, setTokensLoading] = useState(false);

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

  // --- Static Tokens ---
  const staticTokens = [
    { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", name: "USD Coin", symbol: "USDC", icon: usdcoinusdclogo },
    { address: "0x4200000000000000000000000000000000000006", name: "Wrapped ETH", symbol: "WETH", icon: WethLogo },
  ];

  // --- Token Fetching Logic (Same as Header.jsx) ---

  const getTokenDetails = async (tokenAddress) => {
    try {
        const tokenContract = getContract({
            client: client,
            chain: base,
            address: tokenAddress,
        });

        const [symbol, name] = await Promise.all([
            readContract({
                contract: tokenContract,
                method: "function symbol() view returns (string)",
                params: []
            }),
            readContract({
                contract: tokenContract,
                method: "function name() view returns (string)",
                params: []
            })
        ]);

        if (tokenAddress === '0xD90B9dB989b83B5d112c3e9fABd1a964E463E197') {
            return {
                address: tokenAddress,
                name: name,
                symbol: symbol,
                icon: logoOfWebsite,
            };
        } else {
            return {
                address: tokenAddress,
                name: name,
                symbol: symbol,
                icon: QCoin,
            };
        }
    } catch (error) {
        console.error(`Error getting token details for ${tokenAddress}:`, error);
        return null;
    }
  };

  const fetchERCUltraTokens = async () => {
    if (!Blockchain || tokensLoading) return;

    setTokensLoading(true);
    try {
        const ercUltraAddresses = await readContract({
            contract: Blockchain,
            method: "function getAllERCUltras() view returns (address[])",
            params: []
        });

        const tokenPromises = ercUltraAddresses.map(address => getTokenDetails(address));
        const tokenDetails = await Promise.all(tokenPromises);
        
        const validTokens = tokenDetails.filter(token => token !== null);
        
        setDynamicTokens(prev => [...prev, ...validTokens]);
        
    } catch (error) {
        console.error("Error fetching ERCUltra tokens:", error);
    } finally {
        setTokensLoading(false);
    }
  };

  const fetchCampaignRewardTokens = async () => {
    if (!CrowdFunding || tokensLoading) return;
  
    setTokensLoading(true);
    try {
        const numberOfCampaigns = await CrowdFunding.call('numberOfCampaigns');
        const newCampaignTokens = [];
        
        const getAllExistingAddresses = () => {
            const existingAddresses = new Set();
            staticTokens.forEach(token => existingAddresses.add(token.address.toLowerCase()));
            dynamicTokens.forEach(token => existingAddresses.add(token.address.toLowerCase()));
            newCampaignTokens.forEach(token => existingAddresses.add(token.address.toLowerCase()));
            return existingAddresses;
        };
  
        for (let i = 1; i <= numberOfCampaigns; i++) {
            try {
                const reward = await CrowdFunding.call('campaignRewards', [i]);
                
                if (reward && reward[0]) {
                    const tokenAddress = reward[0];
                    const addressLower = tokenAddress.toLowerCase();
                    const existingAddresses = getAllExistingAddresses();
                    
                    if (!existingAddresses.has(addressLower)) {
                        const tokenDetails = await getTokenDetails(tokenAddress);
                        if (tokenDetails) {
                            tokenDetails.address = tokenAddress;
                            newCampaignTokens.push(tokenDetails);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error processing campaign ${i}:`, error);
            }
        }
        
        if (newCampaignTokens.length > 0) {
            setDynamicTokens(prevTokens => {
                const existingAddresses = new Set(
                    [...staticTokens, ...prevTokens].map(token => token.address.toLowerCase())
                );
                const uniqueNewTokens = newCampaignTokens.filter(token => 
                    !existingAddresses.has(token.address.toLowerCase())
                );
                return [...prevTokens, ...uniqueNewTokens];
            });
        }
        
    } catch (error) {
        console.error("Error fetching campaign reward tokens:", error);
    } finally {
        setTokensLoading(false);
    }
  };

  useEffect(() => {
      fetchERCUltraTokens();
  }, [storeRegistery]);

  useEffect(() => {
    fetchCampaignRewardTokens();
  }, [CrowdFunding, address]);

  const deduplicateTokens = (tokens) => {
    const seen = new Set();
    return tokens.filter(token => {
        const address = token.address.toLowerCase();
        if (seen.has(address)) {
            return false;
        }
        seen.add(address);
        return true;
    });
  };

  const allSupportedTokens = {
      [Base.chainId]: deduplicateTokens([...staticTokens, ...dynamicTokens])
  };

  // --- Navigation & Icons ---

  const go = (path, shouldClose = true) => () => {
    if (shouldClose) close();
    navigate(path);
  };

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

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 shadow-xl border-b border-[#FFDD00]/30">
        <div className="bg-black/90 backdrop-blur-md">
          <div className="mx-auto px-4">
            <div className="h-[70px] flex items-center justify-between">
              
              {/* LEFT: Brand */}
              <button
                onClick={go("/")}
                className="flex items-center gap-2 active:scale-95 transition"
                aria-label="Go to home"
              >
                <img
                  src={logoOfWebsite}
                  alt="UltraShop logo"
                  className="w-10 h-10 rounded-xl bg-black/20 backdrop-blur object-contain border border-white/10"
                />
                <div className="flex items-baseline leading-none">
                  <span className="text-white font-epilogue font-bold text-lg tracking-tight">Ultra</span>
                  <span className="text-[#FFDD00] font-epilogue font-bold text-lg tracking-tight">Shop</span>
                </div>
              </button>

              {/* RIGHT: Actions (Cart, Connect, Menu) */}
              <div className="flex items-center gap-3">
                
                {/* 1. Cart Icon */}
                <div className="relative cursor-pointer p-1" onClick={() => navigate('/cart')}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white hover:text-[#FFDD00] transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-black">
                            {totalItems}
                        </span>
                    )}
                </div>

                {/* 2. Connect Button (Scaled down slightly for mobile fit) */}
                <div className="scale-90 origin-right"> 
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
                                    statement: "I authorize this session for the UltraShop Dashboard.",
                                    version: "1",
                                    nonce: randomString,
                                    chain_id: "8453",
                                    issued_at: now.toISOString(),
                                    expiration_time: expiration.toISOString(),
                                    uri: window.location.origin,
                                };
                            },
                            doLogin: async (params) => {
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

                {/* 3. Menu Button */}
                <button
                    onClick={toggle}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 transition border border-white/10"
                    aria-label="Open menu"
                    aria-expanded={open}
                >
                    <img src={menu} alt="" className="w-6 h-6 invert" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="h-[70px]" />

      <div
        onClick={close}
        className={`fixed inset-0 z-40 transition ${
          open ? "visible bg-black/50 backdrop-blur-sm" : "invisible bg-transparent"
        } duration-200`}
        aria-hidden={!open}
      />

      <aside
        className={`fixed top-0 right-0 z-50 h-dvh w-[85%] max-w-sm linear-gradient1 border-l border-white/10 shadow-2xl
        transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-white font-epilogue font-bold text-xl">Menu</span>
          </div>
          <button
            onClick={close}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20"
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="px-3 py-6">
          <ul className="space-y-3">
            <li>
              <button onClick={go("/")} className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-white/5 hover:bg-[#FFDD00]/10 text-white hover:text-[#FFDD00] transition border border-white/5">
                <HomeIcon /> <span className="text-lg font-medium">Home</span>
              </button>
            </li>
            <li>
              <button onClick={go("/about")} className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-white/5 hover:bg-[#FFDD00]/10 text-white hover:text-[#FFDD00] transition border border-white/5">
                <GridIcon /> <span className="text-lg font-medium">About</span>
              </button>
            </li>
            <li>
              <button onClick={go("/deploy-esh")} className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-white/5 hover:bg-[#FFDD00]/10 text-white hover:text-[#FFDD00] transition border border-white/5">
                <StarIcon /> <span className="text-lg font-medium">Create Coin</span>
              </button>
            </li>
            <li>
              <button onClick={go("/coin-launcher")} className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-white/5 hover:bg-[#FFDD00]/10 text-white hover:text-[#FFDD00] transition border border-white/5">
              <PlusIcon /> <span className="text-lg font-medium">Launch Coin</span>
              </button>
            </li>
            {address && (
              <li>
                <button onClick={go("/my-coins")} className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-white/5 hover:bg-[#FFDD00]/10 text-white hover:text-[#FFDD00] transition border border-white/5">
                  <FolderIcon /> <span className="text-lg font-medium">My Coins</span>
                </button>
              </li>
            )}
            <li>
              <button onClick={go("/home")} className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-white/5 hover:bg-[#FFDD00]/10 text-white hover:text-[#FFDD00] transition border border-white/5">
                <BlogIcon /> <span className="text-lg font-medium">Shops</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
            <div className="text-[#FFDD00] font-bold">UltraShop on Base</div>
            <div className="text-gray-400 text-xs mt-1">
              Launch, invest, and trade coins. Simple UX, gas-efficient, and fast.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default HeaderMobile;