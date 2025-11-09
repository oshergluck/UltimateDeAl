import React, { useState, createContext, useContext } from 'react';
import { ShoppingCart, X, Trash2, Plus, Minus } from 'lucide-react';
import { prepareContractCall } from 'thirdweb';

// Helper function to convert hex to integer
const HexToInteger = (hexValue) => {
  return parseInt(hexValue, 16);
};

// Helper function to encrypt (placeholder - implement your actual encrypt logic)
const encryptHelper = async (data, address, storeContract) => {
  // Implement your encryption logic here
  return data;
};

// Helper function to decode URL string (placeholder - implement your actual decode logic)
const decodeUrlStringHelper = (url) => {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
};

// Create Cart Context
const CartContext = createContext();

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.productUrl === product.productUrl && item.storeUrl === product.storeUrl
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.productUrl === product.productUrl && item.storeUrl === product.storeUrl
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }

      return [...prevItems, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const removeFromCart = (productUrl, storeUrl) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.productUrl === productUrl && item.storeUrl === storeUrl)
      )
    );
  };

  const updateQuantity = (productUrl, storeUrl, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productUrl, storeUrl);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.productUrl === productUrl && item.storeUrl === storeUrl
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Add to Cart Button Component
export const AddToCartButton = ({ product, productUrl, storeUrl, storeContract }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart({
      ...product,
      productUrl,
      storeUrl,
      storeContract,
      quantity,
    });
    setQuantity(1);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center border border-gray-300 rounded-lg">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-3 py-1 hover:bg-gray-100 transition-colors"
        >
          <Minus size={16} />
        </button>
        <span className="px-3 py-1 border-l border-r border-gray-300">{quantity}</span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="px-3 py-1 hover:bg-gray-100 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
      <button
        onClick={handleAddToCart}
        className="flex-1 bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out"
      >
        Add to Cart
      </button>
    </div>
  );
};

