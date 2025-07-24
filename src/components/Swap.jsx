import React, { useState, useEffect } from 'react';
import { 
  prepareContractCall,
  getContract
} from "thirdweb";
import { useStateContext } from '../context';
import { useReadContract, useSendTransaction, TransactionButton } from 'thirdweb/react';
import { base } from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";

// Initialize thirdweb client
const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT
});

// Contract addresses on Base - Using Uniswap V2 compatible router
const ROUTER_ADDRESS = "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24"; // SushiSwap V2 Router
const USDT_ADDRESS = "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2";

const Swap = ({ 
  tokenAddress, 
  tokenSymbol, 
  className = "",
  onSwapSuccess = () => {},
  onSwapError = () => {} 
}) => {
  const { address } = useStateContext();
  const account = address;
  const [swapAmount, setSwapAmount] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("0");
  const [isSwappingToToken, setIsSwappingToToken] = useState(true); // true = USDT to Token, false = Token to USDT
  const [needsUsdtApproval, setNeedsUsdtApproval] = useState(false);
  const [needsTokenApproval, setNeedsTokenApproval] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [priceImpact, setPriceImpact] = useState(0);
  const [debugInfo, setDebugInfo] = useState("");

  // Get contracts
  const tokenContract = getContract({
    client,
    chain: base,
    address: tokenAddress,
  });

  const usdtContract = getContract({
    client,
    chain: base,
    address: USDT_ADDRESS,
  });

  const routerContract = getContract({
    client,
    chain: base,
    address: ROUTER_ADDRESS,
  });

  // Read USDT balance with better error handling
  const { data: usdtBalance, refetch: refetchUsdtBalance, isLoading: usdtBalanceLoading, error: usdtBalanceError } = useReadContract({
    contract: usdtContract,
    method: "function balanceOf(address) view returns (uint256)",
    params: [address],
  });

  // Read USDT decimals
  const { data: usdtDecimals } = useReadContract({
    contract: usdtContract,
    method: "function decimals() view returns (uint8)",
    params: [],
  });

  // Read USDT symbol for verification
  const { data: usdtSymbol } = useReadContract({
    contract: usdtContract,
    method: "function symbol() view returns (string)",
    params: [],
  });

  // Read token balance with better error handling
  const { data: tokenBalance, refetch: refetchTokenBalance, isLoading: tokenBalanceLoading, error: tokenBalanceError } = useReadContract({
    contract: tokenContract,
    method: "function balanceOf(address) view returns (uint256)",
    params: [address],
  });

  // Read token decimals
  const { data: tokenDecimals } = useReadContract({
    contract: tokenContract,
    method: "function decimals() view returns (uint8)",
    params: [],
  });

  // Read token name
  const { data: tokenName } = useReadContract({
    contract: tokenContract,
    method: "function name() view returns (string)",
    params: [],
  });

  // Read USDT allowance (when swapping USDT to Token)
  const { data: usdtAllowance, refetch: refetchUsdtAllowance } = useReadContract({
    contract: usdtContract,
    method: "function allowance(address,address) view returns (uint256)",
    params: [
      address,
      ROUTER_ADDRESS
    ],
  });

  // Read Token allowance (when swapping Token to USDT)
  const { data: tokenAllowance, refetch: refetchTokenAllowance } = useReadContract({
    contract: tokenContract,
    method: "function allowance(address,address) view returns (uint256)",
    params: [
      address,
      ROUTER_ADDRESS
    ],
  });

  // Read expected output from router with better amount handling
  const { data: expectedAmounts, isLoading: isPriceLoading, error: priceError } = useReadContract({
    contract: routerContract,
    method: "function getAmountsOut(uint256,address[]) view returns (uint256[])",
    params: [
      swapAmount && swapAmount !== "0" && swapAmount !== "" && parseFloat(swapAmount) > 0 ? 
        (isSwappingToToken ? 
          BigInt(Math.floor(parseFloat(swapAmount) * 10**(usdtDecimals || 6))) : 
          BigInt(Math.floor(parseFloat(swapAmount) * 10**(tokenDecimals || 18)))
        ) : BigInt(Math.pow(10, isSwappingToToken ? (usdtDecimals || 6) : (tokenDecimals || 18))), // Use 1 token as base amount
      isSwappingToToken ? [USDT_ADDRESS, tokenAddress] : [tokenAddress, USDT_ADDRESS]
    ],
  });

  // Format balances for display
  const formatBalance = (balance, decimals = 18, precision = 4) => {
    if (!balance) return "0";
    try {
      const num = Number(balance) / 10**decimals;
      return num.toFixed(precision);
    } catch (err) {
      console.error("Error formatting balance:", err);
      return "0";
    }
  };

  // Validate input amount
  const validateSwapAmount = (amount) => {
    if (!amount || amount === "0" || amount === "") return "";
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return "Invalid amount";
    
    const maxBalance = isSwappingToToken ? 
      parseFloat(formatBalance(usdtBalance?.toString(), usdtDecimals || 6)) :
      parseFloat(formatBalance(tokenBalance?.toString(), tokenDecimals || 18));
    
    if (numAmount > maxBalance) return "Insufficient balance";
    
    return "";
  };

  const formattedUsdtBalance = formatBalance(usdtBalance?.toString(), usdtDecimals || 6);
  const formattedTokenBalance = formatBalance(tokenBalance?.toString(), tokenDecimals || 18);

  // Debug effect to help troubleshoot
  useEffect(() => {
    const debugData = {
      account: address,
      usdtBalance: usdtBalance?.toString(),
      tokenBalance: tokenBalance?.toString(),
      usdtDecimals: usdtDecimals?.toString(),
      tokenDecimals: tokenDecimals?.toString(),
      usdtSymbol,
      tokenName,
      usdtBalanceError: usdtBalanceError?.message,
      tokenBalanceError: tokenBalanceError?.message,
      priceError: priceError?.message,
      expectedAmounts: expectedAmounts?.map(a => a.toString()),
      routerAddress: ROUTER_ADDRESS,
      usdtAddress: USDT_ADDRESS,
      tokenAddress: tokenAddress
    };
    setDebugInfo(JSON.stringify(debugData, null, 2));
    console.log("Debug Info:", debugData);
  }, [address, usdtBalance, tokenBalance, usdtDecimals, tokenDecimals, usdtSymbol, tokenName, usdtBalanceError, tokenBalanceError, priceError, expectedAmounts]);

  // Update expected output and price impact when amounts change
  useEffect(() => {
    if (expectedAmounts && expectedAmounts.length > 1 && swapAmount && swapAmount !== "0" && swapAmount !== "" && parseFloat(swapAmount) > 0) {
      const outputAmount = expectedAmounts[expectedAmounts.length - 1];
      const decimals = isSwappingToToken ? (tokenDecimals || 18) : (usdtDecimals || 6);
      const formattedOutput = (Number(outputAmount) / 10**decimals).toFixed(6);
      setExpectedOutput(formattedOutput);
      
      // Calculate price impact (simplified)
      const inputAmount = parseFloat(swapAmount);
      const outputAmountNum = parseFloat(formattedOutput);
      if (inputAmount > 0 && outputAmountNum > 0) {
        const impact = Math.abs((outputAmountNum / inputAmount - 1) * 100);
        setPriceImpact(impact);
      }
    } else if (expectedAmounts && expectedAmounts.length > 1) {
      // Show price ratio when no amount is entered
      const outputAmount = expectedAmounts[expectedAmounts.length - 1];
      const decimals = isSwappingToToken ? (tokenDecimals || 18) : (usdtDecimals || 6);
      const baseAmount = Math.pow(10, isSwappingToToken ? (usdtDecimals || 6) : (tokenDecimals || 18));
      const rate = (Number(outputAmount) / 10**decimals) / (baseAmount / 10**(isSwappingToToken ? (usdtDecimals || 6) : (tokenDecimals || 18)));
      setExpectedOutput(rate.toFixed(6));
    } else {
      setExpectedOutput("0");
      setPriceImpact(0);
    }
  }, [expectedAmounts, isSwappingToToken, tokenDecimals, usdtDecimals, swapAmount]);

  // Check if approvals are needed
  useEffect(() => {
    if (isSwappingToToken && usdtAllowance && swapAmount && usdtDecimals && swapAmount !== "0" && swapAmount !== "" && parseFloat(swapAmount) > 0) {
      // Check USDT approval for USDT -> Token swap
      const amountWei = BigInt(Math.floor(parseFloat(swapAmount) * 10**usdtDecimals));
      setNeedsUsdtApproval(BigInt(usdtAllowance.toString()) < amountWei);
    } else {
      setNeedsUsdtApproval(false);
    }

    if (!isSwappingToToken && tokenAllowance && swapAmount && tokenDecimals && swapAmount !== "0" && swapAmount !== "" && parseFloat(swapAmount) > 0) {
      // Check Token approval for Token -> USDT swap
      const amountWei = BigInt(Math.floor(parseFloat(swapAmount) * 10**tokenDecimals));
      setNeedsTokenApproval(BigInt(tokenAllowance.toString()) < amountWei);
    } else {
      setNeedsTokenApproval(false);
    }
  }, [usdtAllowance, tokenAllowance, swapAmount, isSwappingToToken, tokenDecimals, usdtDecimals]);

  const toggleSwapDirection = () => {
    setIsSwappingToToken(!isSwappingToToken);
    setSwapAmount("");
    setExpectedOutput("0");
    setError("");
    setPriceImpact(0);
  };

  // Prepare USDT approval transaction
  const prepareUsdtApprovalTx = () => {
    if (!swapAmount || !usdtDecimals || swapAmount === "0" || swapAmount === "" || parseFloat(swapAmount) <= 0) return null;
    
    const amountWei = BigInt(Math.floor(parseFloat(swapAmount) * 10**usdtDecimals));
    
    return prepareContractCall({
      contract: usdtContract,
      method: "function approve(address,uint256) returns (bool)",
      params: [ROUTER_ADDRESS, amountWei],
    });
  };

  // Prepare Token approval transaction
  const prepareTokenApprovalTx = () => {
    if (!swapAmount || !tokenDecimals || swapAmount === "0" || swapAmount === "" || parseFloat(swapAmount) <= 0) return null;
    
    const amountWei = BigInt(Math.floor(parseFloat(swapAmount) * 10**tokenDecimals));
    
    return prepareContractCall({
      contract: tokenContract,
      method: "function approve(address,uint256) returns (bool)",
      params: [ROUTER_ADDRESS, amountWei],
    });
  };

  // Prepare swap transaction (Token to Token)
  const prepareSwapTx = () => {
    if (!swapAmount || !expectedOutput || expectedOutput === "0" || !tokenDecimals || !usdtDecimals || swapAmount === "0" || swapAmount === "" || parseFloat(swapAmount) <= 0) return null;

    const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes
    const slippageTolerance = 0.005; // 0.5%

    try {
      if (isSwappingToToken) {
        // USDT to Token
        const amountWei = BigInt(Math.floor(parseFloat(swapAmount) * 10**usdtDecimals));
        const expectedOutputWei = BigInt(Math.floor(parseFloat(expectedOutput) * 10**tokenDecimals));
        const minAmountOut = BigInt(Math.floor(Number(expectedOutputWei) * (1 - slippageTolerance)));
        
        return prepareContractCall({
          contract: routerContract,
          method: "function swapExactTokensForTokens(uint256,uint256,address[],address,uint256) returns (uint256[])",
          params: [
            amountWei,
            minAmountOut,
            [USDT_ADDRESS, tokenAddress],
            address,
            BigInt(deadline)
          ],
        });
      } else {
        // Token to USDT
        const amountWei = BigInt(Math.floor(parseFloat(swapAmount) * 10**tokenDecimals));
        const expectedOutputWei = BigInt(Math.floor(parseFloat(expectedOutput) * 10**usdtDecimals));
        const minAmountOut = BigInt(Math.floor(Number(expectedOutputWei) * (1 - slippageTolerance)));
        
        return prepareContractCall({
          contract: routerContract,
          method: "function swapExactTokensForTokens(uint256,uint256,address[],address,uint256) returns (uint256[])",
          params: [
            amountWei,
            minAmountOut,
            [tokenAddress, USDT_ADDRESS],
            address,
            BigInt(deadline)
          ],
        });
      }
    } catch (error) {
      console.error("Error preparing swap transaction:", error);
      return null;
    }
  };

  const setMaxAmount = () => {
    if (isSwappingToToken) {
      // Set max USDT
      setSwapAmount(formattedUsdtBalance);
    } else {
      // Set max token
      setSwapAmount(formattedTokenBalance);
    }
  };

  // Handle input change with validation
  const handleAmountChange = (value) => {
    setSwapAmount(value);
    const validationError = validateSwapAmount(value);
    setError(validationError);
  };

  if (!address) {
    return (
      <div className={`bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl shadow-xl backdrop-blur-sm p-8 max-w-md mx-auto ${className}`}>
        <div className="text-center py-8">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Wallet Not Connected</h3>
          <p className="text-slate-500">Please connect your wallet to use the token swapper</p>
        </div>
      </div>
    );
  }

  const currentValidationError = validateSwapAmount(swapAmount);
  const needsApproval = needsUsdtApproval || needsTokenApproval;
  const isSwapDisabled = !swapAmount || swapAmount === "0" || needsApproval || expectedOutput === "0" || currentValidationError || isLoading || isPriceLoading || parseFloat(swapAmount) <= 0;

  const showDebug = process.env.NODE_ENV === 'development';

  return (
    <div className={`bg-gradient-to-br from-white via-slate-50 to-slate-100 border border-slate-200/50 rounded-2xl shadow-2xl backdrop-blur-sm p-6 max-w-md mx-auto transition-all duration-300 hover:shadow-3xl ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Token Swapper
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Swap on Base Chain
            </p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">
            {usdtSymbol || 'USDT'}
          </span>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4" />
          </svg>
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-medium">
            {tokenSymbol}
          </span>
        </div>
        
        {tokenName && (
          <p className="text-xs text-slate-400 mt-2">Token: {tokenName}</p>
        )}
        
        {showDebug && (
          <details className="text-xs text-slate-400 mt-3 p-3 bg-slate-50 rounded-lg border">
            <summary className="cursor-pointer hover:text-slate-600 transition-colors">Debug Info</summary>
            <pre className="whitespace-pre-wrap mt-2 overflow-auto max-h-32">{debugInfo}</pre>
          </details>
        )}
      </div>

      <div className="space-y-6">
        {/* Balance Display */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200/50">
          <h3 className="text-sm font-semibold text-slate-600 mb-3">Your Balances</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">$</span>
                </div>
                <span className="text-sm text-slate-600 font-medium">{usdtSymbol || 'USDT'}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-800">
                  {usdtBalanceLoading ? (
                    <div className="animate-pulse bg-slate-200 h-4 w-16 rounded"></div>
                  ) : (
                    formattedUsdtBalance
                  )}
                </div>
                {usdtBalanceError && <span className="text-xs text-red-500">Error</span>}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">T</span>
                </div>
                <span className="text-sm text-slate-600 font-medium">{tokenSymbol}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-800">
                  {tokenBalanceLoading ? (
                    <div className="animate-pulse bg-slate-200 h-4 w-16 rounded"></div>
                  ) : (
                    formattedTokenBalance
                  )}
                </div>
                {tokenBalanceError && <span className="text-xs text-red-500">Error</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {(error || currentValidationError || usdtBalanceError || tokenBalanceError || priceError) && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">
                {error || currentValidationError || usdtBalanceError?.message || tokenBalanceError?.message || priceError?.message}
              </span>
            </div>
          </div>
        )}

        {/* Swap Interface */}
        <div className="space-y-4">
          {/* From Section */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-xl border border-slate-200/50 transition-all duration-200 hover:shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-slate-600">From</span>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-500">
                  Balance: {isSwappingToToken ? formattedUsdtBalance : formattedTokenBalance}
                </span>
                <button 
                  onClick={setMaxAmount}
                  className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow"
                >
                  MAX
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={swapAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.0"
                step="any"
                min="0"
                className="flex-1 bg-transparent text-2xl font-bold outline-none placeholder-slate-400 text-slate-800"
              />
              <div className="bg-white px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 border border-slate-200 shadow-sm">
                {isSwappingToToken ? (usdtSymbol || 'USDT') : tokenSymbol}
              </div>
            </div>
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center">
            <button
              onClick={toggleSwapDirection}
              className="bg-gradient-to-br from-slate-200 to-slate-300 hover:from-slate-300 hover:to-slate-400 p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl border border-slate-300 group"
            >
              <svg className="w-5 h-5 text-slate-600 group-hover:text-slate-700 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* To Section */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-xl border border-slate-200/50 transition-all duration-200 hover:shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-slate-600">To</span>
              <span className="text-xs text-slate-500">
                Balance: {isSwappingToToken ? formattedTokenBalance : formattedUsdtBalance}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={isPriceLoading ? "Loading..." : expectedOutput}
                readOnly
                placeholder="0.0"
                className="flex-1 bg-transparent text-2xl font-bold outline-none text-slate-600 placeholder-slate-400"
              />
              <div className="bg-white px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 border border-slate-200 shadow-sm">
                {isSwappingToToken ? tokenSymbol : (usdtSymbol || 'USDT')}
              </div>
            </div>
          </div>
        </div>

        {/* Price Impact Warning */}
        {priceImpact > 1 && (
          <div className={`p-4 rounded-xl border ${
            priceImpact > 5 
              ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-700' 
              : 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700'
          }`}>
            <div className="flex items-center space-x-2">
              <svg className={`w-4 h-4 ${priceImpact > 5 ? 'text-red-500' : 'text-yellow-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-semibold">Price Impact: {priceImpact.toFixed(2)}%</p>
                {priceImpact > 5 && (
                  <p className="text-xs mt-1">High price impact! Consider smaller amounts.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transaction Buttons */}
        <div className="space-y-3">
          {needsUsdtApproval && (
            <TransactionButton
              transaction={prepareUsdtApprovalTx}
              onTransactionSent={() => {
                console.log("USDT approval transaction sent");
                setIsLoading(true);
              }}
              onTransactionConfirmed={() => {
                console.log("USDT approval confirmed");
                setNeedsUsdtApproval(false);
                setIsLoading(false);
                refetchUsdtAllowance();
              }}
              onError={(error) => {
                setError(`USDT approval failed: ${error.message}`);
                setIsLoading(false);
              }}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #d97706, #ea580c)",
                color: "white",
                padding: "14px 20px",
                borderRadius: "12px",
                border: "none",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)",
                transition: "all 0.2s ease"
              }}
              className="hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Approving...</span>
                </div>
              ) : (
                `Approve ${usdtSymbol || 'USDT'}`
              )}
            </TransactionButton>
          )}

          {needsTokenApproval && (
            <TransactionButton
              transaction={prepareTokenApprovalTx}
              onTransactionSent={() => {
                console.log("Token approval transaction sent");
                setIsLoading(true);
              }}
              onTransactionConfirmed={() => {
                console.log("Token approval confirmed");
                setNeedsTokenApproval(false);
                setIsLoading(false);
                refetchTokenAllowance();
              }}
              onError={(error) => {
                setError(`${tokenSymbol} approval failed: ${error.message}`);
                setIsLoading(false);
              }}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #d97706, #ea580c)",
                color: "white",
                padding: "14px 20px",
                borderRadius: "12px",
                border: "none",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)",
                transition: "all 0.2s ease"
              }}
              className="hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Approving...</span>
                </div>
              ) : (
                `Approve ${tokenSymbol}`
              )}
            </TransactionButton>
          )}
          
          <TransactionButton
            transaction={prepareSwapTx}
            disabled={isSwapDisabled}
            onTransactionSent={(result) => {
              console.log("Swap transaction sent:", result);
              setIsLoading(true);
            }}
            onTransactionConfirmed={(receipt) => {
              console.log("Swap confirmed:", receipt);
              setSwapAmount("");
              setExpectedOutput("0");
              setIsLoading(false);
              setPriceImpact(0);
              // Refresh balances
              refetchUsdtBalance();
              refetchTokenBalance();
              onSwapSuccess(receipt.transactionHash);
            }}
            onError={(error) => {
              const errorMsg = `Swap failed: ${error.message}`;
              setError(errorMsg);
              setIsLoading(false);
              onSwapError(errorMsg);
            }}
            style={{
              width: "100%",
              background: isSwapDisabled 
                ? "linear-gradient(135deg, #9ca3af, #6b7280)" 
                : "linear-gradient(135deg, #ec4899, #db2777)",
              color: "white",
              padding: "16px 20px",
              borderRadius: "12px",
              border: "none",
              fontWeight: "600",
              fontSize: "16px",
              cursor: isSwapDisabled ? "not-allowed" : "pointer",
              boxShadow: isSwapDisabled 
                ? "0 2px 4px rgba(0, 0, 0, 0.1)" 
                : "0 4px 12px rgba(236, 72, 153, 0.3)",
              transition: "all 0.2s ease"
            }}
            className={`${!isSwapDisabled ? 'hover:shadow-lg transform hover:-translate-y-0.5' : ''} transition-all duration-200`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Swapping...</span>
              </div>
            ) : isPriceLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Loading Price...</span>
              </div>
            ) : (
              "Swap Tokens"
            )}
          </TransactionButton>
        </div>

        {/* Additional Info */}
        {swapAmount && expectedOutput !== "0" && !isPriceLoading && parseFloat(swapAmount) > 0 && parseFloat(expectedOutput) > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">Exchange Rate</span>
                <span className="text-sm font-semibold text-blue-800">
                  1 {isSwappingToToken ? (usdtSymbol || 'USDT') : tokenSymbol} = {
                    (parseFloat(expectedOutput) / parseFloat(swapAmount)).toFixed(6)
                  } {isSwappingToToken ? tokenSymbol : (usdtSymbol || 'USDT')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-blue-600">
                <span>Slippage Tolerance: 0.5%</span>
                <span>Network: Base Chain</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Swap;