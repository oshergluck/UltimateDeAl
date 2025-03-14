import React, { useEffect, useState } from 'react';
import { usdcoinusdclogo, ETHLogo, logoOfWebsite } from '../assets';
import Slider from 'react-slick';
import { useStateContext } from '../context';
import { MediaRenderer } from '@thirdweb-dev/react';
import { createThirdwebClient } from 'thirdweb';
import { ethers } from 'ethers';
import { IPFSMediaViewer } from '../components';

const ProductBox = ({ product, isSelected, onClick, contract, type, paymentAddress }) => {
  const { HexToInteger } = useStateContext();
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
      const pictures = await contract.call('getProductPics', [product]);
      const data1 = await contract.call('products', [product]);
      setProductData(data1);
      setImagesOfProduct(pictures);
    }
    if (contract) { fetchProductImages(contract); }
  }, [contract,product]);

  function processDescription(description, maxLength = 27) {
    if (!description) return '';
    const cleanedDescription = description.replace(/[\$^~*]/g, '');
    if (cleanedDescription.length <= maxLength) return cleanedDescription;
    return cleanedDescription.substring(0, maxLength) + '...';
  }

  return (
    <div className='relative'>
      <div
        className="product-box sm:w-[450px] w-[380px] relative sm:p-2 rounded-[15px] border-[1px] border-cyan-300 cursor-pointer sm:min-h-[400px]"
        onClick={onClick}
      >
        <div className="font-bold text-gray-500 sm:text-3xl text-2xl text-center z-10 drop-shadow-md my-[15px] sm:min-h-[45px] min-h-[55px]">{processDescription(productData?.name)}</div>

        <div className="relative">
          <Slider {...settings} className="z-0 relative mb-[-45px] mt-[-20px] sm:mt-[0px] mx-[-20px]">
            {imagesOfProduct.length > 0 ? (
              imagesOfProduct.map((imageHash, index) => (
                <div key={index} className="">
                  <IPFSMediaViewer
                  ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${imageHash}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                  className='!object-contain !w-full !max-h-[275px]'
                  />
                </div>
              ))
            ) : (
              <div className="text-white">No images available</div>
            )}
          </Slider>
        </div>
        {productData.length > 1 && (
          <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-2 z-20 drop-shadow-md">
            {/* Price Tag */}
            <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg relative">
              <>
                {HexToInteger(productData?.discountPercentage._hex) !== 0 ? (
                  <>
                    <span className="text-[12px] line-through mr-2 text-red-500">
                      {type === 'Rentals' || type === 'Renting' ? 
                        (HexToInteger(productData?.price._hex) / 1e6 * 30).toFixed(1) :
                        (HexToInteger(productData?.price._hex) / 1e6).toFixed(1)}
                    </span>
                    <span className="text-[20px] sm:text-[24px] text-yellow-200">
                      {type === 'Rentals' || type === 'Renting' ? 
                        ((HexToInteger(productData?.price._hex) * (100 - HexToInteger(productData?.discountPercentage._hex))) / (100 * 1e6) * 30).toFixed(1) :
                        ((HexToInteger(productData?.price._hex) * (100 - HexToInteger(productData?.discountPercentage._hex))) / (100 * 1e6)).toFixed(1)}
                    </span>
                  </>
                ) : (
                  <span className="text-[20px] sm:text-[24px] text-yellow-200">
                    {type === 'Rentals' || type === 'Renting' ? 
                      (HexToInteger(productData?.price._hex) / 1e6 * 30).toFixed(1) :
                      (HexToInteger(productData?.price._hex) / 1e6).toFixed(1)}
                  </span>
                )}
                <img src={usdcoinusdclogo} className="h-[25px] w-[25px] inline-block ml-1 mt-[-9px] mx-auto" />
                {type === 'Rentals' && (
                  <div className="flex items-center absolute top-[-21px] right-[-20px]">
                    <span className="bg-green-500 text-yellow-200 text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wider uppercase shadow-sm">
                      Per Month
                    </span>
                  </div>
                )}
              </>
            </div>
            {/* Quantity Tag */}
            <div className="bg-gradient-to-r from-green-400 to-green-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg drop-shadow-md">
              <span className="text-[10px] sm:text-xl">{ethers.BigNumber.from(productData?.quantity.toString()).toString()}</span>
              <span className="text-[10px] ml-1">left</span>
            </div>

            {/* Discount Tag */}
            {HexToInteger(productData.discountPercentage._hex) !== 0 && (
              <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg drop-shadow-md">
                <span className="text-md sm:text-xl">{HexToInteger(productData?.discountPercentage._hex)}%</span>
                <span className="text-md ml-1">OFF</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductBox;