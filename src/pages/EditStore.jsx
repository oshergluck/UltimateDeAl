import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStateContext } from '../context';
import { CustomButton, FormField, Loader } from '../components';

const EditStore = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { editStoreDetails, storeRegistery } = useStateContext();
  const [form, setForm] = useState({
    _urlPath: '',
    _smartContractAddress: '',
    _picture: '',
    _name: '',
    _description: '',
    _category: '',
    _contactInfo: '',
    _storeOwner: '',
    _city: ''
  });

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  const fetchStore = async (urlPath) => {
    try {
      const data = await storeRegistery.call('getStoreByURLPath', [urlPath]);
      const data2 = await storeRegistery.call('getStoreVotingSystem',[urlPath]);
      
      // Update all fields at once with a single setForm call
      setForm(prevForm => ({
        ...prevForm,
        _category: data.category,
        _smartContractAddress: data.smartContractAddress,
        _picture: data.picture,
        _name: data.name,
        _description: data.description,
        _contactInfo: data.contactInfo,
        _storeOwner: data2.storeOwner,
        _city: data2.city
      }));
    } catch (error) {
      console.error('Error fetching store:', error);
      alert('Error fetching store details. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (await editStoreDetails({ ...form })) {
      setIsLoading(false);
      navigate('/');
    } else {
      alert('Provide all the fields correctly.');
      setIsLoading(false);
    }
  };

  return (
    <div className="linear-gradient rounded-[15px] flex justify-center items-center flex-col sm:p-10 p-2 mt-[50px]">
      {isLoading && <Loader />}
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] rounded-[2px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white drop-shadow-md">Edit Store</h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full mt-[30px] flex flex-col gap-[30px]">
        <div className="flex flex-wrap gap-[40px]">
          <FormField
            labelName="URL Path *"
            placeholder="Your exact subdomain"
            inputType="text"
            value={form._urlPath}
            handleChange={(e) => handleFormFieldChange('_urlPath', e)}
          />
        </div>
        <button 
          type="button" 
          onClick={() => fetchStore(form._urlPath)} 
          className='text-[#000000] mx-auto w-3/12 font-bold rounded-[10px] bg-yellow-500 p-2'
        >
          Load
        </button>
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
          labelName="Logo (CID from IPFS) *"
          placeholder="Logo CID"
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
          labelName="Email *"
          placeholder="Email"
          inputType="text"
          value={form._contactInfo}
          handleChange={(e) => handleFormFieldChange('_contactInfo', e)}
        />

        <div className="flex justify-center items-center mt-[10px]">
          <CustomButton
            btnType="submit"
            title="Edit Store"
            styles="bg-[#00FFFF] text-[#000000] font-epilogue font-semibold text-[16px] py-[15px] px-[40px] rounded-[5px] transition-colors duration-300 ease-in-out mt-[20px]"
          />
        </div>
      </form>
    </div>
  );
};

export default EditStore;