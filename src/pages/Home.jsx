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
          {/* Search */}
          <div className="max-w-[1200px] mx-auto px-3 sm:px-6 lg:px-8 pt-6">
            <SearchEngine
              searchEngineAddress={"0x3646F77A96A1eBb0e04eE494053e38599eE66FC4"}
              listingContractAddress={import.meta.env.VITE_STORE_REGISTERY}
            />
          </div>
      
          {/* Featured */}
          <div className="max-w-[1200px] mx-auto px-3 sm:px-6 lg:px-8 pt-6">
            {isMobile ? <FeaturedMobile /> : <Featured />}
          </div>
      
          <div className="min-h-screen">
            {isLoading && <Loader />}
      
            <div className="max-w-[1200px] mx-auto px-3 sm:px-6 lg:px-8 py-8">
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="hidden sm:block text-[44px] sm:text-[64px] lg:text-[80px] font-extrabold text-[#FFDD00] leading-[1.05]">
                  UltraShop Marketplace
                </h1>
                <h1 className="sm:hidden block text-[36px] font-extrabold text-[#FFDD00] leading-[1.05]">
                  Marketplace
                </h1>
                <p className="mt-3 text-white/70 text-sm sm:text-base">
                  Discover stores, explore cities, and shop on-chain.
                </p>
              </div>
      
              {/* CTA */}
              <button
                type="button"
                onClick={() => navigate("/shop/ultrashop/products/LISTESH")}
                className="w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl hover:bg-white/10 transition p-6 sm:p-10"
              >
                <div className="text-center">
                  <h2 className="text-white font-extrabold text-3xl sm:text-5xl lg:text-6xl">
                    Launch Your Online StartUp
                  </h2>
                  <p className="mt-4 text-[#FFDD00] font-bold text-base sm:text-xl">
                    Buy/Sell Products And Earn From Almost Every Transaction
                  </p>
                </div>
              </button>
      
                {/* Cities */}
                <div className="mt-10">
                <h2 className="text-2xl font-extrabold text-[#FFDD00] mb-4 text-center">
                    Explore Cities
                </h2>
        
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                    {getUniqueCities().map((city, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => navigate(`/city/${city}`)}
                        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition p-4 text-center shadow-lg"
                    >
                        <h3 className="text-[#FFDD00] font-extrabold text-base sm:text-lg truncate">
                        {city}
                        </h3>
                        <p className="text-white/70 text-sm mt-1">
                        {Object.values(allStores).filter((store) => store.city === city).length} stores
                        </p>
                    </button>
                    ))}
                </div>
                </div>
        
                {/* Promoted Stores */}
              <div className="mt-12">
                <h2 className="text-2xl font-extrabold text-[#FFDD00] mb-4 text-center">
                  Promoted Stores
                </h2>
      
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {Object.values(promotedStores).map((store, index) => (
                    <div
                      key={index}
                      onClick={() => navigate("/shop/" + store.urlPath)}
                      className="cursor-pointer rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl hover:bg-white/10 transition overflow-hidden"
                    >
                      <div className="p-5">
                        <h3 className="text-[#FFDD00] font-extrabold text-xl text-center truncate">
                          {store.name}
                        </h3>
      
                        {/* Image */}
                        <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                          <img
                            src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${store.picture}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                            className="w-full h-[220px] object-cover"
                            alt={store.name}
                            loading="lazy"
                          />
                        </div>
      
                        {/* Verified */}
                        <div className="mt-4 flex justify-center">
                          {encryptionStatus[store.urlPath] ? (
                            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-200 border border-blue-400/20">
                              <img src={done_desktop} className="w-4 h-4" alt="verified" />
                              Verified
                            </div>
                          ) : null}
                        </div>
      
                        {/* Contact */}
                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                          <div className="font-bold text-white mb-1">Contact Info</div>
                          {address ? (
                            <div className="break-words">
                              {formatTextWithLineBreaks(processDescription(store.contactInfo))}
                            </div>
                          ) : (
                            <div>Available only to connected users.</div>
                          )}
      
                          <div className="mt-3 text-white/60">
                            Creation Date:{" "}
                            <span className="text-white/80">
                              {store?.creationDate ? hexToTimestamp(store.creationDate._hex) : "N/A"}
                            </span>
                          </div>
                        </div>
      
                        {/* Description */}
                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-white/80 text-sm leading-relaxed line-clamp-6 text-center">
                            {formatTextWithLineBreaks(processDescription(store.description))}
                          </p>
                        </div>
      
                        <div className="mt-5 flex justify-center">
                          <CustomButton
                            btnType="button"
                            title="View Store"
                            styles="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-xl text-sm"
                            handleClick={(e) => {
                              e?.stopPropagation?.();
                              navigate("/shop/" + store.urlPath);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
      
              {/* New Stores */}
              <div className="mt-12">
                <h2 className="text-2xl font-extrabold text-[#FFDD00] mb-4 text-center">
                  New Stores
                </h2>
      
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.values(allNewStores)
                    .reverse()
                    .map((store, index) => (
                      <div
                        key={index}
                        onClick={() => navigate("/shop/" + store.urlPath)}
                        className="cursor-pointer rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl hover:bg-white/10 transition"
                      >
                        <div className="p-5">
                          <div className="flex justify-center mb-3">
                            {encryptionStatus[store.urlPath] ? (
                              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-200 border border-blue-400/20">
                                <img src={done_desktop} className="w-4 h-4" alt="verified" />
                                Verified
                              </div>
                            ) : null}
                          </div>
      
                          <h3 className="text-[#FFDD00] font-extrabold text-base text-center truncate">
                            {store.name}
                          </h3>
      
                          <p className="mt-3 text-white/80 text-sm text-center line-clamp-6">
                            {formatTextWithLineBreaks(processDescription(store.description))}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </>
      );
      

}

export default Home;