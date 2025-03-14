import React, { useState } from 'react';
import { useContract, MediaRenderer } from '@thirdweb-dev/react';
import { Search, Loader2, Tag, Package2, Store, DollarSign } from 'lucide-react';
import { createThirdwebClient } from 'thirdweb';
import { useNavigate } from 'react-router-dom';
import { IPFSMediaViewer } from '../components';

const SearchEngine = ({ searchEngineAddress, listingContractAddress }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = async(barcode, storeUrl) => {
    setSearchTerm('');
    setResults([]);
    setHasSearched(false);
    navigate("shop/"+storeUrl+"/products/"+barcode)
  }

  const cleanDescription = (text) => {
    return text.replace(/[~$^*]/g, '').trim();
  };

  const { contract: searchContract } = useContract(searchEngineAddress);
  const client = createThirdwebClient({clientId: import.meta.env.VITE_THIRDWEB_CLIENT});

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const searchResults = await searchContract.call(
        "searchProducts",
        [listingContractAddress, searchTerm]
      );
      setResults(searchResults);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Input */}
      <div className="relative max-w-xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search products..."
            className="w-full px-4 py-3 pl-12 pr-16 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-white" />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-2 px-4 py-1.5 bg-yellow-300 text-black hover:text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Search
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-white">Searching products...</span>
        </div>
      )}

      {/* Error Message */}
      {results && error && (
        <div className="text-red-600 text-center mb-4">
          {error}
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((product, index) => (
          <div 
            key={`${product.barcode}-${index}`}
            className="!ease-in-out !duration-500 opacity-[80%] hover:opacity-[100%] border-[1px] border-gray-500 cursor-pointer rounded-lg linear-gradient shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            onClick={()=> handleNavigate(product.barcode,product.storeUrl)}
          >
            {/* Product Images Carousel */}
            <div className="relative h-48">
              {product.productImages && product.productImages.length > 0 ? (
                <IPFSMediaViewer
                  ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${product.productImages[0]}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                  className='h-[220px]'
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package2 className="h-12 w-12 text-white" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white my-4">
                {product.name}
              </h3>
              
              <div className="flex items-center mb-2">
                <Store className="h-4 w-4 text-gray-200 mr-1" />
                <span className="text-sm text-white">
                  {product.storeName}
                </span>
              </div>

              <p className="text-sm text-white mb-3 line-clamp-2">
                {cleanDescription(product.description)}
              </p>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>
                <div className="flex items-center bg-green-600 rounded-[5px] p-2">
                  <span className="mx-[10px] line-through font-semibold text-red-600">
                    {Number(product.price/1e6)}
                  </span>
                  <span className="font-semibold text-white">
                    {Number(product.price*(100-product.discountPercentage)/(100*1e6))} USDT
                  </span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex justify-between text-sm">
                <span className="text-white">
                  In Stock: {Number(product.quantity)}
                </span>
                {Number(product.discountPercentage) > 0 && (
                  <div className='flex items-center bg-green-600 rounded-[5px] p-2'>
                    <span className="text-white font-bold">
                      {Number(product.discountPercentage)}% OFF
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {!loading && results.length === 0 && hasSearched && (
        <div className="text-center text-white py-8">
          No products found matching your search.
        </div>
      )}
    </div>
  );
};

export default SearchEngine;