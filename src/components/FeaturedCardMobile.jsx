import React, { useState, useEffect } from 'react';
import { loader, VerifiedIcon, cashedout,done_mobile, done_desktop } from '../assets';
import Loader from './Loader';
import { useNavigate } from 'react-router-dom';
import { calculateBarPercentage, daysLeft } from '../utils';

const FeaturedCardMobile = ({ campaign,style }) => {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    function extractNumberFromString(str) {
        const matches = str.match(/(\d+(\.\d+)?)/);
        return matches ? parseFloat(matches[0]) : 0;
      }

      function processtitle(description, maxLength = 50) {
        if (!description) return '';
      
        // Remove special formatting characters
        const cleanedDescription = description.replace(/[\$^~*]/g, '');
      
        // Truncate the description if it exceeds the maxLength
        if (cleanedDescription.length <= maxLength) return cleanedDescription;
        return cleanedDescription.substring(0, maxLength) + '...';
      }
      

    function processDescription(description, maxLength = 155)
  
  
  {
    if (!description) return '';

    // Remove special formatting characters
    const cleanedDescription = description.replace(/[\$^~*]/g, '');

    // Truncate the description if it exceeds the maxLength
    if (cleanedDescription.length <= maxLength) return cleanedDescription;
    return cleanedDescription.substring(0, maxLength) + '...';
}

    const handleNavigateToCampaign = (campaign) => {
        navigate(`/campaign-details/${campaign?.pId}`);
    }


    useEffect(() => {
        if (campaign?.videoLinkFromPinata) {
            setIsLoading(false);
        }
    }, [campaign]);

    return (
        
        <>  <div className={`${style} pb-[45px]`}>
            <div className=''>
            {isLoading && <Loader />}
                <div className='w-full'>
                    <video className='z-[2] relative' controls preload="metadata">
                        <source src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign?.videoLinkFromPinata}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}#t=0.001`} crossOrigin='anonymous' type="video/mp4"></source>
                        <source src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign?.videoLinkFromPinata}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}#t=0.001`} crossOrigin='anonymous' type="video/ogg"></source>
                        Your browser does not support the video tag.
                    </video>
                    </div>
                    <div className='flex justify-streched'>
                    <div className='z-[1] relative justify-streched flex-initial h-[40px] my-[15px] w-9/12 ml-[15px] rounded-[5px] pb-[5px] pt-[5px] px-[25px] border-[1px] border-[#FFFFFF] bg-[#000000]'>
                        <h1 className='text-center text-[#FFFFFF] font-bold text-[14px] bg-[#000000] w-full'>{campaign?.typeOfCampaign}</h1>
                    </div>

                    <div className='w-[36px] justify-streched flex-1 justify-self-end h-[36px] mt-[17px] ml-[15px]'>
                        {campaign?.isCheckedByWebsite && !campaign?.iscashedout && (
                            <img src={VerifiedIcon} alt='Verified' className='justify-self-end  w-[36px] h-[36px]'/>
                        )}
                        {campaign?.iscashedout && (
                            <img src={done_desktop} alt='Cashed Out' className='w-[50px] h-[50px]'/>
                        )}
                    </div>
                    </div>

                    <h1 className='text-[#FFFFFF] font-bold text-[20px] text-center min-h-[45px] w-10/12'>{processtitle(campaign?.title)}</h1>
                    </div>
                    <div className='grid grid-rows-0 grid-flow-col gap-2 mt-[10px] w-full'>
                            <div className='w-[50px] h-[50px] row-span-3'>
                                <img src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign?.profilePic}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`} alt='loader' className='w-[50px] h-[50px] ml-[20px] rounded-full'/>
                            </div>
                            <div className='w-full mx-[15px]'>
                                <h1 className='text-[#FFFFFF] text-[14px] col-span-2'>Campaign Creator</h1>
                                <h1 className='text-[#FFFFFF] text-[10px] row-span-2 col-span-2 trancute'>{campaign?.owner}</h1>
                            </div>


                    </div>
                    <div className='!text-white text-[14px] w-10/12 mx-auto min-h-[130px]'>
                            {processDescription(campaign?.description)}
                    </div>
                    <button 
                    onClick={() => handleNavigateToCampaign(campaign)} 
                    className='bg-[#FFDD00] ml-[30px] text-[#000000] font-bold text-[16px] py-[5px] px-[10px] rounded-[5px] opacity-[65%] hover:opacity-[100%] ease-in-out duration-500'
                    >
                    View Campaign
                    </button>
                                </div>
        </>
    );
};

export default FeaturedCardMobile;
