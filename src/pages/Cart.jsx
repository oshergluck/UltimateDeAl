import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useStateContext } from '../context';
import { Loader } from '../components';
import { useNavigate } from 'react-router-dom';
import { prepareContractCall, createThirdwebClient, getContract, readContract } from "thirdweb";
import { useSendTransaction, TransactionButton } from 'thirdweb/react';
import { base } from "thirdweb/chains";
import { PinataSDK } from "pinata";

// --- Sub-Component: Store Section ---
const StoreCartSection = ({ storeAddress, items, onRemove, client, address, paymentTokenAddress }) => {
    const [allowance, setAllowance] = useState(0);
    
    // Check if storeAddress is valid (not [object Object])
    const isValidAddress = typeof storeAddress === 'string' && storeAddress.startsWith('0x');
    const displayAddress = isValidAddress ? `${storeAddress.slice(0, 6)}...${storeAddress.slice(-4)}` : "Unknown Store (Invalid Data)";

    const storeTotal = items.reduce((total, item) => {
        const price = item.price / 1e6; 
        const discount = item.discount;
        const finalPrice = price * (100 - discount) / 100;
        return total + (finalPrice * item.amount);
    }, 0);

    const paymentContract = getContract({
        client,
        chain: base,
        address: paymentTokenAddress || import.meta.env.VITE_DEAL_COIN_ADDRESS
    });

    const checkAllowance = async () => {
        if (!address || !isValidAddress) return;
        try {
            const result = await readContract({
                contract: paymentContract,
                method: "function allowance(address owner, address spender) view returns (uint256)",
                params: [address, storeAddress]
            });
            setAllowance(Number(result) / 1e6);
        } catch (e) {
            console.error("Allowance check failed:", e);
        }
    };

    useEffect(() => {
        checkAllowance();
    }, [address, storeAddress, items]);

    const needsApproval = allowance < storeTotal;

    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 mb-6 shadow-xl relative">
            {/* Store Header */}
            <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                <h3 className="text-xl font-bold text-cyan-400">Store: {displayAddress}</h3>
                <span className="text-[#FFDD00] font-bold text-lg">Subtotal: {storeTotal.toFixed(2)} $</span>
            </div>

            {/* Warning for bad data */}
            {!isValidAddress && (
                <div className="bg-red-500/20 text-red-300 p-2 rounded mb-2 text-xs">
                    Warning: This item has corrupted data. Please remove it.
                </div>
            )}

            {/* Items */}
            <div className="space-y-4 mb-4">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-lg">
                        <img src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${item.image}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`} className="w-16 h-16 object-cover rounded-md" />
                        <div className="flex-1">
                            <h4 className="font-bold">{item.name}</h4>
                            <p className="text-xs text-gray-400">{item.barcode}</p>
                            <p className="text-sm text-[#FFDD00]">Qty: {item.amount}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold">{((item.price/1e6) * (100-item.discount)/100).toFixed(2)} $</p>
                            {/* FIX: Pass item.storeContract specifically, even if it's the bad object, so reference matches context */}
                            <button onClick={() => onRemove(item.barcode, item.storeContract)} className="text-red-500 text-xs hover:text-red-400 mt-1 block ml-auto">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Approve Button */}
            {isValidAddress && (
                <div className="flex justify-end">
                    {needsApproval ? (
                        <TransactionButton
                            className="!bg-[#FFDD00] !text-black !font-bold !py-2 !px-6 !rounded-lg hover:!bg-yellow-500"
                            transaction={async () => {
                                const tx = prepareContractCall({
                                    contract: paymentContract,
                                    method: "function approve(address spender, uint256 value) returns (bool)",
                                    params: [storeAddress, BigInt(Math.ceil(storeTotal * 1e6))] // Approve plenty
                                });
                                return tx;
                            }}
                            onTransactionConfirmed={() => {
                                checkAllowance();
                            }}
                        >
                            Approve Store ({storeTotal.toFixed(2)} $)
                        </TransactionButton>
                    ) : (
                        <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500 flex items-center gap-2">
                            <span>✓ Approved</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Cart = () => {
    const { cart, removeFromCart, clearCart } = useCart();
    const { address } = useStateContext();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { mutate: sendTransaction } = useSendTransaction();
    
    // --- Registration Modal State ---
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registerData, setRegisterData] = useState({ name: '', email: '', phone: '', address: '' });
    const [pendingItemForRetry, setPendingItemForRetry] = useState(null);

    const client = createThirdwebClient({ clientId: import.meta.env.VITE_THIRDWEB_CLIENT });
    const pinata = new PinataSDK({
        pinataJwt: import.meta.env.VITE_PINATA_JWT,
        pinataGateway: "bronze-sticky-guanaco-654.mypinata.cloud",
    });

    const API_URL = import.meta.env.VITE_MONGO_SERVER_API + "/api";

    // --- Group Items by Store Address ---
    const groupedCart = cart.reduce((acc, item) => {
        // Convert objects/nulls to a safe string key for grouping
        let key = item.storeContract;
        if (typeof key !== 'string') key = "INVALID_STORE";
        
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            const price = item.price / 1e6; 
            const discount = item.discount;
            const finalPrice = price * (100 - discount) / 100;
            return total + (finalPrice * item.amount);
        }, 0).toFixed(2);
    };

    // --- Register User Function ---
    const handleRegister = async () => {
        if (!registerData.name || !registerData.email || !registerData.phone) {
            alert("Please fill all fields");
            return;
        }
        
        // Find Store Address logic
        let storeToRegister = pendingItemForRetry?.storeContract;
        if ((!storeToRegister || typeof storeToRegister !== 'string') && cart.length > 0) {
            // Find first valid store string
            const validItem = cart.find(c => typeof c.storeContract === 'string');
            if (validItem) storeToRegister = validItem.storeContract;
        }

        if (!storeToRegister || typeof storeToRegister !== 'string') {
            alert("Error: Valid store address missing. Cannot register.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: address,
                    name: registerData.name,
                    email: registerData.email,
                    phone: registerData.phone,
                    physicalAddress: registerData.address || "Digital User",
                    storeAddress: storeToRegister 
                })
            });

            const data = await response.json();
            if (data.success) {
                alert("Registered Successfully! Resuming Checkout...");
                setShowRegisterModal(false);
                handleCheckout(); 
            } else {
                alert("Registration failed: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Error registering: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!address) return alert("Connect Wallet first!");
        if (cart.length === 0) return;

        setIsLoading(true);
        try {
            for (const item of cart) {
                // Skip invalid items
                if (!item.storeContract || typeof item.storeContract !== 'string') {
                    console.warn("Skipping invalid item:", item.name);
                    continue;
                }

                console.log(`Processing: ${item.name}`);
                
                try {
                    // 1. Get Signature
                    const signResponse = await fetch(`${API_URL}/sign-purchase`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            walletAddress: address,
                            productBarcode: item.barcode,
                            amount: item.amount
                        })
                    });
                    
                    const signData = await signResponse.json();
                    
                    if (!signData.success) {
                        if (signData.error && signData.error.includes("Client not registered")) {
                            setPendingItemForRetry(item); 
                            setShowRegisterModal(true); 
                            setIsLoading(false); 
                            return; 
                        }
                        throw new Error(`Sign failed for ${item.name}: ${signData.error}`);
                    }

                    // 2. IPFS Metadata
                    const metadata = await pinata.upload.json({
                        name: `Invoice - ${item.name}`,
                        description: `Purchased via UltraShop Cart`,
                        attributes: [
                            { trait_type: "Product", value: item.name },
                            { trait_type: "Amount", value: item.amount },
                            { trait_type: "Date", value: new Date().toISOString() }
                        ]
                    });

                    // 3. Prepare Tx
                    const storeContract = getContract({
                        client,
                        chain: base,
                        address: item.storeContract
                    });

                    const transaction = prepareContractCall({
                        contract: storeContract,
                        method: "function purchaseProduct(string _productBarcode, uint256 _amount, string _info, string metadata, bytes _signature, uint256 _deadline)",
                        params: [
                            item.barcode,
                            item.amount,
                            "Cart Purchase",
                            metadata.IpfsHash,
                            signData.signature,
                            signData.deadline
                        ]
                    });

                    // 4. Send Tx
                    sendTransaction(transaction);
                    await new Promise(r => setTimeout(r, 2500)); // Delay to ensure nonce order

                } catch (innerError) {
                    console.error(`Error processing item ${item.name}:`, innerError);
                    if(!confirm(`Failed to buy ${item.name}. Try next item?`)) {
                        break; 
                    }
                }
            }

            if (!showRegisterModal) {
                alert("Checkout sequence finished. Please check your wallet transactions.");
                clearCart();
                navigate('/my-coins');
            }

        } catch (error) {
            console.error(error);
            if (!showRegisterModal) {
                alert("Error during checkout: " + error.message);
            }
        } finally {
            if (!showRegisterModal) {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen  text-white p-8 pt-[100px] relative">
            {isLoading && <Loader />}
            
            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-[#FFDD00] p-8 rounded-2xl w-full max-w-md shadow-2xl relative animate-fade-in-up">
                        <button onClick={() => { setShowRegisterModal(false); setIsLoading(false); }} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
                        <h2 className="text-2xl font-bold text-[#FFDD00] mb-2 text-center">One-Time Registration</h2>
                        <p className="text-gray-400 text-sm text-center mb-6">Complete registration to finish purchase.</p>
                        <div className="space-y-4">
                            <input type="text" placeholder="Full Name" value={registerData.name} onChange={e => setRegisterData({...registerData, name: e.target.value})} className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-[#FFDD00] outline-none" />
                            <input type="email" placeholder="Email Address" value={registerData.email} onChange={e => setRegisterData({...registerData, email: e.target.value})} className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-[#FFDD00] outline-none" />
                            <input type="tel" placeholder="Phone Number" value={registerData.phone} onChange={e => setRegisterData({...registerData, phone: e.target.value})} className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-[#FFDD00] outline-none" />
                            <input type="text" placeholder="Shipping Address (Optional)" value={registerData.address} onChange={e => setRegisterData({...registerData, address: e.target.value})} className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-[#FFDD00] outline-none" />
                            <button onClick={handleRegister} className="w-full bg-[#FFDD00] hover:bg-orange-400 text-black font-bold py-3 rounded-xl shadow-lg mt-4 transition-transform hover:scale-[1.02]">Register & Continue</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-[#FFDD00]">Shopping Cart</h1>
                    {cart.length > 0 && (
                        <button onClick={clearCart} className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 border border-red-500/50">
                            Clear Cart 🗑️
                        </button>
                    )}
                </div>

                {cart.length === 0 ? (
                    <div className="text-center mt-20">
                        <h2 className="text-2xl">Your cart is empty 🛒</h2>
                        <button onClick={() => navigate('/home')} className="mt-4 bg-cyan-500 text-black px-6 py-2 rounded-full font-bold">Go Shopping</button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Side: Store Groups */}
                        <div className="flex-1">
                            {Object.entries(groupedCart).map(([storeAddress, items]) => (
                                <StoreCartSection 
                                    key={storeAddress} 
                                    storeAddress={storeAddress} 
                                    items={items} 
                                    onRemove={removeFromCart} 
                                    client={client}
                                    address={address}
                                    paymentTokenAddress={import.meta.env.VITE_DEAL_COIN_ADDRESS}
                                />
                            ))}
                        </div>

                        {/* Right Side: Total Summary */}
                        <div className="w-full lg:w-[350px]">
                            <div className="bg-slate-900 p-6 rounded-xl border border-[#FFDD00] sticky top-[100px]">
                                <h3 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">Grand Total</h3>
                                <div className="flex justify-between mb-2">
                                    <span>Total Items</span>
                                    <span>{cart.length}</span>
                                </div>
                                <div className="flex justify-between mb-6 text-xl font-bold text-[#00FFFF]">
                                    <span>Final Price</span>
                                    <span>{calculateTotal()} $USDC</span>
                                </div>
                                
                                <button 
                                    onClick={handleCheckout}
                                    disabled={isLoading}
                                    className="w-full bg-[#FFDD00] hover:bg-orange-400 text-black font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-105 disabled:opacity-50"
                                >
                                    {isLoading ? "Processing..." : "Checkout All Stores 🚀"}
                                </button>
                                <p className="text-xs text-center text-gray-500 mt-2">
                                    You must 'Approve' each store before checkout.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;