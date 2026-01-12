import React, {useState,useEffect} from 'react';
import { CustomButton,Loader,Featured,FeaturedMobile,SearchEngine } from '../components';
import { useStateContext } from '../context';
import { useNavigate } from 'react-router-dom';
import { logoOfWebsiteCoin, tetherusdtlogo,VerifiedIcon,done_desktop} from '../assets';
import { useMediaQuery } from 'react-responsive';
const Home = () => {
    const [reward,setReward] = useState(0);
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const { getOfficialStoreDetails,getNewStores,CrowdFunding,getAllStores,checkIfEncrypted,getPromotedStores,storeRegistery,hexToTimestamp,address } = useStateContext();
    const [officialStoreDetails,setOfficialStoreDetails] = useState({});
    const [allNewStores,setAllNewStores] = useState({});
    const [allStores,setAllStores] = useState([]);
    const [allVoting,setAllVoting] = useState({});
    const [promotedStores,setPromotedStores] = useState({});
    const [isLoading,setIsLoading] = useState(false);
    const [encryptionStatus, setEncryptionStatus] = useState({});
    const [cities, setCities] = useState({});
    const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo(0, 0);
        
        const fetchReward = async () => {
            setIsLoading(true);
            const data = await CrowdFunding.call('rewardPool');
            setReward(data*2/1000);
            setIsLoading(false);
        }
    
        async function getDetailsOfStores() {
            setIsLoading(true);
            try {
                const officialStore = await getOfficialStoreDetails();
            const newStores = await getNewStores();
            const allStoresData = await storeRegistery.call('getAllStores');
            console.log(allStoresData);
            const promotedStoresData = await getPromotedStores();
            
            await setOfficialStoreDetails(officialStore);
            await setAllNewStores(newStores);
            await setAllStores(allStoresData[1]);
            await setPromotedStores(promotedStoresData);
    
            // Fetch encryption status for promoted stores
            const encryptionStatusData = {};
            const citiesData = {};
            for (const store of Object.values(await allStoresData[0])) {
                encryptionStatusData[store.urlPath] = await checkIfEncrypted(store.urlPath);
                await setEncryptionStatus(encryptionStatusData);
            }

            for (const store of Object.values(await allStoresData[0])) {
                citiesData[store.urlPath] = await getVotingDetails(store.urlPath);
                await setCities(encryptionStatusData);
            }
    
            setIsLoading(false);
            } catch(error) {
                setIsLoading(false);
            }
            
        }
    
        if(storeRegistery) {
            getDetailsOfStores();
        }
    }, [storeRegistery, reward]);

const getUniqueCities = () => {
    if(allStores) {
        return [...new Set(Object.values(allStores).map(store => store.city))];
    }
}; 

const getVotingDetails = async (urlPath) => {
    const storeVoting = await storeRegistery.call('getStoreVotingSystem',[urlPath]);
}

const enc = async (urlPath) => {
    const data = await checkIfEncrypted(urlPath);
    return data;
}

