import React, { useState, useEffect } from 'react';

import { DisplayAllCampaigns,CustomDropdown,FeaturedMobile,Featured } from '../components';
import { useStateContext } from '../context';
import { useMediaQuery } from 'react-responsive';

const AllCampaigns = () => {
  
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const campaignCategories = [
    "All",
    "Startup Funding",
    "Small Business Support",
    "Women in Business",
    "Youth Entrepreneurship",
    "Social Entrepreneurship",
    "Tech Innovations for Good",
    "Creative Arts Ventures",
    "Disaster Relief",
    "Emergency Medical Aid",
    "Refugee Support",
    "Environmental Crisis Response",
    "Agriculture and Farming",
    "Token Launch",
    "Blockchain Development",
    "Decentralized Finance (DeFi)",
    "Crypto Education and Training",
    "Cryptocurrency Mining",
    "Wallet and Security Solutions",
    "Blockchain Gaming",
    "Regulatory and Legal Projects",
    "Global Health Initiatives",
    "Education for All",
    "Clean Water and Sanitation",
    "Hunger and Food Security"
  ];
    const { CrowdFunding } = useStateContext();
    const [selectedCategory, setSelectedCategory] = useState('');
    useEffect(() => {
      window.scrollTo(0,0);
    }, []);


    

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
  };

  const handleSelection = (selectedCategory) => {
    setSelectedCategory(selectedCategory);
  };

  return (<>
  <div className='linear-gradient pb-[20px]'>
          <div className="mx-auto">
        {isMobile ? <FeaturedMobile /> : <Featured/>}
        </div>
        </div>
    <div className='text-[#FFFFFF] text-[25px] font-semibold my-[30px]'>All Campaigns
    </div>
    <CustomDropdown categories={campaignCategories} onSelect={handleSelection} />
        <DisplayAllCampaigns
        selectedCategory = {selectedCategory} 
        />
       
    </>
  )
}

export default AllCampaigns