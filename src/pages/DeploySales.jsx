import React, { useState, useEffect } from "react";
import { createThirdwebClient } from "thirdweb";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { deployPublishedContract } from "thirdweb/deploys";
import { base } from "thirdweb/chains";
import { Wallet, Rocket, CheckCircle2, AlertCircle, Coins } from "lucide-react";

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT,
});

export default function DeploySales() {
  const account = useActiveAccount();
  const [formData, setFormData] = useState({
    ESHToken: "",
    ESHInvoicesMinter: "",
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

  const handleDeploy = async () => {
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    if (!formData.ESHToken.trim()) {
      setError("Please enter a ESH Token Address");
      return;
    }
    if (!formData.ESHInvoicesMinter.trim()) {
      setError("Please enter a ESH Invoice Address");
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
        ESHToken: formData.ESHToken,
        ESHInvoicesMinter: formData.ESHInvoicesMinter,
        contractOwner: formData.contractOwner
      };

      const address = await deployPublishedContract({
        client: client,
        chain: base,
        account: account,
        publisher: "0xfb311Eb413a49389a2078284B57C8BEFeF6aFF67",
        contractId: "ESHStoreSales",
        contractParams: params
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

  return (
    <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Deploy ESH Store Sales</h1>
          <p className="text-white">Create and deploy your custom shop contract on Base</p>
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
                  ESH Token Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ESHToken"
                  value={formData.ESHToken}
                  onChange={handleInputChange}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                />
              </div>

              {/* Token Symbol */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                ESHInvoicesMinter Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ESHInvoicesMinter"
                  value={formData.ESHInvoicesMinter}
                  onChange={handleInputChange}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                />
                <p className="mt-1 text-xs text-gray-500">Address</p>
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