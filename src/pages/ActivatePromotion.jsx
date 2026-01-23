import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { prepareContractCall } from "thirdweb";
import { TransactionButton } from 'thirdweb/react';
import { useStateContext } from '../context'; // Adjust path if necessary
import { FormField, Loader } from '../components'; // Adjust path if necessary

const ActivatePromotion = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { Stores, address } = useStateContext();

  const [form, setForm] = useState({
    _urlPath: '',
    _promotionReceiptId: '',
  });

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  return (
    <div className="rounded-[15px] flex justify-center items-center flex-col sm:p-10 p-2 mt-[50px]">
      {isLoading && <Loader />}
      <h1 className="text-center font-epilogue font-bold sm:text-[25px] text-[25px] leading-[38px] text-white drop-shadow-md mt-[25px]">
        Activate Store Promotion
      </h1>

      {address ? (
        <div className="sm:w-7/12 w-full mt-[30px] flex flex-col gap-[30px] sm:border-[1px] sm:border-gray sm:p-20 sm:rounded-[15px]">
          
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-4">
            <p className="text-gray-300 text-sm">
              <span className="font-bold text-yellow-400">Note:</span> You must own a valid "PROS" NFT to activate a promotion. 
              This will boost your store's visibility based on the NFT's expiration date.
            </p>
          </div>

          <div className="flex flex-col gap-[40px]">
            <FormField
              labelName="Store URL Path *"
              placeholder="e.g. myshop (The exact subdomain)"
              inputType="text"
              value={form._urlPath}
              handleChange={(e) => handleFormFieldChange('_urlPath', e)}
            />

            <FormField
              labelName="Promotion NFT Invoice Number *"
              placeholder="Invoice Id"
              inputType="number"
              value={form._promotionReceiptId}
              handleChange={(e) => handleFormFieldChange('_promotionReceiptId', e)}
            />
          </div>

          <div className="flex justify-center items-center mt-[10px]">
            <TransactionButton
              className={`mb-[20px] !bg-cyan-400 !mt-[30px] hover:bg-orange-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out`}
              transaction={async () => {
                // Determine the ID. In your register code you did +1, 
                // typically for existing NFTs you use the exact ID. 
                // Assuming user enters the exact ID seen in their wallet:
                const tokenId = Number(form._promotionReceiptId)+1;
                console.log(tokenId);
                const tx = prepareContractCall({
                  contract: Stores,
                  method: "function activatePromotion(string _urlPath, uint256 _promotionReceiptId)",
                  params: [
                    form._urlPath, 
                    tokenId// Ensure it's sent as a BigInt
                  ],
                });
                return tx;
              }}
              onTransactionSent={(result) => {
                console.log("Transaction submitted", result.transactionHash);
                setIsLoading(true);
              }}
              onTransactionConfirmed={async (receipt) => {
                console.log("Transaction confirmed", receipt.transactionHash);
                setIsLoading(false);
                alert("Promotion Activated Successfully!");
                navigate(`/shop/${form._urlPath}`); // Optional: Redirect to the store
              }}
              onError={(error) => {
                console.error("Transaction error", error);
                setIsLoading(false);
                alert("Transaction failed. Ensure you own the PROS NFT and the Store.");
              }}
            >
              Activate Promotion
            </TransactionButton>
          </div>
        </div>
      ) : (
        <p className='text-orange-500 text-center text-[22px] font-bold'>Kindly Login</p>
      )}
    </div>
  );
};

export default ActivatePromotion;