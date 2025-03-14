import React ,{useState,useEffect} from 'react';
import { useStateContext } from '../context';
import { VerifiedIcon,VER_desktop,
  VER_mobile,
  done_desktop,
  done_mobile,
  hold_desktop,
  hold_mobile,
  dis_desktop,
  dis_mobile } from '../assets';
import { calculateBarPercentage, daysLeft } from '../utils';
import {loader} from '../assets';
import { useNavigate } from 'react-router-dom';

const CampaignCard = ({campaign,handleClick,Address}) =>
{
  const navigate = useNavigate();
  const { CrowdFunding, HexToInteger,getDonations } = useStateContext();
  const [total, setTotal] = useState('');
  const [target, setTarget] = useState(0);

useEffect(() => {
  async function fetchTotalDonations () {
   const data = await getDonations(campaign.parsedCampaign.pId);
   if(data)
    setTotal(HexToInteger(data.totalDonations._hex)*1e-6);
  }
  if(CrowdFunding&&campaign&&!total){
  fetchTotalDonations();
  setTarget(Math.round(HexToInteger (campaign.parsedCampaign.target._hex)*1e-6));
}
}, [campaign,CrowdFunding,total]);

  
function extractNumberFromString(str) {
  const matches = str.match(/(\d+(\.\d+)?)/);
  return matches ? parseFloat(matches[0]) : 0;
};
 
const handleNavigateEdit = (campaign) => {
  setTimeout(() => {
    navigate(`/edit-campaign/${campaign.parsedCampaign.pId}`);
  }, 500); // Delay the navigation for 500 milliseconds
};
  function processDescription(description, maxLength = 170)
  
  {
    if (!description) {return ''};

    // Remove special formatting characters
    const cleanedDescription = description.replace(/[\$^~*]/g, '');

    // Truncate the description if it exceeds the maxLength
    if (cleanedDescription.length <= maxLength) {return cleanedDescription};
    return cleanedDescription.substring(0, maxLength) + '...';
};
function processtitle(description, maxLength = 50) {
  if (!description) {return ''};

  // Remove special formatting characters
  const cleanedDescription = description.replace(/[\$^~*]/g, '');

  // Truncate the description if it exceeds the maxLength
  if (cleanedDescription.length <= maxLength) {return cleanedDescription};
  return cleanedDescription.substring(0, maxLength) + '...';
};

  return (
    <div>
    <div className={campaign.parsedCampaign.video==='X' ? 'sm:w-[350px] w-full relative  opacity-[25%] hover:opacity-[75%] duration-500 ease-in-out  min-h-[600px] rounded-[10px] border-[1px] bg-[#000000] border-[#242424]' : ''}>
    <div className={campaign.parsedCampaign.isCheckedByWebsite ? 'sm:w-[350px] w-full relative  opacity-[85%] hover:opacity-[100%] duration-500 ease-in-out  min-h-[600px] rounded-[10px] border-[1px] bg-[#000000] border-[#242424]' : 'sm:w-[350px] w-full relative min-h-[600px] rounded-[10px] border-[1px] bg-[#000000] border-[#242424] opacity-[65%]'}>
      {campaign.parsedCampaign.isCheckedByWebsite || campaign.parsedCampaign.video==='X' ? (
  <></>
) : (<>
  <img src={loader} alt='loader' className='absolute z-[2] top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[50px] h-[50px] object-contain'/>
  <span className='text-[#FFFFFF] absolute z-[5] top-[25px] left-[10px] object-contain text-[25px] font-bold'>Waiting for verification</span></>
)}

{campaign.parsedCampaign.video ? (<video
  className="sm:w-full w-full rounded-[10px] max-h-[210px] min-h-[210px]"
  controls
  preload="metadata"
  aria-label="Campaign video"
>
          <source src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign.parsedCampaign.video}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}#t=0.001`} crossOrigin='anonymous' type="video/mp4"></source>
          <source src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign.parsedCampaign.video}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}#t=0.001`} crossOrigin='anonymous' type="video/ogg"></source>
          Your browser does not support the video tag.
        </video>) : (
  <img src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/QmYrxFyRq3jSkKwGmT7VMvyjB9jdb9aNXJE9vBGg5rBJjv?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`} alt="Campaign" className='sm:w-full w-full rounded-[10px] max-h-[210px] min-h-[210px]' />
)}
        {campaign.parsedCampaign.campaignOwner === Address&& campaign.parsedCampaign.video!=='X'  ? (<button
  onClick={() => handleNavigateEdit(campaign)}
  className="duration-500 ease-in-out opacity-[70%] hover:opacity-[100%] absolute z-[2] top-[20px] right-[20px] bg-[#00FFFF] drom-shadow-md text-[#000000] font-epilogue font-semibold text-[12px] py-[5px] px-[10px] rounded-[5px] text-[14px]"
  aria-label="Edit campaign"
>
  Edit Campaign
</button>):(<></>)}
        
          
          <div className='cursor-pointer' onClick={handleClick} >
        <div className='w-full justify-between flex mt-[15px] '>    
        <h3 className='mt-[8px] text-white ml-[20px] font-epilogue font-semibold text-[12px] pt-[3px] px-[20px] mb-[26px] rounded-[7px] border-[#FFFFFF] border-[1px] h-[30px]'>{campaign.parsedCampaign.category}</h3>
        {campaign.parsedCampaign.isCheckedByWebsite && campaign.parsedCampaign.iscashedout==false  ? (
          <div className='justify-end'>
        <img src={VER_desktop} alt='verified' className='flex-1 w-[56px] h-[56px]'/>
        </div>
        ) :
       (<></>)}
       {campaign.parsedCampaign.iscashedout===true ? (
        <div className='justify-end'>
        <img src={done_desktop} alt='done' className='flex-1 w-[56px] h-[56px]'/>
        </div>
       ):(<> </>)}
       {campaign.parsedCampaign.video==='X' ? (
        <div className='justify-end'>
        <img src={dis_desktop} alt='disqualify' className='flex-1 w-[56px] h-[56px]'/>
        </div>
       ):(<> </>)}
        </div>
        <h3 className='text-white font-epilogue Text-white font-semibold text-[20px] px-[20px] min-h-[65px]'>{processtitle(campaign.parsedCampaign.title)}</h3>
        <h2 className='text-[#FFFFFF] font-epilogue font-semibold sm:text-[12px] text-[14px] px-[20px] min-h-[125px]'>{processDescription(campaign.parsedCampaign.description)}</h2>
      <div className='flex justify-between items-center ml-[15px] mt-[15px] mb-[20px]'>
      <img
  src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${campaign.parsedCampaign.profilePhoto}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
  alt="Campaign owner avatar"
  className="w-[50px] h-[50px] object-contain rounded-full"
/>
      <p className='flex-1 text-[#FFFFFF] font-epilogue font-semibold text-[14px] py-[5px] px-[10px] truncate'>{campaign.parsedCampaign.campaignOwner}</p>
      
      </div>
      <div className="relative h-[5px] linear-gradient2 mt-2 rounded-xl mx-auto w-10/12 opacity-[60%]" >
      {campaign.parsedCampaign.iscashedout==false ? (
            <div className="absolute h-full bg-[#fc941c] rounded-xl" style={{ width: `${calculateBarPercentage(target,total)}%`, maxWidth: '100%'}}>
              <p className='absolute text-[#fc941c] text-[15px] top-[-25px] right-[10]'>{calculateBarPercentage(target, total)+'%'}</p>
            </div>
          ) : (
            <div className="absolute h-full bg-[#fc941c] rounded-xl" style={{ width: `${calculateBarPercentage(target,parseFloat(extractNumberFromString(campaign.parsedCampaign.websiteComment)))}%`, maxWidth: '100%'}}>
            <p className='absolute text-[#fc941c] text-[15px] top-[-25px] right-[10]'>{calculateBarPercentage(target, parseFloat(extractNumberFromString(campaign.parsedCampaign.websiteComment)))+'%'}</p>
            </div>
          )}
          </div>
          <div className='flex justify-between items-center mb-[30px]'>
          <div className="mt-[5px] w-8/12 mx-[15px]">
            {campaign.parsedCampaign.iscashedout==true ? (<h2 className='text-[#FFFFFF] text-[20px]  mt-[15px] ml-[25px] font-bold'>{parseFloat(extractNumberFromString(campaign.parsedCampaign.websiteComment))} $USDT</h2>):(<h2 className='text-[#FFFFFF] text-[20px]  mt-[15px] ml-[25px] font-bold'>{total} $USDT</h2>)}
            <h2 className='text-[#FFFFFF] text-[12px] ml-[25px]'>Out Of {target} $USDT</h2>
          </div>
          <div className='flex-1'>
          <h2 className='text-[#FFFFFF] text-[20px]  mt-[15px] mr-[45px] font-bold'>{daysLeft(campaign.parsedCampaign.endDate)}</h2>
            <h2 className='text-[#FFFFFF] text-[12px] w-full mr-[45px]'>Days left</h2>
          </div>
          </div>
          </div>
          </div>
          </div>
          </div>
  )
};

export default CampaignCard;