import React, { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Featured from '../components/Featured';

import { useStateContext } from '../context';
import { moneyForm } from '../assets';
import { FormField, Loader} from '../components';
import { PinataSDK } from "pinata";
const EditCampaign = () => {
  const pinata = new PinataSDK({
    pinataJwt: import.meta.env.VITE_PINATA_JWT,
    pinataGateway: "bronze-sticky-guanaco-654.mypinata.cloud",
  });
    const navigate = useNavigate();
    const now = new Date();
    const [campaignId,setCampaignId] = useState();
    const isValidCID = (hash) => {
        // This is a basic regex pattern for CID validation. Consider using libraries for thorough validation.
        const pattern = /^[a-zA-Z0-9]{46}$/;
        return pattern.test(hash);
      };
      const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lastDesc,setLastDesc] = useState('')
    const { editCampaign, getThisCampaign,CrowdFunding } = useStateContext();
    const [form, setForm] = useState({
      title: '',
      description: '', 
      videoLinkFromPinata: '',
      profileImageLinkFromPinata: '',
    });
    const handleVideoUpload = async (file) => {
      if (!file) return;
      
      setIsUploadingVideo(true);
      setVideoUploadProgress(0);
      setSelectedVideoFile(file);
  
      try {
        const upload = await pinata.upload.file(file, {
          onProgress: (progress) => {
            const percent = Math.round((progress.bytes / progress.totalBytes) * 100);
            setVideoUploadProgress(percent);
          }
        });
        
        setForm({ ...form, videoLinkFromPinata: upload.IpfsHash });
        console.log('Video uploaded to IPFS:', upload.IpfsHash);
      } catch (error) {
        console.error('Error uploading video:', error);
        alert('Failed to upload video. Please try again.');
      } finally {
        setIsUploadingVideo(false);
        setVideoUploadProgress(0);
      }
    };
  
    // Upload image to IPFS
    const handleImageUpload = async (file) => {
      if (!file) return;
      
      setIsUploadingImage(true);
      setImageUploadProgress(0);
      setSelectedImageFile(file);
  
      try {
        const upload = await pinata.upload.file(file, {
          onProgress: (progress) => {
            const percent = Math.round((progress.bytes / progress.totalBytes) * 100);
            setImageUploadProgress(percent);
          }
        });
        
        setForm({ ...form, profileImageLinkFromPinata: upload.IpfsHash });
        console.log('Image uploaded to IPFS:', upload.IpfsHash);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setIsUploadingImage(false);
        setImageUploadProgress(0);
      }
    };
  
    // Upload animation component
    const UploadAnimation = ({ progress, isUploading, file, type }) => (
      <div className="mb-4 p-4 border border-gray-600 rounded-lg bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium">
            {type === 'video' ? 'Video' : 'Image'} Upload
          </span>
          {isUploading && (
            <span className="text-yellow-400 text-sm">
              Uploading... {progress}%
            </span>
          )}
          {!isUploading && form[type === 'video' ? 'videoLinkFromPinata' : 'profileImageLinkFromPinata'] && (
            <span className="text-green-400 text-sm">✓ Uploaded</span>
          )}
        </div>
        
        {file && (
          <div className="text-gray-300 text-sm mb-2">
            File: {file.name}
          </div>
        )}
        
        {isUploading && (
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        
        {!isUploading && form[type === 'video' ? 'videoLinkFromPinata' : 'profileImageLinkFromPinata'] && (
          <div className="text-green-400 text-sm break-all">
            CID: {form[type === 'video' ? 'videoLinkFromPinata' : 'profileImageLinkFromPinata']}
          </div>
        )}
      </div>
    );
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
                    <label className="font-epilogue font-medium text-[20px] leading-[22px] text-[#FFFFFF] mb-[10px] block">
                Upload Campaign Video*
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleVideoUpload(e.target.files[0])}
                className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isUploadingVideo}
              />
              <UploadAnimation 
                progress={videoUploadProgress}
                isUploading={isUploadingVideo}
                file={selectedVideoFile}
                type="video"
              />

            <div className='mb-[35px]'>
              <label className="font-epilogue font-medium text-[20px] leading-[22px] text-[#FFFFFF] mb-[10px] block">
                Upload Campaign Image (1:1 Ratio)*
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isUploadingImage}
              />
              <UploadAnimation 
                progress={imageUploadProgress}
                isUploading={isUploadingImage}
                file={selectedImageFile}
                type="image"
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