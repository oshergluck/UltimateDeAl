import React, { useState } from 'react';
import { useContract } from '@thirdweb-dev/react';
import { Search, Loader2, Tag, Package2, Store, CalendarClock } from 'lucide-react'; // Added CalendarClock icon
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
    navigate("/shop/"+storeUrl+"/products/"+barcode)
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
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-2 px-4 py-1.5 bg-yellow-300 text-black hover:text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
        {results.map((product, index) => (
          <button
            key={`${product.barcode}-${index}`}
            type="button"
            onClick={() => handleNavigate(product.barcode, product.storeUrl)}
            className="
              group relative w-full text-left overflow-hidden rounded-3xl
              border border-white/10 bg-white/5 backdrop-blur-xl
              shadow-[0_12px_40px_rgba(0,0,0,0.35)]
              transition-all duration-300 ease-out
              hover:-translate-y-1 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_18px_60px_rgba(0,0,0,0.45)]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60
            "
          >
            {/* Media */}
            <div className="relative h-52 overflow-hidden">
              {/* soft gradient overlay */}
              <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-90" />

              {product.productImages && product.productImages.length > 0 ? (
                <IPFSMediaViewer
                  ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${product.productImages[0]}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-black/30">
                  <Package2 className="h-12 w-12 text-white/70" />
                </div>
              )}

              {/* Discount badge */}
              {Number(product.discountPercentage) > 0 && (
                <div className="absolute left-3 top-3 z-[2] inline-flex items-center gap-2 rounded-full border border-white/10 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  {Number(product.discountPercentage)}% OFF
                </div>
              )}

              {/* NEW: Rental Badge */}
              {product.isRental && (
                 <div className="absolute left-3 bottom-3 z-[2] inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-200 backdrop-blur">
                   <CalendarClock className="h-3.5 w-3.5" />
                   Rental
                 </div>
              )}

              {/* Category chip */}
              {product.category && (
                <div className="absolute right-3 top-3 z-[2] inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                  <Tag className="h-3.5 w-3.5 text-cyan-300" />
                  <span className="max-w-[160px] truncate">{product.category}</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-white leading-snug line-clamp-2">
                  {product.name}
                </h3>

                {/* Price box */}
                <div className={`shrink-0 rounded-2xl border px-3 py-2 backdrop-blur ${
                    product.isRental 
                    ? 'border-purple-500/30 bg-purple-900/20' 
                    : 'border-white/10 bg-black/30'
                }`}>
                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-2">
                      {Number(product.discountPercentage) > 0 && (
                        <span className="text-xs font-semibold text-rose-300 line-through">
                          {Number(product.price / 1e6)}
                        </span>
                      )}
                      <span className="text-sm font-bold text-white">
                        {Number((product.price * (100 - product.discountPercentage)) / (100 * 1e6))} USDC
                      </span>
                    </div>
                    {/* Monthly Label if Rental */}
                    {product.isRental && (
                        <span className="text-[10px] uppercase font-medium text-purple-300 mt-0.5">
                            / Month
                        </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Store */}
              <div className="mt-3 flex items-center gap-2 text-sm text-white/80">
                <Store className="h-4 w-4 text-white/70" />
                <span className="truncate">{product.storeName}</span>
              </div>

              {/* Description */}
              <p className="mt-3 text-sm text-white/70 leading-relaxed line-clamp-2">
                {cleanDescription(product.description)}
              </p>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                  <span className={`h-2 w-2 rounded-full ${product.quantity > 0 ? 'bg-cyan-300/80' : 'bg-red-500'}`} />
                  In Stock: {Number(product.quantity)}
                </div>

                <div className="text-xs font-semibold text-white/70 opacity-0 translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  View →
                </div>
              </div>
            </div>
          </button>
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