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
                title="squid_widget"
                width="430"
                height="684"
                src={`https://widget.squidrouter.com/iframe?config=%7B%22integratorId%22%3A%22squid-swap-widget%22%2C%22companyName%22%3A%22Squid%22%2C%22style%22%3A%7B%22neutralContent%22%3A%22%23C4AEEC%22%2C%22baseContent%22%3A%22%23070002%22%2C%22base100%22%3A%22%23ffffff%22%2C%22base200%22%3A%22%23fafafa%22%2C%22base300%22%3A%22%23e8e8e8%22%2C%22error%22%3A%22%23ED6A5E%22%2C%22warning%22%3A%22%23FFB155%22%2C%22success%22%3A%22%232EAEB0%22%2C%22primary%22%3A%22%23A992EA%22%2C%22secondary%22%3A%22%23F89CC3%22%2C%22secondaryContent%22%3A%22%23F7F6FB%22%2C%22neutral%22%3A%22%23FFFFFF%22%2C%22roundedBtn%22%3A%2226px%22%2C%22roundedCornerBtn%22%3A%22999px%22%2C%22roundedBox%22%3A%221rem%22%2C%22roundedDropDown%22%3A%2220rem%22%7D%2C%22slippage%22%3A1.5%2C%22infiniteApproval%22%3Afalse%2C%22enableExpress%22%3Atrue%2C%22apiUrl%22%3A%22https%3A%2F%2Fapi.squidrouter.com%22%2C%22comingSoonChainIds%22%3A%5B%5D%2C%22titles%22%3A%7B%22swap%22%3A%22Swap%22%2C%22settings%22%3A%22Settings%22%2C%22wallets%22%3A%22Wallets%22%2C%22tokens%22%3A%22Select%20Token%22%2C%22chains%22%3A%22Select%20Chain%22%2C%22history%22%3A%22History%22%2C%22transaction%22%3A%22Transaction%22%2C%22allTokens%22%3A%22Select%20Token%22%2C%22destination%22%3A%22Destination%20address%22%2C%22depositAddress%22%3A%22Deposit%20address%22%2C%22seimetamask%22%3A%22Important%20message!%22%7D%2C%22priceImpactWarnings%22%3A%7B%22warning%22%3A3%2C%22critical%22%3A5%7D%2C%22environment%22%3A%22base-mainnet%22%2C%22showOnRampLink%22%3Atrue%2C%22defaultTokens%22%3A%5B%5D%2C%22preferDex%22%3A%5B%22%22%5D%2C%22iframeBackgroundColorHex%22%3A%22%23C3A7FF%22%7D`}
                className='rounded-[15px] my-[15px]'
            />):(<></>)}
            </div>
        </div>
            </>
    )
}

export default Swapper