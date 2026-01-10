import React, { useEffect, useState } from 'react';
import { usdcoinusdclogo, logoOfWebsite } from '../assets';
import Slider from 'react-slick';
import { useStateContext } from '../context';
import { createThirdwebClient } from 'thirdweb';
import { ethers } from 'ethers';
import { IPFSMediaViewer } from '../components';
import { useCart } from '../context/CartContext';

const ProductBox = ({ product, isSelected, onClick, contract, type, paymentAddress, storeAddress }) => {
  const { HexToInteger } = useStateContext();
  const { addToCart } = useCart();
  
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const [quantityToAdd, setQuantityToAdd] = useState(1);

  const client1 = createThirdwebClient({ clientId: import.meta.env.VITE_THIRDWEB_CLIENT });
  
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
  };

  const [imagesOfProduct, setImagesOfProduct] = useState([]);
  const [productData, setProductData] = useState([]);

  useEffect(() => {
    async function fetchProductImages(contract) {
      try {
          const pictures = await contract.call('getProductPics', [product]);
          const data1 = await contract.call('products', [product]);
          setProductData(data1);
          setImagesOfProduct(pictures);
      } catch(e) {
          console.log("Error fetching product data", e);
      }
    }
    if (contract) { fetchProductImages(contract); }
  }, [contract, product]);

  function processDescription(description, maxLength = 27) {
    if (!description) return '';
    const cleanedDescription = description.replace(/[\$^~*]/g, '');
    if (cleanedDescription.length <= maxLength) return cleanedDescription;
    return cleanedDescription.substring(0, maxLength) + '...';
  }

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (!showQuantityInput) {
        setShowQuantityInput(true);
    } else {
        performAddToCart();
    }
  };

  const performAddToCart = () => {
    if (productData) {
        if (quantityToAdd < 1) {
            alert("Quantity must be at least 1");
            return;
        }

        if (!storeAddress) {
            alert("System Error: Could not detect Store Address. Refresh and try again.");
            console.error("Contract prop is invalid:", contract);
            return;
        }

        const cartItem = {
            name: productData.name,
            barcode: product, 
            price: HexToInteger(productData.price._hex),
            discount: HexToInteger(productData.discountPercentage._hex),
            image: imagesOfProduct[0] || '',
            description: productData.productDescription
        };
        
        addToCart(cartItem, type, storeAddress, parseInt(quantityToAdd));
        
        setShowQuantityInput(false);
        setQuantityToAdd(1);
        
        const btn = document.getElementById(`cart-btn-${product}`);
        if(btn) {
            btn.classList.add('bg-green-500');
            setTimeout(() => btn.classList.remove('bg-green-500'), 1000);
        }
    }
  };

  const handleQuantityChange = (e) => {
      e.stopPropagation();
      setQuantityToAdd(e.target.value);
  };

  const handleInputClick = (e) => {
      e.stopPropagation(); 
  };

  return (
    <div className='relative group'>
      <div
        className="product-box w-[380px] h-[420px] flex flex-col p-2 rounded-[15px] border-[1px] border-cyan-300 cursor-pointer hover:shadow-2xl transition-all duration-300 bg-black backdrop-blur-sm overflow-hidden"
        onClick={onClick}
      >
        {/* --- 1. Title Area (Fixed Height) --- */}
        <div className="h-[60px] flex items-center justify-center font-bold text-white text-2xl z-10 drop-shadow-md text-center px-2">
            {processDescription(productData?.name)}
        </div>

        {/* --- 2. Media & Tags Area (Fixed Height Container) --- */}
        <div className="relative w-full h-[320px] mt-2">
            
            {/* Slider */}
            <Slider {...settings} className="h-full w-full">
                {imagesOfProduct.length > 0 ? (
                imagesOfProduct.map((imageHash, index) => (
                    <div key={index} className="h-[320px] flex items-center justify-center outline-none">
                        <IPFSMediaViewer
                            ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${imageHash}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                            className='!object-contain !w-full !h-full max-h-[320px]'
                        />
                    </div>
                ))
                ) : (
                <div className="text-white h-full flex items-center justify-center">No images available</div>
                )}
            </Slider>

            {/* --- Tags Overlay (Inside Media Area) --- */}
            {productData.length > 1 && (
                <div className="absolute inset-0 pointer-events-none z-20">
                    
                    {/* Price Tag - Top Left of Image */}
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg">
                        <>
                            {HexToInteger(productData?.discountPercentage._hex) !== 0 ? (
                            <>
                                <span className="text-[12px] line-through mr-2 text-red-500">
                                {type === 'Rentals' || type === 'Renting' ? 
                                    (HexToInteger(productData?.price._hex) / 1e6 * 30).toFixed(1) :
                                    (HexToInteger(productData?.price._hex) / 1e6).toFixed(1)}
                                </span>
                                <span className="text-[20px] text-yellow-200">
                                {type === 'Rentals' || type === 'Renting' ? 
                                    ((HexToInteger(productData?.price._hex) * (100 - HexToInteger(productData?.discountPercentage._hex))) / (100 * 1e6) * 30).toFixed(1) :
                                    ((HexToInteger(productData?.price._hex) * (100 - HexToInteger(productData?.discountPercentage._hex))) / (100 * 1e6)).toFixed(1)}
                                </span>
                            </>
                            ) : (
                            <span className="text-[20px] text-yellow-200">
                                {type === 'Rentals' || type === 'Renting' ? 
                                (HexToInteger(productData?.price._hex) / 1e6 * 30).toFixed(1) :
                                (HexToInteger(productData?.price._hex) / 1e6).toFixed(1)}
                            </span>
                            )}
                            <img src={usdcoinusdclogo} className="h-[25px] w-[25px] inline-block ml-1 mt-[-9px] mx-auto" alt="USDC" />
                            
                            {type === 'Rentals' && (
                            <div className="flex items-center absolute top-[-10px] right-[-10px]">
                                <span className="bg-green-500 text-yellow-200 text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wider uppercase shadow-sm">
                                Month
                                </span>
                            </div>
                            )}
                        </>
                    </div>

                    {/* Quantity Tag - Top Right of Image */}
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-green-400 to-green-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg drop-shadow-md">
                        <span className="text-[14px] sm:text-xl">{ethers.BigNumber.from(productData?.quantity.toString()).toString()}</span>
                        <span className="text-[10px] ml-1">left</span>
                    </div>

                    {/* Discount Tag - Bottom Left of Image Area */}
                    {HexToInteger(productData.discountPercentage._hex) !== 0 && (
                        <div className="absolute bottom-10 left-2 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg drop-shadow-md">
                            <span className="text-md sm:text-xl">{HexToInteger(productData?.discountPercentage._hex)}%</span>
                            <span className="text-md ml-1">OFF</span>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* --- 3. Add To Cart Button (Pinned to Bottom Right of Card) --- */}
        <div className="absolute bottom-3 right-3 z-50 flex items-center gap-2">
            <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${showQuantityInput ? 'w-[70px] opacity-100' : 'w-0 opacity-0'}`}
            >
                <input 
                    type="number" 
                    min="1"
                    value={quantityToAdd}
                    onChange={handleQuantityChange}
                    onClick={handleInputClick}
                    className="w-full h-[40px] rounded-lg bg-slate-800 text-white border border-[#FFDD00] text-center font-bold focus:outline-none"
                />
            </div>

            <button 
                id={`cart-btn-${product}`}
                onClick={handleAddToCartClick}
                className={`bg-[#FFDD00] hover:bg-orange-400 text-black p-3 rounded-full shadow-lg transform transition-all hover:scale-110 flex items-center justify-center ${showQuantityInput ? 'bg-green-500 hover:bg-green-400' : ''}`}
                title={showQuantityInput ? "Confirm Add" : "Add to Cart"}
            >
                {showQuantityInput ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductBox;