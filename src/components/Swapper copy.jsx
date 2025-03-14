import React, { useState, useEffect } from 'react';
import { FormField, Loader } from '../components';
import { getContract, createThirdwebClient, readContract, prepareContractCall } from 'thirdweb';
import { useContract } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { useStateContext } from '../context';
import { loader } from '../assets';
import { TransactionButton,useSendTransaction } from 'thirdweb/react';
import { Base } from "@thirdweb-dev/chains";

const Swapper = ({ address, ERCUltraAddress, SYMBOL }) => {
    const client = createThirdwebClient({ clientId: import.meta.env.VITE_THIRDWEB_CLIENT });
    const [loading, setLoading] = useState(false);
    const [theBalance, setTheBalance] = useState(0);
    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const [buyAmount, setBuyAmount] = useState(ethers.BigNumber.from(0));
    const [decimals, setDecimals] = useState(18);
    const [buyDecimals, setBuyDecimals] = useState(18);
    const [allowance, setAllowance] = useState(0);
    const [SYMBA, setSYMBA] = useState(0);
    const [SYMBA2, setSYMBA2] = useState(0);
    const [approved,setApproved] = useState(false);
    const [sellA, setSellA] = useState(ethers.BigNumber.from(0));
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        sellToken: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
        buyToken: ERCUltraAddress,
        sellAmount: '',
    });
    const [secondsLeft, setSecondsLeft] = useState(10);

    const SWAP_CONTRACT_ADDRESS = '0xCA9B5F1b64A230c789F62aF8A0c253f00998f20F';
    const USDTAddress = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2';
    const { contract: SELLTOKENCONTRACT } = useContract(form.sellToken);
    const { contract: BUYTOKENCONTRACT } = useContract(form.buyToken);
    const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
    const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`;

    const SELL = getContract({
        client: client,
        chain: { id: 8453, rpc: POLYRPC },
        address: form.sellToken,
    });

    const SWAP_CONTRACT = getContract({
        client: client,
        chain: { id: 8453, rpc: POLYRPC },
        address: SWAP_CONTRACT_ADDRESS,
    });

    const handleFormFieldChange = (fieldName, e) => {
        setForm({ ...form, [fieldName]: e.target.value });
    };

    const swapTokens = () => {
        setForm(prev => ({
            ...prev,
            sellToken: prev.buyToken,
            buyToken: prev.sellToken,
        }));
    };

    const getDisplayToken = (address) => {
        if (address === USDTAddress) return 'USDT';
        if (address === ERCUltraAddress) return SYMBOL;
        return address === form.sellToken ? SYMBA : SYMBA2;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Get symbols
                const sellSymbol = await SELLTOKENCONTRACT.call('symbol');
                const buySymbol = await BUYTOKENCONTRACT.call('symbol');
                setSYMBA(sellSymbol);
                setSYMBA2(buySymbol);

                // Get decimals
                const sellDecimals = await readContract({ contract: SELL, method: "function decimals() returns (uint8)" });
                const buyDecimals = await BUYTOKENCONTRACT.call('decimals');
                setDecimals(sellDecimals);
                setBuyDecimals(buyDecimals);

                // Get balance
                if(address) {
                    const balance = await readContract({ 
                        contract: SELL, 
                        method: "function balanceOf(address) returns (uint256)", 
                        params: [address] 
                    });
                    setTheBalance(ethers.utils.formatUnits(balance, sellDecimals));
    
                    // Get allowance
                    const allowance = await readContract({
                        contract: SELL,
                        method: "function allowance(address, address) returns (uint256)",
                        params: [address, SWAP_CONTRACT_ADDRESS]
                    });
                    setAllowance(allowance);
                }

                // Get price quote
                if (form.sellAmount > 0) {
                    const amountInWei = ethers.utils.parseUnits(form.sellAmount, sellDecimals);
                    const [amountOut] = await readContract({
                        contract: SWAP_CONTRACT,
                        method: "function getOptimalAmountOut(address,address,uint256) returns (uint256, address[])",
                        params: [form.sellToken, form.buyToken, amountInWei]
                    });
                    console.log(amountOut);
                    const data = ethers.utils.formatUnits(amountOut, buyDecimals);
                    setBuyAmount(data);
                }

                setIsUpdating(form.sellAmount > 0);
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        const intervalId = setInterval(fetchData, 10000);
        const countdownId = setInterval(() => setSecondsLeft(prev => prev > 0 ? prev - 1 : 10), 1000);

        if (form.sellToken && form.buyToken) fetchData();

        return () => {
            clearInterval(intervalId);
            clearInterval(countdownId);
        };
        
    }, [form, address]);

    const runSwap = async () => {
        if (!address) return alert('Must be connected');
        
        try {
            setIsLoading(true);
            const amountInWei = ethers.utils.parseUnits(form.sellAmount, decimals);
            
            // Get current price quote
            const [amountOut] = await readContract({
                contract: SWAP_CONTRACT,
                method: "function getOptimalAmountOut(address,address,uint256) returns (uint256, address[])",
                params: [form.sellToken, form.buyToken, amountInWei]
            });

            // Apply 1% slippage
            const minAmountOut = Number(amountOut)*99/100;
            const deadline = Math.floor(Date.now() / 1000) + 600; // 10 minutes

            // Prepare transaction
            const tx = prepareContractCall({
                contract: SWAP_CONTRACT,
                method: "function swapExactTokensForTokens(address,address,uint256,uint256,address,uint256)",
                params: [
                    form.sellToken,
                    form.buyToken,
                    amountInWei,
                    minAmountOut,
                    address,
                    deadline
                ]
            });
            sendTransaction(tx);
            
        } catch (error) {
            console.error("Swap error:", error);
            alert(`Swap failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {isLoading && <Loader />}
            
            <div className='sm:flex'>
                <FormField
                    labelName="Sell"
                    value={getDisplayToken(form.sellToken)}
                    handleChange={(e) => handleFormFieldChange('sellToken', e)}
                    style='mx-[15px] my-[5px]'
                />
                <FormField
                    labelName="Amount"
                    inputType="number"
                    value={form.sellAmount}
                    handleChange={(e) => handleFormFieldChange('sellAmount', e)}
                    style={`mx-[15px] my-[5px] ${form.sellAmount > theBalance ? 'bg-red-500' : ''}`}
                />
            </div>
            <span className='text-white cursor-pointer' onClick={() => setForm({ ...form, sellAmount: theBalance })}>
                Balance: {theBalance}
            </span>

            <div className="flex justify-center my-[25px]">
                <button onClick={swapTokens} className="flex items-center opacity-75 hover:opacity-100 transition-opacity bg-cyan-500 text-white p-2 rounded-full">
                    {loading ? (
                        <img src={loader} className='w-8 h-8' alt="Loading..." />
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </>
                    )}
                </button>
            </div>

            <div className='sm:flex mt-[15px] mb-[8px]'>
                <FormField
                    labelName="Buy"
                    value={getDisplayToken(form.buyToken)}
                    style='mx-[15px] my-[5px] cursor-not-allowed'
                    readOnly
                />
                <FormField
                    labelName="Amount"
                    value={buyAmount}
                    style='mx-[15px] my-[5px] cursor-not-allowed'
                    readOnly
                />
            </div>

            {isUpdating && (
                <div className="my-4">
                    <p className="text-lg text-white">Next update in: {secondsLeft} seconds</p>
                </div>
            )}

            <div>
                {form.sellAmount > 0 && address && (
                    <>  
                        <TransactionButton
                            transaction={async() => {
                                const tx = prepareContractCall({
                                    contract: SELL,
                                    method: "function approve(address,uint256) returns (bool)",
                                    params: [SWAP_CONTRACT_ADDRESS, (form.sellAmount+1)*10**decimals],
                                    vaule : 0
                                });
                                return tx;
                            }}
                            onTransactionSent={(result) => {
                            console.log("Transaction submitted", result.transactionHash);
                            }}
                            onTransactionConfirmed={async(receipt) => {
                            
                            console.log("Transaction confirmed", receipt.transactionHash);
                            }}
                            onError={(error) => {
                            console.error("Transaction error", error);
                            }}
                            className={`!bg-cyan-400 !text-black !mr-4 ${Number(allowance)>=form.sellAmount*10**decimals ? ('!hidden'):('!block')}`}
                        >
                            Approve
                        </TransactionButton>
                        <TransactionButton
                            transaction={async() => {
                                const amountInWei = ethers.utils.parseUnits(form.sellAmount, decimals);
            
                                // Get current price quote
                                const [amountOut] = await readContract({
                                    contract: SWAP_CONTRACT,
                                    method: "function getOptimalAmountOut(address,address,uint256) returns (uint256, address[])",
                                    params: [form.sellToken, form.buyToken, amountInWei]
                                });

                                // Apply 1% slippage
                                const minAmountOut = Math.floor(Number(amountOut)*99/100);
                                const deadline = Math.floor(Date.now() / 1000) + 600; // 10 minutes

                                // Prepare transaction
                                const tx = prepareContractCall({
                                    contract: SWAP_CONTRACT,
                                    method: "function swapExactTokensForTokens(address,address,uint256,uint256,address,uint256)",
                                    params: [
                                        form.sellToken,
                                        form.buyToken,
                                        amountInWei,
                                        minAmountOut,
                                        address,
                                        deadline
                                    ]
                                });
                                return tx;
                            }}
                            onTransactionSent={(result) => {
                            console.log("Transaction submitted", result.transactionHash);
                            }}
                            onTransactionConfirmed={async(receipt) => {
                            console.log("Transaction confirmed", receipt.transactionHash);
                            }}
                            onError={(error) => {
                            console.error("Transaction error", error);
                            }}
                            className={`!bg-cyan-400 !text-black !mr-4 ${Number(allowance)>=form.sellAmount*10**decimals ? ('!block'):('!hidden')}`}
                        >
                            Swap
                        </TransactionButton>
                    </>
                )}
            </div>
        </div>
    );
};

export default Swapper;