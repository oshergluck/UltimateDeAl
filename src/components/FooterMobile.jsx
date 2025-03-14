import React,{useState} from 'react';
import {MM} from '../assets';
import {useNavigate} from 'react-router-dom';
import { useStateContext } from '../context';
export const FooterMobile = () => {
  const navigate = useNavigate();
  const {contactUsEmail} = useStateContext();
  const handleNaigateToVIP = () => {
    navigate('/register-vip');
  };

  const handleNavigateToInfo = () => {
    navigate('/listinginfo');
  }
  const handleNavigateToAllCampaigns = () => {
    navigate('/all-campaigns');
  };
  const handleNavigateToTerms = () => {
    navigate('/terms');
  };
  const handleNavigateToPrivacyPolicy = () => {
    navigate('/privacy-policy');
  };
  const handleNavigateToAbout = () => {
    navigate('/about');
  };
  const handleContactUs = () => {
    contactUsEmail();
  };

  const handleNavigateHome = () => {
    navigate('/');
  };
  const emailRecipient = 'support@UltimateDeal.net';
  return (
    <footer
      className="flex flex-col items-center text-center text-surface mx-auto">
      <div className="container pt-9 w-full">
      <div className="flex justify-between w-full p-4 text-center textcolor">
        <button onClick={handleNavigateToTerms} className='textcolor hover:text-[#FFFFFF] duration-500 ease-in-out text-[12px]'>Terms of Use</button>
        <br />
        <button onClick={handleNavigateToPrivacyPolicy} className='textcolor hover:text-[#FFFFFF] duration-500 ease-in-out text-[12px]'>Privacy Policy</button>
        <br />
        <button onClick={handleNavigateToAbout} className='textcolor hover:text-[#FFFFFF] duration-500 ease-in-out text-[12px] mr-[4px]'>About Us</button>
        <br />
        <button onClick={() => contactUsEmail()} className='textcolor hover:text-[#FFFFFF] duration-500 ease-in-out text-[12px]'>Contact Us</button>
        <br />
        <button onClick={() => handleNavigateToInfo()} className='textcolor hover:text-[#FFFFFF] duration-500 ease-in-out text-[12px]'>White Paper</button>
        <br />
        <button onClick={handleNaigateToVIP} className='textcolor hover:text-[#FFFFFF] duration-500 ease-in-out text-[12px]'>Become VIP Client</button>
      </div>
        <div className="mb-6 flex justify-center space-x-2 overflow-auto touch-auto">
        <a
            href="https://twitter.com/ultimatedeal__"
            type="button"
            target='_blank'
            className="rounded-full bg-transparent p-3 font-medium uppercase leading-normal text-surface transition duration-500 ease-in-out hover:bg-[#ff8000] focus:outline-none focus:ring-0 dark:text-white dark:hover:bg-secondary-900"
            data-twe-ripple-init>
            <span className="mx-auto [&>svg]:h-5 [&>svg]:w-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#7d7d7d"

                viewBox="0 0 512 512">
                <path
                  d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
              </svg>
            </span>
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61560392245458"
            type="button"
            target='_blank'
            className="rounded-full bg-transparent p-3 font-medium uppercase leading-normal text-surface transition duration-500 ease-in-out hover:bg-[#ff8000] focus:outline-none focus:ring-0 dark:text-white dark:hover:bg-secondary-900"
            data-twe-ripple-init>
            <span className="[&>svg]:h-5 [&>svg]:w-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#7d7d7d"
                viewBox="0 0 320 512">
                <path
                  d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z" />
              </svg>
            </span>
          </a>
          <a
            href="https://www.instagram.com/UltimateDeal.net/"
            type="button"
            target='_blank'
            className="hidden rounded-full bg-transparent p-3 font-medium uppercase leading-normal text-surface transition duration-500 ease-in-out hover:bg-[#ff8000] focus:outline-none focus:ring-0 dark:text-white dark:hover:bg-secondary-900"
            data-twe-ripple-init>
            <span className="mx-auto [&>svg]:h-5 [&>svg]:w-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#7d7d7d"
                viewBox="0 0 448 512">
                <path
                  d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
              </svg>
            </span>
          </a>
          <a
            href="https://chat.whatsapp.com/KIfMtgmEf0PASAsn9MUnTk"
            type="button"
            target='_blank'
            className="rounded-full bg-transparent p-3 font-medium uppercase leading-normal text-surface transition duration-500 ease-in-out hover:bg-[#ff8000] focus:outline-none focus:ring-0 dark:text-white dark:hover:bg-secondary-900"
            data-twe-ripple-init>
            <span className="mx-auto [&>svg]:h-5 [&>svg]:w-5">
              <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.014 8.00613C6.12827 7.1024 7.30277 5.87414 8.23488 6.01043L8.23339 6.00894C9.14051 6.18132 9.85859 7.74261 10.2635 8.44465C10.5504 8.95402 10.3641 9.4701 10.0965 9.68787C9.7355 9.97883 9.17099 10.3803 9.28943 10.7834C9.5 11.5 12 14 13.2296 14.7107C13.695 14.9797 14.0325 14.2702 14.3207 13.9067C14.5301 13.6271 15.0466 13.46 15.5548 13.736C16.3138 14.178 17.0288 14.6917 17.69 15.27C18.0202 15.546 18.0977 15.9539 17.8689 16.385C17.4659 17.1443 16.3003 18.1456 15.4542 17.9421C13.9764 17.5868 8 15.27 6.08033 8.55801C5.97237 8.24048 5.99955 8.12044 6.014 8.00613Z" fill="#7d7d7d"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M12 23C10.7764 23 10.0994 22.8687 9 22.5L6.89443 23.5528C5.56462 24.2177 4 23.2507 4 21.7639V19.5C1.84655 17.492 1 15.1767 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23ZM6 18.6303L5.36395 18.0372C3.69087 16.4772 3 14.7331 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C11.0143 21 10.552 20.911 9.63595 20.6038L8.84847 20.3397L6 21.7639V18.6303Z" fill="#7d7d7d"/>
              </svg>
            </span>
          </a>
          <a
            href="https://t.me/UltimateDealNet"
            type="button"
            target='_blank'
            className="rounded-full bg-transparent p-3 font-medium uppercase leading-normal text-surface transition duration-500 ease-in-out hover:bg-[#ff8000] focus:outline-none focus:ring-0 dark:text-white dark:hover:bg-secondary-900"
            data-twe-ripple-init>
            <span className="mx-auto [&>svg]:h-5 [&>svg]:w-5">
              <svg fill="#7d7d7d" width="800px" height="800px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <title>telegram</title>
              <path d="M22.122 10.040c0.006-0 0.014-0 0.022-0 0.209 0 0.403 0.065 0.562 0.177l-0.003-0.002c0.116 0.101 0.194 0.243 0.213 0.403l0 0.003c0.020 0.122 0.031 0.262 0.031 0.405 0 0.065-0.002 0.129-0.007 0.193l0-0.009c-0.225 2.369-1.201 8.114-1.697 10.766-0.21 1.123-0.623 1.499-1.023 1.535-0.869 0.081-1.529-0.574-2.371-1.126-1.318-0.865-2.063-1.403-3.342-2.246-1.479-0.973-0.52-1.51 0.322-2.384 0.221-0.23 4.052-3.715 4.127-4.031 0.004-0.019 0.006-0.040 0.006-0.062 0-0.078-0.029-0.149-0.076-0.203l0 0c-0.052-0.034-0.117-0.053-0.185-0.053-0.045 0-0.088 0.009-0.128 0.024l0.002-0.001q-0.198 0.045-6.316 4.174c-0.445 0.351-1.007 0.573-1.619 0.599l-0.006 0c-0.867-0.105-1.654-0.298-2.401-0.573l0.074 0.024c-0.938-0.306-1.683-0.467-1.619-0.985q0.051-0.404 1.114-0.827 6.548-2.853 8.733-3.761c1.607-0.853 3.47-1.555 5.429-2.010l0.157-0.031zM15.93 1.025c-8.302 0.020-15.025 6.755-15.025 15.060 0 8.317 6.742 15.060 15.060 15.060s15.060-6.742 15.060-15.060c0-8.305-6.723-15.040-15.023-15.060h-0.002q-0.035-0-0.070 0z"></path>
              </svg>
            </span>
          </a>
          <a
            href="https://www.tiktok.com/@the_money.time"
            type="button"
            target='_blank'
            className="rounded-full bg-transparent p-3 font-medium uppercase leading-normal text-surface transition duration-500 ease-in-out hover:bg-[#ff8000] focus:outline-none focus:ring-0 dark:text-white dark:hover:bg-secondary-900"
            data-twe-ripple-init>
            <span className="mx-auto [&>svg]:h-5 [&>svg]:w-5">
              <svg fill="#7d7d7d" width="800px" height="800px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <title>tiktok</title>
              <path d="M16.656 1.029c1.637-0.025 3.262-0.012 4.886-0.025 0.054 2.031 0.878 3.859 2.189 5.213l-0.002-0.002c1.411 1.271 3.247 2.095 5.271 2.235l0.028 0.002v5.036c-1.912-0.048-3.71-0.489-5.331-1.247l0.082 0.034c-0.784-0.377-1.447-0.764-2.077-1.196l0.052 0.034c-0.012 3.649 0.012 7.298-0.025 10.934-0.103 1.853-0.719 3.543-1.707 4.954l0.020-0.031c-1.652 2.366-4.328 3.919-7.371 4.011l-0.014 0c-0.123 0.006-0.268 0.009-0.414 0.009-1.73 0-3.347-0.482-4.725-1.319l0.040 0.023c-2.508-1.509-4.238-4.091-4.558-7.094l-0.004-0.041c-0.025-0.625-0.037-1.25-0.012-1.862 0.49-4.779 4.494-8.476 9.361-8.476 0.547 0 1.083 0.047 1.604 0.136l-0.056-0.008c0.025 1.849-0.050 3.699-0.050 5.548-0.423-0.153-0.911-0.242-1.42-0.242-1.868 0-3.457 1.194-4.045 2.861l-0.009 0.030c-0.133 0.427-0.21 0.918-0.21 1.426 0 0.206 0.013 0.41 0.037 0.61l-0.002-0.024c0.332 2.046 2.086 3.59 4.201 3.59 0.061 0 0.121-0.001 0.181-0.004l-0.009 0c1.463-0.044 2.733-0.831 3.451-1.994l0.010-0.018c0.267-0.372 0.45-0.822 0.511-1.311l0.001-0.014c0.125-2.237 0.075-4.461 0.087-6.698 0.012-5.036-0.012-10.060 0.025-15.083z"></path>
              </svg>
            </span>
          </a>
          <a
            href={`https://base.blockscout.com/address/${import.meta.env.VITE_CROWDFUNDING}`}
            type="button"
            target='_blank'
            className="rounded-full bg-transparent p-3 font-medium uppercase leading-normal text-surface transition duration-500 ease-in-out hover:bg-[#ff8000] focus:outline-none focus:ring-0 dark:text-white dark:hover:bg-secondary-900"
            data-twe-ripple-init>
            <span className="mx-auto [&>svg]:h-5 [&>svg]:w-5">
            <svg width="256" height="256" viewBox="0 0 123 123" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M25.79 58.4149C25.7901 57.7357 25.9244 57.0633 26.1851 56.4361C26.4458 55.809 26.8278 55.2396 27.3092 54.7605C27.7907 54.2814 28.3619 53.9021 28.9903 53.6444C29.6187 53.3867 30.2918 53.2557 30.971 53.2589L39.561 53.2869C40.9305 53.2869 42.244 53.831 43.2124 54.7994C44.1809 55.7678 44.725 57.0813 44.725 58.4509V90.9309C45.692 90.6439 46.934 90.3379 48.293 90.0179C49.237 89.7962 50.0783 89.262 50.6805 88.5019C51.2826 87.7418 51.6102 86.8006 51.61 85.8309V45.5409C51.61 44.1712 52.154 42.8576 53.1224 41.889C54.0908 40.9204 55.4043 40.3762 56.774 40.3759H65.381C66.7506 40.3762 68.0641 40.9204 69.0325 41.889C70.0009 42.8576 70.545 44.1712 70.545 45.5409V82.9339C70.545 82.9339 72.7 82.0619 74.799 81.1759C75.5787 80.8462 76.2441 80.2941 76.7122 79.5886C77.1803 78.8832 77.4302 78.0555 77.431 77.2089V32.6309C77.431 31.2615 77.9749 29.9481 78.9431 28.9797C79.9113 28.0113 81.2245 27.4672 82.5939 27.4669H91.201C92.5706 27.4669 93.884 28.0109 94.8525 28.9794C95.8209 29.9478 96.365 31.2613 96.365 32.6309V69.3399C103.827 63.9319 111.389 57.4279 117.39 49.6069C118.261 48.4717 118.837 47.1386 119.067 45.7267C119.297 44.3148 119.174 42.8678 118.709 41.5149C115.931 33.5227 111.516 26.1983 105.745 20.0105C99.974 13.8228 92.9749 8.90785 85.1955 5.58032C77.4161 2.2528 69.0277 0.585938 60.5671 0.686416C52.1065 0.786893 43.7601 2.6525 36.062 6.16383C28.3638 9.67517 21.4834 14.7549 15.8611 21.078C10.2388 27.401 5.99842 34.8282 3.41131 42.8842C0.824207 50.9401 -0.0526487 59.4474 0.836851 67.8617C1.72635 76.276 4.36263 84.4119 8.57696 91.7489C9.31111 93.0145 10.3912 94.0444 11.6903 94.7175C12.9894 95.3906 14.4536 95.679 15.911 95.5489C17.539 95.4059 19.566 95.2029 21.976 94.9199C23.0251 94.8008 23.9937 94.2999 24.6972 93.5126C25.4008 92.7253 25.7901 91.7067 25.791 90.6509L25.79 58.4149Z" fill="#21325B"/>
<path d="M25.6021 110.51C34.6744 117.11 45.3959 121.072 56.5802 121.957C67.7646 122.841 78.9757 120.615 88.9731 115.523C98.9705 110.431 107.364 102.673 113.226 93.1068C119.087 83.5405 122.188 72.539 122.185 61.3197C122.185 59.9197 122.12 58.5347 122.027 57.1577C99.808 90.2957 58.7831 105.788 25.604 110.505" fill="#979695"/>
</svg>

          </span>
          </a>
        </div>
        <div className=' pb-[50px] text-center text-[#FFFFFF]'>
        © 2024 Copyright: 
        <button className='textcolor hover:text-[#FFFFFF] duration-500 ease-in-out ml-[5px]' onClick={handleNavigateHome}> UltimateDeal.net</button>
        </div>
      </div>
      
    </footer>
  )
}
export default FooterMobile;
