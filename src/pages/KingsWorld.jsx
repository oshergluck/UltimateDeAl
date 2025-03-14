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
    const [citiesAndMayors, setCitiesAndMayors] = useState([]);
    const [cityStartDate, setCityStartDate] = useState(null);
    const [cityStores, setCityStores] = useState([]);
    const [encryptionStatus, setEncryptionStatus] = useState({});
    const navigate = useNavigate();
    const { refreshPage, storeRegistery, address,HexToInteger,checkIfEncrypted } = useStateContext();
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
    const [mayor, setMayor] = useState('');
    const [high,setHighesBalance] = useState();
    const {contract: highContract} = useContract(import.meta.env.VITE_DEAL_COIN_ADDRESS);
    const { contract: luckMachineContract } = useContract(import.meta.env.VITE_LUCKY);
    const { contract: invoicesContract } = useContract('0x8a215a1501C0a9F2cAE41B4ae0fC60EA439f9EDf');
    const [ownerShip,setOwnerShip] = useState(false);
    const navigateToDeAlStore = () => {
        navigate('/store/TheDeAl/products/DeAl');
        };

    function generateCityStartDate(cityName) {
        // Convert city name to a number
        const cityNameSum = cityName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        
        // Use the sum to generate a seed
        const seed = cityNameSum % 1000000;
        
        // Generate a pseudo-random number using the seed
        const randomValue = (seed * 9301 + 49297) % 233280;
        
        // Calculate years, months, and days
        const years = Math.floor(randomValue / 10000) + 28725; // Start from year 2050
        const months = Math.floor((randomValue % 10000) / 100) % 12;
        const days = randomValue % 100;
        
        // Create the start date
        const startDate = new Date(years, months, days);
        
        return startDate;
    }

    const luckMachineContract2 = getContract({
        client: client,
        chain: { id: 8453, rpc: POLYRPC },
        address: import.meta.env.VITE_LUCKY,
    });

    const [dateOfGame,setDateOfGame] = useState('');
    const DEALShare = getContract({
        client: client,
        chain: { id: 8453, rpc: POLYRPC },
        address: import.meta.env.VITE_DEAL_COIN_ADDRESS,
    });

    useEffect(() => {
        if (cityName) {
            const startDate = generateCityStartDate(cityName);
            setCityStartDate(startDate);
        }
        const checkOwnership = async () => {
            if(invoicesContract) {
              const data = await invoicesContract.call('verifyOwnershipByBarcode',[address,"DeAl"]);
              if(data) {
                setOwnerShip(data);
              }
            }
          }

        window.scrollTo(0, 0);
        const fetchCitiesAndMayors = async () => {
            if (storeRegistery) {
                try {
                  const allStores = await storeRegistery.call('getAllStores');
                  const cityMayorMap = new Map();
              
                  for (let i = 0; i < allStores[0].length; i++) {
                    const city = allStores[1][i].city;
                    if (!cityMayorMap.has(city)) {
                      const balance = await highContract.call('balanceOf', [allStores[1][i].storeOwner]);
                      const currentBalance = HexToInteger(balance._hex) * 1e-18;
                      cityMayorMap.set(city, {
                        mayor: allStores[0][i].contactInfo,
                        balance: currentBalance
                      });
                    } else {
                      const balance = await highContract.call('balanceOf', [allStores[1][i].storeOwner]);
                      const currentBalance = HexToInteger(balance._hex) * 1e-18;
                      if (currentBalance > cityMayorMap.get(city).balance) {
                        cityMayorMap.set(city, {
                          mayor: allStores[0][i].contactInfo,
                          balance: currentBalance
                        });
                      }
                    }
              
                    const encryptionStatus = await checkIfEncrypted(allStores[0][i].urlPath);
                    setEncryptionStatus((prevStatus) => ({
                      ...prevStatus,
                      [allStores[0][i].urlPath]: encryptionStatus
                    }));
                  }
              
                  const citiesAndMayorsArray = Array.from(cityMayorMap, ([city, { mayor, balance }]) => ({ city, mayor, balance }));
                  setCitiesAndMayors(citiesAndMayorsArray);
                } catch (error) {
                  console.error('Error fetching cities and mayors:', error);
                }
              }
        };
        fetchData();
        extractCityName();
        const getDateOfGame = async () =>  {
            if(cityName) {
                const TheTotalDeposited = await luckMachineContract.call('getCityTotalDeposited',[cityName]);
                const currentGameDate = await addDays(cityStartDate, ((TheTotalDeposited*1e-18)/90));
                const formattedDateOfGame = format(currentGameDate, 'MMMM do, yyyy');
                setDateOfGame(formattedDateOfGame);
            } 
        }
        if(luckMachineContract){
            getDateOfGame();
            fetchCitiesAndMayors();
        }
        if(invoicesContract) {
            checkOwnership();
        }
    }, [luckMachineContract, address, location, ticketsOwned,dateOfGame,cityName,highContract,ownerShip,invoicesContract]);


    const fetchCityStores = async (city) => {
        if (storeRegistery) {
          try {
            const allStores = await storeRegistery.call('getAllStores');
            const filteredStores0 = allStores[0].filter((_, index) => allStores[1][index].city.toLowerCase() === city.toLowerCase());
            const filteredStores1 = allStores[1].filter(store => store.city.toLowerCase() === city.toLowerCase());
            setCityStores(filteredStores0);
      
            // Find the mayor (store owner with highest total supply)
            let highestBalance = 0;
            let mayorStore = null;
            for (let i = 0; i < filteredStores1.length; i++) {
              const balance = await highContract.call('balanceOf', [filteredStores1[i].storeOwner]);
              if (HexToInteger(balance._hex) * 1e-18 > highestBalance) {
                console.log(balance);
                highestBalance = HexToInteger(balance._hex) * 1e-18;
                mayorStore = filteredStores0[i];
              }
            }
            await setHighesBalance(highestBalance);
            await setMayor(mayorStore ? mayorStore.contactInfo : 'Unknown');
          } catch (error) {
            console.error('Error fetching city stores:', error);
          }
        }
      };

    const formatNumberWithCommas = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      };

      const fetchData = async () => {
        if (luckMachineContract && address && cityName) {
            setIsLoading(true);
            try {
                const [registrationCostData, totalDepositedData, participantsCountData, ticketsOwnedData] = await Promise.all([
                    luckMachineContract.call('getCityPrice', [cityName]),
                    luckMachineContract.call('getCityTotalDeposited', [cityName]),
                    luckMachineContract.call('getParticipantsCount', [cityName]),
                    luckMachineContract.call('getTicketsOwned', [cityName, address])
                ]);
                if(registrationCostData) {
                    await setRegistrationCost(registrationCostData / 1e18);
                }
                else {
                    await setRegistrationCost(90);
                }
                await setTotalDeposited(totalDepositedData / 1e18);
                await setParticipantsCount(participantsCountData.toNumber());
                await setTicketsOwned(ticketsOwnedData.toNumber());
                return totalDeposited;
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
                      element = <span key={index} className={`!text-[#00FFFF] text-${defaultSize}`}>{element}</span>;
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

    const generateStory = async () => {
        if (!cityStartDate) return;
        const data = await fetchData();
        const currentDate = await addDays(cityStartDate, (data/90));
        const formattedDate = format(currentDate, 'MMMM do, yyyy');
        const otherCitiesInfo = citiesAndMayors
        .filter(cm => cm.city.toLowerCase() !== cityName.toLowerCase())
        .map(cm => `${cm.city} (Mayor: ${cm.mayor}, Balance: ${formatNumberWithCommas(Math.round(cm.balance*1e18))} DeAls)`)
        .join(', ');
        try {
            setIsLoading(true);
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-4o",
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
                    11. If the City named "DeAls" its the Capital of DeAl MetaVerese!
                    12. When Writing about the mayor, Write only his Last Name!
                    13. Never write the rules itself!
                    14. Never generate the same day twice!
                    15. NEVER WRITE THE WORD 'RANDOM' or 'Random' or 'random'!
                    16. NEVER USE THE EXAMPLE ITSELF! GENERATE HEADLINES FROM YOUR IMAGINATION!
                    17. Include conflicts and interactions between ${cityName} and other cities. Here are the other cities and their mayors: ${otherCitiesInfo}. Create interesting storylines involving disputes, alliances, or competitions between these cities and their leaders.
                    18. Generate 23 news headlines for the city of ${cityName}. The city has ${participantsCount+1000000000} citizens, ${participantsCount} Humans and the others are creatures from all the Galaxy, including the following notable residents:

                ${cityStores.map(store => store.name).join(', ')} those are stores which will be shown in the news and the surveys! never write negative news about those stores!

                The mayor of the city is ${mayor} owns ${high}. Each headline represents events happening over a 24-hour period starting from ${format(currentDate, 'MMMM do, yyyy')}. Make the headlines engaging and varied, including the names of the citizens listed above as well as other imaginary names for people and places. Some citizens may have been involved in conflicts or passed away from old age, so feel free to incorporate these elements into the storyline.

                Include interactions, conflicts, or collaborations with other cities and their mayors. Create engaging storylines that involve multiple cities and their leaders.

                For each headline, include the time (in 24-hour format) and the date. Here's the format:
                
                [Cannel: Channel number]

                [Date: ${format(currentDate, 'MMMM do, yyyy')}]

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

                Please generate 24 headlines following this format, covering a full 24-hour period, never generate more than 24 hours! Include at least one headline featuring the mayor's activities or decisions. Include at least one headline featuring each user's activities or decisions. Use creative elements fitting for the date ${format(currentDate, 'MMMM do, yyyy')}. Incorporate stories about conflicts, alliances, and significant events involving the listed citizens and other cities. All the people in the city can die except the users!`
                }],
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            setStory(response.data.choices[0].message.content);
            setDateOfGame(formattedDate);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error('Error generating story:', error);
            setStory('Failed to generate story. Please try again.');
        }
    };

    return (
        <div className="container linear-gradient1 rounded-[15px] mx-auto p-8 mt-[35px]">
            {isLoading && <Loader />}
            <h1 className="text-center font-bold text-[#ff9900] drop-shadow-md pb-[25px] sm:text-[50px] text-[30px]">
            Today is: 
            </h1>
            <h1 className='text-center font-bold text-[#ff9900] drop-shadow-md pb-[25px] sm:text-[50px] text-[30px]'>{dateOfGame || 'Loading...'}</h1>
            <h1 className='text-center font-bold text-[#ff9900] drop-shadow-md pb-[25px] sm:text-[50px] text-[25px]'>In The MetaVerse Of {cityName}</h1>
            <h2 className="sm:text-8xl text-5xl font-bold text-white mb-2 text-center">Welcome to {cityName}</h2>
            <div className="mb-12">
                <h2 className="text-3xl font-bold text-[#00FFFF] mb-4 text-center">Stores in {cityName}</h2>
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
                the DeAl Spinner stands as a beacon of hope and excitement. This mystical device, 
                powered by ancient runes and cutting-edge circuitry, offers citizens a chance to 
                escape the daily grind and dream of a brighter future.
            </p>

            {address ? (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-lg shadow-lg text-white w-full md:w-1/4">
                            <h2 className="text-2xl font-bold mb-2">Day Cost</h2>
                            <p className="text-3xl font-semibold">{Math.round(registrationCost)} DeAl</p>
                        </div>
                        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-6 rounded-lg shadow-lg text-white w-full md:w-1/4">
                            <h2 className="text-2xl font-bold mb-2">{cityName} has</h2>
                            <p className="text-3xl font-semibold">{Math.round(totalDeposited)} DeAl</p>
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
                        <h2 className="text-3xl font-bold text-[#00FFFF] mb-4">Try Your Luck!</h2>
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
                                await generateStory();
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
                        </>):(<>You Don't Have Ultimate CitizenShip
                        <br/>
                        <button onClick={() => navigateToDeAlStore()} className='!bg-green-500 !hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out'>
                            Buy CitizenShip
                        </button>
                        </>)}
                        
                    </div>
                                <h2 className="text-xl font-bold text-white mb-4">Current Mayor:</h2>
                                <h2 className="text-xl text-white mb-4"> {renderDescriptionWithBreaks(mayor)}</h2>
                                <h2 className='text-[36px] text-yellow-400 mb-4'>Holding:</h2>
                                <h2 className='text-[36px] text-yellow-400 mb-4'>{formatNumberWithCommas(Math.round(high))} DeAls</h2>
                            {story && (
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                            <h2 className="text-2xl font-bold text-white mb-4">City News</h2>
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
                            <li>The owner of UltimateDeal MultiVerse will spin the luck when ready</li>
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
                <h2 className='text-[18px] text-[#00FFFF] font-bold'>Login get the daily news of {cityName}</h2>
            )}
        </div>
    );
}

export default City;