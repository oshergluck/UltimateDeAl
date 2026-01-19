import React, { useState, useEffect } from 'react';
import { FormField, Loader } from '../components';
import { getContract, createThirdwebClient, readContract, prepareContractCall } from 'thirdweb';
import { useContract } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { loader } from '../assets';
import { TransactionButton, useSendTransaction } from 'thirdweb/react';
import { useStateContext } from '../context';

const TokenSelectPopup = ({ onSelect, onClose, SYMBOL, ERCULTRA }) => {
  const [customAddress, setCustomAddress] = useState('');
  const [selectedToken, setSelectedToken] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  const tokens = [
    { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
    { symbol: SYMBOL, address: ERCULTRA },
    { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006' },
  ];

  const handleSelect = () => {
    if (selectedToken === 'custom' && customAddress) {
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
        <div className="grid grid-cols-3 gap-2 mb-4">
          {tokens.map(token => (
            <button
              key={token.symbol}
              onClick={() => setSelectedToken(token.address)}
              className={`p-2 rounded-lg text-sm ${
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

const Swapper = ({ERCUltraAddress, SYMBOL }) => {
    const client = createThirdwebClient({ clientId: import.meta.env.VITE_THIRDWEB_CLIENT });
    const [loading, setLoading] = useState(false);
    const [theBalance, setTheBalance] = useState(0);
    const [ethBalance, setEthBalance] = useState(0);
    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const [buyAmount, setBuyAmount] = useState(0);
    const [decimals, setDecimals] = useState(18);
    const [buyDecimals, setBuyDecimals] = useState(18);
    const [allowance, setAllowance] = useState(0);
    const [SYMBA, setSYMBA] = useState('');
    const [SYMBA2, setSYMBA2] = useState('');
    const [approved,setApproved] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showTokenPopup, setShowTokenPopup] = useState(false);
    const [priceError, setPriceError] = useState('');
    const [bestRouter, setBestRouter] = useState('');
    const [routeComparison, setRouteComparison] = useState([]);
    const [showAllRoutes, setShowAllRoutes] = useState(false);
    const [totalRoutersChecked, setTotalRoutersChecked] = useState(0);
    const [form, setForm] = useState({
        sellToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        buyToken: ERCUltraAddress,
        sellAmount: '',
    });
    
    const [secondsLeft, setSecondsLeft] = useState(10);
    const {address} = useStateContext();
    
    // Replace this with your deployed comprehensive aggregator contract address
    const AGGREGATOR_CONTRACT_ADDRESS = import.meta.env.VITE_FULLDEX;
    const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
    const USDTAddress = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2';
    const USDCAddress = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    const DAIAddress = '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb';
    const CBETHAddress = '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22';
    
    const { contract: SELLTOKENCONTRACT } = useContract(form.sellToken);
    const { contract: BUYTOKENCONTRACT } = useContract(form.buyToken);
    const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
    const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`;

    const SELL = getContract({
        client: client,
        chain: { id: 8453, rpc: POLYRPC },
        address: form.sellToken,
    });

    const AGGREGATOR_CONTRACT = getContract({
        client: client,
        chain: { id: 8453, rpc: POLYRPC },
        address: AGGREGATOR_CONTRACT_ADDRESS,
    });

    const isETH = form.sellToken === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

    const getRouterTypeIcon = (routerType) => {
        return routerType === 0 ? '🔄' : '⚡'; // V2 vs V3
    };

    const getRouterTypeText = (routerType) => {
        return routerType === 0 ? 'V2' : 'V3';
    };

    const formatAmount = (amount) => {
        const num = parseFloat(amount);
        if (num === 0) return '0';
        if (num < 0.000001) return '< 0.000001';
        if (num < 1) return num.toFixed(6);
        if (num < 1000) return num.toFixed(4);
        return num.toLocaleString();
    };

    const handleFormFieldChange = (fieldName, e) => {
        const value = e.target.value;
        
        if (fieldName === 'sellAmount') {
            // Allow only numbers and one decimal point
            const decimalRegex = /^\d*\.?\d*$/;
            
            // Check if input matches decimal format
            if (value === '' || decimalRegex.test(value)) {
                // Count decimal places
                const decimalParts = value.split('.');
                const decimalPlaces = decimalParts[1] ? decimalParts[1].length : 0;
                
                // Allow up to 6 decimal places
                if (decimalPlaces <= 6) {
                    setForm({ ...form, [fieldName]: value });
                }
            }
        } else {
            // For other fields, keep existing logic
            if (value.toString().length <= 8) {
                setForm({ ...form, [fieldName]: value });
            }
        }
    };

    const swapTokens = () => {
        setForm(prev => ({
            ...prev,
            sellToken: prev.buyToken,
            buyToken: prev.sellToken,
            sellAmount: '0'
        }));
    };

    const getDisplayToken = (address) => {
        if (address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') return 'ETH';
        if (address === USDTAddress) return 'USDT';
        if (address === USDCAddress) return 'USDC';
        if (address === DAIAddress) return 'DAI';
        if (address === CBETHAddress) return 'cbETH';
        if (address === ERCUltraAddress) return SYMBOL;
        if (address === WETH_ADDRESS) return 'WETH';
        return address === form.sellToken ? SYMBA : SYMBA2;
    };

    const handleTokenSelect = (address) => {
        setForm(prev => {
          if (address === prev.buyToken) {
            return {
              ...prev,
              sellToken: prev.buyToken,
              buyToken: prev.sellToken,
              sellAmount: '0' // Reset to 0 when swapping tokens
            };
          }
          return { 
            ...prev, 
            sellToken: address,
            sellAmount: '0' // Reset to 0 when selecting new token
          };
        });
        setShowTokenPopup(false);

    };

    const getETHBalance = async () => {
        if (!address) return 0;
        try {
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC);
            const balance = await provider.getBalance(address);
            return ethers.utils.formatEther(balance);
        } catch (error) {
            console.error("ETH balance error:", error);
            return 0;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!form.sellToken || !form.buyToken) return;
            
            try {
                setLoading(true);
                setPriceError('');

                if (isETH) {
                    const ethBal = await getETHBalance();
                    setTheBalance(ethBal);
                    setDecimals(18);
                    setSYMBA('ETH');
                } else if (SELLTOKENCONTRACT) {
                    try {
                        // 1. קודם כל מביאים מידע ציבורי על המטבע (לא דורש כתובת משתמש)
                        const [sellSymbol, sellDecimals] = await Promise.all([
                            SELLTOKENCONTRACT.call('symbol'),
                            SELLTOKENCONTRACT.call('decimals'),
                        ]);
                        
                        setSYMBA(sellSymbol);
                        setDecimals(sellDecimals);

                        // 2. בדיקה אם המשתמש מחובר לפני שמנסים למשוך יתרה ואישור
                        if (address) {
                            const balance = await SELLTOKENCONTRACT.call('balanceOf', [address]);
                            setTheBalance(ethers.utils.formatUnits(balance, sellDecimals));

                            const allowanceAmount = await readContract({
                                contract: SELL,
                                method: "function allowance(address, address) returns (uint256)",
                                params: [address, AGGREGATOR_CONTRACT_ADDRESS]
                            });
                            setAllowance(allowanceAmount);
                        } else {
                            // אם אין משתמש מחובר, נאפס את הנתונים
                            setTheBalance(0);
                            setAllowance(0);
                        }

                    } catch (error) {
                        console.error("Sell token contract error:", error);
                        setSYMBA('Unknown');
                        setDecimals(18);
                        setTheBalance(0);
                    }
                }

                if (BUYTOKENCONTRACT) {
                    try {
                        const [buySymbol, buyTokenDecimals] = await Promise.all([
                            BUYTOKENCONTRACT.call('symbol'),
                            BUYTOKENCONTRACT.call('decimals')
                        ]);
                        setSYMBA2(buySymbol);
                        setBuyDecimals(buyTokenDecimals);
                    } catch (error) {
                        console.error("Buy token contract error:", error);
                        setSYMBA2('Unknown');
                        setBuyDecimals(18);
                    }
                }

                if (form.sellAmount && parseFloat(form.sellAmount) > 0) {
                    try {
                        const amountInWei = ethers.utils.parseUnits(form.sellAmount, decimals);
                        const actualSellToken = isETH ? WETH_ADDRESS : form.sellToken;
                        
                        // Get the best price from comprehensive aggregator
                        const [bestAmountOut, bestPath] = await readContract({
                            contract: AGGREGATOR_CONTRACT,
                            method: "function getOptimalAmountOut(address,address,uint256) returns (uint256, address[])",
                            params: [actualSellToken, form.buyToken, amountInWei]
                        });
                        
                        if (bestAmountOut && bestAmountOut > 0) {
                            const formattedAmount = ethers.utils.formatUnits(bestAmountOut, buyDecimals);
                            setBuyAmount(formattedAmount);
                            setPriceError('');
                            
                            // Get comprehensive comparison of all routes
                            try {
                                const [amountsOut, routers, routerNames, validRoutes, routerTypes] = await readContract({
                                    contract: AGGREGATOR_CONTRACT,
                                    method: "function compareAllRoutes(address,address,uint256) returns (uint256[], address[], string[], bool[], uint8[])",
                                    params: [actualSellToken, form.buyToken, amountInWei]
                                });
                                
                                const comparison = routerNames.map((name, index) => ({
                                    router: name,
                                    amountOut: validRoutes[index] ? ethers.utils.formatUnits(amountsOut[index], buyDecimals) : '0',
                                    isValid: validRoutes[index],
                                    routerType: routerTypes[index],
                                    isBest: validRoutes[index] && amountsOut[index].toString() === bestAmountOut.toString()
                                }));
                                
                                // Sort by amount out (descending)
                                comparison.sort((a, b) => {
                                    if (!a.isValid && !b.isValid) return 0;
                                    if (!a.isValid) return 1;
                                    if (!b.isValid) return -1;
                                    return parseFloat(b.amountOut) - parseFloat(a.amountOut);
                                });
                                
                                setRouteComparison(comparison);
                                setTotalRoutersChecked(comparison.length);
                                const bestRouteInfo = comparison.find(route => route.isBest);
                                setBestRouter(bestRouteInfo ? bestRouteInfo.router : 'Unknown');
                            } catch (error) {
                                console.log("Route comparison error:", error);
                            }
                        } else {
                            setBuyAmount(0);
                            setPriceError('No liquidity available for this pair across all DEXs');
                        }
                    } catch (error) {
                        console.log("Price quote error:", error);
                        setBuyAmount(0);
                        setPriceError('Error getting price quote from aggregator');
                    }
                } else {
                    setBuyAmount(0);
                    setPriceError('');
                    setRouteComparison([]);
                    setTotalRoutersChecked(0);
                }

                setIsUpdating(form.sellAmount && parseFloat(form.sellAmount) > 0);
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        
        const intervalId = setInterval(fetchData, 10000);
        const countdownId = setInterval(() => setSecondsLeft(prev => prev > 0 ? prev - 1 : 10), 1000);

        fetchData();

        return () => {
            clearInterval(intervalId);
            clearInterval(countdownId);
        };
        
    }, [form.sellAmount, form.sellToken, form.buyToken, address, BUYTOKENCONTRACT, SELLTOKENCONTRACT, decimals, buyDecimals, isETH]);

    return (
        <div className="mx-auto w-[400px] max-w-full h-[300px] overflow-hidden rounded-2xl border border-gray-700/60 bg-gray-900/60 p-3 shadow-lg">
  {/* Scrollable content area so everything stays inside 400x300 */}
  <div className="h-full overflow-y-auto pr-1">
    {isLoading && <Loader />}

    {showTokenPopup && (
      <TokenSelectPopup
        onSelect={handleTokenSelect}
        onClose={() => setShowTokenPopup(false)}
        SYMBOL={SYMBOL}
        ERCULTRA={ERCUltraAddress}
      />
    )}

    {/* Header */}
    <div className="text-center mb-3">
      <p className="text-base sm:text-lg font-bold text-gray-200 leading-tight">
        🚀 Multi-DEX V2 Aggregator
      </p>
      <p className="text-xs sm:text-sm text-gray-400">
        Scanning {totalRoutersChecked > 0 ? totalRoutersChecked : "5+"} V2 DEXs for Best Prices
      </p>
      <p className="text-[10px] sm:text-xs text-cyan-400">
        BaseSwap • Uniswap V2 • SushiSwap • HorizonDEX • SwapBased
      </p>
    </div>

    {/* Sell + Amount */}
    <div className="grid grid-cols-1 gap-2">
      <div>
        <label className="block text-gray-100 text-sm font-medium mb-1">Sell</label>
        <div
          onClick={() => setShowTokenPopup(true)}
          className="w-full cursor-pointer rounded-xl border border-gray-600/70 bg-gradient-to-r from-gray-800/80 to-gray-900/80 px-3 py-2 text-sm text-white transition-opacity hover:opacity-90"
        >
          {getDisplayToken(form.sellToken)}
        </div>
      </div>

      <FormField
        labelName="Amount"
        inputType="text"
        placeholder="0.000000"
        value={form.sellAmount}
        handleChange={(e) => handleFormFieldChange("sellAmount", e)}
        style={`w-full px-0 py-0 ${Number(form.sellAmount || 0) > theBalance ? "bg-red-500/20" : ""}`}
      />

      <button
        type="button"
        className="text-left text-xs text-gray-200/90 hover:text-white underline underline-offset-2"
        onClick={() => setForm({ ...form, sellAmount: String(theBalance) })}
      >
        Balance: <span className="font-mono">{theBalance}</span>
      </button>
    </div>

    {/* Swap button */}
    <div className="flex justify-center my-3">
      <button
        onClick={swapTokens}
        className="flex items-center rounded-full bg-cyan-500/90 px-3 py-2 text-white shadow hover:bg-cyan-500 transition"
      >
        {loading ? (
          <img src={loader} className="w-6 h-6" />
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-4 h-4 mr-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </>
        )}
      </button>
    </div>

    {/* Buy + Amount */}
    <div className="grid grid-cols-1 gap-2">
      <FormField
        labelName="Buy"
        value={getDisplayToken(form.buyToken)}
        style="w-full cursor-not-allowed opacity-90 !bg-cyan-500/90"
        readOnly
      />
      <FormField
        labelName="Amount"
        value={buyAmount}
        style="w-full cursor-not-allowed opacity-90"
        readOnly
      />
    </div>

    {/* Best router */}
    {bestRouter && (
      <div className="mt-3 rounded-xl border border-green-400/20 bg-gradient-to-r from-green-700/70 to-green-600/60 p-2">
        <p className="text-white text-sm font-bold">🏆 Best Route: {bestRouter}</p>
        <p className="text-green-100 text-xs">Out of {totalRoutersChecked} DEXs checked</p>
      </div>
    )}

    {/* Routes list */}
    {routeComparison.length > 0 && (
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-white text-sm font-bold">📊 DEX Comparison</h4>
          <button
            onClick={() => setShowAllRoutes(!showAllRoutes)}
            className="text-cyan-300 text-xs hover:text-cyan-200 underline underline-offset-2"
          >
            {showAllRoutes ? "Show Less" : `Show All (${routeComparison.length})`}
          </button>
        </div>

        <div className="rounded-xl border border-gray-700/60 bg-gray-900/60 p-2 max-h-32 overflow-y-auto">
          {(showAllRoutes ? routeComparison : routeComparison.slice(0, 5)).map((route, index) => (
            <div
              key={index}
              className={`mb-2 flex items-center justify-between rounded-lg px-2 py-2 ${
                route.isBest
                  ? "bg-gradient-to-r from-green-700/70 to-green-600/60"
                  : route.isValid
                    ? "bg-gray-800/60"
                    : "bg-red-900/50"
              }`}
            >
              <div className="min-w-0 flex items-center gap-2">
                <span className="text-base">{getRouterTypeIcon(route.routerType)}</span>
                <div className="min-w-0">
                  <div className="truncate text-white text-xs font-medium">{route.router}</div>
                  <div className="text-[10px] text-gray-300">{getRouterTypeText(route.routerType)}</div>
                </div>
              </div>

              <div className="ml-2 text-right">
                <div className={`font-mono text-xs ${route.isValid ? "text-green-200" : "text-red-200"}`}>
                  {route.isValid ? formatAmount(route.amountOut) : "No Liquidity"}
                  {route.isBest && <span className="ml-1 text-yellow-300">👑</span>}
                </div>
                {index === 0 && route.isValid && !route.isBest && (
                  <div className="text-[10px] text-green-200">Best Available</div>
                )}
              </div>
            </div>
          ))}

          {!showAllRoutes && routeComparison.length > 5 && (
            <div className="text-center text-gray-400 text-[11px] pt-1">
              ... and {routeComparison.length - 5} more DEXs
            </div>
          )}
        </div>
      </div>
    )}

    {/* Errors / updating */}
    {priceError && (
      <div className="mt-3 rounded-xl border border-red-400/20 bg-red-950/50 p-2">
        <p className="text-red-300 text-xs">❌ {priceError}</p>
        <p className="text-red-200 text-[11px] mt-1">Try different tokens or check back later</p>
      </div>
    )}

    {isUpdating && !priceError && (
      <div className="mt-3 flex items-center justify-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400" />
        <p className="text-cyan-300 text-xs">Updating prices in {secondsLeft}s...</p>
      </div>
    )}

    {/* Actions */}
    <div className="mt-3">
      {Number(form.sellAmount) > 0 && address && Number(buyAmount) > 0 && (
        <>
          {!isETH && Number(form.sellAmount) <= theBalance && (
            <TransactionButton
              transaction={async () => {
                const tx = prepareContractCall({
                  contract: SELL,
                  method: "function approve(address,uint256) returns (bool)",
                  params: [AGGREGATOR_CONTRACT_ADDRESS, ethers.utils.parseUnits(form.sellAmount, decimals)],
                })
                return tx
              }}
              className={`!w-full !rounded-xl !py-2 !text-sm !font-bold !bg-cyan-300 !text-black mb-2 ${
                Number(allowance) >= ethers.utils.parseUnits(form.sellAmount, decimals) ? "!hidden" : ""
              }`}
            >
              Approve {getDisplayToken(form.sellToken)}
            </TransactionButton>
          )}

          <TransactionButton
            transaction={async () => {
              const amountInWei = ethers.utils.parseUnits(form.sellAmount, decimals)
              const deadline = Math.floor(Date.now() / 1000) + 600
              const actualSellToken = isETH ? WETH_ADDRESS : form.sellToken

              const [bestAmountOut] = await readContract({
                contract: AGGREGATOR_CONTRACT,
                method: "function getOptimalAmountOut(address,address,uint256) returns (uint256, address[])",
                params: [actualSellToken, form.buyToken, amountInWei],
              })

              const minAmountOut = ethers.BigNumber.from(bestAmountOut).mul(99).div(100)

              if (isETH) {
                return prepareContractCall({
                  contract: AGGREGATOR_CONTRACT,
                  method: "function swapExactETHForTokens(address,uint256,address,uint256)",
                  params: [form.buyToken, minAmountOut.toString(), address, deadline],
                  value: amountInWei,
                })
              } else {
                return prepareContractCall({
                  contract: AGGREGATOR_CONTRACT,
                  method: "function swapExactTokensForTokens(address,address,uint256,uint256,address,uint256)",
                  params: [form.sellToken, form.buyToken, amountInWei, minAmountOut.toString(), address, deadline],
                })
              }
            }}
            className={`!w-full !rounded-xl !py-2 !text-sm !font-bold !text-white !bg-gradient-to-r !from-green-500 !to-green-600 ${
              !isETH && Number(allowance) < ethers.utils.parseUnits(form.sellAmount, decimals) ? "!hidden" : ""
            }`}
          >
            🚀 Swap via {bestRouter} (Best Price)
          </TransactionButton>
        </>
      )}

      {Number(form.sellAmount) > theBalance && (
        <p className="mt-2 text-xs text-red-400 font-bold">❌ Balance Is Not Enough</p>
      )}

      {Number(form.sellAmount) > 0 && Number(buyAmount) === 0 && !priceError && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400" />
          <p className="text-yellow-300 text-xs font-bold">🔍 Scanning all DEXs for best price...</p>
        </div>
      )}
    </div>
  </div>
</div>

    );
};

export default Swapper;