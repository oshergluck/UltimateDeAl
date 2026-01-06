import React, { useState, useEffect } from "react";
import { createThirdwebClient } from "thirdweb";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { deployPublishedContract } from "thirdweb/deploys";
import { base } from "thirdweb/chains";
import { Wallet, Rocket, CheckCircle2, AlertCircle, Coins } from "lucide-react";
import { useNavigate } from 'react-router-dom';
const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT,
});

export default function DeployPublishedContractPage() {
  const account = useActiveAccount();
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    totalSupply: "1000000000",
    contractOwner: ""
  });
  const [deployedAddress, setDeployedAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (account?.address) {
      setFormData(prev => ({
        ...prev,
        contractOwner: account.address
      }));
    }
  }, [account?.address]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const navigateToCoinLauncher = () => {
    navigate('/coin-launcher');
}

  const handleDeploy = async () => {
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    if (!formData.name.trim()) {
      setError("Please enter a token name");
      return;
    }
    if (!formData.symbol.trim()) {
      setError("Please enter a token symbol");
      return;
    }
    if (!formData.totalSupply || parseFloat(formData.totalSupply) <= 0) {
      setError("Please enter a valid total supply");
      return;
    }
    if (!formData.contractOwner.trim()) {
      setError("Please enter a contract owner address");
      return;
    }

    setLoading(true);
    setError("");
    setDeployedAddress("");

    try {
      const params = {
        name: formData.name,
        symbol: formData.symbol,
        contractOwner: formData.contractOwner
      };

      const address = await deployPublishedContract({
        client: client,
        chain: base,
        account: account,
        publisher: "0x070e7075939183Df83bF7F14D9142a2c33a6470a",
        contractId: "ESH",
        contractParams: params,
      });
      setDeployedAddress(address);
    } catch (err) {
      console.log(err);
      
      if (err.message && err.message.includes("Could not find deployed contract address")) {
        const txHashMatch = err.message.match(/0x[a-fA-F0-9]{64}/);
        if (txHashMatch) {
          const txHash = txHashMatch[0];
          setError(`Deployment transaction sent! Check BaseScan: https://basescan.org/tx/${txHash}`);
          setDeployedAddress("Check transaction on BaseScan");
        } else {
          setError(err.message);
        }
      } else {
        setError(err.message || "Deployment failed");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  },[]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Deploy ESH Token</h1>
          <p className="text-white">Create and deploy your custom token contract on Base Mint 1Billion Tokens Predefined</p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl shadow-xl overflow-hidden">
          {/* Wallet Connection Bar */}

          {/* Form Content */}
          <div className="p-8">
            {account && (
              <></>
            )}

            {!account && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Connect Your Wallet</p>
                  <p className="text-xs text-amber-700 mt-1">Please connect your wallet to deploy a contract</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Token Name */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Token Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., My Awesome Token"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                />
              </div>

              {/* Token Symbol */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Token Symbol <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  placeholder="e.g., MAT"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 uppercase"
                  maxLength="10"
                />
                <p className="mt-1 text-xs text-gray-500">Usually 3-5 characters</p>
              </div>

              {/* Contract Owner */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Contract Owner Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contractOwner"
                  value={formData.contractOwner}
                  onChange={handleInputChange}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {account ? "Auto-filled with your connected wallet" : "Connect wallet to auto-fill"}
                </p>
              </div>

              {/* Deploy Button */}
              <button
                onClick={handleDeploy}
                disabled={loading || !account}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                  loading || !account
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deploying Contract...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    <span>Deploy Contract</span>
                  </>
                )}
              </button>
            </div>

            {/* Success Message */}
            {deployedAddress && (
              <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900 text-lg">Deployed Successfully! 🎉</p>
                    <p className="text-sm text-green-800 mt-2">Contract Address:</p>
                    <p className="font-mono text-sm bg-white px-3 py-2 rounded-lg mt-1 break-all border border-green-200 text-gray-900">
                      {deployedAddress}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-5 bg-red-50 border-2 border-red-300 rounded-xl">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900 text-lg">Error</p>
                    <p className="text-sm text-red-800 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Deploying on <span className="font-semibold text-blue-600">Base Network</span></p>
        </div>
      </div>
    </div>
  );
}