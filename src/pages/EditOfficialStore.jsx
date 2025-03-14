import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStateContext } from '../context';
import { CustomButton, FormField, Loader } from '../components';

const EditOfficialStore = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { editOfficialStoreDetails } = useStateContext();
  const [form, setForm] = useState({
    _urlPath: '',
    _smartContractAddress: '',
    _picture: '',
    _name: '',
    _description: '',
    _category: '',
    _contactInfo: '',
    _storeOwner: '',
    _city: '',
    voting: '',
    ercultra: ''
  });

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
      await editOfficialStoreDetails({ ...form })
      setIsLoading(false);
  };

  return (
    <div className="linear-gradient rounded-[15px] flex justify-center items-center flex-col sm:p-10 p-2 mt-[50px]">
      {isLoading && <Loader />}
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] rounded-[2px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white drop-shadow-md">Edit Official Store</h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full mt-[30px] flex flex-col gap-[30px]">
        <div className="flex flex-wrap gap-[40px]">
          <FormField
            labelName="URL Path *"
            placeholder="Only write the subdomain you want!"
            inputType="text"
            value={form._urlPath}
            handleChange={(e) => handleFormFieldChange('_urlPath', e)}
          />
          <FormField
            labelName="Store Contract*"
            placeholder="Address"
            inputType="text"
            value={form._smartContractAddress}
            handleChange={(e) => handleFormFieldChange('_smartContractAddress', e)}
          />
        </div>

        <FormField
          labelName="Banner (CID from IPFS) *"
          placeholder="Banner CID"
          inputType="text"
          value={form._picture}
          handleChange={(e) => handleFormFieldChange('_picture', e)}
        />
        <FormField
          labelName="Store Name *"
          placeholder="Store Name"
          inputType="text"
          value={form._name}
          handleChange={(e) => handleFormFieldChange('_name', e)}
        />
        <FormField
          labelName="Description *"
          placeholder="Description"
          isTextArea
          value={form._description}
          handleChange={(e) => handleFormFieldChange('_description', e)}
        />
        <FormField
          labelName="Category *"
          placeholder="Category"
          inputType="text"
          value={form._category}
          handleChange={(e) => handleFormFieldChange('_category', e)}
        />
        <FormField
          labelName="Contact Info *"
          placeholder="Contact Info"
          isTextArea
          value={form._contactInfo}
          handleChange={(e) => handleFormFieldChange('_contactInfo', e)}
        />
        <FormField
          labelName="Store Owner *"
          placeholder="Store Owner Address"
          inputType="text"
          value={form._storeOwner}
          handleChange={(e) => handleFormFieldChange('_storeOwner', e)}
        />
        <FormField
          labelName="City"
          placeholder="City"
          inputType="text"
          value={form._city}
          handleChange={(e) => handleFormFieldChange('_city', e)}
        />
        <FormField
          labelName="Voting System Address *"
          placeholder="Address"
          inputType="text"
          value={form.voting}
          handleChange={(e) => handleFormFieldChange('voting', e)}
        />
        <FormField
          labelName="ERCUltra Address *"
          placeholder="Address"
          inputType="text"
          value={form.ercultra}
          handleChange={(e) => handleFormFieldChange('ercultra', e)}
        />

        <div className="flex justify-center items-center mt-[10px]">
          <CustomButton
            btnType="submit"
            title="Set Official Store"
            styles="bg-[#00FFFF] text-[#000000] font-epilogue font-semibold text-[16px] py-[15px] px-[40px] rounded-[5px] transition-colors duration-300 ease-in-out mt-[20px]"
          />
        </div>
      </form>
    </div>
  );
};

export default EditOfficialStore;