import React, { useState, useEffect,useCallback } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';
import { Loader } from './';
import { v4 as uuidv4 } from "uuid";
import {CampaignCard} from './';
import {loader} from '../assets';

const Search = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [Fcampaigns, setFeaturedCampaigns] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);  
  const { term } = useParams();
  const { address, CrowdFunding, getSearchedCampaigns ,setTerm, LoadMoreCampaigns} = useStateContext();
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(7);
  const [Address, setAddress] = useState();
  
  const handleNavigate = (campaign) => {
    navigate(`/campaign-details/${campaign.parsedCampaign.pId}`, { state: campaign });
  };

const updateIndex = () => {
  setStartIndex(endIndex + 1);
  setEndIndex(endIndex + 8);
};


useEffect(() => {
  setAddress(address);
  setTerm(term);
}, [term]);

const fetchFilteredCampaigns = useCallback(async () => {
  setIsLoading(true);
  try {
    const data = await getSearchedCampaigns(term, startIndex, endIndex);
    setCampaigns(data);
  } catch (error) {
    console.error("Error fetching filtered campaigns:", error);
  }
  setIsLoading(false);
}, [term, startIndex, endIndex, getSearchedCampaigns]);

const fetchCampaigns = useCallback(async () => {
  setIsLoading(true);
  const data = await LoadMoreCampaigns();
  setFeaturedCampaigns(data);
  setIsLoading(false);
}, [LoadMoreCampaigns]);


useEffect(() => {
  if (CrowdFunding) {
    fetchCampaigns();
    fetchFilteredCampaigns();
  }
}, [address, CrowdFunding, term, fetchCampaigns, fetchFilteredCampaigns]);


const handleLoadMore = () => {
  updateIndex();
  fetchFilteredCampaigns();
};

  if(isLoading) {
    return (
      <>{loader && <Loader />}
      </>);
  }

  
  return (
    <>
    
    {campaigns.length > 0 ? (
  <div> 
    <h1 className="font-epilogue font-semibold text-[18px] text-white text-left mt-[45px]">
        Showing results for: {term}
      </h1>
  <div>
  <ul className='mt-[25px]'>
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
    <button className={`bg-[#00FFFF] text-[#000000] font-semibold text-[16px] py-[15px] px-[40px] rounded-[5px] transition-opacity duration-300 ease-in-out mt-[50px] ${campaigns.length <= startIndex ? 'hidden' : 'opacity-70 hover:opacity-100'}`} onClick={handleLoadMore}>
      Load More
    </button>
  </div>
</div>
</div>
) : (
  <p className='font-epilogue font-semibold text-[18px] text-white text-left mt-[45px]'>No campaigns found for the search term '{term}'.</p>
)}
    </>
  );
};

export default Search;