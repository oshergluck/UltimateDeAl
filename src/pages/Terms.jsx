import React,{useEffect} from 'react'
import { CustomButton } from '../components'
import { useStateContext } from '../context'

const Terms = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
      },[]);
    const { emailUsAboutTerms } = useStateContext();
  return (
    <div>
        <div className='w-full mx-[auto] mt-[15px] mb-[100px] linear-gradient1 rounded-[15px] py-5'>
            <div className='w-9/12 mx-auto'>
            <h1 className='text-[#FFFFFF] sm:text-[45px] text-[25px] font-epilogue font-bold pt-[100px] pb-[70px]'>Terms of Service</h1>
            <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>1. Introduction</span>
            <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>Welcome to UltraShop These Terms of Use ("Terms") govern your use of our website and services ("Services"), and by accessing and using our Services, you agree to these Terms. Please read them carefully.</p>
            <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>2. Eligibility</span>
            <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>To use our Services, you must be at least 18 years old, or the age of majority in your jurisdiction, and have the necessary power and authority to enter into these Terms. After uploading a campaign, you must contact us for approval, until then it will not be able to receive investments.</p>
            <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>3. Campaign Approval Process</span>
            <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>All crowdfunding campaigns submitted to UltraShop will undergo a thorough review process. We reserve the right to approve or reject any fundraising campaign or a store at our sole discretion. To verify your campaign or get your store listed we will contact you or contact us at emails if it passed 24 Hours.</p>
            <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>4. Prohibited Campaigns</span>
            <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>Campaigns that promote, support, or fund terrorism, illegal activities, or NSFW content are strictly prohibited. If a campaign is found to be in violation of these prohibitions:
                <br/>
                a. The campaign will be closed immediately. <br/>
                b. the Investors will get their Investments refunded (only if the fundraising campaign didnt over yet).<br/>
                c. We have the system to refund the Investors<br/>
                Disclamer: The campaign over when it got to the its Goal or deadline. Everyone can report any campaign.</p>
            <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>5. Investments</span>
            <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>All the investments works the special token $USDC, with this.. We are not responsible for lost of money because of a scam campaign. Always do your own reserch and speak with the person you want to invest in. This is why you have their Email or Mobile</p>
            <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>6. Campaign Closing Or Ban Store</span>
            <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>We reserve the right to close any campaign at our discretion, especially if it violates our guidelines or if there's any suspicious activity. In such cases, donations will be refunded to the supporters of this particular fundraising campaign (Not to the campaign owner or store owner). (only before the campaign was over)</p>
            <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>7. Liability</span>
            <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>we are not responsible for lost investments because of, campaign owners' negligence. In addition, sending to the wrong addresses will not be taken responsibility.</p>
            <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>8. Other smartcontracts addresses can be delivered by email if you want to check us</span>
            <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>We are open to welcome everyone to our platform :)</p>
            <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>9. Report a fundraising campaign or a store</span>
            <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>Report is by email, If you have a problem with a campaign you can press report or send an email to support@UltraShop.net</p>
            <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>10. Website Fee</span>
            <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>We take an opening fee which changes and 3.5% of the total amount collected. There are no refunds on the opening fee. So make sure you are serious about your campaign. We advice to speak with us before opening a campaign to know if its not against our rules.</p>
            <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>11. Contact Us</span>
            <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>For any questions or clarifications regarding these Terms, kindly contact us at WhatsApp, Email, Telegram or every channel you can find at the bottom of the website.</p>
            <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>12. Security</span>
            <p className='text-[#FFFFFF] font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>Every Business owner get instant access to dashboard which let him see users details. Only we and the business owner can sees the client details This way no one can know the details of the clients except you. You can get receipts, refund clients, give shares.</p>
            <span className='text-[#FFDD00] font-epilogue font-semibold text-[16px]'>13. Github</span>
            <br/>
            <a href='https://github.com/oshergluck/UltimateDeAl' className='text-blue-500 font-epilogue font-semibold text-[16px] mt-[10px] mb-[30px]'>Link</a>

            <p className='text-[#FFFFFF] font-epilogue text-[14px] mt-[70px] mb-[30px]'>Last updated: 15/03/2025</p>
            
            <div className='flex justify-center items-center'>
                <CustomButton 
                    btnType="button"
                    title="Email Us"
                    styles="sm:w-3/12 w-[7/12] bg-transparent border-[#FFDD00] border-[1px] mt-[40px] text-[white] drop-shadow-md"
                    handleClick={() => emailUsAboutTerms()}
                />
                </div>
            
            
            
            
            
            </div>
        </div>
    </div>
  )
}

export default Terms