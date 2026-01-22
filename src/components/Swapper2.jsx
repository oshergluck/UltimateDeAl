import React, { useState, useEffect, useCallback } from 'react';
import { getContract, createThirdwebClient, readContract, prepareContractCall } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { ethers } from 'ethers';
import { TransactionButton } from 'thirdweb/react';
import { defineChain } from 'thirdweb/chains';
import { Loader } from '../components'; 

// --- CONFIGURATION ---
const CHAIN_ID = 8453; // Base
const CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT;

// Contract Addresses
const AGGREGATOR_ADDRESS = import.meta.env.VITE_FULLDEX;
const BASESWAP_ROUTER = '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86';
const UNISWAP_V2_ROUTER = '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24';
const SUSHISWAP_ROUTER = '0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891';
const AERODROME_ROUTER = '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43';

// Tokens
const NATIVE_TOKEN = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';

// ABIs
const ERC20_ABI = [
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], type: "function", stateMutability: "view" },
  { inputs: [], name: "decimals", outputs: [{ name: "", type: "uint8" }], type: "function", stateMutability: "view" },
  { inputs: [], name: "symbol", outputs: [{ name: "", type: "string" }], type: "function", stateMutability: "view" },
  { inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], name: "allowance", outputs: [{ name: "", type: "uint256" }], type: "function", stateMutability: "view" },
  { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ name: "", type: "bool" }], type: "function", stateMutability: "nonpayable" }
];

const V2_ROUTER_ABI = [
  { inputs: [{ name: "amountIn", type: "uint256" }, { name: "path", type: "address[]" }], name: "getAmountsOut", outputs: [{ name: "amounts", type: "uint256[]" }], type: "function", stateMutability: "view" }
];

const AERODROME_ROUTER_ABI = [
  { inputs: [{ name: "amountIn", type: "uint256" }, { components: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "stable", type: "bool" }, { name: "factory", type: "address" }], name: "routes", type: "tuple[]" }], name: "getAmountsOut", outputs: [{ name: "amounts", type: "uint256[]" }], type: "function", stateMutability: "view" }
];

// --- COMPONENTS ---

