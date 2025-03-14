import React, { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import {logoOfWebsite, IL,search,tetherusdtlogo,Aicon,usdcoinusdclogo,AAPL} from '../assets'
import { Search } from "./"
import { ConnectWallet,useLogin,useTokenBalance,} from '@thirdweb-dev/react';
import {
    ConnectButton
  } from "thirdweb/react";
  import {
    createWallet,
    walletConnect,
    inAppWallet,
  } from "thirdweb/wallets";
import { Base } from "@thirdweb-dev/chains";
import { useStateContext } from '../context';
import { createThirdwebClient,defineChain } from "thirdweb";
   
    
const Header = () => {
    const base = defineChain({
        id: 8453,
      });
    const wallets = [
        createWallet("io.metamask"),
        createWallet("com.coinbase.wallet"),
        walletConnect(),
        createWallet("com.trustwallet.app"),
        createWallet("io.zerion.wallet"),
      ];
    const client = createThirdwebClient({ clientId: import.meta.env.VITE_THIRDWEB_CLIENT });
    const { address,getAllStoreOwners,storeRegistery } = useStateContext();
    const [storeOwners, setStoreOwners] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [amountForApprove, setAmountForApprove] = useState();
  const [toggleApproveCoins, setToggleApproveCoins] = useState(false);
  const handleApprove = async () => {
    setIsLoading(true);
    if(await setApproval(amountForApprove*1e18)) {
    setIsLoading(false);
    refreshPage();} else {
        setIsLoading(false);
        alert('Approval failed, kindly contact support');
    }
}   


useEffect(() => {
  async function getStoreOwners () {
    const data = await getAllStoreOwners();
    setStoreOwners(data.map(owner => owner.toLowerCase()))
  }

  if(address&&storeRegistery) {
    getStoreOwners();
  }

}, [address,storeRegistery]);

  
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
            uri: "https://www.ultimateDeal.net",
            statement: "Kindly read our terms of service, by continue you agree to it.",
            chainId: "8453",
            nonce: "1",
            version: "1",
            resources: ["https://www.ultimateDeal.net/terms", "https://www.ultimateDeal.net/privacy-policy"],
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


    <div className={`drop-shadow w-full relative linear-gradient1 border-b-[1px] border-[#FFDD00] pb-[20px] fixed-header ${address?('h-[75px]'):('h-[75px]')}`}>
        <div className='flex py-[5px]'>
            <div className='flex cursor-pointer' onClick={() => naviateToStoreVip()}>
            <img src={logoOfWebsite} alt='logo' className='w-[50px] h-[50px] object-contain my-auto mx-[10px]'/>
                <h1 className='text-white font-epilogue font-semibold text-[18px] my-auto'>Ultimate</h1>
                <h1 className='text-[#FFDD00] font-epilogue font-semibold text-[18px] my-auto'>DeAl</h1>
                </div>
                
            <div className='flex items-center justify-between h-full my-auto m-auto max-w-[1280px]'>
                <div className='textcolor flex items-center gap-5'>
                    <div className="lg:flex-1  bg-[#000000] flex flex-row pr-2 h-[52px] bg-transparent border-[1px] border-[#525252] duration-500 ease-in-out hover:border-[#FFFFFF] rounded-[15px]">
                        <div className=" w-[50px] h-full rounded-[2px] bg-transparent flex justify-center items-center cursor-pointer  duration-500 ease-in-out rounded-[16px]"  onClick={() => handleSearchClick()}>
                            <img src={search} alt="search" className="w-[15px] h-[15px] object-contain"/>
                        </div>
                            <input type="text" placeholder="Search a Campaign" className="flex w-[220px] font-epilogue font-normal text-[16px] placeholder:text-[#ffffff] bg-transparent text-[#ffffff] outline-none ml-[15px]" value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button onClick={naviateToStoreVip} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>Home</button>
                    <button onClick={handleHomeClick} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>Blog</button>
                    {address ? (<button onClick={naviateToMyCampaigns} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>My Campaigns</button>):(<></>)}
                    <button onClick={naviateToVip} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>VIP</button>
                <button onClick={naviateToAdmin} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>Dashboard</button>
                    <button onClick={naviateToCreateCampaign} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>Create Campaign</button>
                    <button onClick={naviateToAllCampaigns} className='hover:text-[#FFFFFF] duration-500 ease-in-out font-epilogue font-semibold text-[14px]'>All Campaigns</button>
                    
                </div>
            </div>
            <div className='mr-[20px] py-[5px] my-auto'>
            <ConnectButton
              className = {'!z-[100000000001]'}
              client={client}
              wallets={wallets}

              theme={"dark"}

              connectButton={{ label: "Connect" }}

              connectModal={{

              size: "wide",

              title: "UltimateDeal",

              titleIcon: logoOfWebsite,

              welcomeScreen: {

              title: "UltimateDeal",

              subtitle:

              "Contribute to businesses anonymously and get shares in return and dividends. Launch your biz website and a stock just like in the stock market!\n",

              img: {

              src: logoOfWebsite,

              width: 150,

              height: 150,

              },

              },

              termsOfServiceUrl: "https://ultimateDeal.net/terms",

              privacyPolicyUrl: "https://ultimateDeal.net/privacy-policy",

              showThirdwebBranding: true,

              }}

              supportedTokens={{

              [Base.chainId]: [
                  // {

                  //   address: import.meta.env.VITE_AAPL, // token contract address
      
                  //   name: "Apple",
      
                  //   symbol: "AAPL",
      
                  //   icon: AAPL,
      
                  //   },
              {

                address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", // token contract address
  
                name: "USDT",
  
                symbol: "USDT",
  
                icon: usdcoinusdclogo,
  
                },
                {

                  address: "0x231aaC71b05e8D5C12AE7a03148a3c2BBBa66530", // token contract address
    
                  name: "UltimateDeAl",
    
                  symbol: "ULTI",
    
                  icon: logoOfWebsite,
    
                  },

              ],

              }}

              detailsButton={{

              displayBalanceToken: {

              [Base.chainId]: import.meta.env.VITE_DEAL_COIN_ADDRESS,

              },

              }}

              chain={base}

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