import { useState, useEffect } from "react";
import {createThirdwebClient,prepareContractCall, getContract } from "thirdweb";
import { useSendTransaction,TransactionButton } from 'thirdweb/react';
import { useStateContext } from "../context";
import {logoOfWebsite} from "../assets";

const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY1;
const NETWORK = "base-mainnet";

// Simple router implementation
function useRouter() {
  const [currentRoute, setCurrentRoute] = useState({ path: '/', params: {} });
  
  const navigate = (path, params = {}) => {
    setCurrentRoute({ path, params });
  };
  
  const goBack = () => {
    setCurrentRoute({ path: '/', params: {} });
  };
  
  return { currentRoute, navigate, goBack };
}

// Enhanced sorting function for NFTs
function sortNFTsByNewest(nfts) {
  return nfts.sort((a, b) => {
    // Helper function to get the most recent timestamp from an NFT
    const getNewestTimestamp = (nft) => {
      const timestamps = [];
      
      // Check timeLastUpdated
      if (nft.timeLastUpdated) {
        timestamps.push(new Date(nft.timeLastUpdated));
      }
      
      // Check acquiredAt timestamp
      if (nft.acquiredAt?.blockTimestamp) {
        timestamps.push(new Date(nft.acquiredAt.blockTimestamp));
      }
      
      // Check contract deployedAt
      if (nft.contract?.deployedAt) {
        timestamps.push(new Date(nft.contract.deployedAt));
      }
      
      // Check raw metadata timestamps
      if (nft.raw?.metadata?.date) {
        timestamps.push(new Date(nft.raw.metadata.date));
      }
      
      // Return the most recent timestamp, or epoch if none found
      return timestamps.length > 0 ? Math.max(...timestamps) : 0;
    };
    
    const timestampA = getNewestTimestamp(a);
    const timestampB = getNewestTimestamp(b);
    
    // Sort by timestamp (newest first)
    if (timestampB !== timestampA) {
      return timestampB - timestampA;
    }
    
    // Fallback 1: Sort by tokenId (higher usually means newer)
    const tokenIdA = parseInt(a.tokenId) || 0;
    const tokenIdB = parseInt(b.tokenId) || 0;
    if (tokenIdB !== tokenIdA) {
      return tokenIdB - tokenIdA;
    }
    
    // Fallback 2: Sort by contract address (for consistency)
    const addressA = a.contract?.address || '';
    const addressB = b.contract?.address || '';
    return addressB.localeCompare(addressA);
  });
}

