import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';

const ProductSearch = ({ StoreURL, storeRegistery, theStoreContract, address, ShareContract }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enc, setEnc] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeBanner, setStoreBanner] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [dataOfVoting, setDataOfVoting] = useState(null);
  const [theERCUltra, setTheERCUltra] = useState('');
  const [theSymbol, setTheSymbol] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchStoreAndProducts = async () => {
    try {
      setIsLoading(true);
      const data = await storeRegistery.call('getStoreByURLPath', [StoreURL]);
      const isEnc = await storeRegistery.call('getStoreVotingSystem', [StoreURL]);
      setEnc(isEnc[5]);
      const votingdata = await getVotingDetails(StoreURL);
      await setStoreContractByURL(data.smartContractAddress);
      await setStoreName(data.name);
      await setStoreBanner(data.picture);

      if (address && theStoreContract) {
        const data1 = await theStoreContract.call('isClient', [address]);
        await setIsRegistered(data1);
      }
      if (votingdata) {
        await setDataOfVoting(votingdata);
        await setTheERCUltra(votingdata[1]);
      }
      await setDataOfStore(data);
      setOwner(owner);
      if (ShareContract) {
        const symbol = await ShareContract.call('symbol');
        setTheSymbol(symbol);
      }

      if (theStoreContract) {
        await productsBarcodes(selectedCategory);
      }
      await fetchReviews();
      if (address && storeRegistery && theStoreContract) {
        await canUserLeaveReview();
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching store details or products:", error);
    }
  };

  useEffect(() => {
    fetchStoreAndProducts();
  }, [StoreURL, address, theStoreContract]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(value.toLowerCase()) ||
      product.description.toLowerCase().includes(value.toLowerCase()) ||
      product.barcode.includes(value)
    );
    setFilteredProducts(filtered);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      <div className="mb-8">
        <div className="relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full p-4 pl-12 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <Search className="absolute left-4 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.barcode} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Barcode: {product.barcode}</p>
                  <p className="text-gray-700">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-blue-600">${product.price}</p>
                    {product.quantity > 0 ? (
                      <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">
                        In Stock: {product.quantity}
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;