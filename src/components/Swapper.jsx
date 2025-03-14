import React, { useState, useEffect } from 'react';
import { FormField, Loader } from '../components';
import { getContract, createThirdwebClient, readContract, prepareContractCall } from 'thirdweb';
import { useContract } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { useStateContext } from '../context';
import { loader } from '../assets';
import { TransactionButton, useSendTransaction } from 'thirdweb/react';

const TokenSelectPopup = ({ onSelect, onClose, SYMBOL, ERCULTRA }) => {
  const [customAddress, setCustomAddress] = useState('');
  const [selectedToken, setSelectedToken] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  const tokens = [
    { symbol: 'USDT', address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2' },
    { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
    { symbol: SYMBOL, address: ERCULTRA },
    { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006' },
  ];

  const handleSelect = () => {
    if (selectedToken === 'custom' && customAddress) {
      // Check if custom address is not in the token list
      const isKnownToken = tokens.some(token => 
        token.address.toLowerCase() === customAddress.toLowerCase()
      );
      
      if (!isKnownToken) {
        setShowWarning(true);
        return;
      }
    }
    
    proceedWithSelection();
  };

  const proceedWithSelection = () => {
    if (selectedToken === 'custom' && customAddress) {
      onSelect(customAddress);
    } else if (selectedToken) {
      onSelect(selectedToken);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="linear-gradient1 rounded-lg p-6 w-full max-w-md relative">
        {/* Warning Popup */}
        {showWarning && (
          <div className="absolute inset-0 bg-black bg-opacity-85 flex items-center justify-center rounded-lg">
            <div className="text-center p-4">
              <h3 className="text-xl font-bold text-red-500 mb-4">⚠️ Warning</h3>
              <p className="text-gray-200 mb-6">
                This token is not in our verified list. 
                <br />
                We strongly recommend against using unverified tokens as they may be unsafe.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowWarning(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={proceedWithSelection}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  Proceed Anyway
                </button>
              </div>
            </div>
          </div>
        )}

        <h3 className="text-xl font-bold text-white mb-4">Select Token</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {tokens.map(token => (
            <button
              key={token.symbol}
              onClick={() => setSelectedToken(token.address)}
              className={`p-3 rounded-lg ${
                selectedToken === token.address 
                  ? 'bg-cyan-600' 
                  : 'bg-gray-700'
              } text-white hover:bg-cyan-500 transition-colors text-center font-bold`}
            >
              {token.symbol}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter custom token address"
            value={customAddress}
            onChange={(e) => {
              setCustomAddress(e.target.value);
              setSelectedToken('custom');
            }}
            className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-cyan-500 focus:outline-none"
          />
          <p className="text-sm text-gray-400 mt-1">
            Use custom tokens at your own risk
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
};

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
    const [showTokenPopup, setShowTokenPopup] = useState(false);
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

    const isETH = form.sellToken === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

    const handleFormFieldChange = (fieldName, e) => {
        const value = e.target.value;
        if (value.toString().length <= 8) {
            setForm({ ...form, [fieldName]: value });
        }
    };

    const swapTokens = () => {
        setForm(prev => ({
            ...prev,
            sellToken: prev.buyToken,
            buyToken: prev.sellToken,
        }));
    };

    const getDisplayToken = (address) => {
        if (address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') return 'ETH';
        if (address === USDTAddress) return 'USDT';
        if (address === '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913') return 'USDC';
        if (address === ERCUltraAddress) return SYMBOL;
        return address === form.sellToken ? SYMBA : SYMBA2;
    };

    const handleTokenSelect = (address) => {
        setForm(prev => {
          if (address === prev.buyToken) {
            // Swap tokens if selected sellToken matches current buyToken
            return {
              ...prev,
              sellToken: prev.buyToken,
              buyToken: prev.sellToken,
            };
          }
          return { ...prev, sellToken: address };
        });
        setShowTokenPopup(false);
      };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Get symbols
                const sellSymbol = isETH ? 'ETH' : await SELLTOKENCONTRACT.call('symbol');
                const buySymbol = await BUYTOKENCONTRACT.call('symbol');
                setSYMBA(sellSymbol);
                setSYMBA2(buySymbol);

                // Get decimals
                const sellDecimals = isETH ? 18 : await readContract({ contract: SELL, method: "function decimals() returns (uint8)" });
                const buyDecimals = await BUYTOKENCONTRACT.call('decimals');
                setDecimals(sellDecimals);
                setBuyDecimals(buyDecimals);

                // Get balance
                if(address) {
                    if(isETH) {
                        // Fetch ETH balance
                        const provider = new ethers.providers.JsonRpcProvider(POLYRPC);
                        const balance = await provider.getBalance(address);
                        setTheBalance(ethers.utils.formatUnits(balance, 18));
                    } else {
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
                }

                // Get price quote
                if (form.sellAmount > 0) {
                    const amountInWei = ethers.utils.parseUnits(form.sellAmount, sellDecimals);
                    try {
                        const [amountOut] = await readContract({
                            contract: SWAP_CONTRACT,
                            method: "function getOptimalAmountOut(address,address,uint256) returns (uint256, address[])",
                            params: [form.sellToken, form.buyToken, amountInWei]
                        });
                        if(amountOut) {
                            const data = ethers.utils.formatUnits(amountOut, buyDecimals);
                            setBuyAmount(data);
                        }
                        else {
                            setBuyAmount(0);
                        }
                    }
                    catch(error) {
                        console.log(error);
                        setBuyAmount(0);
                    }
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
        
    }, [form.sellAmount, address, BUYTOKENCONTRACT, SELLTOKENCONTRACT, isETH]);

    return (
        <div className='rounded-[15px] mx-auto sm:w-8/12 my-[20px]'>
            {isLoading && <Loader />}
            {showTokenPopup && (
                <TokenSelectPopup 
                    onSelect={handleTokenSelect}
                    onClose={() => setShowTokenPopup(false)}
                    SYMBOL={SYMBOL}
                    ERCULTRA={ERCUltraAddress}
                />
            )}
            <p className='text-[22px] font-bold text-gray-200 text-center mb-[40px]'>Buy Or Sell {SYMBOL}</p>
            <div className='sm:flex'>
                <div className='mx-[15px] mb-[5px] flex-1'>
                    <label className="block text-white text-[22px] font-medium mb-2 ml-[-20px]">Sell</label>
                    <div
                        onClick={() => setShowTokenPopup(true)}
                        className="w-full p-[15px] linear-gradient1 rounded-lg text-white cursor-pointer opacity-[100%] hover:opacity-[80%] transition-colors border-[1px] border-gray-600"
                    >
                        {getDisplayToken(form.sellToken)}
                    </div>
                </div>
                <FormField
                    labelName="Amount"
                    inputType="number"
                    maxLength={6}
                    value={form.sellAmount}
                    handleChange={(e) => handleFormFieldChange('sellAmount', e)}
                    style={`mx-[15px] my-[5px] ${form.sellAmount > theBalance && !isETH ? 'bg-red-500' : ''}`}
                />
            </div>
                <span className='text-white cursor-pointer' onClick={() => setForm({ ...form, sellAmount: String(theBalance).substring(0,8) })}>
                    Balance: {theBalance}
                </span>

            <div className="flex justify-center my-[25px]">
                <button onClick={swapTokens} className="flex items-center opacity-[75%] hover:opacity-[100%] duration-500 ease-in-out bg-cyan-500 text-white p-2 rounded-full">
                    {loading ? (
                        <img src={loader} className='w-[32px] h-[32px] mx-auto'/>
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
                {Number(form.sellAmount) > 0 && address && (
                    <>  
                        {!isETH && Number(form.sellAmount) <= theBalance && (
                            <TransactionButton
                                transaction={async() => {
                                    const tx = prepareContractCall({
                                        contract: SELL,
                                        method: "function approve(address,uint256) returns (bool)",
                                        params: [SWAP_CONTRACT_ADDRESS, ethers.utils.parseUnits(form.sellAmount, decimals)],
                                    });
                                    return tx;
                                }}
                                className={`!bg-cyan-400 !text-black ${Number(allowance) >= ethers.utils.parseUnits(form.sellAmount, decimals) ? '!hidden' : ''}`}
                            >
                                Approve
                            </TransactionButton>
                        )}
                        
                        <TransactionButton
                            transaction={async() => {
                                const amountInWei = ethers.utils.parseUnits(form.sellAmount, decimals);
                                const [amountOut] = await readContract({
                                    contract: SWAP_CONTRACT,
                                    method: "function getOptimalAmountOut(address,address,uint256) returns (uint256, address[])",
                                    params: [form.sellToken, form.buyToken, amountInWei]
                                });

                                const minAmountOut = Math.floor(Number(amountOut) * 99 / 100);
                                const deadline = Math.floor(Date.now() / 1000) + 600;

                                if (isETH) {
                                    return prepareContractCall({
                                        contract: SWAP_CONTRACT,
                                        method: "function swapExactETHForTokens(address,uint256,address,uint256)",
                                        params: [
                                            form.buyToken,
                                            minAmountOut,
                                            address,
                                            deadline
                                        ],
                                        value: amountInWei
                                    });
                                } else {
                                    return prepareContractCall({
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
                                }
                            }}
                            className={`!bg-cyan-400 !text-black ${
                                (!isETH && (Number(allowance) < ethers.utils.parseUnits(form.sellAmount, decimals) || 
                                form.sellAmount > theBalance)) ? '!hidden' : ''
                            }`}
                        >
                            {isETH ? 'Swap ETH' : 'Swap'}
                        </TransactionButton>
                    </>
                )}
                {!isETH && Number(form.sellAmount) > theBalance && (
                    <p className='text-[16px] text-red-500 font-bold'>Balance Is Not Enough</p>
                )}
            </div>
        </div>
    );
};

export default Swapper;