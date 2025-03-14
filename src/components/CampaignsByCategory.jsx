
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CampaignCard from './CampaignCard';

const CampaignsByCategory = ({ userAddress }) => {
    const [campaigns, setCampaigns] = useState({});
    const [loading, setLoading] = useState(false);

    // Function to fetch and categorize campaigns
    const fetchAndCategorizeCampaigns = async () => {
        setLoading(true);
        let categorizedCampaigns = {};
        const fetchedCampaigns = await LoadMoreUserCampaigns( 0, 30); // Adjust indices as needed

        // Categorize campaigns
        fetchedCampaigns.forEach(({ parsedCampaign }) => {
            const { typeOfCampaign } = parsedCampaign.campaign;
            if (!categorizedCampaigns[typeOfCampaign]) {
                categorizedCampaigns[typeOfCampaign] = [];
            }
            categorizedCampaigns[typeOfCampaign].push(parsedCampaign);
        });

        setCampaigns(categorizedCampaigns);
        setLoading(false);
    };

    useEffect(() => {
        fetchAndCategorizeCampaigns();
    }, [userAddress]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className='m-auto'>
            {Object.entries(campaigns).map(([typeOfCampaign, campaigns]) => (
                <div key={uuidv4()} className='mb-4'>
                    <h2 className='text-lg font-bold'>{typeOfCampaign}</h2>
                    <ul className='flex flex-wrap gap-[20px] overflow-auto touch-auto'>
                        {campaigns.map((campaign, index) => (
                            <li key={uuidv4()}>
                                <CampaignCard
                                    campaign={campaign.campaign}
                                    handleClick={() => {}}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default CampaignsByCategory;