function processDescription(description, maxLength = 180)
  
  
  {
    if (!description) return '';

    // Remove special formatting characters
    const cleanedDescription = description.replace(/[\$^~*]/g, '');

    // Truncate the description if it exceeds the maxLength
    if (cleanedDescription.length <= maxLength) return cleanedDescription;
    return cleanedDescription.substring(0, maxLength) + '...';
}

    function formatTextWithLineBreaks(text) {
        if (!text) return '';
        return text.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index !== text.split('\n').length - 1 && <br />}
          </React.Fragment>
        ));
      }


    return (
        <>
        <div>
        <SearchEngine searchEngineAddress={'0x3646F77A96A1eBb0e04eE494053e38599eE66FC4'} listingContractAddress={import.meta.env.VITE_STORE_REGISTERY}/>
        </div>
        <div className=''>
        <div className=" mx-auto">
        {isMobile ? <FeaturedMobile /> : <Featured/>}
        </div>
        </div>
        <div className="min-h-screen ">
            {isLoading && <Loader />}
            
            <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="sm:text-[80px] text-[35px] font-bold text-[#FFDD00] text-center my-[20px] sm:block hidden">UltraShop Marketplace</h1>
                    <h1 className="sm:text-[80px] text-[35px] font-bold text-[#FFDD00] text-center sm:hidden block">Marketplace</h1>
                </div>
                <div className=" mx-auto py-6 sm:px-6 lg:px-8">
                    {/* Listing Button */}
                    <div className="opacity-[50%] hover:opacity-[100%] ease-in-out duration-500 sm:w-full w-[95%] mx-auto  shadow-xl rounded-lg mb-8 cursor-pointer border-[1px] border-[#242424]"
                    onClick={() => {navigate('/shop/USP/products/LISTESH')}}
                    >
                        <h1 className='text-white font-epilogue font-semibold sm:text-[80px] text-4xl my-auto text-center py-[40px]'>Launch Your Online StartUp</h1>
                        <h1 className='text-[#FFDD00] font-epilogue font-semibold sm:text-[28px] text-[18px] my-auto text-center mt-[20px] pb-[20px] px-[10px]'>Buy/Sell Products And Earn From Almost Every Transaction</h1>
                    </div>
                    {/* City Box Section */}
                    <div className="mt-12 mb-8">
                        <h2 className="text-2xl font-semibold text-[#FFDD00] mb-4 text-center">Explore Cities</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {getUniqueCities().map((city, index) => (
                                <div 
                                    key={index} 
                                    className=" shadow-sm rounded-lg border-[1px] border-[#242424] cursor-pointer opacity-[75%] hover:opacity-[100%] hover:shadow-lg transition-all duration-300"
                                    onClick={() => navigate(`/city/${city}`)}
                                >
                                    <div className="p-4 text-center">
                                        <h3 className="text-lg font-semibold text-[#FFDD00] mb-2">{city}</h3>
                                        <p className="text-white text-sm">
                                            {Object.values(allStores).filter(store => store.city === city).length} stores
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Promoted Stores Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-[#FFDD00] mb-4 text-center">Promoted Stores</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto">
                            {Object.values(promotedStores).map((store, index) => (
                                <div key={index} className="cursor-pointer  shadow-sm rounded-lg border-[1px] border-[#242424] opacity-[75%] hover:opacity-[100%] ease-in-out duration-500" onClick={() => navigate('/shop/'+store.urlPath)}>
                                    <div className="p-6">
                                        <h3 className="text-2xl font-semibold text-center text-[#FFDD00] mb-2">{store.name}</h3>
                                        <div className='z-10 h-[400px] w-11/12 mx-auto my-4 rounded-xl overflow-hidden flex items-center'>
                                            <img 
                                                src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${store.picture}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`} 
                                                className='h-50 w-full object-cover mx-auto rounded-xl'
                                            />
                                        </div>
                                        <div className="flex items-center justify-between my-[20px]">
                                        {address ? (<div className='text-white min-h-[180px] w-full'>
                                            <div className='my-[15px] w-full gap-8 justify-center flex'>
                                                {encryptionStatus[store.urlPath]? (<>
                                                    <div className='h-[70px]'>
                                                    <img src={done_desktop} className='mx-auto w-[35px] h-[35px]'></img>
                                                    <h2 className='text-[12px] text-center text-white font-bold'>Verified</h2>
                                                </div>
                                                </>):(<></>)}
                                                
                                                </div>
                                            Contact Info:<br/> {formatTextWithLineBreaks(processDescription(store.contactInfo))}
                                            <br/>
                                            Creation Date: {store?.creationDate ? hexToTimestamp(store.creationDate._hex) : 'N/A'}
                                            </div>):(<div className='text-white min-h-[180px]'>
                                                <div className='my-[15px] gap-8 w-full justify-center flex'>
                                                {encryptionStatus[store.urlPath]? (<>
                                                    <div className='h-[70px]'>
                                                    <img src={done_desktop} className='mx-auto w-[35px] h-[35px]'></img>
                                                    <h2 className='text-[12px] text-center text-white font-bold'>Verified</h2>
                                                </div>
                                                </>):(<>
                                                    </>)}
                                                </div>
                                            Contact Info: Available only to connected users.
                                            <br/>
                                            Creation Date: {store?.creationDate ? hexToTimestamp(store.creationDate._hex) : 'N/A'}
                                            </div>)}
                                        </div>
                                        <p className="text-white mb-4 min-h-[220px] text-center">{formatTextWithLineBreaks(processDescription(store.description))}</p>
                                        
                                        <CustomButton 
                                            btnType="button"
                                            title="View Store"
                                            styles="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
                                            handleClick={() => {navigate('/shop/'+store.urlPath)}}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    

                    {/* New Stores Section */}
                    <div>
                        <h2 className="text-2xl font-semibold text-[#FFDD00] mb-4 text-center">New Stores</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.values(allNewStores).reverse().map((store, index) => (
                                <div key={index} className=" shadow-sm rounded-lg border-[1px] border-[#242424] opacity-[80%] hover:opacity-[100%] ease-in-out duration-500 cursor-pointer" onClick={() => navigate('/shop/'+store.urlPath)}>
                                    <div className="p-4">
                                    <div className='my-[15px] w-full gap-10 justify-center flex'>
                                                {encryptionStatus[store.urlPath]? (<>
                                                    <div className='h-[70px]'>
                                                    <img src={done_desktop} className='mx-auto w-[35px] h-[35px]'></img>
                                                    <h2 className='text-[12px] text-center text-white font-bold'>Verified</h2>
                                                </div>
                                                </>):(<>
                                                    </>)}
                                    </div>
                                        <h3 className="text-md font-semibold text-[#FFDD00] mb-2 truncate text-center">{store.name}</h3>
                                        <p className="text-white text-sm text-center">{formatTextWithLineBreaks(processDescription(store.description))}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
        </div>
        </>
    )

}

export default Home;