// Cart Dropdown Component
const CartDropdown = ({ 
  items, 
  onClose, 
  isMobile = false, 
  PaymentContract, 
  storeRegistry, 
  rewardCalc, 
  encrypt: encryptFunc,
  decodeUrlString: decodeFunc 
}) => {
  const { removeFromCart, updateQuantity, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const groupedByStore = items.reduce((acc, item) => {
    const key = item.storeUrl;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const transactions = [];
      const today = new Date();
      const sellDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

      // Group items by store for batch transactions
      const transactionsByStore = Object.entries(groupedByStore).map(([storeUrl, storeItems]) => ({
        storeUrl,
        storeContract: storeItems[0].storeContract,
        items: storeItems,
      }));

      // First, prepare all approval transactions
      for (const store of transactionsByStore) {
        for (const item of store.items) {
          const finalPrice = Math.round(
            Math.round(HexToInteger(item.price._hex)) *
              (100 - HexToInteger(item.discountPercentage._hex)) /
              100
          ) * item.quantity + 1e3;

          // Create approval transaction
          const approveTx = prepareContractCall({
            contract: PaymentContract,
            method: "function approve(address spender, uint256 value) returns (bool)",
            params: [store.storeContract, finalPrice],
            value: 0,
          });
          transactions.push({
            type: 'approve',
            tx: approveTx,
            storeUrl: store.storeUrl,
            item: item,
          });
        }
      }

      // Then prepare purchase transactions
      for (const store of transactionsByStore) {
        for (const item of store.items) {
          const priceForNFT = Math.round(
            (HexToInteger(item.price._hex) * (100 - HexToInteger(item.discountPercentage._hex))) / (100 * 1e6)
          );

          const rewardForUser = await rewardCalc(item.type);

          const expirationPeriod = item.quantity * 24 * 60 * 60 * 1000;
          const expirationDateObj = new Date(Date.now() + expirationPeriod);
          const expirationDate = `${expirationDateObj.getDate().toString().padStart(2, '0')}/${(expirationDateObj.getMonth() + 1).toString().padStart(2, '0')}/${expirationDateObj.getFullYear()}`;

          // Prepare metadata/IPFS data
          let metadataObj = {
            name: 'Invoice',
            description: `Services entrance from ${item.storeName}\nLink to the store: https://UltraShop.tech/shop/${store.storeUrl}`,
            external_url: `https://UltraShop.tech/shop/${store.storeUrl}`,
            image: item.image || '',
            attributes: [
              { trait_type: "Invoice Id", value: item.invoiceCounter },
              { trait_type: "Product Name", value: item.name },
            ],
          };

          if (item.type === 'Rentals' || item.type === 'Renting') {
            metadataObj.attributes.push(
              { trait_type: "Rental Period", value: `${item.quantity} Days` },
              { trait_type: "Sell Date", value: sellDate },
              { trait_type: "Amount Paid", value: `${(priceForNFT * item.quantity).toFixed(2)} $USDC` },
              { trait_type: "Price Per Day", value: `${priceForNFT.toFixed(2)} $USDC` },
              { trait_type: "Reward Address", value: item.rewardAddress },
              { trait_type: "Reward Amount", value: `${rewardForUser.toFixed(2)} ${item.rewardSymbol}` },
              { trait_type: "Reward Symbol", value: item.rewardSymbol },
              { trait_type: `${item.name} Expiration Date`, value: expirationDate }
            );
          } else if (item.type === 'Sales') {
            metadataObj.attributes.push(
              { trait_type: "Amount", value: item.quantity },
              { trait_type: "Sell Date", value: sellDate },
              { trait_type: "Amount Paid", value: `${(priceForNFT * item.quantity).toFixed(2)} $USDC` },
              { trait_type: "Price", value: `${priceForNFT.toFixed(2)} $USDC` },
              { trait_type: "Reward Address", value: item.rewardAddress },
              { trait_type: "Reward Symbol", value: item.rewardSymbol },
              { trait_type: "Reward Amount", value: `${rewardForUser.toFixed(2)} ${item.rewardSymbol}` }
            );
          }

          // Encrypt additional info
          const encryptedInfo = await encryptFunc(item.moreInfo || '', item.address, store.storeContract);
          const productUrlDecoded = decodeFunc(item.productUrl);

          // Create purchase transaction
          const purchaseTx = prepareContractCall({
            contract: store.storeContract,
            method: "function purchaseProduct(string _productBarcode, uint256 _amount, string _info, string metadata)",
            params: [productUrlDecoded, item.quantity, encryptedInfo, JSON.stringify(metadataObj)],
          });

          transactions.push({
            type: 'purchase',
            tx: purchaseTx,
            storeUrl: store.storeUrl,
            item: item,
          });
        }
      }

      console.log('Prepared transactions:', transactions);

      // Return transactions for the UI component to execute
      // The calling component should handle execution with TransactionButton
      return transactions;

    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={`p-4 text-center ${isMobile ? 'py-8' : ''}`}>
        <ShoppingCart className="mx-auto mb-2 text-gray-400" size={32} />
        <p className="text-gray-600">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-lg">Shopping Cart</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedByStore).map(([storeUrl, storeItems]) => (
          <div key={storeUrl} className="border border-gray-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-gray-700 mb-2">Store: {storeUrl}</p>
            <div className="space-y-2">
              {storeItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-600">x{item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productUrl, item.storeUrl, item.quantity - 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus size={14} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.productUrl, item.storeUrl)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 p-4 space-y-2">
        <button
          onClick={handleCheckout}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out"
        >
          {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
        </button>
        <button
          onClick={clearCart}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
};

// Desktop Cart Button Component
export const CartButtonDesktop = ({ 
  PaymentContract, 
  storeRegistry, 
  rewardCalc, 
  encrypt: encryptFunc,
  decodeUrlString: decodeFunc 
}) => {
  const { cartItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white transition-all duration-300 ease-in-out"
      >
        <ShoppingCart size={24} />
        {cartItems.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {cartItems.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
          <CartDropdown 
            items={cartItems} 
            onClose={() => setIsOpen(false)}
            PaymentContract={PaymentContract}
            storeRegistry={storeRegistry}
            rewardCalc={rewardCalc}
            encrypt={encryptFunc || encryptHelper}
            decodeUrlString={decodeFunc || decodeUrlStringHelper}
          />
        </div>
      )}
    </div>
  );
};

// Mobile Cart Button Component
export const CartButtonMobile = ({ 
  PaymentContract, 
  storeRegistry, 
  rewardCalc, 
  encrypt: encryptFunc,
  decodeUrlString: decodeFunc 
}) => {
  const { cartItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white transition-all duration-300 ease-in-out"
      >
        <ShoppingCart size={20} />
        {cartItems.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {cartItems.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-96 overflow-y-auto">
            <CartDropdown 
              items={cartItems} 
              onClose={() => setIsOpen(false)} 
              isMobile
              PaymentContract={PaymentContract}
              storeRegistry={storeRegistry}
              rewardCalc={rewardCalc}
              encrypt={encryptFunc || encryptHelper}
              decodeUrlString={decodeFunc || decodeUrlStringHelper}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Example Usage Component
export default function ShoppingCartExample() {
  return (
    <CartProvider>
      <div className="p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart System</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Desktop Header */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Desktop Header</h2>
            <CartButtonDesktop />
          </div>

          {/* Mobile Header */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Mobile Header</h2>
            <CartButtonMobile />
          </div>

          {/* Add to Cart Example */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Add to Cart Button</h2>
            <AddToCartButton
              product={{
                name: 'Sample Product',
                price: 99.99,
              }}
              productUrl="product-123"
              storeUrl="store-url"
              storeContract="0x123..."
            />
          </div>
        </div>
      </div>
    </CartProvider>
  );
}