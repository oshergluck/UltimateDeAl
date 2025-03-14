import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import { CampaignCard, Loader } from './';
import { useStateContext } from '../context';
import { useAddress } from '@thirdweb-dev/react';

const DisplayAllCampaigns = ({ isLoading, selectedCategory }) => {
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();
  const [total, setTotal] = useState(null);
  const [loadIndex, setLoadIndex] = useState(0);
  const [loading, setLoading] = useState(isLoading);
  const { CrowdFunding, LoadMoreCampaigns, address } = useStateContext();
  const [Address, setAddress] = useState();
  const [filtered, setFiltered] = useState([]);

  const HexToInteger = (hex) => {
    return parseInt(hex, 16);
  };
  
  const filterCampaignsByCategory = async (campaigns, category) => {
    let filtered = campaigns;
    if (category && category !== 'All Campaigns' && category !== 'All') {
      filtered = campaigns.filter(campaign => campaign.parsedCampaign.category === category);
    }
    
    // Sort by total donations (converting hex to integer for comparison)
    return filtered.sort((a, b) => {
      const donationsA = HexToInteger(b.totalDonations._hex); // Note: b first for descending order
      const donationsB = HexToInteger(a.totalDonations._hex);
      return donationsA - donationsB;
    });
  };
  
  useEffect(() => {
    if (CrowdFunding) {
      const loadAndFilterCampaigns = async (selectedCategory) => {
        setLoading(true);
        const newCampaigns = await LoadMoreCampaigns(1, 12);
        console.log(newCampaigns);
        setCampaigns(newCampaigns);
        setLoadIndex(8);
        setLoading(false);
  
        // Filter and sort campaigns immediately after loading
        const filteredAndSorted = await filterCampaignsByCategory(newCampaigns, selectedCategory);
        setFiltered(filteredAndSorted);
      };
      
      loadAndFilterCampaigns(selectedCategory);
    }
  }, [CrowdFunding, selectedCategory]);
  
  useEffect(() => {
    const filterAndUpdate = async () => {
      const filteredCampaigns = await filterCampaignsByCategory(campaigns, selectedCategory);
      setFiltered(filteredCampaigns);
    };
  
    filterAndUpdate();
  }, [selectedCategory, campaigns]);

  const handleLoadMore = async () => {
    setLoading(true);
    const newCampaigns = await LoadMoreCampaigns(loadIndex, loadIndex + 11);
    setCampaigns(prevCampaigns => {
      const updatedCampaigns = [...prevCampaigns, ...newCampaigns];
      filterCampaignsByCategory(updatedCampaigns, selectedCategory)
        .then(setFiltered);
      return updatedCampaigns;
    });
    setLoadIndex(prevLoadIndex => prevLoadIndex + 8);
    setLoading(false);
  };

  const handleNavigate = (campaign) => {
    navigate(`/campaign-details/${campaign.parsedCampaign.pId}`, { state: campaign });
  };

  return (
    <div>
      {loading && <Loader />}
      {filtered.length > 0 ? (
        <ul className='m-auto flex flex-wrap gap-[20px]'>
          {filtered.map((camp) => (
            <li key={uuidv4()}>
              <CampaignCard
                campaign={camp}
                handleClick={() => handleNavigate(camp)}
                Address={Address}
              />
            </li>
          ))}
        </ul>
      ) : (
        <></>
      )}
      
      <div className='flex justify-center items-center'>
        <button 
          className={`bg-transparent border-[1px] border-[#FFFFFF] text-[#FFFFFF] font-semibold text-[16px] py-[15px] px-[40px] rounded-[5px] transition-opacity duration-300 ease-in-out mt-[50px] ${
            filtered?.length <= loadIndex ? 'hidden' : 'opacity-70 hover:opacity-100'
          }`} 
          onClick={handleLoadMore}
        >
          Load More
        </button>
      </div>
    </div>
  );
};

export default DisplayAllCampaigns;