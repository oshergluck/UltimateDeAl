import React, { useState, useEffect, useCallback } from 'react';
import { useContract, useContractRead } from '@thirdweb-dev/react';
import {SearchProduct,ProductBox,Loader} from '../components';

const SearchProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { contract } = useContract(import.meta.env.VITE_STORE_REGISTRY);

  
  useEffect(async() => {
    if (contract) {
      const fetchProducts = async () => {
        const allBarcodes = await contract.call("getAllProductsBarcodes");
        if (!contract) return;
        
        setIsLoading(true);
        const products = await contract.call("products", barcode)
        setProducts(fetchedProducts);
        setIsLoading(false);
      }
    
      fetchProducts();
    }
  }, [contract]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) || 
    product.barcode.toLowerCase().includes(searchTerm)
  );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Search Products</h1>
      <SearchProduct onSearch={handleSearch} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product, index) => (
          <ProductBox key={index} product={product} />
        ))}
      </div>
      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-600 mt-8">No products found.</p>
      )}
    </div>
  );
};

export default SearchProductsPage;