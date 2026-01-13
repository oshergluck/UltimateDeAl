import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Featured, FeaturedMobile, IPFSMediaViewer } from '../components';
import { RegisterNewStore, City, SnakeGame, MemoryGame, TexasHoldemGame } from '../pages';
import { useMediaQuery } from 'react-responsive';
import { useStateContext } from '../context';
import { useContract } from '@thirdweb-dev/react';
import { ethers } from 'ethers'; // חובה עבור החתימה

const Extra = () => {
    const navigate = useNavigate();
    const [rendered,setRendered] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [isLoading, setIsLoading] = useState(false);
    
    // URL Parsing
    const StoreURL = window.location.pathname.split('/')[2];
    const ProductURL = window.location.pathname.split('/')[4];
    
    // State
    const [ownerShip, setOwnerShip] = useState(false);
    const [invoicesAddress, setInvoicesAddress] = useState('');
    const [media, setMedia] = useState('');
    const [error, setError] = useState(null);
    const [storeContractByURL, setStoreContractByURL] = useState('');
    const [isStoreLoaded, setIsStoreLoaded] = useState(false);

    // Context & Contracts
    const { address, getStoreDetails, storeRegistery } = useStateContext();
    const { contract: theStoreContract } = useContract(storeContractByURL);
    
    // API URL
    const API_URL = import.meta.env.VITE_MONGO_SERVER_API + "/api";

    function decodeUrlString(str) {
        return decodeURIComponent(str);
    }

    // Step 1: Set up store contract from URL
    useEffect(() => {
        const setContract = async () => {
            if (!storeRegistery || !StoreURL) return;
            
            try {
                setIsLoading(true);
                const data = await getStoreDetails(StoreURL);
                const theData = await data[1]; // Store Contract Address
                setStoreContractByURL(theData);
            } catch (error) {
                console.error('Error setting contract:', error);
                setError('Failed to load store details');
            } finally {
                setIsLoading(false);
            }
        };

        setContract();
    }, [storeRegistery, StoreURL]);

    // Step 2: Get invoices address from Store Contract
    useEffect(() => {
        const getInvoices = async () => {
            try {
                const dataOfInvoice = await theStoreContract.call('invoices');
                setInvoicesAddress(dataOfInvoice);
                setIsStoreLoaded(true);
            } catch (error) {
                console.error('Error getting invoices:', error);
            }
        };
        if(theStoreContract) {
            getInvoices();
        }
    }, [theStoreContract]);

    // --- New Function: Unlock Content via API ---
    const handleUnlockContent = async () => {
        if (!address) {
            alert("Please connect your wallet first.");
            return;
        }
        if (!isStoreLoaded || !invoicesAddress) {
            alert("Store data not fully loaded yet. Please wait.");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // 1. Prepare Data
            const timestamp = Date.now();
            const barcode = decodeUrlString(ProductURL);
            
            // הודעה זהה בדיוק למה שהוגדר בשרת
            const message = `I confirm ownership check for product ${barcode} at ${timestamp}`;

            // 2. Sign Message
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const signature = await signer.signMessage(message);

            // 3. Call API
            const response = await fetch(`${API_URL}/access-hidden-content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    walletAddress: address,
                    signature: signature,
                    timestamp: timestamp,
                    storeAddress: storeContractByURL,
                    invoiceContractAddress: invoicesAddress,
                    productBarcode: barcode
                })
            });

            const data = await response.json();

            if (data.success) {
                setMedia(data.ipfsHash);
                setOwnerShip(true);
                setRendered(true);
            } else {
                throw new Error(data.error || "Access Denied");
            }

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to verify ownership");
            setOwnerShip(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Render Special Pages (Games/Register)
    const renderContent = () => {
        if (StoreURL === 'USP' && ProductURL === 'LISTESH') {
            return (<div><RegisterNewStore /></div>);
        }
        if (StoreURL === 'USP' && ProductURL === 'LOTERRY') {
            return <City />;
        }
        if (StoreURL === 'USP' && ProductURL === 'PROS') {
            return <SnakeGame/>;
        }
        if (StoreURL === 'USP' && ProductURL === 'FUNDPROS') {
            return <MemoryGame/>;
        }
        return null;
    };

    return (
        <>
            {isLoading && <Loader />}
            <div className="py-[35px] mx-auto">
                {isMobile ? <FeaturedMobile /> : <Featured />}
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-red-500 text-center mt-4 bg-red-100/10 p-4 rounded-lg mx-auto w-11/12 max-w-md border border-red-500">
                    <p className="font-bold">{error}</p>
                </div>
            )}

            <div className="min-h-screen rounded-[15px] mt-[20px] pb-[15px]">
                <h2 className='text-center font-bold text-[#00FFFF] text-[24px] my-[15px] pt-[20px]'>
                    NFT Hidden Media
                </h2>

                {/* If we have access -> Show Media */}
                {ownerShip && media ? (
                    <div className="animate-fade-in">
                        <p className="text-center text-green-400 mb-4">Access Granted ✅</p>
                        <IPFSMediaViewer 
                            ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${media}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                            className='my-[50px] !w-11/12 mx-auto'
                        />
                    </div>
                ) : (
                    // If no access yet -> Show Unlock Button (Only for normal products, not special pages)
                    !rendered && (
                        <div className="flex flex-col items-center justify-center space-y-4 my-10">
                            <p className="text-gray-300 text-center px-4">
                                This content is exclusive to NFT owners.<br/>
                                Please sign to verify ownership and unlock.
                            </p>
                            <button 
                                onClick={handleUnlockContent}
                                disabled={isLoading || !isStoreLoaded}
                                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-full shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Verifying..." : "🔓 Unlock Hidden Content"}
                            </button>
                        </div>
                    )
                )}

                {/* Render Special Content (Games etc) */}
                {renderContent()}
            </div>
        </>
    );
};

export default Extra;