import React, { useState, useEffect } from 'react'
import {Loader,Featured,FeaturedMobile} from '../components';
import { useMediaQuery } from 'react-responsive';
const Swapper = () => {
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const ShareAddress = window.location.pathname.split('/')[2];
    const [isLoading,setIsLoading] = useState(false);
    return (
        <>
        <div className="pt-[35px]">
        {isMobile ? <FeaturedMobile /> : <Featured/>}
        </div>
        <div className="min-h-screen linear-gradient rounded-[15px] mt-[40px]">
            {isLoading && <Loader />}
            <h2 className='text-center font-bold text-[#00FFFF] text-[24px] my-[15px] pt-[20px]'>Kindly Do Not Change Chain</h2>
            <h2 className='text-center font-bold text-[#FFFFFF] text-[24px] my-[15px]'>If you will, You'll have to change again and look for the Share by yourself (Work in progress)</h2>
            <div className='p-5'>
                {ShareAddress ? (
                <iframe
                src={`https://app.sushi.com/swap?chainId=8453&theme=dark&token0=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&token1=${ShareAddress}&exactField=input&exactAmount=1`}
                height="880px"
                width="100%"
                className='rounded-[15px] my-[15px]'
              />):(<></>)}
            </div>
        </div>
            </>
    )
}

export default Swapper