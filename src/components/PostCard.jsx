import React ,{useState,useEffect} from 'react';
import { useStateContext } from '../context';
import { VerifiedIcon } from '../assets';
import { calculateBarPercentage, daysLeft } from '../utils';
import {loader} from '../assets';
import {IPFSMediaViewer} from '../components';
import { useNavigate } from 'react-router-dom';
import {MediaRenderer } from '@thirdweb-dev/react';
import { createThirdwebClient } from 'thirdweb';

const PostCard = (post,handleClick) => {
  const client1 = createThirdwebClient({clientId: import.meta.env.VITE_THIRDWEB_CLIENT});

    const navigate = useNavigate();
    function handleClick () {
        navigate(`/post/${post.post.parsedPost.pId}`);
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
  function processtitle(description, maxLength = 50) {
    if (!description) return '';
  
    // Remove special formatting characters
    const cleanedDescription = description.replace(/[\$^~*]/g, '');
  
    // Truncate the description if it exceeds the maxLength
    if (cleanedDescription.length <= maxLength) return cleanedDescription;
    return cleanedDescription.substring(0, maxLength) + '...';
  }


  return (
    <div className='min-h-[510px] sm:w-[308px] w-10/12 mx-auto bg-[#000000] rounded-[15px] border-[1px] border-[#363636] cursor-pointer' onClick={() => handleClick()}>
                  <IPFSMediaViewer
                  ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${post.post.parsedPost.imageUrls1}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                  className="!object-contain !w-full !max-h-[275px]"
                  />
       <h1 className='text-white font-epilogue font-semibold text-[18px] mt-[20px] mx-[20px] min-h-[70px]'>{processtitle(post.post.parsedPost.headline)}</h1>
        <p className='text-[#B1B1B1] font-epilogue font-normal text-[16px] mx-[20px] min-h-[160px]'>{processDescription(post.post.parsedPost.summary)}</p>
        <span className='text-[#00FFFF] font-epilogue font-bold text-[16px] mx-[20px] mb-[20px]'>By {post.post.parsedPost.writerName}</span>
    </div>
  )
}

export default PostCard