import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContract } from '@thirdweb-dev/react';
import { createThirdwebClient, prepareContractCall, getContract } from "thirdweb";
import { TransactionButton } from 'thirdweb/react';
import { Loader, StoreBox } from '../components';
import { format, addDays } from 'date-fns';
import { ethers } from 'ethers';
import axios from 'axios';

const City = () => {
    const [citiesAndMayors, setCitiesAndMayors] = useState([]);
    const [cityStartDate, setCityStartDate] = useState(null);
    const [cityStores, setCityStores] = useState([]);
    const [encryptionStatus, setEncryptionStatus] = useState({});
    const navigate = useNavigate();
    const { refreshPage, storeRegistery, address,HexToInteger,checkIfEncrypted } = useStateContext();
    const client = createThirdwebClient({ clientId: import.meta.env.VITE_THIRDWEB_CLIENT });
    const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
    const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`;
    const POLYRPC1 = 'https://base-mainnet.g.alchemy.com/v2/d32cys2ito51Xt9AgfAUTBuIuQd-yQbm';
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [ticketsOwned, setTicketsOwned] = useState(0);
    const [participantsCount, setParticipantsCount] = useState(0);
    const [registrationCost, setRegistrationCost] = useState(0);
    const [totalDeposited, setTotalDeposited] = useState(0);
    const [ticketsToBuy, setTicketsToBuy] = useState(1);
    const [cityName, setCityName] = useState('');
    const [story, setStory] = useState('');
    const [mayor, setMayor] = useState('');
    const [high,setHighesBalance] = useState(0);
    const {contract: highContract} = useContract('0xA03e84dE600Ea42c2F43cf8A8b198BF5a3650240'); //Main platform token
    const { contract: luckMachineContract } = useContract(import.meta.env.VITE_LUCKDEAL);
    const { contract: invoicesContract } = useContract('0x7C14154C6fd0636742344D5Ee69297bDC2218ceb'); //invoices contract address of the main shop to check NFT approves ownership
    const [ownerShip,setOwnerShip] = useState(false);
    const navigateToDeAlStore = () => {
        navigate('/shop/mainshop/products/LOTERRY');
        };

    const luckMachineContract2 = getContract({
        client: client,
        chain: { id: 8453, rpc: POLYRPC },
        address: import.meta.env.VITE_LUCKDEAL,
    });

    const [dateOfGame,setDateOfGame] = useState('');
    const DEALShare = getContract({
        client: client,
        chain: { id: 8453, rpc: POLYRPC },
        address: '0xA03e84dE600Ea42c2F43cf8A8b198BF5a3650240',
    });

    useEffect(() => {

    function generateCityStartDate(cityName) {
        const cityNameSum = cityName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const seed = cityNameSum % 1000000;
        const randomValue = (seed * 9322 + 49297) % 233280;
        const year = new Date().getFullYear();
        const years = Math.floor(randomValue / 10000) + 23 + year;
        const months = Math.floor((randomValue % 10000) / 100) % 12;
        const days = randomValue % 100;
        return new Date(years, months, days);
    }

    async function checkOwnership() {
        try {
            const data = await invoicesContract.call('verifyOwnershipByBarcode', [address, "LOTERRY"]);
            if (data) {
                setOwnerShip(data);
            }
        } catch (error) {
            console.error('Error checking ownership:', error);
        }
    }

    async function fetchCityData() {
        
        setIsLoading(true);
        try {
            const data = await luckMachineContract.call('getCityPrice', [cityName]);
            setRegistrationCost(data ? ethers.utils.formatEther(data) : 90);
            const data1 = await luckMachineContract.call('getCityTotalDeposited', [cityName]);
            setTotalDeposited(ethers.utils.formatEther(data1));
            const data2 = await luckMachineContract.call('getParticipantsCount', [cityName]);
            setParticipantsCount(HexToInteger(data2._hex));
            if(address) {
                const data3 = await luckMachineContract.call('getTicketsOwned', [cityName, address]);
                setTicketsOwned(HexToInteger(data3._hex));
            }
            setIsLoading(false);
            return data1;

        } catch (error) {
            setIsLoading(false);
            console.error('Error fetching city data:', error);
        } finally {
                setIsLoading(false);
        }
    }

    async function fetchCityStoresAndMayor() {
        
        try {
            const allStores = await storeRegistery.call('getAllStores');
            const filteredStores = allStores[0].filter((_, index) => 
                allStores[1][index].city.toLowerCase() === cityName.toLowerCase()
            );
            
            setCityStores(filteredStores);

            // Fetch all balances in parallel
            const balancePromises = allStores[1]
                .filter(store => store.city.toLowerCase() === cityName.toLowerCase())
                .map(store => highContract.call('balanceOf', [store.storeOwner]));
            
            const balances = await Promise.all(balancePromises);

            // Find mayor (store with highest balance)
            let highestBalance = ethers.BigNumber.from(0);
            let mayorIndex = -1;

            balances.forEach((balance, index) => {
                if (balance.gt(highestBalance)) {
                    highestBalance = balance;
                    mayorIndex = index;
                }
            });

            
            allStores[0].forEach(async (store) => {
                const data = await checkIfEncrypted(store.urlPath);
                console.log(data);
                setEncryptionStatus(prevStatus => ({
                  ...prevStatus,
                  [store.urlPath]: data
                }));
              });

            const formattedBalance = ethers.utils.formatEther(highestBalance);
            setHighesBalance(formattedBalance);
            setMayor(mayorIndex !== -1 ? filteredStores[mayorIndex].contactInfo : 'Unknown');

        } catch (error) {
            console.error('Error fetching city stores and mayor:', error);
        }
    }

    async function updateDateOfGame() {
        
        try {
            const totalDeposited = await luckMachineContract.call('getCityTotalDeposited', [cityName]);

            const startDate = generateCityStartDate(cityName);
            setCityStartDate(startDate);

            const currentGameDate = addDays(startDate, (totalDeposited * 1e-18) / 90);
            const formattedDateOfGame = format(currentGameDate, 'MMMM do,yyyy');
            setDateOfGame(formattedDateOfGame);
        } catch (error) {
            console.error('Error updating date of game:', error);
        }
    }

    // Main execution flow
    async function initializeCity() {
        await fetchCityData();
        await fetchCityStoresAndMayor();
        await updateDateOfGame();
        await checkOwnership();
    }

    // Extract city name from URL
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    const city = decodeURIComponent(lastSegment);
    setCityName(city);

    window.scrollTo(0, 0);
                    initializeCity();

}, [
    luckMachineContract,
    storeRegistery,
    highContract,
    invoicesContract,
    address,
    window.location.pathname,
    cityName
]);


    
    async function updateDateOfGame1(num) {
            
        try {
            const totalDeposited = await luckMachineContract.call('getCityTotalDeposited', [cityName]);

            const startDate = dateOfGame;

            const currentGameDate = addDays(startDate, (totalDeposited+num*90 * 1e-18) / 90);
            const formattedDateOfGame = format(currentGameDate, 'MMMM do,yyyy');
            setDateOfGame(formattedDateOfGame);
        } catch (error) {
            console.error('Error updating date of game:', error);
        }
    }

    const formatNumberWithCommas = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      };

        

    const handleTicketChange = (e) => {
        setTicketsToBuy(Math.max(1, parseInt(e.target.value) || 1));
    };

    function renderDescriptionWithBreaks(description) {
        if (!description) return <p>No description provided.</p>;
    
        const processText = (text) => {
          const sanitizedText = text.replace(/[\s\uFEFF\xA0]+/g, ' ');
            const nodes = [];
            let currentText = '';
            let styles = [];
    
            for (let i = 0; i < sanitizedText.length; i++) {
              const char = sanitizedText[i];
      
              if (char === '~' || char === '*' || char === '^' || char === '$') {
                  if (currentText) {
                      nodes.push({ text: currentText, styles: [...styles] });
                      currentText = '';
                  }
                  const styleIndex = styles.indexOf(char);
                  if (styleIndex > -1) {
                      styles.splice(styleIndex, 1);
                  } else {
                      styles.push(char);
                  }
                  continue;
              }
      
              currentText += char;
          }
    
          if (currentText) {
            nodes.push({ text: currentText, styles: [...styles] });
        }
    
        return nodes.map((node, index) => {
          let element = <span key={index}>{node.text}</span>;
      
          node.styles.forEach(style => {
              const defaultFontSizeIndex = fontSizes.indexOf('sm');
              const defaultSize = fontSizes[defaultFontSizeIndex-7];
      
              switch (style) {
                  case '~':
                      element = <span key={index} className={`!text-[#FFDD00] text-${defaultSize}`}>{element}</span>;
                      break;
                  case '*':
                      element = <strong key={index} className={`text-${defaultSize}`}>{element}</strong>;
                      break;
                  case '$':
                      element = <span key={index} className={`text-center block my-[10px] text-${defaultSize}`}>{element}</span>;
                      break;
                  case '^':
                      const fontSizeIndex = fontSizes.indexOf('sm') + 2;
                      const size = fontSizes[fontSizeIndex];
                      element = <span key={index} className={`text-${size}`}>{element}</span>;
                      break;
                  default:
                      element = <span key={index} className={`text-${defaultSize}`}>{element}</span>;
                      break;
              }
          });
      
          return element;
      });
      
      
        };
    
        const lines = description.split('\n').map((line, index) => (
            <div key={index} className="whitespace-pre-wrap">
                {processText(line)}
            </div>
        ));
    
        return (
            <div className="font-epilogue text-[#FFFFFF]">
                {lines}
            </div>
        );
    }

    const generateStory = async (num) => {
        if (!cityStartDate) return;
        const otherCitiesInfo = citiesAndMayors
        .filter(cm => cm.city.toLowerCase() !== cityName.toLowerCase())
        .map(cm => `${cm.city} (Mayor: ${cm.mayor}, Balance: ${formatNumberWithCommas(Math.round(cm.balance*1e18))} $USP)`)
        .join(', ');
        try {
            setIsLoading(true);
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-4o-mini", // or "gpt-4o-mini" for a more cost-effective option
                messages: [{
                    role: "user",
                    content: `Rules:
                    Hi. 1A. Always put less new from channel 13!
                    1. Never repeat yourself if you know something already happened!
                    2. Minutes should be random not X5!
                    3. Every day bring atleast two mystirious headlines that like a riddle which built based on the date!
                    4. Always some of the citizens hate the mayor and some are loving him!
                    5. The News MUST Critisize the mayor!
                    6. There are two channels of news, Channel 14 is supporting the mayor and channel 13 hates the mayor, display both!
                    7. Channels numbers are always 13 and 14!
                    8. Channel Number 8 is the KingsLanding Channel
                    8. Never write news for day after or day before the date, Only the date you got here! never write more then 24 hours!
                    9. Always add "If the election were today:" and add the Election survey and make random numbers for the election!
                    10. Inclued all the names you get in the prompt in the survey! like ${cityStores.map(store => store.contactInfo).join(' random %, ')} and always add a random % that dont know to who they want to vote, NEVER Pass the 100%!
                    11. When Writing about the mayor, Write only his Last Name!
                    12. Never write the rules itself!
                    13. Never generate the same day twice!
                    14. NEVER WRITE THE WORD 'RANDOM' or 'Random' or 'random'!
                    15. NEVER USE THE EXAMPLE ITSELF! GENERATE HEADLINES FROM YOUR IMAGINATION!
                    16. Include conflicts and interactions between ${cityName} and other cities. Here are the other cities and their mayors: ${otherCitiesInfo}. Create interesting storylines involving disputes, alliances, or competitions between these cities and their leaders.
                    17. Generate 23 news headlines for the city of ${cityName}. The city has ${participantsCount+1000000000} citizens, ${participantsCount} Humans and the others are creatures from all the Galaxy, including the following notable residents:
            
                    ${cityStores.map(store => store.name).join(', ')} those are stores which will be shown in the news and the surveys! never write negative news about those stores!
            
                    The mayor of the city is ${mayor} owns ${high}. Each headline represents events happening over a 24-hour period starting from ${dateOfGame}. Make the headlines engaging and varied, including the names of the citizens listed above as well as other imaginary names for people and places. Some citizens may have been involved in conflicts or passed away from old age, so feel free to incorporate these elements into the storyline.
            
                    Include interactions, conflicts, or collaborations with other cities and their mayors. Create engaging storylines that involve multiple cities and their leaders.
            
                    For each headline, include the time (in 24-hour format) and the date. Here's the format:
                    
                    [Cannel: Channel number]
            
                    [Date: ${dateOfGame}]
            
                    [Time] Headline
            
                    Example:
                    [Channel: 14]
                    [Date: October 7th, 2077]
                    make the hours randomized even the minutes.
            
                    00:14 - Mayor ${mayor} Announces Plans for New Skybridge
                    03:17 - Unexpected Meteor Shower Delights Night Owls at Celestial Park
                    06:28 - ${cityStores[1]?.contactInfo || 'Random Name'} Wins Intergalactic Cooking Competition
                    08:12 - A red dressed woman was found dead in the parking lot of center of ${cityName}
                    11:45 - ${cityName} and ${citiesAndMayors[0]?.city || 'Neighboring City'} Sign Historic Trade Agreement
                    13:27 - ${citiesAndMayors[0]?.city || 'Neighboring City'} Attacked ${cityName}
                     
                    ...
            
                    Please generate 24 headlines following this format, covering a full 24-hour period, never generate more than 24 hours! Include at least one headline featuring the mayor's activities or decisions. Include at least one headline featuring each user's activities or decisions. Use creative elements fitting for the date ${dateOfGame}. Incorporate stories about conflicts, alliances, and significant events involving the listed citizens and other cities. All the people in the city can die except the users!`
                }],
                temperature: 0.7,
                max_tokens: 4000, // Add token limit for better control
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            }, {
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            
            setStory(response.data.choices[0].message.content);
            setIsLoading(false);
            updateDateOfGame1(num);
        } catch (error) {
            setIsLoading(false);
            console.error('Error generating story:', error);
            setStory('Failed to generate story. Please try again.');
        }
    };

    return (
        <div className=" rounded-[15px] mx-auto p-8 mt-[35px]">
            {isLoading && <Loader />}
            <h1 className="text-center font-bold text-[#ff9900] drop-shadow-md pb-[25px] sm:text-[50px] text-[30px]">
            Today is: 
            </h1>
            <h1 className='text-center font-bold text-[#ff9900] drop-shadow-md pb-[25px] sm:text-[50px] text-[30px]'>{dateOfGame || 'Loading...'}</h1>
            <h1 className='text-center font-bold text-[#ff9900] drop-shadow-md pb-[25px] sm:text-[50px] text-[25px]'>In The MetaVerse Of {cityName}</h1>
            <h2 className="sm:text-8xl text-5xl font-bold text-white mb-2 text-center">Welcome to {cityName}</h2>
            <div className="mb-12">
                <h2 className="text-3xl font-bold text-[#FFDD00] mb-4 text-center">Stores in {cityName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cityStores.map((store, index) => (
                        <StoreBox key={index} store={store} enc={encryptionStatus[store.urlPath]} />
                    ))}
                </div>
            </div>
            <p className="text-white text-lg leading-relaxed mb-8">
                In {cityName}, You dont have to pay for living. You have to pay to get the news of today about the city you built,
            </p>
            <p className="text-white text-lg leading-relaxed mb-8">
                Each store owner can build a city or join an existing city.
            </p>
            <p className="text-white text-lg leading-relaxed mb-8">
                In the bustling city of {cityName}, where magic and technology intertwine, 
                the $USP Spinner stands as a beacon of hope and excitement. This mystical device, 
                powered by ancient runes and cutting-edge circuitry, offers citizens a chance to 
                escape the daily grind and dream of a brighter future.
            </p>

            {address ? (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-lg shadow-lg text-white w-full md:w-1/4">
                            <h2 className="text-2xl font-bold mb-2">Day Cost</h2>
                            <p className="text-3xl font-semibold">{Math.round(registrationCost)} USP</p>
                        </div>
                        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-6 rounded-lg shadow-lg text-white w-full md:w-1/4">
                            <h2 className="text-2xl font-bold mb-2">{cityName} has</h2>
                            <p className="text-3xl font-semibold">{Math.round(totalDeposited)} USP</p>
                        </div>
                        <div className="bg-gradient-to-r from-green-400 to-teal-500 p-6 rounded-lg shadow-lg text-white w-full md:w-1/4">
                            <h2 className="text-2xl font-bold mb-2">{cityName} Residents</h2>
                            <p className="text-3xl font-semibold">{participantsCount} + some Ailens and Robots</p>
                        </div>
                        <div className={`p-6 rounded-lg shadow-lg text-white w-full md:w-1/4 ${ticketsOwned >= 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-to-r from-gray-400 to-gray-600'}`}>
                            <h2 className="text-2xl font-bold mb-2 drop-shadow-md">Days you spent in {cityName}</h2>
                            <p className="text-3xl font-semibold drop-shadow-md">{ticketsOwned}</p>
                        </div>
                    </div>

                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#FFDD00] mb-4">Try Your Luck!</h2>
                        <p className="text-xl text-white mb-8">Buy days in {cityName} for a chance to win big!</p>
                        <div className="mb-4">
                            <label htmlFor="ticketsToBuy" className="text-white mr-2">Amount Of Days To Run Forward</label>
                            <input
                                type="number"
                                id="ticketsToBuy"
                                value={ticketsToBuy}
                                onChange={handleTicketChange}
                                className="bg-gray-700 text-white px-2 py-1 rounded"
                            />
                        </div>
                        {ownerShip? (<>
                            <TransactionButton
                            disabled={ticketsToBuy < 1}
                            className="!mb-[15px] !bg-cyan-400 !hover:bg-orange-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out"
                            transaction={() => {

                                let registrationCostForApproval;
                                if(registrationCost==0) {
                                    registrationCostForApproval = 91*1e18;
                                }
                                else {
                                    registrationCostForApproval = registrationCost*1e18;
                                }
                                const tx = prepareContractCall({
                                    contract: DEALShare,
                                    method: "function approve(address spender, uint256 amount)",
                                    params: [import.meta.env.VITE_LUCKDEAL, (ticketsToBuy*registrationCostForApproval)+1e18],
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
                        <br />
                        <TransactionButton
                            className="!bg-green-500 !hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out"
                            transaction={async() => {
                                const tx = prepareContractCall({
                                    contract: luckMachineContract2,
                                    method: "function register(uint256 _tickets, string memory _city)",
                                    params: [ticketsToBuy, cityName],
                                    value: 0,
                                });
                                return tx;
                            }}
                            onTransactionSent={(result) => {
                                console.log("Transaction submitted", result.transactionHash);
                                setIsLoading(true);
                            }}
                            onTransactionConfirmed={async(receipt) => {
                                await generateStory(ticketsToBuy);
                                await setIsLoading(false);
                                console.log("Transaction confirmed", receipt.transactionHash);
                            }}
                            onError={(error) => {
                                setIsLoading(false);
                                console.error("Transaction error", error);
                            }}
                        >
                            Get The Daily News
                        </TransactionButton>
                        </>):(<><p className='my-[5px] font-bold text-red-500'>You Don't Have Ultimate CitizenShip</p>
                        <br/>
                        <button onClick={() => navigateToDeAlStore()} className='!bg-green-500 !hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out'>
                            Buy CitizenShip
                        </button>
                        </>)}
                        
                    </div>
                                <h2 className="text-xl font-bold text-white mb-4">Current Mayor:</h2>
                                <h2 className="text-xl text-white mb-4"> {renderDescriptionWithBreaks(mayor)}</h2>
                                <h2 className='text-[36px] text-yellow-400 mb-4'>Holding:</h2>
                                <h2 className='text-[36px] text-yellow-400 mb-4'>{formatNumberWithCommas(Math.round(high))} $USP Stocks</h2>
                            {story && (
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                            <h2 className="text-2xl font-bold text-white mb-4">City Fake News</h2>
                            <p className="text-white whitespace-pre-line rtl">{story}</p>
                        </div>
                    )}
                    

                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
                        <ol className="list-decimal list-inside text-white space-y-2">
                            <li>Buy days by paying the day cost</li>
                            <li>Get the daily news of {cityName}</li>
                            <li>Each city has its own raffle</li>
                            <li>Wait for more residents to join</li>
                            <li>The owner of UltraShop MultiVerse will spin the luck when ready</li>
                            <li>The Timeline Of {cityName} will reset</li>
                            <li>A random winner gets 2/3 of the total pot!</li>
                            <li>The remaining 1/3 goes to the contract owner</li>
                        </ol>
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-white text-lg">May the odds be ever in your favor!</p>
                    </div>
                </>
            ) : (
                <h2 className='text-[18px] text-[#FFDD00] font-bold'>Login get the daily news of {cityName}</h2>
            )}
        </div>
    );
}

export default City;