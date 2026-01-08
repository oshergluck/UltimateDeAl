import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // טעינה ראשונית מ-Local Storage
  const [cart, setCart] = useState(() => {
    try {
      const storedCart = localStorage.getItem('ultraShopCart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      return [];
    }
  });

  // שמירה ל-Local Storage בכל שינוי
  useEffect(() => {
    localStorage.setItem('ultraShopCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, type, storeContract, amount = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.barcode === product.barcode && item.storeContract === storeContract);
      
      if (existingItem) {
        return prevCart.map((item) =>
          item.barcode === product.barcode && item.storeContract === storeContract
            ? { ...item, amount: item.amount + amount }
            : item
        );
      } else {
        return [...prevCart, { ...product, amount, type, storeContract }];
      }
    });
  };

  const removeFromCart = (barcode, storeContract) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.barcode === barcode && item.storeContract === storeContract)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.amount, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);