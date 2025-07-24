import React,{useEffect} from 'react';
import { CustomButton } from '../components';
import { useStateContext } from '../context';
const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  },[]);
    const {emailUsAboutPrivacyPolicy} = useStateContext();

  return (
    <div>
  <div className='w-full mx-[auto] mt-[60px] linear-gradient1 rounded-[15px]'>
    <div className='w-9/12 mx-auto mt-[40px]'>
      <h1 className='text-[#FFFFFF] sm:text-[45px] text-[25px] font-epilogue font-bold sm:pt-[100px] sm:pb-[70px] pt-[45px]'>Privacy Policy</h1>

      <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>1. Introduction</span>
      <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>UltraShop ("we", "our", or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard the information you provide when using our website and services.</p>

      <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>2. Information We Collect</span>
      <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>We may collect personal information such as your name, email address, and contact details when you create an account, initiate a crowdfunding campaign, or communicate with us. We may also collect non-personal information, such as your IP address and browser type, for analytical purposes.</p>

      <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>3. Use of Information</span>
      <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>We use the information we collect to provide and improve our services, process transactions, communicate with you, and for other purposes related to the operation of our website and business.</p>

      <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>4. Sharing of Information</span>
      <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>We may share your personal information with third-party service providers who assist us in operating our website and services. We may also disclose your information as required by law or to protect our rights and interests.</p>

      <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>5. Data Security</span>
      <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, or misuse. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.</p>

      <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>6. Third-Party Links</span>
      <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>Our website may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these external sites.</p>

      <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>7. Children's Privacy</span>
      <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children without parental consent.</p>

      <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>8. Changes to This Privacy Policy</span>
      <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We encourage you to review this page periodically for any updates.</p>

      <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>9. Contact Us</span>
      <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>If you have any questions or concerns regarding this Privacy Policy or our data practices, please contact us at support@UltraShop.tech</p>

      <p className='text-[#FFFFFF] font-epilogue text-[14px] mt-[70px] mb-[30px]'>Last updated: 08/09/2024</p>

      <div className='flex justify-center items-center'>
        <CustomButton
          btnType="button"
          title="Email Us"
          styles="w-5/12 bg-transparent border-[#FFDD00] border-[1px] my-[40px] text-[white] drop-shadow-md"
          handleClick={() => emailUsAboutPrivacyPolicy()}
        />
      </div>
    </div>
  </div>
</div>
  )
}

export default PrivacyPolicy