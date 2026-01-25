import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useContract } from "@thirdweb-dev/react";
import { createThirdwebClient, prepareContractCall, getContract } from "thirdweb";
import { TransactionButton } from "thirdweb/react";
import { Loader, StoreBox } from "../components";
import { useStateContext } from "../context";
import { format, addDays } from "date-fns";
import { ethers } from "ethers";
import axios from "axios";
import { fontSizes } from "../components/AccessibilityMenu";

const City = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    storeRegistery,
    address,
    HexToInteger,
    checkIfEncrypted,
  } = useStateContext();

  const client = useMemo(
    () => createThirdwebClient({ clientId: import.meta.env.VITE_THIRDWEB_CLIENT }),
    []
  );

  const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
  const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`;

  const cityName = useMemo(() => {
    const pathSegments = location.pathname.split("/");
    const lastSegment = pathSegments[pathSegments.length - 1];
    return decodeURIComponent(lastSegment || "").trim();
  }, [location.pathname]);

  // --- State Management ---
  const [citiesAndMayors, setCitiesAndMayors] = useState([]);
  const [cityStartDate, setCityStartDate] = useState(null);
  const [cityStores, setCityStores] = useState([]);
  const [encryptionStatus, setEncryptionStatus] = useState({});
  
  // Loading States
  const [isLoading, setIsLoading] = useState(false); // Main UI blocker
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false); // Non-blocking background fetch

  const [ticketsOwned, setTicketsOwned] = useState(0);
  const [participantsCount, setParticipantsCount] = useState(0);

  const [registrationCost, setRegistrationCost] = useState(0);
  const [registrationCost6, setRegistrationCost6] = useState(ethers.BigNumber.from(0));

  const [totalDeposited, setTotalDeposited] = useState(0);
  const [totalDeposited6, setTotalDeposited6] = useState(ethers.BigNumber.from(0));

  const [ticketsToBuy, setTicketsToBuy] = useState(1);

  const [story, setStory] = useState("");
  const [mayor, setMayor] = useState("");
  const [high, setHighesBalance] = useState(0);

  const [ownerShip, setOwnerShip] = useState(false);
  const [dateOfGame, setDateOfGame] = useState("");

  const lastLoadedCityRef = useRef("");

  const navigateToDeAlStore = () => {
    navigate("/shop/main/products/LOTERRY");
  };

  // --- Contracts ---
  const { contract: highContract } = useContract("0x18b67dd7409d3a3f4f3dde7a6a01c4db4b9ba5cd");
  const { contract: luckMachineContract } = useContract(import.meta.env.VITE_LUCKDEAL);
  const { contract: invoicesContract } = useContract("0xcbb313c9C80CBe57a7Ba70f95700272d83C65020");

  const luckMachineContract2 = useMemo(() => {
    return getContract({
      client,
      chain: { id: 8453, rpc: POLYRPC },
      address: import.meta.env.VITE_LUCKDEAL,
    });
  }, [client, POLYRPC]);

  const DEALShare = useMemo(() => {
    return getContract({
      client,
      chain: { id: 8453, rpc: POLYRPC },
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    });
  }, [client, POLYRPC]);

  const ticketsStorageKey = useMemo(() => {
    const addr = (address || "").toLowerCase();
    const city = (cityName || "").toLowerCase();
    return `CITY_TICKETS_${addr}_${city}`;
  }, [address, cityName]);

  useEffect(() => {
    if (!ticketsStorageKey) return;
    const v = Number(localStorage.getItem(ticketsStorageKey) || "0");
    setTicketsOwned(Number.isFinite(v) ? v : 0);
  }, [ticketsStorageKey]);

  function generateCityStartDate(name) {
    const cityNameSum = String(name || "")
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const seed = cityNameSum % 1000000;
    const randomValue = (seed * 9322 + 49297) % 233280;
    const yearNow = new Date().getFullYear();
    const years = Math.floor(randomValue / 10000) + 23 + yearNow;
    const months = Math.floor((randomValue % 10000) / 100) % 12;
    const days = randomValue % 100;
    return new Date(years, months, days);
  }

  const formatNumberWithCommas = (number) => {
    const n = Number(number);
    if (!Number.isFinite(n)) return String(number ?? "");
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleTicketChange = (e) => {
    const n = Math.max(1, parseInt(e.target.value || "1", 10) || 1);
    setTicketsToBuy(n);
  };

  function renderDescriptionWithBreaks(description) {
    if (!description) return <p>No description provided.</p>;

    const processText = (text) => {
      const sanitizedText = String(text).replace(/[\s\uFEFF\xA0]+/g, " ");
      const nodes = [];
      let currentText = "";
      let styles = [];

      for (let i = 0; i < sanitizedText.length; i++) {
        const char = sanitizedText[i];

        if (char === "~" || char === "*" || char === "^" || char === "$") {
          if (currentText) {
            nodes.push({ text: currentText, styles: [...styles] });
            currentText = "";
          }
          const styleIndex = styles.indexOf(char);
          if (styleIndex > -1) styles.splice(styleIndex, 1);
          else styles.push(char);
          continue;
        }

        currentText += char;
      }

      if (currentText) nodes.push({ text: currentText, styles: [...styles] });

      return nodes.map((node, index) => {
        let element = <span key={index}>{node.text}</span>;

        node.styles.forEach((style) => {
          const defaultFontSizeIndex = fontSizes.indexOf("sm");
          const defaultSize = fontSizes[Math.max(0, defaultFontSizeIndex - 7)];

          switch (style) {
            case "~":
              element = (
                <span key={index} className={`!text-[#FFDD00] text-${defaultSize}`}>
                  {element}
                </span>
              );
              break;
            case "*":
              element = (
                <strong key={index} className={`text-${defaultSize}`}>
                  {element}
                </strong>
              );
              break;
            case "$":
              element = (
                <span key={index} className={`text-center block my-[10px] text-${defaultSize}`}>
                  {element}
                </span>
              );
              break;
            case "^": {
              const fontSizeIndex = fontSizes.indexOf("sm") + 2;
              const size = fontSizes[Math.min(fontSizes.length - 1, fontSizeIndex)];
              element = (
                <span key={index} className={`text-${size}`}>
                  {element}
                </span>
              );
              break;
            }
            default:
              element = (
                <span key={index} className={`text-${defaultSize}`}>
                  {element}
                </span>
              );
              break;
          }
        });

        return element;
      });
    };

    const lines = String(description)
      .split("\n")
      .map((line, index) => (
        <div key={index} className="whitespace-pre-wrap">
          {processText(line)}
        </div>
      ));

    return <div className="font-epilogue text-[#FFFFFF]">{lines}</div>;
  }

  // --- Optimized Fetch Functions (No internal blocking loaders) ---

  const checkOwnership = useCallback(async () => {
    try {
      if (!invoicesContract || !address) {
        setOwnerShip(false);
        return;
      }
      const data = await invoicesContract.call("verifyOwnershipByBarcode", [address, "LOTERRY"]);
      setOwnerShip(Boolean(data));
    } catch (error) {
      console.error("Error checking ownership:", error);
      setOwnerShip(false);
    }
  }, [invoicesContract, address]);

  const fetchCityData = useCallback(async () => {
    if (!luckMachineContract || !cityName) return;

    try {
      const state = await luckMachineContract.call("getRoundState", [cityName]);

      const regCost6BN = ethers.BigNumber.from(state[1]);
      const totalDep6BN = ethers.BigNumber.from(state[3]);

      setRegistrationCost6(regCost6BN);
      setTotalDeposited6(totalDep6BN);

      const regCostUSDC = Number(ethers.utils.formatUnits(regCost6BN, 6));
      const totalUSDC = Number(ethers.utils.formatUnits(totalDep6BN, 6));

      setRegistrationCost(Number.isFinite(regCostUSDC) ? regCostUSDC : 0);
      setTotalDeposited(Number.isFinite(totalUSDC) ? totalUSDC : 0);

      const pc = await luckMachineContract.call("getParticipantsCount", [cityName]);
      const pcNum = pc?._hex ? HexToInteger(pc._hex) : Number(pc);
      setParticipantsCount(Number.isFinite(pcNum) ? pcNum : 0);
    } catch (error) {
      console.error("Error fetching city data:", error);
    }
  }, [luckMachineContract, cityName, HexToInteger]);

  const fetchCityStoresAndMayor = useCallback(async () => {
    try {
      if (!storeRegistery || !highContract || !cityName) return;

      const allStores = await storeRegistery.call("getAllStores");
      const storesArr = allStores?.[0] || [];
      const metaArr = allStores?.[1] || [];

      const filtered = [];
      const filteredMeta = [];
      for (let i = 0; i < storesArr.length; i++) {
        const c = (metaArr?.[i]?.city || "").toLowerCase();
        if (c === cityName.toLowerCase()) {
          filtered.push(storesArr[i]);
          filteredMeta.push(metaArr[i]);
        }
      }

      setCityStores(filtered);

      const encPromises = filtered.map(async (store) => {
        try {
          const data = await checkIfEncrypted(store.urlPath);
          return [store.urlPath, data];
        } catch {
          return [store.urlPath, false];
        }
      });

      const encResults = await Promise.all(encPromises);
      const encMap = {};
      for (const [k, v] of encResults) encMap[k] = v;
      setEncryptionStatus(encMap);

      if (filteredMeta.length === 0) {
        setMayor("Unknown");
        setHighesBalance(0);
        return;
      }

      const balancePromises = filteredMeta.map((m) => {
        const ownerAddr = m?.storeOwner;
        return highContract.call("balanceOf", [ownerAddr]);
      });

      const balances = await Promise.all(balancePromises);

      let highestBalance = ethers.BigNumber.from(0);
      let mayorIndex = -1;

      balances.forEach((balanceBN, idx) => {
        const bn = ethers.BigNumber.from(balanceBN);
        if (bn.gt(highestBalance)) {
          highestBalance = bn;
          mayorIndex = idx;
        }
      });

      const formattedBalance = Number(ethers.utils.formatEther(highestBalance));
      setHighesBalance(Number.isFinite(formattedBalance) ? formattedBalance : 0);

      const mayorName =
        mayorIndex !== -1
          ? String(filtered[mayorIndex]?.contactInfo || filtered[mayorIndex]?.name || "Unknown")
          : "Unknown";

      setMayor(mayorName);
    } catch (error) {
      console.error("Error fetching city stores and mayor:", error);
    }
  }, [storeRegistery, highContract, cityName, checkIfEncrypted]);

  // NOTE: This function is slow. Separated to run in background.
  const fetchAllCitiesAndMayors = useCallback(async () => {
    try {
      if (!storeRegistery || !highContract) {
        setCitiesAndMayors([]);
        return;
      }
      setIsBackgroundLoading(true);

      const allStores = await storeRegistery.call("getAllStores");
      const storesArr = allStores?.[0] || [];
      const metaArr = allStores?.[1] || [];

      const byCity = new Map();

      for (let i = 0; i < storesArr.length; i++) {
        const city = String(metaArr?.[i]?.city || "").trim();
        if (!city) continue;
        if (!byCity.has(city)) byCity.set(city, []);
        byCity.get(city).push({ store: storesArr[i], meta: metaArr[i] });
      }

      const cities = Array.from(byCity.keys());

      const results = [];
      for (const city of cities) {
        const list = byCity.get(city) || [];
        if (!list.length) continue;

        const balances = await Promise.all(
          list.map((x) => highContract.call("balanceOf", [x.meta.storeOwner]))
        );

        let highest = ethers.BigNumber.from(0);
        let idx = -1;

        balances.forEach((b, i) => {
          const bn = ethers.BigNumber.from(b);
          if (bn.gt(highest)) {
            highest = bn;
            idx = i;
          }
        });

        const mayorName =
          idx !== -1
            ? String(list[idx].store?.contactInfo || list[idx].store?.name || "Unknown")
            : "Unknown";

        const bal = Number(ethers.utils.formatEther(highest));

        results.push({
          city,
          mayor: mayorName,
          balance: Number.isFinite(bal) ? bal : 0,
        });
      }

      setCitiesAndMayors(results);
    } catch (error) {
      console.error("Error fetching cities and mayors:", error);
      setCitiesAndMayors([]);
    } finally {
      setIsBackgroundLoading(false);
    }
  }, [storeRegistery, highContract]);

  const updateDateOfGame = useCallback(async () => {
    try {
      if (!luckMachineContract || !cityName) return;

      const startDate = generateCityStartDate(cityName);
      setCityStartDate(startDate);

      const state = await luckMachineContract.call("getRoundState", [cityName]);
      const totalDep6BN = ethers.BigNumber.from(state[3]);
      const totalUSDC = Number(ethers.utils.formatUnits(totalDep6BN, 6));

      const daysForward = Number.isFinite(totalUSDC) ? totalUSDC / 90 : 0;
      const currentGameDate = addDays(startDate, daysForward);

      setDateOfGame(format(currentGameDate, "MMMM do,yyyy"));
    } catch (error) {
      console.error("Error updating date of game:", error);
    }
  }, [luckMachineContract, cityName]);

  async function updateDateOfGameAfterPurchase(extraTickets) {
    try {
      const start = cityStartDate || generateCityStartDate(cityName);
      const state = await luckMachineContract.call("getRoundState", [cityName]);
      const totalDep6BN = ethers.BigNumber.from(state[3]);
      const totalUSDC = Number(ethers.utils.formatUnits(totalDep6BN, 6));

      const daysForward = Number.isFinite(totalUSDC) ? totalUSDC / 90 : 0;
      const currentGameDate = addDays(start, daysForward);

      setDateOfGame(format(currentGameDate, "MMMM do,yyyy"));
    } catch (error) {
      console.error("Error updating date after purchase:", error);
    }
  }

  const generateStory = async (num) => {
    if (!cityName) return;

    const otherCitiesInfo = (citiesAndMayors || [])
      .filter((cm) => String(cm.city || "").toLowerCase() !== String(cityName).toLowerCase())
      .map(
        (cm) =>
          `${cm.city} (Mayor: ${cm.mayor}, Balance: ${formatNumberWithCommas(
            Math.round((Number(cm.balance) || 0) * 1e18)
          )} $*)`
      )
      .join(", ");

    try {
      setIsLoading(true);

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            {
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
10. Inclued all the names you get in the prompt in the survey! like ${cityStores
                .map((store) => store.contactInfo)
                .join(" random %, ")} and always add a random % that dont know to who they want to vote, NEVER Pass the 100%!
11. When Writing about the mayor, Write only his Last Name!
12. Never write the rules itself!
13. Never generate the same day twice!
14. NEVER WRITE THE WORD 'RANDOM' or 'Random' or 'random'!
15. NEVER USE THE EXAMPLE ITSELF! GENERATE HEADLINES FROM YOUR IMAGINATION!
16. Include conflicts and interactions between ${cityName} and other cities. Here are the other cities and their mayors: ${otherCitiesInfo}. Create interesting storylines involving disputes, alliances, or competitions between these cities and their leaders.
17. Generate 23 news headlines for the city of ${cityName}. The city has ${participantsCount + 1000000000} citizens, ${participantsCount} Humans and the others are creatures from all the Galaxy, including the following notable residents:

${cityStores.map((store) => store.name).join(", ")} those are stores which will be shown in the news and the surveys! never write negative news about those stores!

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
06:28 - ${cityStores[1]?.contactInfo || "Random Name"} Wins Intergalactic Cooking Competition
08:12 - A red dressed woman was found dead in the parking lot of center of ${cityName}
11:45 - ${cityName} and ${citiesAndMayors[0]?.city || "Neighboring City"} Sign Historic Trade Agreement
13:27 - ${citiesAndMayors[0]?.city || "Neighboring City"} Attacked ${cityName}

...

Please generate 24 headlines following this format, covering a full 24-hour period starting from ${dateOfGame}. never generate more than 24 hours! Include at least one headline featuring the mayor's activities or decisions. Include at least one headline featuring each user's activities or decisions. Use creative elements fitting for the date ${dateOfGame}. Incorporate stories about conflicts, alliances, and significant events involving the listed citizens and other cities. All the people in the city can die except the users!`,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const text = response?.data?.choices?.[0]?.message?.content || "";
      setStory(text);

      await updateDateOfGameAfterPurchase(num);
    } catch (error) {
      console.error("Error generating story:", error);
      setStory("Failed to generate story. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Main Effects ---

  // 1. Critical Data Load (Blocks UI until ready)
  useEffect(() => {
    if (!cityName) return;
    
    // Wait for Thirdweb hooks to initialize contracts
    if (!luckMachineContract || !storeRegistery || !highContract) {
      setIsLoading(true);
      return;
    }

    if (lastLoadedCityRef.current === cityName) return;
    lastLoadedCityRef.current = cityName;

    window.scrollTo(0, 0);

    const loadCriticalData = async () => {
      setIsLoading(true);
      setStory("");
      setMayor("");
      setHighesBalance(0);
      setOwnerShip(false);

      try {
        // Parallel fetch for critical UI data only
        await Promise.allSettled([
          fetchCityData(),
          fetchCityStoresAndMayor(),
          updateDateOfGame(),
          checkOwnership(),
        ]);
      } catch (e) {
        console.error("Critical load error", e);
      } finally {
        setIsLoading(false);
        // Trigger the heavy "all cities" fetch in the background
        fetchAllCitiesAndMayors();
      }
    };

    loadCriticalData();
  }, [
    cityName, 
    luckMachineContract, 
    storeRegistery, 
    highContract, 
    fetchCityData, 
    fetchCityStoresAndMayor, 
    updateDateOfGame, 
    checkOwnership, 
    fetchAllCitiesAndMayors
  ]);

  // 2. Refresh on Address/Wallet change (Non-blocking usually)
  useEffect(() => {
    if (!cityName || !address || !luckMachineContract) return;
    (async () => {
       await Promise.allSettled([fetchCityData(), checkOwnership()]);
    })();
  }, [address, cityName, luckMachineContract, fetchCityData, checkOwnership]);

  return (
    <div className="relative mx-auto p-4 sm:p-8 mt-[35px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-[30px] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden font-epilogue">
  
  {/* Background Decorative Elements - Neon Glows */}
  <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 blur-[100px] pointer-events-none" />
  <div className="absolute bottom-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-[100px] pointer-events-none" />

  {isLoading && <Loader />}

  {/* --- Header Section --- */}
  <div className="relative z-10 space-y-2 mb-10">
    <h1 className="text-center font-black tracking-tighter text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] uppercase sm:text-[60px] text-[35px]">
      System Date:
    </h1>
    <h1 className="text-center font-mono font-bold text-white drop-shadow-md py-[10px] sm:text-[50px] text-[30px]">
      [{dateOfGame || "SYNCHRONIZING..."}]
    </h1>

    <h1 className="text-center font-bold bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent py-[25px] sm:text-[40px] text-[22px] uppercase tracking-widest">
      Node: Metaverse of {cityName}
    </h1>

    <h2 className="sm:text-7xl text-4xl font-black text-white mb-6 text-center tracking-tight">
      Welcome to <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">{cityName}</span>
    </h2>
  </div>

  {/* --- Stores Grid --- */}
  <div className="mb-12 relative z-10">
    <h2 className="text-2xl font-bold text-cyan-400/80 mb-6 text-center uppercase tracking-[0.2em] border-b border-cyan-500/20 pb-4 mx-auto w-fit">
      Sector Stores
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cityStores.map((store, index) => (
        <div key={`${store?.urlPath || index}-${index}`} className="hover:scale-[1.03] transition-transform duration-300 border border-white/5 bg-white/5 rounded-2xl p-1 backdrop-blur-sm shadow-lg hover:shadow-cyan-500/20">
           <StoreBox store={store} enc={encryptionStatus[store.urlPath]} />
        </div>
      ))}
    </div>
  </div>

  {/* --- Lore / Info Section --- */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 border-y border-white/10 py-8 bg-white/5">
    <p className="text-cyan-100/70 text-sm font-light leading-relaxed px-4 border-l-2 border-cyan-500/50">
      <strong className="text-cyan-400 block mb-1">CORE PROTOCOL:</strong> 
      No living costs required. Knowledge and information are the primary currency in this sector.
    </p>
    <p className="text-cyan-100/70 text-sm font-light leading-relaxed px-4 border-l-2 border-fuchsia-500/50">
      <strong className="text-fuchsia-400 block mb-1">CITIZEN RIGHTS:</strong> 
      Every architect has the authority to manifest new sectors, build cities, or merge existing nodes.
    </p>
    <p className="text-cyan-100/70 text-sm font-light leading-relaxed px-4 border-l-2 border-cyan-500/50">
      <strong className="text-cyan-400 block mb-1">THE DEVICE:</strong> 
      The $USDC Spinner — a fusion of ancient runic scripts and hyper-advanced neural circuitry offering escape.
    </p>
  </div>

  {address ? (
    <>
      {/* --- HUD Stats Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {/* Cost Card */}
        <div className="bg-gradient-to-br from-white/5 to-transparent border border-yellow-500/30 p-6 rounded-2xl group hover:bg-yellow-500/10 transition-all shadow-[inset_0_0_20px_rgba(234,179,8,0.05)]">
          <h2 className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span> Uptime Cost
          </h2>
          <p className="text-3xl font-mono font-bold text-white tracking-tight">
            {Math.round(Number(registrationCost) || 0)} <span className="text-sm opacity-60">USDC</span>
          </p>
        </div>

        {/* Treasury Card */}
        <div className="bg-gradient-to-br from-white/5 to-transparent border border-cyan-500/30 p-6 rounded-2xl group hover:bg-cyan-500/10 transition-all shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> Treasury
          </h2>
          <p className="text-3xl font-mono font-bold text-white tracking-tight">
            {Math.round(Number(totalDeposited) || 0)} <span className="text-sm opacity-60">USDC</span>
          </p>
        </div>

        {/* Population Card */}
        <div className="bg-gradient-to-br from-white/5 to-transparent border border-green-500/30 p-6 rounded-2xl group hover:bg-green-500/10 transition-all shadow-[inset_0_0_20px_rgba(34,197,94,0.05)]">
          <h2 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Lifeforms
          </h2>
          <p className="text-xl font-mono font-bold text-white">
            {participantsCount} <span className="text-[10px] block opacity-50 uppercase tracking-tighter mt-1">Bio-units & Droids</span>
          </p>
        </div>

        {/* User Cycles Card */}
        <div className={`p-6 rounded-2xl border transition-all relative overflow-hidden ${
            ticketsOwned >= 1 
              ? "bg-cyan-900/20 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)]" 
              : "bg-white/5 border-white/10"
          }`}>
          <h2 className={`text-xs font-bold uppercase tracking-widest mb-2 ${ticketsOwned >= 1 ? "text-cyan-300" : "text-white/40"}`}>
            Cycles Spent
          </h2>
          <p className="text-3xl font-mono font-bold text-white relative z-10">{ticketsOwned}</p>
          {ticketsOwned >= 1 && <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-cyan-400/20 blur-xl rounded-full"></div>}
        </div>
      </div>

      {/* --- Main Interaction Control Panel --- */}
      <div className="text-center mb-12 bg-gradient-to-b from-white/5 to-black/40 p-6 sm:p-10 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Animated Scanline */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent h-[10px] w-full animate-[scan_4s_linear_infinite] pointer-events-none opacity-20"></div>

        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter drop-shadow-lg">Initialize Luck Protocol</h2>
        <p className="text-cyan-400/60 mb-8 font-mono text-sm">Quantum raffle participation active. Secure connection established.</p>

        <div className="flex flex-col items-center justify-center space-y-6">
          
          {/* Input Field */}
          <div className="flex items-center space-x-4 bg-black/60 p-3 rounded-2xl border border-white/20 shadow-inner">
            <label htmlFor="ticketsToBuy" className="text-xs font-bold text-white/70 uppercase px-2">Cycles to Advance:</label>
            <input
              type="number"
              id="ticketsToBuy"
              value={ticketsToBuy}
              onChange={handleTicketChange}
              className="bg-transparent text-cyan-400 font-mono font-bold text-2xl w-24 outline-none text-right focus:text-cyan-300 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 w-full max-w-sm relative z-20">
            {ownerShip ? (
              <>
                {/* 1. APPROVE BUTTON */}
                <TransactionButton
                  disabled={ticketsToBuy < 1}
                  className="!w-full !rounded-xl !bg-white/90 hover:!bg-white !text-black !font-black !uppercase !tracking-widest !py-4 !shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  transaction={() => {
                    const cost6 = registrationCost6 && !registrationCost6.isZero() 
                      ? registrationCost6 
                      : ethers.BigNumber.from(90).mul(ethers.BigNumber.from(10).pow(6));
                    
                    const approveAmount = cost6.mul(ethers.BigNumber.from(String(ticketsToBuy))).add(ethers.BigNumber.from(1));

                    const tx = prepareContractCall({
                      contract: DEALShare,
                      method: "function approve(address spender, uint256 amount)",
                      params: [import.meta.env.VITE_LUCKDEAL, approveAmount.toString()],
                      value: 0,
                    });

                    return tx;
                  }}
                  onTransactionSent={(result) => {
                    console.log("Approval submitted", result.transactionHash);
                  }}
                  onTransactionConfirmed={(receipt) => {
                    console.log("Approval confirmed", receipt.transactionHash);
                  }}
                  onError={(error) => {
                    console.error("Approval error", error);
                  }}
                >
                  Authorize USDC Transfer
                </TransactionButton>

                {/* 2. REGISTER BUTTON */}
                <TransactionButton
                  className="!w-full !rounded-xl !bg-gradient-to-r !from-cyan-500 !to-blue-600 hover:!from-cyan-400 hover:!to-blue-500 !text-white !font-black !uppercase !tracking-widest !py-4 !shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  transaction={async () => {
                    const tx = prepareContractCall({
                      contract: luckMachineContract2,
                      method: "function register(uint256 tickets, string memory city)",
                      params: [ticketsToBuy, cityName],
                      value: 0,
                    });
                    return tx;
                  }}
                  onTransactionSent={(result) => {
                    console.log("Registration submitted", result.transactionHash);
                    setIsLoading(true);
                  }}
                  onTransactionConfirmed={async (receipt) => {
                    console.log("Registration confirmed", receipt.transactionHash);

                    const prev = Number(localStorage.getItem(ticketsStorageKey) || "0");
                    const next = (Number.isFinite(prev) ? prev : 0) + (Number(ticketsToBuy) || 0);
                    localStorage.setItem(ticketsStorageKey, String(next));
                    setTicketsOwned(next);

                    await fetchCityData();
                    await generateStory(ticketsToBuy);
                    setIsLoading(false);
                  }}
                  onError={(error) => {
                    setIsLoading(false);
                    console.error("Registration error", error);
                  }}
                >
                  INITIALIZE & DOWNLOAD NEWS
                </TransactionButton>
              </>
            ) : (
              <button
                onClick={() => navigateToDeAlStore()}
                className="bg-red-500/10 border border-red-500/50 text-red-500 font-black py-4 rounded-xl uppercase tracking-widest hover:bg-red-500/20 hover:border-red-500 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                Access Denied: Buy Citizenship
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- Data Panels: Mayor & Stocks --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="p-6 bg-white/5 rounded-2xl border-l-4 border-fuchsia-500 shadow-lg">
          <h2 className="text-xs font-bold text-fuchsia-400 uppercase mb-3 tracking-widest">Current Sector Admin (Mayor)</h2>
          <div className="text-white/90 font-mono text-sm leading-relaxed">
            {renderDescriptionWithBreaks(mayor)}
          </div>
        </div>
        <div className="p-6 bg-white/5 rounded-2xl border-l-4 border-yellow-500 shadow-lg">
          <h2 className="text-xs font-bold text-yellow-400 uppercase mb-3 tracking-widest">Mayor $UST Balance</h2>
          <div className="text-2xl text-white font-mono font-bold">
            {formatNumberWithCommas(Math.round(Number(high) || 0))} 
            <span className="text-sm font-normal text-white/50 ml-2">$UST Stocks</span>
          </div>
        </div>
      </div>

      {/* --- Dynamic Story Feed --- */}
      {story && (
        <div className="relative group p-[2px] rounded-3xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-cyan-500 bg-[length:200%_auto] animate-[gradient_3s_ease_infinite] mb-12 shadow-[0_0_40px_rgba(34,211,238,0.3)]">
          <div className="bg-[#0f0f13] p-8 rounded-[22px] h-full">
            <h2 className="text-xl font-black text-cyan-400 mb-4 uppercase flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
              Incoming Data Transmission
            </h2>
            <div className="text-white/90 leading-relaxed font-light italic font-mono whitespace-pre-line rtl">
              {story}
            </div>
          </div>
        </div>
      )}

      {/* --- Footer Instructions --- */}
      <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">
          Protocol Operating Procedure
        </h2>
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-xs font-mono text-cyan-100/60">
          <li className="flex gap-4 items-start"> 
            <span className="text-cyan-400 font-bold">01.</span> Execute payment for cycle entry.
          </li>
          <li className="flex gap-4 items-start"> 
            <span className="text-cyan-400 font-bold">02.</span> Decrypt local node transmissions (News).
          </li>
          <li className="flex gap-4 items-start"> 
            <span className="text-cyan-400 font-bold">03.</span> City-specific raffles initialized automatically.
          </li>
          <li className="flex gap-4 items-start"> 
            <span className="text-cyan-400 font-bold">04.</span> Await population density threshold.
          </li>
          <li className="flex gap-4 items-start"> 
            <span className="text-cyan-400 font-bold">05.</span> Multiverse spin sequence begins.
          </li>
          <li className="flex gap-4 items-start"> 
            <span className="text-cyan-400 font-bold">06.</span> Timeline reset upon conclusion.
          </li>
          <li className="flex gap-4 items-start"> 
            <span className="text-cyan-400 font-bold">07.</span> Victor receives 66.6% of treasury pot.
          </li>
          <li className="flex gap-4 items-start"> 
            <span className="text-cyan-400 font-bold">08.</span> System tax: 33.3% to system architects.
          </li>
        </ol>
      </div>
      
      <div className="mt-8 text-center">
         <p className="text-fuchsia-400/80 text-sm uppercase tracking-[0.3em] font-bold animate-pulse">
           May the algorithm favor your signature
         </p>
      </div>

    </>
  ) : (
    // Disconnected State
    <div className="text-center p-16 border border-dashed border-cyan-500/30 rounded-3xl bg-black/20">
       <div className="inline-block p-4 rounded-full bg-cyan-500/10 mb-4 animate-pulse">
         <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>
       </div>
       <h2 className="text-2xl text-cyan-400 font-black uppercase tracking-widest mb-2">Neural Link Required</h2>
       <p className="text-white/40 font-mono">Authenticate wallet to view node data and establish connection.</p>
    </div>
  )}
</div>
  );
};

export default City;