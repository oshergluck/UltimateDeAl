import React, { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Featured from '../components/Featured';

import { useStateContext } from '../context';
import { CustomButton, FormField, Loader } from '../components';
import { render } from 'react-dom';
import { TransactionButton } from 'thirdweb/react';
import { prepareContractCall } from 'thirdweb';

const isValidCID = (hash) => {
  // This is a basic regex pattern for CID validation. Consider using libraries for thorough validation.
  const pattern = /^[a-zA-Z0-9]{46}$/;
  return pattern.test(hash);
}

const EditPost = () => {

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [ID,setID] = useState();
  const { editPost,Blog,getCampaigns,DEVS,Blog1 } = useStateContext();
  const [form, setForm] = useState({
    postId: '',
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
  }, [Blog,DEVS]);



  const handleFormFieldChange = (fieldName, oSHERAmELECH) => {
    setForm({ ...form, [fieldName]: oSHERAmELECH.target.value })
  }
  
  const handleSubmit = async (oSHERAmELECH) => {
    oSHERAmELECH.preventDefault();

    if (isValidCID(form.Image1LinkFromPinata) && isValidCID(form.Image2LinkFromPinata) && isValidCID(form.Image3LinkFromPinata)) {
        setIsLoading(true);
        setIsLoading(false);
    } 
    else {
      alert('Provide a valid hash from Pinata and fill the form.');
      setIsLoading(false);
    }
}

  return (
    <>
    <div className="linear-gradient flex justify-center items-center flex-col rounded-[15px] sm:p-10 p-4 mt-[30px]">
      {isLoading && <Loader />}
        <>
        <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#00FFFF] rounded-[15px] opacity-[80%]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-black drop-shadow-md">Edit Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full mt-[30px] flex flex-col gap-[30px]">
        <div className="flex flex-wrap gap-[40px]">
        <FormField 
            labelName="PostIndex *"
            placeholder="PostIndex"
            inputType="number"
            value={form.postId}
            handleChange={(oSHERAmELECH) =>handleFormFieldChange('postId', oSHERAmELECH)}
          />
                    <FormField 
            labelName="Category *"
            placeholder="Category"
            inputType="text"
            value={form.Category}
            handleChange={(oSHERAmELECH) =>handleFormFieldChange('Category', oSHERAmELECH)}
          />
          <FormField 
            labelName="Post Title *"
            placeholder="Write a title"
            inputType="text"
            value={form.title}
            handleChange={(oSHERAmELECH) => handleFormFieldChange('title', oSHERAmELECH)}
          />
        </div>

        <FormField 
            labelName="Summary *"
            placeholder="Summary"
            isTextArea
            value={form.summary}
            handleChange={(oSHERAmELECH) => handleFormFieldChange('summary', oSHERAmELECH)}
          />
          <FormField 
            labelName="Paragraph 1 *"
            placeholder="First Paragraph"
            isTextArea
            value={form.paragraph1}
            handleChange={(oSHERAmELECH) => handleFormFieldChange('paragraph1', oSHERAmELECH)}
          />
          <FormField 
            labelName="Paragraph 2 *"
            placeholder="Second Paragraph"
            isTextArea
            value={form.paragraph2}
            handleChange={(oSHERAmELECH) => handleFormFieldChange('paragraph2', oSHERAmELECH)}
          />
        <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName={`First Image (IPFS)*`}
            placeholder="Paste the CID/hash of the first Image from IPFS"
            inputType="text"
            value={form.Image1LinkFromPinata}
            handleChange={(oSHERAmELECH) => handleFormFieldChange('Image1LinkFromPinata', oSHERAmELECH)}
          />
          </div>
          <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName={`Second Image (IPFS)*`}
            placeholder="Paste the CID/hash of the second Image from IPFS"
            inputType="text"
            value={form.Image2LinkFromPinata}
            handleChange={(oSHERAmELECH) => handleFormFieldChange('Image2LinkFromPinata', oSHERAmELECH)}
          />
          </div>
          <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName={`Third Image (IPFS)*`}
            placeholder="Paste the CID/hash of the third Image from IPFS"
            inputType="text"
            value={form.Image3LinkFromPinata}
            handleChange={(oSHERAmELECH) => handleFormFieldChange('Image3LinkFromPinata', oSHERAmELECH)}
          />
          </div>
          <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName={`Writer*`}
            placeholder="Writer Name"
            inputType="text"
            value={form.Writer}
            handleChange={(oSHERAmELECH) => handleFormFieldChange('Writer', oSHERAmELECH)}
          />
          </div>
          <div className="flex justify-center items-center mt-[10px]">
          <TransactionButton
                    className={"!mb-[15px] !bg-cyan-400 !hover:bg-orange-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out"}
                    transaction={() => {
                      // Create a transaction object and return it
                      const tx = prepareContractCall({
                        contract:Blog1,
                        method: "function editBlogPost(uint256 postId, string memory newHeadline, string memory newSummary, string memory newText1, string memory newText2, string memory newImageUrls1, string memory newImageUrls2, string memory newImageUrls3, string memory newWriterName)",
                        params: [form.postId,form.title,form.summary,form.paragraph1,form.paragraph2,form.Image1LinkFromPinata,form.Image2LinkFromPinata,form.Image3LinkFromPinata,form.Writer],
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
                    Edit Post
                  </TransactionButton>
          </div>
      </form>
      </>
    </div>
    </> )
}

export default EditPost