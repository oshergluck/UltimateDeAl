import React, { useEffect, useState, useMemo } from 'react';
import { usdcoinusdclogo } from '../assets';
import Slider from 'react-slick';
import { useStateContext } from '../context';
import { ethers } from 'ethers';
import { IPFSMediaViewer } from '../components';
import { useCart } from '../context/CartContext';

const ProductBox = ({ product, onClick, contract, type, paymentAddress, storeAddress, productData }) => {
  const { HexToInteger } = useStateContext();
  const { addToCart } = useCart();
  
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [imagesOfProduct, setImagesOfProduct] = useState([]);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  // --- מחשבים את המחירים וההנחות כאן למעלה כדי לשמור על ה-JSX נקי ---
  const rawPrice = productData ? HexToInteger(productData.price._hex) : 0;
  const discount = productData && productData.discountPercentage ? HexToInteger(productData.discountPercentage._hex) : 0;
  
  // בדיקה אם זה השכרה או קנייה
  const multiplier = type === "Rentals" ? 30 : 1;

  // מחיר מקורי (לפני הנחה)
  const originalPrice = (rawPrice * multiplier) / 1e6;

  // מחיר סופי (אחרי הנחה)
  // אם יש הנחה: מחיר מקורי * (100 פחות אחוז ההנחה) חלקי 100
  // אם אין הנחה: נשאר המחיר המקורי
  const finalPrice = discount > 0 
    ? (rawPrice * multiplier * (100 - discount) / 100) / 1e6
    : originalPrice;
  // ------------------------------------------------------------------

  const settings = useMemo(() => ({
    dots: false,
    infinite: true, 
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    arrows: false,
    lazyLoad: 'ondemand',
    swipe: true,
  }), []);

  useEffect(() => {
    let isMounted = true;
    if (!contract || !product || imagesOfProduct.length > 0) return;

    async function fetchProductImages() {
      try {
          const pictures = await contract.call('getProductPics', [product]);
          if (isMounted && pictures && pictures.length > 0) {
              setImagesOfProduct(pictures);
          }
      } catch(e) {
          console.log("Error fetching images for product", product, e);
      }
    }
    fetchProductImages();
    return () => { isMounted = false; };
  }, [contract, product]);

  function processDescription(description, maxLength = 27) {
    if (!description) return '';
    return description.length <= maxLength ? description : description.substring(0, maxLength) + '...';
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
    if (!productData) return;
    if (quantityToAdd < 1) {
        alert("Quantity must be at least 1");
        return;
    }
    
    const cartItem = {
        name: productData.name,
        barcode: product, 
        price: HexToInteger(productData.price._hex),
        discount: productData.discountPercentage ? HexToInteger(productData.discountPercentage._hex) : 0,
        image: imagesOfProduct[0] || '',
        description: productData.productDescription 
    };
    
    addToCart(cartItem, type, storeAddress, parseInt(quantityToAdd));
    
    setShowQuantityInput(false);
    setQuantityToAdd(1);
    setIsAddedSuccess(true);
    setTimeout(() => setIsAddedSuccess(false), 1000);
  };

  const handleQuantityChange = (e) => {
      e.stopPropagation();
      setQuantityToAdd(e.target.value);
  };

  const handleInputClick = (e) => e.stopPropagation();
  
  if (!productData) {
      return <div className="w-[380px] h-[350px] bg-gray-800 rounded-[15px] animate-pulse"></div>;
  }

  const renderSingleImage = (imageHash) => (
      <div className="h-[320px] flex items-center justify-center outline-none w-full bg-black/40">
          <IPFSMediaViewer
              ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${imageHash}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
              className='!object-cover !w-full !h-full opacity-80 hover:opacity-100 transition-opacity duration-300'
          />
      </div>
  );

  return (
    <div className='relative group'> 
      <div
        className="relative w-[380px] h-[320px] rounded-[15px] border-[1px] border-cyan-300 cursor-pointer bg-black/90 overflow-hidden shadow-xl"
        onClick={onClick}
      >
        
        {/* --- Media Area (Background) --- */}
        <div className="absolute inset-0 z-0">
            {imagesOfProduct.length > 1 ? (
                <Slider {...settings} className="h-full w-full">
                    {imagesOfProduct.map((hash, i) => (
                        <div key={i}>{renderSingleImage(hash)}</div>
                    ))}
                </Slider>
            ) : imagesOfProduct.length === 1 ? (
                renderSingleImage(imagesOfProduct[0])
            ) : (
                <div className="text-white h-full flex items-center justify-center">No images</div>
            )}
        </div>

        {/* --- OVERLAY COLUMN (Elements Stack) --- */}
        {/* CHANGED: items-start (Align Left) */}
        <div className="absolute inset-0 z-20 p-5 flex flex-col items-start gap-3 pointer-events-none">
            
            {/* 1. Title */}
            <div className="bg-gradient-to-r from-cyan-400 to-cyan-600 text-white text-2xl font-bold py-1 px-4 rounded-lg shadow-md text-left max-w-[95%] truncate">
                {processDescription(productData.name)}
            </div>

            {/* 2. Price Section (Updated) */}
            <div className="bg-gradient-to-r from-gray-800 to-black border border-cyan-500/30 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center gap-2">
                  <div className="flex flex-col items-end leading-none">
                    {/* אם יש הנחה - הצג מחיר מקורי מחוק */}
                    {discount > 0 && (
                        <span className="text-xs text-rose-400 line-through decoration-rose-500 opacity-90 mb-0.5">
                            {originalPrice.toFixed(2)}
                        </span>
                    )}
                    
                    {/* מחיר סופי (רגיל או אחרי הנחה) */}
                    <span className="text-3xl text-yellow-300 tracking-wide">
                        {finalPrice.toFixed(2)}
                    </span>
                  </div>
                  <img src={usdcoinusdclogo} className="h-[28px] w-[28px]" alt="USDC" />
            </div>

            {/* 3. Quantity (Stock) */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-1 px-3 rounded-lg shadow-md text-sm">
                <span className="text-lg">{ethers.BigNumber.from(productData.quantity.toString()).toString()}</span>
                <span className="text-xs ml-1 opacity-90">left</span>
            </div>

            {/* 4. Discount Tag */}
            {discount !== 0 && (
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-1 px-3 rounded-lg shadow-lg animate-pulse">
                    <span className="text-lg">{discount}%</span>
                    <span className="text-sm ml-1">OFF</span>
                </div>
            )}

            {/* Spacer & Cart Button Area */}
            {/* Flex container aligned to left (default), items in LTR order: [Button] [Input] or [Input] [Button] */}
            <div className="mt-auto pointer-events-auto flex items-center gap-2">
                
                
            </div>

        </div>
      </div>
    </div>
  );
};

export default ProductBox;