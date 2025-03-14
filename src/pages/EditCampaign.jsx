import React, { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Featured from '../components/Featured';

import { useStateContext } from '../context';
import { moneyForm } from '../assets';
import { FormField, Loader} from '../components';

const EditCampaign = () => {
    const navigate = useNavigate();
    const now = new Date();
    const [campaignId,setCampaignId] = useState();
    const isValidCID = (hash) => {
        // This is a basic regex pattern for CID validation. Consider using libraries for thorough validation.
        const pattern = /^[a-zA-Z0-9]{46}$/;
        return pattern.test(hash);
      };
    const [isLoading, setIsLoading] = useState(false);
    const [lastDesc,setLastDesc] = useState('')
    const { editCampaign, getThisCampaign,CrowdFunding } = useStateContext();
    const [form, setForm] = useState({
      title: '',
      description: '', 
      videoLinkFromPinata: '',
      profileImageLinkFromPinata: '',
    });
    const handleFormFieldChange = (fieldName, e) => {
        setForm({ ...form, [fieldName]: e.target.value })
      }

      useEffect(() => {
        window.scrollTo(0, 0);
        setCampaignId(parseInt(window.location.pathname.split('/')[2]));
        const fetchCampaignDetails = async (id) => {
          const data = await getThisCampaign(id);
          if(data) {
            setLastDesc(data.description);
            setForm(prevForm => ({
              ...prevForm,
              title: data.title,
              description: '^~*Updated On ' + now.getDate() +'/' + (now.getMonth() + 1) + '/' + now.getFullYear() + '*~^\n',
              videoLinkFromPinata: data.videoLinkFromPinata,
              profileImageLinkFromPinata: data.profilePhoto
            }));
          }
        }
        if(CrowdFunding) {
          fetchCampaignDetails(campaignId);
        }
      }, [CrowdFunding]);

      const submitForm = async () => {
        setIsLoading(true);
        setCampaignId(parseInt(window.location.pathname.split('/')[2]));
        try {
          await editCampaign(campaignId,form.title,(lastDesc+'\n'+form.description),form.videoLinkFromPinata,form.profileImageLinkFromPinata);
          setIsLoading(false);
        } catch (error) {
          alert ('Error editing your campaign, kindly contact support, error: '+error);
          setIsLoading(false);
        }
}


  return (
    
    <div className='linear-gradient rounded-[15px] w-full border-[1px] border-[#242424] mt-[40px]'>
        {isLoading && <Loader />}
        <div className='sm:w-9/12 w-11/12 mx-auto mt-[40px]'>
            <h1 className='text-white font-epilogue sm:text-[50px] text-[25px] font-semibold text-[18px] mb-[20px]'>Edit Your Campaign</h1>
            <div className='mt-[15px]'>
                <div className='sm:w-[49%] w-full my-[35px]'>
                    <FormField
                        labelName="Campaign Title*"
                        placeholder="Campaign Title"
                        inputType="text"
                        value={form.title}
                        handleChange={(e) => handleFormFieldChange('title', e)}
                    />
                </div>
                <div className='mb-[35px]'>
                    <FormField
                    style='bg-[#424242]'
                        labelName="Campaign Description*"
                        placeholder="Campaign Description"
                        inputType="text"
                        isTextArea
                        value={form.description}
                        handleChange={(e) => handleFormFieldChange('description', e)}
                    />
                    </div>
                    <div className='mb-[30px]'>
                    <FormField
                        style='w-full'
                        labelName="Video Hash From IPFS*"
                        placeholder="Video Hash"
                        inputType="text"
                        value={form.videoLinkFromPinata}
                        handleChange={(e) => handleFormFieldChange('videoLinkFromPinata', e)}
                    /> 
                    </div>   
                    <div className='mb-[40px]'>
                    <FormField 
                        labelName="Profile Image Hash From IPFS*"
                        placeholder="Profile Image Hash"
                        inputType="text"
                        value={form.profileImageLinkFromPinata}
                        handleChange={(e) => handleFormFieldChange('profileImageLinkFromPinata', e)}
                    />
                    </div>
                    <div className='sm:flex sm:justify-center mb-[40px]'>
                        <button className={`bg-[#00FFFF] text-[#000000] font-epilogue font-semibold text-[16px] py-[15px] px-[40px] rounded-[5px] transition-colors duration-300 ease-in-out ${!form.profileImageLinkFromPinata || !form.videoLinkFromPinata ||!form.description||!form.title ? 'btn-disabled' : ''}`} onClick={() =>submitForm()}>Submit New Campaign</button>
                        </div>
            </div>
        </div>
    </div>
  )
}

export default EditCampaign