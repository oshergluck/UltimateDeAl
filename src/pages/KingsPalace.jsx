import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContract } from '@thirdweb-dev/react';
import { createThirdwebClient, prepareContractCall, getContract } from "thirdweb";
import { TransactionButton } from 'thirdweb/react';
import { Loader, StoreBox } from '../components';
import { format, addDays } from 'date-fns';
import axios from 'axios';

const City = () => {
    const [cityStores, setCityStores] = useState([]);
    const navigate = useNavigate();
    const { refreshPage, storeRegistery, address } = useStateContext();
    const client = createThirdwebClient({ clientId: import.meta.env.VITE_THIRDWEB_CLIENT });
    const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
    const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`;
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [ticketsOwned, setTicketsOwned] = useState(0);
    const [participantsCount, setParticipantsCount] = useState(0);
    const [registrationCost, setRegistrationCost] = useState(0);
    const [totalDeposited, setTotalDeposited] = useState(0);
    const [ticketsToBuy, setTicketsToBuy] = useState(1);
    const [cityName, setCityName] = useState('');
    const [story, setStory] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    const { contract: luckMachineContract } = useContract(import.meta.env.VITE_LUCKDEAL);
    const luckMachineContract2 = getContract({
        client: client,
        chain: { id: 8453, rpc: POLYRPC },
        address: import.meta.env.VITE_LUCKDEAL,
    });

    const storeContract = getContract({
        client: client,
        chain: { id: 8453, rpc: POLYRPC },
        address: '0xaf4464724CefbA07e347AFDEa6B4E6d4e88fe580',
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchData();
        extractCityName();
    }, [luckMachineContract, address, location]);

    const fetchData = async () => {
        if (luckMachineContract && address) {
            setIsLoading(true);
            try {
                const [registrationCostData, totalDepositedData, participantsCountData, ticketsOwnedData] = await Promise.all([
                    luckMachineContract.call('registrationCost'),
                    luckMachineContract.call('totalDeposited'),
                    luckMachineContract.call('getParticipantsCount'),
                    luckMachineContract.call('ticketsOwned', [address])
                ]);

                setRegistrationCost(registrationCostData / 1e6);
                setTotalDeposited(totalDepositedData / 1e6);
                setParticipantsCount(participantsCountData.toNumber());
                setTicketsOwned(ticketsOwnedData.toNumber());
            } catch (error) {
                alert('Contact support: ' + error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const extractCityName = () => {
        const pathSegments = location.pathname.split('/');
        const lastSegment = pathSegments[pathSegments.length - 1];
        const city = decodeURIComponent(lastSegment);
        setCityName(city || 'Unknown City');
        fetchCityStores(city);
    };

    const fetchCityStores = async (city) => {
        if (storeRegistery) {
            try {
                const allStores = await storeRegistery.call('getAllStores');
                const filteredStores = allStores.filter(store => 
                    store.city.toLowerCase() === city.toLowerCase()
                );
                setCityStores(filteredStores);
            } catch (error) {
                console.error('Error fetching city stores:', error);
            }
        }
    };

    const handleTicketChange = (e) => {
        setTicketsToBuy(Math.max(1, parseInt(e.target.value) || 1));
    };

    const generateStory = async () => {
        setIsLoading(true);
        const startDate = new Date(2784, 0, 1); // January 1, 2874
        const currentDate = addDays(startDate, totalDeposited/90);
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: `Generate 24 news headlines for the imaginary city of ${cityName}. The city has ${participantsCount+1000000000} citizens, including the following notable residents:

${cityStores.map(store => store.contactInfo).join(', ')}

The mayor of the city is ${cityStores[0]?.contactInfo || 'Mayor Unknown'}. Each headline represents events happening over a 24-hour period starting from ${format(currentDate, 'MMMM do, yyyy')}. Make the headlines engaging and varied, including the names of the citizens listed above as well as other imaginary names for people and places. Some citizens may have been involved in conflicts or passed away from old age, so feel free to incorporate these elements into the storyline.

For each headline, include the time (in 24-hour format) and the date. Here's the format:

[Date: ${format(currentDate, 'MMMM do, yyyy')}]

[Time] Headline

Example:
[Date: January 1st, 2025]

00:00 - Mayor ${cityStores[0]?.contactInfo || 'Unknown'} Announces Plans for New Skybridge
03:15 - Unexpected Meteor Shower Delights Night Owls at Celestial Park
06:30 - Local Chef ${cityStores[1]?.contactInfo || 'Aria Flametongue'} Wins Intergalactic Cooking Competition
08:12 - There was a sale on base.blockscout.com/address/0xaf4464724CefbA07e347AFDEa6B4E6d4e88fe580 (generate blocks hashes and put all those mother fuckers ailens in debt.) generate all the sales based on the link https://www.ultimatedeal.net/store/DeAl
09:15 - Someone registered at https://www.ultimatedeal.net/register-new-store
 
...

Please generate 24 headlines following this format, covering a full 24-hour period. Include at least two headlines featuring the mayor's activities or decisions. Use creative and futuristic elements fitting for the year 2874. Incorporate stories about conflicts, alliances, and significant events involving the listed citizens.`
                }],
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            setStory(response.data.choices[0].message.content);
            await createVideo(response.data.choices[0].message.content);
        } catch (error) {
            console.error('Error generating story:', error);
            setStory('Failed to generate story. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const createVideo = async (storyContent) => {
        try {
            const response = await axios.post('https://api.synthesia.io/v2/videos', {
                title: `${cityName} News Update`,
                description: "AI-generated news for our futuristic city",
                visibility: "public",
                template: "news_presenter",
                input: [
                    {
                        scriptText: storyContent,
                        voiceId: "en-US-Jenny",
                    }
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_SYNTHESIA_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const videoId = response.data.id;
            await checkVideoStatus(videoId);
        } catch (error) {
            console.error('Error creating video:', error);
            alert('Failed to create video. Please try again.');
        }
    };

    const checkVideoStatus = async (videoId) => {
        try {
            const response = await axios.get(`https://api.synthesia.io/v2/videos/${videoId}`, {
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_SYNTHESIA_API_KEY}`
                }
            });

            if (response.data.status === 'complete') {
                setVideoUrl(response.data.download);
                alert("A new episode of the latest news in " + cityName + " has been created!");
            } else if (response.data.status === 'failed') {
                alert('Video creation failed. Please try again.');
            } else {
                setTimeout(() => checkVideoStatus(videoId), 10000); // Check again after 10 seconds
            }
        } catch (error) {
            console.error('Error checking video status:', error);
        }
    };

    return (
        <div className="container linear-gradient1 rounded-[15px] mx-auto p-8 mt-[35px]">
            {isLoading && <Loader />}
            <h1 className="text-center font-bold text-[#ff9900] drop-shadow-md pb-[25px] sm:text-[50px] text-[30px]">DeAl Spinner</h1>
            
            <h2 className="sm:text-8xl text-5xl font-bold text-white mb-2 text-center">Welcome to {cityName}</h2>
            
            <div className="mb-12">
                <h2 className="text-3xl font-bold text-[#00FFFF] mb-4 text-center">Stores in {cityName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cityStores.map((store, index) => (
                        <StoreBox key={index} store={store} />
                    ))}
                </div>
            </div>
    
            <p className="text-white text-lg leading-relaxed mb-8">
                In {cityName}, You dont have to pay for living. You have to pay to get the news of today about the city you built, 
            </p>
            <p className="text-white text-lg leading-relaxed mb-8">
                In the bustling city of {cityName}, where magic and technology intertwine, 
                the DeAl Spinner stands as a beacon of hope and excitement. This mystical device, 
                powered by ancient runes and cutting-edge circuitry, offers citizens a chance to 
                escape the daily grind and dream of a brighter future.
            </p>
    
            {address ? (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-lg shadow-lg text-white w-full md:w-1/4">
                            <h2 className="text-2xl font-bold mb-2">Day Cost</h2>
                            <p className="text-3xl font-semibold">{registrationCost} DeAl</p>
                        </div>
                        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-6 rounded-lg shadow-lg text-white w-full md:w-1/4">
                            <h2 className="text-2xl font-bold mb-2">Total Deposited</h2>
                            <p className="text-3xl font-semibold">{totalDeposited} DeAl</p>
                        </div>
                        <div className="bg-gradient-to-r from-green-400 to-teal-500 p-6 rounded-lg shadow-lg text-white w-full md:w-1/4">
                            <h2 className="text-2xl font-bold mb-2">All DeAl Kingdom</h2>
                            <p className="text-3xl font-semibold">{participantsCount} + 1000000000 Ailens and Robots</p>
                        </div>
                        <div className={`p-6 rounded-lg shadow-lg text-white w-full md:w-1/4 ${ticketsOwned > 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-to-r from-gray-400 to-gray-600'}`}>
                            <h2 className="text-2xl font-bold mb-2 drop-shadow-md">Your Days</h2>
                            <p className="text-3xl font-semibold drop-shadow-md">{ticketsOwned}</p>
                        </div>
                    </div>
    
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#00FFFF] mb-4">Try Your Luck!</h2>
                        <p className="text-xl text-white mb-8">Buy tickets for a chance to win big!</p>
                        <div className="mb-4">
                            <label htmlFor="ticketsToBuy" className="text-white mr-2">Number of Papers</label>
                            <input
                                type="number"
                                id="ticketsToBuy"
                                value={ticketsToBuy}
                                onChange={handleTicketChange}
                                className="bg-gray-700 text-white px-2 py-1 rounded"
                            />
                        </div>
                        <div>
                            <TransactionButton
                                disabled={ticketsToBuy < 1}
                                className="!mb-[15px] !bg-cyan-400 !hover:bg-orange-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out"
                                transaction={() => {
                                    const tx = prepareContractCall({
                                        contract: storeContract,
                                        method: "function approve(address spender, uint256 amount)",
                                        params: [import.meta.env.VITE_LUCKDEAL, registrationCost * ticketsToBuy * 1e6],
                                        value: 0,
                                    });
                                    return tx;
                                }}
                                onTransactionSent={(result) => {
                                    console.log("Transaction submitted", result.transactionHash);
                                }}
                                onTransactionConfirmed={(receipt) => {
                                    console.log("Transaction confirmed", receipt.transactionHash);
                                }}
                                onError={(error) => {
                                    console.error("Transaction error", error);
                                }}
                            >
                                Approve
                            </TransactionButton>
                        </div>
                        <br />
                        <div>
                            <TransactionButton
                                className="!bg-green-500 !hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out"
                                transaction={() => {
                                    setIsLoading(true);
                                    const tx = prepareContractCall({
                                        contract: luckMachineContract2,
                                        method: "function register(uint256 _tickets)",
                                        params: [ticketsToBuy],
                                        value: 0,
                                    });
                                    return tx;
                                }}
                                onTransactionSent={(result) => {
                                    console.log("Transaction submitted", result.transactionHash);
                                }}
                                onTransactionConfirmed={(receipt) => {
                                    console.log("Transaction confirmed", receipt.transactionHash);
                                    generateStory();
                                }}
                                onError={(error) => {
                                    console.error("Transaction error", error);
                                    setIsLoading(false);
                                }}
                            >
                                Buy The News Paper
                            </TransactionButton>
                        </div>
                    </div>
    
                    {story && (
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 mt-8">
                            <h2 className="text-2xl font-bold text-white mb-4">City News</h2>
                            <p className="text-white whitespace-pre-line">{story}</p>
                        </div>
                    )}
    
                    {videoUrl && (
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                            <h2 className="text-2xl font-bold text-white mb-4">News Video</h2>
                            <video controls className="w-full">
                                <source src={videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    )}
    
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
                        <ol className="list-decimal list-inside text-white space-y-2">
                            <li>Buy tickets by paying the registration cost per ticket</li>
                            <li>Wait for more participants to join</li>
                            <li>The owner will spin the luck when ready</li>
                            <li>A random winner gets 2/3 of the total pot!</li>
                            <li>The remaining 1/3 goes to the contract owner</li>
                        </ol>
                    </div>
    
                    <div className="mt-12 text-center">
                        <p className="text-white text-lg">May the odds be ever in your favor!</p>
                    </div>
                </>
            ) : (
                <h2 className='text-[18px] text-[#00FFFF] font-bold'>First Login...</h2>
            )}
        </div>
    );

}

export default City;