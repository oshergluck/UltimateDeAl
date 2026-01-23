import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import { ETHLogo, logoOfWebsite,search,usdcoinusdclogo,VerifiedIcon,done_desktop} from '../assets';
import { CustomButton, Loader ,CustomDropdownStores,FormField,StarRatingForNewReview,ProductSearch,IPFSMediaViewer,RewardBadge} from '../components';
import { Base } from "@thirdweb-dev/chains";
import { ethers } from 'ethers';
import { useContract} from '@thirdweb-dev/react';
import { useNavigate } from 'react-router-dom';
import { fontSizes } from '../components/AccessibilityMenu';
import {createThirdwebClient,prepareContractCall, getContract,defineChain } from "thirdweb";
import { useSendTransaction,useReadContract ,TransactionButton,ConnectButton,MediaRenderer,useActiveAccount} from 'thirdweb/react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { PinataSDK } from "pinata";
import {
  createWallet,
  walletConnect,
  inAppWallet,
} from "thirdweb/wallets";

const Product = () => {
  const account = useActiveAccount();
  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    walletConnect(),
    createWallet("com.trustwallet.app"),
    createWallet("io.zerion.wallet"),
];
  const navigate = useNavigate();
  const [enc,setEnc] = useState(false);
  const pinata = new PinataSDK({
    pinataJwt: import.meta.env.VITE_PINATA_JWT,
    pinataGateway: "bronze-sticky-guanaco-654.mypinata.cloud",
  });
  const base = defineChain({
    id: 8453,
  });
  
  const client = createThirdwebClient({clientId:import.meta.env.VITE_THIRDWEB_CLIENT});
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const [theSymbolOfReward,setTheSymbolOfReward] = useState('');
  const [allowance,setAllowance] = useState(0);
  const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
  const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`;
  const [symbolPayment,setTheSymbolOfPayment] = useState('');
  
  const API_URL = import.meta.env.VITE_MONGO_SERVER_API+"/api";;

  const [allProducts, setAllProducts] = useState([]);
  const [type, setType] = useState('');
  const [physicalAddressOfClient, setPhysicalAddressOfClient] = useState('');
  const [emailOfClient, setEmailOfClient] = useState('');
  const [amountOfProduct, setAmountOfProduct] = useState(1);
  const [invoiceCounter,setCounter] = useState(0);
  const [nameOfClient, setNameOfClient] = useState('');
  const [storeContractByURL, setStoreContractByURL] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumOfClient, setPhoneNumOfClient] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [userRatingAvarage, setUserRatingAvarage] = useState(0);
  const [selectedRating, setSelectedRating] = useState(5);
  const [product,setProduct] = useState();
  const [storeBanner, setStoreBanner] = useState('');
  const [canLeaveReview, setCanLeaveReview] = useState(false);
  const [storeName, setStoreName] = useState('');
  const {storeRegistery, encrypt, address, isconnected, refreshPage, HexToInteger, getStoreDetails } = useStateContext();
  const StoreURL = window.location.pathname.split('/')[2];
  
  const [reviews, setReviews] = useState([]);
  const productUrl = window.location.pathname.split('/')[4];
  const [isRegistered,setIsRegistered] = useState(false);
  const [hasReceipt,setHasReceipt] = useState(false);
  const [receipt,setReceipt] = useState('');
  const [imagesOfProduct,setImagesOfProduct] = useState([]);
  const [paymentAddress,setPaymentAddress] = useState(import.meta.env.VITE_DEAL_COIN_ADDRESS);
  const [rewardAddress,setRewardAddress] = useState('');
  const [reward,setReward] = useState(0);
  const [invoicesAddress,setInvoicesAddress] = useState('');
  const [Balance,setBalance] = useState(0);
  const [ownerShip,setOwnerShip] = useState(false);
  const [showUnregisterModal, setShowUnregisterModal] = useState(false);
  const [confirmUnregister, setConfirmUnregister] = useState(false);

  const { contract:theStoreContract } = useContract(storeContractByURL);
  const { contract: rewardContract } = useContract(rewardAddress);
  const { contract: PaymentContract1 } = useContract(paymentAddress);
  const { contract: invoicesContract } = useContract(invoicesAddress);
  const [form, setForm] = useState({
      review: '',
      imageForReview: '',
      moreInfo: '',
    });

    const getpaymentTokenAddress = async () => {
      if(theStoreContract) {
        const data = await theStoreContract.call('tokenContract');
        setPaymentAddress(data);
      }
    }

    const StoreManager = getContract({
      client:client,
      chain:{
        id:8453,
        rpc:POLYRPC,
      },
      address: import.meta.env.VITE_STORE_REGISTERY,
    });
    const [storeContract1,setStoreContract] = useState(null);

  useEffect(() => {
      if (storeContractByURL && ethers.utils.isAddress(storeContractByURL)) {
          const contract = getContract({
              client: client,
              chain: {
                  id: 8453,
                  rpc: POLYRPC,
              },
              address: storeContractByURL,
          });
          setStoreContract(contract);
      } else {
          setStoreContract(null);
      }
  }, [storeContractByURL]);

    const PaymentContract = getContract({
      client:client,
      chain:{
        id:8453,
        rpc:POLYRPC,
      },
      address: paymentAddress,
    });

    const [RewardContract,setRewardContract] = useState(null);

  useEffect(() => {
      if (rewardAddress && ethers.utils.isAddress(rewardAddress)) {
          const contract = getContract({
              client: client,
              chain: {
                  id: 8453,
                  rpc: POLYRPC,
              },
              address: rewardAddress,
          });
          setRewardContract(contract);
      } else {
        setRewardContract(null);
      }
  }, [rewardAddress]);

    const handleFormFieldChange = (fieldName, e) => {
      setForm({ ...form, [fieldName]: e.target.value });
    };

    function StarRating({ rating }) {
      const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
          if (i <= rating) {
            stars.push(<span key={i} className="filled-star">&#9733;</span>);
          } else {
            stars.push(<span key={i} className="empty-star">&#9734;</span>);
          }
        }
        return stars;
      };
    
      return (
        <div className="star-rating">
          {renderStars()}
        </div>
      );
    };

    // useEffect ייעודי לאיפוס נתונים בעת התנתקות
  useEffect(() => {
    if (!address) {
      // המשתמש לא מחובר - נאפס את כל הסטייטים הקשורים למשתמש
      setIsRegistered(false);
      setOwnerShip(false);
      setHasReceipt(false);
      setCanLeaveReview(false);
      setNameOfClient('');
      setEmailOfClient('');
      setPhoneNumOfClient('');
      setPhysicalAddressOfClient('');
      setAllowance(0);
    } else {
        // אופציונלי: אם המשתמש התחבר מחדש, נריץ בדיקה
        checkRegistrationDB();
        // הערה: checkOwnership רץ בתוך fetchStoreAndProducts אז לא חובה לקרוא לו כאן
    }
  }, [address]);

    function StarRatingMain({ rating }) {
      const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
          if (i <= rating) {
            stars.push(<span key={i} className="filled-star">&#9733;</span>);
          } else {
            stars.push(<span key={i} className="empty-star">&#9734;</span>);
          }
        }
        return stars;
      };
    
      return (
        <div className="star-rating-main">
          {renderStars()}
        </div>
      );
    };

    function decodeUrlString(str) {
      return decodeURIComponent(str);
    }
  
    const checkRegistrationDB = async () => {
      // FIX: Reset state if no address is present
      if (!address) {
          setIsRegistered(false);
          setNameOfClient('');
          setEmailOfClient('');
          setPhoneNumOfClient('');
          setPhysicalAddressOfClient('');
          return;
      }
  
      if (!storeContractByURL) return;
      
      try {
          const response = await fetch(`${API_URL}/check/${address}?storeAddress=${storeContractByURL}`);
          const data = await response.json();
          setIsRegistered(data.isRegistered);
          if (data.clientData) {
              setNameOfClient(data.clientData.name);
              setEmailOfClient(data.clientData.email);
              setPhoneNumOfClient(data.clientData.phone);
              setPhysicalAddressOfClient(data.clientData.physicalAddress);
          }
      } catch (error) {
          console.error("Error checking DB registration:", error);
      }
  };

      const handleRegisterToDB = async () => {
        if (!nameOfClient || !emailOfClient || !phoneNumOfClient) return;
        setIsLoading(true);
        try {
            let tempAddress = physicalAddressOfClient;
            if (storeContractByURL == import.meta.env.VITE_ULTIMATEDEAL_STORE || storeContractByURL == '0x8Ccf7b92D22B3dc098eeeCFe0E1582Dd152f0c75') {
                tempAddress = "Doesn't matters";
            }

            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: address,
                    name: nameOfClient,
                    email: emailOfClient,
                    phone: phoneNumOfClient,
                    physicalAddress: tempAddress,
                    storeAddress: storeContractByURL
                })
            });
            const data = await response.json();
            if (data.success) {
                setIsRegistered(true);
            }
            setIsLoading(false);
        } catch (error) {
            alert("Error registering to DB: " + error.message);
            setIsLoading(false);
        }
    };

    // New Function: Unregister via API (Store Specific)
    const handleUnregisterFromDB = async () => {
      if (!confirmUnregister) return;
      
      // 1. Check if account exists (v5 way)
      if (!account) {
          alert("Wallet not connected");
          return;
      }

      setIsLoading(true);

      try {
          const timestamp = Date.now();
          const message = `I confirm that I want to delete my account: ${address.toLowerCase()} at ${timestamp}`;

          // 2. Sign using the v5 account object
          // The v5 SDK handles Mobile/Desktop/WalletConnect automatically
          const signature = await account.signMessage({ message: message });

          // 3. Send to server (Same as before)
          const response = await fetch(`${API_URL}/unregister`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  walletAddress: address,
                  signature: signature,
                  timestamp: timestamp
              })
          });

          const data = await response.json();

          if (data.success) {
              setIsRegistered(false);
              setShowUnregisterModal(false);
              setConfirmUnregister(false);
              // Reset user state...
              setNameOfClient('');
              setEmailOfClient('');
              setPhoneNumOfClient('');
              setPhysicalAddressOfClient('');
              alert("Account removed successfully");
          } else {
              throw new Error(data.error || "Unknown error from server");
          }

      } catch (error) {
          console.error("Unregister failed:", error);
          alert("Error removing client: " + error.message);
      } finally {
          setIsLoading(false);
      }
  };

      const canUserLeaveReview = async () => {
        try {
          setIsLoading(true);
      
          const hasReviewed = await storeRegistery.call('hasUserReviewedStore', [address, StoreURL]);
          const canLeaveReview = !hasReviewed && hasReceipt;
          setIsLoading(false);
          setCanLeaveReview(canLeaveReview);
          return canLeaveReview;
        } catch (error) {
          console.error("Error checking if user can leave a review:", error);
          setIsLoading(false);
          setCanLeaveReview(false);
          return false;
        }
      };

      useEffect(() => {
        window.scrollTo(0, 0);

          const fetchAllowance = async () => {
            const data = await PaymentContract1.call('allowance',[address,storeContractByURL]);
            setAllowance(HexToInteger(data._hex));
          }
          const fetchProduct = async (product) => {
              setIsLoading(true);
              const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
              const gasPrice = await provider.getGasPrice();
              const theTypeOfContract = await theStoreContract.call('typeOfContract');
              const dataOfInvoice = await theStoreContract.call('invoices');
              const dataOfBalance = 0;
              const dataOfCounter = await theStoreContract.call('receiptCounter');
              setCounter(HexToInteger(dataOfCounter._hex));
              const dataX = await theStoreContract.call('rewardsPool');
              setBalance((dataOfBalance*1e-6)+((dataX)*1e-18));
              await setInvoicesAddress(dataOfInvoice);
              await setType(theTypeOfContract);
              const data = await storeRegistery.call('getStoreReviews', [StoreURL]);
              const data1 = await theStoreContract.call('products', [product]);
              const pictures = await theStoreContract.call('getProductPics',[product]);
              await setImagesOfProduct(pictures);
              await setProduct(data1);
              
              if(address) {
                checkRegistrationDB();
              } else {
                // אם אין כתובת, המשתמש בהכרח לא רשום
                setIsRegistered(false);
              }
              
              if (data && data.length > 0) {
                const processedReviews = data.map(review => ({
                    user: review[0],
                    rating: review[1] ? Number(review[1].toString()) : 0,
                    comment: review[2],
                    receipt: review[3] ? review[3].toString() : ''
                }));
                await setReviews(processedReviews);
            }
              setIsLoading(false);
      };

      const checkOwnership = async (productUrl) => {
    // FIX: If no address or no contract, ownership is impossible -> set to false
    if (!address || !invoicesContract) {
        setOwnerShip(false);
        return;
    }

    try {
        const data = await invoicesContract.call('verifyOwnershipByBarcode', [address, productUrl]);
        // The contract returns a boolean, so we can set it directly
        setOwnerShip(data); 
    } catch (error) {
        console.error("Error checking ownership:", error);
        setOwnerShip(false); // Default to false on error
    }
}

      const fetchRewardAddress = async () => {
        if (theStoreContract) {
        setIsLoading(true);
        const data = await theStoreContract.call('rewardToken');
        setRewardAddress(data);
        setIsLoading(false);
      }
    }

      const fetchRewardSymbol = async () => {
        setIsLoading(true);
        const data = await rewardContract.call('symbol');
        setTheSymbolOfReward(data);
        setIsLoading(false);
    }

    const fetchPaymentSymbol = async () => {
      setIsLoading(true);
      const data = await PaymentContract1.call('symbol');
      setTheSymbolOfPayment(data);
      setIsLoading(false);
  }

          const fetchStoreAndProducts = async () => {
              try {
                setIsLoading(true);
                  const data = await getStoreDetails(StoreURL);
                  await setStoreContractByURL(data[1]);
                  await setStoreName(data.name);
                  await setStoreBanner(data.picture);
                  
                  if (theStoreContract) {
                      const productUrlDecoded = decodeUrlString(productUrl);
                      if(storeContract1) {
                        fetchProduct(productUrlDecoded);
                        // Semicolon removed below
                        if(invoicesContract) {
                            checkOwnership(productUrlDecoded);
                        }
                    }
                  }
                  setIsLoading(false);
              } catch (error) {
                setIsLoading(false);
                  console.error("Error fetching store details or products:", error);
              }
          };

          const fetchReward = async () => {
            if(theStoreContract) {
              setIsLoading(true);
              if(type=="Liquidity") {
                const data = await theStoreContract.call('rewardsPool');
                setReward(data*2/100000);
            }
            if(type=="Rentals") {
                const data = await theStoreContract.call('rewardsPool');
                setReward(data*2/100000);
                setAmountOfProduct(30);
            }
            if(type=="Renting") {
                const data = await theStoreContract.call('rewardsPool');
                setReward(data*2/10000);
                setAmountOfProduct(30);
            }
            if(type=="Sales") {
                const data = await theStoreContract.call('rewardsPool');
                setReward(data*2/1000);
            }
              setIsLoading(false);
            }
          }   
          const fetchencandrating = async () => {
            const avarageOfReviews = await storeRegistery.call('getStoreAverageRating', [StoreURL]);
            const isEnc = await storeRegistery.call('getStoreVotingSystem',[StoreURL]);
            await setUserRatingAvarage(avarageOfReviews);
          await setEnc(isEnc.encrypted);
          }         
      
          if (StoreManager&&storeRegistery) {
            setIsLoading(true);
              fetchStoreAndProducts();
              getpaymentTokenAddress();
              fetchReward();
              fetchRewardAddress();
              setIsLoading(false);
              fetchencandrating();
              if(address) {canUserLeaveReview();} 
          }
          if(rewardContract) {
                fetchRewardSymbol();
              }

              if(PaymentContract1) {
                fetchPaymentSymbol();
                if(address) {
                  fetchAllowance();
                }
              }
      }, [storeRegistery, PaymentContract1,StoreURL, theStoreContract,productUrl,canLeaveReview,isRegistered,address,hasReceipt,reward,rewardContract,ownerShip,invoicesContract]);

      const AddReviewButton = async () => {
        setIsLoading(true);
        const data = await theStoreContract.call('verifyReceipt', [address, receipt]);
        await setHasReceipt(data);
        setIsLoading(false);
      }

 const addReview = async (_stars,_review) => {
  try {
     setIsLoading(true);
     const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
     const gasPrice = await provider.getGasPrice();
     const transaction = prepareContractCall({
      contract:StoreManager,
      method: "function addStoreReview(string _urlPath, uint8 _stars, string _text, uint256 _receiptId)", 
      params: [StoreURL, _stars, _review, receipt],
      value: 0,
      gasPrice: gasPrice,
    });
     sendTransaction(transaction);
     setIsLoading(false);
 } catch (error) {
     alert('error accured while deleting the client contact support: '+error);
     setIsLoading(false);
 }
};

  const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 2000,
      arrows: false,
    };

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


  async function handleStarChange  (newRating) {
      await setSelectedRating(prevRating => {
        return newRating;
      });
    };

    const formatNumberWithCommas = (number) => {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

useEffect(() => {
  setSelectedRating(prevRating => {
      return selectedRating;
    });
  
}, [selectedRating]);

 const ProductBox = ({ category, isSelected, onClick }) => (
  <div
    className={`p-2 rounded-lg border border-gray-300 cursor-pointer text-[#FFDD00] font-bold ${
      isSelected ? 'bg-blue-200 !text-[#000000]' : ''
    }`}
    onClick={onClick}
  >
    {category}
  </div>
);

const [selectedImage, setSelectedImage] = useState(null);

if (!Array.isArray(imagesOfProduct) || imagesOfProduct.length === 0) {
  return <div className="text-white"><Loader/></div>;
}

if (selectedImage === null && imagesOfProduct.length > 0) {
  setSelectedImage(imagesOfProduct[0]);
}


const rewardCalc = async (theType) => {
  const rewardInWei = Number(reward) * 1e-18;

  let rewardPool;
  let totalReward = 0;
  let rewardCalc;

  if (theType === 'Sales') {
    rewardPool = rewardInWei * 1000;

    for (let i = 0; i < amountOfProduct; i++) {
      rewardCalc = rewardPool / 1000;
      totalReward += rewardCalc;
      rewardPool -= rewardCalc;
    }
  } else if (theType === 'Renting') {
    rewardPool = rewardInWei * 10000;

    for (let i = 0; i < amountOfProduct; i++) {
      rewardCalc = rewardPool / 10000;
      totalReward += rewardCalc;
      rewardPool -= rewardCalc;
    }
  }

  else if (theType === 'Liquidity' || theType=='Rentals') {
    rewardPool = rewardInWei * 100000;

    for (let i = 0; i < amountOfProduct; i++) {
      rewardCalc = rewardPool / 100000;
      totalReward += rewardCalc;
      rewardPool -= rewardCalc;
    }
  }

  return totalReward;
};

const navigateToReactJS = async () => {
  navigate("extra/");
}

const navigateToStore = async () => {
  navigate(`/shop/${StoreURL}`);
}

return (
  <>
    {isLoading && <Loader />}

    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 lg:px-8 pt-8 pb-16 overflow-x-hidden">
      {/* ========================= */}
      {/* Store Hero */}
      {/* ========================= */}
      <div className="relative z-[200] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        <div
          className="relative h-[130px] sm:h-[220px] w-full cursor-pointer"
          onClick={() => navigateToStore()}
        >
          {storeBanner ? (
            <img
              src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${storeBanner}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
              className="h-full w-full object-cover"
              alt="store banner"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-blue-700/40 via-cyan-500/20 to-blue-900/40" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div>
              <h1 className="text-white font-extrabold tracking-tight text-3xl sm:text-5xl drop-shadow-lg">
                {storeName}
              </h1>

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {enc ? (<>
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs sm:text-sm text-blue-200 border border-blue-400/20">
                    🛡️ Verified Store
                  </span>
                </>
                ) : (
                  <></>
                )}
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-black/30 border border-white/10 px-4 py-2">
              <span className="text-white/70 text-sm">Tap banner to return</span>
            </div>
          </div>
        </div>

        <div className="relative z-[200] p-4 sm:p-6">
          <div className="relative z-[200] rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4">
            <ProductSearch contractAddress={storeContractByURL} />
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* Product Body */}
      {/* ========================= */}
      {product ? (
        <div className="mt-8 space-y-6">
          {/* Title + Owned/Rewards */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-4 sm:p-6">
            <h3 className="text-center text-white font-extrabold tracking-tight text-3xl sm:text-5xl">
              {product?.name}
            </h3>

            {(storeContractByURL === "0xd9Cc98ed8fD8dF69E4575260B6aa3bA9755e687d" ||
              storeContractByURL === "0xF034bF0135A6b20ec5b16483a1b83f21da63b3DD") ? null : (
              <div className="mt-5 flex flex-wrap justify-center items-center gap-3">
                {ownerShip ? (
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={VerifiedIcon} className="w-6 h-6" alt="owned" />
                      <span className="text-white font-bold">Owned</span>
                    </div>

                    <button
                      onClick={async () => await navigateToReactJS()}
                      className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-300 text-black font-extrabold px-4 py-2 shadow-lg hover:opacity-95 transition"
                    >
                      Exclusive Content 🔥
                    </button>
                  </div>
                ) : null}

                {reward !== 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <RewardBadge
                      type={type}
                      theSymbolOfReward={theSymbolOfReward}
                      reward={reward}
                    />
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Price / Stock / Discount */}
          <div className="flex flex-wrap justify-center items-center gap-4">
            {/* Price Card */}
            <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl px-5 py-4">
              {(() => {
                const isWETH =
                  paymentAddress === "0xE1CbE71D2e56aAc7d50eB0ef855Fe5E4B51DF26c";
                const price = HexToInteger(product?.price._hex);
                const discount = HexToInteger(product?.discountPercentage._hex);
                const multiplier = type === "Renting" || type === "Rentals" ? 30 : 1;

                const formattedPrice = isWETH
                  ? (price / 1e18 * multiplier).toFixed(2)
                  : (price / 1e6 * multiplier).toFixed(2);

                const discountedPrice = isWETH
                  ? ((price * (100 - discount)) / (100 * 1e18) * multiplier).toFixed(2)
                  : ((price * (100 - discount)) / (100 * 1e6) * multiplier).toFixed(2);

                const logoSrc = isWETH ? logoOfWebsite : usdcoinusdclogo;

                const label =
                  type === "Renting" || type === "Rentals"
                    ? "Price Per Month"
                    : type === "Sales"
                    ? "Sales Price"
                    : type === "Liquidity"
                    ? "Fixed Price"
                    : "Price";

                return (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex items-end gap-2">
                        {discount !== 0 ? (
                          <>
                            <span className="text-sm sm:text-base text-white/50 line-through">
                              {formattedPrice}
                            </span>
                            <span className="text-2xl sm:text-3xl text-white font-extrabold">
                              {discountedPrice}
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl sm:text-3xl text-white font-extrabold">
                            {formattedPrice}
                          </span>
                        )}
                      </div>

                      <img src={logoSrc} className="h-9 w-9" alt="token" />
                    </div>

                    <div className="mt-2 inline-flex items-center rounded-full bg-blue-500/20 px-3 py-1 text-xs sm:text-sm text-blue-200 border border-blue-400/20">
                      {label}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Stock */}
            {storeContractByURL === "0xb9288F571322151414d65c8622D1621b60ffdF6e" ? null : (
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl px-5 py-4">
                <div className="text-white/70 text-sm">In Stock</div>
                <div className="text-white font-extrabold text-2xl sm:text-3xl">
                  {ethers.BigNumber.from(product?.quantity.toString()).toString()}
                  <span className="text-white/60 text-base ml-2">left</span>
                </div>
              </div>
            )}

            {/* Discount */}
            {HexToInteger(product.discountPercentage._hex) !== 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl px-5 py-4">
                <div className="text-white/70 text-sm">Discount</div>
                <div className="text-white font-extrabold text-2xl sm:text-3xl">
                  {HexToInteger(product?.discountPercentage._hex)}%
                  <span className="text-blue-200 text-base ml-2">OFF</span>
                </div>
              </div>
            )}
          </div>

          {/* Gallery + Description */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gallery */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl max-h-[700px] shadow-xl p-4 sm:p-6">
              <div className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
                <div className="h-[220px] sm:h-[520px] w-full">
                  <IPFSMediaViewer
                    ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${selectedImage}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                    className="h-full w-full"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-3 overflow-x-auto touch-auto pb-1">
                {imagesOfProduct.map((imageHash, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`flex-shrink-0 rounded-2xl overflow-hidden border transition
                      ${
                        selectedImage === imageHash
                          ? "border-blue-400/60 ring-2 ring-blue-500/40"
                          : "border-white/10 hover:border-blue-400/40"
                      }`}
                    onMouseEnter={() => setSelectedImage(imageHash)}
                    onClick={() => setSelectedImage(imageHash)}
                  >
                    <div className="bg-black/20 w-[120px] h-[70px]">
                      <IPFSMediaViewer
                        ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${imageHash}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                        className="h-full w-full"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-4 sm:p-6">
              <h4 className="text-white font-extrabold text-xl mb-3">
                About this product
              </h4>
              <div className="text-white/80 leading-relaxed overflow-auto touch-auto">
                {renderDescriptionWithBreaks(product?.productDescription)}
              </div>
            </div>
          </div>

          {/* Reviews + Leave review */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reviews */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="text-white font-extrabold text-xl">⭐ Reviews</h3>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                  <StarRatingMain rating={userRatingAvarage} />
                </div>
              </div>

              <div className="mt-4 max-h-[360px] overflow-auto touch-auto space-y-4 pr-1">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-black/30 transition"
                    >
                      <StarRating rating={Number(review.rating.toString())} />
                      <p className="text-white/90 mt-2">{review.comment}</p>

                      <div className="mt-3 text-xs sm:text-sm text-white/60 flex flex-wrap gap-2">
                        <a
                          href={`https://Base.blockscout.com/address/${review.user}`}
                          className="underline underline-offset-4 hover:text-white"
                        >
                          {review.user}
                        </a>
                        <span className="text-white/30">•</span>
                        <span>Invoice: {review.receipt.toString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white/60">No reviews yet</p>
                )}
              </div>
            </div>

            {/* Leave review */}
            <div className="rounded-3xl border border-white/10 bg-white/5 shadow-xl p-4 sm:p-6">
              {canLeaveReview ? (
                <div className="space-y-4">
                  <h3 className="text-white font-extrabold text-xl">✍️ Leave a Review</h3>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-4">
                    <StarRatingForNewReview
                      rating={selectedRating}
                      onRatingChange={handleStarChange}
                    />

                    <p className="text-white/70 text-sm">
                      Selected Rating:{" "}
                      <span className="text-white font-bold">{selectedRating}</span>
                    </p>

                    <textarea
                      className="w-full min-h-[180px] rounded-2xl border border-white/10 bg-black/30 p-4 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your review"
                      value={form.review}
                      onChange={(e) => handleFormFieldChange("review", e)}
                    />

                    <button
                      className={`w-full sm:w-auto rounded-2xl px-6 py-3 font-extrabold shadow-lg transition
                        ${
                          buttonDisabled
                            ? "bg-white/10 text-white/40 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-500 to-cyan-300 text-black hover:opacity-95 hover:shadow-xl"
                        }`}
                      onClick={() => addReview(selectedRating, form.review)}
                      disabled={buttonDisabled}
                    >
                      Add Review
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-white/60">
                  You can leave a review after a verified purchase.
                </div>
              )}
            </div>
          </div>

          {/* ========================= */}
          {/* Purchase / Register */}
          {/* ========================= */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-4 sm:p-6">
            {isRegistered ? (
              <>
                {/* More Info */}
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="text-white font-extrabold text-lg mb-2">Optional note</h3>
                  <textarea
                    className="w-full min-h-[160px] rounded-2xl border border-white/10 bg-black/30 p-4 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="More info if needed. Don’t share private info here."
                    value={form.moreInfo}
                    onChange={(e) => handleFormFieldChange("moreInfo", e)}
                  />
                </div>

                {/* Amount / Days */}
                {StoreURL === "DeAl" && productUrl === "LISTBIZ" ? null : (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-white/80 font-bold text-sm">
                        {type === "Sales" ? "Amount" : "Amount"}
                      </span>

                      <input
                        className="w-[120px] rounded-2xl border border-white/10 bg-black/30 p-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-500"
                        type="number"
                        min={1}
                        placeholder="1"
                        value={amountOfProduct}
                        onChange={(e) => setAmountOfProduct(e.target.value)}
                      />

                      {type !== "Sales" &&
                      paymentAddress !== "0x4200000000000000000000000000000000000006" &&
                      storeContractByURL !== "0xF034bF0135A6b20ec5b16483a1b83f21da63b3DD" ? (
                        <span className="text-white/80 font-bold text-sm">Days</span>
                      ) : null}

                      <span className="ml-auto text-white/60 text-sm">
                        Connected as{" "}
                        <span className="text-blue-200 font-semibold">
                          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
                        </span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Approve / Purchase */}
                {address ? (
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <TransactionButton
                      className={`!rounded-2xl !px-6 !py-3 !font-extrabold !shadow-lg !transition
                        !bg-white !text-blue-700 hover:!shadow-xl
                        ${
                          amountOfProduct *
                            (HexToInteger(product?.price._hex) -
                              (HexToInteger(product?.discountPercentage._hex) *
                                HexToInteger(product?.price._hex)) /
                                100) <
                          allowance
                            ? "!hidden"
                            : ""
                        }`}
                      transaction={async () => {
                        const finalPrice =
                          Math.round(
                            Math.round(HexToInteger(product?.price._hex)) *
                              (100 - HexToInteger(product?.discountPercentage._hex)) /
                              100
                          ) *
                            amountOfProduct +
                          1e3;

                        const spender = storeContractByURL;
                        const value = finalPrice;

                        const tx = prepareContractCall({
                          contract: PaymentContract,
                          method: "function approve(address spender, uint256 value) returns (bool)",
                          params: [spender, value],
                          value: 0,
                        });

                        return tx;
                      }}
                      onTransactionSent={(result) => {
                        console.log("Transaction submitted", result.transactionHash);
                      }}
                      onTransactionConfirmed={async () => {
                        const data = await PaymentContract1.call("allowance", [
                          address,
                          storeContractByURL,
                        ]);
                        setAllowance(HexToInteger(data._hex));
                      }}
                      onError={(error) => {
                        console.error("Transaction error", error);
                      }}
                    >
                      {symbolPayment ? `Approve ${symbolPayment}` : "Approve $USDC"}
                    </TransactionButton>

                    <TransactionButton
                      className={`!rounded-2xl !px-6 !py-3 !font-extrabold !shadow-lg !transition
                        !bg-gradient-to-r !from-blue-500 !to-cyan-300 !text-black hover:!opacity-95 hover:!shadow-xl
                        ${
                          allowance >=
                          (HexToInteger(product?.price._hex) -
                            (HexToInteger(product?.discountPercentage._hex) *
                              HexToInteger(product?.price._hex)) /
                              100) *
                            amountOfProduct
                            ? ""
                            : "!hidden"
                        }`}
                      transaction={async () => {
                        const productUrlDecoded = decodeUrlString(productUrl);

                        const response = await fetch(`${API_URL}/sign-purchase`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            walletAddress: address,
                            productBarcode: productUrlDecoded,
                            amount: amountOfProduct,
                          }),
                        });

                        const data = await response.json();

                        if (!data.success) {
                          alert("Error: " + data.error);
                          throw new Error(data.error);
                        }

                        const { signature, deadline } = data;

                        let IPFSOFNFT = "";

                        let priceForNFT =
                          (HexToInteger(product?.price._hex) *
                            (100 - HexToInteger(product?.discountPercentage._hex))) /
                          (100 * 1e6);

                        const rewardForUser = await rewardCalc(type);
                        const today = new Date();
                        const sellDate = `${today
                          .getDate()
                          .toString()
                          .padStart(2, "0")}/${(today.getMonth() + 1)
                          .toString()
                          .padStart(2, "0")}/${today.getFullYear()}`;

                        const expirationPeriod = amountOfProduct * 24 * 60 * 60 * 1000;
                        const expirationDateObj = new Date(Date.now() + expirationPeriod);
                        const expirationDate = `${expirationDateObj
                          .getDate()
                          .toString()
                          .padStart(2, "0")}/${(expirationDateObj.getMonth() + 1)
                          .toString()
                          .padStart(2, "0")}/${expirationDateObj.getFullYear()}`;

                        if (type === "Rentals" || type === "Renting") {
                          const upload = await pinata.upload.json({
                            name: `Invoice`,
                            description: `Services entrence from ${storeName}\nLink to the store: https://UltraShop.tech/shop/${StoreURL}`,
                            external_url: `https://UltraShop.tech/shop/${StoreURL}`,
                            image: `https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${imagesOfProduct[0]}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`,
                            attributes: [
                              { trait_type: "Invoice Id", value: invoiceCounter },
                              { trait_type: "Product Name", value: product.name },
                              { trait_type: "Rental Period", value: `${amountOfProduct} Days` },
                              { trait_type: "Sell Date", value: sellDate },
                              {
                                trait_type: "Amount Payed",
                                value: `${(priceForNFT * amountOfProduct).toFixed(2)} $USDC`,
                              },
                              { trait_type: "Price Per Day", value: `${priceForNFT.toFixed(2)} $USDC` },
                              { trait_type: "Reward Address", value: rewardAddress },
                              {
                                trait_type: "Reward Amount",
                                value: `${rewardForUser.toFixed(2)} ${theSymbolOfReward}`,
                              },
                              { trait_type: "Reward Symbol", value: `${theSymbolOfReward}` },
                              { trait_type: `${product.name} Expiration Date`, value: expirationDate },
                            ],
                          });
                          IPFSOFNFT = upload.IpfsHash;
                        } else if (type === "Sales") {
                          const upload = await pinata.upload.json({
                            name: `Invoice`,
                            description: `Services entrence from ${storeName}\nLink to the store: https://UltraShop.tech/shop/${StoreURL}`,
                            external_url: `https://UltraShop.tech/shop/${StoreURL}`,
                            image: `https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${imagesOfProduct[0]}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`,
                            attributes: [
                              { trait_type: "Invoice Id", value: invoiceCounter },
                              { trait_type: "Product Name", value: product.name },
                              { trait_type: "Amount", value: amountOfProduct },
                              { trait_type: "Sell Date", value: sellDate },
                              {
                                trait_type: "Amount Payed",
                                value: `${(priceForNFT * amountOfProduct).toFixed(2)} $USDC`,
                              },
                              { trait_type: "Price", value: `${priceForNFT.toFixed(2)} $USDC` },
                              { trait_type: "Reward Address", value: rewardAddress },
                              { trait_type: "Reward Symbol", value: `${theSymbolOfReward}` },
                              {
                                trait_type: "Reward Amount",
                                value: `${rewardForUser.toFixed(2)} ${theSymbolOfReward}`,
                              },
                            ],
                          });
                          IPFSOFNFT = upload.IpfsHash;
                        }

                        const theInfo = form.moreInfo;

                        const tx = prepareContractCall({
                          contract: storeContract1,
                          method:
                            "function purchaseProduct(string _productBarcode, uint256 _amount, string _info, string metadata, bytes _signature, uint256 _deadline)",
                          params: [
                            productUrlDecoded,
                            amountOfProduct,
                            theInfo,
                            IPFSOFNFT,
                            signature,
                            deadline,
                          ],
                        });

                        return tx;
                      }}
                      onTransactionSent={(result) => {
                        console.log("Transaction submitted", result.transactionHash);
                      }}
                      onTransactionConfirmed={async (receipt) => {
                        try {
                            console.log("Transaction Confirmed");
                    
                            // תיקון: שימוש ב-Counter הקיים במקום ניחוש מהלוגים
                            // (בהנחה ש-invoiceCounter מחזיק את המספר הנוכחי, והחדש הוא הוא או +1)
                            // אם החוזה מעדכן את ה-Counter לאחר הרכישה, המספר של הקבלה הוא ה-Counter הנוכחי
                            let receiptId = invoiceCounter; 
                            
                            // גיבוי: אם ה-Counter הוא 0 (לא נטען), ננסה לקרוא מהחוזה שוב
                            if (!receiptId || receiptId === 0) {
                                 const currentCount = await theStoreContract.call('receiptCounter');
                                 receiptId = HexToInteger(currentCount._hex) - 1; // מינוס 1 כי הוא כבר התקדם
                            }
                    
                            const productUrlDecoded = decodeUrlString(productUrl);
                            const finalPrice = (HexToInteger(product?.price._hex) * (100 - HexToInteger(product?.discountPercentage._hex))) / 100;
                    
                            await fetch(`${API_URL}/register-order`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    receiptId: receiptId, // עכשיו זה מספר נורמלי (למשל 5)
                                    walletAddress: address,
                                    storeAddress: storeContractByURL,
                                    productBarcode: productUrlDecoded,
                                    productName: product?.name,
                                    price: finalPrice / 1e6*amountOfProduct,
                                    timestamp: Math.floor(Date.now() / 1000)
                                })
                            });
                            
                            console.log("Order registered manually with ID:", receiptId);
                    
                        } catch (err) {
                            console.error("Failed to register order in DB:", err);
                        }
                        setOwnerShip(true);
                    }}
                      onError={(error) => {
                        console.error("Transaction error", error);
                        if (error.message && error.message.includes("Not authorized")) {
                          alert("You are not registered in our database! Please register first.");
                        } else if (error.message && error.message.includes("Signature expired")) {
                          alert("Signature expired. Please try again.");
                        } else {
                          alert("Transaction failed: " + error.message);
                        }
                      }}
                    >
                      Purchase
                    </TransactionButton>
                  </div>
                ) : null}

                
                    {/* Review by Invoice input */}
                    <div className="mt-[20px] rounded-2xl border border-white/10 bg-black/20 p-4">
                      <h3 className="text-white font-extrabold text-lg mb-3">
                        Already bought?
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-500"
                          type="text"
                          placeholder="Enter Invoice Number"
                          value={receipt}
                          onChange={(e) => setReceipt(e.target.value)}
                        />
                        <button
                          className="w-full sm:w-auto rounded-2xl px-6 py-3 font-extrabold shadow-lg bg-white text-blue-700 hover:shadow-xl transition"
                          onClick={() => AddReviewButton()}
                        >
                          Review
                        </button>
                      </div>
                    </div>

                {/* Unregister */}
                <div className="mt-6">
                  <button
                    className="rounded-2xl border border-red-400/40 bg-red-500/10 text-red-200 font-extrabold px-5 py-3 hover:bg-red-500/20 transition"
                    onClick={() => setShowUnregisterModal(true)}
                  >
                    🚫 Unregister
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Register block */}
                {address ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <h2 className="text-white font-extrabold text-xl">
                        Register as a client of this store
                      </h2>
                      <p className="text-white/60 mt-2">
                        🔐 All details are encrypted by the website
                      </p>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {storeContractByURL == import.meta.env.VITE_ULTIMATEDEAL_STORE ||
                        storeContractByURL == "0x8Ccf7b92D22B3dc098eeeCFe0E1582Dd152f0c75" ? null : (
                          <input
                            className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            placeholder="Your Physical Address"
                            value={physicalAddressOfClient}
                            onChange={(e) => setPhysicalAddressOfClient(e.target.value)}
                          />
                        )}

                        <input
                          className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-500"
                          type="text"
                          placeholder="Your Email"
                          value={emailOfClient}
                          onChange={(e) => setEmailOfClient(e.target.value)}
                        />

                        <input
                          className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-500"
                          type="text"
                          placeholder="Your Phone Number"
                          value={phoneNumOfClient}
                          onChange={(e) => setPhoneNumOfClient(e.target.value)}
                        />

                        <input
                          className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-500"
                          type="text"
                          placeholder="Your Name"
                          value={nameOfClient}
                          onChange={(e) => setNameOfClient(e.target.value)}
                        />
                      </div>

                      <button
                        disabled={isLoading || !nameOfClient || !phoneNumOfClient}
                        onClick={handleRegisterToDB}
                        className={`mt-5 w-full sm:w-auto rounded-2xl px-6 py-3 font-extrabold shadow-lg transition
                          ${
                            isLoading || !nameOfClient || !phoneNumOfClient
                              ? "bg-white/10 text-white/40 cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-500 to-cyan-300 text-black hover:opacity-95 hover:shadow-xl"
                          }`}
                      >
                        {isLoading ? "Registering..." : "Register"}
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="text-white/60">
                    Connect your wallet to register and purchase.
                  </div>
                )}
              </>
            )}
          </div>

          {/* Important */}
          <div className="rounded-3xl border border-blue-400/20 bg-blue-500/10 backdrop-blur-xl shadow-xl p-4 sm:p-6">
            <h2 className="text-white font-extrabold text-lg mb-1">Important</h2>
            <p className="text-white/80">
              Must approve to let the blockchain use your coins before purchasing the product.
            </p>
          </div>
        </div>
      ) : null}

      {/* ========================= */}
      {/* Unregister Modal */}
      {/* ========================= */}
      {showUnregisterModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl p-6">
            <h3 className="text-white font-extrabold text-xl mb-2">Are you sure?</h3>
            <p className="text-white/60 mb-5">
              This will delete your customer data from our database permanently.
            </p>

            <label className="flex items-center gap-3 mb-6 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmUnregister}
                onChange={(e) => setConfirmUnregister(e.target.checked)}
                className="w-5 h-5 accent-blue-500"
              />
              <span className="text-white/90 font-semibold">Yes, I want to unregister</span>
            </label>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowUnregisterModal(false)}
                className="rounded-2xl px-4 py-2 text-white/80 hover:bg-white/10 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleUnregisterFromDB}
                disabled={!confirmUnregister}
                className={`rounded-2xl px-4 py-2 font-extrabold transition
                  ${
                    confirmUnregister
                      ? "bg-red-500 text-white hover:bg-red-400"
                      : "bg-white/10 text-white/40 cursor-not-allowed"
                  }`}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </>
)

}

export default Product