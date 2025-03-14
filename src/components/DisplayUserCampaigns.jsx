import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import { CampaignCard, Loader } from './'; // Ensure these components are correctly imported
import { useStateContext } from '../context';
import {useAddress} from '@thirdweb-dev/react'
import {BlockMiner} from '../components'

const DisplayUserCampaigns = ({ isLoading }) => {
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();
  const [loadIndex, setLoadIndex] = useState(0);
  const [loading, setLoading] = useState(isLoading); // Initially set to isLoading prop
  const { CrowdFunding, LoadMoreUserCampaigns ,address} = useStateContext();
  const [Address,setAddress] = useState();
  
  useEffect(() => {
    
    if (CrowdFunding&&address) { // Ensure both CrowdFunding and address are available
      const loadInitialCampaigns = async () => {
        setLoading(true); // Show loader while loading
        const newCampaigns = await LoadMoreUserCampaigns(address, 1, 8);
        setCampaigns(newCampaigns);
        setLoadIndex(8); // Set the next start index to 8 after the initial load
        setLoading(false);
        setAddress(address);// Hide loader after loading
      };
      loadInitialCampaigns();
    }
  }, [ CrowdFunding,address]); // Depend on address and CrowdFunding to re-run effect
  
  const handleLoadMore = async () => {
    setLoading(true); // Show loader while loading
    const newCampaigns = await LoadMoreUserCampaigns(address, loadIndex, loadIndex + 7);
    setCampaigns(prevCampaigns => [...prevCampaigns, ...newCampaigns]);
    setLoadIndex(prevLoadIndex => prevLoadIndex + 8);
    setLoading(false); // Hide loader after loading
  };

  const handleNavigate = (campaign) => {
    navigate(`/campaign-details/${campaign.parsedCampaign.pId}`, { state: campaign });
  };

  if (!campaigns.length) { // Check if there are no campaigns
    return (
      <div className='mt-[30px] ml-[20px]'>
        <h3 className='text-white font-semibold text-[16px]'>No campaigns available</h3>
      </div>
    ); // Or a placeholder message/component
  }

  return (
    <div>
      {loading && <Loader />}
      <ul className='m-auto flex flex-wrap gap-[20px] mt-[20px]'>
        {campaigns.map((camp, index) => (
          <li key={uuidv4()}> {/* Use uuidv4 for key to avoid duplication issues */}
            <CampaignCard
              campaign={camp}
              handleClick={() => handleNavigate(camp,index)}
              Address={Address}
            />
          </li>
        ))}
      </ul>
      <div className='flex justify-center items-center'>
        <button className={`bg-transparent border-[1px] border-[#FFFFFF] text-[#FFFFFF] font-semibold text-[16px] py-[10px] px-[30px] rounded-[5px] transition-opacity duration-300 ease-in-out mt-[35px] ${campaigns.length <= loadIndex ? 'hidden' : 'opacity-70 hover:opacity-100'}`} onClick={() => handleLoadMore}>
        Show Me More
        </button>
      </div>
    </div>
  );
};
export default DisplayUserCampaigns;
