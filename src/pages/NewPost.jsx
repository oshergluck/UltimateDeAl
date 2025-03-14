import React, { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

import { useStateContext } from '../context';
import { CustomButton, FormField, Loader } from '../components';
import { TransactionButton } from 'thirdweb/react';
import {prepareContractCall} from 'thirdweb';

const isValidCID = (hash) => {
  // This is a basic regex pattern for CID validation. Consider using libraries for thorough validation.
  const pattern = /^[a-zA-Z0-9]{46}$/;
  return pattern.test(hash);
};



const NewPost = () => {

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const { createPost,Blog,getCampaigns,Blog1 } = useStateContext();
  const [form, setForm] = useState({
    Category: '',
    title: '',
    summary: '',
    paragraph1: '', 
    paragraph2: '',
    Image1LinkFromPinata: '',
    Image2LinkFromPinata: '',
    Image3LinkFromPinata: '',
    Writer: '',
  });

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getCampaigns();
    setCampaigns(data);
    setIsLoading(false);
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    if(Blog){
      fetchCampaigns();
    }
  }, [Blog]);

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isValidCID(form.Image1LinkFromPinata) && isValidCID(form.Image2LinkFromPinata) && isValidCID(form.Image3LinkFromPinata)) {
        setIsLoading(true);
    } 
    else {
      alert('Provide a valid hash from IPFS and fill all the fields.');
    }
}

  return (
    <>
    <div className="linear-gradient rounded-[15px] flex justify-center items-center flex-col sm:p-10 p-2 mt-[50px]">
      {isLoading && <Loader />}
        <>
        <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] rounded-[2px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white drop-shadow-md">Create Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full mt-[30px] flex flex-col gap-[30px]">
        <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName="Category *"
            placeholder="Category"
            inputType="text"
            value={form.Category}
            handleChange={(e) => handleFormFieldChange('Category', e)}
          />
          <FormField 
            labelName="Post Title *"
            placeholder="Write a title"
            inputType="text"
            value={form.title}
            handleChange={(e) => handleFormFieldChange('title', e)}
          />
        </div>

        <FormField 
            labelName="Summary *"
            placeholder="Summary"
            isTextArea
            value={form.summary}
            handleChange={(e) => handleFormFieldChange('summary', e)}
          />
          <FormField 
            labelName="Paragraph 1 *"
            placeholder="First Paragraph"
            isTextArea
            value={form.paragraph1}
            handleChange={(e) => handleFormFieldChange('paragraph1', e)}
          />
          <FormField 
            labelName="Paragraph 2 *"
            placeholder="Second Paragraph"
            isTextArea
            value={form.paragraph2}
            handleChange={(e) => handleFormFieldChange('paragraph2', e)}
          />
        <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName={`First Image (IPFS)*`}
            placeholder="Paste the CID/hash of the first Image from IPFS"
            inputType="text"
            value={form.Image1LinkFromPinata}
            handleChange={(e) => handleFormFieldChange('Image1LinkFromPinata', e)}
          />
          </div>
          <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName={`Second Image (IPFS)*`}
            placeholder="Paste the CID/hash of the second Image from IPFS"
            inputType="text"
            value={form.Image2LinkFromPinata}
            handleChange={(e) => handleFormFieldChange('Image2LinkFromPinata', e)}
          />
          </div>
          <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName={`Third Image (IPFS)*`}
            placeholder="Paste the CID/hash of the third Image from IPFS"
            inputType="text"
            value={form.Image3LinkFromPinata}
            handleChange={(e) => handleFormFieldChange('Image3LinkFromPinata', e)}
          />
          </div>
          <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName={`Writer*`}
            placeholder="Writer Name"
            inputType="text"
            value={form.Writer}
            handleChange={(e) => handleFormFieldChange('Writer', e)}
          />
          </div>
          <div className="flex justify-center items-center mt-[10px]">
            <TransactionButton
                    className={"!mb-[15px] !bg-cyan-400 !hover:bg-orange-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out"}
                    transaction={() => {
                      // Create a transaction object and return it
                      const tx = prepareContractCall({
                        contract:Blog1,
                        method: "function postBlog(string memory category, string memory headline,string memory summary,string memory text1, string memory text2,string memory imageUrl1, string memory imageUrl2, string memory imageUrl3, string memory writerName)",
                        params: [form.Category,form.title,form.summary,form.paragraph1,form.paragraph2, form.Image1LinkFromPinata,form.Image2LinkFromPinata,form.Image3LinkFromPinata,form.Writer],                  
                        value: 0,
                      });
                      return tx;
                    }}
                    onTransactionSent={(result) => {
                      console.log("Transaction submitted", result.transactionHash);
                    }}
                    onTransactionConfirmed={(receipt) => {
                      console.log("Transaction confirmed", receipt.transactionHash);
                      setIsLoading(false);
                    }}
                    onError={(error) => {
                      console.error("Transaction error", error);
                      setIsLoading(false);
                      alert(error);
                    }}
                  >
                    Submit Post
                  </TransactionButton>
          </div>
      </form>
      </>
    </div>
    </> )
}

export default NewPost