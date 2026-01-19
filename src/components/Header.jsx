import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { logoOfWebsite, IL, search, tetherusdtlogo, Aicon, usdcoinusdclogo, WethLogo,QCoin } from '../assets'
import { Search } from "./"
import { ConnectWallet, useLogin, useTokenBalance, } from '@thirdweb-dev/react';
import {
    ConnectButton
} from "thirdweb/react";
import {
    createWallet,
    walletConnect,
    inAppWallet,
} from "thirdweb/wallets";
import { Base } from "@thirdweb-dev/chains";
import { base } from "thirdweb/chains";
import { useStateContext } from '../context';
import { useCart } from '../context/CartContext';
import { createThirdwebClient, defineChain, getContract, readContract } from "thirdweb";
import {
    smartWallet,
    DEFAULT_ACCOUNT_FACTORY_V0_7,
} from "thirdweb/wallets/smart";
const NavBtn = ({ children, onClick, accent }) => (
    <button
      onClick={onClick}
      className={[
        "px-3 py-2 rounded-full text-[14px] font-epilogue font-semibold transition",
        "border border-transparent",
        accent
          ? "bg-[#FFDD00] text-black hover:bg-[#FFE766] shadow-[0_10px_30px_rgba(255,221,0,0.12)]"
          : "text-gray-200 hover:text-white hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </button>
  );
const Header = () => {
    const { totalItems } = useCart(); 

    const socialWallet = inAppWallet({
        auth: {
            options: [
                "google",
                "facebook",
                "apple",
                "email",
                "phone",
                "passkey"
            ]
        },
        executionMode: {
            mode: "EIP7702",
            sponsorGas: true,
        },
    });

    const wallets = [
        createWallet("io.metamask"),
        createWallet("com.coinbase.wallet"),
        walletConnect(),
        createWallet("com.trustwallet.app"),
        createWallet("io.zerion.wallet"),
    ];

    const client = createThirdwebClient({ clientId: import.meta.env.VITE_THIRDWEB_CLIENT });
    const { address, getAllStoreOwners, storeRegistery,Blockchain,CrowdFunding } = useStateContext();
    const [storeOwners, setStoreOwners] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [dynamicTokens, setDynamicTokens] = useState([]);
    const [tokensLoading, setTokensLoading] = useState(false);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [amountForApprove, setAmountForApprove] = useState();
    const [toggleApproveCoins, setToggleApproveCoins] = useState(false);

    // Static tokens that are always available
    const staticTokens = [
        {
            address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            name: "USD Coin",
            symbol: "USDC",
            icon: usdcoinusdclogo,
        },
        {
            address: "0x4200000000000000000000000000000000000006",
            name: "Wrapped ETH",
            symbol: "WETH",
            icon: WethLogo,
        },
    ];

    const handleApprove = async () => {
        setIsLoading(true);
        if (await setApproval(amountForApprove * 1e18)) {
            setIsLoading(false);
            refreshPage();
        } else {
            setIsLoading(false);
            alert('Approval failed, kindly contact support');
        }
    }

    const wallet = inAppWallet({
        executionMode: {
            mode: "EIP7702",
            sponsorGas: true,
        },
    });

    // Function to get token details from contract address
    const getTokenDetails = async (tokenAddress) => {
        try {
            const tokenContract = getContract({
                client: client,
                chain: base,
                address: tokenAddress,
            });
    
            // Get symbol and name from the ERC20 contract
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
    
            // Return object based on token address
            if (tokenAddress === '0x18b67dd7409d3a3f4f3dde7a6a01c4db4b9ba5cd') {
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
    // Function to fetch all ERCUltra tokens
    const fetchERCUltraTokens = async () => {
        if (!Blockchain || tokensLoading) return;

        setTokensLoading(true);
        try {

            // Call getAllERCUltras function
            const ercUltraAddresses = await readContract({
                contract: Blockchain,
                method: "function getAllERCUltras() view returns (address[])",
                params: []
            });

            console.log("ERCUltra addresses:", ercUltraAddresses);

            // Get token details for each address
            const tokenPromises = ercUltraAddresses.map(address => getTokenDetails(address));
            const tokenDetails = await Promise.all(tokenPromises);
            
            // Filter out null results (failed token detail fetches)
            const validTokens = tokenDetails.filter(token => token !== null);
            
            console.log("Valid tokens:", validTokens);
            setDynamicTokens(validTokens);
            
        } catch (error) {
            console.error("Error fetching ERCUltra tokens:", error);
        } finally {
            setTokensLoading(false);
        }
    };

    // Function to fetch campaign reward tokens
const fetchCampaignRewardTokens = async () => {
  if (!CrowdFunding || tokensLoading) return;

  setTokensLoading(true);
  try {
      // Get the total number of campaigns
      const numberOfCampaigns = await CrowdFunding.call('numberOfCampaigns');
      console.log("Number of campaigns:", numberOfCampaigns);

      const newCampaignTokens = [];
      
      // Create a comprehensive set of existing addresses (normalize to lowercase)
      const getAllExistingAddresses = () => {
          const existingAddresses = new Set();
          
          // Add static tokens
          staticTokens.forEach(token => {
              existingAddresses.add(token.address.toLowerCase());
          });
          
          // Add dynamic tokens
          dynamicTokens.forEach(token => {
              existingAddresses.add(token.address.toLowerCase());
          });
          
          // Add any tokens we've already found in this session
          newCampaignTokens.forEach(token => {
              existingAddresses.add(token.address.toLowerCase());
          });
          
          return existingAddresses;
      };

      // Loop through campaigns starting from 1
      for (let i = 1; i <= numberOfCampaigns; i++) {
          try {
              console.log(`Fetching reward for campaign ${i}`);
              
              // Get campaign rewards
              const reward = await CrowdFunding.call('campaignRewards', [i]);
              
              if (reward && reward[0]) {
                  const tokenAddress = reward[0];
                  const addressLower = tokenAddress.toLowerCase();
                  
                  // Get fresh set of existing addresses each time
                  const existingAddresses = getAllExistingAddresses();
                  
                  // Check if this address already exists
                  if (!existingAddresses.has(addressLower)) {
                      console.log(`Getting token details for new address: ${tokenAddress}`);
                      
                      // Get token details using existing function
                      const tokenDetails = await getTokenDetails(tokenAddress);
                      
                      if (tokenDetails) {
                          // Ensure the address in tokenDetails is also normalized
                          tokenDetails.address = tokenAddress; // Keep original case from contract
                          newCampaignTokens.push(tokenDetails);
                          console.log(`Added new token: ${tokenDetails.name} (${tokenDetails.symbol})`);
                      }
                  } else {
                      console.log(`Token address ${tokenAddress} already exists, skipping`);
                  }
              }
          } catch (error) {
              console.error(`Error processing campaign ${i}:`, error);
              // Continue with next campaign even if this one fails
          }
      }

      console.log("New campaign reward tokens found:", newCampaignTokens);
      
      // Only add the new tokens that aren't already in dynamicTokens
      if (newCampaignTokens.length > 0) {
          setDynamicTokens(prevTokens => {
              // Double-check for duplicates before adding
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

// Alternative version that returns the tokens instead of updating state
const getCampaignRewardTokens = async () => {
  if (!CrowdFunding) return [];

  try {
      const numberOfCampaigns = await CrowdFunding.call('numberOfCampaigns');
      const campaignTokens = [];
      const seenAddresses = new Set();

      // Add existing token addresses to avoid duplicates
      [...staticTokens, ...dynamicTokens].forEach(token => {
          seenAddresses.add(token.address.toLowerCase());
      });

      for (let i = 1; i <= numberOfCampaigns; i++) {
          try {
              const reward = await CrowdFunding.call('campaignRewards', [i]);
              
              if (reward && reward[0]) {
                  const tokenAddress = reward[0];
                  const addressLower = tokenAddress.toLowerCase();
                  
                  if (!seenAddresses.has(addressLower)) {
                      const tokenDetails = await getTokenDetails(tokenAddress);
                      
                      if (tokenDetails) {
                          campaignTokens.push(tokenDetails);
                          seenAddresses.add(addressLower);
                      }
                  }
              }
          } catch (error) {
              console.error(`Error processing campaign ${i}:`, error);
          }
      }

      return campaignTokens;
  } catch (error) {
      console.error("Error fetching campaign reward tokens:", error);
      return [];
  }
};

    useEffect(() => {
        async function getStoreOwners() {
            const data = await getAllStoreOwners();
            setStoreOwners(data.map(owner => owner.toLowerCase()))
        }

        if (address && storeRegistery) {
            getStoreOwners();
        }
    }, [address, storeRegistery]);

    // Fetch ERCUltra tokens when component mounts or when storeRegistery changes
    useEffect(() => {
        fetchERCUltraTokens();
    }, [storeRegistery]);

    // Combine static and dynamic tokens
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

  useEffect(() => {
    //fetchCampaignRewardTokens();
}, [CrowdFunding, address]);
  
  // Use it when combining all tokens
  const allSupportedTokens = {
      [Base.chainId]: deduplicateTokens([...staticTokens//, ...dynamicTokens
        ])
  };

    const handleNFTSNavigate = () => {
        navigate('/nfts');
    };
    const handleDashboardNavigate = () => {
        navigate('/dashboard');
    };

    const handleAboutNavigate = () => {
        navigate('/about');
    };

    const handleSearchClick = () => {
        setCampaigns([]);
        navigate(`/search/${searchTerm}`);
    };

    async function handleLogin() {
        try {
            await login({
                uri: "https://www.ultrashop.tech",
                statement: "Kindly read our terms of service, by continue you agree to it.",
                chainId: "8453",
                nonce: "1",
                version: "1",
                resources: ["https://www.ultrashop.tech/terms", "https://www.ultrashop.tech/privacy-policy"],
            });
        } catch (err) {
            console.error(err);
        }
    }

    const naviateToMyCampaigns = () => {
        navigate('/my-coins');
    }
    const naviateToAllCampaigns = () => {
        navigate('/all-campaigns');
    }
    const naviateToCreateCampaign = () => {
        navigate('/deploy-esh');
    }

    const naviateToShops = () => {
        navigate('/');
    }

    const naviateToVip = () => {
        navigate('/coin-launcher');
    }
    const naviateToAdmin = () => {
        navigate('/my-coins');
    }
    const naviateToNFTs = () => {
        navigate('/nfts');
    }
    const naviateToStoreVip = () => {
        navigate('/shop/mainshop');
    }
    const naviateToStoreVip1 = () => {
        navigate('/all-coins');
    }

    const navigateToCompiler = () => {
        navigate('/compiler');
    }
    const navigateToMiner = () => {
        navigate('/miner');
    }
    const handleClickOnApprove = () => {
        setToggleApproveCoins(prev => !prev);
    };

    return (
        <>
  {/* Desktop Header */}
  <header className="fixed top-0 left-0 right-0 z-[999] border-b border-[#FFDD00]/40 bg-black/55 backdrop-blur-xl shadow-[0_12px_50px_rgba(0,0,0,0.35)]">
    <div className="mx-auto flex h-[78px] w-full max-w-[1280px] items-center justify-between px-4 lg:px-6">
      
      {/* Logo */}
      <div
        className="group flex cursor-pointer items-center gap-2"
        onClick={() => naviateToStoreVip1()}
      >
        <div className="relative">
          <img
            src={logoOfWebsite}
            alt="logo"
            className="h-11 w-11 object-contain drop-shadow"
          />
          <div className="pointer-events-none absolute -inset-2 rounded-full bg-[#FFDD00]/10 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <div className="flex items-baseline leading-none">
          <span className="font-epilogue text-[18px] font-semibold tracking-wide text-white">
            Ultra
          </span>
          <span className="ml-1 font-epilogue text-[18px] font-semibold tracking-wide text-[#FFDD00]">
            Shop
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="hidden lg:flex items-center gap-2">
        <NavBtn onClick={naviateToShops}>Home</NavBtn>
        <NavBtn onClick={naviateToStoreVip1}>All Coins</NavBtn>
        <NavBtn onClick={handleAboutNavigate}>About</NavBtn>

        {address && <NavBtn onClick={naviateToMyCampaigns}>My Coins</NavBtn>}

        <div className="mx-2 h-6 w-px bg-white/10" />

        <NavBtn onClick={naviateToVip} accent>
          Launch Coin
        </NavBtn>
        <NavBtn onClick={naviateToCreateCampaign}>Create Coin</NavBtn>

        {address && <NavBtn onClick={handleDashboardNavigate}>Dashboard</NavBtn>}
        {address && <NavBtn onClick={handleNFTSNavigate}>NFTs</NavBtn>}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Cart */}
        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="relative grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:border-[#FFDD00]/40 hover:bg-[#FFDD00]/10"
          aria-label="Open cart"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-[22px] w-[22px]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>

          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-red-500 px-1 text-[11px] font-extrabold text-white shadow">
              {totalItems}
            </span>
          )}
        </button>

        {/* Connect */}
        <div className="rounded-2xl border border-white/10 bg-white/5 px-1 py-1">
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
                const randomString =
                  Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15);

                return {
                  domain: window.location.host,
                  address,
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
                const expirationTime = new Date(
                  Date.now() + 5 * 60 * 60 * 1000
                ).toISOString();
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
              displayBalanceToken: {
                [Base.chainId]: import.meta.env.VITE_DEAL_COIN_ADDRESS,
              },
            }}
            chain={base}
            chains={[base]}
          />
        </div>
      </div>
    </div>

    {/* Subtle bottom glow line */}
    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#FFDD00]/60 to-transparent" />
  </header>

  {/* Spacer so content won't hide behind fixed header */}
  <div className="h-[78px]" />
</>

    )
}

export default Header