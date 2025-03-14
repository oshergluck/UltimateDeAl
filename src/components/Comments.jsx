import React, { useState} from 'react';
import {useStateContext} from '../context';
import {fontSizes} from './AccessibilityMenu';



function Comments({comments, postId}) {
  const {likeComment,refreshPage,} = useStateContext();
  const sortedComments = comments;
  const fontSizeIndex = fontSizes.indexOf('base');
  const handleLike = async (postId,commentId) => {
    await likeComment(postId,commentId); 
    refreshPage();
  }
  return (
    
    <div className="drop-shadow-md mt-[10px]">
{sortedComments ? (
  sortedComments.map((item, index) => {
      return (
        <div key={index} className='mt-[5px]'>
        {item.isVisible ? (<><div className="linear-gradient2 mt-[10px] flex items-right justify gap-0 rounded-[3px]">
              {item.commenter=='' ? (<div className="mr-[5px] font-epilogue font-semibold sm:text-[13px] text-[13px] text-[#000000] sm:mx-[10px] ml-[5px] m-[auto]">
              Anonymouse:
            </div>):(<div className="mr-[5px] font-epilogue font-semibold sm:text-[13px] text-[13px] text-[#000000] sm:mx-[10px] ml-[5px] m-[auto]">
            {item.commenter}:
            </div>)}
            <div className={`sm:text-[16px] text-${fontSizes[fontSizeIndex]} text-[#FFFFFF] m-auto linear-gradient text-center drop-shadow w-full py-[20px] ml-[5px]`}>
            {item.commentText}
            </div>
            </div>
            </>):(<></>)}
          </div>
      );
  })
) : (
  <p className="font-epilogue font-normal text-[16px] text-[#808191] mt-[10px]">
    No comments yet.
  </p>
)}
</div>
  )
}
export default Comments;