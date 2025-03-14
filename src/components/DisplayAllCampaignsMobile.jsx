import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import { CampaignCard, Loader } from './'; // Ensure these components are correctly imported
import { useStateContext } from '../context';
import {useAddress} from '@thirdweb-dev/react'

const DisplayAllCampaignsMobile = ({ isLoading,selectedCategory }) => {
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();
  const [loadIndex, setLoadIndex] = useState(0);
  const [loading, setLoading] = useState(isLoading); // Initially set to isLoading prop
  const { CrowdFunding, LoadMoreCampaigns ,address} = useStateContext();
  const [Address,setAddress] = useState();
  const [filtered, setFiltered] = useState([]);
  
  const filterCampaignsByCategory = async (campaigns, category) => {
    let filtered = campaigns;
    if (category && category !== 'All Campaigns' && category !== 'All') {
      filtered = campaigns.filter(campaign => campaign.parsedCampaign.category === category);
    }
    return filtered.sort((a, b) => b.totalDonations - a.totalDonations); // Sorting logic
  };

  
  
  useEffect(() => {
    if (CrowdFunding) {
      async function fetchTotalDonations () {
        const data = await getDonations(campaign.parsedCampaign.pId);
        if(data)
         setTotal(HexToInteger(data.totalDonations._hex));
       }
      const loadAndFilterCampaigns = async (selectedCategory) => {
        setLoading(true);
        const newCampaigns = await LoadMoreCampaigns(1, 12);
        setCampaigns(newCampaigns);
        const CampaignshaByhCategory = await filterCampaignsByCategorys(newCampaigns, selectedCategory);
        setLoadIndex(8);
        setLoading(false);
  
        // Immediately filter campaigns after setting them
        filterCampaignsByCategory(newCampaigns, selectedCategory).then(setFiltered);
      };
      loadAndFilterCampaigns(selectedCategory);
      fetchTotalDonations();
    }
  }, [CrowdFunding,selectedCategory]); // Include selectedCategory in the dependency array
  
  
  // Separate useEffect for handling filtering whenever campaigns or selectedCategory changes
  useEffect(() => {
    const filterAndUpdate = async () => {
      const filteredCampaigns = await filterCampaignsByCategory(campaigns, selectedCategory);
      setFiltered(filteredCampaigns);
    };
  
    filterAndUpdate();
  }, [selectedCategory]);


  const handleLoadMore = async () => {
    setLoading(true);
    const newCampaigns = await LoadMoreCampaigns(loadIndex, loadIndex + 11);
    setCampaigns(prevCampaigns => {
      const updatedCampaigns = [...prevCampaigns, ...newCampaigns];
      filterCampaignsByCategory(updatedCampaigns, selectedCategory).then(setFiltered);
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
      {filtered.length> 0  ? (<ul className='m-auto flex flex-wrap gap-[20px]'>
        {filtered.map((camp, index) => (
          <li key={uuidv4()}> {/* Use uuidv4 for key to avoid duplication issues */}
            <CampaignCard
              campaign={camp}
              handleClick={() => handleNavigate(camp,index)}
              Address={Address}
            />
          </li>
        ))}
      </ul>):(<></>)}
      
      <div className='flex justify-center items-center'>
        <button className={`bg-transparent border-[1px] border-[#FFFFFF] text-[#FFFFFF] font-semibold text-[16px] py-[15px] px-[40px] rounded-[5px] transition-opacity duration-300 ease-in-out mt-[50px] ${filtered?.length <= loadIndex ? 'hidden' : 'opacity-70 hover:opacity-100'}`} onClick={handleLoadMore}>
        Load More
        </button>
      </div>
    </div>
  );
};
export default DisplayAllCampaignsMobile;
