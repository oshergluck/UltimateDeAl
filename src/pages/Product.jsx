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
import { useSendTransaction,useReadContract ,TransactionButton,ConnectButton,MediaRenderer} from 'thirdweb/react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { add } from 'thirdweb/extensions/farcaster/keyGateway';
import {
  createWallet,
  walletConnect,
  inAppWallet,
} from "thirdweb/wallets";
import { PinataSDK } from "pinata";
import { symbol } from 'thirdweb/extensions/common';
import { upload } from 'thirdweb/storage';

const Product = () => {
  const navigate = useNavigate();
  const [enc,setEnc] = useState(false);
  const pinata = new PinataSDK({
    pinataJwt: import.meta.env.VITE_PINATA_JWT,
    pinataGateway: "bronze-sticky-guanaco-654.mypinata.cloud",
  });
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
    const client = createThirdwebClient({clientId:import.meta.env.VITE_THIRDWEB_CLIENT});
    const client1 = createThirdwebClient({clientId:`https://8453.rpc.thirdweb.com/${import.meta.env.VITE_THIRDWEB_CLIENT1}`});
    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const [theSymbolOfReward,setTheSymbolOfReward] = useState('');
    const [allowance,setAllowance] = useState(0);
    const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
    const ThirdWEBAPI1 = 'c33a74a6645a976b68a4e62743214720'
    const apiKeyAlchemy = import.meta.env.VITE_ALCHEMY_API_KEY.toString();
    const apiKeyINFURA = import.meta.env.VITE_INFURA_API_KEY;
    const websocketUrlAPI = import.meta.env.VITE_WEBSOCKET_URL_API;
    const ETHRPC = `https://eth-mainnet.g.alchemy.com/v2/${apiKeyAlchemy}`;
    const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`;
    const POLYRPC1 = `https://base-mainnet.g.alchemy.com/v2/d32cys2ito51Xt9AgfAUTBuIuQd-yQbm`;
    const [symbolPayment,setTheSymbolOfPayment] = useState('');
    const defaultFontSizeIndex = fontSizes.indexOf('sm');
    const fontSize = fontSizes[defaultFontSizeIndex];
    const [allProducts, setAllProducts] = useState([]);
    const [type, setType] = useState('');
    const [physicalAddressOfClient, setPhysicalAddressOfClient] = useState('');
    const [emailOfClient, setEmailOfClient] = useState('');
    const [amountOfProduct, setAmountOfProduct] = useState(1);
    const [amount, setAmount] = useState('');
    const [amount1, setAmount1] = useState('');
    const [invoiceCounter,setCounter] = useState(0);
    const [nameOfClient, setNameOfClient] = useState('');
    const [storeContractByURL, setStoreContractByURL] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userSecretKey, setUserSecretKey] = useState('');
    const [phoneNumOfClient, setPhoneNumOfClient] = useState('');
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [userRatingAvarage, setUserRatingAvarage] = useState(0);
    const [selectedRating, setSelectedRating] = useState(5);
    const [product,setProduct] = useState();
    const [storeBanner, setStoreBanner] = useState('');
    const [canLeaveReview, setCanLeaveReview] = useState(false);
    const [storeName, setStoreName] = useState('');
    const {storeRegistery, encrypt,secretKeys, address,isconnected,refreshPage,HexToInteger,getStoreDetails,Stores,generateSecretKey,ethAddressToBinaryKey} = useStateContext();
    const StoreURL = window.location.pathname.split('/')[2];
    
    const [reviews, setReviews] = useState([]);
    const [productFromUrl,setProductFromUrl] = useState('');
    const productUrl = window.location.pathname.split('/')[4];
    const [isRegistered,setIsRegistered] = useState(false);
    const [hasReceipt,setHasReceipt] = useState(false);
    const [receipt,setReceipt] = useState('');
    const [imagesOfProduct,setImagesOfProduct] = useState([]);
    let processedReviews = [];
    const [paymentAddress,setPaymentAddress] = useState('');
    const [rewardAddress,setRewardAddress] = useState('');
    const [reward,setReward] = useState(0);
    const [moreInfo,setMoreInfo] = useState('');
    const [invoicesAddress,setInvoicesAddress] = useState('');
    const [metadataJsonIPFS,setMedataJsonIPFS] = useState('');
    const [Balance,setBalance] = useState(0);
    const [ownerShip,setOwnerShip] = useState(false);
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
      const storeContract1 = getContract({
        client:client,
        chain:{
          id:8453,
          rpc:POLYRPC,
        },
        address: storeContractByURL,
      });

      const PaymentContract = getContract({
        client:client,
        chain:{
          id:8453,
          rpc:POLYRPC,
        },
        address: paymentAddress,
      });

      const RewardContract = getContract({
        client:client,
        chain:{
          id:8453,
          rpc:POLYRPC,
        },
        address: rewardAddress,
      });

      const approveCoinsForSmartContractPayment = async (amount,supersmartcontract) => {
        try {
        const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
        const gasPrice = await provider.getGasPrice();
        const transaction = prepareContractCall({
          contract:PaymentContract,
          method: "function approve(address spender, uint256 amount) returns (bool)",
          params: [supersmartcontract, amount],
          value: 0,
          gasPrice: gasPrice,
        });
        sendTransaction(transaction);
        //const data = await USDT.call("approve", [supersmartcontract, amount*1e6], { gasPrice: gasPrice, gasLimit:500000000});
      }
      catch(error) {
        alert(error);
      }
      }


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
    

        const productsBarcodes = async () => {
            try {
                setIsLoading(true);
                const data = await theStoreContract.call('getAllProductsBarcodes');
                setAllProducts(data);
                //await getAllReviews();
                setIsLoading(false);
                return data;
            }
            catch (error) {
                setIsLoading(false);
            }
        }

        const canUserLeaveReview = async () => {
          try {
            setIsLoading(true);
        
            // Check if the user has already reviewed the store
            const hasReviewed = await storeRegistery.call('hasUserReviewedStore', [address, StoreURL]);
            // User can leave a review if they haven't reviewed before and have a valid receipt
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
                  const data2 = await theStoreContract.call('isClient',[address]);
                  await setIsRegistered(data2);
                }
                else {
                  await setIsRegistered(false);
                }
                // Process the reviews data
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
          if(invoicesContract) {
            const data = await invoicesContract.call('verifyOwnershipByBarcode',[address,productUrl]);
            if(data) {
              setOwnerShip(data);
            }
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
                    
                    // Now that we have the contract address, fetch products
                    if (theStoreContract) {
                        const productUrlDecoded = decodeUrlString(productUrl);
                        if(productUrlDecoded) {
                          if(storeContract1) {
                            fetchProduct(productUrlDecoded);
                            if(invoicesContract);
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
              }
              if(type=="Renting") {
                  const data = await theStoreContract.call('rewardsPool');
                  setReward(data*2/10000);
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

        const setApprovalAmount = async () => {
            setIsLoading(true);
    
            if (storeContractByURL) {
                await setAmount(amount);
                try {
                    await approveCoinsForSmartContractPayment(amount*1e6, storeContractByURL);
                    setIsLoading(false);
                } catch (error) {
                    alert('error occurred while approving the amount contact support: ' + error);
                    setIsLoading(false);
                }
            } else {
                alert('Invalid store name');
                setIsLoading(false);
            }
        };

    const handleRemoveClient = async () => {
        try {
           setIsLoading(true);
           const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
           const gasPrice = await provider.getGasPrice();

           const transaction = prepareContractCall({
            contract:storeContract1,
            method: "function deleteCustomer(address _customerAddress)",
            params: [address],
            value: 0,
            gasPrice: gasPrice,
          });
          sendTransaction(transaction);
          setIsRegistered(false);
           //const data = await contract.call('deleteCustomer', [address], { gasPrice: gasPrice, gasLimit:500000000 });
           setIsLoading(false);
           
           //return data;
       } catch (error) {
           alert('error accured while deleting the client contact support: '+error);
           setIsLoading(false);
       }
   };

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
       //return data;
   } catch (error) {
       alert('error accured while deleting the client contact support: '+error);
       setIsLoading(false);
   }
};

    const handlePayForProduct = async (product,price) => {
        try { setIsLoading(true);
        const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
        const gasPrice = await provider.getGasPrice();

          

          const transaction = prepareContractCall({
            contract:storeContract1,
            method: "function purchaseProduct(string memory _productBarcode)",
            params: [product.toString()],
            value: 0,
            gasPrice: gasPrice,

          });
          
          const data = await sendTransaction(transaction);
            setIsLoading(false);
        }
        catch (error) {
            alert('error accured while purchasing the product contact support: '+error);
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


    
    const handleAddClient = async (nameOfClient,emailOfClient,phoneNumOfClient,physicalAddressOfClient) => {
        try{
           setIsLoading(true);
           const encryptedName = await encrypt(nameOfClient, address,storeContractByURL);
           const encryptedEmail = await encrypt(emailOfClient, address,storeContractByURL);
           const encryptedPhoneNumOfClient = await encrypt(phoneNumOfClient, address,storeContractByURL)
           const encryptedPhysicalAddressOfClient = await encrypt(physicalAddressOfClient, address,storeContractByURL);
           const provider = await new ethers.providers.JsonRpcProvider(POLYRPC, Base);
           const gasPrice = await provider.getGasPrice();

           const transaction = prepareContractCall({
            contract:storeContract1,
            method: "function registerClient(string memory _name, string memory _email, string memory _phoneNum, string memory _physicalAddress)",
            params: [encryptedName, encryptedEmail, encryptedPhoneNumOfClient, encryptedPhysicalAddressOfClient],
            value: 0,
            gasPrice: gasPrice,
          });
          sendTransaction(transaction);
          setIsRegistered(true);
           //const data = await contract.call('registerClient', [encryptedName, encryptedEmail, encryptedPhoneNumOfClient, encryptedPhysicalAddressOfClient], { gasPrice: gasPrice, gasLimit:500000000 });
           setIsLoading(false);
           return true;
        }
        catch (error) {
            alert('error accured while adding the client contact support: '+error);
            setIsLoading(false);
        }

   };

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

  // If no images are available, show message
  if (!Array.isArray(imagesOfProduct) || imagesOfProduct.length === 0) {
    return <div className="text-white"><Loader/></div>;
  }

  // Set first image as default selected image if none is selected
  if (selectedImage === null && imagesOfProduct.length > 0) {
    setSelectedImage(imagesOfProduct[0]);
  }


  const rewardCalc = async (theType) => {
    // Convert reward to a number if it's not already
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
    <div className="mx-auto p-8 mt-9 linear-gradient1 rounded-2xl">
  {isLoading && <Loader />}
  <div className='relative justify-center flex cursor-pointer' onClick={() => navigateToStore()}>
  <img src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${storeBanner}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`} className='sm:h-[120px] h-[50px] !sm:rounded-[15px] flex !rounded-[15px] !md:rounded-[15px]' />
                <h1 className="text-center flex font-bold text-[#ff9900] drop-shadow-md sm:text-8xl text-5xl">{storeName}</h1>
            </div>
  <div className='w-full justify-center gap-8 flex'>
                            <div className='h-[50px] my-[10px]'>
                                <img src={done_desktop} className='mx-auto w-[35px] h-[35px]'></img>
                                <h2 className='text-[12px] text-white font-bold text-center'>Encrypted</h2>
                            </div>
                            <div className='h-[50px] my-[10px]'>
                                <img src={done_desktop} className='mx-auto w-[35px] h-[35px]'></img>
                                <h2 className='text-[12px] text-center text-white font-bold'>AutoEmails</h2>
                            </div>
                            {enc? (<>
                                <div className='h-[50px] my-[10px]'>
                                <img src={done_desktop} className='mx-auto w-[35px] h-[35px]'></img>
                                <h2 className='text-[12px] text-center text-white font-bold'>Verified</h2>
                            </div>
                            </>):(<>
                              
                            </>)}
                            </div>
  <ProductSearch contractAddress={storeContractByURL} />
  <div className='z-[1] sm:w-5/12 w-11/12 m-auto mt-[5px] !rounded-[15px] overflow-hidden'>
  </div>
  {product ? (
    <div className="space-y-8">
        <h3 className="sm:text-6xl text-4xl text-[#FFDD00] font-bold text-center">{product?.name}</h3>
        {storeContractByURL=='0xd9Cc98ed8fD8dF69E4575260B6aa3bA9755e687d'|| storeContractByURL=='0xF034bF0135A6b20ec5b16483a1b83f21da63b3DD'? (<></>) : (<>
          {reward!==0 ? (<>
                    <RewardBadge
                type={type}
                theSymbolOfReward={theSymbolOfReward}
                reward={reward}
                />
                </>):(<></>)}
      </>)}
      {/* Price, Discount, and Quantity Tags */}
      <div className="flex flex-wrap justify-center items-center gap-6 my-8">
       {/* Price Tag */}
       <div className="relative z-10">
        {(() => {
          const isWETH = paymentAddress === "0xE1CbE71D2e56aAc7d50eB0ef855Fe5E4B51DF26c";
          const price = HexToInteger(product?.price._hex);
          const discount = HexToInteger(product?.discountPercentage._hex);

          // Determine the multiplier based on type
          const multiplier = type === 'Renting' || type === 'Rentals' ? 1 : 1;

          const formattedPrice = isWETH 
            ? (price / 1e18 * multiplier).toFixed(multiplier === 30 ? 2 : 2) 
            : (price / 1e6 * multiplier).toFixed(multiplier === 30 ? 2 : 2);

          const discountedPrice = isWETH 
            ? ((price * (100 - discount)) / (100 * 1e18) * multiplier).toFixed(multiplier === 30 ? 2 : 2) 
            : ((price * (100 - discount)) / (100 * 1e6) * multiplier).toFixed(multiplier === 30 ? 2 : 2);

          const logoSrc = isWETH ? logoOfWebsite : usdcoinusdclogo;

          // Determine the label based on type
          const label = type === 'Renting' || type === 'Rentals' ? 'Price Per Day' 
                      : type === 'Sales' ? 'Sales Price' 
                      : type === 'Liquidity' ? 'Fixed Price' 
                      : 'Price';

          return (
            <div className="flex flex-wrap justify-center items-center gap-1 bg-gradient-to-r from-blue-400 to-[#00FFFF] text-black font-bold py-3 px-6 rounded-lg shadow-lg transform">
              {discount !== 0 ? (
                <>
                  <span className="text-lg line-through mr-2 text-red-500">{formattedPrice}</span>
                  <span className="text-3xl text-white">{discountedPrice}</span>
                </>
              ) : (
                <span className="text-3xl text-white">{formattedPrice}</span>
              )}
              <img src={logoSrc} className="h-[35px] w-[35px]" />
              <div className="absolute -top-2 -right-2 bg-green-500 text-yellow-200 text-xs font-bold px-2 py-1 rounded-full shadow">
                {label}
              </div>
            </div>
          );
        })()}
      </div>

        {/* Quantity Indicator */}
        {storeContractByURL=='0xb9288F571322151414d65c8622D1621b60ffdF6e' ? (<></>):(<>
          <div className="relative z-10">
          <div className="bg-gradient-to-r from-green-400 to-green-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg">
            <span className="text-3xl">{ethers.BigNumber.from(product?.quantity.toString()).toString()}</span>
            <span className="text-xl ml-1">left</span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-yellow-300 text-purple-700 text-xs font-bold px-2 py-1 rounded-full shadow">
            In Stock
          </div>
        </div>
        </>)}
        {/* Discount Tag */}
        {HexToInteger(product.discountPercentage._hex) !== 0 && (
          <div className="relative z-10">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform rotate-3">
              <span className="text-3xl">{HexToInteger(product?.discountPercentage._hex)}%</span>
              <span className="text-xl ml-1">OFF</span>
            </div>
            <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow animate-pulse">
              Save!
            </div>
          </div>
        )}

      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
      <div className={`w-full sm:w-1/2 sm:my-0`}>
      {/* Large preview image */}
      <div className="w-full bg-white mb-2 sm:max-h-[500px] max-h-[180px] h-[180px] sm:h-[500px] rounded-2xl overflow-hidden">
        <IPFSMediaViewer
          ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${selectedImage}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
          className='sm:max-h-[500px] max-h-[180px] h-[180px] sm:h-[500px]'
        />
      </div>

      {/* Thumbnail strip */}
      <div className="flex flex-row gap-3 overflow-x-auto p-1 touch-auto">
        {imagesOfProduct.map((imageHash, index) => (
          <div
            key={index}
            className="flex-shrink-0 bg-white w-[108px] h-[61px] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:ring-2 hover:ring-blue-500"
            onMouseEnter={() => setSelectedImage(imageHash)}
            onClick={() => setSelectedImage(imageHash)}
          >
            <IPFSMediaViewer
              ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${imageHash}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
              className='max-h-[65px] w-full'
            />
          </div>
        ))}
      </div>
    </div>
        <div className="text-white w-full sm:w-1/2 overflow-auto touch-auto">
          {renderDescriptionWithBreaks(product?.productDescription)}
        </div>
        
      </div>
      
      <div className="space-y-4 h-[350px] overflow-auto touch-auto">
        <h3 className="text-2xl text-orange-400 sm:mt-[0px] mt-[30px]">Shop Reviews</h3>
        <h3 className="text-2xl text-[#FFDD00]">Avarage Rating:</h3>
        <div className='border-b border-gray-700 border-b-[1px] pb-[20px]'><StarRatingMain rating={userRatingAvarage} /></div>
        {reviews && reviews.length > 0 ? (
  reviews.map((review, index) => (
    <div key={index} className="border-b border-gray-700 border-b-[1px] pb-[20px]">
      <StarRating rating={Number(review.rating.toString())} />
      <p className="text-white mt-2">{review.comment}</p>
      <a href={`https://Base.blockscout.com/address/${review.user}`} className="text-white mt-2 text-[12px]">{review.user}</a>
      <p className='text-white mt-2'>Invoice: {review.receipt.toString()}</p>
    </div>
  ))
) : (
  <p className="text-white">No reviews yet</p>
)}
      </div>
      <div className='mb-[20px]'>
      {canLeaveReview && (
        <div className="space-y-4 mb-[20px]">
          <h1 className="text-white text-xl">Leave a Review</h1>
          <StarRatingForNewReview 
            rating={selectedRating} 
            onRatingChange={handleStarChange} 
          />
          <p className="text-white">Selected Rating: {selectedRating}</p>
          <textarea
            className="w-full p-2 rounded-lg linear-gradient1 text-white h-[300px] placeholder:text-[#FFFFFF] placeholder:text-[#FFFFFF]"
            placeholder="Your review"
            value={form.review}
            onChange={(e) => handleFormFieldChange('review', e)}
          />
          <button
            className={`bg-gradient-to-r bg-cyan-400 text-black font-semibold rounded-lg p-4 shadow-md hover:opacity-90 transition-opacity duration-300 ease-in-out w-full sm:w-auto mb-[20px] ${buttonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => addReview(selectedRating, form.review)}
            disabled={buttonDisabled}
          >
            Add Review
          </button>
        </div>
      )}
      </div>
    </div>
  ):(<></>)} 
    {isRegistered? (<>
    <br/>
    {userSecretKey!=='NOKEY' ? (<>
      <textarea
      className="w-full p-2 rounded-lg linear-gradient1 mb-[5px] mt-[15px] text-white h-[300px] placeholder:text-[#FFFFFF]"
      placeholder="More info if needed"
      value={form.moreInfo}
      onChange={(e) => handleFormFieldChange('moreInfo', e)}
    />
    </>):(<></>)}
    
    {StoreURL=='DeAl'&&productUrl=='LISTBIZ' ? (<></>):(
      <>
        
      {type=='Sales' ? (<>
        <span className='text-white font-bold text-[14px]'>Amount</span>
      <input
        className="w-2/12 p-2 mt-[10px] mb-[15px] rounded-lg linear-gradient1 text-white mx-[20px] placeholder:text-[#FFFFFF]"
        type="number"
        min={1}
        placeholder="Amount"
        value={amountOfProduct}
        onChange={(e) => setAmountOfProduct(e.target.value)}
    />
      </>):(<>
      {paymentAddress=='0x4200000000000000000000000000000000000006'? (<>
        <input
        className="w-2/12 p-2 mt-[10px] mb-[15px] rounded-lg linear-gradient1 text-white mx-[20px] placeholder:text-[#FFFFFF]"
        type="number"
        min={1}
        placeholder="Amount"
        value={amountOfProduct}
        onChange={(e) => setAmountOfProduct(e.target.value)}
    />
    <span className='text-white font-bold text-[14px] mr-[20px]'>Amount</span>
      </>):(<>
        <input
        className="w-2/12 p-2 mt-[10px] mb-[15px] rounded-lg linear-gradient1 text-white mx-[20px] placeholder:text-[#FFFFFF]"
        type="number"
        min={1}
        placeholder="Amount"
        value={amountOfProduct}
        onChange={(e) => setAmountOfProduct(e.target.value)}
    />
    {storeContractByURL=='0xF034bF0135A6b20ec5b16483a1b83f21da63b3DD' ? (<></>):(<span className='text-white font-bold text-[14px] mr-[20px]'>Days</span>)}
      </>)}
      
      </>)}
    </>
    )}
     {address ? (
  <>
  <TransactionButton
    className={`!bg-[#FFDD00] !mr-[10px] !hover:bg-orange-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out ${amountOfProduct*(HexToInteger(product?.price._hex)-HexToInteger(product?.discountPercentage._hex)*HexToInteger(product?.price._hex)/100)<allowance ? ('!hidden'):('')}`}
    transaction={async () => {
      const finalPrice = await Math.round(Math.round(HexToInteger(product?.price._hex))*(100-(HexToInteger(product?.discountPercentage._hex)))/100)*amountOfProduct+1e3;
      const spender = storeContractByURL;
      const value = finalPrice;
      const tx = prepareContractCall({
        contract:PaymentContract,
        method: "function approve(address spender, uint256 value) returns (bool)", 
        params: [spender, value],
        value: 0,
      });
      return tx;    
    }}
    onTransactionSent={(result) => {
      console.log("Transaction submitted", result.transactionHash);
    }}
    onTransactionConfirmed={async(receipt) => {
      console.log("Transaction confirmed", receipt.transactionHash);
      const data = await PaymentContract1.call('allowance',[address,storeContractByURL]);
      setAllowance(HexToInteger(data._hex));
    }}
    onError={(error) => {
      console.error("Transaction error", error);
    }}
  >
    {symbolPayment? (
      <>
      Approve {symbolPayment}
      </>
    ):(
      <>
      Approve $USDT
      </>
    )}
  </TransactionButton>
   
   <TransactionButton
    className={`!mt-[30px] !bg-[#FFDD00] ${allowance >= (HexToInteger(product?.price._hex)-HexToInteger(product?.discountPercentage._hex)*HexToInteger(product?.price._hex)/100)*amountOfProduct ? (''):('!hidden')}`}
      transaction={async() => {
        let IPFSOFNFT = '';
        let priceForNFT = 0;
        if(paymentAddress=='0xE1CbE71D2e56aAc7d50eB0ef855Fe5E4B51DF26c') {
          priceForNFT = await ((HexToInteger(product?.price._hex) * (100 - HexToInteger(product?.discountPercentage._hex))) / (100 * 1e18));
        }
        if(paymentAddress=='0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913') {
          priceForNFT = await ((HexToInteger(product?.price._hex) * (100 - HexToInteger(product?.discountPercentage._hex))) / (100 * 1e6));
        }
        const rewardForUser = await rewardCalc(type);
        const today = new Date();
        const sellDate = await `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

        const expirationPeriod = await amountOfProduct * 24 * 60 * 60 * 1000; // Example: 30 days from now
        const expirationDateObj = await new Date(Date.now() + expirationPeriod);
        const expirationDate = await `${expirationDateObj.getDate().toString().padStart(2, '0')}/${(expirationDateObj.getMonth() + 1).toString().padStart(2, '0')}/${expirationDateObj.getFullYear()}`;

        if(type=='Rentals' || type=='Renting') {
          const upload = await pinata.upload.json({
            name: `Invoice`,
            description: `Services entrence from ${storeName}\nLink to the store: https://ultimatedeal.net/shop/${StoreURL}`,
            external_url: `https://ultimatedeal.net/shop/${StoreURL}`,
            image: `https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${imagesOfProduct[0]}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`,
            attributes: [
              { trait_type: "Invoice Id", value: invoiceCounter },
              { trait_type: "Product Name", value: product.name },
              { trait_type: "Rental Period", value: `${amountOfProduct} Days` },
              { trait_type: "Sell Date", value: sellDate },
              { trait_type: "Amount Payed", value: `${(priceForNFT*amountOfProduct).toFixed(2)} $USDT` },
              { trait_type: "Price Per Day", value: `${priceForNFT.toFixed(2)} $USDT` },
              { trait_type: "Reward Address", value: rewardAddress },
              { trait_type: "Reward Amount", value: `${rewardForUser.toFixed(2)} ${theSymbolOfReward}` },
              { trait_type: "Reward Symbol", value: `${theSymbolOfReward}` },
              { trait_type: `${product.name} Expiration Date`, value: expirationDate }
            ]
          });
          IPFSOFNFT = await upload.IpfsHash;
        }

        if(type=='Liquidity') {
          const upload = await pinata.upload.json({
            name: `Invoice`,
            description: `Services entrence from ${storeName}\nLink to the store: https://ultimatedeal.net/shop/${StoreURL}`,
            external_url: `https://ultimatedeal.net/shop/${StoreURL}`,
            image: `https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${imagesOfProduct[0]}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`,
            attributes: [
              { trait_type: "Invoice Id", value: invoiceCounter },
              { trait_type: "Product Name", value: product.name },
              { trait_type: "Sell Date", value: sellDate },
              { trait_type: "Amount Payed", value: `${(priceForNFT*amountOfProduct).toFixed(2)} $USDT` },
              { trait_type: "Price Of DeAl", value: `${priceForNFT.toFixed(2)} $USDT` },
              { trait_type: "Reward Address", value: rewardAddress },
              { trait_type: "Reward Amount", value: `${amountOfProduct} ${theSymbolOfReward}` },
              { trait_type: "Symbol", value: `${theSymbolOfReward}` }
            ]
          });
          IPFSOFNFT = await upload.IpfsHash;
        }
        else if(type=='Sales') {
          const upload = await pinata.upload.json({
            name: `Invoice`,
            description: `Services entrence from ${storeName}\nLink to the store: https://ultimatedeal.net/shop/${StoreURL}`,
            external_url: `https://ultimatedeal.net/shop/${StoreURL}`,
            image: `https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${imagesOfProduct[0]}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`,
            attributes: [
              { trait_type: "Invoice Id", value: invoiceCounter },
              { trait_type: "Product Name", value: product.name },
              { trait_type: "Amount", value: amountOfProduct },
              { trait_type: "Sell Date", value: sellDate },
              { trait_type: "Amount Payed", value: `${(priceForNFT*(amountOfProduct)).toFixed(2)} $USDT` },
              { trait_type: "Price", value: `${(priceForNFT).toFixed(2)} $USDT` },
              { trait_type: "Reward Address", value: rewardAddress },
              { trait_type: "Reward Symbol", value: `${theSymbolOfReward}` },
              { trait_type: "Reward Amount", value: `${rewardForUser.toFixed(2)} ${theSymbolOfReward}` }
            ]
          });
          IPFSOFNFT = await upload.IpfsHash;
        }
        let theInfo = '';
        const encryptedMoreInfo = await encrypt(form.moreInfo, address,storeContractByURL);
        theInfo = await encryptedMoreInfo;
        const productUrlDecoded1 = decodeUrlString(productUrl);
        // Create a transaction object and return it
        const tx = prepareContractCall({
          contract:storeContract1,
          method: "function purchaseProduct(string _productBarcode, uint256 _amount, string _info, string metadata)", 
          params: [productUrlDecoded1,amountOfProduct,theInfo,await IPFSOFNFT]
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
      {storeContractByURL=='0xF034bF0135A6b20ec5b16483a1b83f21da63b3DD' ? (<>
      Purchase $USDT
      </>
    ):(<>
        Purchase
      </>)}
      
    </TransactionButton>
    
  </>
):(<></>)}
    
   

    <br/>
    {storeContractByURL=='0xd9Cc98ed8fD8dF69E4575260B6aa3bA9755e687d'|| storeContractByURL=='0xF034bF0135A6b20ec5b16483a1b83f21da63b3DD'? (<></>):(
      <>
      <button
          className="my-[30px] w-[150px] h-[50px] border-[1px] border-red-500 hover:bg-orange-400 bg-transparent text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out flex-1"
          onClick={() => handleRemoveClient()}
        >
          Unregister
        </button>
        </>
    )}
      {storeContractByURL=='0xF034bF0135A6b20ec5b16483a1b83f21da63b3DD' ? (<>
    <TransactionButton
    className={"!mr-[25px] !bg-[#FFDD00] !hover:bg-orange-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out"}
    transaction={async () => {
      const spender = storeContractByURL;
      const value = amountOfProduct;
      const tx = prepareContractCall({
        contract:RewardContract,
        method: "function approve(address spender, uint256 value) returns (bool)", 
        params: [spender, value*1e18],
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
    Approve DeAl
  </TransactionButton>
  <input
        className="w-2/12 p-2 mt-[10px] mb-[15px] rounded-lg linear-gradient1 text-white mx-[20px] placeholder:text-[#FFFFFF]"
        type="number"
        min={1}
        placeholder="Invoice Id"
        value={receipt}
        onChange={(e) => setReceipt(e.target.value)}
    />
        <TransactionButton
    className='!mt-[30px] !bg-[#FFDD00]'
      transaction={async() => {
        const productUrlDecoded1 = decodeUrlString(productUrl);
        // Create a transaction object and return it
        const tx = prepareContractCall({
          contract:storeContract1,
          method: "function sell(uint256 _amount,string memory _barcode,uint256 _invoiceId)", 
          params: [amountOfProduct,productUrlDecoded1,receipt],
          value: 0
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
      Sell DeAl
      
    </TransactionButton>
    <p className='mt-[15px] text-[#FFDD00]'>Balance Of The Bank: {formatNumberWithCommas(Balance.toFixed(2))}$</p>
      </>
    ):(<></>)}
    
    {ownerShip ? (<>
      <div className='mt-[20px] ml-[25px] sm:mb-[90px]'>
          <img src={VerifiedIcon} className='mx-auto w-[70px] h-[70px] sm:w-[35px] sm:h-[35px]'></img>
          <h2 className='text-[12px] text-white font-bold text-center'>Owned</h2>
          <button onClick={async() => await navigateToReactJS()} className='w-[250px] h-[35px] flex justify-center items-center z-5 font-bold text-[#FFFFF2] !mx-auto rounded-[15px] bg-[#00FFFF]'>Click Here</button>
      </div>
    </>):(<></>)}
    </>):(<>
        {address? (<> <h2 className="text-2xl font-semibold text-white">Register as a client of this store</h2>
                <p className="text-gray-300 mt-[10px]">All details are encrypted by the website</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {storeContractByURL==import.meta.env.VITE_ULTIMATEDEAL_STORE  || storeContractByURL=='0x8Ccf7b92D22B3dc098eeeCFe0E1582Dd152f0c75'? (<></>):(<input
                        className="w-full p-4 mt-[10px] rounded-lg linear-gradient1 text-white placeholder:text-[#FFFFFF]"
                        type="text"
                        placeholder="Your Physical Address"
                        value={physicalAddressOfClient}
                        onChange={(e) => setPhysicalAddressOfClient(e.target.value)}
                    />)}
                    <input
                        className="w-full p-4 mt-[10px] rounded-lg linear-gradient1 text-white placeholder:text-[#FFFFFF]"
                        type="text"
                        placeholder="Your Email"
                        value={emailOfClient}
                        onChange={(e) => setEmailOfClient(e.target.value)}
                    />
                    <input
                        className="w-full p-4 mt-[10px] rounded-lg linear-gradient1 text-white placeholder:text-[#FFFFFF]"
                        type="text"
                        placeholder="Your Phone Number"
                        value={phoneNumOfClient}
                        onChange={(e) => setPhoneNumOfClient(e.target.value)}
                    />
                    <input
                        className="w-full p-4 mt-[10px] rounded-lg linear-gradient1 text-white placeholder:text-[#FFFFFF]"
                        type="text"
                        placeholder="Your Name"
                        value={nameOfClient}
                        onChange={(e) => setNameOfClient(e.target.value)}
                    />
                </div>
                <TransactionButton
                disabled={!nameOfClient || !emailOfClient || !phoneNumOfClient}
    className={`mb-[20px] !bg-cyan-400 !mt-[30px] hover:bg-orange-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out flex-1 ${!nameOfClient || !emailOfClient || !phoneNumOfClient ? 'opacity-50 cursor-not-allowed' : ''}`}
    
      transaction={async () => {
        setIsLoading(true);
           const encryptedName = await encrypt(nameOfClient, address,storeContractByURL);
           const encryptedEmail = await encrypt(emailOfClient, address,storeContractByURL);
           let temp = physicalAddressOfClient;
           if(storeContractByURL==import.meta.env.VITE_ULTIMATEDEAL_STORE || storeContractByURL=='0x8Ccf7b92D22B3dc098eeeCFe0E1582Dd152f0c75') {
            temp = 'UltimateDeAl PORT';
            }
           const encryptedPhoneNumOfClient = await encrypt(phoneNumOfClient, address,storeContractByURL)
           const encryptedPhysicalAddressOfClient = await encrypt(temp, address,storeContractByURL);
        // Create a transaction object and return it
        const tx = prepareContractCall({
          contract:storeContract1,
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
        setIsLoading(false);
        refreshPage();
      }}
      onError={(error) => {
        setIsLoading(false);
        console.error("Transaction error", error);
      }}
    >
      Register
    </TransactionButton>
        </>):(<>
        <ConnectButton
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

              "Make your first step to the journey of your life. Contribute to businesses anonymously and get shares in return and dividends. Open a Crowdfunding campaign and issue your business shares to the public. Get started by connecting your wallet.",

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
                {

                  address: import.meta.env.VITE_DEAL_COIN_ADDRESS, // token contract address
    
                  name: "DeAl",
    
                  symbol: "DEAL",
    
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

              backgroundColor: "red",

              },

              }}

              />
      </>)}
       
      </>
      )}
      {address ? (<div>

<div className="flex gap-4 mt-[20px]">
      <input
        className="flex-1 p-4 rounded-lg linear-gradient1 text-white placeholder:text-[#FFFFFF] placeholder:text-[#FFFFFF]"
        type="text"
        placeholder="Enter Invoice Number"
        value={receipt}
        onChange={e => setReceipt(e.target.value)}
      />
      <button
        className="bg-cyan-400 hover:bg-orange-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out"
        onClick={() => AddReviewButton()}
      >
        Review
      </button>
    </div>
</div>):(<></>)}


  <div className="mt-8 p-4 bg-gray-800 rounded-lg">
    <h2 className="text-xl font-semibold mb-2 text-white">Important!</h2>
    <h2 className='text-[#FFDD00]'>Must Approve To Let The Blockchain Use Your Coins Before Purchasing The Product.
    </h2>
  </div>
</div>
  )
}

export default Product