// Individual NFT Detail Component
function NFTDetail({ nft, onBack }) {
    const client = createThirdwebClient({clientId:import.meta.env.VITE_THIRDWEB_CLIENT});
    const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
    const [toTransfer,setToTransfer] = useState();
    const [showOnlyAttributes, setShowOnlyAttributes] = useState(false);
    const {address} = useStateContext();
    const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`;
    const NFTContract = getContract({
        client:client,
        chain:{
          id:8453,
          rpc:POLYRPC,
        },
        address: nft.contract?.address,
      });

  return (
    <div className="min-h-screen">
      <div className=" mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back to Collection</span>
        </button>

        {/* Toggle Button */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setShowOnlyAttributes(!showOnlyAttributes)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>{showOnlyAttributes ? 'Show Full Details' : 'Show Only Attributes'}</span>
          </button>
        </div>

        <div className=" p-4 rounded-2xl shadow-xl overflow-hidden">
          {showOnlyAttributes ? (
            // Attributes Only View
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {nft.name || "Untitled NFT"}
                </h1>
                <p className="text-lg text-white">
                  {nft.contract?.name || "Unknown Collection"}
                </p>
              </div>
              
              {nft.raw?.metadata?.attributes && nft.raw.metadata.attributes.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-600 mb-4 text-xl text-center">Attributes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nft.raw.metadata.attributes.map((attr, idx) => (
                      <div key={idx} className="bg-white rounded-md p-4 border shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {attr.trait_type}
                        </p>
                        <p className="sm:text-[14px] text-[10px] font-semibold text-gray-600 mt-1">
                          {attr.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No attributes found for this NFT</p>
                </div>
              )}
            </div>
          ) : (
            // Full Details View
            <div className="md:flex">
              {/* Image Section */}
              <div className="md:w-1/2">
                <div className="relative">
                  <img
                    src={nft.image?.cachedUrl || nft.image?.thumbnailUrl || logoOfWebsite}
                    alt={nft.name || "Untitled NFT"}
                    className="w-full h-full object-cover rounded-[15px]"
                    onError={(e) => {
                      if (e.target.src !== nft.image?.thumbnailUrl && nft.image?.thumbnailUrl) {
                        e.target.src = nft.image.thumbnailUrl;
                      } else if (e.target.src !== logoOfWebsite) {
                        e.target.src = logoOfWebsite;
                      }
                    }}
                  />
                </div>
                <div className="mt-[30px]">
                <input type="text" placeholder="Address" value={toTransfer} onChange={e => setToTransfer(e.target.value)} className="sm:col-span-2 p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm mx-[20px] my-[10px]" />
                <TransactionButton
                    className={"!px-3 !sm:px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200 !text-sm !mx-[20px] !my-[10px]"}
                    transaction={async () => {
                      const tx = prepareContractCall({
                        contract: NFTContract,
                        method: "function transferFrom(address from, address to, uint256 tokenId)",
                        params: [address, toTransfer, nft.tokenId],
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
                    Transfer
                  </TransactionButton>
                </div>
              </div>

              {/* Details Section */}
              <div className="md:w-1/2 p-8">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {nft.name || "Untitled NFT"}
                    </h1>
                    <p className="text-lg text-white">
                      {nft.contract?.name || "Unknown Collection"}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-600 mb-2">Contract Address</h3>
                      <p className="text-sm font-mono text-gray-600 break-all">
                        {nft.contract?.address}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Token ID</h3>
                      <p className="text-sm font-mono text-gray-600">
                        {nft.tokenId}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Token Type</h3>
                      <p className="text-sm text-gray-600">
                        {nft.contract?.tokenType || "Unknown"}
                      </p>
                    </div>

                    {nft.description && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                        <p className="sm:text-sm text-[10px] text-gray-600">
                          {nft.description}
                        </p>
                      </div>
                    )}

                  </div>
                </div>
                
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main NFT Collection Component
function NFTCollection({ onNFTClick }) {
  const { address } = useStateContext(); // Get connected wallet address
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });

  const fetchNFTs = async (walletAddress) => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    setNfts([]);
    setLoadingProgress({ current: 0, total: 0 });
    
    try {
      let allNFTs = [];
      let pageKey = null;
      let hasNextPage = true;
      let pageCount = 0;

      // Keep fetching until we get all NFTs
      while (hasNextPage) {
        pageCount++;
        setLoadingProgress({ current: pageCount * 100, total: 'unknown' });

        // Build URL with pagination and sorting
        let url = `https://${NETWORK}.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${walletAddress}&withMetadata=true&orderBy=transferTime&pageSize=100`;
        
        // Add pageKey for subsequent requests
        if (pageKey) {
          url += `&pageKey=${pageKey}`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Add NFTs from this page to our collection
        if (data.ownedNfts && data.ownedNfts.length > 0) {
          allNFTs = [...allNFTs, ...data.ownedNfts];
          console.log(`Fetched page ${pageCount}: ${data.ownedNfts.length} NFTs (Total: ${allNFTs.length})`);
        }
        
        // Check if there are more pages
        if (data.pageKey) {
          pageKey = data.pageKey;
        } else {
          hasNextPage = false;
        }
        
        // Optional: Add a small delay to avoid rate limiting
        if (hasNextPage) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Apply enhanced sorting to show newest NFTs first
      const sortedNFTs = sortNFTsByNewest(allNFTs);

      setNfts(sortedNFTs);
      setLoadingProgress({ current: sortedNFTs.length, total: sortedNFTs.length });
      console.log(`✅ Successfully fetched and sorted ${sortedNFTs.length} total NFTs by newest to oldest`);
      
      // Debug: Log first few NFTs with their timestamps for verification
      if (sortedNFTs.length > 0) {
        console.log('🔍 First 3 NFTs after sorting:');
        sortedNFTs.slice(0, 3).forEach((nft, idx) => {
          console.log(`${idx + 1}. ${nft.name || 'Untitled'} - Token ID: ${nft.tokenId}`, {
            timeLastUpdated: nft.timeLastUpdated,
            acquiredAt: nft.acquiredAt?.blockTimestamp,
            contractDeployedAt: nft.contract?.deployedAt
          });
        });
      }
      
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      setError("Failed to fetch NFTs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch NFTs when address is available
  useEffect(() => {
    if (address) {
      fetchNFTs(address);
    }
  }, [address]);

  // Show connection prompt if no address
  if (!address) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              NFT Viewer
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              View your NFT collection
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
            <p className="text-gray-600 mb-4">
              Please connect your wallet to view your NFT collection
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">
                Once connected, your NFTs will automatically appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            My NFT Collection
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto mb-4">
            Your NFTs on Base Mainnet (Sorted by Newest to Oldest)
          </p>
          <div className="bg-white rounded-lg px-4 py-2 inline-block shadow-sm">
            <p className="text-sm text-gray-600">
              Connected: <span className="font-mono font-medium text-gray-800">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Your NFTs</h3>
              <p className="text-gray-600 mb-4">
                Fetching your complete collection from the blockchain...
              </p>
              {loadingProgress.current > 0 && (
                <div className="bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((loadingProgress.current / Math.max(loadingProgress.current, 100)) * 100, 100)}%` }}
                  ></div>
                </div>
              )}
              <p className="text-sm text-gray-500">
                {loadingProgress.current > 0 ? `Loaded ${loadingProgress.current} NFTs...` : 'Starting fetch...'}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading NFTs</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => fetchNFTs(address)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* NFTs Grid */}
        {nfts.length > 0 && !loading && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Complete Collection ({nfts.length} NFTs)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {nfts.map((nft, idx) => (
                <div
                  key={`${nft.contract?.address}-${nft.tokenId}-${idx}`}
                  onClick={() => onNFTClick(nft)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-gray-100 overflow-hidden group"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={nft.image?.cachedUrl || nft.image?.thumbnailUrl || logoOfWebsite}
                      alt={nft.name || "Untitled NFT"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        if (e.target.src !== nft.image?.thumbnailUrl && nft.image?.thumbnailUrl) {
                          e.target.src = nft.image.thumbnailUrl;
                        } else if (e.target.src !== logoOfWebsite) {
                          e.target.src = logoOfWebsite;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 truncate text-sm mb-1">
                      {nft.name || "Untitled NFT"}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {nft.contract?.name || nft.contract?.address?.slice(0, 10) + "..."}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-gray-400">
                      <span>Token #{nft.tokenId}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {nfts.length === 0 && !loading && !error && address && (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No NFTs Found</h3>
              <p className="text-gray-600">
                You don't have any NFTs on the {NETWORK} network yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main App Component with Router
export default function MyNFTs() {
  const { currentRoute, navigate, goBack } = useRouter();

  const handleNFTClick = (nft) => {
    navigate('/nft-detail', { nft });
  };

  if (currentRoute.path === '/nft-detail') {
    return (
      <NFTDetail 
        nft={currentRoute.params.nft} 
        onBack={goBack}
      />
    );
  }

  return (
    <NFTCollection onNFTClick={handleNFTClick} />
  );
}