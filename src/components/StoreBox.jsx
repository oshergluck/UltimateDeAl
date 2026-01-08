import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from '../components';
import {VerifiedIcon,done_desktop} from '../assets';
const StoreBox = ({ store,enc }) => {
    const navigate = useNavigate();
    function processDescription(description, maxLength = 100)
  
  
    {
      if (!description) return '';
  
      // Remove special formatting characters
      const cleanedDescription = description.replace(/[\$^~*]/g, '');
  
      // Truncate the description if it exceeds the maxLength
      if (cleanedDescription.length <= maxLength) return cleanedDescription;
      return cleanedDescription.substring(0, maxLength) + '...';
  }
    return (
        <div onClick={() => {navigate('/shop/'+store.urlPath)}} className="cursor-pointer  drop-shadow-md rounded-lg border-[1px] border-[#242424] opacity-[75%] hover:opacity-[100%] ease-in-out duration-500">
            <div className="p-4">
                <h3 className="text-xl font-semibold text-[#FFDD00] mb-2 truncate text-center">{store.name}</h3>
                <div className='z-[1] w-11/12 m-auto my-[15px]'>
                                <img src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${store.picture}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`} className='!h-[250px] object-contain m-[auto] rounded-[5px]' />
                            </div>
                <p className="text-white text-center text-sm min-h-[80px]">{processDescription(store.description)}</p>
                <div className='my-[15px] w-full gap-10 justify-center flex'>
                            <div className='h-[50px]'>
                                <img src={done_desktop} className='mx-auto w-[35px] h-[35px]'></img>
                                <h2 className='text-[12px] text-white font-bold text-center'>Encrypted</h2>
                            </div>
                            <div className='h-[50px]'>
                                <img src={done_desktop} className='mx-auto w-[35px] h-[35px]'></img>
                                <h2 className='text-[12px] text-white font-bold text-center'>Emails</h2>
                            </div>
                            {enc ? (<>
                                <div className='h-[50px]'>
                                <img src={done_desktop} className='mx-auto w-[35px] h-[35px]'></img>
                                <h2 className='text-[12px] text-white font-bold text-center'>Verified</h2>
                            </div>
                            </>):(<>
                                
                            </>)}
                </div>
            </div>
        </div>
    );
};

export default StoreBox;