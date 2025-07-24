import React, { useState, useEffect } from 'react';
import { FormField, Loader } from '../components';
import { getContract, createThirdwebClient, readContract, prepareContractCall } from 'thirdweb';
import { useContract } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { useStateContext } from '../context';
import { loader } from '../assets';
import { TransactionButton } from 'thirdweb/react';
import { Base } from "@thirdweb-dev/chains";

const Swapper2 = ({ address, ERCUltraAddress, SYMBOL }) => {
    const { HexToInteger } = useStateContext();
    const client = createThirdwebClient({ clientId: import.meta.env.VITE_THIRDWEB_CLIENT });
    const [loading, setLoading] = useState(false);
    const [theBalance, setTheBalance] = useState(0);
    const [buyAmount, setBuyAmount] = useState(ethers.BigNumber.from(0));
    const [rs, setRs] = useState({});
    const [decimals, setDecimals] = useState(18);
    const [decimals2, setDecimals2] = useState(18);
    const [allowance, setAllowance] = useState(0);
    const [sellA, setSellA] = useState(ethers.BigNumber.from(0));
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        chainId: '8453',
        sellToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        buyToken: ERCUltraAddress,
        sellAmount: '',
        takerAddress: address
    });
    const [secondsLeft, setSecondsLeft] = useState(10);

    const USDCAddress = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

    const { contract: SELLTOKENCONTRACT } = useContract(form.sellToken);
    const { contract: BUYTOKENCONTRACT } = useContract(form.buyToken);
    const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
    const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`;
    
    const SELL = getContract({
        client: client,
        chain: {
            id: 8453,
            rpc: POLYRPC,
        },
        address: form.sellToken,
    });

    const BUY = getContract({
        client: client,
        chain: {
            id: 8453,
            rpc: POLYRPC,
        },
        address: form.buyToken,
    });

    const PROXY = getContract({
        client: client,
        chain: {
            id: 8453,
            rpc: POLYRPC,
        },
        address: '0xDef1C0ded9bec7F1a1670819833240f027b25EfF',
    });

    const handleFormFieldChange = (fieldName, e) => {
        setForm({ ...form, [fieldName]: e.target.value });
    };

    const isValidEthereumAddress = (address) => {
        return ethers.utils.isAddress(address);
    };

    const swapTokens = () => {
        setForm((prevForm) => ({
            ...prevForm,
            sellToken: prevForm.buyToken,
            buyToken: prevForm.sellToken,
        }));
    };

    const getDisplayToken = (address) => {
        if (address === USDCAddress) return 'USDC';
        if (address === ERCUltraAddress) return SYMBOL;
        return address;
    };

    useEffect(() => {
        const fetchAndSetDecimals = async () => {
            try {
                const data = await readContract({
                    contract: SELL,
                    method: "function decimals() view returns (uint8)",
                    params: []
                });
                setDecimals(data);
                console.log('Sell token decimals:', data);
                
                const data2 = await readContract({
                    contract: BUY,
                    method: "function decimals() view returns (uint8)",
                    params: []
                });
                setDecimals2(data2);
                console.log('Buy token decimals:', data2);
            } catch (error) {
                console.error('Error fetching decimals:', error);
            }
        };

        const fetchAndSetPrice = async () => {
            if (
                form.sellAmount &&
                parseFloat(form.sellAmount) > 0 &&
                isValidEthereumAddress(form.buyToken) &&
                isValidEthereumAddress(form.sellToken) &&
                form.buyToken !== form.sellToken
            ) {
                try {
                    setLoading(true);
                    const newSellA = ethers.utils.parseUnits(form.sellAmount.toString(), decimals);
                    setSellA(newSellA);

                    // Construct URL with proper encoding
                    const params = new URLSearchParams({
                        chainId: '8453',
                        sellToken: form.sellToken,
                        buyToken: form.buyToken,
                        sellAmount: newSellA.toString(),
                        taker: address || form.takerAddress
                    });

                    const url = `https://api.0x.org/swap/permit2/price?${params.toString()}`;
                    console.log('API URL:', url);

                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            '0x-api-key': import.meta.env.VITE_0X_API,
                            '0x-version': 'v2',
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('API Error Response:', errorText);
                        throw new Error(`API Error ${response.status}: ${errorText}`);
                    }

                    const data = await response.json();
                    console.log('Price API Response:', data);
                    setRs(data);
                    setBuyAmount(ethers.BigNumber.from(data.buyAmount || '0'));
                    setLoading(false);
                } catch (error) {
                    console.error('Price fetch error:', error);
                    setLoading(false);
                    setBuyAmount(ethers.BigNumber.from(0));
                }
            } else {
                setBuyAmount(ethers.BigNumber.from(0));
            }
        };

        const checkAllowance = async () => {
            try {
                const data = await readContract({
                    contract: SELL,
                    method: "function allowance(address owner, address spender) view returns (uint256)",
                    params: [address, '0xDef1C0ded9bec7F1a1670819833240f027b25EfF']
                });
                console.log('Allowance:', data);
                setAllowance(data);
            } catch (error) {
                console.error('Error checking allowance:', error);
            }
        };

        const checkBalance = async () => {
            if (SELL && address) {
                try {
                    const data2 = await readContract({
                        contract: SELL,
                        method: "function balanceOf(address account) view returns (uint256)",
                        params: [address]
                    });
                    console.log('Balance:', data2);
                    setTheBalance(Number(data2) / (10 ** decimals));

                    const sellAmountBN = ethers.utils.parseUnits(form.sellAmount || '0', decimals);
                    const balanceBN = ethers.BigNumber.from(data2);
                    setIsUpdating(balanceBN.gte(sellAmountBN) && parseFloat(form.sellAmount || '0') > 0);
                } catch (error) {
                    console.error('Error checking balance:', error);
                }
            }
        };

        const execute = async () => {
            if (!address) return;
            
            await fetchAndSetDecimals();
            await fetchAndSetPrice();
            await checkBalance();
            await checkAllowance();
        };

        if (SELL && BUY && address) {
            execute();
        }

        if (!form.sellAmount || parseFloat(form.sellAmount) <= 0) {
            setIsUpdating(false);
            setBuyAmount(ethers.BigNumber.from(0));
        }

        // Update countdown and execute function
        const intervalId = setInterval(() => {
            if (SELL && BUY && address) {
                execute();
            }
            setSecondsLeft(10);
        }, 10000);

        // Countdown logic
        const countdownId = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 10));
        }, 1000);

        return () => {
            clearInterval(intervalId);
            clearInterval(countdownId);
        };
    }, [form.sellAmount, form.buyToken, form.sellToken, SELLTOKENCONTRACT, BUYTOKENCONTRACT, decimals, decimals2, address]);

    const runSwap = async () => {
        if (!address) {
            alert('Must be connected');
            return;
        }

        try {
            setIsLoading(true);
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const provider = new ethers.providers.Web3Provider(window.ethereum, Base);
            const signer = provider.getSigner(address);
            console.log('Signer:', signer);
            
            const newSellA = ethers.utils.parseUnits(form.sellAmount.toString(), decimals);

            // Construct URL with proper encoding
            const params = new URLSearchParams({
                chainId: '8453',
                sellToken: form.sellToken,
                buyToken: form.buyToken,
                sellAmount: newSellA.toString(),
                takerAddress: address
            });

            const url = `https://api.0x.org/swap/permit2/quote?${params.toString()}`;
            console.log('Quote API URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    '0x-api-key': import.meta.env.VITE_0X_API,
                    '0x-version': 'v2',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Quote API Error Response:', errorText);
                throw new Error(`Quote API Error ${response.status}: ${errorText}`);
            }

            const quote = await response.json();
            console.log('Quote API Response:', quote);

            await signer.sendTransaction({
                gasLimit: quote.gas,
                gasPrice: quote.gasPrice,
                to: quote.to,
                data: quote.data,
                value: quote.value || '0',
                chainId: quote.chainId,
            });
            
            setIsLoading(false);
            alert('Swap successful!');
        } catch (error) {
            setIsLoading(false);
            console.error("Swap error:", error);
            alert(`Swap failed: ${error.message}`);
        }
    };

    return (
        <div>
            {isLoading && <Loader />}
            <div>
                <div className='sm:flex'>
                    <FormField
                        labelName="Sell"
                        placeholder=""
                        inputType="text"
                        value={getDisplayToken(form.sellToken)}
                        style='mx-[15px] my-[5px] cursor-not-allowed'
                        disabled={true}
                    />
                    <FormField
                        labelName="Amount"
                        placeholder="0.0"
                        inputType="number"
                        value={form.sellAmount}
                        handleChange={(e) => handleFormFieldChange('sellAmount', e)}
                        style={`mx-[15px] my-[5px] ${form.sellAmount > theBalance ? 'bg-red-500' : ''}`}
                    />
                </div>
                <span className='text-white cursor-pointer' onClick={() => setForm({ ...form, sellAmount: theBalance.toFixed(4) })}>
                    Balance: {theBalance.toFixed(4)}
                </span>
            </div>

            <div className="flex justify-center my-[25px]">
                <button onClick={swapTokens} className="flex items-center opacity-[75%] hover:opacity-[100%] duration-500 ease-in-out bg-cyan-500 text-white p-2 rounded-full">
                    {loading ? (
                        <div>
                            <img src={loader} className='w-[32px] h-[32px] mx-auto' />
                        </div>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-1">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </>
                    )}
                </button>
            </div>

            <div className='sm:flex mt-[15px] mb-[8px]'>
                <FormField
                    labelName="Buy"
                    placeholder=""
                    inputType="text"
                    value={getDisplayToken(form.buyToken)}
                    style='mx-[15px] my-[5px] cursor-not-allowed'
                    disabled={true}
                />
                <FormField
                    labelName="Amount"
                    placeholder=""
                    inputType="number"
                    value={buyAmount.gt(0) ? ethers.utils.formatUnits(buyAmount, decimals2) : '0'}
                    style='mx-[15px] my-[5px] cursor-not-allowed'
                    disabled={true}
                />
            </div>
            
            {isUpdating && (
                <div className="my-4">
                    <p className="text-lg text-white">Next update in: {secondsLeft} seconds</p>
                </div>
            )}

            <div>
                <br />
                {form.sellAmount && parseFloat(form.sellAmount) > 0 && (theBalance * 10 ** decimals) >= sellA ? (
                    <>
                        <TransactionButton
                            className={"!mb-[15px] !mr-[29px] mt-[10px] !bg-cyan-400 !hover:bg-orange-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out"}
                            transaction={() => {
                                const tx = prepareContractCall({
                                    contract: SELL,
                                    method: "function approve(address spender, uint256 value) returns (bool)",
                                    params: ['0xDef1C0ded9bec7F1a1670819833240f027b25EfF', sellA],
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
                                alert(error);
                            }}
                        >
                            Approve
                        </TransactionButton>
                        <button 
                            className='w-[150px] p-3 bg-cyan-400 rounded-[10px] font-semibold'
                            onClick={() => runSwap()}
                        >
                            Swap
                        </button>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default Swapper2;