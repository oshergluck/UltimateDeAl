import React, { useState, useEffect } from "react";
import { logoOfWebsiteCoin,ESH ,logoOfWebsite,usdcoinusdclogo} from "./assets";
import { Route, Routes,useParams,useLocation } from 'react-router-dom';
import "./styles/Home.css";
import {Header,BackgroundMusic,Footer, Loader,AccessibilityMenu,Search,HeaderMobile,FooterMobile ,SearchEngine} from './components';
import { useStateContext } from './context';
import {ListingInfo,Swapper,QuantumBusinessInterface,EditStore,City,Extra, CreateCampaign,Profile,CampaignDetails,AllCampaigns,EditCampaign,News, VIPRegister,Admin,ClientAdminPage,About,Terms,PrivacyPolicy,Post,NewPost,EditPost,StorePage,RegisterNewStore,SetOfficialStore,EditOfficialStore,Home,Product,TokenDistributorPage, LuckMachine, ESHVoting} from './pages';
import { useMediaQuery } from 'react-responsive';


export default function App() {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { term } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [Total, setTotal] = useState('');
  const {getTotal,CrowdFunding,address,refreshPage} = useStateContext();
  const fetchTotal = async () => {
    setIsLoading(true);
    const data = await getTotal();
    setIsLoading(false);
    setTotal(data*1e-6.toFixed(2));
    return data;
  }

  const formatNumberWithCommas = (number) => {
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTotal = async () => {
      try {
        setIsLoading(true);
        const data = await getTotal();
        const formattedTotal = formatNumberWithCommas(data*1e-6);
        setTotal(formattedTotal);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
  
    if (CrowdFunding) {
      fetchTotal();
    }
  }, [CrowdFunding]); // Executes the effect when `DEVS` changes


  return (
    <>
    {isLoading && <Loader />}
    <div className="min-h-screen w-full bg-black linear-gradient1 bg-center bg-no-repeat ">
    {isMobile ? 
    <HeaderMobile
    />
     : 
    <Header
     />}
     
    <div className={`mx-auto min-h-[1400px] sm:mt-[50px] mt-[75px]`}>
    <div className="mb-[25px] pt-[20px] mt-[10px]">
    <button 
        onClick={() => refreshPage()}
        className="rounded-[4px]"
        style={{
          backgroundColor: '#ffDD00',
          width: '25px',
          height: '25px',
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          zIndex: 1000,
          rounded: '5px'
        }}
      >R
        </button>
        
        </div>
        {Total ? (isMobile ? (<>
        <h3 className='text-center text-white font-bold sm:text-5xl text-2xl drop-shadow-md'>UltimateDeAl RAISED</h3>
        <h3 className='text-center font-bold sm:text-5xl text-2xl !text-[#4287f5]'>{Total}</h3>
        <img src={usdcoinusdclogo} className='h-[35px] w-[35px] mx-auto text-center text-[#FFDD00] font-bold text-2xl sm:text-5xl'/><h3 className='text-center text-white font-bold text-2xl sm:text-5xl'>UNTIL NOW</h3>
        </>):(<div className="flex justify-center gap-3 mb-[25px]">
        <span className='ml-[10px] text-center text-white font-bold sm:text-5xl text-2xl drop-shadow-md'>Ultimate</span><span  className='ml-[-10px] text-center !text-[#FFDD00] font-bold sm:text-5xl text-2xl drop-shadow-md'>DeAl </span><span  className='text-center text-white font-bold sm:text-5xl text-2xl drop-shadow-md'>RAISED</span>
        <h3 className='text-center font-bold sm:text-5xl text-2xl !text-[#4287f5]'>{Total}</h3>
        <br/>
        <img src={usdcoinusdclogo} className='h-[35px] w-[35px] mt-[10px] text-center text-[#FFDD00] font-bold text-2xl sm:text-5xl'/><h3 className='text-center text-white font-bold text-2xl sm:text-5xl'>UNTIL NOW</h3>
        </div>)):(<></>)}
        <Routes>
          <Route path="/fight" element={<QuantumBusinessInterface />}/>
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/create-campaign" element={<CreateCampaign />} />
          <Route path="/my-campaigns" element={<Profile />} />
          <Route path="/campaign-details/:id" element={<CampaignDetails />} />
          <Route path="/all-campaigns" element={<AllCampaigns />} />
          <Route path="/blog" element={<News />} />
          <Route path="/edit-campaign/:id" element={<EditCampaign />} />
          <Route path="/post/:id" element={<Post />} />
          <Route path="/search/:term" element={<Search key={term} />} />
          <Route path="/register-vip" element={<VIPRegister />} />
          <Route path="/" element={<Home />} />
          <Route path="/super-admin" element={<Admin />} />
          <Route path="/dashboard" element={<ClientAdminPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/shop/:storepath/voting" element={<ESHVoting />} />
          <Route path="/newpost" element={<NewPost />} />
          <Route path="/edit-post" element={<EditPost />} />
          <Route path="/shop/:storepath" element={<StorePage/>}/>
          <Route path="/register-new-store" element={<RegisterNewStore/>}/>
          <Route path="/set-official-store" element={<SetOfficialStore/>}/>
          <Route path="/edit-official-store" element={<EditOfficialStore/>}/>
          <Route path="/edit-store" element={<EditStore/>}/>
          <Route path="/shop/:storepath/products/:productBarCode" element={<Product/>}/>
          <Route path="/shop/:storepath/products/:productBarCode/extra" element={<Extra/>}/>
          <Route path ="/distributer" element ={<TokenDistributorPage/>}/>
          <Route path ="/bonus" element ={<LuckMachine/>}/>
          <Route path ="/city/:cityofuser" element ={<City/>}/>
          <Route path ="/ListingInfo" element ={<ListingInfo/>}/>
        </Routes>
    </div>
    <AccessibilityMenu />
    {isMobile? <FooterMobile/> : <Footer />}
    
    </div>
    </>
  );
}
