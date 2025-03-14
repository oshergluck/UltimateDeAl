
  import React, { useState, useEffect } from 'react';
import { useContract, useContractRead } from '@thirdweb-dev/react';

const ProductSearch = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Replace with your actual contract address
  const contractAddress = "0x635eFbB551E0D715C6820c414ea62718B05D1064";
  
  const { contract } = useContract(contractAddress);

  const fetchProductsSequentially = async (allBarcodes) => {
    const products = [];
    for (const barcode of allBarcodes) {
      try {
        const product = await contract.call("products", [barcode]);
        products.push(product);
      } catch (error) {
        console.error(`Error fetching product for barcode ${barcode}:`, error);
      }
    }
    return products;
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allBarcodes = await contract.call("getAllProductsBarcodes");
      const allProducts = await fetchProductsSequentially(allBarcodes);
      setProducts(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div>
      <h1>Product Search</h1>
      <button onClick={handleSearch} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Refresh Products'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {products.length > 0 ? (
        <ul>
          {products.map((product, index) => (
            <li key={index}>
              Barcode: {product.barcode}, Name: {product.name}, Price: {product.price.toString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No products found.</p>
      )}
    </div>
  );
};

export default ProductSearch;