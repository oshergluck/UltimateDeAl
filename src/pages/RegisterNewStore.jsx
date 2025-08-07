import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { createThirdwebClient, prepareContractCall, getContract } from "thirdweb";
import { useSendTransaction, TransactionButton } from 'thirdweb/react';
import { useStateContext } from '../context';
import { CustomButton, FormField, Loader } from '../components';

const RegisterNewStore = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [pop, setPopUp] = useState(false);
  const [pass, setPass] = useState('');
  const { addStoreDetails, Stores, DEVS, address, getPass } = useStateContext();
  const [form, setForm] = useState({
    _urlPath: '',
    _smartContractAddress: '',
    _picture: '',
    _isPromoted: false,
    _name: '',
    _description: '',
    _category: '',
    _contactInfo: '',
    _storeOwner: '',
    _receiptId: '',
    _city: '',
    voting: '',
    ercultra: '',
  });

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  const PasswordPopup = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl transform transition-all">
        <div className="p-6 sm:p-10 relative">
          <button
            onClick={() => setPopUp(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
          
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="flex justify-center">
              <div className="bg-red-100 p-3 rounded-full">
                <svg 
                  className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
            </div>
  
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Admin Password Generated
            </h2>
            {pass ? (<>
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
              <span className="font-mono text-lg sm:text-xl text-blue-600 break-all overflow-x-auto">
                {pass}
              </span>
            </div>
            </>):(<>
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
              <span className="font-mono text-lg sm:text-xl text-blue-600 break-all overflow-x-auto">
                Kindly Wait...
              </span>
            </div>
            </>)}
            
  
            <div className="space-y-2 sm:space-y-3">
              <p className="text-red-600 font-semibold text-sm sm:text-base">
                ⚠️ This password will only be shown once!
              </p>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Please save this password securely. For security reasons, we cannot recover 
                or resend this password. If you encounter any issues, contact our support team at
              </p>
              <a 
                href="mailto:support@ultrashop.tech" 
                className="inline-block text-blue-600 hover:text-blue-800 text-sm sm:text-base font-medium transition-colors"
              >
                support@ultrashop.tech
              </a>
            </div>
  
            <button
              onClick={() => setPopUp(false)}
              className="w-full sm:w-auto mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-8 rounded-lg 
                       transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 focus:ring-offset-2"
            >
              Confirm & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="linear-gradient rounded-[15px] flex justify-center items-center flex-col sm:p-10 p-2 mt-[50px]">
      {isLoading && <Loader />}
      <h1 className="text-center font-epilogue font-bold sm:text-[25px] text-[25px] leading-[38px] text-white drop-shadow-md mt-[25px]">
        Register New Business
      </h1>

      {address ? (
        <div className="w-full mt-[30px] flex flex-col gap-[30px]">
          <div className="flex flex-wrap gap-[40px]">
            <FormField
              labelName="ESH Token Address"
              placeholder="Address Cannot be Changed"
              inputType="text"
              value={form.ercultra}
              handleChange={(e) => handleFormFieldChange('ercultra', e)}
            />
            <FormField
              labelName="URL Path *"
              placeholder="Subdomain you want, cannot be changed!"
              inputType="text"
              value={form._urlPath}
              handleChange={(e) => handleFormFieldChange('_urlPath', e)}
            />
            <FormField
              labelName="Store Contract *"
              placeholder="Address Cannot Be Changed"
              inputType="text"
              value={form._smartContractAddress}
              handleChange={(e) => handleFormFieldChange('_smartContractAddress', e)}
            />
          </div>

          <FormField
            labelName="Logo (CID from IPFS) *"
            placeholder="CID"
            inputType="text"
            value={form._picture}
            handleChange={(e) => handleFormFieldChange('_picture', e)}
          />
          <FormField
            labelName="Store Name *"
            placeholder="Name"
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
            labelName="Email For Notifications*"
            placeholder="SuperMan@email.com"
            inputType="text"
            value={form._contactInfo}
            handleChange={(e) => handleFormFieldChange('_contactInfo', e)}
          />
          <FormField
            labelName="Invoice Number*"
            placeholder="Number"
            inputType="number"
            value={form._receiptId}
            handleChange={(e) => handleFormFieldChange('_receiptId', e)}
          />
          <FormField
            labelName="MetaVerse City"
            placeholder="Name"
            inputType="text"
            value={form._city}
            handleChange={(e) => handleFormFieldChange('_city', e)}
          />
          <FormField
            labelName="Voting System"
            placeholder="Address Cannot Be Changed"
            inputType="text"
            value={form.voting}
            handleChange={(e) => handleFormFieldChange('voting', e)}
          />

          <div className="flex justify-center items-center mt-[10px]">
            <TransactionButton
              className={`mb-[20px] !bg-cyan-400 !mt-[30px] hover:bg-orange-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out`}
              transaction={async () => {
                const tx = prepareContractCall({
                  contract: Stores,
                  method: "function registerStore(string _urlPath, address _smartContractAddress, string _picture, string _name, string _description, string _category, string _contactInfo, uint256 _receiptId, string _city, address _votingSystemAddress, address _ERCUltra)",
                  params: [form._urlPath, form._smartContractAddress, form._picture, form._name, form._description, form._category, form._contactInfo, Number(form._receiptId)+1, form._city, form.voting, form.ercultra],
                });
                return tx;
              }}
              onTransactionSent={(result) => {
                console.log("Transaction submitted", result.transactionHash);
              }}
              onTransactionConfirmed={async (receipt) => {
                console.log("Transaction confirmed", receipt.transactionHash);
                const pineappleexpress = await getPass(form._smartContractAddress);
                await setPass(pineappleexpress);
                setPopUp(true);
              }}
              onError={(error) => {
                console.error("Transaction error", error);
              }}
            >
              Register New Shop
            </TransactionButton>
          </div>
        </div>
      ) : (
        <p className='text-orange-500 text-center text-[22px] font-bold'>Kindly Login</p>
      )}

      {pop && <PasswordPopup />}
    </div>
  );
};

export default RegisterNewStore;