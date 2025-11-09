import React, { useState } from 'react';
import { TransactionButton, useActiveAccount, useActiveWallet } from 'thirdweb/react';
import { deployPublishedContract } from 'thirdweb/deploys';
import { createThirdwebClient } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { useStateContext } from '../context';

// Initialize thirdweb client


export default function ContractDeployForm() {
    const {address} = useStateContext();
  const [contractId, setContractId] = useState('');
  const [param1, setParam1] = useState('');
  const [param2, setParam2] = useState('');
  const [publisher, setPublisher] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState('');
  const [error, setError] = useState('');

  const account = useActiveAccount();
  const wallet = useActiveWallet();

  // Define chain (you can change this to your desired chain)
  const chain = defineChain(8453); // Ethereum mainnet

  const handleDeploy = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!contractId || !param1 || !param2) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsDeploying(true);
      setError('');
      setDeployedAddress('');

      const addressOfContract = await deployPublishedContract({
        address:address,
        chain:chain,
        account:address,
        contractId: 'ESH',
        contractParams: {
          param1: param1,
          param2: param2, // Try to parse as number, fallback to string
        },
        publisher: publisher || undefined, // Optional publisher
      });

      setDeployedAddress(addressOfContract);
    } catch (err) {
      setError(err.message || 'Failed to deploy contract');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Deploy Published Contract</h2>
      
      <div className="space-y-4 mb-6">
        {/* Contract ID Input */}


        {/* Parameter 1 Input */}
        <div>
          <label htmlFor="param1" className="block text-sm font-medium text-gray-700 mb-2">
            Parameter 1 *
          </label>
          <input
            type="text"
            id="param1"
            value={param1}
            onChange={(e) => setParam1(e.target.value)}
            placeholder="Enter parameter 1 value"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Parameter 2 Input */}
        <div>
          <label htmlFor="param2" className="block text-sm font-medium text-gray-700 mb-2">
            Parameter 2 *
          </label>
          <input
            type="text"
            id="param2"
            value={param2}
            onChange={(e) => setParam2(e.target.value)}
            placeholder="Enter parameter 2 value (number or string)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Publisher Input (Optional) */}
        <div>
          <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-2">
            Publisher Address (Optional)
          </label>
          <input
            type="text"
            id="publisher"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            placeholder="0x... (optional, defaults to thirdweb deployer)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Transaction Button */}
      <TransactionButton
        transaction={() => handleDeploy()}
        onTransactionSent={(result) => {
          console.log('Transaction sent:', result);
        }}
        onTransactionConfirmed={(receipt) => {
          console.log('Transaction confirmed:', receipt);
        }}
        onError={(error) => {
          setError(error.message);
        }}
        disabled={!address ||isDeploying}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
      >
        {isDeploying ? 'Deploying Contract...' : 'Deploy Contract'}
      </TransactionButton>

      {/* Status Messages */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      {deployedAddress && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          <strong>Success!</strong> Contract deployed at address: 
          <br />
          <code className="break-all bg-green-200 px-2 py-1 rounded mt-2 inline-block">
            {deployedAddress}
          </code>
        </div>
      )}

      {/* Connection Status */}
      {!account && (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
          Please connect your wallet to deploy contracts.
        </div>
      )}

      {account && (
        <div className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md">
          Connected: {account.address}
        </div>
      )}
    </div>
  );
}