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
const [activeTab, setActiveTab] = useState('featured');

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
        {/* Hero Section */}
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 lg:px-8 pt-6">
          <div className="text-center mb-6">
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
      
          {/* Search */}
          <SearchEngine
            searchEngineAddress={"0x3646F77A96A1eBb0e04eE494053e38599eE66FC4"}
            listingContractAddress={import.meta.env.VITE_STORE_REGISTERY}
          />
        </div>
      
        {/* Featured */}
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 lg:px-8 pt-6">
          {isMobile ? <FeaturedMobile /> : <Featured />}
        </div>
      
        {/* Main CTA - Above the fold */}
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 lg:px-8 py-8">
          <button
            type="button"
            onClick={() => navigate("/shop/main/products/LISTESH")}
            className="w-full rounded-3xl border-2 border-[#FFDD00]/30 bg-gradient-to-br from-[#FFDD00]/10 via-transparent to-[#FFDD00]/5 backdrop-blur-xl shadow-2xl hover:border-[#FFDD00]/50 hover:shadow-[0_0_30px_rgba(255,221,0,0.3)] transition-all duration-300 p-8 sm:p-12 group"
          >
            <div className="text-center">
              <h2 className="text-white font-extrabold text-3xl sm:text-5xl lg:text-6xl group-hover:text-[#FFDD00] transition-colors">
                Launch Your Online StartUp
              </h2>
              <p className="mt-4 text-[#FFDD00] font-bold text-base sm:text-xl">
                Buy/Sell Products And Earn From Almost Every Transaction
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-white/80 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Start earning today!
              </div>
            </div>
          </button>
        </div>
      
        {/* Content Sections */}
        <div className="min-h-screen">
          {isLoading && <Loader />}
      
          <div className="max-w-[1200px] mx-auto px-3 sm:px-6 lg:px-8 pb-16">
            
            {/* Social Proof / Stats */}
            <div className="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#FFDD00]">
                  {Object.values(allStores).length}+
                </div>
                <div className="text-white/70 text-sm mt-2">Active Stores</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#FFDD00]">
                  {getUniqueCities().length}+
                </div>
                <div className="text-white/70 text-sm mt-2">Cities Worldwide</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#FFDD00]">100%</div>
                <div className="text-white/70 text-sm mt-2">On-Chain Verified</div>
              </div>
            </div>
      
            {/* Tabs Section */}
            <section>
              {/* Tab Navigation */}
              <div className="flex flex-wrap gap-3 mb-8 justify-center">
                <button
                  onClick={() => setActiveTab('featured')}
                  className={`px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
                    activeTab === 'featured'
                      ? 'bg-[#FFDD00] text-black shadow-lg shadow-[#FFDD00]/30'
                      : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  Featured Stores
                </button>
                <button
                  onClick={() => setActiveTab('cities')}
                  className={`px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
                    activeTab === 'cities'
                      ? 'bg-[#FFDD00] text-black shadow-lg shadow-[#FFDD00]/30'
                      : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  Explore Cities
                </button>
                <button
                  onClick={() => setActiveTab('new')}
                  className={`px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
                    activeTab === 'new'
                      ? 'bg-[#FFDD00] text-black shadow-lg shadow-[#FFDD00]/30'
                      : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  New Arrivals
                </button>
              </div>
      
              {/* Tab Content */}
              <div className="min-h-[400px]">
                {/* Featured Stores Tab */}
                {activeTab === 'featured' && (
                  <div className="animate-fadeIn">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FFDD00] mb-3">
                        Featured Stores
                      </h2>
                      <p className="text-white/60 text-sm sm:text-base">
                        Verified sellers you can trust
                      </p>
                    </div>
      
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {Object.values(promotedStores).map((store, index) => (
                        <div
                          key={index}
                          onClick={() => navigate("/shop/" + store.urlPath)}
                          className="cursor-pointer rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl hover:bg-white/10 hover:border-[#FFDD00]/30 hover:shadow-[0_0_20px_rgba(255,221,0,0.2)] transition-all duration-300 overflow-hidden group"
                        >
                          <div className="p-5">
                            {/* Store Image */}
                            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20 mb-4">
                              <img
                                src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${store.picture}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                                className="w-full h-[200px] object-cover group-hover:scale-105 transition-transform duration-300"
                                alt={store.name}
                                loading="lazy"
                              />
                            </div>
      
                            {/* Store Name */}
                            <h3 className="text-[#FFDD00] font-extrabold text-xl text-center truncate mb-3 group-hover:text-[#FFE933]">
                              {store.name}
                            </h3>
      
                            {/* Verified Badge */}
                            {encryptionStatus[store.urlPath] && (
                              <div className="flex justify-center mb-4">
                                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1.5 text-xs text-blue-200 border border-blue-400/30">
                                  <img src={done_desktop} className="w-4 h-4" alt="verified" />
                                  Verified Store
                                </div>
                              </div>
                            )}
      
                            {/* Description */}
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 mb-4">
                              <p className="text-white/80 text-sm leading-relaxed line-clamp-4 text-center">
                                {formatTextWithLineBreaks(processDescription(store.description))}
                              </p>
                            </div>
      
                            {/* Contact Info */}
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/70 mb-4">
                              {address ? (
                                <div className="break-words">
                                  {formatTextWithLineBreaks(processDescription(store.contactInfo))}
                                </div>
                              ) : (
                                <div className="text-center italic">Connect wallet to view contact</div>
                              )}
                            </div>
      
                            {/* Creation Date */}
                            <div className="text-center text-xs text-white/50 mb-4">
                              Joined {store?.creationDate ? hexToTimestamp(store.creationDate._hex) : "N/A"}
                            </div>
      
                            {/* CTA Button */}
                            <CustomButton
                              btnType="button"
                              title="Visit Store"
                              styles="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-5 rounded-xl text-sm shadow-lg hover:shadow-xl transition-all"
                              handleClick={(e) => {
                                e?.stopPropagation?.();
                                navigate("/shop/" + store.urlPath);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
      
                {/* Cities Tab */}
                {activeTab === 'cities' && (
                  <div className="animate-fadeIn">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FFDD00] mb-3">
                        Explore Cities
                      </h2>
                      <p className="text-white/60 text-sm sm:text-base">
                        Shop locally on the blockchain
                      </p>
                    </div>
      
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {getUniqueCities().map((city, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => navigate(`/city/${city}`)}
                          className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-[#FFDD00]/10 hover:border-[#FFDD00]/30 transition-all duration-300 p-5 text-center shadow-lg"
                        >
                          <h3 className="text-[#FFDD00] font-extrabold text-base sm:text-lg truncate group-hover:scale-105 transition-transform">
                            {city}
                          </h3>
                          <p className="text-white/70 text-sm mt-2">
                            {Object.values(allStores).filter((store) => store.city === city).length} stores
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
      
                {/* New Stores Tab */}
                {activeTab === 'new' && (
                  <div className="animate-fadeIn">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FFDD00] mb-3">
                        New Arrivals
                      </h2>
                      <p className="text-white/60 text-sm sm:text-base">
                        Fresh stores joining the marketplace
                      </p>
                    </div>
      
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {Object.values(allNewStores)
                        .reverse()
                        .map((store, index) => (
                          <div
                            key={index}
                            onClick={() => navigate("/shop/" + store.urlPath)}
                            className="cursor-pointer rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl hover:bg-white/10 hover:border-[#FFDD00]/30 transition-all duration-300 group"
                          >
                            <div className="p-5">
                              {/* Badge */}
                              <div className="flex justify-center gap-2 mb-3">
                                <div className="inline-flex items-center gap-1 rounded-full bg-[#FFDD00]/20 px-3 py-1 text-xs text-[#FFDD00] border border-[#FFDD00]/30 font-bold">
                                  ⭐ NEW
                                </div>
                                {encryptionStatus[store.urlPath] && (
                                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-200 border border-blue-400/30">
                                    <img src={done_desktop} className="w-4 h-4" alt="verified" />
                                    Verified
                                  </div>
                                )}
                              </div>
      
                              <h3 className="text-[#FFDD00] font-extrabold text-lg text-center truncate mb-3 group-hover:text-[#FFE933]">
                                {store.name}
                              </h3>
      
                              <p className="text-white/80 text-sm text-center line-clamp-5 leading-relaxed">
                                {formatTextWithLineBreaks(processDescription(store.description))}
                              </p>
      
                              <div className="mt-4 text-center">
                                <span className="text-xs text-white/50">
                                  Click to explore →
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
      
            {/* Secondary CTA */}
            <div className="mt-16 text-center">
              <div className="inline-block rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-10">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                  Ready to Start Selling?
                </h3>
                <p className="text-white/70 mb-6 text-sm sm:text-base">
                  Join thousands of entrepreneurs on UltraShop
                </p>
                <CustomButton
                  btnType="button"
                  title="Create Your Store Now"
                  styles="bg-[#FFDD00] hover:bg-[#FFE933] text-black font-bold py-3 px-8 rounded-xl text-base shadow-lg hover:shadow-xl transition-all"
                  handleClick={() => navigate("/shop/main/products/LISTESH")}
                />
              </div>
            </div>
          </div>
        </div>
      </>
      );
      

}

export default Home;