const SettingsModal = ({ isOpen, onClose, slippage, setSlippage }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute top-12 right-4 z-50 bg-gray-800 border border-gray-600 rounded-xl p-4 shadow-xl w-64">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-white font-bold text-sm">Settings</h4>
                <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div>
                <label className="text-xs text-gray-400 mb-2 block">Slippage Tolerance</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                    {[0.5, 1, 3, 5].map((val) => (
                        <button key={val} onClick={() => setSlippage(val)} className={`px-2 py-1 rounded-lg text-xs font-bold ${slippage === val ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{val}%</button>
                    ))}
                </div>
                <div className="relative flex items-center">
                     <input type="number" value={slippage} onChange={(e) => setSlippage(parseFloat(e.target.value))} className="w-full bg-gray-700 text-white text-xs rounded-lg p-2 text-center outline-none border border-transparent focus:border-cyan-500" placeholder="Custom" />
                    <span className="absolute right-3 text-xs text-gray-400">%</span>
                </div>
            </div>
        </div>
    );
};

const TokenSelectPopup = ({ onSelect, onClose, SYMBOL, ERCULTRA }) => {
  const [customAddress, setCustomAddress] = useState('');
  const tokens = [
    { symbol: 'ETH', address: NATIVE_TOKEN },
    { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
    { symbol: SYMBOL, address: ERCULTRA },
    { symbol: 'WETH', address: WETH_ADDRESS },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4">Select Token</h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {tokens.map(token => (
            <button key={token.symbol} onClick={() => { onSelect(token.address); onClose(); }} className="p-2 rounded-lg text-sm bg-gray-800 hover:bg-cyan-700 text-white font-bold transition-all border border-gray-700">{token.symbol}</button>
          ))}
        </div>
        <div className="flex gap-2">
             <input type="text" placeholder="0x..." value={customAddress} onChange={(e) => setCustomAddress(e.target.value)} className="flex-1 p-3 rounded-lg bg-gray-800 text-white border border-gray-600 text-xs focus:border-cyan-500 outline-none" />
            <button onClick={() => { if(ethers.utils.isAddress(customAddress)) { onSelect(customAddress); onClose(); }}} className="bg-cyan-600 px-3 rounded-lg text-white font-bold">Go</button>
        </div>
        <button onClick={onClose} className="w-full mt-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">Cancel</button>
      </div>
    </div>
  );
};

const Swapper = ({ ERCUltraAddress, SYMBOL }) => {
    // --- SETUP ---
    const client = createThirdwebClient({ clientId: CLIENT_ID });
    const chain = defineChain(CHAIN_ID);
    const account = useActiveAccount();
    
    // --- STATE ---
    const [form, setForm] = useState({
        sellToken: NATIVE_TOKEN,
        buyToken: ERCUltraAddress,
        sellAmount: '',
    });

    const [balances, setBalances] = useState({ sell: '0', buy: '0' });
    const [symbols, setSymbols] = useState({ sell: 'ETH', buy: SYMBOL });
    const [decimals, setDecimals] = useState({ sell: 18, buy: 18 });
    const [allowance, setAllowance] = useState('0');
    
    // UI State
    const [showTokenPopup, setShowTokenPopup] = useState(false);
    const [tokenSelectorType, setTokenSelectorType] = useState('sell');
    const [showSettings, setShowSettings] = useState(false);
    const [slippage, setSlippage] = useState(1.0);
    const [errorMsg, setErrorMsg] = useState('');
    const [bestRoute, setBestRoute] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    const AGGREGATOR_CONTRACT = getContract({ client, chain, address: AGGREGATOR_ADDRESS });

    // --- 1. FETCH METADATA ---
    const fetchMetadata = useCallback(async () => {
        if (!account) return;
        try {
            const provider = new ethers.providers.JsonRpcProvider(`https://${CHAIN_ID}.rpc.thirdweb.com/${CLIENT_ID}`);
            
            // Sell Token Data
            let sellBal = '0', sellSym = 'ETH', sellDec = 18, currentAllowance = ethers.constants.MaxUint256.toString();
            
            if (form.sellToken !== NATIVE_TOKEN) {
                const contract = getContract({ client, chain, address: form.sellToken, abi: ERC20_ABI });
                const [bal, dec, sym, allow] = await Promise.all([
                    readContract({ contract, method: "balanceOf", params: [account.address] }),
                    readContract({ contract, method: "decimals", params: [] }),
                    readContract({ contract, method: "symbol", params: [] }),
                    readContract({ contract, method: "allowance", params: [account.address, AGGREGATOR_ADDRESS] })
                ]);
                sellBal = ethers.utils.formatUnits(bal, dec);
                sellDec = dec;
                sellSym = sym;
                currentAllowance = allow.toString();
            } else {
                // HANDLE ETH SPECIFICALLY
                const bal = await provider.getBalance(account.address);
                sellBal = ethers.utils.formatEther(bal);
                sellDec = 18; // Force decimals to 18 for ETH
                sellSym = 'ETH';
                currentAllowance = ethers.constants.MaxUint256.toString();
            }

            // Buy Token Data
            let buyBal = '0', buySym = 'TKN', buyDec = 18;
            if (form.buyToken !== NATIVE_TOKEN) {
                const contract = getContract({ client, chain, address: form.buyToken, abi: ERC20_ABI });
                const [bal, dec, sym] = await Promise.all([
                    readContract({ contract, method: "balanceOf", params: [account.address] }),
                    readContract({ contract, method: "decimals", params: [] }),
                    readContract({ contract, method: "symbol", params: [] }),
                ]);
                buyBal = ethers.utils.formatUnits(bal, dec);
                buyDec = dec;
                buySym = sym;
            } else {
                const bal = await provider.getBalance(account.address);
                buyBal = ethers.utils.formatEther(bal);
                buySym = 'ETH';
                buyDec = 18;
            }

            setBalances({ sell: sellBal, buy: buyBal });
            setSymbols({ sell: sellSym, buy: buySym });
            setDecimals({ sell: sellDec, buy: buyDec });
            setAllowance(currentAllowance);
        } catch (e) {
            console.error("Metadata fetch error:", e);
        }
    }, [form.sellToken, form.buyToken, account, client, chain]);

    useEffect(() => {
        fetchMetadata();
        const interval = setInterval(fetchMetadata, 10000);
        return () => clearInterval(interval);
    }, [fetchMetadata]);

    // --- 2. SWITCH TOKENS ---
    const handleSwitchTokens = () => {
        setForm(prev => ({
            sellToken: prev.buyToken,
            buyToken: prev.sellToken,
            sellAmount: ''
        }));
        setBestRoute(null);
    };

    // --- 3. ROUTING ---
    const findBestRoute = useCallback(async () => {
        if (!form.sellAmount || parseFloat(form.sellAmount) <= 0) {
            setBestRoute(null);
            return;
        }

        console.log("Starting Routing Scan...");
        setIsScanning(true);
        setBestRoute(null);
        setErrorMsg('');

        try {
            const amountInWei = ethers.utils.parseUnits(form.sellAmount, decimals.sell);
            // Convert Native to WETH for routing paths
            const tokenIn = form.sellToken === NATIVE_TOKEN ? WETH_ADDRESS : form.sellToken;
            const tokenOut = form.buyToken === NATIVE_TOKEN ? WETH_ADDRESS : form.buyToken;

            // V2 Routers
            const v2Routers = [
                { name: 'BaseSwap', address: BASESWAP_ROUTER },
                { name: 'Uniswap V2', address: UNISWAP_V2_ROUTER },
                { name: 'SushiSwap', address: SUSHISWAP_ROUTER },
            ];

            const promises = [];

            // Check V2
            v2Routers.forEach(router => {
                const contract = getContract({ client, chain, address: router.address, abi: V2_ROUTER_ABI });
                const pathDirect = [tokenIn, tokenOut];
                const pathViaWeth = [tokenIn, WETH_ADDRESS, tokenOut];

                promises.push(
                    readContract({ contract, method: "getAmountsOut", params: [amountInWei, pathDirect] })
                    .then(res => ({ type: 'V2', name: router.name, address: router.address, amountOut: res[res.length - 1], path: pathDirect }))
                    .catch(() => null)
                );

                if(tokenIn !== WETH_ADDRESS && tokenOut !== WETH_ADDRESS) {
                    promises.push(
                        readContract({ contract, method: "getAmountsOut", params: [amountInWei, pathViaWeth] })
                        .then(res => ({ type: 'V2', name: router.name, address: router.address, amountOut: res[res.length - 1], path: pathViaWeth }))
                        .catch(() => null)
                    );
                }
            });

            // Check Aerodrome
            const aeroContract = getContract({ client, chain, address: AERODROME_ROUTER, abi: AERODROME_ROUTER_ABI });
            const routeVolatile = [{ from: tokenIn, to: tokenOut, stable: false, factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da" }];
            promises.push(
                readContract({ contract: aeroContract, method: "getAmountsOut", params: [amountInWei, routeVolatile] })
                .then(res => ({ type: 'AERODROME', name: 'Aerodrome', address: AERODROME_ROUTER, amountOut: res[res.length - 1], routeStruct: routeVolatile }))
                .catch(() => null)
            );

            const results = await Promise.all(promises);
            const validRoutes = results.filter(r => r !== null && r.amountOut > 0);

            if (validRoutes.length > 0) {
                validRoutes.sort((a, b) => ethers.BigNumber.from(a.amountOut).gt(ethers.BigNumber.from(b.amountOut)) ? -1 : 1);
                const best = validRoutes[0];
                best.formattedOut = ethers.utils.formatUnits(best.amountOut, decimals.buy);
                console.log("Route Found:", best.name, best.formattedOut);
                setBestRoute(best);
            } else {
                console.log("No Routes Found");
                setErrorMsg('No liquidity found.');
            }
        } catch (e) {
            console.error("Routing Error:", e);
        } finally {
            setIsScanning(false);
        }
    }, [form, decimals, client, chain]);

    useEffect(() => {
        const timer = setTimeout(() => { if(form.sellAmount) findBestRoute(); }, 600);
        return () => clearTimeout(timer);
    }, [form.sellAmount, findBestRoute]);

    // --- RENDER ---
    return (
        <div className="relative w-[400px] max-w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl font-sans">
            {showTokenPopup && <TokenSelectPopup onSelect={(addr) => {
                if(tokenSelectorType === 'sell') setForm(p => ({ ...p, sellToken: addr, sellAmount: '' }));
                else setForm(p => ({ ...p, buyToken: addr }));
                setShowTokenPopup(false);
            }} onClose={() => setShowTokenPopup(false)} SYMBOL={SYMBOL} ERCULTRA={ERCUltraAddress} />}
            
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} slippage={slippage} setSlippage={setSlippage} />

            <div className="flex justify-between items-center mb-4 px-2">
                <span className="text-white font-bold text-lg">Swap</span>
                <button onClick={() => setShowSettings(!showSettings)} className="text-gray-400 hover:text-white transition">⚙️ {slippage}%</button>
            </div>

            {/* Sell Input */}
            <div className="bg-gray-800 rounded-xl p-4 mb-1 border border-gray-700 hover:border-gray-600 transition">
                <div className="flex justify-between mb-2">
                    <span className="text-gray-400 text-xs">You Pay</span>
                    <span className="text-gray-400 text-xs cursor-pointer hover:text-cyan-400" onClick={() => setForm(p => ({...p, sellAmount: balances.sell}))}>Bal: {parseFloat(balances.sell).toFixed(4)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <input type="number" placeholder="0" value={form.sellAmount} onChange={(e) => setForm({...form, sellAmount: e.target.value})} className="bg-transparent text-3xl text-white outline-none w-full font-medium" />
                    <button onClick={() => { setTokenSelectorType('sell'); setShowTokenPopup(true); }} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1 font-bold min-w-[80px] justify-center">{symbols.sell} ▼</button>
                </div>
            </div>

            {/* Switch Button */}
            <div className="flex justify-center -my-4 relative z-10">
                <div className="bg-gray-900 p-1 rounded-lg">
                    <button onClick={handleSwitchTokens} className="bg-gray-700 p-2 rounded-lg text-cyan-400 hover:bg-gray-600 hover:text-white transition-all shadow-lg border border-gray-600">
                        ⇅
                    </button>
                </div>
            </div>

            {/* Buy Input */}
            <div className="bg-gray-800 rounded-xl p-4 mt-1 border border-gray-700">
                <div className="flex justify-between mb-2">
                    <span className="text-gray-400 text-xs">You Receive</span>
                    <span className="text-gray-400 text-xs">Bal: {parseFloat(balances.buy).toFixed(4)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <input type="text" readOnly value={isScanning ? "..." : (bestRoute?.formattedOut || "0")} className={`bg-transparent text-3xl outline-none w-full font-medium ${isScanning ? 'animate-pulse text-gray-500' : 'text-white'}`} />
                    <button onClick={() => { setTokenSelectorType('buy'); setShowTokenPopup(true); }} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1 font-bold min-w-[80px] justify-center">{symbols.buy} ▼</button>
                </div>
            </div>

            {errorMsg && <div className="mt-2 text-red-400 text-xs text-center">{errorMsg}</div>}
            
            {bestRoute && (
                <div className="mt-3 px-2 flex justify-between items-center bg-gray-800/50 p-2 rounded-lg border border-gray-700/50">
                    <div className="flex items-center gap-2">
                         <span className="text-lg">{bestRoute.type === 'V2' ? '🛡️' : '✈️'}</span>
                         <span className="text-xs text-gray-300">Route: <span className="font-bold text-white">{bestRoute.name}</span></span>
                    </div>
                    <span className="text-xs text-green-400 font-bold">Best Price</span>
                </div>
            )}

            {/* Actions */}
            <div className="mt-4">
                {!account ? (
                    <button className="w-full bg-cyan-900/50 text-cyan-200 py-4 rounded-xl font-bold opacity-70 cursor-not-allowed">Connect Wallet First</button>
                ) : (
                    <>
                        {form.sellToken !== NATIVE_TOKEN && parseFloat(allowance) < parseFloat(ethers.utils.parseUnits(form.sellAmount || '0', decimals.sell)) ? (
                            <TransactionButton
                                transaction={() => {
                                    const contract = getContract({ client, chain, address: form.sellToken, abi: ERC20_ABI });
                                    return prepareContractCall({ contract, method: "approve", params: [AGGREGATOR_ADDRESS, ethers.constants.MaxUint256] });
                                }}
                                onTransactionConfirmed={() => fetchMetadata()}
                                onError={(e) => console.error("Approve Failed", e)}
                                className="!w-full !bg-cyan-600 !text-white !font-bold !py-4 !rounded-xl"
                            >
                                Approve {symbols.sell}
                            </TransactionButton>
                        ) : (
                            <TransactionButton
                                transaction={() => {
                                    if(!bestRoute) throw new Error("No route");
        
                                    // יצירת האובייקט של Ethers לטובת חישובים פנימיים
                                    const amountInWeiBN = ethers.utils.parseUnits(form.sellAmount, decimals.sell);
                                    
                                    // המרה ל-BigInt טהור עבור Thirdweb SDK
                                    const amountInWeiNative = BigInt(amountInWeiBN.toString());
                            
                                    const slippageBPS = Math.floor(slippage * 100);
                                    // חישוב המינימום (נשאר עם לוגיקה של Ethers כי bestRoute.amountOut מגיע משם)
                                    const minAmountOut = ethers.BigNumber.from(bestRoute.amountOut).mul(10000 - slippageBPS).div(10000);
                                    
                                    const deadline = Math.floor(Date.now() / 1000) + 1200;
                                    const isNativeIn = form.sellToken === NATIVE_TOKEN;
                                    const isNativeOut = form.buyToken === NATIVE_TOKEN;
                                    
                                    const tokenInArg = isNativeIn ? WETH_ADDRESS : form.sellToken;
                            
                                    // פרמטרים לחוזה - כאן עדיף להעביר String כדי להיות בטוחים
                                    const paramsBase = [
                                        bestRoute.address, 
                                        tokenInArg, 
                                        amountInWeiBN.toString(), // שימוש ב-toString() לפרמטרים
                                        minAmountOut.toString(),  // שימוש ב-toString() לפרמטרים
                                    ];
                            
                                    if(bestRoute.type === 'AERODROME') {
                                        return prepareContractCall({
                                            contract: AGGREGATOR_CONTRACT,
                                            method: "function swapAerodrome(address router,address tokenIn,uint256 amountIn,uint256 amountOutMin,IAerodromeRouter.Route[] calldata routes,address to,uint256 deadline,bool unwrapETH)",
                                            params: [...paramsBase, bestRoute.routeStruct, account.address, deadline, isNativeOut],
                                            // התיקון הקריטי: העברת BigInt טהור ל-value
                                            value: isNativeIn ? amountInWeiNative : 0n 
                                        });
                                    } else {
                                        return prepareContractCall({
                                            contract: AGGREGATOR_CONTRACT,
                                            method: "function swapV2WithTax(address router,address tokenIn,uint256 amountIn,uint256 amountOutMin,address[] calldata path,address to,uint256 deadline,bool unwrapETH)",
                                            params: [...paramsBase, bestRoute.path, account.address, deadline, isNativeOut],
                                            // התיקון הקריטי: העברת BigInt טהור ל-value
                                            value: isNativeIn ? amountInWeiNative : 0n
                                        });
                                    }
                                }}
                                onError={(e) => console.error("Swap Failed:", e)}
                                disabled={!bestRoute || isScanning}
                                className="!w-full !bg-gradient-to-r !from-cyan-500 !to-blue-600 !text-white !font-bold !py-4 !rounded-xl hover:!opacity-90 disabled:!opacity-50"
                            >
                                {isScanning ? "Finding Route..." : (!form.sellAmount ? "Enter Amount" : "Swap")}
                            </TransactionButton>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Swapper;
