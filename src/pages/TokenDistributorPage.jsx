import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import { useNavigate } from 'react-router-dom';
import { CustomButton, Loader } from '../components';
import { ethers } from 'ethers';
import { useContract, useContractRead } from '@thirdweb-dev/react';
import { createThirdwebClient, prepareContractCall,getContract } from "thirdweb";
import { useSendTransaction,TransactionButton } from 'thirdweb/react';
import { Polygon } from "@thirdweb-dev/chains";

const TokenDistributorPage = () => {
    const navigate = useNavigate();
    const client = createThirdwebClient({clientId: import.meta.env.VITE_THIRDWEB_CLIENT});
    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const POLYRPC = `https://8453.rpc.thirdweb.com/${import.meta.env.VITE_THIRDWEB_CLIENT}`;

    const [isLoading, setIsLoading] = useState(false);
    const [distributionId, setDistributionId] = useState('');
    const [paymentToken, setPaymentToken] = useState('');
    const [yourShare, setYourShare] = useState('');
    const [amount, setAmount] = useState('');
    const [batchSize, setBatchSize] = useState('');
    const [maxCalls, setMaxCalls] = useState('');

    const { address } = useStateContext();
    const contractAddress = import.meta.env.VITE_DIVIDENDS_DISTRIBUTOR;

    const { contract } = useContract(contractAddress);
    const { data: contractCreator } = useContractRead(contract, "contractCreator");
    const distributorContract = getContract({
        client: client,
        chain: {
            id: 8453,
            rpc: POLYRPC,
        },
        address: contractAddress,
    });
    const paymentContract = getContract({
        client: client,
        chain: {
            id: 8453,
            rpc: POLYRPC,
        },
        address: paymentToken,
    });
    const handleCreateDistribution = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Polygon);
            const gasPrice = await provider.getGasPrice();
    
            const transaction = prepareContractCall({
                contract: distributorContract,
                method: "function createDistribution(address paymentToken, address yourShare, uint256 amount)",
                params: [paymentToken, yourShare, ethers.utils.parseEther(amount)],
                value: 0,
                gasPrice: gasPrice,
            });
    
            await sendTransaction(transaction, {
                onSuccess: (result) => {
                    console.log("Distribution created:", result);
                    setIsLoading(false);
                },
                onError: (error) => {
                    console.error('Error creating distribution:', error);
                    setIsLoading(false);
                }
            });
        } catch (error) {
            console.error('Error preparing transaction:', error);
            setIsLoading(false);
        }
    };

    const handleDistributeBatch = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Polygon);
            const gasPrice = await provider.getGasPrice();
    
            const transaction = prepareContractCall({
                contract: distributorContract,
                method: "function distributeBatch(bytes32 distributionId, uint256 batchSize)",
                params: [distributionId, batchSize],
                value: 0,
                gasPrice: gasPrice,
            });
    
            await sendTransaction(transaction, {
                onSuccess: (result) => {
                    console.log("Batch distributed:", result);
                    setIsLoading(false);
                },
                onError: (error) => {
                    console.error('Error distributing batch:', error);
                    setIsLoading(false);
                }
            });
        } catch (error) {
            console.error('Error preparing transaction:', error);
            setIsLoading(false);
        }
    };

    const handleDistributeMulticall = async () => {
        try {
            setIsLoading(true);
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Polygon);
            const gasPrice = await provider.getGasPrice();
    
            const transaction = prepareContractCall({
                contract: distributorContract,
                method: "function distributeMulticall(bytes32 distributionId, uint256 maxCalls)",
                params: [distributionId, maxCalls],
                value: 0,
                gasPrice: gasPrice,
            });
    
            await sendTransaction(transaction, {
                onSuccess: (result) => {
                    console.log("Multicall distribution completed:", result);
                    setIsLoading(false);
                },
                onError: (error) => {
                    console.error('Error in multicall distribution:', error);
                    setIsLoading(false);
                }
            });
        } catch (error) {
            console.error('Error preparing transaction:', error);
            setIsLoading(false);
        }
    };

    const isValidEthereumAddress = (address) => {
        return typeof address === 'string' && 
               address.toLowerCase().startsWith('0x') && 
               address.length === 42;
      };

    return (
        <div className="container linear-gradient1 rounded-[15px] mx-auto p-8 mt-[35px]">
            {isLoading && <Loader />}
            <h1 className="text-center font-bold text-[#ff9900] drop-shadow-md pb-[25px] sm:text-[50px] text-[30px]">Token Distributor</h1>
            <div className="space-y-4 mt-8 mb-[10px]">
                <h2 className="text-2xl text-[#00FFFF]">Create Distribution</h2>
                <input
                    className="w-full p-2 rounded-lg bg-gray-700 text-white"
                    type="text"
                    placeholder="Payment Token Address"
                    value={paymentToken}
                    onChange={(e) => setPaymentToken(e.target.value)}
                />
                <input
                    className="w-full p-2 rounded-lg bg-gray-700 text-white"
                    type="text"
                    placeholder="Your Share Address"
                    value={yourShare}
                    onChange={(e) => setYourShare(e.target.value)}
                />
                <input
                    className="w-full p-2 rounded-lg bg-gray-700 text-white"
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <CustomButton
                btnType="button"
                    title="Prepare distribution"
                    styles="bg-[#1dc071]"
                    handleClick={handleCreateDistribution}
                />
            </div>
            <div className="mt-8 p-4 bg-gray-800 rounded-lg mb-[10px]">
                <h2 className="text-xl font-semibold mb-2 text-white">Important!</h2>
                <h2 className='text-[#00FFFF]'>Must Approve To Continue</h2>
            </div>
            {}
            <TransactionButton
                disabled={!isValidEthereumAddress(paymentToken)}
                className={"!bg-cyan-400 !hover:bg-orange-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out"}
                transaction={() => {
                    // Create a transaction object and return it
                    const tx = prepareContractCall({
                    contract: paymentContract,
                    method: "function approve(address spender, uint256 amount)",
                    params: [contractAddress,ethers.utils.parseEther(amount)],
                    value: 0,
                    });
                    return tx;
                }}
                onTransactionSent={(result) => {
                    console.log("Transaction submitted", result.transactionHash);
                }}
                onTransactionConfirmed={(receipt) => {
                    console.log("Transaction confirmed", receipt.transactionHash);
                }}
                onError={(error) => {
                    console.error("Transaction error", error);
                }}
                >
                Approve Payment
                </TransactionButton>
            <div className="space-y-4 mt-8">
                <h2 className="text-2xl text-[#00FFFF]">Distribute Batch</h2>
                <input
                    className="w-full p-2 rounded-lg bg-gray-700 text-white"
                    type="text"
                    placeholder="Distribution ID"
                    value={distributionId}
                    onChange={(e) => setDistributionId(e.target.value)}
                />
                <input
                    className="w-full p-2 rounded-lg bg-gray-700 text-white"
                    type="number"
                    placeholder="Batch Size"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                />
                <CustomButton
                    btnType="button"
                    title="Distribute Batch"
                    styles="bg-[#1dc071]"
                    handleClick={handleDistributeBatch}
                />
            </div>

            <div className="space-y-4 mt-8">
                <h2 className="text-2xl text-[#00FFFF]">Distribute Multicall</h2>
                <input
                    className="w-full p-2 rounded-lg bg-gray-700 text-white"
                    type="text"
                    placeholder="Distribution ID"
                    value={distributionId}
                    onChange={(e) => setDistributionId(e.target.value)}
                />
                <input
                    className="w-full p-2 rounded-lg bg-gray-700 text-white"
                    type="number"
                    placeholder="Max Calls"
                    value={maxCalls}
                    onChange={(e) => setMaxCalls(e.target.value)}
                />
                <CustomButton
                    btnType="button"
                    title="Distribute Multicall"
                    styles="bg-[#1dc071]"
                    handleClick={handleDistributeMulticall}
                />
            </div>
        </div>
    );
}

export default TokenDistributorPage;