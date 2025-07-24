import React, {useEffect} from 'react'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {Anonuser,V_ABOUT_DESKTOP,GIL_PROFILE,Adi} from '../assets';
import { useStateContext } from '../context';


const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);},[]);

    const {emailUsAbout} = useStateContext();
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
      };
    
      const handleContactAbout = () => {
       const data =  emailUsAbout()
      };
    








  return (<>
    <div className='w-full rounded-t-[10px] linear-gradient1 py-[20px] mt-[20px]'>
        <h2 className='text-[#FFFFFF] sm:text-[55px] text-[29px] font-semibold mt-[40px] text-center'>Welcome To UltraShop</h2>
        <div className='w-10/12 mx-[auto]'>
        <p className='text-[#FFFFFF] text-[18px] font-semibold my-[30px] text-center'>UltraShop is a platform that allows you to raise funds for your business or project, open your own blockchain store and more. We provide a safe and secure way for you to connect with potential investors and donors who are interested in supporting your cause. Whether you are a startup looking for funding or an established business seeking to expand, UltraShop can help you reach your goals. Our platform is easy to use and offers a variety of features to help you create a successful business. Sign up today and start your business!</p>
        </div>
        <h2 className='text-[#FFFFFF] sm:text-[55px] text-[25px] font-semibold mt-[60px] mb-[30px] text-center'>Team Members</h2>
        <div className='sm:w-[450px] w-full h-[790px] mx-auto overflow-hidden mb-[60px]'>
        <Slider {...settings}
        >
            <div className='border-[1px] border-[#FFFFFF] h-[700px] mt-[90px]'>
                <div className='rounded-full w-[250px] h-[250px] mx-[auto] mt-[-90px]'>
                    <img src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${import.meta.env.VITE_OSHER_HAIM_PINATA}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`} alt='team member' className='w-[200px] h-[200px] rounded-full m-[auto]'/>
                </div>
                <h2 className='text-center text-[#FFFFFF] text-[22px] font-semi-bold mt-[-25px]'>Osher Haim Glick - CEO & Founder</h2>
                <p className='text-[#FFFFFF] text-[16px] font-semibold mt-[20px] mx-[20px] text-center'>I'm the CEO and Founder of UltraShop and the developer of ERCUltra and ERCUltraStore. I have over 14 years of experience in developing software and has worked with various startups and businesses in the computer industry to help them raise funds and grow their businesses. I'm passionate about helping entrepreneurs succeed and is dedicated to providing a platform that empowers them to achieve their goals.</p>
                <br/>
                <br/>
                <p className='text-[#FFFFFF] text-[16px] font-semibold mt-[20px] mx-[20px] text-center'>Connect with Osher Haim on LinkedIn: <a href='https://www.linkedin.com/in/%D7%90%D7%95%D7%A9%D7%A8-%D7%97%D7%99%D7%99%D7%9D-%D7%92%D7%9C%D7%99%D7%A7-a27411300/' target='_blank' className='text-[#FFDD00]'>Osher Haim Glick</a> ,by Email: osherhaim@UltraShop.tech Or by mobile: +972-52-878-0223</p>
                <p className='text-[#FFFFFF] text-[16px] font-semibold mt-[20px] mx-[20px] text-center'></p>
                <p className='text-[#FFFFFF] text-[16px] font-semibold mt-[20px] mx-[20px] text-center'></p>
            </div>
            <div className='border-[1px] border-[#FFFFFF] h-[700px] mt-[90px]'>
                <div className='rounded-full w-[250px] h-[250px] mx-[auto] mt-[-90px]'>
                    <img src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/QmQ3pAyxcL83GXsCoEYV52X2cDTGmWq6qp5Gk8SCaLjLD2?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`} alt='team member' className='w-[200px] h-[200px] rounded-full m-[auto]'/>
                </div>
                <h2 className='text-center text-[#FFFFFF] text-[22px] font-semi-bold mt-[-25px]'>Adi kotlovski Peri, Graphic designer, UX+UI design</h2>
                <p className='text-[#FFFFFF] text-[16px] font-semibold mt-[20px] mx-[20px] text-center'>As a designer, I aim to produce visually captivating experiences that are enjoyable to use, emphasizing convenience and simplicity. I welcome the challenge of crafting intuitive designs that prioritize both comfort and usability</p>
                <br/>
                <br/>
                <p className='text-[#FFFFFF] text-[16px] font-semibold mt-[20px] mx-[20px] text-center'>Connect with Adi on LinkedIn: <a href='https://www.linkedin.com/in/adi-kotlovski-peri-6838a4193' target='_blank' className='text-[#FFDD00]'>Adi Kotlovski Peri</a></p>
                <p className='text-[#FFFFFF] text-[16px] font-semibold mt-[20px] mx-[20px] text-center'></p>
                <p className='text-[#FFFFFF] text-[16px] font-semibold mt-[20px] mx-[20px] text-center'></p>
            </div>

        </Slider>
        </div>

        <div className='w-full'>
        <h2 className='text-[#FFFFFF] text-[25px] font-semibold mt-[60px] mb-[10px] text-center'>All you need to do is to swap to $USDT and you can start using our platform!</h2>
        </div>
        
    </div>
    <div className='linear-gradient1 py-[20px] w-full mx-[auto]'>
        <div className='w-10/12 mx-[auto]'>
        <h2 className='text-[#FFFFFF] sm:text-[55px] text-[25px] font-semibold mt-[40px] text-center'>Our Mission</h2>
        <p className='text-[#FFFFFF] text-[18px] font-semibold my-[30px] text-center'>In every city in the world that there will be crypto businesses, each business owner gets business exclusivity, and no competitors for limited time. We provide a platform that empowers entrepreneurs to achieve their goals. We believe that everyone should have the opportunity to start and grow their business, and we are committed to helping you succeed. Whether you are looking for funding, marketing support, or a place to sell your products, UltraShop has the tools and resources you need to make your dreams a reality. Sign up today and start building your business!</p>
        <h2 className='text-[#FFFFFF] sm:text-[55px] text-[25px] font-semibold mt-[60px] mb-[30px] text-center'>Our Vision</h2>
        <p className='text-[#FFFFFF] text-[18px] font-semibold my-[30px] text-center'>Our vision is to create a global community of entrepreneurs who support each other and work together to build successful businesses. We believe that by connecting people with similar goals and interests, we can create a network of support that will help you achieve your dreams. Whether you are a startup looking for funding or an established business seeking to expand, UltraShop is here to help you succeed. Join us today and be a part of our growing community!</p>
    </div>
    <h3 className='text-[#FFFFFF] sm:text-[55px] text-[25px] font-semibold mt-[60px] mb-[30px] text-center'>How To Use Our Platfrom</h3>
    <div className='w-10/12 mx-[auto] mt-[60px]'>
        <h1 className='text-[#FFDD00] text-[30px] font-semibold mt-[40px] text-center'>Step 1: Buy or deposit ETH</h1>
        <p className='text-[#FFFFFF] text-[18px] font-semibold my-[30px] text-center'>Login to our platform and buy or deposit enough ETH for GAS, 1$ is enough for alot of oparations. If you want to buy, 10$ is the minimum amount.</p>
        </div>
        <div className='w-10/12 mx-[auto]'>
        <h1 className='text-[#FFDD00] text-[30px] font-semibold mt-[40px] text-center'>Step 2: Buy $USDT</h1>
        <p className='text-[#FFFFFF] text-[18px] font-semibold my-[30px] text-center'>Swap any token to $USDT</p>
        </div>
        <div className='w-10/12 mx-[auto]'>
        <h1 className='text-[#FFDD00] text-[30px] font-semibold mt-[40px] text-center'>Step 3: Sign Up</h1>
        <p className='text-[#FFFFFF] text-[18px] font-semibold my-[30px] text-center'>Go to Home Page and choose a store you want to buy from, Register to the store, each store has its own clients list.</p>
        </div>
        <div className='w-10/12 mx-[auto]'>
        <h1 className='text-[#FFDD00] text-[30px] font-semibold mt-[40px] text-center'>Step 4: Approve $USDT</h1>
        <p className='text-[#FFFFFF] text-[18px] font-semibold my-[30px] text-center'>Approve the amount you need to purchase what you want</p>
        </div>
        <div className='w-10/12 mx-[auto]'>
        <h1 className='text-[#FFDD00] text-[30px] font-semibold mt-[40px] text-center'>Step 5: Buy Services</h1>
        <p className='text-[#FFFFFF] text-[18px] font-semibold my-[30px] text-center'>Buy the services you want.</p>
        </div>
    </div>
    <div className='w-full linear-gradient1 py-[20px] pb-[100px]'>
      <div className='w-8/12 mx-auto'>  {/* This div will take 8/12 of the full width and center it */}
        <h2 className='text-[#FFFFFF] sm:text-[55px] text-[25px] font-semibold mt-[40px] text-center'>
          How To Open Your Own Store
        </h2>
        <p className='text-[#FFDD00] text-[18px] font-semibold my-[30px] text-center'>
          Go to the Store section, and buy our Store contract. If you need a fundraising campaign, we've got you covered also. Each store and campaign must go through a verification process to maintain our platform the best.
        </p>
      </div>
      <div className='w-10/12 mx-[auto]'>
          <h2 className='text-[#FFFFFF] sm:text-[55px] text-[25px] font-semibold mt-[60px] mb-[30px] text-center'>What is the ERCUltra Protocol?</h2>
          <p className='text-[#FFDD00] text-[18px] font-semibold my-[30px] text-center'>
            ERCUltra is an advanced protocol designed to distribute dividends to token holders seamlessly. When you create a store on UltraShop, you are granted your own ERCUltra token. As a store owner, you can reward your customers and investors by automatically sharing a portion of your profits with them. This feature not only incentivizes users to hold your tokens but also builds trust and loyalty within your community.
          </p>
          <p className='text-[#FFFFFF] text-[18px] font-semibold my-[30px] text-center'>
            Every store on our platform operates with its unique ERCUltra token, ensuring that profits are fairly distributed among token holders. The protocol let you choose how much dividend payouts and with anycoin you choose to pay with, providing a transparent and efficient way to manage your business's revenue sharing.
          </p>
        </div>
      <h2 className='text-[#FFFFFF] sm:text-[55px] text-[25px] font-semibold mt-[60px] mb-[60px] text-center'>
        Why Use UltraShop
      </h2>
      <div className='sm:flex sm:flex-row gap-10 sm:justify-center mx-auto w-10/12'> {/* Flex container adjusted to center and match the width of the parent */}
        <div className='mx-auto border-[1px] border-[#FFFFFF] rounded-[10px] sm:w-4/12 w-full sm:flex items-center'>
          <div>
            <img src={V_ABOUT_DESKTOP} alt='V' className='mx-auto mt-[30px]'/>
            <p className='text-[#FFDD00] text-[18px] font-semibold my-[30px] text-center mx-[10px]'>
              Our platform is safe and secure, so you can trust that your information is protected.
            </p>
          </div>
        </div>
        <div className='mx-auto border-[1px] border-[#FFFFFF] rounded-[10px] sm:w-4/12 sm:full sm:flex items-center sm:mt-[0] mt-[20px]'>
          <div>
          <img src={V_ABOUT_DESKTOP} alt='V' className='mx-auto mt-[30px]'/>
            <p className='text-[#FFDD00] text-[18px] font-semibold my-[30px] text-center mx-[10px]'>
              Our platform is easy to use, so you can focus on building your business without any hassle.
            </p>
          </div>
        </div>
        <div className='mx-auto border-[1px] border-[#FFFFFF] rounded-[10px] sm:w-4/12 w-full sm:flex items-center sm:mt-[0] mt-[20px]'>
          <div>
          <img src={V_ABOUT_DESKTOP} alt='V' className='mx-auto mt-[30px]'/>
            <p className='text-[#FFDD00] text-[18px] font-semibold my-[30px] text-center mx-[10px]'>
              We offer support to help you succeed, so you can reach your goals faster.
            </p>
          </div>
        </div>
      </div>
      <div className='sm:flex mx-auto gap-5 w-10/12 sm:mt-[30px]'>
      <div className='mx-auto border-[1px] border-[#FFFFFF] rounded-[10px] sm:w-5/12 w-full sm:flex items-center sm:mt-[0] mt-[20px]'>
          <div>
          <img src={V_ABOUT_DESKTOP} alt='V' className='mx-auto mt-[30px]'/>
            <p className='text-[#FFDD00] text-[18px] font-semibold my-[30px] text-center px-[10px]'>
              With UltraShop people from all around the globe can invest in your company anonymously.
            </p>
          </div>
        </div>
        <div className='mx-auto border-[1px] border-[#FFFFFF] rounded-[10px] sm:w-5/12 w-full sm:flex items-center sm:mt-[0] mt-[20px]'>
          <div>
          <img src={V_ABOUT_DESKTOP} alt='V' className='mx-auto mt-[30px]'/>
            <p className='text-[#FFDD00] text-[18px] font-semibold my-[30px] text-center px-[10px]'>
              We have low fees if at all and our Token share all the profit of our earnings in share mechanism with 5% dividends to all holders.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className='w-full linear-gradient1 py-[20px] rounded-b-[15px]'>
        <h1 className='text-[#FFFFFF] sm:text-[55px] text-[25px] font-semibold mt-[40px] text-center'>FAQ</h1>
        <div className='w-10/12 mx-auto'>
            <h2 className='text-[#FFDD00] text-[30px] font-semibold mt-[40px] text-center'>Q: What is UltraShop?</h2>
            <p className='text-[#FFFFFF] text-[18px] font-semibold my-[30px] text-center'>A: UltraShop is a platform that allows you to raise funds for your business or project, open your own blockchain store and more. We provide a safe and secure way for you to connect with potential investors and donors who are interested in supporting your cause. Whether you are a startup looking for funding or an established business seeking to expand, UltraShop can help you reach your goals. Our platform is easy to use and offers a variety of features to help you create a successful business. Sign up today and start your business!</p>
            <h2 className='text-[#FFDD00] text-[30px] font-semibold mt-[40px] text-center'>Q: How does UltraShop work?</h2>
            <p className='text-[#FFFFFF] text-[18px] font-semibold my-[30px] text-center'>A:UltraShop works by connecting entrepreneurs with potential investors and donors who are interested in supporting their cause. You can create a fundraising campaign, open your own blockchain store, or sell your products on our platform. We provide a safe and secure way for you to connect with others and achieve your goals!</p>
            <h2 className='text-[#FFDD00] text-[30px] font-semibold mt-[40px] text-center'>Q: How do I get started with UltraShop?</h2>
            <p className='text-[#FFFFFF] text-[18px] font-semibold my-[30px] text-center'>A: To get started with UltraShop, simply login with your wallet to our platform. Once you have created an account, you can start raising funds for your business, opening your own blockchain store, or selling your products. Our platform is easy to use and offers a variety of features to help you succeed!</p>
            <h2 className='text-[#FFDD00] text-[30px] font-semibold mt-[40px] text-center'>Q: How can I contact UltraShop?</h2>
            <p className='text-[#FFFFFF] text-[18px] font-semibold my-[30px] text-center'>A: You can contact UltraShop by email at support@UltraShop.tech</p> 
            <h2 className='text-[#FFDD00] text-[30px] font-semibold mt-[40px] text-center'>Q: How can I get help with UltraShop?</h2>
            <p className='text-[#FFFFFF] text-[18px] font-semibold my-[30px] text-center'>A: If you need help with UltraShop, you can contact our support team by email at support@UltraShop.tech or at our WhatsApp group: <a href='https://chat.whatsapp.com/KIfMtgmEf0PASAsn9MUnTk' target='_blank' className='text-[#FFDD00]'>UltraShop</a></p>
            <h2 className='text-[#FFDD00] text-[30px] font-semibold mt-[40px] text-center'>Q: How do I upload video or profile picture when I invest or open a campaign?</h2>    
            <p className='text-[#FFFFFF] text-[18px] font-semibold my-[30px] text-center'>A: To upload a video or profile picture when you invest or open a campaign, you can use IPFS of <a href='https://www.thirdweb.com' target='_blank' className='text-[#FFDD00]'>ThirdWeb</a> Or <a href='https://www.pinata.cloud' target='_blank' className='text-[#FFDD00]'>Pinata.cloud</a>. You can upload your video or picture to the IPFS network and then paste the hash into the appropriate field on our platform. If you need help with this process, you can contact our support team for assistance.<p className='text-red-500'>Do not add ipfs:// at the Begining!</p> only the CID itself</p>   
        </div>
        <div className='flex justify-center mb-[40px]'>
        <button className='border-[1px] border-[#FFDD00] text-[#FFFFFF] py-[10px] px-[15px] rounded-[9px] m-auto' onClick={handleContactAbout}>Contact Us</button>
        </div>
        </div>
    </>
  )
}

export default About