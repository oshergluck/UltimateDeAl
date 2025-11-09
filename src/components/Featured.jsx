import React, { useEffect, useState } from 'react';
import { useStateContext } from '../context';
import { useNavigate } from 'react-router-dom';
import { FeaturedCard, Loader } from './';  // Ensure correct import paths
import { v4 as uuidv4 } from "uuid";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Featured = () => {
  const { CrowdFunding, getCampaigns, address , Featured } = useStateContext();
  const [campaigns, setCampaigns] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [Address, setAddress] = useState(address);  // Initialized directly with context value


  useEffect(() => {
     // Destructure featuredCampaigns from context
    const loadInitialCampaigns = async () => {
      if (CrowdFunding) {
        setIsLoading(true);
        const data = await Featured();
        if(data) {
        setCampaigns(data);
        setIsLoading(false);
      }
      }
    
    };
    loadInitialCampaigns();
  }, [CrowdFunding]); // Ensure getCampaigns is stable or this could cause re-renders

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  const navigate = useNavigate();

  if (isLoading) return <Loader />;

  return (
    <div className={`overflow-hidden linear-gradient rounded-[15px] h-[570px] m-auto ${campaigns.length>0 ? ('block'):('hidden')}`}>
      <h1 className='text-[#FFFFFF] text-[25px] font-semibold mt-[30px] mb-[30px] ml-[65px]'>Featured Campaigns</h1>
      {campaigns.length > 0 ? (
        <Slider {...settings}
        >
          {campaigns.map(campaign => (
            <div key={uuidv4()}>
              <FeaturedCard
                campaign={campaign}
                i={uuidv4()}
                handleClick={() => navigate(`/campaign-details/${campaign.pId}`)}
                style='ml-[65px]'
              />
            </div>
          ))}
        </Slider>
      ) : (
        <div className='ml-[45px] font-bold'>No featured campaigns available.</div>
      )}
    </div>
  );
};

export default Featured;
