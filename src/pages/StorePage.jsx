import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import { useNavigate } from 'react-router-dom';
import { logoOfWebsite, leader, atom, LingureLogo,VerifiedIcon,done_desktop } from '../assets';
import { CustomButton, Loader, CustomDropdownProducts, FormField, StarRatingForNewReview,ProductBox,ProductSearch,RewardBadge, Swapper } from '../components';
import { Base } from "@thirdweb-dev/chains";
import { ethers } from 'ethers';
import { useContract } from '@thirdweb-dev/react';
import { fontSizes } from '../components/AccessibilityMenu';
import { createThirdwebClient, prepareContractCall, getContract } from "thirdweb";
import { useSendTransaction,TransactionButton } from 'thirdweb/react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const StorePage = () => {
    const navigate = useNavigate();
    const client = createThirdwebClient({clientId:import.meta.env.VITE_THIRDWEB_CLIENT});
    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
    const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`;
    const POLYRPC1 = 'https://base-mainnet.g.alchemy.com/v2/d32cys2ito51Xt9AgfAUTBuIuQd-yQbm';
    const defaultFontSizeIndex = fontSizes.indexOf('sm');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedCategoryName, setSelectedCategoryName] = useState('All');
    const [reward,setReward] = useState(0);
    const [allProducts, setAllProducts] = useState([]);
    const [physicalAddressOfClient, setPhysicalAddressOfClient] = useState('');
    const [emailOfClient, setEmailOfClient] = useState('');
    const [amount, setAmount] = useState('');
    const [nameOfClient, setNameOfClient] = useState('');
    const [storeContractByURL, setStoreContractByURL] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [responseData, setResponseData] = useState('');
    const [userSecretKey, setUserSecretKey] = useState('');
    const [type, setType] = useState('');
    const [phoneNumOfClient, setPhoneNumOfClient] = useState('');
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [userRatingAverage, setUserRatingAverage] = useState(0);
    const [selectedRating, setSelectedRating] = useState(4);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [categories, setCategories] = useState(['All']);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [canLeaveReview, setCanLeaveReview] = useState(false);
    const [storeName, setStoreName] = useState('');
    const [storeBanner, setStoreBanner] = useState('');
    const [dataOfStore, setDataOfStore] = useState('');
    const [dataOfVoting, setDataOfVoting] = useState('');
    const [reviews, setReviews] = useState([]);
    const [isRegistered,setIsRegistered] = useState(false);
    const [theSymbol,setTheSymbol] = useState('');
    const [rewardAddress,setRewardAddress] = useState('');
    const [enc,setEnc] = useState(false);
    const [paymentAddress,setPaymentAddress] = useState('');
    const [theSymbolOfReward,setTheSymbolOfReward] = useState('');
    const { storeRegistery, encrypt, address, refreshPage,getVotingDetails, Stores } = useStateContext();
    const StoreURL = window.location.pathname.split('/')[2];
    const { contract: rewardContract } = useContract(rewardAddress);
    const { contract: theStoreContract } = useContract(storeContractByURL);
    const [theERCUltra,setTheERCUltra] = useState('')
    const [owner,setOwner] = useState('');
    const { contract: ShareContract } = useContract(theERCUltra);
    
    const [form, setForm] = useState({
        review: '',
        imageForReview: '',
    });

    const storeContract = getContract({
        client: client,
        chain: {
            id: 8453,
            rpc: POLYRPC,
        },
        address: storeContractByURL,
    });

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
    }

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
    }

    const productsBarcodes = async (category) => {
        try {
            setIsLoading(true);
            
            const barcodes = await theStoreContract.call('getAllProductsBarcodes');
            const products = [];
            for (const barcode of barcodes) {
                const product = await theStoreContract.call('products', [barcode]);
                
                // Ensure the barcode is correctly stored with the product
                if (category === 'All' || product.category === category) {
                    await products.push({
                        barcode: barcode,  // Make sure this is the correct barcode
                        name: product.name,
                        description: product.description,
                        category: product.category,
                        price: product.price,
                        image: product.image,
                        quantity: product.quantity
                    });
                }
            }
            
            console.log('Loaded products:', products);
            if(products.length>0) {
                await setAllProducts(products);
            } // Debug log
            setIsLoading(false);
            
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
        }
    };
    

    const canUserLeaveReview = async () => {
        try {
            setIsLoading(true);
            const hasReviewed = await storeRegistery.call('hasUserReviewedStore', [address, StoreURL]);
            const hasValidReceipt = await theStoreContract.call('verifyReceipt', [address, 0]);
            const canLeaveReview = !hasReviewed && hasValidReceipt;
            setIsLoading(false);
            setCanLeaveReview(canLeaveReview);
            return canLeaveReview;
        } catch (error) {
            console.error("Error checking if user can leave a review:", error);
            setIsLoading(false);
            setCanLeaveReview(false);
            return false;
        }
    }

    const fetchReviews = async () => {
        try {
            setIsLoading(true);
            const data = await storeRegistery.call('getStoreReviews', [StoreURL]);
            if (data && data.length > 0) {
                const processedReviews = data.map(review => ({
                    user: review[0],
                    rating: review[1] ? Number(review[1].toString()) : 0,
                    comment: review[2],
                    receipt: review[3] ? review[3].toString() : ''
                }));
                setReviews(processedReviews);
                const averageRating = await storeRegistery.call('getStoreAverageRating', [StoreURL]);
                setUserRatingAverage(averageRating);
            }
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchReward = async () => {
            setIsLoading(true);
            if(type=="Rentals") {
                const data = await theStoreContract.call('rewardsPool');
                setReward(data*2/100000);
            }
            if(type=="Sales") {
                const data = await theStoreContract.call('rewardsPool');
                setReward(data*2/1000);
            }
            setIsLoading(false);
          }
          
          const fetchCategories = async () => {
            setIsLoading(true);
            const theTypeOfContract = await theStoreContract.call('typeOfContract');
            setType(theTypeOfContract);
            const fetchedCategories = await theStoreContract.call('getAllCategories');
            setCategories(['All', ...fetchedCategories]);
            setIsLoading(false);
        };
          
        
        // Fetch basic store information
        const fetchStoreInfo = async () => {
            try {
                const data = await storeRegistery.call('getStoreByURLPath', [StoreURL]);
                await setStoreContractByURL(data.smartContractAddress);
                await setStoreName(data.name);
                await setStoreBanner(data.picture);
                await setDataOfStore(data);
                return data;
            } catch (error) {
                console.error("Error fetching store info:", error);
                throw error;
            }
        };

        // Fetch and set voting system details
        const fetchVotingInfo = async () => {
            try {
                const isEnc = await storeRegistery.call('getStoreVotingSystem', [StoreURL]);
                setEnc(isEnc[5]);
                const votingdata = await getVotingDetails(StoreURL);
                
                if (votingdata) {
                    await setDataOfVoting(votingdata);
                    await setTheERCUltra(votingdata[1]);
                    await setOwner(votingdata.storeOwner.toLowerCase());
                }
                return votingdata;
            } catch (error) {
                console.error("Error fetching voting info:", error);
                throw error;
            }
        };

        // Check user registration status
        const checkUserRegistration = async () => {
            try {
                if (address && theStoreContract) {
                    const isClient = await theStoreContract.call('isClient', [address]);
                    await setIsRegistered(isClient);
                }
            } catch (error) {
                console.error("Error checking user registration:", error);
                throw error;
            }
        };

        // Fetch share contract details
        const fetchShareDetails = async () => {
            try {
                if (ShareContract) {
                    const symbol = await ShareContract.call('symbol');
                    setTheSymbol(symbol);
                }
            } catch (error) {
                console.error("Error fetching share details:", error);
                throw error;
            }
        };

        // Fetch products and reviews
        const fetchProductsAndReviews = async () => {
            try {
                await fetchReviews();
                
                if (storeRegistery && theStoreContract) {
                    if (address) {
                        await canUserLeaveReview();
                    }
                }
            } catch (error) {
                console.error("Error fetching products and reviews:", error);
                throw error;
            }
        };

        // Main function that orchestrates all the fetching
        const fetchStoreAndProducts = async () => {
            try {
                setIsLoading(true);
                // Execute operations sequentially
                await fetchStoreInfo();
                await fetchVotingInfo();
                
            } catch (error) {
                console.error("Error in main fetch operation:", error);
            } finally {
                setIsLoading(false);
            }
        };

        

        const fetchRewardAddress = async () => {
            setIsLoading(true);
            const data = await theStoreContract.call('rewardToken');
            const data2 = await theStoreContract.call('tokenContract');
            setPaymentAddress(data2);
            setRewardAddress(data);
            setIsLoading(false);
        }

        const fetchRewardSymbol = async () => {
            setIsLoading(true);
            const data = await rewardContract.call('symbol');
            setTheSymbolOfReward(data);
            setTheSymbol(data);
            setIsLoading(false);
        }
    
        if (Stores && storeRegistery) {
            setIsLoading(true);
            fetchStoreAndProducts();
            if(theStoreContract) {
                fetchReward();
                fetchProductsAndReviews();
                checkUserRegistration();
                productsBarcodes(selectedCategory);
                fetchRewardAddress();
                fetchCategories();
                if(rewardContract) {
                    fetchRewardSymbol();
                }
            }
            setIsLoading(false);
        }

    }, [theStoreContract, storeRegistery,rewardContract,address]);

    const handleRemoveClient = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();

            const transaction = prepareContractCall({
                contract: storeContract,
                method: "function deleteCustomer(address _customerAddress)",
                params: [address],
                value: 0,
                gasPrice: gasPrice,
            });
            sendTransaction(transaction);
            setIsRegistered(false);
            setIsLoading(false);
        } catch (error) {
            alert('Error occurred while deleting the client. Contact support: ' + error);
            setIsLoading(false);
        }
    };

    const addReview = async (_stars, _review) => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();
            const transaction = prepareContractCall({
                contract: Stores,
                method: "function addStoreReview(string _urlPath, uint8 _stars, string _text, uint256 _receiptId)",
                params: [StoreURL, _stars, _review, receipt],
                value: 0,
                gasPrice: gasPrice,
            });
            sendTransaction(transaction);
            setIsLoading(false);
            await fetchReviews();
        } catch (error) {
            alert('Error occurred while adding the review. Please contact support: ' + error);
            setIsLoading(false);
        }
    };

    const formatNumberWithCommas = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
                            const fontSizeIndex = fontSizes.indexOf('sm') + 2;
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

    async function handleStarChange(newRating) {
        await setSelectedRating(prevRating => {
            return newRating;
        });
    }

    const handleProductSelect = (category) => {
        console.log(category);
        navigate("products/" + category);
    };

    const handleSelection = async (category) => {
        try {
            setIsLoading(true);
            setSelectedCategory(category);
        } catch (error) {
            console.error("Error handling category selection:", error);
        } finally {
            setIsLoading(false);
        }
    };
    

    const [receipt,setReceipt] = useState(null);
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
                      const fontSizeIndex = fontSizes.indexOf('sm') + 2;
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
    
    return (
        <div className=" linear-gradient1 rounded-[15px] mx-auto p-8 mt-[35px] overflow-auto touch-auto">
            {isLoading && <Loader />}
            <div className='relative justify-center flex'>
            <img src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${storeBanner}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`} className='sm:h-[120px] h-[50px] !sm:rounded-[15px] flex !rounded-[15px] !md:rounded-[15px]' />
            <h1 className="text-center flex font-bold text-[#ff9900] drop-shadow-md sm:text-8xl text-5xl">{storeName}</h1>
            </div>
            <div className='my-[25px]'>
            {address && address.toLowerCase()==owner ? (<a className={`bg-[#FFDD00] text-[#000000] font-epilogue font-semibold text-[16px] py-[15px] px-[40px] rounded-[5px] opacity-[75%] hover:opacity-[100%] duration-500 ease-in-out mt-[50px] mr-[15px]`} href={`/edit-store`}>Edit {storeName} Info</a>):(<></>)}
            </div>
            <div className='my-[15px]'>
            {StoreURL.toLocaleLowerCase()=='fire' ? (<a className={`bg-[#FFDD00] text-[#000000] font-epilogue font-semibold text-[16px] py-[15px] px-[40px] rounded-[5px] opacity-[75%] hover:opacity-[100%] duration-500 ease-in-out mt-[50px] mr-[15px]`} target='_blank' href={`/register-new-store`}>List Your Business</a>):(<></>)}
            </div>
            <div className='flex justify-center'>
            
            <div className='my-[10px] w-full justify-center'>
            
                <div className='w-full gap-8 justify-center flex'>
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
                        <div>
            <ProductSearch contractAddress={storeContractByURL}/>
            </div>
                </div>
            </div>
            <div className='z-[1] w-11/12 m-auto my-[5px] overflow-hidden'>
            {storeContractByURL=='0xd9Cc98ed8fD8dF69E4575260B6aa3bA9755e687d'||storeContractByURL=='0xF034bF0135A6b20ec5b16483a1b83f21da63b3DD' ? (<></>) : (<>
                {reward!==0 ? (<>
                    <RewardBadge
                type={type}
                theSymbolOfReward={theSymbolOfReward}
                reward={reward}
                />
                </>):(<></>)}
            </>)}

                
            </div>
            <h2 className='text-[#FFDD00] sm:text-[18px] text-[16px] mb-[15px]'>{renderDescriptionWithBreaks(dataOfStore.description)}</h2>
            {address? (            <h2 className='text-[#C3C2C1] font-bold sm:text-[18px] text-[16px] mb-[15px]'>{renderDescriptionWithBreaks(dataOfStore.contactInfo)}</h2>
):(            <h2 className='text-[#C3C2C1] font-bold sm:text-[18px] text-[16px] mb-[15px]'>Contact Info available only to connected users.</h2>
)}
{dataOfVoting?.votingSystemAddress ? (<button className={`bg-[#FFDD00] text-[#000000] font-epilogue font-semibold text-[16px] py-[15px] px-[40px] rounded-[5px] opacity-[75%] hover:opacity-[100%] duration-500 ease-in-out mt-[50px] mr-[15px]`} target='_blank' onClick={() => navigate('voting')}>{storeName} Decisions</button>) :(<></>)}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <div className="flex-1 w-full flex flex-col">
                {allProducts !== null ? (
                    <>
                        {/* Category Dropdown */}
                        <div className="flex flex-col w-full">
                            <span className="font-epilogue font-medium text-[20px] leading-[22px] text-[#FFDD00] mb-[10px] mt-[20px]">
                                Category:
                            </span>
                            <div className="z-50 relative inline-block text-left mb-[20px] sm:w-3/12 w-10/12 ease-in-out duration-500 hover:opacity-[100%] opacity-[70%]">
                                <button 
                                    type="button" 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-[#424242] px-3 py-2 text-sm font-semibold text-[#FFFFFF] ring-inset !text-[18px]"
                                >
                                    {selectedCategoryName}
                                    <svg className="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {isDropdownOpen && (
                                    <div 
                                        className="absolute h-[325px] overflow-auto touch-auto left-0 z-50 mt-2 w-56 origin-top-right rounded-md linear-gradient shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="menu-button"
                                        tabIndex="50"
                                    >
                                        <div className="py-1" role="none">
                                            {categories.map((category, index) => (
                                                <span
                                                    key={index}
                                                    className="text-[#FFFFFF] block px-4 z-50 py-2 text-sm hover:bg-[#FFFFFF] hover:bg-opacity-[25%] cursor-pointer"
                                                    role="menuitem"
                                                    tabIndex="50"
                                                    onClick={async() => {
                                                        await setIsDropdownOpen(false);
                                                        await setSelectedCategoryName(category);
                                                        await setSelectedCategory(category);
                                                        await productsBarcodes(category);
                                                    }}
                                                >
                                                    {category}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Products Display */}
                        <div className="flex gap-2 flex-wrap py-[25px] justify-center">
                            {allProducts && allProducts.length > 0 ? (
                                allProducts.map((product, index) => (
                                    <ProductBox
                                        contract={theStoreContract}
                                        key={index}
                                        product={product.barcode}
                                        productData={product}
                                        onClick={() => handleProductSelect(product.barcode)}
                                        type={type}
                                        paymentAddress={paymentAddress}
                                    />
                                ))
                            ) : (
                                <div className="text-white text-center py-4">
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <></>
                )}
                </div>
            </div>
            <div className='my-[30px]'>
                {responseData}
            </div>

            <div className="space-y-4 mt-8 h-[350px] overflow-auto touch-auto">
                <h3 className="text-2xl text-orange-400">Shop Reviews</h3>
                <h3 className="text-2xl text-[#FFDD00]">Average Rating:</h3>
                <div className='border-b border-gray-700 pb-4 py-[20px]'>
                <StarRatingMain rating={userRatingAverage} />
                </div>
                {reviews && reviews.length > 0 ? (
                    reviews.map((review, index) => (
                        <div key={index} className="border-b border-gray-700 pb-4 pb-[20px]">
                            <StarRating rating={Number(review.rating)} />
                            <p className="text-white mt-2">{review.comment}</p>
                            <a href={`https://base.blockscout.com/address/${review.user}`} className="text-white mt-2 text-[12px]">{review.user}</a>
                            <p className='text-white mt-2'>Invoice: {review.receipt}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-white">No reviews yet</p>
                )}
            </div>

            {canLeaveReview && (
                <div className="space-y-4 mt-8">
                    <h1 className="text-white text-xl">Leave a Review</h1>
                    <StarRatingForNewReview 
                        rating={selectedRating} 
                        onRatingChange={handleStarChange} 
                    />
                    <p className="text-white">Selected Rating: {selectedRating}</p>
                    <textarea
                        className="w-full p-4 rounded-lg linear-gradient1 text-white h-[300px] placeholder:text-[#FFFFFF]"
                        placeholder="Your review"
                        value={form.review}
                        onChange={(e) => handleFormFieldChange('review', e)}
                    />
                    <input
                        className="w-8/12 p-4 rounded-lg linear-gradient1 text-white placeholder:text-[#FFFFFF]"
                        type="text"
                        placeholder="Receipt ID"
                        value={receipt}
                        onChange={e => setReceipt(e.target.value)}
                    />
                    <button
                        className={`bg-gradient-to-r from-blue-500 to-yellow-500 text-black font-semibold rounded-lg px-4 py-2 shadow-md hover:opacity-90 transition-opacity duration-300 ease-in-out w-full sm:w-auto ${buttonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => addReview(selectedRating, form.review)}
                        disabled={buttonDisabled}
                    >
                        Add Review
                    </button>
                </div>
            )}

            <div className="mt-12 space-y-8">
                
                <div className="gap-4">
                {isRegistered? (<>
                    {storeContractByURL=='0xd9Cc98ed8fD8dF69E4575260B6aa3bA9755e687d'||storeContractByURL=='0xF034bF0135A6b20ec5b16483a1b83f21da63b3DD'? (<></>):(<>
                        <button
                            className="my-[30px] w-[150px] h-[50px] border-[1px] border-red-500 hover:bg-orange-400 bg-transparent text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out flex-1"
                            onClick={() => handleRemoveClient()}
                        >
                            Unregister
                        </button>
                    </>)}
                </>
                ):(<>
        {address? (<div> <h2 className="text-2xl font-semibold text-white">Register as a client of {storeName}</h2>
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
           const encryptedPhoneNumOfClient = await encrypt(phoneNumOfClient, address,storeContractByURL)
           let temp = physicalAddressOfClient;
           if(storeContractByURL==import.meta.env.VITE_ULTIMATEDEAL_STORE || storeContractByURL=='0x8Ccf7b92D22B3dc098eeeCFe0E1582Dd152f0c75') {
            temp = 'UltimateDeAl PORT';
            }
           const encryptedPhysicalAddressOfClient = await encrypt(temp, address,storeContractByURL);
        // Create a transaction object and return it
        const tx = prepareContractCall({
          contract:storeContract,
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
    </TransactionButton></div>):(<></>)}
        
        
       
      </>
    )}
                </div>
            </div>
           
                <div className='my-[35px]'>
           </div>
           <p className='text-center text-[#FFFFFF] sm:text-[30px] text-[12px] font-bold my-[25px]'>{theSymbolOfReward} address is {rewardAddress}</p>
           <p className=''></p>
           {theSymbolOfReward && rewardAddress ? (<><Swapper ERCUltraAddress={rewardAddress} SYMBOL={theSymbolOfReward}/></>):(<></>)} 
           

                <p className='text-center text-[#FFFFFF] sm:text-[50px] text-[25px] font-bold my-[25px]'>{theSymbolOfReward} Price</p>
                <div className='sm:flex sm:justify-items-center m-auto sm:items-center rounded-[15px] sm:w-11/12 w-full'>
                <iframe height="100%" width="100%" className='rounded-[15px] mx-auto h-[720px] w-full' id="geckoterminal-embed" title="GeckoTerminal Embed" src={`https://www.geckoterminal.com/base/tokens/${theERCUltra}?embed=1&info=0&swaps=1`} frameBorder="0" allow="clipboard-write" allowFullScreen></iframe>
                
                </div>
             
        </div>
    );
}

export default StorePage;