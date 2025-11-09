import React, { useState, useEffect } from 'react';
import { loader, VerifiedIcon, cashedout,done_desktop } from '../assets';
import Loader from './Loader';
import { useNavigate } from 'react-router-dom';
import { calculateBarPercentage, daysLeft } from '../utils';
import IPFSMediaViewer from './IPFSMediaViewer';

const FeaturedCard = ({ campaign,style }) => {
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
      

    function processDescription(description, maxLength = 170)
  
  
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
        <div>
        <>  <div className={`${style}`}>
            {isLoading && <Loader />}
            <div className='flex justify-center grid grid-flow-col mb-[200px]'>
                <div className='w-full mx-[30px]'>

                    <IPFSMediaViewer
                    ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign?.videoLinkFromPinata}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                    className={'flex-1 rounded-[15px] w-11/12 mb-[20px] row-span-3'}
                    />
                    </div>
                <div className='justify-self-end flex-1 flex-initial'>
                <div className='flex w-8/12 mt-[10px] ml-[150px] justify-between grid grid-cols-2'>
                    <div className='h-[40px] ml-[60px] w-[350px] rounded-[5px] pb-[5px] pt-[5px] px-[25px] border-[1px] border-[#FFFFFF]'>
                        <h1 className='text-center text-[#FFFFFF] font-bold text-[14px]'>{campaign?.typeOfCampaign}</h1>
                    </div>
                    <div className='w-[72px] justify-self-end h-[72px]'>
                        {campaign?.isCheckedByWebsite && !campaign?.iscashedout && (
                            <img src={VerifiedIcon} alt='Verified' className='justify-self-end  w-[72px] h-[72px]'/>
                        )}
                        {campaign?.iscashedout && (
                            <img src={done_desktop} alt='Cashed Out' className='w-[72px] h-[72px]'/>
                        )}
                    </div>
                    
                </div>
                <div className='ml-[150px]'>
                <div className=' ml-[30px] mt-[15px]'>
                    <h1 className='text-[#FFFFFF] font-bold text-[20px] text-center min-h-[45px] w-10/12'>{processtitle(campaign?.title)}</h1>
                    </div>
                    <div className='grid grid-rows-3 grid-flow-col gap-2 mt-[10px] ml-[20px]'>
                            <div className='w-[50px] h-[50px] row-span-3'>
                                <img src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign?.profilePic}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`} alt='loader' className='w-[50px] h-[50x] ml-[20px] rounded-[100px]'/>
                            </div>
                            <div className='ml-[35px]'>
                                <h1 className='text-[#FFFFFF] text-[14px] col-span-2'>Campaign Creator</h1>
                                <h1 className='text-[#FFFFFF] text-[12px] row-span-2 col-span-2'>{campaign?.owner}</h1>
                            </div>


                    </div>
                    <div className='!text-white w-[500px] min-h-[70px] text-[14px] mt-[-100px] ml-[50px] sm:pb-[60px]'>
                            {processDescription(campaign?.description)}
                    </div>
                    <button 
                    onClick={() => handleNavigateToCampaign(campaign)} 
                    className='bg-[#FFDD00] ml-[70px] text-[#000000] font-bold text-[16px] py-[5px] px-[10px] rounded-[5px] opacity-[65%] hover:opacity-[100%] ease-in-out duration-500'
                    >
                    View Campaign
                    </button>

                    </div>
                    
                    </div>

          

            </div>
            </div>
        </>
        </div>
    );
};

export default FeaturedCard;
