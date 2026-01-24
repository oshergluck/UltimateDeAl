import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import { useNavigate } from 'react-router-dom';
import { logoOfWebsite, leader, atom, LingureLogo, VerifiedIcon, done_desktop } from '../assets';
import { CustomButton, Loader, CustomDropdownProducts, FormField, StarRatingForNewReview, ProductBox, ProductSearch, RewardBadge, Swapper } from '../components';
import { Base } from "@thirdweb-dev/chains";
import { base } from "thirdweb/chains";
import { ethers } from 'ethers';
import { useContract,useSigner } from '@thirdweb-dev/react';
import { fontSizes } from '../components/AccessibilityMenu';
import { createThirdwebClient, prepareContractCall, getContract } from "thirdweb";
import { useSendTransaction, TransactionButton,useActiveAccount } from 'thirdweb/react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const StorePage = () => {
    const navigate = useNavigate();
    const account = useActiveAccount();
    const client = createThirdwebClient({ clientId: import.meta.env.VITE_THIRDWEB_CLIENT });
    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
    const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`;
    const defaultFontSizeIndex = fontSizes.indexOf('sm');
    
    // API URL Definition
    const API_URL = import.meta.env.VITE_MONGO_SERVER_API+"/api";

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedCategoryName, setSelectedCategoryName] = useState('All');
    const [reward, setReward] = useState(0);
    const [allProducts, setAllProducts] = useState([]);
    const [physicalAddressOfClient, setPhysicalAddressOfClient] = useState('');
    const [emailOfClient, setEmailOfClient] = useState('');
    const [amount, setAmount] = useState('');
    const [nameOfClient, setNameOfClient] = useState('');
    const [storeContractByURL, setStoreContractByURL] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [responseData, setResponseData] = useState('');
    const [type, setType] = useState('');
    const [phoneNumOfClient, setPhoneNumOfClient] = useState('');
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [userRatingAverage, setUserRatingAverage] = useState(0);
    const [selectedRating, setSelectedRating] = useState(4);
    const [categories, setCategories] = useState(['All']);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [canLeaveReview, setCanLeaveReview] = useState(false);
    const [storeName, setStoreName] = useState('');
    const [storeBanner, setStoreBanner] = useState('');
    const [dataOfStore, setDataOfStore] = useState('');
    const [dataOfVoting, setDataOfVoting] = useState('');
    const [reviews, setReviews] = useState([]);
    const [isRegistered, setIsRegistered] = useState(false);
    const [theSymbol, setTheSymbol] = useState('');
    const [rewardAddress, setRewardAddress] = useState('');
    const [enc, setEnc] = useState(false);
    const [paymentAddress, setPaymentAddress] = useState('');
    const [theSymbolOfReward, setTheSymbolOfReward] = useState('');
    const { storeRegistery, encrypt, address, refreshPage, getVotingDetails, Stores } = useStateContext();
    const StoreURL = window.location.pathname.split('/')[2];
    const { contract: rewardContract } = useContract(rewardAddress);
    const { contract: theStoreContract } = useContract(storeContractByURL);
    const [theERCUltra, setTheERCUltra] = useState('')
    const [owner, setOwner] = useState('');
    const { contract: ShareContract } = useContract(theERCUltra);

    // New State for Chart Lazy Loading
    const [showChart, setShowChart] = useState(false);

    // Modal States for Unregister
    const [showUnregisterModal, setShowUnregisterModal] = useState(false);
    const [confirmUnregister, setConfirmUnregister] = useState(false);

    const [form, setForm] = useState({
        review: '',
        imageForReview: '',
    });

    const handleFormFieldChange = (fieldName, e) => {
        setForm({ ...form, [fieldName]: e.target.value });
    };

    // ---------------------------------------------------------
    // New Fix: Reset state immediately when wallet disconnects
    // ---------------------------------------------------------
    useEffect(() => {
        if (!address) {
            // User disconnected - Reset all sensitive states
            setIsRegistered(false);
            setCanLeaveReview(false);
            
            // Reset form/user data
            setNameOfClient('');
            setEmailOfClient('');
            setPhoneNumOfClient('');
            setPhysicalAddressOfClient('');
            setReceipt(null);
            
            // Optional: Close modals if open
            setShowUnregisterModal(false);
        } else {
            // User connected/switched account - Re-check status
            checkRegistrationDB();
            
            if (storeRegistery && theStoreContract) {
                canUserLeaveReview();
                fetchShareDetails();
            }
        }
    }, [address]); 
    // ---------------------------------------------------------

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
            
            let products = [];
            const chunkSize = 5; // Process 5 items at a time to prevent mobile freezing

            for (let i = 0; i < barcodes.length; i += chunkSize) {
                const chunk = barcodes.slice(i, i + chunkSize);
                
                const chunkPromises = chunk.map(async (barcode) => {
                    try {
                        const product = await theStoreContract.call('products', [barcode]);
                        
                        if (category === 'All' || product.category === category) {
                            return {
                                barcode: barcode,
                                name: product.name,
                                description: product.description,
                                productDescription: product.description, 
                                category: product.category,
                                price: product.price,
                                image: product.image,
                                discountPercentage: product.discountPercentage,
                                quantity: product.quantity
                            };
                        }
                        return null;
                    } catch (err) {
                        console.error(`Error loading product ${barcode}:`, err);
                        return null;
                    }
                });

                const chunkResults = await Promise.all(chunkPromises);
                products = [...products, ...chunkResults.filter(p => p !== null)];
            }
            
            console.log('Loaded products:', products);
            
            if (products.length > 0) {
                setAllProducts(products);
            } else {
                setAllProducts([]);
            }
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

    // New Function: Check Registration via API (Store Specific)
    const checkRegistrationDB = async () => {
        if (!address) return;
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

    // New Function: Register via API
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
    
      if (!account?.address) {
        alert("Wallet not connected");
        return;
      }
    
      if (!storeContractByURL) {
        alert("Store not loaded yet");
        return;
      }
    
      setIsLoading(true);
    
      try {
        const timestamp = Date.now();
    
        const wallet = account.address.toLowerCase();
        const store = String(storeContractByURL).toLowerCase();
    
        const message = `I confirm that I want to delete my account: ${wallet} in store: ${store} at ${timestamp}`;
    
        const signature = await account.signMessage({ message });
    
        const response = await fetch(`${API_URL}/unregister`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: account.address,
            storeAddress: storeContractByURL,
            signature,
            timestamp,
          }),
        });
    
        const data = await response.json();
    
        if (!response.ok || !data.success) {
          throw new Error(data.error || `HTTP ${response.status}`);
        }
    
        setIsRegistered(false);
        setShowUnregisterModal(false);
        setConfirmUnregister(false);
    
        setNameOfClient("");
        setEmailOfClient("");
        setPhoneNumOfClient("");
        setPhysicalAddressOfClient("");
    
        alert("Account removed successfully");
      } catch (error) {
        console.error("Unregister failed:", error);
        alert("Error removing client: " + (error?.message || "Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };
    

    useEffect(() => {
        const fetchReward = async () => {
            setIsLoading(true);
            if (type == "Rentals") {
                const data = await theStoreContract.call('rewardsPool');
                setReward(data * 2 / 100000);
            }
            if (type == "Sales") {
                const data = await theStoreContract.call('rewardsPool');
                setReward(data * 2 / 1000);
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
            const data = await ShareContract.call('symbol');
            setTheSymbolOfReward(data);
            setIsLoading(false);
            setTheSymbol(data);
        }

        if (Stores && storeRegistery) {
            setIsLoading(true);
            fetchStoreAndProducts();
            if (theStoreContract) {
                fetchReward();
                fetchProductsAndReviews();
                // Replace on-chain check with API check
                if (address) {
                    checkRegistrationDB();
                }
                productsBarcodes(selectedCategory);
                fetchRewardAddress();
                fetchCategories();
                if (ShareContract) {
                    fetchRewardSymbol();
                }
            }
            setIsLoading(false);
        }

    }, [theStoreContract, storeRegistery, rewardContract, address]);

    const [storeContract, setStoreContract] = useState(null);

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
                    const defaultSize = fontSizes[defaultFontSizeIndex - 7];

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


    const [receipt, setReceipt] = useState(null);

    return (<>
        {isLoading && <Loader />}
      
        <div className=" mx-auto w-full max-w-[1200px] px-3 sm:px-6 lg:px-8 pt-8 pb-16 overflow-x-hidden">
          
          {/* Header Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
            
            {/* Banner */}
            <div className="relative h-[140px] sm:h-[220px] w-full">
              {storeBanner ? (
                <img
                  src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${storeBanner}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                  className="h-full w-full object-cover"
                  alt="Store Banner"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-blue-700/40 via-cyan-500/20 to-blue-900/40" />
              )}
      
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
      
              {/* Title */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div>
                  <h1 className="text-white font-extrabold tracking-tight text-3xl sm:text-5xl drop-shadow-lg">
                    {storeName}
                  </h1>
      
                  <div className="mt-2 flex items-center gap-2">
                    
      
                    {enc && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs sm:text-sm text-white/90 border border-white/10">
                      🛡️ Verified Store
                        </span>
                    )}
                  </div>
                </div>
      
                {/* Owner Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {address && address.toLowerCase() === owner ? (
                    <a
                      href={`/edit-store`}
                      className="rounded-xl bg-white text-blue-700 font-bold px-4 py-2 text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition"
                    >
                      ✏️ Edit Store
                    </a>
                  ) : null}
      
                  {StoreURL?.toLowerCase() === "fire" ? (
                    <a
                      target="_blank"
                      href={`/register-new-store`}
                      className="rounded-xl bg-blue-600 text-white font-bold px-4 py-2 text-sm sm:text-base shadow-lg hover:bg-blue-500 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition"
                    >
                      ➕ List Your Business
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
      
            {/* Description / Contact */}
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Description */}
                <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                  <h2 className="text-white font-bold text-lg sm:text-xl mb-2">
                    About {storeName}
                  </h2>
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                    {renderDescriptionWithBreaks(dataOfStore.description)}
                  </p>
                </div>
      
                {/* Contact */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                  <h2 className="text-white font-bold text-lg sm:text-xl mb-2">
                    Contact
                  </h2>
      
                  {address ? (
                    <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                      {renderDescriptionWithBreaks(dataOfStore.contactInfo)}
                    </p>
                  ) : (
                    <p className="text-white/60 text-sm sm:text-base">
                      🔒 Contact info available only to connected users.
                    </p>
                  )}
                </div>
              </div>
      
              {/* Voting */}
              {dataOfVoting?.votingSystemAddress ? (
                <div className="mt-4 flex justify-center sm:justify-start">
                  <button
                    onClick={() => navigate("voting")}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-black font-extrabold px-5 py-3 shadow-lg hover:opacity-95 hover:shadow-xl transition"
                  >
                    🗳️ {storeName} Decisions
                  </button>
                </div>
              ) : null}
            </div>
          </div>
      
          {/* Search + Reward */}
          <div className="relative z-[200] mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-6 shadow-xl">
              <h3 className="text-white font-bold text-lg sm:text-xl mb-3">
                🔎 Search Products
              </h3>
              <div className="relative z-[50] rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4">
                <ProductSearch contractAddress={storeContractByURL} />
                </div>

            </div>
      
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-6 shadow-xl">
              <h3 className="text-white font-bold text-lg sm:text-xl mb-3">
                🎁 Rewards
              </h3>
      
              {storeContractByURL === '0xd9Cc98ed8fD8dF69E4575260B6aa3bA9755e687d' ||
              storeContractByURL === '0xF034bF0135A6b20ec5b16483a1b83f21da63b3DD' ? (
                <p className="text-white/60 text-sm">
                  Rewards are disabled for this store.
                </p>
              ) : reward !== 0 ? (
                <RewardBadge type={type} theSymbolOfReward={theSymbolOfReward} reward={reward} />
              ) : (
                <p className="text-white/60 text-sm">
                  No rewards available right now.
                </p>
              )}
            </div>
          </div>
      
          {/* Reviews */}
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-white font-extrabold text-xl sm:text-2xl">
                ⭐ Shop Reviews
              </h3>
      
              <div className="flex items-center gap-2">
                <span className="text-white/70 font-semibold">Average:</span>
                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                  <StarRatingMain rating={userRatingAverage} />
                </div>
              </div>
            </div>
      
            <div className="mt-4 max-h-[380px] overflow-auto pr-1 space-y-4">
              {reviews && reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-black/30 transition"
                  >
                    <StarRating rating={Number(review.rating)} />
                    <p className="text-white/90 mt-2 text-sm sm:text-base">
                      {review.comment}
                    </p>
      
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/60">
                      <a
                        href={`https://base.blockscout.com/address/${review.user}`}
                        className="hover:text-white underline underline-offset-4"
                      >
                        {review.user}
                      </a>
                      <span className="text-white/30">•</span>
                      <span>Invoice: {review.receipt}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/60">No reviews yet</p>
              )}
            </div>
          </div>
      
          {/* Leave Review */}
          {canLeaveReview && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-4 sm:p-6">
              <h2 className="text-white font-extrabold text-xl sm:text-2xl">
                ✍️ Leave a Review
              </h2>
      
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 space-y-4">
                <StarRatingForNewReview
                  rating={selectedRating}
                  onRatingChange={handleStarChange}
                />
      
                <p className="text-white/70 text-sm">
                  Selected Rating: <span className="text-white font-bold">{selectedRating}</span>
                </p>
      
                <textarea
                  className="w-full min-h-[180px] rounded-2xl border border-white/10 bg-black/30 p-4 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your review..."
                  value={form.review}
                  onChange={(e) => handleFormFieldChange("review", e)}
                />
      
                <input
                  className="w-full sm:w-8/12 rounded-2xl border border-white/10 bg-black/30 p-4 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  placeholder="Receipt ID"
                  value={receipt}
                  onChange={(e) => setReceipt(e.target.value)}
                />
      
                <button
                  onClick={() => addReview(selectedRating, form.review)}
                  disabled={buttonDisabled}
                  className={`w-full sm:w-auto rounded-2xl px-6 py-3 font-extrabold shadow-lg transition 
                    ${buttonDisabled 
                      ? "bg-white/10 text-white/40 cursor-not-allowed" 
                      : "bg-gradient-to-r from-blue-500 to-cyan-300 text-black hover:opacity-95 hover:shadow-xl"
                    }`}
                >
                  Add Review
                </button>
              </div>
            </div>
          )}
      
          {/* Register / Unregister */}
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-4 sm:p-6">
            {isRegistered ? (
              <>
                {(storeContractByURL === '0xd9Cc98ed8fD8dF69E4575260B6aa3bA9755e687d' ||
                  storeContractByURL === '0xF034bF0135A6b20ec5b16483a1b83f21da63b3DD') ? null : (
                  <button
                    className="rounded-2xl border border-red-400/40 bg-red-500/10 text-red-200 font-extrabold px-5 py-3 hover:bg-red-500/20 transition"
                    onClick={() => setShowUnregisterModal(true)}
                  >
                    🚫 Unregister
                  </button>
                )}
              </>
            ) : (
              <>
                {address ? (
                  <div>
                    <h2 className="text-white font-extrabold text-xl sm:text-2xl">
                      Register as a client of {storeName}
                    </h2>
                    <p className="text-white/60 mt-2">
                      🔐 All details are encrypted by the website
                    </p>
      
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {storeContractByURL === import.meta.env.VITE_ULTIMATEDEAL_STORE ||
                      storeContractByURL === '0x8Ccf7b92D22B3dc098eeeCFe0E1582Dd152f0c75' ? null : (
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
                        ${isLoading || !nameOfClient || !phoneNumOfClient
                          ? "bg-white/10 text-white/40 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-cyan-300 text-black hover:opacity-95 hover:shadow-xl"
                        }`}
                    >
                      {isLoading ? "Registering..." : "Register"}
                    </button>
                  </div>
                ) : (
                  <p className="text-white/60">
                    Connect your wallet to register.
                  </p>
                )}
              </>
            )}
          </div>
      
          {/* Reward Token Info */}
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-4 sm:p-6 text-center">
            <p className="text-white font-extrabold text-sm sm:text-xl">
              {theSymbol} address is{" "}
              <span className="text-blue-300 break-all">{theERCUltra}</span>
            </p>
      
            { theERCUltra ? (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => navigate("/coin/" + theERCUltra)}
                  className="rounded-2xl bg-white text-blue-700 font-extrabold px-6 py-3 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  🪙 {storeName} Coin
                </button>
              </div>
            ) : null}
          </div>
      
          {/* Products Section */}
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-white font-extrabold text-xl sm:text-2xl">
                🛍️ Products
              </h2>
      
              {allProducts !== null ? (
                <div className="w-full sm:w-[280px]">
                  <span className="block text-white/70 text-sm mb-2">
                    Category
                  </span>
      
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white font-bold flex items-center justify-between hover:bg-black/40 transition"
                    >
                      <span className="truncate">{selectedCategoryName}</span>
                      <svg className="h-5 w-5 text-white/70" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
      
                    {isDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-full max-h-[320px] overflow-auto rounded-2xl border border-white/10 bg-black/70 backdrop-blur-xl shadow-2xl z-50">
                        {categories.map((category, index) => (
                          <button
                            key={index}
                            className="w-full text-left px-4 py-3 text-white/90 hover:bg-white/10 transition"
                            onClick={async () => {
                              await setIsDropdownOpen(false);
                              await setSelectedCategoryName(category);
                              await setSelectedCategory(category);
                              await productsBarcodes(category);
                            }}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
      
            <div className="mt-6 flex gap-4 flex-wrap justify-center">
              {allProducts && allProducts.length > 0 ? (
                allProducts.map((product, index) => (
                  <ProductBox
                    contract={theStoreContract}
                    key={product.barcode ? product.barcode.toString() : index}
                    product={product.barcode}
                    productData={product}
                    onClick={() => handleProductSelect(product.barcode)}
                    type={type}
                    paymentAddress={paymentAddress}
                    storeAddress={storeContractByURL}
                  />
                ))
              ) : (
                <div className="text-white/60 text-center py-10 w-full">
                  No products found in this category.
                </div>
              )}
            </div>
          </div>
        </div>
      
        {/* Unregister Modal */}
        {showUnregisterModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl p-6 relative">
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
                    ${confirmUnregister
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
      </>
      
    );
}

export default StorePage;