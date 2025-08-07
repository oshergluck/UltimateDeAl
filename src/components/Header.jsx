import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { logoOfWebsite, IL, search, tetherusdtlogo, Aicon, usdcoinusdclogo, WethLogo } from '../assets'
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
        socialWallet,
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
                client : client,
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

            return {
                address: tokenAddress,
                name: name,
                symbol: symbol,
                icon: logoOfWebsite, // Default icon - you can customize this
            };
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
    fetchCampaignRewardTokens();
}, [CrowdFunding, address]);
  
  // Use it when combining all tokens
  const allSupportedTokens = {
      [Base.chainId]: deduplicateTokens([...staticTokens, ...dynamicTokens])
  };

    const handleHomeClick = () => {
        navigate('/blog');
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
        navigate('/my-campaigns');
    }
    const naviateToAllCampaigns = () => {
        navigate('/all-campaigns');
    }
    const naviateToCreateCampaign = () => {
        navigate('/create-campaign');
    }
    const naviateToVip = () => {
        navigate('/register-vip');
    }
    const naviateToAdmin = () => {
        navigate('/dashboard');
    }
    const naviateToNFTs = () => {
        navigate('/nfts');
    }
    const naviateToStoreVip = () => {
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
            <div className={`drop-shadow w-full relative linear-gradient1 border-b-[1px] border-[#FFDD00] pb-[20px] fixed-header ${address ? ('h-[75px]') : ('h-[75px]')}`}>
                <div className='flex py-[5px]'>
                    <div className='flex cursor-pointer' onClick={() => naviateToStoreVip()}>
                        <img src={logoOfWebsite} alt='logo' className='w-[50px] h-[50px] object-contain my-auto mx-[10px]' />
                        <h1 className='text-white font-epilogue font-semibold text-[18px] my-auto'>Ultra</h1>
                        <h1 className='text-[#FFDD00] font-epilogue font-semibold text-[18px] my-auto'>Shop</h1>
                    </div>

                    <div className='flex items-center justify-between h-full my-auto m-auto max-w-[1280px]'>
                        <div className='textcolor flex items-center gap-5'>
                            <div className="lg:flex-1  bg-[#000000] flex flex-row pr-2 h-[52px] bg-transparent border-[1px] border-[#525252] duration-500 ease-in-out hover:border-[#FFFFFF] rounded-[15px]">
                                <div className=" w-[50px] h-full rounded-[2px] bg-transparent flex justify-center items-center cursor-pointer  duration-500 ease-in-out rounded-[16px]" onClick={() => handleSearchClick()}>
                                    <img src={search} alt="search" className="w-[15px] h-[15px] object-contain" />
                                </div>
                                <input type="text" placeholder="Search a Campaign" className="flex w-[220px] font-epilogue font-normal text-[16px] placeholder:text-[#ffffff] bg-transparent text-[#ffffff] outline-none ml-[15px]" value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <button onClick={naviateToStoreVip} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>Home</button>
                            <button onClick={handleHomeClick} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>Blog</button>
                            {address ? (<button onClick={naviateToMyCampaigns} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>My Campaigns</button>) : (<></>)}
                            <button onClick={naviateToVip} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>VIP</button>
                            <button onClick={naviateToAdmin} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>Dashboard</button>
                            <button onClick={naviateToCreateCampaign} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>Create Campaign</button>
                            <button onClick={naviateToAllCampaigns} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>All Campaigns</button>
                            <button onClick={naviateToNFTs} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>My NFTs</button>
                        </div>
                    </div>
                    <div className='mr-[20px] py-[5px] my-auto'>
                        <ConnectButton
                            className={'!z-[100000000001]'}
                            client={client}
                            wallets={wallets}
                            theme={"dark"}
                            connectButton={{ label: "Connect" }}
                            connectModal={{
                                size: "wide",
                                title: "UltraShop",
                                titleIcon: logoOfWebsite,
                                welcomeScreen: {
                                    title: "UltraShop",
                                    subtitle:
                                        "Contribute to businesses anonymously and get shares in return and dividends. Launch your biz website and a stock just like in the stock market!\n",
                                    img: {
                                        src: logoOfWebsite,
                                        width: 150,
                                        height: 150,
                                    },
                                },
                                termsOfServiceUrl: "https://ultrashop.tech/terms",
                                privacyPolicyUrl: "https://ultrashop.tech/privacy-policy",
                                showThirdwebBranding: true,
                            }}
                            supportedTokens={allSupportedTokens}
                            accountAbstraction={{
                                sponsorGas: true,
                                chain: base,
                                gasless: true,
                                factoryAddress: '0x54164f8b6e7f8e3584cc6d7e15d54297ec0fa6e3',
                            }}
                            detailsButton={{
                                displayBalanceToken: {
                                    [Base.chainId]: import.meta.env.VITE_DEAL_COIN_ADDRESS,
                                },
                            }}
                            chain={base}
                            chains ={[base]}
                            switchButton={{
                                label: "Switch Network",
                                className: "my-custom-class",
                                style: {
                                    backgroundColor: "yellow",
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Header