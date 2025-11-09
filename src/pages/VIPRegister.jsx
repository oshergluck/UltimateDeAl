import React, { useState,useEffect} from 'react';
import { useNavigate} from 'react-router-dom';
import { useStateContext} from '../context';
import { CustomButton, Loader} from '../components';
import { profile,pencel_desk,
  lightning_desk,
  stairsvip_desk} from '../assets';
import {fontSizes} from '../components/AccessibilityMenu';
import { createThirdwebClient, prepareContractCall, getContract } from "thirdweb";
import { useSendTransaction,TransactionButton } from 'thirdweb/react';

const VIPRegister = () => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const navigate = useNavigate();
  const { addANewCustomer,Shop,encrypt,getPrice,CrowdFunding,HexToInteger,getDiscountRatePrencentage,LandingPageContactUs,getTotal,isconnected,address} = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [costumerName, setCostumerName] = useState('');
  const [costumerEmail, setCostumerEmail] = useState('');
  const [Total, setTotal] = useState(0);
  const [costumerPhoneNum, setNewPhoneNum] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');

  const fetchTotal = async () => {
    setIsLoading(true);
    const data = await getTotal();
    setIsLoading(false);
    setTotal(data);
    return data;
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    const now = new Date();
    const formattedDateTime = now.toLocaleString(); // This will format the date and time based on the user's locale
    setCurrentDateTime(formattedDateTime);
    if(CrowdFunding){
      async function fetchPrice() {
        const ThePrice = await getPrice();
        setPrice(HexToInteger(String(ThePrice)));
      }
      async function fetchDiscount() {
        const TheDiscount = await getDiscountRatePrencentage();
        setDiscount(String(TheDiscount));
      }
      fetchDiscount();
      fetchPrice();
      fetchTotal();
    }
  }, [CrowdFunding,price,discount,Total]);

  const handleCostumer = async () => {
    setIsLoading(true);
    if(costumerEmail !== '' && costumerPhoneNum !== ''){
    await addANewCustomer(costumerName, costumerEmail,costumerPhoneNum);
    await navigate('/create-campaign');
    }
    else {
      setIsLoading(false);
      alert('Please fill in all the fields');
    }
  }

  

  const handleEmail = async () => {
    await LandingPageContactUs();
  }

  return (
    <>{isLoading && <Loader />}
      <div className='rounded-t-[15px] linear-gradient py-10 w-full mt-[50px]'>
      <div className='sm:w-10/12 w-full mx-auto mt-[50px]'>
      <h1 className='text-[#FFFFFF] text-[25px] font-semibold sm:ml-[0] ml-[25px]'>VIP Register</h1>
      <div className="flex-1">  
          <div className=" sm:flex sm:flex-col p-4 rounded-[2px]">
            <p className="font-epilogue font-bold text-[20px] leading-[30px] text-center text-[#FFDD00] drop-shadow-md">
              Your Details, Must Be Connected To The Platform
            </p>
            <div className="mt-[10px] sm:gap-[40px] sm:flex sm:justify-center">
              <input 
                type="text"
                placeholder="Name"
                id = "costumerName"
                className="sm:flex-initial sm:justify drop-shadow-md h-[65px] sm:w-4/12 w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] font-epilogue !text-white !text-[18px] leading-[30px] placeholder:text-[#FFFFFF] bg-[#3b3b3b] rounded-[5px] mt-[10px]"
                value={costumerName}
                maxLength={25}
                onChange={(e) => setCostumerName(e.target.value)}
              />
                <input
                  type="text"
                  id="costumerEmail"
                  value={costumerEmail}
                  onChange={(e) => setCostumerEmail(e.target.value)}
                  maxLength={50}
                  placeholder="Email"
                  className='sm:flex-initial sm:justify h-[65px] drop-shadow-md sm:w-4/12 w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] font-epilogue !text-white !text-[18px] leading-[30px] placeholder:text-[#FFFFFF] bg-[#3b3b3b] rounded-[5px] mt-[10px]'
                />
                <input
                  type="text"
                  id="costumerPhoneNum"
                  value={costumerPhoneNum}
                  onChange={(e) => setNewPhoneNum(e.target.value)}
                  maxLength={50}
                  placeholder="Phone Number"
                  className='sm:flex-initial sm:justify h-[65px] drop-shadow-md sm:w-4/12 w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] font-epilogue !text-white !text-[18px] leading-[30px] placeholder:text-[#FFFFFF] bg-[#3b3b3b] rounded-[5px] mt-[10px]'
                />
                </div>
              
             <p className={`text-${fontSizes} text-[#FFFFFF] drop-shadow-md sm:text-${fontSizes} mt-[25px] w-10/12`}>By sending your details, you confirm to get updates about ultrashop.tech
             <br/>
             Be aware the discount changes from time to time.
             <br/>
             You can always ask to get out of the list, or get yourself out by using the smart contract function.
             </p>
          </div>
        </div>
        </div>
        <div className='m-auto w-[220px] mb-[35px] sm:mt-[0]'>
        {address ? (<>
          <TransactionButton
                disabled={!costumerName || !costumerEmail || !costumerPhoneNum}
    className={`mb-[20px] !bg-cyan-400 !mt-[30px] hover:bg-orange-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out flex-1 ${!costumerName || !costumerEmail || !costumerPhoneNum ? 'opacity-50 cursor-not-allowed' : ''}`}
    
      transaction={async () => {
           const encryptedName = await encrypt(costumerName, address,import.meta.env.VITE_ULTIMATEDEAL_STORE);
           const encryptedEmail = await encrypt(costumerEmail, address,import.meta.env.VITE_ULTIMATEDEAL_STORE);
           const encryptedPhoneNumOfClient = await encrypt(costumerPhoneNum, address,import.meta.env.VITE_ULTIMATEDEAL_STORE)
           let temp = 'UltimateDeAl PORT';
           const encryptedPhysicalAddressOfClient = await encrypt(temp, address,import.meta.env.VITE_ULTIMATEDEAL_STORE);
        // Create a transaction object and return it
        const tx = prepareContractCall({
          contract:Shop,
            method: "function registerClient(string memory _name, string memory _email, string memory _phoneNum, string memory _physicalAddress)",
            params: [encryptedName, encryptedEmail, encryptedPhoneNumOfClient, encryptedPhysicalAddressOfClient],
        });
        return tx;
      }}
      onTransactionSent={(result) => {
        console.log("Transaction submitted", result.transactionHash);
      }}
      onTransactionConfirmed={(receipt) => {
        console.log("Transaction confirmed", receipt.transactionHash);
        navigate('/create-campaign');
      }}
      onError={(error) => {
        console.error("Transaction error", error);
      }}
    >
      Register
    </TransactionButton>
        </>):(<CustomButton 
                btnType="button"
                title="Send"
                styles="w-[220px] m-auto items-center bg-[#FFDD00] text-[#000000] drop-shadow-md mt-[10px] opacity-50 cursor-not-allowed"
              />)}
              </div>
      </div>
      {/* ✨ New Intro Section ✨ */}
      <section className="bg-gradient-to-b from-[#000000] via-[#111111] to-[#1a1a1a] py-20 text-center px-6 sm:px-20 rounded-b-[40px] shadow-xl border-b border-[#333]">
        <h1 className="text-[#FFDD00] text-4xl sm:text-6xl font-bold mb-6">Welcome to UltraShop.tech</h1>
        <p className="text-white text-lg sm:text-xl max-w-4xl mx-auto leading-relaxed mb-8">
          UltraShop.tech is the next generation of <span className="text-[#FFDD00] font-semibold">crypto-based crowdfunding</span> — 
          where every campaign token can <span className="text-[#00FFFF] font-semibold">automatically distribute dividends</span> if needed.
        </p>

        <div className="max-w-5xl mx-auto text-left sm:text-center space-y-4">
          <p className="text-gray-200">💎 <strong>VIP Members</strong> enjoy <span className="text-[#FFDD00] font-semibold">{discount}% discount</span> on campaign creation fees.</p>
          <p className="text-gray-200">⚙️ Launch your own crowdfunding campaign instantly with <strong>auto-deployed smart contracts</strong>.</p>
          <p className="text-gray-200">🌐 8.25% of both raised funds and tokens are locked in <span className="text-[#00FFFF]">secure liquidity</span> for stability.</p>
          <p className="text-gray-200">💰 Campaign creators receive <span className="text-[#FFDD00] font-semibold">90%</span> of raised funds — the rest supports platform sustainability.</p>
          <p className="text-gray-200">🛍️ Advanced users can open a <strong>Web3 Store</strong> — managing software keys or digital items with <span className="text-[#00FFFF]">NFT barcode validation</span>.</p>
          <p className="text-gray-200">📜 Each purchase mints a <span className="text-[#FFDD00] font-semibold">unique NFT receipt</span> showing all transaction details.</p>
          <p className="text-gray-300 italic mt-4">
            Powered by <span className="text-[#00FFFF]">Base Network</span> — experience <strong>low gas, high speed, and true decentralization.</strong>
          </p>
        </div>
      </section>
                <div className='sm:w-10/12 w-full mx-auto sm:mt-[50px] mt-[50px] rounded-[15px]'>
      <h1 className='text-[#FFFFFF] font-semibold sm:text-[100px] text-[25px] text-center sm:pt-[90px]'>UltraShop</h1>
      <h1 className='text-[#FFFFFF] font-semibold sm:text-[100px] text-[25px] text-center sm:pt-[90px]'>Where Your Business</h1>
      <h1 className='text-[#FFFFFF] font-semibold sm:text-[100px] text-[25px] text-center sm:pt-[80px]'>Meets The Future</h1>

      <div className='w-6/12 hidden sm:block relative h-[100px] mt-[90px] items-center'>
                        <h3 className='text-white font-epilogue font-bold text-[60px] absolute z-[2] top-[-20px] right-[-230px]'>VIP Discount</h3>
                        <div className='linear-gradient-special-offer w-full h-[100px] absolute right-[-400px] rounded-[10px] z-[1] text-[#000000]'>
                           <div className='my-[20px] ml-[20px] text-[26px]'>
                                <div className='flex justify-left gap-2'>
                                    <p>VIP Campaigners has</p><p className='font-bold'> {discount}% </p><p> discount</p>
                                </div>
                                 <div className='flex justify-left gap-2'>
                                    <p>on the create commission!</p>
                                </div>
                           </div>
                        </div>
                        <div className='arrow-left w-[0] h-[0] border-t-[0px] border-b-[0px] border-r-[0px] border-[#000000] absolute z-[2] right-[-400px]'>
                        </div>
                    </div>


                    <div class="sm:grid sm:gap-4 sm:grid-cols-2 sm:w-9/12 w-11/12 mt-[45px] ml-[30px] sm:ml-[110px]">
                      <div className='rounded-[15px] sm:w-full w-11/12 border-[1px] border-[#454545] mb-[20px] sm:mb-[0px] sm:h-[210px] h-[220px]'>
                        <h1 className='text-[#FFDD00] text-[25px] font-semibold mt-[30px] mb-[10px] text-center'>Slash Those Fees</h1>
                        <p className='text-[#FFFFFF] font-epilogue text-[15px] py-[10px] px-[20px]'>Forget the hefty cuts taken by traditional banks. With $USDC, enjoy significantly lower transaction fees. More of your funds go where they belong -- to your project!</p>
                      </div>
                      <div className='rounded-[15px] sm:w-full w-11/12 border-[1px] border-[#454545] sm:h-[210px] h-[220px] mb-[20px] sm:mb-[0px]'>
                        <h1 className='text-[#FFDD00] text-[25px] font-semibold mt-[30px] mb-[10px] text-center'>Speed of Light Transactions</h1>
                        <p className='text-[#FFFFFF] font-epilogue text-[15px] py-[10px] px-[20px]'>Time is money, and with $USDC, you save both. Experience blazing-fast transactions leaving sluggish fiat processes in the dust.</p>
                      </div>
                      <div className='rounded-[15px] sm:w-full w-11/12 border-[1px] border-[#454545] sm:h-[210px] h-[220px] mb-[20px] sm:mb-[0px]'>
                        <h1 className='text-[#FFDD00] text-[25px] font-semibold mt-[30px] mb-[10px] text-center'>Reach Borderless Fundraising</h1>
                        <p className='text-[#FFFFFF] font-epilogue text-[15px] py-[10px] px-[20px]'>Break free from geographical and currency barriers. $USDC opens your campaign to a global audience, ready to support without the fuss of currency exchange.</p>
                      </div>
                      <div className='rounded-[15px] sm:w-full w-11/12 border-[1px] border-[#454545] sm:h-[210px] h-[220px] mb-[20px] sm:mb-[0px]'>
                        <h1 className='text-[#FFDD00] text-[25px] font-semibold mt-[30px] mb-[10px] text-center'>Unshakeable Security</h1>
                        <p className='text-[#FFFFFF] font-epilogue text-[15px] py-[10px] px-[20px]'>Blockchain technology brings a level of security and transparency that fiat can't match. Sleep easy knowing your campaign is fortified against fraud.</p>
                      </div>
                    </div>

          <div className='w-6/12 relative h-[100px] mt-[90px] items-center sm:block hidden'>
                        <h3 className='text-white font-epilogue font-bold text-[60px] absolute z-[2] top-[-20px] right-[-230px]'>VIP STATUS</h3>
                        <div className='linear-gradient-special-offer w-full h-[100px] absolute right-[-400px] rounded-[10px] z-[1] text-[#000000]'>
                           <div className='my-[35px] ml-[20px] text-[26px]'>
                                <h1 className='text-[#000000] font-semibold text-[52px]'>Your Golden Ticket</h1>
                           </div>
                        </div>
                        <div className='arrow-left w-[0] h-[0] border-t-[0px] border-b-[0px] border-r-[0px] border-[#000000] absolute z-[2] right-[-400px]'>
                        </div>
                    </div>

                    <h1 className='text-[#FFFFFF] font-semibold sm:text-[92px] text-[25px] text-center sm:pt-[78px]'>Join The Elite Circle</h1>
                    <h1 className='text-[#FFFFFF] font-semibold sm:text-[85px] text-center text-[25px] sm:pt-[78px]'>Of ultrashop.tech Clients</h1>

                    <div class="sm:grid sm:grid-cols-3 sm:justify sm:flex-wrap sm:justify-items-stretch sm:flex w-full mx-auto mt-[45px] sm:block hidden">
                        <div className='rounded-[15px] sm:justify sm:flex sm:flex-auto w-full h-[210px]'>
                        <div>
                            <h1 className='text-[#FFDD00] text-[25px] font-semibold mt-[30px] mb-[10px] text-center h-[50px]'>Exclusive Discounts on Every Launch</h1>
                            <p className='text-[#FFFFFF] font-epilogue text-[15px] py-[5px] px-[20px] text-center'>As a VIP, the red carpet rolls out with changeable discounts on your campaign's opening commission. This is more than a saving; it's a boost to your fundraising power.</p>
                            </div>
                          </div>
                          <div className='rounded-[15px] sm:justify sm:flex sm:flex-auto w-full h-[210px]'>
                          <div>
                            <h1 className='text-[#FFDD00] text-[25px] font-semibold mt-[30px] mb-[10px] text-center h-[50px]'>First-Class Support and Insights</h1>
                            <p className='text-[#FFFFFF] font-epilogue text-[15px] py-[5px] px-[20px] text-center'>VIPs deserve VIP treatment. Get access to premium support and insights to propel your campaign to new heights.</p>
                            </div>
                          </div>
                          <div className='rounded-[15px] sm:justify sm:flex w-full sm:flex-auto h-[210px]'>
                            <div>
                            <h1 className='text-[#FFDD00] text-[25px] font-semibold mt-[30px] mb-[10px] text-center h-[50px]'>Stay Ahead with VIP Updates</h1>
                            <p className='text-[#FFFFFF] font-epilogue text-[15px] py-[5px] px-[20px] text-center'>Be the first to know about changes in discounts and rates, keeping you ahead in the fundraising and success game.</p>
                          </div>
                          </div>
                    </div>

                    <h1 className='text-[#FFFFFF] font-semibold sm:text-[92px] text-[25px] text-center sm:pt-[78px]'>Your Journey To</h1>
                    <h1 className='text-[#FFFFFF] font-semibold sm:text-[85px] text-[25px] sm:pt-[78px] text-center'>Success, Starts Here</h1>

                    <h3 className='text-[#FFDD00] text-[25px] font-semibold mt-[60px] mb-[10px] text-center'>Step 1</h3>
                    <p className='text-[#FFFFFF] font-epilogue text-[15px] px-[20px] text-center'>Connect your wallet to the platform.</p>
                    <h3 className='text-[#FFDD00] text-[25px] font-semibold mt-[30px] mb-[10px] text-center'>Step 2</h3>
                    <p className='text-[#FFFFFF] font-epilogue text-[15px] px-[20px] text-center'>Enter a little amount of ETH, The website works on Base blockchain</p>
                    <h3 className='text-[#FFDD00] text-[25px] font-semibold mt-[30px] mb-[10px] text-center'>Step 3</h3>
                    <p className='text-[#FFFFFF] font-epilogue text-[15px] px-[20px] text-center'>Fill in your details and submit the form.</p>
                    

                    <h1 className='text-[#FFFFFF] font-semibold sm:text-[92px] text-[25px] text-center leading-none'>Join ultrashop.tech Revolution</h1>
                    <div className='sm:w-9/12 w-10/12 sm:flex sm:justify-center ml-[50px] sm:ml-[120px] mx-auto mt-[30px]'>
                      <div className='sm:w-3/12 sm:flex sm:flex-col w-10/12 items-center'>
                          <img src={stairsvip_desk} alt='stairs' className='mb-[15px] mx-auto'/>
                          <p className="text-[#FFDD00] font-semibold mt-[10px] mb-[10px] text-center">Ready to elevate your business to blockchain?</p>
                      </div>
                      <div className='sm:w-3/12 sm:flex sm:flex-col w-10/12 sm:mx-[30px]'>
                          <img src={lightning_desk} alt='pencil' className='mb-[5px] mx-auto'/>
                          <p className="text-[#ffffff] font-semibold mt-[10px] mb-[10px] text-center">Embrace the power of $USDC and the privilage of being VIP</p>
                      </div>
                      <div className='sm:w-3/12 sm:flex sm:flex-col w-10/12 items-center'>
                          <img src={pencel_desk} alt='lightning' className='mb-[10px] mx-auto'/>
                          <p className="text-[#FFDD00] font-semibold mt-[10px] mb-[10px] text-center">Fill The Form Here And Register Now For Unlocking Your VIP Benefits </p>
                      </div>
                  </div>

                  <div className='mx-auto w-full'>
                    <p className='text-[#FFFFFF] font-epilogue text-[15px] py-[5px] px-[20px] mt-[50px]'>For More Information</p>
                    <CustomButton
                    btnType="button"
                    title="Contact Us"
                    styles="w-[220px] m-auto items-center bg-[#FFDD00] text-[#000000] drop-shadow-md mt-[10px]"
                    handleClick={handleEmail}
                    />
                    </div>


                    <div className='rounded-[15px] linear-gradient py-10 w-full mt-[50px]'>
      <div className='sm:w-10/12 w-full mx-auto mt-[50px]'>
      <h1 className='text-[#FFFFFF] text-[25px] font-semibold pt-[50px] sm:ml-[0] ml-[25px]'>VIP Register</h1>
      <div className="sm:flex-1">  
          <div className=" sm:flex sm:flex-col p-4 rounded-[2px]">
            <p className="font-epilogue font-bold text-[20px] leading-[30px] text-center text-[#FFDD00] drop-shadow-md">
              Your Details, Must Be Connected To The Platform
            </p>
            <div className="mt-[10px] sm:gap-[40px] sm:flex sm:justify-center">
              <input 
                type="text"
                placeholder="Name"
                id = "costumerName"
                className="sm:flex-initial sm:justify drop-shadow-md h-[65px] sm:w-4/12 w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] font-epilogue !text-white !text-[18px] leading-[30px] placeholder:text-[#FFFFFF] bg-[#3b3b3b] rounded-[5px] mt-[10px]"
                value={costumerName}
                maxLength={25}
                onChange={(e) => setCostumerName(e.target.value)}
              />
                <input
                  type="text"
                  id="costumerEmail"
                  value={costumerEmail}
                  onChange={(e) => setCostumerEmail(e.target.value)}
                  maxLength={50}
                  placeholder="Email"
                  className='sm:flex-initial sm:justify h-[65px] drop-shadow-md sm:w-4/12 w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] font-epilogue !text-white !text-[18px] leading-[30px] placeholder:text-[#FFFFFF] bg-[#3b3b3b] rounded-[5px] mt-[10px]'
                />
                <input
                  type="text"
                  id="costumerPhoneNum"
                  value={costumerPhoneNum}
                  onChange={(e) => setNewPhoneNum(e.target.value)}
                  maxLength={50}
                  placeholder="Phone Number"
                  className='sm:flex-initial sm:justify h-[65px] drop-shadow-md sm:w-4/12 w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] font-epilogue !text-white !text-[18px] leading-[30px] placeholder:text-[#FFFFFF] bg-[#3b3b3b] rounded-[5px] mt-[10px]'
                />
                </div>
              
             <p className={`text-${fontSizes} text-[#FFFFFF] drop-shadow-md sm:text-${fontSizes} mt-[25px] w-10/12`}>By sending your details, you confirm to get updates about ultrashop.tech
             <br/>
             Be aware the discount changes from time to time.
             <br/>
             You can always ask to get out of the list, or get yourself out by using the smart contract function.
             </p>
          </div>
        </div>
        </div>
        <div className='m-auto w-[220px]'>
        {address ? (<>
          <TransactionButton
                disabled={!costumerName || !costumerEmail || !costumerPhoneNum}
    className={`mb-[20px] !bg-cyan-400 !mt-[30px] hover:bg-orange-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out flex-1 ${!costumerName || !costumerEmail || !costumerPhoneNum ? 'opacity-50 cursor-not-allowed' : ''}`}
    
      transaction={async () => {
           const encryptedName = await encrypt(costumerName, address,import.meta.env.VITE_ULTIMATEDEAL_STORE);
           const encryptedEmail = await encrypt(costumerEmail, address,import.meta.env.VITE_ULTIMATEDEAL_STORE);
           const encryptedPhoneNumOfClient = await encrypt(costumerPhoneNum, address,import.meta.env.VITE_ULTIMATEDEAL_STORE)
           let temp = 'UltimateDeAl PORT';
           const encryptedPhysicalAddressOfClient = await encrypt(temp, address,import.meta.env.VITE_ULTIMATEDEAL_STORE);
        // Create a transaction object and return it
        const tx = prepareContractCall({
          contract:Shop,
            method: "function registerClient(string memory _name, string memory _email, string memory _phoneNum, string memory _physicalAddress)",
            params: [encryptedName, encryptedEmail, encryptedPhoneNumOfClient, encryptedPhysicalAddressOfClient],
        });
        return tx;
      }}
      onTransactionSent={(result) => {
        console.log("Transaction submitted", result.transactionHash);
      }}
      onTransactionConfirmed={(receipt) => {
        console.log("Transaction confirmed", receipt.transactionHash);
        navigate('/create-campaign');
      }}
      onError={(error) => {
        console.error("Transaction error", error);
      }}
    >
      Register
    </TransactionButton>
        </>):(<CustomButton 
                btnType="button"
                title="Send"
                styles="w-[220px] m-auto items-center bg-[#FFDD00] text-[#000000] drop-shadow-md mt-[10px] opacity-50 cursor-not-allowed"
              />)}
              </div>
      </div>

      

      </div>

      </>









  )
}

export default VIPRegister