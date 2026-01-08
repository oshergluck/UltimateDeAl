import React, { useState, useEffect , useCallback} from 'react'
import { useLocation, useNavigate, useParams  } from 'react-router-dom';
import { useStateContext } from '../context';
import { VerifiedIcon,loader ,copylink,email, done_desktop,dis_mobile,done_mobile,dis_desktop,usdcoinusdclogo,logoOfWebsite} from '../assets'
import {Loader,FormField,Investors,CustomButton,Featured,FeaturedMobile,Swapper, IPFSMediaViewer} from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';
import { Base } from "@thirdweb-dev/chains";
import {fontSizes} from '../components/AccessibilityMenu';
import {TelegramShare} from 'react-share-kit';
import copy from 'clipboard-copy';
import { useMediaQuery } from 'react-responsive';
import { prepareContractCall,createThirdwebClient,defineChain, getContract } from 'thirdweb';
import {TransactionButton,ConnectButton,useReadContract} from 'thirdweb/react';
import { useContract } from '@thirdweb-dev/react';
import {ethers} from 'ethers';
import {
  createWallet,
  walletConnect,
  inAppWallet,
} from "thirdweb/wallets";
import { PinataSDK } from "pinata";

const CampaignDetails = () => {
  const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
    const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`
    
  const formatNumberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const pinata = new PinataSDK({
    pinataJwt: import.meta.env.VITE_PINATA_JWT,
    pinataGateway: "bronze-sticky-guanaco-654.mypinata.cloud",
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const UploadAnimation = ({ progress, isUploading, file, type }) => (
    <div className="mb-4 p-4 border border-gray-600 rounded-lg bg-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium">
          {type === 'video' ? 'Video' : 'Image'} Upload
        </span>
        {isUploading && (
          <span className="text-yellow-400 text-sm">
            Uploading... {progress}%
          </span>
        )}
        {!isUploading && profilePic && (
          <span className="text-green-400 text-sm">✓ Uploaded</span>
        )}
      </div>
      
      {file && (
        <div className="text-gray-300 text-sm mb-2">
          File: {file.name}
        </div>
      )}
      
      {isUploading && (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      
      {!isUploading && profilePic && (
        <div className="text-green-400 text-sm break-all">
          CID: {profilePic}
        </div>
      )}
    </div>
  );
  const handleImageUpload = async (file) => {
    if (!file) return;
    
    setIsUploadingImage(true);
    setImageUploadProgress(0);
    setSelectedImageFile(file);

    try {
      const upload = await pinata.upload.file(file, {
        onProgress: (progress) => {
          const percent = Math.round((progress.bytes / progress.totalBytes) * 100);
          setImageUploadProgress(percent);
        }
      });
      
      setProfilePic(upload.IpfsHash);
      console.log('Image uploaded to IPFS:', upload.IpfsHash);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      setImageUploadProgress(0);
    }
  };
  const base = defineChain({
    id: 8453,
  });
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
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    walletConnect(),
    createWallet("com.trustwallet.app"),
    createWallet("io.zerion.wallet"),
  ];
  const client = createThirdwebClient({clientId:import.meta.env.VITE_THIRDWEB_CLIENT});
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const navigate = useNavigate();
  const { donate, getDonations,USDTForFundraising,getRewardAddress,CrowdFunding1,getSymbol,getRewardPrice,ReportCampaign,DEALContract,CrowdFunding,HexToInteger, address, withdrawDonationAfterEndTime,report,getThisCampaign,connect,setApproval,refreshPage,isconnected,setAprroval} = useStateContext();
  let campaignId = parseInt(window.location.pathname.split('/')[2]); 
  //if (!state) {navigate("/campaign-details/"+campaignId)}
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [investors, setInvestors] = useState([]);
  const [total, setTotal] = useState();
  const [campaign, setCampaign] = useState();
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [toggleDrawer1, setToggleDrawer] = useState(true);
  const [toggleDrawerFunding, setToggleDrawerFunding] = useState(true);
  const [amountForApprove, setAmountForApprove] = useState();
  const [toggleApproveCoins, setToggleApproveCoins] = useState(false);
  const [symbol,setSymbol] = useState('');
  const [rewardPrice,setRewardPrice] = useState(0);
  const [rewardAddress,setRewardAddress] = useState('');
  const [min,setMin] = useState();
  const [totalSupply,setTotalSupply] = useState('');
  const {contract:rewardContract} = useContract(rewardAddress);
  
  
  

  const url = window.location.href;
  useEffect(() => {
    async function fetchRewards() {
      const data = await getSymbol(campaignId);
      setSymbol(data);
      const data1 = await getRewardPrice(campaignId);
      setRewardPrice(data1);
      
      console.log(data1);
      const data2 = await getRewardAddress(campaignId);
    setRewardAddress(data2);
      
    }

    async function fetchTotalSupply() {
      try {
        const data5 = await rewardContract.call('totalSupply');
        const data6 = data5._hex;
        const data7 = await rewardContract.call('decimals');
        
        // Convert hex to integer, then divide by 10^decimals
        const totalSupplyInteger = HexToInteger(data6);
        const totalSupplyFormatted = totalSupplyInteger / (10 ** data7);
        
        setTotalSupply(totalSupplyFormatted);
        console.log(data5);
      } catch (error) {
        console.error('Error fetching total supply:', error);
      }
    }

    async function fetchCampaignDetails() {

      if (CrowdFunding&&CrowdFunding1) {
            const fetchedCampaign = await getThisCampaign(campaignId);
            if (fetchedCampaign) {
                setCampaign(fetchedCampaign);
                console.log(fetchedCampaign)
                const data = await fetchInvestors();
                setInvestors(data);
                setIsLoading(false);
                return;
            }
        }
    }
    async function fetchTotalDonations () {
      const data = await getDonations(campaignId);
      if(data)
       setTotal(HexToInteger(data.totalDonations._hex));
      
     }
     if(CrowdFunding) {
      fetchTotalDonations();
      fetchCampaignDetails();
      fetchRewards();
      
     }
     if (rewardContract) {
      fetchTotalSupply();
     }
     document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
}, [campaignId, CrowdFunding,rewardContract]);

function extractNumberFromString(str) {
  const matches = str.match(/(\d+(\.\d+)?)/);
  return matches ? parseFloat(matches[0]) : 0;
}

const handleAmountChange = (e) => {
    setAmount(e.target.value);
}
const handleName = (e) => {
  setName(e.target.value);
}
const handleProfilePic = (e) => {
  setProfilePic(e.target.value);
}

const handleCommentChange = (e) => {
    setComment(e.target.value);
}


  const remainingDays = daysLeft((campaign?.endDate));



  function renderDescriptionWithBreaks(description) {
    if (!description) return <p>No description provided.</p>;

    const processText = (text) => {
      const sanitizedText = text.replace(/[\s\uFEFF\xA0]+/g, ' ');
        const nodes = [];
        let currentText = '';
        let styles = [];

        for (let i = 0; i < sanitizedText.length; i++) {
          const char = sanitizedText[i];
  
          if (char === '~' || char === '*' || char === '^' || char === '$') {
              if (currentText) {
                  nodes.push({ text: currentText, styles: [...styles] });
                  currentText = '';
              }
              const styleIndex = styles.indexOf(char);
              if (styleIndex > -1) {
                  styles.splice(styleIndex, 1);
              } else {
                  styles.push(char);
              }
              continue;
          }
  
          currentText += char;
      }

      if (currentText) {
        nodes.push({ text: currentText, styles: [...styles] });
    }

    return nodes.map((node, index) => {
      let element = <span key={index}>{node.text}</span>;
  
      node.styles.forEach(style => {
          const defaultFontSizeIndex = fontSizes.indexOf('sm');
          const defaultSize = fontSizes[defaultFontSizeIndex-7];
  
          switch (style) {
              case '~':
                  element = <span key={index} className={`!text-[#FFDD00] text-${defaultSize}`}>{element}</span>;
                  break;
              case '*':
                  element = <strong key={index} className={`text-${defaultSize}`}>{element}</strong>;
                  break;
              case '$':
                  element = <span key={index} className={`text-center block my-[10px] text-${defaultSize}`}>{element}</span>;
                  break;
              case '^':
                  const fontSizeIndex = fontSizes.indexOf('sm') + 4;
                  const size = fontSizes[fontSizeIndex];
                  element = <span key={index} className={`text-${size}`}>{element}</span>;
                  break;
              default:
                  element = <span key={index} className={`text-${defaultSize}`}>{element}</span>;
                  break;
          }
      });
  
      return element;
  });
  
  
    };

    const lines = description.split('\n').map((line, index) => (
        <div key={index} className="whitespace-pre-wrap">
            {processText(line)}
        </div>
    ));

    return (
        <div className="font-epilogue text-[#FFFFFF]">
            {lines}
        </div>
    );
}


  const fetchInvestors = async () => {
    setIsLoading(true);
    const data = await getDonations((campaignId));
    return data;
  }


  const handleDonate = async () => {
    setIsLoading(true);
    try{
    if(await donate(campaignId,comment, amount*1e6,profilePic,name )) {
    setIsLoading(false);
    refreshPage();} else {
      setIsLoading(false);
      alert('Investment failed, kindly contact support');
    }
} catch (error) {
    setIsLoading(false);
    alert('Investment failed, kindly contact support');
}
    
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard'); // Optionally handle a success case
    } catch (error) {
      console.error('Failed to copy text: ', error);
      alert('Failed to copy text'); // Optionally handle an error case
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    if(await setApproval(amountForApprove*1e6)) {
    setIsLoading(false);} 
    else {
        setIsLoading(false);
        alert('Approval failed, kindly contact support');
    }
}

  const withdrawDonation = async () => {
    setIsLoading(true);
    try{
    await withdrawDonationAfterEndTime(campaignId); 
    navigate('/profile')
    setIsLoading(false);
} catch (error) {
    setIsLoading(false);
    alert('Withdraw failed, kindly contact support');
}
  }

  const handleClickOnApprove = () => {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

    setTimeout(() => {
      setToggleApproveCoins(prev => !prev);
    }, 500);
};

  const handleNavigateEdit = (campaign) => {
    navigate(`/edit-campaign/${campaign?.pId}`);
  };

  const reportCampaign = async () => {
    await ReportCampaign(campaignId)
  }
  if(isLoading) return (
  <div className='min-h-[1000px]'>
  <Loader />
  </div>
  
  );

  return (
    <>{isLoading && <Loader />}
    <div className=''>
    <div className="mx-auto">
        {isMobile ? <FeaturedMobile /> : <Featured/>}
        </div>
        </div>
{isMobile ? (<><div className={`rounded-[15px] h-[280px] absolute inset-0 sm:w-[20%] mx-auto flex items-center justify-center border-[1px] border-[#FFDD00] bg-[#000000] z-10 drop-shadow py-4 transition-all duration-700 ${toggleApproveCoins ? 'translate-y-[2600px]' : '-translate-y-full'}`}>
  <p className={`text-[#FFFFFF] font-epilogue font-bold text-[30px] text-center absolute bottom-1 right-2 cursor-pointer`} onClick={() => setToggleApproveCoins(prev => !prev)}>X</p>
  <div>
    <p className="text-[#FFFFFF] font-epilogue font-bold text-[16px] text-center mt-[25px] drop-shadow">Approve $USDC For Fundraising</p>
    <div className='w-full flex flex-col items-center'>
      <div className='mt-[20px] w-10/12'>
        <input
          className="rounded-[2px] w-full max-h-[53px] p-5 !rounded-[6px] bg-[#424242]"
          type="number"
          placeholder="Amount For Approval"
          value={amountForApprove}
          onChange={e => setAmountForApprove(e.target.value)}
        />
      </div>
      <div className='w-10/12 mt-[20px]'>
        
      </div>
    </div>
  </div>
</div>



        {campaign?.websiteComment === "Refunded because of illegal activity" ? (
        <video className=' w-full rounded-[15px] my-[50px]' controls>
           </video>
         ) : (<>
         {campaign?.videoLinkFromPinata && (<IPFSMediaViewer
        ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign?.videoLinkFromPinata}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
        className={'w-full rounded-[15px] my-[50px]'}/>)}
        
        </>
        )}
        <div className="relative w-10/12 mx-auto h-[5px] mt-2 rounded-xl" >
          {campaign?.iscashedout==false ? (
            <>
            <div className="absolute relative h-full bg-[#fc941c] rounded-xl" style={{ width: `${calculateBarPercentage(campaign?.target*1e-6, total*1e-6)}%`, maxWidth: '100%'}}>
            <p className='absolute text-[#fc941c] top-[-25px] right-[0]'>{calculateBarPercentage(campaign?.target*1e-6, total*1e-6)+'%'}</p>
            </div>
            </>
          ) : (
            <div className="absolute h-full bg-[#fc941c] rounded-xl relative" style={{ width: `${calculateBarPercentage(campaign?.target*1e-6, parseFloat(extractNumberFromString(campaign?.websiteComment)))}%`, maxWidth: '100%'}}>
            <p className='absolute text-[#fc941c] top-[-25px] right-[0]'>{calculateBarPercentage(campaign?.target*1e-6, parseFloat(extractNumberFromString(campaign?.websiteComment)))+'%'}</p>
            </div>
          )}
          </div>
            <div className='flex w-full justify-between mt-[30px] gap-[40px] overflow-auto touch-auto px-[20px]'>
            <div>
{campaign?.iscashedout ? (<h2 className='text-[#fc941c] text-center w-full mx-auto text-[20px] font-bold'>{parseFloat(extractNumberFromString(campaign?.websiteComment))} USDC</h2>):(<><h2 className='text-[#fc941c] w-full mx-auto text-center text-[20px] font-bold'>{(total*1e-6).toFixed(1)} USDC</h2></>)}
            <h2 className='text-[#FFFFFF] !w-full text-[12px] text-center'>{formatNumberWithCommas(campaign?.target*1e-6)}USDC</h2>
            </div>
            <div>
            <h2 className='text-[#FFFFFF] text-center text-[20px] font-bold'>{remainingDays}</h2>
            <h2 className='text-[#FFFFFF] text-[12px] text-center'>Days left</h2>
            </div>
            <div>
            <h2 className='text-[#FFDD00] text-center text-[20px] w-[120px] font-bold'>{(1/(rewardPrice/1e6)).toFixed(5)} {symbol}</h2>
            <h2 className='text-[#FFFFFF] text-[12px] w-[80px] mx-auto text-center'>Reward Per USDC</h2>
            </div>
            <div>
            <h2 className='text-[#FFFFFF] text-center text-[20px] font-bold'>{investors?.comments ? (investors.comments.length) : ('0') }</h2>
            <h2 className='text-[#FFFFFF] text-[12px] text-center'>Supporters</h2>
            </div>
            <div>
            <h2 className='text-[#fc941c] text-center text-[20px] font-bold'>{campaign?.iscashedout ?('Yes'):('Runing')}</h2>
            <h2 className='text-[#FFFFFF] text-[12px] text-center'>Done?</h2>
            </div>
            <div>
            <h2 className='text-[#fc941c] text-center text-[20px] font-bold'>{formatNumberWithCommas(totalSupply)}</h2>
            <h2 className='text-[#FFFFFF] text-[12px] text-center'>Total Supply</h2>
            </div>
            <div className='items-center justify-center'>
            {campaign?.isCheckedByWebsite&&!campaign?.iscashedout ? (<img src={VerifiedIcon} className='w-[32px] h-[32px] mx-auto'/>):(<></>)}
                {!campaign?.isCheckedByWebsite&&(campaign?.iscashedout==false)&&campaign?.videoLinkFromPinata!=='X' ? (<img src={loader} className='w-[32px] h-[32px] mx-auto'/>):(<></>)}
                {campaign?.iscashedout ? (<img src={done_desktop} className='w-[32px] h-[32px] mx-auto'/>):(<></>)}
                {campaign?.videoLinkFromPinata==='X' ? (<img src={dis_desktop} className='w-[32px] h-[32px] mx-auto'/>):(<></>)}
            <h2 className='text-[#FFFFFF] text-[12px] text-center'>Verified?</h2>
            </div>
            </div>

            <div className='mt-[10px]  rounded-[13px] overflow-auto touch-auto'>
                <div className='w-full sm:ml-[20px] mt-[10px]'>
                <div>
                    <div className='pt-[30px]'>
                <h3 className='text-white text-center w-7/12 font-epilogue font-semibold text-[12px] py-[5px] px-[20px] rounded-[7px] border-[#FFFFFF] border-[1px]'>{campaign?.category}</h3>
                {campaign?.owner===address ? (<button className='flex-end w-7/12 min-h-[20px] text-[#000000] mr-[30px] bg-[#FFDD00] rounded-[5px] opacity-[60%] hover:opacity-[100%] duration-500 ease-in-out font-semibold mt-[20px] py-[20px]' onClick={() => handleNavigateEdit(campaign)}>Edit Campaign</button>):(<></>)}
                </div>
                <h1 className='text-[#FFDD00] font-epilogue font-bold text-[30px] py-[5px] px-[20px] mt-[20px] leading-relaxed'>{campaign?.title}</h1>
                <div className='my-[20px] sm:mx-[30px] ml-[10px]'>
                <span className='text-[#FFFFFF] text-[14px] truncate'>{renderDescriptionWithBreaks(campaign?.description)}</span>
                
                </div>
                {campaign?.iscashedout ? (<>
                <div className='my-[35px] mx-[20px] rounded-[15px]'>
                <div class="bg-gray-900 mx-auto sm:w-11/12 w-full rounded-lg shadow-lg py-[20px]">
                  <p className='text-[12px] !text-white font-bold text-center sm:text-[30px]'>
                  {symbol} address is {rewardAddress}
                </p>
</div>
<Swapper ERCUltraAddress={rewardAddress} SYMBOL={symbol}/>
                </div>
                   <div className='sm:flex sm:justify-items-center m-auto sm:items-center h-[720px] rounded-[15px] sm:w-11/12 w-full'>
                   <iframe className='rounded-[15px] h-[720px] mx-auto sm:w-[9/10] w-full' id="geckoterminal-embed" title="GeckoTerminal Embed" src={`https://www.geckoterminal.com/base/tokens/${rewardAddress}?embed=1&info=0&swaps=1`} frameborder="0" allow="clipboard-write" allowfullscreen></iframe>
                   </div>
                   </> ):(<></>)}
                </div>
                </div>
                <div className={!address ? 'w-full':'w-full mt-[30px]'}>
                    {!address ? (<p className='text-[#fc941c] font-epilogue font-semibold text-[12px] py-[5px] px-[20px]'>Only connected members with fee for gas in the wallet can invest, log in at the top</p>
                    )
                    :
                    (<div className='h-[40px] mb-[20px] w-[75%] mx-[auto] !text-[16px]'>
                     </div>)}
                    
                    {campaign?.isCheckedByWebsite?(
                      <>
                      {address?(<div className={`w-full min-h-[780px] ${campaign?.iscashedout? ('hidden'):('block')} rounded-[10px] border-[1px] bg-[#000000] border-[#FFDD00]`} >
                        <div className='mb-[10px] mt-[35px] w-[85%] mx-[auto] !text-[14px]'>
                          {campaign? (<>
                            <FormField
                        labelName='Amount Of USDC to invest'
                        placeholder={`Minimum Amount ` + HexToInteger(campaign?.minimum._hex)/1e6.toFixed(2)+'$'}
                        inputType='number'
                        value={amount}
                        handleChange={handleAmountChange}
                        /></>):(<></>)}
                        
                        
                        </div>
                        <div className='justify-center flex'>
                        <TransactionButton
                    className={"!mb-[15px] !mx-auto !justify-center !bg-orange-500 !hover:bg-orange-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out"}
                    transaction={() => {
                      // Create a transaction object and return it
                      const tx = prepareContractCall({
                        contract:USDTForFundraising,
                        method: "function approve(address spender, uint256 amount)",
                        params: [import.meta.env.VITE_CROWDFUNDING,amount*1e6 ],
                        value: 0,
                      });
                      return tx;
                    }}
                    onTransactionSent={(result) => {
                      console.log("Transaction submitted", result.transactionHash);
                    }}
                    onTransactionConfirmed={(receipt) => {
                      console.log("Transaction confirmed", receipt.transactionHash);
                    }}
                    onError={(error) => {
                      console.error("Transaction error", error);
                    }}
                  >
                    Approve
                  </TransactionButton>
                        </div>
                        <div className='mb-[10px] mt-[35px] w-[85%] mx-[auto] !text-[14px]'>
                        <FormField
                        labelName='Name'
                        placeholder='Optional'
                        inputType="text"
                        value={name}
                        handleChange={handleName}
                        />
                        </div>
                        <div className='mb-[10px] mt-[35px] w-[85%] mx-[auto] !text-[14px]'>
                        <FormField
                        labelName='Comment'
                        placeholder='Optional - Maximum 60 characters'
                        isTextArea={true}
                        value={comment}
                        handleChange={handleCommentChange}
                        style='h-[100px]'
                        maxLength={60}
                        />
                        </div>
                        <div className='mb-[10px] mt-[35px] w-[85%] mx-[auto] !text-[14px]'>
                        <label className="font-epilogue font-medium text-[20px] leading-[22px] text-[#FFFFFF] mb-[10px] block">
                Profile Picture Optional*
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isUploadingImage}
              />
              <UploadAnimation 
                progress={imageUploadProgress}
                isUploading={isUploadingImage}
                file={selectedImageFile}
                type="image"
              />
                        </div>
                        <div className='h-[40px] mt-[20px] w-[85%] mx-[auto] !text-[16px]'>
                        <TransactionButton
      className={"!w-full !h-full !mx-[auto] !bg-[#FFDD00] !opacity-[60%] !hover:opacity-[100%] !duration-500 !ease-in-out !hover:bg-[#FFDD00] !text-[#000000] !font-epilogue !font-semibold !text-[16px] !py-[5px] !px-[10px] !rounded-[5px] !text-[14px]"}
      transaction={async() => {

    const upload = await pinata.upload.json({
      name: `Investment on Campaign #${campaignId} UltraShop.tech`,
      description: `Investment of ${amount} $USDC to Campaign #${campaignId}`,
      external_url: `https://UltraShop.tech/campaign-details/${campaignId}`,
      image: `https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign?.profilePhoto}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`,
      animation_url : `https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign?.videoLinkFromPinata}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`,
      attributes: [
        { trait_type: "Type", value: "Investment" },
        { trait_type: "Campaign ID", value: campaignId.toString() },
        { trait_type: "Campaign Title", value: campaign?.title },
        { trait_type: "Investor", value: address },
        { trait_type: "Amount", value: `${(amount/1).toFixed(2)} $USDC` },
        { trait_type: "Investment Date", value: new Date().toISOString().substring(0,10) },
        { trait_type: "Reward", value: symbol },
        { trait_type: "Reward Amount", value: ((amount/1)*(1/(rewardPrice/1e6))).toFixed(18).toString() },
        { trait_type: "Reward Price", value: `${(rewardPrice/1e6).toFixed(3)} $USDC` },
        {trait_type : "Reward Address", value: rewardAddress}
      ]
    });
    
        // Create a transaction object and return it
        const tx = prepareContractCall({
          contract:CrowdFunding1,
          method: "function donateToCampaign(uint256 _id, string _comment, uint256 amount, string _profilePic, string _name, string tokenURI)",
          params: [campaignId,comment, amount*1e6,profilePic,name,await upload.IpfsHash],
          value: 0,
        });
        return tx;
      }}
      onTransactionSent={(result) => {
        console.log("Transaction submitted", result.transactionHash);
      }}
      onTransactionConfirmed={(receipt) => {
        console.log("Transaction confirmed", receipt.transactionHash);
        refreshPage();
      }}
      onError={(error) => {
        console.error("Transaction error", error);
      }}
    >
      Support The Campaign
    </TransactionButton>
                       
                        </div>
                        <div className='flex justify-end w-[85%] mx-auto mt-[10px]'>
                        <button onClick={reportCampaign} className='text-[#FFDD00]  opacity-[50%] hover:opacity-[100%] duration-500 ease-in-out justify-end '>Report</button>
                        </div>
                        <div className='flex justify-start w-[85%] mx-auto mt-[10px] opacity-[70%] hover:opacity-[100%] duration-500 ease-in-out'>
                        <p className='text-[#FFFFFF]'>Share:</p>
                        </div>
                        <div className='h-[40px] my-[20px] w-[85%] mx-[auto] flex justify-center gap-[30px]'>
                        <div className="w-[32px] h-[32px]" data-href={`https://www.UltraShop.tech/campaign-details/${campaignId}`} data-layout="" data-size=""><a target="_blank" href={`https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.UltraShop.tech%2Fcampaign-details%2F${campaignId}&amp;src=sdkpreparse`} className="fb-xfbml-parse-ignore">
                        <span className="[&>svg]:h-8 [&>svg]:w-8 opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="#FFDD00"
                            viewBox="0 0 320 512">
                            <path
                            d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z" />
                        </svg> 
                        </span>
                        </a>
                        
                        </div>
                        <a href={`https://twitter.com/intent/tweet?text=${campaign?.title}%20${url}`}>
                        <span className="[&>svg]:h-8 [&>svg]:w-8 opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="#FFDD00"

                            viewBox="0 0 512 512">
                            <path
                            d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                        </svg>
                        </span>
                        </a>
                        <a href={`whatsapp://send?text=Invest in my campaign at UltraShop%20${url}`}       data-action="share/whatsapp/share"  
                        target="_blank">
                            <span className="mx-auto [&>svg]:h-8 [&>svg]:w-8 opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out">
                            <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.014 8.00613C6.12827 7.1024 7.30277 5.87414 8.23488 6.01043L8.23339 6.00894C9.14051 6.18132 9.85859 7.74261 10.2635 8.44465C10.5504 8.95402 10.3641 9.4701 10.0965 9.68787C9.7355 9.97883 9.17099 10.3803 9.28943 10.7834C9.5 11.5 12 14 13.2296 14.7107C13.695 14.9797 14.0325 14.2702 14.3207 13.9067C14.5301 13.6271 15.0466 13.46 15.5548 13.736C16.3138 14.178 17.0288 14.6917 17.69 15.27C18.0202 15.546 18.0977 15.9539 17.8689 16.385C17.4659 17.1443 16.3003 18.1456 15.4542 17.9421C13.9764 17.5868 8 15.27 6.08033 8.55801C5.97237 8.24048 5.99955 8.12044 6.014 8.00613Z" fill="#FFDD00"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 23C10.7764 23 10.0994 22.8687 9 22.5L6.89443 23.5528C5.56462 24.2177 4 23.2507 4 21.7639V19.5C1.84655 17.492 1 15.1767 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23ZM6 18.6303L5.36395 18.0372C3.69087 16.4772 3 14.7331 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C11.0143 21 10.552 20.911 9.63595 20.6038L8.84847 20.3397L6 21.7639V18.6303Z" fill="#FFDD00"/>
                            </svg>
                            </span> 
                        </a>
                        <a href={`https://t.me/share/url?url=${url}&text=${campaign?.title} Invest in my campaign at UltraShop`} target="_blank">
                        <span className="mx-auto [&>svg]:h-8 [&>svg]:w-8 opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out">
                            <svg fill="#FFDD00" width="800px" height="800px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <title>telegram</title>
                            <path d="M22.122 10.040c0.006-0 0.014-0 0.022-0 0.209 0 0.403 0.065 0.562 0.177l-0.003-0.002c0.116 0.101 0.194 0.243 0.213 0.403l0 0.003c0.020 0.122 0.031 0.262 0.031 0.405 0 0.065-0.002 0.129-0.007 0.193l0-0.009c-0.225 2.369-1.201 8.114-1.697 10.766-0.21 1.123-0.623 1.499-1.023 1.535-0.869 0.081-1.529-0.574-2.371-1.126-1.318-0.865-2.063-1.403-3.342-2.246-1.479-0.973-0.52-1.51 0.322-2.384 0.221-0.23 4.052-3.715 4.127-4.031 0.004-0.019 0.006-0.040 0.006-0.062 0-0.078-0.029-0.149-0.076-0.203l0 0c-0.052-0.034-0.117-0.053-0.185-0.053-0.045 0-0.088 0.009-0.128 0.024l0.002-0.001q-0.198 0.045-6.316 4.174c-0.445 0.351-1.007 0.573-1.619 0.599l-0.006 0c-0.867-0.105-1.654-0.298-2.401-0.573l0.074 0.024c-0.938-0.306-1.683-0.467-1.619-0.985q0.051-0.404 1.114-0.827 6.548-2.853 8.733-3.761c1.607-0.853 3.47-1.555 5.429-2.010l0.157-0.031zM15.93 1.025c-8.302 0.020-15.025 6.755-15.025 15.060 0 8.317 6.742 15.060 15.060 15.060s15.060-6.742 15.060-15.060c0-8.305-6.723-15.040-15.023-15.060h-0.002q-0.035-0-0.070 0z"></path>
                            </svg>
                            </span>
                            </a>
                            <img src={copylink} className='w-[32px] h-[32px] opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out cursor-pointer' onClick={() => copyToClipboard(url)}/>
                        </div>
                    </div>):(<>
                    <div className='ml-[20px]'>
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
      </>)}
                      </>)
                    :(<div className='relative opacity-[50%]'>
                    <img src={loader} alt='loader' className='absolute z-[2] top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[150px] h-[150px] object-contain'/>     
                      <div className='w-full min-h-[780px] rounded-[10px] border-[1px] bg-[#000000] border-[#FFDD00]' >
                        <div className='mb-[10px] mt-[35px] w-[85%] mx-[auto] !text-[14px]'>
                        {campaign? (<>
                            <FormField
                        labelName='Amount Of USDC to invest'
                        placeholder={`Minimum Amount ` + HexToInteger(campaign?.minimum._hex)/1e6.toFixed(2)+'$'}
                        inputType='number'
                        value={amount}
                        handleChange={handleAmountChange}
                        /></>):(<></>)}
                        </div>
                        <div className='mb-[10px] mt-[35px] w-[85%] mx-[auto] !text-[14px]'>
                        <FormField
                        labelName='Name'
                        placeholder='Optional'
                        inputType="text"
                        value={name}
                        handleChange={handleName}
                        />
                        </div>
                        <div className='mb-[10px] mt-[35px] w-[85%] mx-[auto] !text-[14px]'>
                        <FormField
                        labelName='Comment'
                        placeholder='Optional'
                        isTextArea={true}
                        value={comment}
                        handleChange={handleCommentChange}
                        style='h-[100px]'
                        />
                        </div>
                        <div className='mb-[10px] mt-[35px] w-[85%] mx-[auto] !text-[14px]'>
                        <label className="font-epilogue font-medium text-[20px] leading-[22px] text-[#FFFFFF] mb-[10px] block">
                Profile Picture Optional*
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isUploadingImage}
              />
              <UploadAnimation 
                progress={imageUploadProgress}
                isUploading={isUploadingImage}
                file={selectedImageFile}
                type="image"
              />
                        </div>
                        <div className='h-[40px] mt-[20px] w-[85%] mx-[auto] !text-[16px]'>
                        <TransactionButton
      className={"!w-full !h-full !mx-[auto] !bg-[#FFDD00] !opacity-[60%] !hover:opacity-[100%] !duration-500 !ease-in-out !hover:bg-[#FFDD00] !text-[#000000] !font-epilogue !font-semibold !text-[16px] !py-[5px] !px-[10px] !rounded-[5px] !text-[14px]"}
      transaction={async() => {
      
    const upload = await pinata.upload.json({
      name: `Investment on Campaign #${campaignId} UltraShop.tech`,
      description: `Investment of ${amount} $USDC to Campaign #${campaignId}`,
      external_url: `https://UltraShop.tech/campaign-details/${campaignId}`,
      image: `https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign?.profilePhoto}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`,
      animation_url : `https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign?.videoLinkFromPinata}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`,
      attributes: [
        { trait_type: "Type", value: "Investment" },
        { trait_type: "Campaign ID", value: campaignId.toString() },
        { trait_type: "Campaign Title", value: campaign?.title },
        { trait_type: "Investor", value: address },
        { trait_type: "Amount", value: `${(amount/1).toFixed(2)} $USDC` },
        { trait_type: "Investment Date", value: new Date().toISOString().substring(0,10) },
        { trait_type: "Reward", value: symbol },
        { trait_type: "Reward Amount", value: ((amount/1)*(1/(rewardPrice/1e6))).toFixed(18).toString() },
        { trait_type: "Reward Price", value: `${(rewardPrice/1e6).toFixed(3)} $USDC` },
        {trait_type : "Reward Address", value: rewardAddress}
      ]
    });
        // Create a transaction object and return it
        const tx = prepareContractCall({
          contract:CrowdFunding1,
          method: "function donateToCampaign(uint256 _id, string _comment, uint256 amount, string _profilePic, string _name, string tokenURI)",
          params: [campaignId,comment, amount*1e6,profilePic,name,await upload.IpfsHash],
          value: 0,
        });
        return tx;
      }}
      onTransactionSent={(result) => {
        console.log("Transaction submitted", result.transactionHash);
      }}
      onTransactionConfirmed={(receipt) => {
        console.log("Transaction confirmed", receipt.transactionHash);
        refreshPage();
      }}
      onError={(error) => {
        console.error("Transaction error", error);
      }}
    >
      Support The Campaign
    </TransactionButton>
                        </div>
                        <div className='flex justify-end w-[85%] mx-auto mt-[10px]'>
                        <button onClick={reportCampaign} className='text-[#FFDD00]  opacity-[50%] hover:opacity-[100%] duration-500 ease-in-out justify-end '>Report</button>
                        </div>
                        <div className='flex justify-start w-[85%] mx-auto mt-[10px] opacity-[70%] hover:opacity-[100%] duration-500 ease-in-out'>
                        <p className='text-[#FFFFFF]'>Share:</p>
                        </div>
                        <div className='h-[40px] my-[20px] w-[85%] mx-[auto] flex justify-center gap-[30px]'>
                        <div className="w-[32px] h-[32px]" data-href={`https://www.UltraShop.tech/campaign-details/${campaignId}`} data-layout="" data-size=""><a target="_blank" href={`https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.UltraShop.tech%2Fcampaign-details%2F${campaignId}&amp;src=sdkpreparse`} className="fb-xfbml-parse-ignore">
                        <span className="[&>svg]:h-8 [&>svg]:w-8 opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="#FFDD00"
                            viewBox="0 0 320 512">
                            <path
                            d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z" />
                        </svg> 
                        </span>
                        </a>
                        
                        </div>
                        <a href={`https://twitter.com/intent/tweet?text=${campaign?.title}%20${url}`}>
                        <span className="[&>svg]:h-8 [&>svg]:w-8 opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="#FFDD00"

                            viewBox="0 0 512 512">
                            <path
                            d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                        </svg>
                        </span>
                        </a>
                        <a href={`whatsapp://send?text=Invest in my campaign at UltraShop%20${url}`}       data-action="share/whatsapp/share"  
                        target="_blank">
                            <span className="mx-auto [&>svg]:h-8 [&>svg]:w-8 opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out">
                            <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.014 8.00613C6.12827 7.1024 7.30277 5.87414 8.23488 6.01043L8.23339 6.00894C9.14051 6.18132 9.85859 7.74261 10.2635 8.44465C10.5504 8.95402 10.3641 9.4701 10.0965 9.68787C9.7355 9.97883 9.17099 10.3803 9.28943 10.7834C9.5 11.5 12 14 13.2296 14.7107C13.695 14.9797 14.0325 14.2702 14.3207 13.9067C14.5301 13.6271 15.0466 13.46 15.5548 13.736C16.3138 14.178 17.0288 14.6917 17.69 15.27C18.0202 15.546 18.0977 15.9539 17.8689 16.385C17.4659 17.1443 16.3003 18.1456 15.4542 17.9421C13.9764 17.5868 8 15.27 6.08033 8.55801C5.97237 8.24048 5.99955 8.12044 6.014 8.00613Z" fill="#FFDD00"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 23C10.7764 23 10.0994 22.8687 9 22.5L6.89443 23.5528C5.56462 24.2177 4 23.2507 4 21.7639V19.5C1.84655 17.492 1 15.1767 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23ZM6 18.6303L5.36395 18.0372C3.69087 16.4772 3 14.7331 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C11.0143 21 10.552 20.911 9.63595 20.6038L8.84847 20.3397L6 21.7639V18.6303Z" fill="#FFDD00"/>
                            </svg>
                            </span> 
                        </a>
                        <a href={`https://t.me/share/url?url=${url}&text=${campaign?.title} Invest in my campaign at UltraShop`} target="_blank">
                        <span className="mx-auto [&>svg]:h-8 [&>svg]:w-8 opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out">
                            <svg fill="#FFDD00" width="800px" height="800px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <title>telegram</title>
                            <path d="M22.122 10.040c0.006-0 0.014-0 0.022-0 0.209 0 0.403 0.065 0.562 0.177l-0.003-0.002c0.116 0.101 0.194 0.243 0.213 0.403l0 0.003c0.020 0.122 0.031 0.262 0.031 0.405 0 0.065-0.002 0.129-0.007 0.193l0-0.009c-0.225 2.369-1.201 8.114-1.697 10.766-0.21 1.123-0.623 1.499-1.023 1.535-0.869 0.081-1.529-0.574-2.371-1.126-1.318-0.865-2.063-1.403-3.342-2.246-1.479-0.973-0.52-1.51 0.322-2.384 0.221-0.23 4.052-3.715 4.127-4.031 0.004-0.019 0.006-0.040 0.006-0.062 0-0.078-0.029-0.149-0.076-0.203l0 0c-0.052-0.034-0.117-0.053-0.185-0.053-0.045 0-0.088 0.009-0.128 0.024l0.002-0.001q-0.198 0.045-6.316 4.174c-0.445 0.351-1.007 0.573-1.619 0.599l-0.006 0c-0.867-0.105-1.654-0.298-2.401-0.573l0.074 0.024c-0.938-0.306-1.683-0.467-1.619-0.985q0.051-0.404 1.114-0.827 6.548-2.853 8.733-3.761c1.607-0.853 3.47-1.555 5.429-2.010l0.157-0.031zM15.93 1.025c-8.302 0.020-15.025 6.755-15.025 15.060 0 8.317 6.742 15.060 15.060 15.060s15.060-6.742 15.060-15.060c0-8.305-6.723-15.040-15.023-15.060h-0.002q-0.035-0-0.070 0z"></path>
                            </svg>
                            </span>
                            </a>
                            <img src={copylink} className='w-[32px] h-[32px] opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out cursor-pointer' onClick={() => copyToClipboard(url)}/>
                        </div>
                    </div>
                    </div>)}
                    <div className='mt-[40px]'>
                    
                    <h1 className='text-[#FFFFFF] font-epilogue font-semibold text-[20px] py-[5px] px-[20px]'>Campaign Creator</h1>
                    <div className='grid grid-rows-3 grid-flow-col gap-4 mt-[20px]'>
                    <div className='row-span-3 w-[100px] h-[100px]'>
                    <img src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign?.profilePhoto}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`} alt='avatar' className='w-[100px] h-[100px] object-contain  rounded-full'/>
                    </div>
                             <div className='col-span-2 flex'>
                             <img 
                                src={email} 
                                className='w-[40px] h-[40px] opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out cursor-pointer'
                                {...(address ? { onClick: () => copyToClipboard(campaign?.phoneNumber) } : {})}
                              />
                            {address ? (<p className='my-auto opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out text-[14px] hover:text-[#FFDD00] text-[#FFFFFF] cursor-pointer' onClick={() => copyToClipboard(campaign?.phoneNumber)}>{campaign?.phoneNumber}</p>):(<p className='my-auto text-[14px] text-[#FFFFFF]'>Shown only to connected users</p>)}
                            </div>
                            <div className='col-span-2 flex mx-[2px]'>
                            <img src={copylink} className='w-[40px] h-[40px] opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out cursor-pointer' onClick={() => copyToClipboard(campaign?.owner)}/>
                            <a href={`https://base.blockscout.com/address/${campaign?.owner}`} target='_blank' className='text-[14px] opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out hover:text-[#FFDD00] text-[#FFFFFF] my-auto'>To The Wallet Of The Campaigner</a>
                            </div>
                        
                        </div>
                        
                    </div>



                    <div className='h-[40px] w-[85%] mx-[auto] !text-[16px]'>
                        {campaign?.owner === address&&(remainingDays <= 0) && campaign?.iscashedout === false ? (<>
                      <TransactionButton
                      className={"!w-full !h-full !mx-[auto] !bg-[#FFDD00] !opacity-[60%] !hover:opacity-[100%] !duration-500 !ease-in-out !hover:bg-[#FFDD00] !text-[#000000] !font-epilogue !font-semibold !text-[16px] !py-[5px] !px-[10px] !rounded-[5px] !text-[14px]"}
                      transaction={() => {
                        // Create a transaction object and return it
                        const tx = prepareContractCall({
                          contract:CrowdFunding1,
                          method: "function withdrawCampaign(uint256 _id)",
                          params: [campaignId],
                          value: 0,
                        });
                        return tx;
                      }}
                      onTransactionSent={(result) => {
                        console.log("Transaction submitted", result.transactionHash);
                      }}
                      onTransactionConfirmed={(receipt) => {
                        console.log("Transaction confirmed", receipt.transactionHash);
                      }}
                      onError={(error) => {
                        console.error("Transaction error", error);
                      }}
                    >
                      Withdraw
                    </TransactionButton>
                    </>
                    ):
                      (
                      <></>)}      
                    </div>
                    <h1 className='text-[#FFFFFF] font-epilogue font-semibold text-[20px] py-[5px] px-[20px] mt-[25px]'>Website Comment</h1>
                    <div className='border-[1px] border-[#FFDD00] rounded-[10px] mt-[20px] min-h-[60px]'>
                        <p className='text-[#FFFFFF] font-epilogue font-semi text-[14px] py-[15px] px-[20px] mx-auto text-center'>{campaign?.websiteComment}</p>
                    </div>
                    <h1 className='text-[#FFFFFF] font-epilogue font-semibold text-[20px] py-[5px] px-[20px] mt-[25px]'>Supporters</h1>
                    <div className='w-full h-[450x] overflow-auto touch-auto'>
                    {investors !== undefined && ( <Investors investors={investors} websiteComment={campaign?.websiteComment} />)}
                    </div>
                </div>
            </div> </>) : (<> <div className={`rounded-[15px] h-[280px] absolute inset-0 sm:w-[20%] mx-auto flex items-center justify-center border-[1px] border-[#FFDD00] bg-[#000000] z-10 drop-shadow py-4 transition-all duration-700 ${toggleApproveCoins ? 'translate-y-[1500px]' : '-translate-y-full'}`}>
  <p className={`text-[#FFFFFF] font-epilogue font-bold text-[30px] text-center absolute bottom-1 right-2 cursor-pointer`} onClick={() => setToggleApproveCoins(prev => !prev)}>X</p>
  <div>
    <p className="text-[#FFFFFF] font-epilogue font-bold text-[16px] text-center mt-[25px] drop-shadow">Approve USDC For Fundraising</p>
    <div className='w-full flex flex-col items-center'>
      <div className='mt-[20px] w-10/12'>
        <input
          className="rounded-[2px] w-full max-h-[53px] p-5 !rounded-[6px] bg-[#424242]"
          type="number"
          placeholder="Amount For Approval"
          value={amountForApprove}
          onChange={e => setAmountForApprove(e.target.value)}
        />
      </div>
      <div className='w-10/12 mt-[20px]'>
      
      </div>
    </div>
  </div>
</div>



        {campaign?.websiteComment === "Refunded because of illegal activity" ? (
        <video className=' w-full rounded-[15px] my-[50px]' controls>
           </video>
         ) : ( <>
      <IPFSMediaViewer
      ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign?.videoLinkFromPinata}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
      className={'!w-7/12 mx-auto rounded-[15px] my-[50px]'}/>
      </>  )}
        <div className="relative h-[5px]  w-10/12 mx-auto linear-gradient2 mt-2 rounded-xl" >
          {campaign?.iscashedout==false ? (
            <>
            <div className="absolute relative h-full bg-[#fc941c] rounded-xl" style={{ width: `${calculateBarPercentage(campaign?.target*1e-6, total*1e-6)}%`, maxWidth: '100%'}}>
            <p className='absolute text-[#fc941c] top-[-25px] right-[0]'>{calculateBarPercentage(campaign?.target*1e-6, total*1e-6)+'%'}</p>
            </div>
            </>
          ) : (
            <div className="absolute h-full bg-[#fc941c] rounded-xl relative" style={{ width: `${calculateBarPercentage(campaign?.target*1e-6, parseFloat(extractNumberFromString(campaign?.websiteComment)))}%`, maxWidth: '100%'}}>
            <p className='absolute text-[#fc941c] top-[-25px] right-[0]'>{calculateBarPercentage(campaign?.target*1e-6, parseFloat(extractNumberFromString(campaign?.websiteComment)))+'%'}</p>
            </div>
          )}
          </div>
            <div className='flex  w-10/12 mx-auto justify-between mt-[30px] px-[20px]'>
            <div>
            {campaign?.iscashedout ? (<h2 className='text-[#fc941c] text-center text-[20px] font-bold'>{parseFloat(extractNumberFromString(campaign?.websiteComment))} USDC</h2>):(<><h2 className='text-[#fc941c] text-center text-[20px] font-bold'>{(total*1e-6).toFixed(1)} USDC</h2></>)}
            <h2 className='text-[#FFFFFF] text-[12px] text-center'>{formatNumberWithCommas(campaign?.target*1e-6)}USDC</h2>
            </div>
            <div>
            <h2 className='text-[#FFFFFF] text-center text-[20px] font-bold'>{remainingDays}</h2>
            <h2 className='text-[#FFFFFF] text-[12px] text-center'>Days left</h2>
            </div>
            <div>
            <h2 className='text-[#FFDD00] text-center text-[20px] font-bold'>{(1/(rewardPrice/1e6)).toFixed(5)} {symbol}</h2>
            <h2 className='text-[#FFFFFF] text-[12px] text-center'>Reward Per USDC</h2>
            </div>
            <div>
            <h2 className='text-[#FFFFFF] text-center text-[20px] font-bold'>{investors?.comments ? (investors.comments.length) : ('0') }</h2>
            <h2 className='text-[#FFFFFF] text-[12px] text-center'>Supporters</h2>
            </div>
            <div>
            <h2 className='text-[#fc941c] text-center text-[20px] font-bold'>{campaign?.iscashedout ?('Yes'):('Runing')}</h2>
            <h2 className='text-[#FFFFFF] text-[12px] text-center'>Done?</h2>
            </div>
            <div>
            <h2 className='text-[#fc941c] text-center text-[20px] font-bold'>{formatNumberWithCommas(totalSupply)}</h2>
            <h2 className='text-[#FFFFFF] text-[12px] text-center'>Total Supply</h2>
            </div>
            <div className='items-center justify-center'>
            {campaign?.isCheckedByWebsite&&!campaign?.iscashedout ? (<img src={VerifiedIcon} className='w-[32px] h-[32px] mx-auto'/>):(<></>)}
                {!campaign?.isCheckedByWebsite&&(campaign?.iscashedout==false)&&campaign?.videoLinkFromPinata!=='X' ? (<img src={loader} className='w-[32px] h-[32px] mx-auto'/>):(<></>)}
                {campaign?.iscashedout ? (<img src={done_mobile} className='w-[32px] h-[32px] mx-auto'/>):(<></>)}
                {campaign?.videoLinkFromPinata==='X' ? (<img src={dis_mobile} className='w-[32px] h-[32px] mx-auto'/>):(<></>)}
            <h2 className='text-[#FFFFFF] text-[12px] text-center'>Is Verified?</h2>
            </div>
            </div>

            <div className='flex justify-center mt-[30px]  rounded-[13px] overflow-auto touch-auto'>
                <div className='w-[65%] ml-[20px] mt-[50px]'>
                <div>
                    <div className='flex justify-between'>
                <h3 className='text-white text-center w-4/12  font-epilogue font-semibold text-[12px] py-[5px] px-[20px] rounded-[7px] border-[#FFFFFF] border-[1px]'>{campaign?.category}</h3>
                {campaign?.owner===address ? (<button className='flex-end w-4/12 min-h-[20px] text-[#000000] mr-[30px] bg-[#FFDD00] rounded-[5px] opacity-[60%] hover:opacity-[100%] duration-500 ease-in-out font-semibold' onClick={() => handleNavigateEdit(campaign)}>Edit Campaign</button>):(<></>)}
                </div>
                <h1 className='text-[#FFDD00] font-epilogue font-bold text-[30px] py-[5px] px-[20px] mt-[20px] leading-relaxed'>{campaign?.title}</h1>
                <div className='my-[20px] mx-[30px]'>
                <span className='text-[#FFFFFF]'>{renderDescriptionWithBreaks(campaign?.description)}</span>
                </div>
               
                {campaign?.iscashedout ? (<>
                  <div class="bg-gray-900 mx-auto sm:w-11/12 w-full rounded-lg shadow-lg py-[20px]">
                  <p className='text-[15] !text-white font-bold text-center sm:text-[30px]'>
                  {symbol} address is {rewardAddress}
                </p>
</div>
<Swapper ERCUltraAddress={rewardAddress} SYMBOL={symbol}/>
                   <div className='sm:flex sm:justify-items-center m-auto sm:items-center h-[720px] rounded-[15px] sm:w-11/12 w-full'>
                   <iframe height="80%" className='rounded-[15px] mx-auto sm:w-[9/10] w-full' id="geckoterminal-embed" title="GeckoTerminal Embed" src={`https://www.geckoterminal.com/base/tokens/${rewardAddress}?embed=1&info=0&swaps=1`} frameborder="0" allow="clipboard-write" allowfullscreen></iframe>
                   </div>
                   </>
                ):(<></>)}
                </div>
                </div>
                <div className={!address ? 'w-[30%]':'w-[30%] mt-[30px]'}>
                    {!address ? (<p className='text-[#fc941c] font-epilogue font-semibold text-[12px] py-[5px] px-[20px] mt-[50px]'>Only connected members with fee for gas in the wallet can invest, log in at the top</p>
                    )
                    :
                    (<div className='h-[40px] mb-[20px] w-[75%] mx-[auto] !text-[16px] mt-[20px]'>
                      
                      </div>)}
                                            
                    
                    {campaign?.isCheckedByWebsite?(
                      <>
                      {address?(<div className={`w-full ${campaign?.iscashedout? ('hidden'):('block')} min-h-[780px] rounded-[10px] border-[1px] bg-[#000000] border-[#FFDD00]`} >
                        <div className='mb-[10px] mt-[35px] w-[85%] mx-[auto] !text-[14px]'>
                        {campaign? (<>
                            <FormField
                        labelName='Amount Of USDC to invest'
                        placeholder={`Minimum Amount ` + HexToInteger(campaign?.minimum._hex)/1e6.toFixed(2)+'$'}
                        inputType='number'
                        value={amount}
                        handleChange={handleAmountChange}
                        /></>):(<></>)}
                        </div>
                        <div className='justify-center flex'>
                        <TransactionButton
                    className={"!mb-[15px] !mx-auto !justify-center !bg-orange-500 !hover:bg-orange-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out"}
                    transaction={() => {
                      // Create a transaction object and return it
                      const tx = prepareContractCall({
                        contract:USDTForFundraising,
                        method: "function approve(address spender, uint256 amount)",
                        params: [import.meta.env.VITE_CROWDFUNDING,amount*1e6 ],
                        value: 0,
                      });
                      return tx;
                    }}
                    onTransactionSent={(result) => {
                      console.log("Transaction submitted", result.transactionHash);
                    }}
                    onTransactionConfirmed={(receipt) => {
                      console.log("Transaction confirmed", receipt.transactionHash);
                    }}
                    onError={(error) => {
                      console.error("Transaction error", error);
                    }}
                  >
                    Approve
                  </TransactionButton>
                        </div>
                        <div className='mb-[10px] mt-[35px] w-[85%] mx-[auto] !text-[14px]'>
                        <FormField
                        labelName='Name'
                        placeholder='Optional'
                        inputType="text"
                        value={name}
                        handleChange={handleName}
                        />
                        </div>
                        <div className='mb-[10px] mt-[35px] w-[85%] mx-[auto] !text-[14px]'>
                        <FormField
                        labelName='Comment'
                        placeholder='Optional - Maximum 60 characters'
                        isTextArea={true}
                        value={comment}
                        handleChange={handleCommentChange}
                        style='h-[100px]'
                        maxLength={60}
                        />
                        </div>
                        <div className='mb-[10px] mt-[35px] w-[85%] mx-[auto] !text-[14px]'>
                        <label className="font-epilogue font-medium text-[20px] leading-[22px] text-[#FFFFFF] mb-[10px] block">
                Profile Picture Optional*
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isUploadingImage}
              />
              <UploadAnimation 
                progress={imageUploadProgress}
                isUploading={isUploadingImage}
                file={selectedImageFile}
                type="image"
              />
                        </div>
                        <div className='h-[40px] mt-[20px] w-[85%] mx-[auto] !text-[16px]'>
                        <TransactionButton
      className={"!w-full !h-full !mx-[auto] !bg-[#FFDD00] !opacity-[60%] !hover:opacity-[100%] !duration-500 !ease-in-out !hover:bg-[#FFDD00] !text-[#000000] !font-epilogue !font-semibold !text-[16px] !py-[5px] !px-[10px] !rounded-[5px] !text-[14px]"}
      transaction={async() => {
      
    const upload = await pinata.upload.json({
      name: `Investment on Campaign #${campaignId} UltraShop.tech`,
      description: `Investment of ${amount} $USDC to Campaign #${campaignId}`,
      external_url: `https://UltraShop.tech/campaign-details/${campaignId}`,
      image: `https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign?.profilePhoto}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`,
      animation_url : `https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign?.videoLinkFromPinata}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`,
      attributes: [
        { trait_type: "Type", value: "Investment" },
        { trait_type: "Campaign ID", value: campaignId.toString() },
        { trait_type: "Campaign Title", value: campaign?.title },
        { trait_type: "Investor", value: address },
        { trait_type: "Amount", value: `${(amount/1).toFixed(2)} $USDC` },
        { trait_type: "Investment Date", value: new Date().toISOString().substring(0,10) },
        { trait_type: "Reward", value: symbol },
        { trait_type: "Reward Amount", value: ((amount/1)*(1/(rewardPrice/1e6))).toFixed(18).toString() },
        { trait_type: "Reward Price", value: `${(rewardPrice/1e6).toFixed(3)} $USDC` },
        {trait_type : "Reward Address", value: rewardAddress}
      ]
    });
        // Create a transaction object and return it
        const tx = prepareContractCall({
          contract:CrowdFunding1,
          method: "function donateToCampaign(uint256 _id, string _comment, uint256 amount, string _profilePic, string _name, string tokenURI)",
          params: [campaignId,comment, amount*1e6,profilePic,name,await upload.IpfsHash],
          value: 0,
        });
        return tx;
      }}
      onTransactionSent={(result) => {
        console.log("Transaction submitted", result.transactionHash);
      }}
      onTransactionConfirmed={(receipt) => {
        console.log("Transaction confirmed", receipt.transactionHash);
        refreshPage();
      }}
      onError={(error) => {
        console.error("Transaction error", error);
      }}
    >
      Support The Campaign
    </TransactionButton>
                       
                        </div>
                        <div className='flex justify-end w-[85%] mx-auto mt-[10px]'>
                        <button onClick={reportCampaign} className='text-[#FFDD00]  opacity-[50%] hover:opacity-[100%] duration-500 ease-in-out justify-end '>Report</button>
                        </div>
                        <div className='flex justify-start w-[85%] mx-auto mt-[10px] opacity-[70%] hover:opacity-[100%] duration-500 ease-in-out'>
                        <p className='text-[#FFFFFF]'>Share:</p>
                        </div>
                        <div className='h-[40px] my-[20px] w-[85%] mx-[auto] flex justify-center gap-[30px]'>
                        <div className="w-[32px] h-[32px]" data-href={`https://www.UltraShop.tech/campaign-details/${campaignId}`} data-layout="" data-size=""><a target="_blank" href={`https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.UltraShop.tech%2Fcampaign-details%2F${campaignId}&amp;src=sdkpreparse`} className="fb-xfbml-parse-ignore">
                        <span className="[&>svg]:h-8 [&>svg]:w-8 opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="#FFDD00"
                            viewBox="0 0 320 512">
                            <path
                            d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z" />
                        </svg> 
                        </span>
                        </a>
                        
                        </div>
                        <a href={`https://twitter.com/intent/tweet?text=${campaign?.title}%20${url}`}>
                        <span className="[&>svg]:h-8 [&>svg]:w-8 opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="#FFDD00"

                            viewBox="0 0 512 512">
                            <path
                            d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                        </svg>
                        </span>
                        </a>
                        <a href={`whatsapp://send?text=Invest in my campaign at UltimateDeal%20${url}`}       data-action="share/whatsapp/share"  
                        target="_blank">
                            <span className="mx-auto [&>svg]:h-8 [&>svg]:w-8 opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out">
                            <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.014 8.00613C6.12827 7.1024 7.30277 5.87414 8.23488 6.01043L8.23339 6.00894C9.14051 6.18132 9.85859 7.74261 10.2635 8.44465C10.5504 8.95402 10.3641 9.4701 10.0965 9.68787C9.7355 9.97883 9.17099 10.3803 9.28943 10.7834C9.5 11.5 12 14 13.2296 14.7107C13.695 14.9797 14.0325 14.2702 14.3207 13.9067C14.5301 13.6271 15.0466 13.46 15.5548 13.736C16.3138 14.178 17.0288 14.6917 17.69 15.27C18.0202 15.546 18.0977 15.9539 17.8689 16.385C17.4659 17.1443 16.3003 18.1456 15.4542 17.9421C13.9764 17.5868 8 15.27 6.08033 8.55801C5.97237 8.24048 5.99955 8.12044 6.014 8.00613Z" fill="#FFDD00"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 23C10.7764 23 10.0994 22.8687 9 22.5L6.89443 23.5528C5.56462 24.2177 4 23.2507 4 21.7639V19.5C1.84655 17.492 1 15.1767 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23ZM6 18.6303L5.36395 18.0372C3.69087 16.4772 3 14.7331 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C11.0143 21 10.552 20.911 9.63595 20.6038L8.84847 20.3397L6 21.7639V18.6303Z" fill="#FFDD00"/>
                            </svg>
                            </span> 
                        </a>
                        <a href={`https://t.me/share/url?url=${url}&text=${campaign?.title} Invest in my campaign at UltimateDeal`} target="_blank">
                        <span className="mx-auto [&>svg]:h-8 [&>svg]:w-8 opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out">
                            <svg fill="#FFDD00" width="800px" height="800px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <title>telegram</title>
                            <path d="M22.122 10.040c0.006-0 0.014-0 0.022-0 0.209 0 0.403 0.065 0.562 0.177l-0.003-0.002c0.116 0.101 0.194 0.243 0.213 0.403l0 0.003c0.020 0.122 0.031 0.262 0.031 0.405 0 0.065-0.002 0.129-0.007 0.193l0-0.009c-0.225 2.369-1.201 8.114-1.697 10.766-0.21 1.123-0.623 1.499-1.023 1.535-0.869 0.081-1.529-0.574-2.371-1.126-1.318-0.865-2.063-1.403-3.342-2.246-1.479-0.973-0.52-1.51 0.322-2.384 0.221-0.23 4.052-3.715 4.127-4.031 0.004-0.019 0.006-0.040 0.006-0.062 0-0.078-0.029-0.149-0.076-0.203l0 0c-0.052-0.034-0.117-0.053-0.185-0.053-0.045 0-0.088 0.009-0.128 0.024l0.002-0.001q-0.198 0.045-6.316 4.174c-0.445 0.351-1.007 0.573-1.619 0.599l-0.006 0c-0.867-0.105-1.654-0.298-2.401-0.573l0.074 0.024c-0.938-0.306-1.683-0.467-1.619-0.985q0.051-0.404 1.114-0.827 6.548-2.853 8.733-3.761c1.607-0.853 3.47-1.555 5.429-2.010l0.157-0.031zM15.93 1.025c-8.302 0.020-15.025 6.755-15.025 15.060 0 8.317 6.742 15.060 15.060 15.060s15.060-6.742 15.060-15.060c0-8.305-6.723-15.040-15.023-15.060h-0.002q-0.035-0-0.070 0z"></path>
                            </svg>
                            </span>
                            </a>
                            <img src={copylink} className='w-[32px] h-[32px] opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out cursor-pointer' onClick={() => copyToClipboard(url)}/>
                        </div>
                    </div>):(<>
                    <div className='ml-[20px]'>
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
      </>)}
                      </>):(<div className='relative opacity-[50%]'>
                    <img src={loader} alt='loader' className='absolute z-[2] top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[150px] h-[150px] object-contain'/>     
                      <div className='w-full min-h-[780px] rounded-[10px] border-[1px] bg-[#000000] border-[#FFDD00]' >
                        <div className='mb-[10px] mt-[35px] w-[85%] mx-[auto] !text-[14px]'>
                        {campaign? (<>
                            <FormField
                        labelName='Amount Of USDC to invest'
                        placeholder={`Minimum Amount ` + HexToInteger(campaign?.minimum._hex)/1e6.toFixed(2)+'$'}
                        inputType='number'
                        value={amount}
                        handleChange={handleAmountChange}
                        /></>):(<></>)}
                        </div>
                        <div className='mb-[10px] mt-[35px] w-[85%] mx-[auto] !text-[14px]'>
                        <FormField
                        labelName='Name'
                        placeholder='Optional'
                        inputType="text"
                        value={name}
                        handleChange={handleName}
                        />
                        </div>
                        <div className='mb-[10px] mt-[35px] w-[85%] mx-[auto] !text-[14px]'>
                        <FormField
                        labelName='Comment'
                        placeholder='Optional'
                        isTextArea={true}
                        value={comment}
                        handleChange={handleCommentChange}
                        style='h-[100px]'
                        />
                        </div>
                        <div className='mb-[10px] mt-[35px] w-[85%] mx-[auto] !text-[14px]'>
                        <label className="font-epilogue font-medium text-[20px] leading-[22px] text-[#FFFFFF] mb-[10px] block">
                Profile Picture Optional*
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isUploadingImage}
              />
              <UploadAnimation 
                progress={imageUploadProgress}
                isUploading={isUploadingImage}
                file={selectedImageFile}
                type="image"
              />
                        </div>
                        <div className='h-[40px] mt-[20px] w-[85%] mx-[auto] !text-[16px]'>
                        <TransactionButton
      className={"!w-full !h-full !mx-[auto] !bg-[#FFDD00] !opacity-[60%] !hover:opacity-[100%] !duration-500 !ease-in-out !hover:bg-[#FFDD00] !text-[#000000] !font-epilogue !font-semibold !text-[16px] !py-[5px] !px-[10px] !rounded-[5px] !text-[14px]"}
      transaction={async() => {
    const upload = await pinata.upload.json({
      name: `Investment on Campaign #${campaignId} UltraShop.tech`,
      description: `Investment of ${amount} $USDC to Campaign #${campaignId}`,
      external_url: `https://UltraShop.tech/campaign-details/${campaignId}`,
      image: `https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign?.profilePhoto}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`,
      animation_url : `https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign?.videoLinkFromPinata}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`,
      attributes: [
        { trait_type: "Type", value: "Investment" },
        { trait_type: "Campaign ID", value: campaignId.toString() },
        { trait_type: "Campaign Title", value: campaign?.title },
        { trait_type: "Investor", value: address },
        { trait_type: "Amount", value: `${(amount/1).toFixed(2)} $USDC` },
        { trait_type: "Investment Date", value: new Date().toISOString().substring(0,10) },
        { trait_type: "Reward", value: symbol },
        { trait_type: "Reward Amount", value: ((amount/1)*(1/(rewardPrice/1e6))).toFixed(18).toString() },
        { trait_type: "Reward Price", value: `${(rewardPrice/1e6).toFixed(3)} $USDC` },
        {trait_type : "Reward Address", value: rewardAddress}
      ]
    });
        // Create a transaction object and return it
        const tx = prepareContractCall({
          contract:CrowdFunding1,
          method: "function donateToCampaign(uint256 _id, string _comment, uint256 amount, string _profilePic, string _name, string tokenURI)",
          params: [campaignId,comment, amount*1e6,profilePic,name,await upload.IpfsHash],
          value: 0,
        });
        return tx;
      }}
      onTransactionSent={(result) => {
        console.log("Transaction submitted", result.transactionHash);
      }}
      onTransactionConfirmed={(receipt) => {
        console.log("Transaction confirmed", receipt.transactionHash);
        refreshPage();
      }}
      onError={(error) => {
        console.error("Transaction error", error);
      }}
    >
      Support The Campaign
    </TransactionButton>
                        </div>
                        <div className='flex justify-end w-[85%] mx-auto mt-[10px]'>
                        <button onClick={reportCampaign} className='text-[#FFDD00]  opacity-[50%] hover:opacity-[100%] duration-500 ease-in-out justify-end '>Report</button>
                        </div>
                        <div className='flex justify-start w-[85%] mx-auto mt-[10px] opacity-[70%] hover:opacity-[100%] duration-500 ease-in-out'>
                        <p className='text-[#FFFFFF]'>Share:</p>
                        </div>
                        <div className='h-[40px] my-[20px] w-[85%] mx-[auto] flex justify-center gap-[30px]'>
                        <div className="w-[32px] h-[32px]" data-href={`https://www.UltraShop.tech/campaign-details/${campaignId}`} data-layout="" data-size=""><a target="_blank" href={`https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.UltraShop.tech%2Fcampaign-details%2F${campaignId}&amp;src=sdkpreparse`} className="fb-xfbml-parse-ignore">
                        <span className="[&>svg]:h-8 [&>svg]:w-8 opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="#FFDD00"
                            viewBox="0 0 320 512">
                            <path
                            d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z" />
                        </svg> 
                        </span>
                        </a>
                        
                        </div>
                        <a href={`https://twitter.com/intent/tweet?text=${campaign?.title}%20${url}`}>
                        <span className="[&>svg]:h-8 [&>svg]:w-8 opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="#FFDD00"

                            viewBox="0 0 512 512">
                            <path
                            d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                        </svg>
                        </span>
                        </a>
                        <a href={`whatsapp://send?text=Invest in my campaign at UltraShop%20${url}`}       data-action="share/whatsapp/share"  
                        target="_blank">
                            <span className="mx-auto [&>svg]:h-8 [&>svg]:w-8 opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out">
                            <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.014 8.00613C6.12827 7.1024 7.30277 5.87414 8.23488 6.01043L8.23339 6.00894C9.14051 6.18132 9.85859 7.74261 10.2635 8.44465C10.5504 8.95402 10.3641 9.4701 10.0965 9.68787C9.7355 9.97883 9.17099 10.3803 9.28943 10.7834C9.5 11.5 12 14 13.2296 14.7107C13.695 14.9797 14.0325 14.2702 14.3207 13.9067C14.5301 13.6271 15.0466 13.46 15.5548 13.736C16.3138 14.178 17.0288 14.6917 17.69 15.27C18.0202 15.546 18.0977 15.9539 17.8689 16.385C17.4659 17.1443 16.3003 18.1456 15.4542 17.9421C13.9764 17.5868 8 15.27 6.08033 8.55801C5.97237 8.24048 5.99955 8.12044 6.014 8.00613Z" fill="#FFDD00"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 23C10.7764 23 10.0994 22.8687 9 22.5L6.89443 23.5528C5.56462 24.2177 4 23.2507 4 21.7639V19.5C1.84655 17.492 1 15.1767 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23ZM6 18.6303L5.36395 18.0372C3.69087 16.4772 3 14.7331 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C11.0143 21 10.552 20.911 9.63595 20.6038L8.84847 20.3397L6 21.7639V18.6303Z" fill="#FFDD00"/>
                            </svg>
                            </span> 
                        </a>
                        <a href={`https://t.me/share/url?url=${url}&text=${campaign?.title} Invest in my campaign at UltraShop`} target="_blank">
                        <span className="mx-auto [&>svg]:h-8 [&>svg]:w-8 opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out">
                            <svg fill="#FFDD00" width="800px" height="800px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <title>telegram</title>
                            <path d="M22.122 10.040c0.006-0 0.014-0 0.022-0 0.209 0 0.403 0.065 0.562 0.177l-0.003-0.002c0.116 0.101 0.194 0.243 0.213 0.403l0 0.003c0.020 0.122 0.031 0.262 0.031 0.405 0 0.065-0.002 0.129-0.007 0.193l0-0.009c-0.225 2.369-1.201 8.114-1.697 10.766-0.21 1.123-0.623 1.499-1.023 1.535-0.869 0.081-1.529-0.574-2.371-1.126-1.318-0.865-2.063-1.403-3.342-2.246-1.479-0.973-0.52-1.51 0.322-2.384 0.221-0.23 4.052-3.715 4.127-4.031 0.004-0.019 0.006-0.040 0.006-0.062 0-0.078-0.029-0.149-0.076-0.203l0 0c-0.052-0.034-0.117-0.053-0.185-0.053-0.045 0-0.088 0.009-0.128 0.024l0.002-0.001q-0.198 0.045-6.316 4.174c-0.445 0.351-1.007 0.573-1.619 0.599l-0.006 0c-0.867-0.105-1.654-0.298-2.401-0.573l0.074 0.024c-0.938-0.306-1.683-0.467-1.619-0.985q0.051-0.404 1.114-0.827 6.548-2.853 8.733-3.761c1.607-0.853 3.47-1.555 5.429-2.010l0.157-0.031zM15.93 1.025c-8.302 0.020-15.025 6.755-15.025 15.060 0 8.317 6.742 15.060 15.060 15.060s15.060-6.742 15.060-15.060c0-8.305-6.723-15.040-15.023-15.060h-0.002q-0.035-0-0.070 0z"></path>
                            </svg>
                            </span>
                            </a>
                            <img src={copylink} className='w-[32px] h-[32px] opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out cursor-pointer' onClick={() => copyToClipboard(url)}/>
                        </div>
                    </div>
                    </div>)}
                    <div className='mt-[40px]'>
                    
                    <h1 className='text-[#FFFFFF] font-epilogue font-semibold text-[20px] py-[5px] px-[20px]'>Campaign Creator</h1>
                    <div className='grid grid-rows-3 grid-flow-col gap-4 mt-[20px]'>
                    <div className='row-span-3 w-[100px] h-[100px]'>
                    <img src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign?.profilePhoto}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`} alt='avatar' className='w-[100px] h-[100px] object-contain  rounded-full'/>
                    </div>
                             <div className='col-span-2 flex'>
                             <img 
                                src={email} 
                                className='w-[40px] h-[40px] opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out cursor-pointer'
                                {...(address ? { onClick: () => copyToClipboard(campaign?.phoneNumber) } : {})}
                              />
                            {address ? (<p className='my-auto opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out text-[14px] hover:text-[#FFDD00] text-[#FFFFFF] cursor-pointer' onClick={() => copyToClipboard(campaign?.phoneNumber)}>{campaign?.phoneNumber}</p>):(<p className='my-auto text-[14px] text-[#FFFFFF]'>Shown only to connected users</p>)}
                            </div>
                            <div className='col-span-2 flex mx-[2px]'>
                            <img src={copylink} className='w-[40px] h-[40px] opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out cursor-pointer' onClick={() => copyToClipboard(campaign?.owner)}/>
                            <a href={`https://base.blockscout.com/address/${campaign?.owner}`} target='_blank' className='text-[12px] opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out hover:text-[#FFDD00] text-[#FFFFFF] my-auto truncate'>{campaign?.owner}</a>
                            </div>
                        
                        </div>
                        
                    </div>



                    <div className='h-[40px] w-[85%] mx-[auto] !text-[16px]'>
                        {campaign?.owner === address&&(remainingDays <= 0) && campaign?.iscashedout===false ? (<>
                      <TransactionButton
                      className={"!w-full !h-full !mx-[auto] !bg-[#FFDD00] !opacity-[60%] !hover:opacity-[100%] !duration-500 !ease-in-out !hover:bg-[#FFDD00] !text-[#000000] !font-epilogue !font-semibold !text-[16px] !py-[5px] !px-[10px] !rounded-[5px] !text-[14px]"}
                      transaction={() => {
                        // Create a transaction object and return it
                        const tx = prepareContractCall({
                          contract:CrowdFunding1,
                          method: "function withdrawCampaign(uint256 _id)",
                          params: [campaignId],
                          value: 0,
                        });
                        return tx;
                      }}
                      onTransactionSent={(result) => {
                        console.log("Transaction submitted", result.transactionHash);
                      }}
                      onTransactionConfirmed={(receipt) => {
                        console.log("Transaction confirmed", receipt.transactionHash);
                      }}
                      onError={(error) => {
                        console.error("Transaction error", error);
                      }}
                    >
                      Withdraw
                    </TransactionButton>
                    </>
                      ):(
                      
                      <></>)}      
                    </div>
                    <h1 className='text-[#FFFFFF] font-epilogue font-semibold text-[20px] py-[5px] px-[20px] mt-[25px]'>Website Comment</h1>
                    <div className='border-[1px] border-[#FFDD00] rounded-[10px] mt-[20px] min-h-[60px]'>
                        <p className='text-[#FFFFFF] font-epilogue font-semi text-[14px] py-[15px] px-[20px] mx-auto text-center'>{campaign?.websiteComment}</p>
                    </div>
                    <h1 className='text-[#FFFFFF] font-epilogue font-semibold text-[20px] py-[5px] px-[20px] mt-[25px]'>Supporters</h1>
                    <div className='w-full h-[250px] overflow-auto touch-auto'>
                    {investors !== undefined && ( <Investors investors={investors} websiteComment={campaign?.websiteComment} />)}
                    </div>
                </div>
            </div> </>)}


          
        </>
        )}

export default CampaignDetails