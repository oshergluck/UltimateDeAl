import React, { useState } from 'react';
import { useStateContext } from '../context'
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const [encryptedName, setEncryptedName] = useState('');
    const [moderatorAddress, setModeratorAddress] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [encryptedPhone, setEncryptedPhone] = useState('');
    const [encryptedEmail, setEncryptedEmail] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [CampaignIndex, setCampaignIndex] = useState('');
    const [Cost, setNewCost] = useState('');
    const [AmountForPayment, setAmountForPayment] = useState('');
    const [Discount, setDiscount] = useState('');
    const [Comment, setComment] = useState('');
    const [decryptedData, setDecryptedData] = useState({ name: '', email: '', phone: '' });
    const [CustomersDetails, setCustomersDetails] = useState([{}]);
    const {Decryption,Verification,unVerification,stopCampaign,getCustomer,setCost,setDiscountRate,addModeratorToBlogContract,addModeratorToCampaignContract,RemoveModeratorBlogContract,RemoveModeratorCampaignContract} = useStateContext();
    const navigate = useNavigate();
    const handleDecrypt = () => {
        setDecryptedData({
            name: Decryption(encryptedName, secretKey),
            email: Decryption(encryptedEmail, secretKey),
            phone: Decryption(encryptedPhone, secretKey)
        });
        console.log(decryptData.name)
    };

    function EditPost() {
        navigate('/edit-post')
    }

    function AddNewStore() {
        navigate('/register-new-store')
    }

    function SetOfficialStore() {
        navigate('/set-official-store')
    }

    function NewPost() {
        navigate('/newpost')
    }

    const handleGetAllCustomers = () => {
        getAllCustomers()
            .then(customers => {
                console.log('Customers data:', customers);
                setCustomersDetails(customers);
            })
            .catch(error => {
                console.error('Error fetching customers data:', error);
            });
    };

    const handleCustomer = () => {
        setCustomerAddress(customerAddress);
        console.log(customerAddress);
        getCustomer(customerAddress)
            .then(customer => {
                console.log('Customer data:', customer);
                setEncryptedEmail(customer.customerEmail);
                setEncryptedPhone(customer.customerPhoneNum);
                setEncryptedName(customer.customerName);
            })
            .catch(error => {
                console.error('Error fetching customer data:', error);
            });
    };

    const handleVerification = () => {
        setCampaignIndex(CampaignIndex);
        setComment(Comment);
        Verification(CampaignIndex,Comment);
    };

    const handleAddModeratorToCrowdFunding = () => {
        setModeratorAddress(moderatorAddress);
        addModeratorToCampaignContract(moderatorAddress);
    };

    const handleAddModeratorToBlog = () => {
        setModeratorAddress(moderatorAddress);
        addModeratorToBlogContract(moderatorAddress);
    };

    const handleRemoveModeratorFromCrowdFunding = () => {
        setModeratorAddress(moderatorAddress);
        RemoveModeratorCampaignContract(moderatorAddress);
    };

    const handleRemoveModeratorFromBlog = () => {
        setModeratorAddress(moderatorAddress);
        RemoveModeratorBlogContract(moderatorAddress);
    };

    const handlePayForWorker = () => {
        setModeratorAddress(moderatorAddress);
        setAmountForPayment(AmountForPayment);
        PayForWorker(moderatorAddress,AmountForPayment);
    };

    const handleUnVerification = () => {
        setCampaignIndex(CampaignIndex);
        unVerification(CampaignIndex);
    };
    const handleNewCost = () => {
        setNewCost(Cost);
        setCost(Cost);
    };
    const handleDiscount = (Discount) => {
        setDiscount(Discount);
        setDiscountRate(Discount);
    };

    const handleStopping = () => {
        setCampaignIndex(CampaignIndex);
        stopCampaign(CampaignIndex);
    };

    const handleDistributeProfit = () => {
        distributeProfit();
    };

    return (
        <div className="container mx-auto p-4">
            <p className='my-[10px] font-bold rounded-[2px] bg-[#cf0000] h-[70px] py-[20px] text-center'>Must have a premision, dont even try</p>
            <div className=' flex flex-col gap-3 items-center'>
                <input
                className="border border-gray-300 rounded p-2 "
                type="text"
                placeholder="Campaign Index"
                value={CampaignIndex}
                onChange={e => setCampaignIndex(e.target.value)}
                />
                <input
                className="border border-gray-300 rounded p-2 w-[105%]"
                type="text"
                placeholder="Website Comment for the verification"
                value={Comment}
                onChange={e => setComment(e.target.value)}
                />
                <button 
                className="bg-[#ff9900] hover:bg-[#00ffff] text-[#000000] font-bold py-2 px-4 rounded mb-2"
                onClick={handleVerification}
                >
                Verify Campaign
                </button>
                <button 
                className="bg-[#ff9900] hover:bg-[#00ffff] text-[#000000] font-bold py-2 px-4 rounded mb-2"
                onClick={handleStopping}
                >
                Stop Campaign
                </button>
                <button 
                className="bg-[#ff9900] hover:bg-[#00ffff] text-[#000000] font-bold py-2 px-4 rounded mb-2"
                onClick={handleUnVerification}
                >
                Disqualify Campaign
                </button>
                <button 
                className="bg-[#ff9900] hover:bg-[#00ffff] text-[#000000] font-bold py-2 px-4 rounded mb-2"
                onClick={NewPost}
                >
                New Post
                </button>
                <button 
                className="bg-[#ff9900] hover:bg-[#00ffff] text-[#000000] font-bold py-2 px-4 rounded mb-2"
                onClick={EditPost}
                >
                Edit Post
                </button>
                <button 
                className="bg-[#ff9900] hover:bg-[#00ffff] text-[#000000] font-bold py-2 px-4 rounded mb-2"
                onClick={SetOfficialStore}
                >
                Set Official Store
                </button>
                <button 
                className="bg-[#ff9900] hover:bg-[#00ffff] text-[#000000] font-bold py-2 px-4 rounded mb-2"
                onClick={AddNewStore}
                >
                Register A New Store
                </button>
            </div>
            <div className=' flex flex-col gap-3 items-center'>
                <input
                className="border border-gray-300 rounded p-2 "
                type="number"
                placeholder="New Campaign Cost"
                value={Cost}
                onChange={e => setNewCost(e.target.value)}
                />
                <button 
                    className="bg-[#ff9900] hover:bg-[#00ffff] text-[#000000] font-bold py-2 px-4 rounded mb-2"
                    onClick={handleNewCost}
                > Set New Campaign Cost</button>
            </div>
            <div className=' flex flex-col gap-3 items-center'>
                <input
                className="border border-gray-300 rounded p-2 "
                type="number"
                placeholder="New Discount Rate"
                value={Discount}
                onChange={e => setDiscount(e.target.value)}
                />
                <button 
                    className="bg-[#ff9900] hover:bg-[#00ffff] text-[#000000] font-bold py-2 px-4 rounded mb-2"
                    onClick={() => handleDiscount(Discount)}
                > Set New Discount Rate</button>
            </div>
            <div className=' flex flex-col gap-3 items-center'>
                <input
                className="border border-gray-300 rounded p-2 mt-[10px] sm:w-[450px] w-11/12"
                type="text"
                placeholder="Moderator Address"
                value={moderatorAddress}
                onChange={e => setModeratorAddress(e.target.value)}
                />
                <button 
                    className="bg-[#ff9900] hover:bg-[#00ffff] text-[#000000] font-bold py-2 px-4 rounded mb-2"
                    onClick={handleAddModeratorToCrowdFunding}
                > Add Moderator To Campaign Contract</button>
                <button 
                    className="bg-[#ff9900] hover:bg-[#00ffff] text-[#000000] font-bold py-2 px-4 rounded mb-2"
                    onClick={handleAddModeratorToBlog}
                > Add Moderator To Blog Contract</button>
                <button 
                    className="bg-[#ff9900] hover:bg-[#00ffff] text-[#000000] font-bold py-2 px-4 rounded mb-2"
                    onClick={handleRemoveModeratorFromCrowdFunding}
                > Remove Moderator From Campaign Contract</button>
                <button 
                    className="bg-[#ff9900] hover:bg-[#00ffff] text-[#000000] font-bold py-2 px-4 rounded"
                    onClick={handleRemoveModeratorFromBlog}
                > Remove Moderator From Blog Contract</button>
            </div>   
        </div>
    );
};

export default Admin;
