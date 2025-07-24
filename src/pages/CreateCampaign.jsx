import React, { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Featured from '../components/Featured';
import { useContract } from '@thirdweb-dev/react';
import { useStateContext } from '../context';
import {logoOfWebsite,usdcoinusdclogo } from '../assets';
import { FormField, Loader,FeaturedMobile, IPFSMediaViewer} from '../components';
import { TransactionButton } from 'thirdweb/react';
import { useMediaQuery } from 'react-responsive';
import {prepareContractCall,createThirdwebClient} from "thirdweb";
import { PinataSDK } from "pinata";
const CreateCampaign = () => {
  const pinata = new PinataSDK({
    pinataJwt: import.meta.env.VITE_PINATA_JWT,
    pinataGateway: "bronze-sticky-guanaco-654.mypinata.cloud",
  });
  const [calculatedReward, setCalculatedReward] = useState(0);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const client = createThirdwebClient({clientId:import.meta.env.VITE_THIRDWEB_CLIENT})
    const navigate = useNavigate();
    const isValidCID = (hash) => {
        // This is a basic regex pattern for CID validation. Consider using libraries for thorough validation.
        const pattern = /^[a-zA-Z0-9]{46}$/;
        return pattern.test(hash);
      };
    const [isLoading, setIsLoading] = useState(false);
    const [theDecimals,setTheDecimals] = useState(0);
    const [VIP,setVIP] = useState(false);
    const [symbol,setSymbol] = useState('');
    const { address,createCampaign,getPrice,setApprovalReward,CrowdFunding,CrowdFunding1,HexToInteger,getDiscountRatePrencentage, setApproval,USDT1} = useStateContext();
    const [form, setForm] = useState({
      email: '',
      title: '',
      description: '',
      target: '', 
      endDate: '',
      videoLinkFromPinata: '',
      profileImageLinkFromPinata: '',
      typeOfCampaign: '',
      minAmount: '',
      rewardAddress: '',
      amountReward: '',
    });
    const { contract: RewardContract } = useContract(form.rewardAddress);
    const [AmountForApprove, SetAmountForApprove] = useState(0);
    
    const [price, setPrice] = useState(0);
    const Approve = async () => {
      setIsLoading(true);
      try {
        await setApproval(price);
        setIsLoading(false);
      } catch (error) {
        console.error('Error approving:', error);
        setIsLoading(false);
      }
    };

    const ApproveVIP = async () => {
      setIsLoading(true);
      try {
        await setApproval(((100-discount)*price)/(100));
        setIsLoading(false);
      } catch (error) {
        console.error('Error approving:', error);
        setIsLoading(false);
      }
    };

    const ApproveReward = async (rewardAddress,decimalsOfReward) => {
      setIsLoading(true);
      try {
        await setApprovalReward((((calculatedReward*10825/10000+1)*10**decimalsOfReward)), rewardAddress);
        setIsLoading(false);
      } catch (error) {
        console.error('Error approving:', error);
        setIsLoading(false);
      }
    };
    const [discount, setDiscount] = useState(29);
  
    const campaignCategories = [
      "Startup Funding",
      "Small Business Support",
      "Women in Business",
      "Youth Entrepreneurship",
      "Social Entrepreneurship",
      "Tech Innovations for Good",
      "Creative Arts Ventures",
      "Disaster Relief",
      "Emergency Medical Aid",
      "Refugee Support",
      "Environmental Crisis Response",
      "Agriculture and Farming",
      "Token Launch",
      "Blockchain Development",
      "Decentralized Finance (DeFi)",
      "Crypto Education and Training",
      "Cryptocurrency Mining",
      "Wallet and Security Solutions",
      "Blockchain Gaming",
      "Regulatory and Legal Projects",
      "Global Health Initiatives",
      "Education for All",
      "Clean Water and Sanitation",
      "Hunger and Food Security"
    ];

    

    const handleFormFieldChange = (fieldName, e) => {
        setForm({ ...form, [fieldName]: e.target.value })
      }

      useEffect(() => {
        window.scrollTo(0, 0);
        
          async function fetchPrice() {
            const ThePrice = await getPrice();
            setPrice(HexToInteger(ThePrice._hex));
          }
          async function fetchDiscount() {
            const TheDiscount = await getDiscountRatePrencentage();
            await setDiscount(TheDiscount);
          }

          async function isCustomer() {
            const data = await CrowdFunding.call('isCustomer',[address]);
            setVIP(data);
          }
          if(CrowdFunding){
          fetchDiscount();
          fetchPrice();
          if(address) {
            isCustomer();
          }
        }
      }, [CrowdFunding,price,discount,address]);

      useEffect(() => {
        async function getDecimals() {
          setIsLoading(true);
          const decimals = await RewardContract.call('decimals');
          setTheDecimals(decimals);
          setIsLoading(false);
        }

        async function getSymbol(rewardAddress) {
          setIsLoading(true);
          if(rewardAddress=='0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2') {
            setSymbol('USDT');
          }
          else {
            const data = await RewardContract.call('symbol');
            setSymbol(data);
          }
          setIsLoading(false);
        }
        if(RewardContract) {
          getDecimals();
          getSymbol(form.rewardAddress);
        }
        else if(!RewardContract) {
          setSymbol('');
        }
        // Calculate the reward amount whenever target or minAmount changes
        if (form.target && form.minAmount) {
          const targetAmount = parseFloat(form.target);
          const pricePerReward = parseFloat(form.minAmount);
          const calculatedAmount = targetAmount / pricePerReward;
          setCalculatedReward(calculatedAmount);
        } else {
          setCalculatedReward(0);
        }
      }, [form.target, form.minAmount,form.rewardAddress,RewardContract]);

      const submitForm = async () => {
        setIsLoading(true);
        if(isValidCID(form.videoLinkFromPinata) && isValidCID(form.profileImageLinkFromPinata)){
          await createCampaign({ ...form });
          navigate('/my-campaigns');
    }
    else { alert('Invalid CID')}
    setIsLoading(false);
}
const isDisabled = !form.profileImageLinkFromPinata || !form.videoLinkFromPinata || !form.endDate || !form.target || !form.description || !form.title || !form.typeOfCampaign || !form.email;

  return (
    <div className='w-full linear-gradient1 py-[20px]'>
      <div className="mx-auto">
        {isMobile ? <FeaturedMobile /> : <Featured
        />}
        </div>
    <div className='rounded-[15px] w-full border-[1px] linear-gradient border-[#242424] mt-[40px] overflow-auto touch-auto'>
        {isLoading && <Loader />}
        <div className='sm:w-9/12 w-11/12 mx-auto mt-[40px]'>
            <h1 className='text-white font-epilogue sm:text-[50px] font-semibold text-[18px] mb-[20px] text-[25px]'>Start New Campaign</h1>
            <div className='mt-[15px]'>
                <div className='sm:flex sm:gap-[20px]'>
                    <FormField
                        labelName="Email or Phone Number Include Country Code*"
                        placeholder="example@email.com"
                        inputType="text"
                        value={form.email}
                        handleChange={(e) => handleFormFieldChange('email', e)}
                    />
                    <label className="flex-1 w-full flex flex-col">
                    <span className="font-epilogue font-medium text-[20px] leading-[22px] text-[#FFFFFF] sm:mb-[5px] mb-[10px] mt-[30px] sm:mt-[0px]">
                        Campaign Category *
                    </span>
                    <select
                      required
                      value={form.typeOfCampaign}
                      onChange={(e) => handleFormFieldChange('typeOfCampaign', e)}
                      className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-linear-gradient2 linear-gradient1 font-epilogue text-white text-[14px] placeholder:text-[#FFFFFF] rounded-[5px] h-[53px] bg-gray-800 [&>*]:bg-gray-800"
                    >
                      <option value="">Select Campaign Category</option>
                      {campaignCategories.map((category, index) => (
                        <option key={index} value={category} className="bg-gray-800 hover:bg-gray-700">
                          {category}
                        </option>
                      ))}
                    </select>
                    </label>
                </div>
                <div className='sm:w-[49%] w-full my-[35px]'>
                    <FormField
                        labelName="Campaign Title*"
                        placeholder="Campaign Title"
                        inputType="text"
                        value={form.title}
                        handleChange={(e) => handleFormFieldChange('title', e)}
                    />
                </div>
                <div className='mb-[35px]'>
                    <FormField
                    style='bg-[#424242]'
                        labelName="Campaign Description*"
                        placeholder="$This is centrelized text$
~This is a yellow text~
*This is bold text*
^This is bigger sized text, can apply only once^
You can use all of the signs on the same texts or some of them.                        
                        "
                        inputType="text"
                        isTextArea
                        value={form.description}
                        handleChange={(e) => handleFormFieldChange('description', e)}
                    />
                    </div>
                    <div className='sm:w-7/12 w-[100%] relative h-[100px] my-[60px] sm:block sm:left-[180px]'>
                        <h3 className='text-white font-epilogue font-bold sm:text-[60px] text-[40px] absolute z-[2] top-[-20px]'>Special Offer</h3>
                        <div className='linear-gradient-special-offer w-full sm:h-[140px] h-[127px] left-[-27px] absolute rounded-[10px] z-[1] text-[#000000]'>
                           <div className='sm:my-[20px] my-[10px] ml-[20px] sm:text-[26px] text-[15px]'>
                                <div className='flex justify-left sm:gap-2 my-auto'>
                                    <p> You'll get </p><p className='font-bold ml-[5px] mr-[5px]'> 90% </p><p> of the raised amount.</p>
                                </div>
                                 <div className='flex justify-left sm:gap-2'>
                                    <p className='mt-[5px]'>Create Commission is</p><p className='font-bold ml-[5px] mt-[5px]'>{(price/1e6).toFixed(2)}</p>
                                    <img src={usdcoinusdclogo} className='h-[35px] w-[35px] ml-[10px]'/>
                                </div>
                                <p className='mt-[5px] font-bold'> 8.25% Of raised amount Goes to Market Liquidity and 8.25% of deposited reward</p>
                           </div>
                        </div>
                        <div className='arrow-left w-[0] h-[0] sm:top-[0px] top-[-12px] border-t-[0px] border-b-[0px] border-r-[0px] border-[#000000] absolute z-[2] right-[15px] sm:right-[25px]'>
                        </div>
                    </div>

                    <div className='sm:w-7/12 w-[95%] relative h-[100px] my-[60px] sm:block sm:left-[400px]'>
                        <h3 className='text-white font-epilogue font-bold sm:text-[60px] text-[40px] absolute z-[2] top-[-20px]'>VIP Discount</h3>
                        <div className='linear-gradient-special-offer w-full sm:h-[100px] h-[75px] left-[-27px] absolute rounded-[10px] z-[1] text-[#000000]'>
                           <div className='sm:my-[20px] my-[10px] ml-[20px] sm:text-[26px] text-[15px]'>
                                <div className='flex justify-left sm:gap-2'>
                                    <p>VIP Campaigners has</p><p className='font-bold ml-[5px] mr-[5px]'> {discount} % </p><p> discount</p>
                                </div>
                                 <div className='flex justify-left sm:gap-2'>
                                    <p>on the create commission!</p>
                                </div>
                           </div>
                        </div>
                        <div className='arrow-left w-[0] h-[0] sm:top-[0px] top-[-12px] border-t-[0px] border-b-[0px] border-r-[0px] border-[#000000] absolute z-[2] right-[25px] sm:right-[25px]'>
                        </div>
                    </div>

                    <div className='sm:w-6/12 w-full relative h-[120px] my-[60px] sm:block sm:left-[350px]'>
                        <h3 className='text-white font-epilogue font-bold sm:text-[60px] text-[40px] absolute z-[100] top-[-20px]'>Reward investors</h3>
                        <div className={`linear-gradient-special-offer w-full left-[-27px] absolute rounded-[10px] z-[1] text-[#000000] ${form.profileImageLinkFromPinata.length>0 ? ('sm:h-[120px] h-[120px]'):('sm:h-[100px] h-[100px]')}`}>
                           <div className='sm:my-[20px] my-[10px] ml-[20px] sm:text-[26px] text-[15px]'>
                                <div className='flex justify-left sm:gap-2'>
                                    <p>Each investor of yours gets a reward</p>
                              
                              
                                </div>
                                <div className='flex sm:justify-left sm:gap-2'>
                                <p>based on the price you choose</p>
                                </div>
                                {form.profileImageLinkFromPinata.length>0 ? (<IPFSMediaViewer
                                  ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${form.profileImageLinkFromPinata}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                                  className='!w-[50px] flex sm:justify-left h-[50px] gap-2'/>
                                ):(<>
                                <div className='w-[50px] h-[50px]'>

                                </div>
                                </>)}
                                
                           </div>
                        </div>
                        <div className='arrow-left w-[0] h-[0] sm:top-[0px] top-[-12px] border-t-[0px] border-b-[0px] border-r-[0px] border-[#000000] absolute z-[2] right-[25px] sm:right-[25px]'>
                        </div>
                    </div>

                    <div className='sm:flex sm:gap-[30px] my-[30px] justify-items-stretch'>
                        <div className='sm:w-3/12 w-full flex-none'>
                    <FormField
                        labelName="Target Amount*"
                        placeholder="$USDC Goal"
                        inputType="number"
                        value={form.target}
                        handleChange={(e) => handleFormFieldChange('target', e)}
                    />
                    </div>
                    <div className='w-full my-[40px] sm:my-[0px] sm:w-3/12 sm:flex-none'>
                    <FormField
                        labelName="End Date*"
                        placeholder="End Date"
                        inputType="date"
                        value={form.endDate}
                        handleChange={(e) => handleFormFieldChange('endDate', e)}
                    />
                    </div>
                    <div className='w-full mb-[40px] sm:mb-[0] sm:justify-self-end'>
                    <FormField
                        style={'flex-end'}
                        labelName="Video CID From IPFS*"
                        placeholder="CID"
                        value={form.videoLinkFromPinata}
                        handleChange={(e) => handleFormFieldChange('videoLinkFromPinata', e)}
                    /> 
                    </div>   
                    </div>
                    <div className='mb-[40px]'>
                    <FormField 
                        labelName="ERCUltra Logo CID From IPFS (1:1 Ratio)*"
                        placeholder="CID (1:1)"
                        inputType="text"
                        value={form.profileImageLinkFromPinata}
                        handleChange={(e) => handleFormFieldChange('profileImageLinkFromPinata', e)}
                    />
                    </div>
                    <div className='mb-[40px]'>
                    <p className='text-[#ff9900] text-[18px] text-center font-bold mb-[10px]'>Cannot continue without ERCUltra/ERC20 reward</p>
                    <FormField 
                        labelName="Your ERCUltra/ERC20 Reward To Your Investors*"
                        placeholder="Address"
                        inputType="text"
                        value={form.rewardAddress}
                        handleChange={(e) => handleFormFieldChange('rewardAddress', e)}
                    />
                    </div>
                    <div className='sm:flex sm:justify-center'>
                    <div className='mb-[40px]'>
                    <FormField 
                        labelName="Price Of Reward In $USDC*"
                        placeholder="Amount"
                        inputType="number"
                        step="0.000001"  // Allow for very small fractions
                        min="0"
                        value={form.minAmount}
                        handleChange={(e) => handleFormFieldChange('minAmount', e)}
                    />
                    </div>
                    <div className='mb-[40px] mx-[30px]'>
                      <label className="font-epilogue font-medium text-[14px] leading-[22px] text-[#FFFFFF] mb-[10px]">
                        Amount Of Reward To Deposit In The Campaign*
                      </label>
                      <div className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[14px] placeholder:text-[#4b5264] rounded-[10px]">
                        {calculatedReward.toFixed(2)*10825/10000}
                      </div>
                    </div>
                    </div>
                    <p className='text-[#ff9900] text-[18px] text-center font-bold'>If didn't approved, Send For Verification won't work!</p>
                    {address ? (<>
                      <div className='sm:flex sm:justify-center mb-[40px]'>
                      {VIP ? (<>
                        <button className={`!sm:w-3/12 w-full bg-[#FFDD00] text-[#000000] font-epilogue font-semibold text-[16px] py-[15px] px-[40px] rounded-[5px] transition-colors duration-300 ease-in-out mt-[20px] mr-[15px]`}   onClick={() => ApproveVIP()}>Approve VIP Commision Payment</button>
                      </>):(<>
                        <button className={`!sm:w-3/12 w-full bg-[#FFDD00] text-[#000000] font-epilogue font-semibold text-[16px] py-[15px] px-[40px] rounded-[5px] transition-colors duration-300 ease-in-out mt-[20px] mr-[15px]`}   onClick={() => Approve()}>Approve Commision Payment</button>
                      </>)}
                    {symbol=='' ? (<></>):(
                      <>
                      <button className={`!sm:w-3/12 w-full bg-[#FFDD00] text-[#000000] font-epilogue font-semibold text-[16px] py-[15px] px-[40px] rounded-[5px] transition-colors duration-300 ease-in-out mt-[20px] mr-[15px]`}   onClick={() => ApproveReward(form.rewardAddress,theDecimals)} disabled={calculatedReward==0||form.rewardAddress==''}>Approve {symbol} Deposit</button>
                  <TransactionButton
                  
    className={`!font-bold ${isMobile? ('!w-full'):('!w-3/12')}  !bg-[#FFDD00] !hover:bg-orange-400 !mt-[20px] !h-[60px] text-black font-semibold !py-2 !px-4 !rounded-[5px] shadow-md transition-colors duration-300 ease-in-out`}
    transaction={async() => {
      if(form.typeOfCampaign.length==0) {
        return;
      }
      const upload = await pinata.upload.json({
        name: `UltimateDeAl Campaign Creation`,
        description: `Campaign created by ${address}`,
        external_url: "https://ultimatedeal.net/",
        image: `https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/QmP5kZ1SEiaETYnd6y4VC7qFkbQTjYiNwjUpgid1VCwgjq?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`,
        attributes: [
          { trait_type: "Creation Date", value: new Date().toISOString().substring(0,10) },
          { trait_type: "Email", value: form.email },
          { trait_type: "Title", value: form.title },
          { trait_type: "Goal", value: `${(form.target/1).toFixed(2)} $USDC` },
          { trait_type: "Deadline", value: new Date(form.endDate).toISOString().substring(0,10) },
          { trait_type: "Reward To Investors", value: symbol },
          { trait_type: "Reward Address", value: form.rewardAddress },
          { trait_type: "Price Of Reward", value: `${(form.minAmount/1).toFixed(3)} $USDC` }
        ]
      })

      // Create a transaction object and return it
      const tx = await prepareContractCall({
        contract:CrowdFunding1,
          method: "function createCampaign(string _profilePic, string _phoneNumber, string _title, string _description, uint256 _target, uint256 _endDate, string _videoLinkFromPinata, string _type, address _rewardTokenAddress, uint256 _initialRewardDeposit, uint256 _priceOfReward, string tokenURI) returns (uint256)",
          params: [form.profileImageLinkFromPinata,form.email, form.title, form.description, form.target*1e6, Math.floor(new Date(form.endDate).getTime() / 1000), form.videoLinkFromPinata, form.typeOfCampaign, form.rewardAddress,Math.round((calculatedReward)*10**theDecimals), form.minAmount*1e6,await upload.IpfsHash],
      });
      return tx;
    }}
    onTransactionSent={(result) => {
      console.log("Transaction submitted", result.transactionHash);
    }}
    onTransactionConfirmed={(receipt) => {
      console.log("Transaction confirmed", receipt.transactionHash);
      navigate('/my-campaigns');
    }}
    onError={(error) => {
      alert("If need help contact support at support@ultimatedeal.net\nError:\n", error);
    }}
  >
    Send For Verification
  </TransactionButton>
  </>
                  )}
                        </div>
                    </>) : (<>
                      <p className='text-[#ff9900] text-[22px] py-[20px] text-center font-bold'>Kindly Connect to continue.</p>
                    </>)}
            </div>
        </div>
    </div>
    </div>
  )
}

export default CreateCampaign