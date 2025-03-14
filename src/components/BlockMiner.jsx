import React, { useState } from 'react';
import { ethers } from 'ethers';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { useStateContext } from '../context';
const CONTRACT_ADDRESS = '0x1C36c734e8bc153fafe1aa950107a24b0DBf7A63';

const BlockMiner = () => {
const { Blockchain,address,TrueBlockchain} = useStateContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);
  const [blocksToMine, setBlocksToMine] = useState(777); // Default to 255 blocks
  const [isValidator,setIsValidator] = useState(false);
  
  
  const handleBlocksChange = (e) => {
    setBlocksToMine(parseInt(e.target.value, 10));
  };

  const mineBlocks = async () => {
    setLoading(true);
    setError(null);
    setTransactionHash(null);
  
    try {
     const validatorStatus = await TrueBlockchain.call("isValidator",[address]);
     setIsValidator(validatorStatus);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const sdk = new ThirdwebSDK(signer);
      const contract = await sdk.getContract(CONTRACT_ADDRESS);
  
      // Create an array of multicall data
      const multicallData = [];
      for (let i = 0; i < blocksToMine; i++) {
        const data = contract.encoder.encode("mineBlock", ["Mine Blocks For Confirmation"]);
        multicallData.push(data);
      }
  
      // Execute multicall
      // Pass multicallData as a single array argument
      const tx = await contract.call("multicall", [multicallData]);
      const receipt = await tx;
      setTransactionHash(receipt.transactionHash);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Mine Blocks</h1>
      <label htmlFor="blocks">Number of Blocks to Mine:</label>
      <input
        type="number"
        id="blocks"
        name="blocks"
        value={blocksToMine}
        onChange={(e) => handleBlocksChange()}
        min={1}
        max={1000} // Example maximum number of blocks user can choose
        disabled={loading}
        className="w-full py-2 px-4 rounded-md mb-2"
      />
      <button
        onClick={mineBlocks}
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md transition duration-300 ${
          isValidator 
            ? 'bg-green-500 text-white hover:bg-green-600' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {loading ? "Mining..." : "Run Confirmation"}
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {transactionHash && (
        <p>Transaction Hash: <a href={`https://polygonscan.com/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">{transactionHash}</a></p>
      )}
    </div>
  );
};

export default BlockMiner;
