import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Featured, FeaturedMobile,IPFSMediaViewer } from '../components';
import { RegisterNewStore, City,SnakeGame ,MemoryGame,TexasHoldemGame} from '../pages';

import { useMediaQuery } from 'react-responsive';
import { useStateContext } from '../context';
import { useContract } from '@thirdweb-dev/react';

const Extra = () => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [isLoading, setIsLoading] = useState(false);
    const StoreURL = window.location.pathname.split('/')[2];
    const ProductURL = window.location.pathname.split('/')[4];
    const [ownerShip, setOwnerShip] = useState(false);
    const [invoicesAddress, setInvoicesAddress] = useState('');
    const [media, setMedia] = useState('');
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    
    const { contract: invoicesContract } = useContract(invoicesAddress);
    const { address, getStoreDetails, storeRegistery, decryptIPFS,PokerLobby } = useStateContext();
    const [storeContractByURL, setStoreContractByURL] = useState('');
    const { contract: theStoreContract } = useContract(storeContractByURL);
    const { contract: Curses } = useContract('0x3e148491A9132D47201626A7161e09ad897e5861');

    function decodeUrlString(str) {
        return decodeURIComponent(str);
    }

    // Step 1: Set up store contract
    useEffect(() => {
        const setContract = async () => {
            if (!storeRegistery || !StoreURL) return;
            
            try {
                setIsLoading(true);
                console.log('Setting up store contract...');
                const data = await getStoreDetails(StoreURL);
                const theData = await data[1];
                setStoreContractByURL(theData);
                console.log('Store contract set:', theData);
            } catch (error) {
                console.error('Error setting contract:', error);
                setError('Failed to load store details');
            } finally {
                setIsLoading(false);
            }
        };

        setContract();
    }, [storeRegistery, StoreURL]);

    // Step 2: Get invoices address
    useEffect(() => {
        const getInvoices = async () => {
            try {
                setIsLoading(true);
                console.log('Getting invoices address...');
                const dataOfInvoice = await theStoreContract.call('invoices');
                setInvoicesAddress(dataOfInvoice);
                console.log('Invoices address set:', dataOfInvoice);
            } catch (error) {
                console.error('Error getting invoices:', error);
                setError('Failed to load invoice information');
            } finally {
                setIsLoading(false);
            }
        };
        if(theStoreContract) {
            getInvoices();
        }
    }, [theStoreContract]);

    // Check if all dependencies are initialized
    useEffect(() => {
        if (invoicesContract && address && ProductURL && StoreURL && !isInitialized) {
            console.log('All dependencies initialized');
            setIsInitialized(true);
        }
    }, [invoicesContract, address, ProductURL, StoreURL, isInitialized]);

    // Step 3: Check ownership and get IPFS content
    useEffect(() => {
        const loadOwnershipAndMedia = async () => {
            if (!isInitialized) {
                console.log('Waiting for initialization...');
                return;
            }
            
            try {
                setIsLoading(true);
                setError(null);
                
                console.log('Checking ownership...');
                console.log('Address:', address);
                console.log('ProductURL:', ProductURL);
                
                // Add delay to ensure contract is fully initialized
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Check ownership
                const ownershipData = await invoicesContract.call('verifyOwnershipByBarcode', [address, ProductURL]);
                console.log('Ownership verified:', ownershipData);
                setOwnerShip(ownershipData);

                if (ownershipData) {
                    // Get IPFS content
                    console.log('Loading IPFS content...');
                    const decodedProduct = decodeUrlString(ProductURL);
                    const decodedStore = decodeUrlString(StoreURL);
                    const ipfsData = await Curses.call('getIPFS', [decodedStore, decodedProduct, invoicesAddress, address]);
                    const decryptedData = await decryptIPFS(ipfsData);
                    setMedia(decryptedData);
                    console.log('Media loaded successfully');
                }
            } catch (error) {
                console.error('Error checking ownership or loading media:', error);
                setError('No hidden media for this product');
            } finally {
                setIsLoading(false);
            }
        };
        if(Curses) {
            loadOwnershipAndMedia();
        }
    }, [isInitialized,Curses]);

    const renderContent = () => {
        if (StoreURL === 'UltimateDeAl' && ProductURL === 'LISTESH') {
            return (<><div>
            <RegisterNewStore />
            </div>
            </>);
        }
        if (StoreURL === 'UltimateDeAl' && ProductURL === 'LOTERRY') {
            return <City />;
        }
        if (StoreURL === 'UltimateDeAl' && ProductURL === 'PROS') {
            return <SnakeGame/>;
        }
        if (StoreURL === 'UltimateDeAl' && ProductURL === 'FUNDPROS') {
            return <MemoryGame/>;
        }
        return null;
    };

    return (
        <>{isLoading && <Loader />}
            <div className="py-[35px] mx-auto">
                {isMobile ? <FeaturedMobile /> : <Featured />}
            </div>
            {error && (
                <div className="text-red-500 text-center mt-4">
                    {error}
                    <div className="min-h-screen linear-gradient rounded-[15px] mt-[40px] pb-[15px] ">
                    <h2 className='text-center font-bold text-[#00FFFF] text-[24px] my-[15px] pt-[20px]'>
                        NFT Hidden Media
                    </h2>
                    {renderContent()}
                    </div>
                </div>
                
            )}
            {ownerShip && media && (
                <div className="min-h-screen linear-gradient rounded-[15px] mt-[40px] pb-[15px] ">
                    <h2 className='text-center font-bold text-[#00FFFF] text-[24px] my-[15px] pt-[20px]'>
                        NFT Hidden Media
                    </h2>
                    <IPFSMediaViewer 
                    ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${media}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                    className='my-[50px] !w-11/12 mx-auto'
                    />
                    {renderContent()}
                </div>
            )}
        </>
    );
};

export default Extra;