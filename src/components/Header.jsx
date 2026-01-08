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
import { createThirdwebClient, defineChain, getContract, readContract } from "thirdweb";
import {
    smartWallet,
    DEFAULT_ACCOUNT_FACTORY_V0_7,
} from "thirdweb/wallets/smart";

const Header = () => {

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
        //fetchERCUltraTokens();
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
      [Base.chainId]: deduplicateTokens([...staticTokens, ...dynamicTokens])
  };

    const handleBlogNavigate = () => {
        navigate('/blog');
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
        navigate('/');
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
            <div className={`drop-shadow w-full relative  border-b-[1px] border-[#FFDD00] pb-[20px] fixed-header ${address ? ('h-[75px]') : ('h-[75px]')}`}>
                <div className='flex py-[5px]'>
                    <div className='flex cursor-pointer' onClick={()=> naviateToStoreVip1()}>
                        <img src={logoOfWebsite} alt='logo' className='w-[50px] h-[50px] object-contain my-auto mx-[10px]' />
                        <h1 className='text-white font-epilogue font-semibold text-[18px] my-auto'>Ultra</h1>
                        <h1 className='text-[#FFDD00] font-epilogue font-semibold text-[18px] my-auto'>Shop</h1>
                    </div>

                    <div className='flex items-center justify-between h-full my-auto m-auto max-w-[1280px]'>
                        <div className='textcolor flex items-center gap-5'>
                            {/* <div className="lg:flex-1  bg-[#000000] flex flex-row pr-2 h-[52px] bg-transparent border-[1px] border-[#525252] duration-500 ease-in-out hover:border-[#FFFFFF] rounded-[15px]">
                                <div className=" w-[50px] h-full rounded-[2px] bg-transparent flex justify-center items-center cursor-pointer  duration-500 ease-in-out rounded-[16px]" onClick={() => handleSearchClick()}>
                                    <img src={search} alt="search" className="w-[15px] h-[15px] object-contain" />
                                </div>
                                <input type="text" placeholder="Search a Campaign" className="flex w-[220px] font-epilogue font-normal text-[16px] placeholder:text-[#ffffff] bg-transparent text-[#ffffff] outline-none ml-[15px]" value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)} />
                            </div> */}
                            <button onClick={naviateToStoreVip1} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>Home</button>
                            <button onClick={handleAboutNavigate} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>About</button>
                            {address ? (<button onClick={naviateToMyCampaigns} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>My Coins</button>) : (<></>)}
                            <button onClick={naviateToVip} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>Launch Coin</button>
                            <button onClick={naviateToCreateCampaign} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>Create Coin</button>
                        </div>
                    </div>
                    <div className='mr-[20px] py-[5px] my-auto'>
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
                </div>
            </div>
        </>
    )
}

export default Header