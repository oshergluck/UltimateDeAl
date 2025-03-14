import { useState, useEffect, useMemo } from 'react';
import { useContract } from '@thirdweb-dev/react';
import { Search, Loader2 } from 'lucide-react';

const ProductSearch = ({ contractAddress }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  
  const { contract } = useContract(contractAddress);
  
  // Fetch all products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const barcodes = await contract.call('getAllProductsBarcodes');
        
        const productDetails = await Promise.all(
          barcodes.map(async (barcode) => {
            const product = await contract.call('products', [barcode]);
            return {
              name: product.name,
              description: product.productDescription,
              price: product.price,
              barcode: barcode,
              quantity: product.quantity
            };
          })
        );
        
        setProducts(productDetails);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (contract) {
      fetchProducts();
    }
  }, [contract]);

  // Filter products based on search term
  useEffect(() => {
    const searchLower = searchTerm.toLowerCase();
    const filtered = products.filter(
      product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  return (
    <div className="w-full max-w-xl mx-auto relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setTimeout(() => setInputFocused(false), 200)}
          placeholder="Search products..."
          className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        {isLoading && (
          <Loader2 className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 animate-spin" />
        )}
      </div>

      {inputFocused && searchTerm && (
        <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border max-h-96 overflow-y-auto z-50">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div 
                key={product.barcode}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              >
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-600 truncate">
                  {product.description}
                </div>
                <div className="text-sm mt-1">
                  <span className="text-green-600">
                    Price: {product.price.toString()} USDT
                  </span>
                  <span className="ml-3 text-gray-500">
                    Stock: {product.quantity.toString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-gray-500">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;