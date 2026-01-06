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
  const emailRecipient = 'support@UltraShop.tech';
  return (
    <footer
      className="flex flex-col items-center text-center text-surface mx-auto">
      <div className="container pt-9 w-full">
      <div className="flex justify-between w-full p-4 text-center textcolor">
        <button onClick={handleNavigateToTerms} className='textcolor hover:text-[#FFFFFF] duration-500 ease-in-out text-[12px]'>Terms of Use</button>
        <br />
        <button onClick={handleNavigateToPrivacyPolicy} className='textcolor hover:text-[#FFFFFF] duration-500 ease-in-out text-[12px]'>Privacy Policy</button>
        <br />
        <a className='textcolor hover:text-[#FFFFFF] duration-500 ease-in-out text-[12px]' href='https://docs.google.com/document/d/e/2PACX-1vS7V-H4Eu92Nz00918mf1DZJoNBwkGAJA1CRW8Od-v_qX3LK0rIAhSjNwXfsNi6B_MEs78ue8wpegRw/pub' target='_blank'>White Paper</a><br/>
        <button onClick={() => contactUsEmail()} className='textcolor hover:text-[#FFFFFF] duration-500 ease-in-out text-[12px]'>Contact Us</button>
      </div>
        <div className="mb-6 flex justify-center space-x-2 overflow-auto touch-auto">
        <a
            href="https://twitter.com/ultrashoptech"
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
            href="https://t.me/ultrashoptech"
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
            href={`https://base.blockscout.com/address/${import.meta.env.VITE_DEX_ADDRESS}`}
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
        <button className='textcolor hover:text-[#FFFFFF] duration-500 ease-in-out ml-[5px]' onClick={handleNavigateHome}> UltraShop.tech</button>
        </div>
      </div>
      
    </footer>
  )
}
export default FooterMobile;
