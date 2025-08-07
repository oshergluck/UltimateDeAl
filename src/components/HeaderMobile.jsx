import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import {logoOfWebsite, search, menu, tetherusdtlogo, IL, Aicon, usdcoinusdclogo, WethLogo} from '../assets'
import { Search } from "./"
import { ConnectWallet, useLogin, useTokenBalance} from '@thirdweb-dev/react';
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

const HeaderMobile = () => {
  const [campaigns, setCampaigns] = useState([]);
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
        // enable gasless transactions for the wallet
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
    const { address, getAllStoreOwners, storeRegistery, Blockchain, CrowdFunding } = useStateContext();
    const [storeOwners, setStoreOwners] = useState([]);
    const [toggleMenu, setToggleMenu] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dynamicTokens, setDynamicTokens] = useState([]);
    const [tokensLoading, setTokensLoading] = useState(false);

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

    useEffect(() => {
      async function getStoreOwners () {
        const data = await getAllStoreOwners();
        setStoreOwners(data.map(owner => owner.toLowerCase()))
      }
    
      if(address && storeRegistery) {
        getStoreOwners();
      }
    
    }, [address, storeRegistery]);

    // Fetch ERCUltra tokens when component mounts or when Blockchain changes
    useEffect(() => {
        fetchERCUltraTokens();
    }, [Blockchain]);

    // Combine static and dynamic tokens
    const allSupportedTokens = {
        [Base.chainId]: deduplicateTokens([...staticTokens, ...dynamicTokens])
    };

    const handleHomeClick = () => {
        navigate('/blog');
    };

    const handleSearchClick = () => {
        setCampaigns([]);
        setToggleMenu(prev => !prev)
        navigate(`/search/${searchTerm}`); 
    };

    const naviateToMyCampaigns = () => {
        setToggleMenu(prev => !prev);
        navigate('/my-campaigns');
    }
    const naviateToAllCampaigns = () => {
        setToggleMenu(prev => !prev);
        navigate('/all-campaigns');
    }
    const naviateToCreateCampaign = () => {
        setToggleMenu(prev => !prev);
        navigate('/create-campaign');
    }
    const naviateToVip = () => {
        setToggleMenu(prev => !prev);
        navigate('/register-vip');
    }
    const naviateToBlog = () => {
        setToggleMenu(prev => !prev);
        navigate('/blog');
    }
    const naviateToAdmin = () => {
        setToggleMenu(prev => !prev);
        navigate('/dashboard');
    }
    const naviateToStoreVip = () => {
        setToggleMenu(prev => !prev);
        navigate('/');
    }

    const naviateToNFTs = () => {
        setToggleMenu(prev => !prev);
        navigate('/nfts');
    }
    const navigateToMiner = () => {
        navigate('/miner');
    }
    const navigate = useNavigate();
    async function handleLogin() {
        try {
            await login({
                uri: "https://www.ultrashop.tech",
                statement: "Kindly read our terms of service, by continue you agree to it.",
                chainId: "8453",
                nonce: "272",
                version: "1.0.3",
                resources: ["https://www.ultrashop.tech/terms", "https://www.ultrashop.tech/privacy-policy"],
            });
        } catch (err) {
            console.error(err);
        }
    }

    // Icons as inline SVGs (replace with your preferred icon library)
    const HomeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    );

    const BlogIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
    );

    const AllCampaignsIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
    );

    const CreateCampaignIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
    );

    const MyCampaignsIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
    );

    const VIPIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    );

    const DashboardIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    );

    const MyNFTsIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            <rect x="2" y="3" width="6" height="6" rx="1" stroke="white" strokeWidth={2} fill="none" />
            <rect x="16" y="3" width="6" height="6" rx="1" stroke="white" strokeWidth={2} fill="none" />
            <rect x="2" y="15" width="6" height="6" rx="1" stroke="white" strokeWidth={2} fill="none" />
        </svg>
    );

    return (
        <>
        <div className={`drop-shadow fixed-header ${address ? ('h-[87px]') : ('h-[75px]')}`}>

            <div className='w-full relative linear-gradient1 h-[110px]'>
                <div className='flex py-[5px]'>

                    <div className='flex cursor-pointer' onClick={() => naviateToStoreVip()}>
                        <img src={logoOfWebsite} alt='logo' className='w-[35px] h-[35px] object-contain my-auto mx-[10px]'/>
                        <h1 className='text-white font-epilogue font-semibold text-[18px] my-auto'>Ultra</h1>
                        <h1 className='text-[#FFDD00] font-epilogue font-semibold text-[18px] my-auto'>Shop</h1>
                    </div>
                    
                    <div className='flex flex-1 !w-[35px] !h-[35px] justify justify-end self-end'>
                        <img src={menu} alt='menu' className='w-[35px] h-[35px] relative z-9 object-contain my-auto mx-[10px]' onClick={() => setToggleMenu(prev => !prev)}/>
                        <div className={` h-[844px] absolute inset-0 sm:w-[20%] mx-auto flex items-center justify-center linear-gradient z-10 drop-shadow py-4 transition-all duration-700 ${toggleMenu ? 'translate-y-0' : '-translate-y-full'}`}>
                
                
                        <div className='w-full mt-[-430px]'>
                            <p className={`text-[#FFFFFF] font-epilogue font-bold text-[30px] text-center absolute top-3 right-2 cursor-pointer`} onClick={() => setToggleMenu(prev => !prev)}>X</p>
                            <div className="lg:flex-1 ml-[20px] flex flex-row pr-2 h-[52px] bg-transparent border-[1px] border-[#525252] duration-500 ease-in-out hover:border-[#FFFFFF] rounded-[5px] w-10/12">
                                <div className="w-[50px] h-full rounded-[2px] flex justify-center items-center cursor-pointer duration-500 ease-in-out bg-[#FFFFFF] bg-opacity-[25%]" onClick={() => handleSearchClick()}>
                                    <img src={search} alt="search" className="w-[15px] h-[15px] object-contain"/>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Search a Campaign" 
                                    className="flex w-[220px] font-epilogue font-normal text-[16px] placeholder:text-[#FFFFFF] text-[#FFFFFF] bg-transparent outline-none ml-[15px]" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                            
                            {/* Home Button with Icon */}
                            <div className='w-full mt-[15px] h-[42px] hover:bg-[#FFFFFF] hover:bg-opacity-[25%] duration-500 ease-in-out'>
                                <div onClick={() => naviateToStoreVip()} className='ml-[20px] flex items-center py-[15px] cursor-pointer'>
                                    <HomeIcon />
                                    <h2 className='text-[#FFFFFF] font-epilogue text-left font-semibold text-[24px] ml-3'>Home Page</h2>
                                </div>
                            </div>
                            {/*My NFTs*/}
                            <div className='w-full h-[42px] hover:bg-[#FFFFFF] hover:bg-opacity-[25%] duration-500 ease-in-out'>
                                <div onClick={() => naviateToNFTs()} className='ml-[20px] flex items-center py-[15px] cursor-pointer'>
                                    <MyNFTsIcon />
                                    <h2 className='text-[#FFFFFF] font-epilogue text-left font-semibold text-[24px] ml-3'>My NFTs</h2>
                                </div>
                            </div>
                            
                            {/* Blog Button with Icon */}
                            <div className='w-full h-[42px] hover:bg-[#FFFFFF] hover:bg-opacity-[25%] duration-500 ease-in-out'>
                                <div onClick={naviateToBlog} className='ml-[20px] flex items-center py-[15px] cursor-pointer'>
                                    <BlogIcon />
                                    <h2 className='text-[#FFFFFF] font-epilogue text-left font-semibold text-[24px] ml-3'>Blog</h2>
                                </div>
                            </div>
                            
                            {/* All Campaigns Button with Icon */}
                            <div className='w-full h-[42px] hover:bg-[#FFFFFF] hover:bg-opacity-[25%] duration-500 ease-in-out'>
                                <div onClick={naviateToAllCampaigns} className='ml-[20px] flex items-center py-[15px] cursor-pointer'>
                                    <AllCampaignsIcon />
                                    <h2 className='text-[#FFFFFF] block duration-500 text-left font-epilogue font-semibold text-[24px] ml-3'>All Campaigns</h2>
                                </div>
                            </div>
                            
                            {/* Create Campaign Button with Icon */}
                            <div className='w-full h-[42px] hover:bg-[#FFFFFF] hover:bg-opacity-[25%] duration-500 ease-in-out'>
                                <div onClick={naviateToCreateCampaign} className='ml-[20px] flex items-center py-[15px] cursor-pointer'>
                                    <CreateCampaignIcon />
                                    <h2 className='text-[#FFFFFF] block text-left font-epilogue font-semibold text-[24px] ml-3'>Create Campaign</h2>
                                </div>
                            </div>
                            
                            {/* My Campaigns Button with Icon (only if address exists) */}
                            {address && (
                                <div className='w-full h-[42px] hover:bg-[#FFFFFF] hover:bg-opacity-[25%] duration-500 ease-in-out'>
                                    <div onClick={naviateToMyCampaigns} className='ml-[20px] flex items-center py-[15px] cursor-pointer'>
                                        <MyCampaignsIcon />
                                        <h2 className='text-[#FFFFFF] block text-left font-epilogue font-semibold text-[24px] ml-3'>My Campaigns</h2>
                                    </div>
                                </div>
                            )}
                            
                            {/* VIP Button with Icon */}
                            <div className='w-full h-[42px] hover:bg-[#FFFFFF] hover:bg-opacity-[25%] duration-500 ease-in-out'>
                                <div onClick={naviateToVip} className='ml-[20px] flex items-center py-[15px] cursor-pointer'>
                                    <VIPIcon />
                                    <h2 className='text-[#FFFFFF] block text-left font-epilogue font-semibold text-[24px] ml-3'>VIP</h2>
                                </div>
                            </div>
                            
                            {/* Dashboard Button with Icon */}
                            <div className='w-full h-[42px] hover:bg-[#FFFFFF] hover:bg-opacity-[25%] duration-500 ease-in-out'>
                                <div onClick={naviateToAdmin} className='ml-[20px] flex items-center py-[15px] cursor-pointer'>
                                    <DashboardIcon />
                                    <h2 className='text-[#FFFFFF] block text-left font-epilogue font-semibold text-[24px] ml-3'>Dashboard</h2>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
                <div className='flex justify-center items-center mx-auto'>
                    <ConnectButton
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
                                subtitle: "Make your first step to the journey of your life. Contribute to businesses anonymously and get shares in return and dividends. Open a Crowdfunding campaign and issue your business shares to the public. Get started by connecting your wallet.",
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
                        detailsButton={{
                            displayBalanceToken: {
                                [Base.chainId]: import.meta.env.VITE_DEAL_COIN_ADDRESS,
                            },
                        }}
                        chain={base}
                        chains={[base]}
                        switchButton={{
                            label: "Switch Network",
                            className: "my-custom-class",
                            style: {
                                backgroundColor: "red",
                            },
                        }}
                        accountAbstraction={{
                            sponsorGas:true,
                            chain: base,
                            gasless: true,
                            factoryAddress : '0x54164f8b6e7f8e3584cc6d7e15d54297ec0fa6e3',
                           }}
                    />
                </div>
            </div>
        </div>
        </>
    )
}

export default HeaderMobile