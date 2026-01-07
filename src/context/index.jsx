import React, { useState,useContext, createContext } from 'react';
import BigNumber from 'bignumber.js';
import CryptoJS from 'crypto-js';
import { useAddress, useContract, useMetamask,useConnectionStatus} from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { Base } from "@thirdweb-dev/chains";
import {createThirdwebClient,prepareContractCall, getContract,readContract } from "thirdweb";
import { useSendTransaction,useActiveAccount,useReadContract  } from "thirdweb/react";


const StateContext = createContext();
export const StateContextProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URLENC;
  const API_KEY = import.meta.env.VITE_API_KEYENC;
  const client = createThirdwebClient({clientId:import.meta.env.VITE_THIRDWEB_CLIENT});
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
  const apiKeyINFURA = import.meta.env.VITE_INFURA_API_KEY;
  const { contract:Blog } = useContract('0xC37EB7D011727EDE9306E1eD03d519E8e4847e6b');
  const { contract:CrowdFunding } = useContract(import.meta.env.VITE_CROWDFUNDING);
  const { contract:DEAL} = useContract(import.meta.env.VITE_DEAL_COIN_ADDRESS);
  const {contract:USDT} = useContract('0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2');
  const {contract:storeRegistery} = useContract(import.meta.env.VITE_STORE_REGISTERY);
  const {contract:TrueBlockchain} = useContract(import.meta.env.VITE_STORE_REGISTERY);
  const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`;
  const POLYRPC1 = 'https://base-mainnet.g.alchemy.com/v2/d32cys2ito51Xt9AgfAUTBuIuQd-yQbm';
  const fetchWithConfig = async (endpoint, data) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error occurred');
      }
  
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };
  const DEALContract = getContract({
    client:client,
    chain:{
      id:8453,
      rpc:POLYRPC,
    },
    address: import.meta.env.VITE_DEAL_COIN_ADDRESS,
  });
  const Blog1 = getContract({
    client:client,
    chain:{
      id:8453,
      rpc:POLYRPC,
    },
    address: "0xC37EB7D011727EDE9306E1eD03d519E8e4847e6b",
  });
  const { contract: pokerContract } = useContract("0x3CaD9b38D7E585A70A9Fa1d9F857068BDF6a5e0D");
 async function PokerLobby() {
    const tokenContract = DEAL;
    
    const games = await pokerContract.call("games");
    const { data: balance } = useContractRead(tokenContract, "balanceOf", [address]);
  
    const { mutateAsync: createGame } = useContractWrite(pokerContract, "createGame");
    const { mutateAsync: joinGame } = useContractWrite(pokerContract, "joinGame");
  
    return (
      <div className='bg-[#000001] rounded-[15px] p-2 max-w-[600px]'>
        <h1 style={{ fontSize: '2em', marginBottom: '1.5rem' }}>🎮 Decentraland Poker</h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3>Your Chips: {balance?.displayValue} PKT</h3>
          <Web3Button
            contractAddress={pokerContract?.getAddress()}
            accentColor="#7B61FF"
            style={{ marginTop: '1rem' }}
            action={() => createGame({ args: [ethers.utils.parseEther("10")] })}
          >
            🚀 Create New Game (10 PKT)
          </Web3Button>
        </div>
        {games.length>0 ? (<>
          <h2>Active Tables</h2>
        {games.map((game) => (
          <div className='bg-white bg-opacity-10 rounded-xl p-6 my-4 transition-transform duration-200 hover:-translate-y-[3px]' key={game.id}>
            <h3>Table #{game.id} • Buy-in: 10 PKT</h3>
            <p>Players: {game.players.length}/8</p>
            <Web3Button
              contractAddress={pokerContract?.getAddress()}
              accentColor="#00FF88"
              action={async () => {
                await tokenContract.erc20.setAllowance(
                  pokerContract.getAddress(),
                  ethers.utils.parseEther("10")
                );
                return joinGame({ args: [game.id] });
              }}
            >
              🃏 Join Table
            </Web3Button>
          </div>
        ))}
        </>):(<></>)}
        
      </div>
    );
  }

  const CrowdFunding1 = getContract({
    client:client,
    chain:{
      id:8453,
      rpc:POLYRPC,
    },
    address: import.meta.env.VITE_CROWDFUNDING,
  });

  const contractOfNFT = getContract({
    client:client,
    chain:{
      id:8453,
      rpc:POLYRPC,
    },
    address: '0x832B512f34868c677A8E27685958AEaf501bF30e',
  });

  const Shop = getContract({
    client:client,
    chain:{
      id:8453,
      rpc:POLYRPC,
    },
    address: import.meta.env.VITE_ULTIMATEDEAL_STORE,
  });

  const USDTForFundraising = getContract({
    client:client,
    chain:{
      id:8453,
      rpc:POLYRPC,
    },
    address: import.meta.env.VITE_DEAL_COIN_ADDRESS,
  });

  const Blockchain = getContract({
    client:client,
    chain:{
      id:8453,
      rpc:POLYRPC,
    },
    address: import.meta.env.VITE_STORE_REGISTERY,
  });

  const ethAddressToBinaryKey = (address) => {
    const wordArray = CryptoJS.enc.Hex.parse(address);
    const hash = CryptoJS.SHA256(wordArray);
    const binary = hash.toString(CryptoJS.enc.Hex)
      .split('')
      .map(char => parseInt(char, 16).toString(2).padStart(4, '0'))
      .join('');
    return binary;
  };

  const generateKey = async (address1, address2, secret) => {
    // Combine the two ETH addresses and the secret key
    const combinedKey = address1 + address2 + secret;
    // Hash the combined key to get a fixed-length key
    return CryptoJS.SHA256(combinedKey).toString();

  };

  const generateSecretKey = (binaryCode1, binaryCode2) => {
    const combinedBinary = binaryCode1 + binaryCode2;
    const seed = CryptoJS.lib.WordArray.create(
      combinedBinary.match(/.{32}/g).map(bin => parseInt(bin, 2))
    );
    const key = CryptoJS.lib.WordArray.create(32, seed);
    return key.toString(CryptoJS.enc.Base64);
  };
  

  const Token1 = getContract({
    client:client,
    chain:{
      id:8453,
      rpc:POLYRPC,
    },
    address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
  });

  const USDT1 = getContract({
    client:client,
    chain:{
      id:8453,
      rpc:POLYRPC,
    },
    address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
  });

  const DeAl = getContract({
    client:client,
    chain:{
      id:8453,
      rpc:POLYRPC,
    },
    address: import.meta.env.VITE_DEAL_COIN_ADDRESS,
  });

  const Stores = getContract({
    client:client,
    chain:{
      id:8453,
      rpc:POLYRPC,
    },
    address: import.meta.env.VITE_STORE_REGISTERY,
  });

  const ETHRPC = `https://mainnet.infura.io/v3/${apiKeyINFURA}`
  
  const [term, setTerm] = useState("");
  const formatText = (inputText) => {
    if (!inputText) return null;

    // State to track nested formatting
    let inBold = false;
    let inItalic = false;
    let inCode = false;
    let currentSegment = '';
    const segments = [];

    const processSegment = (segment, types = []) => {
      if (!segment) return null;

      // Apply formatting based on detected types
      let element = segment;
      let className = '';

      types.forEach(type => {
        switch (type) {
          case 'bold':
            className += ' font-bold';
            element = <strong key={Math.random()} className={className.trim()}>{element}</strong>;
            break;
          case 'italic':
            className += ' italic';
            element = <em key={Math.random()} className={className.trim()}>{element}</em>;
            break;
          case 'code':
            className += ' font-mono bg-gray-100 px-1 rounded';
            element = <code key={Math.random()} className={className.trim()}>{element}</code>;
            break;
          default:
            break;
        }
      });

      return element;
    };

    // Process text character by character
    for (let i = 0; i < inputText.length; i++) {
      const char = inputText[i];
      const nextChar = inputText[i + 1];

      if (char === '*' && nextChar === '*') {
        // Handle bold formatting
        if (!inBold) {
          if (currentSegment) {
            segments.push(processSegment(currentSegment, inItalic ? ['italic'] : []));
          }
          currentSegment = '';
          inBold = true;
          i++; // Skip next asterisk
        } else {
          segments.push(processSegment(currentSegment, ['bold', ...(inItalic ? ['italic'] : [])]));
          currentSegment = '';
          inBold = false;
          i++; // Skip next asterisk
        }
      } else if (char === '_') {
        // Handle italic formatting
        if (!inItalic) {
          if (currentSegment) {
            segments.push(processSegment(currentSegment, inBold ? ['bold'] : []));
          }
          currentSegment = '';
          inItalic = true;
        } else {
          segments.push(processSegment(currentSegment, ['italic', ...(inBold ? ['bold'] : [])]));
          currentSegment = '';
          inItalic = false;
        }
      } else if (char === '`') {
        // Handle inline code formatting
        if (!inCode) {
          if (currentSegment) {
            segments.push(processSegment(currentSegment, [
              ...(inBold ? ['bold'] : []),
              ...(inItalic ? ['italic'] : [])
            ]));
          }
          currentSegment = '';
          inCode = true;
        } else {
          segments.push(processSegment(currentSegment, ['code']));
          currentSegment = '';
          inCode = false;
        }
      } else {
        currentSegment += char;
      }
    }

    // Handle any remaining text
    if (currentSegment) {
      segments.push(processSegment(currentSegment, [
        ...(inBold ? ['bold'] : []),
        ...(inItalic ? ['italic'] : []),
        ...(inCode ? ['code'] : [])
      ]));
    }

    return segments;
  };
  const wallet = useActiveAccount();
  const address = wallet ? wallet.address : null;
  const connect = useMetamask();
  const isconnected = useConnectionStatus();
  const publishCampaign = async (form) => {
    
      const timestampInSeconds = Math.floor(new Date(form.endDate).getTime() / 1000);
      try {
      const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
      const gasPrice = await provider.getGasPrice();

          const transaction = prepareContractCall({
            contract:CrowdFunding1,
            method: "function createCampaign(string _profilePic, string _phoneNumber, string _title, string _description, uint256 _target, uint256 _endDate, string _videoLinkFromPinata, string _type, address _rewardTokenAddress, uint256 _initialRewardDeposit, uint256 _basePrice, uint256 _maxPrice, bool _useBondingCurve, string tokenURI) returns (uint256)",
            params: [form.profileImageLinkFromPinata,form.email, form.title, form.description, form.target*1e6, timestampInSeconds, form.videoLinkFromPinata, form.typeOfCampaign],
            value: 0,
            gasPrice: gasPrice,
          });
          await sendTransaction(transaction);

    }
      catch (error) {
        console.log(error);
      }
  }

  const postsLength = async () => {
    const posts = await Blog.call('getAllPosts');
    return posts.length;
  }

  const encryptIPFS = async (text) => {
    if (!text) throw new Error('Text is required for IPFS encryption');
    
    const response = await fetchWithConfig('/api/encrypt', {
      data: text,
      address1: '0x',
      address2: '0x',
      type: 'ipfs'
    });
    
    return response.encryptedData;
  };

  const decryptIPFS = async (encryptedText) => {
    if (!encryptedText) throw new Error('Encrypted text is required for IPFS decryption');
    
    const response = await fetchWithConfig('/api/decrypt', {
      encryptedData: encryptedText,
      address1 : '0x',
      address2 : '0x',
      ENC : '',
      type: 'ipfs'
    });
    
    return response.decryptedData;
  };

  const LoadMoreCampaigns = async (startIndex, endIndex) => { // Load 8 campaigns at a time
    let fetchedCampaigns = []; // Array to store fetched campaigns with their donation sums
  
    try {
      // Fetch the total number of campaigns available
      const totalCampaigns = await CrowdFunding.call('numberOfCampaigns');
      const lastPossibleIndex = totalCampaigns;
  
      // Determine the upper limit for the loop
      const upperLimit = Math.min(endIndex, lastPossibleIndex);
  
      // Loop from the current index to the upper limit
      for (let index = startIndex; index <= upperLimit; index++) {
        const campaign = await CrowdFunding.call('campaigns', [index]); // Check if the campaign's owner matches the given address
          const totalDonations = await getTotalDonations(index); // Fetch and sum donations for the current campaign
  
          // Add fetched campaign to the array with its total donations
          fetchedCampaigns.push({
            campaign,
            index,
            parsedCampaign: parsedCampaign(campaign, index),
            totalDonations
          });
      }
  
      // Sort campaigns by total donations in descending order
      fetchedCampaigns.sort((a, b) => b.totalDonations - a.totalDonations);
  
      return fetchedCampaigns; // Return the array or handle it as needed
    } catch (error) {
      // Handle any errors that occur during the fetch
      console.error('Failed to load campaigns:', error);
    }
  };

  const parsedCampaign = (campaign,index) => {
    return {
      emailOrPhoneNum: campaign[0],
      campaignOwner: campaign[1],
      title: campaign[2],
      description: campaign[3],
      target: campaign[4],
      endDate: campaign[5].toNumber(),
      profilePhoto: campaign[6],
      video: campaign[7],
      pId: index,   // Keep the original index from the smart contract
      category: campaign[8],
      iscashedout: campaign[9],
      isCheckedByWebsite: campaign[10],
      websiteComment: campaign[11],
    };
  }

  const lastPostIndex = async () => {
        const AllPosts = await Blog.call('getAllPosts');
        const lastPossibleIndex = AllPosts.length - 1;
        return lastPossibleIndex;
  }

  const LoadMorePosts = async (startIndex, endIndex) => { // Load 8 campaigns at a time
    let fetchedPosts = []; // Array to store fetched campaigns with their donation sums
  
    try {
        const downLimit = Math.max(endIndex, 0);
      // Loop from the current index to the upper limit
      for (let index = startIndex; index >= downLimit; index--) {
        const post = await Blog.call('getBlogPost', [index]); // Check if the campaign's owner matches the given address // Fetch and sum donations for the current campaign
          // Add fetched campaign to the array with its total donations
          fetchedPosts.push({
            post,
            index,
            parsedPost: parsedPost(post, index)
          });
      }
  
      // Sort campaigns by total donations in descending order
      fetchedPosts.sort((a, b) => b.dateTimestamp - a.dateTimestamp);
      return fetchedPosts; // Return the array or handle it as needed
    } catch (error) {
      // Handle any errors that occur during the fetch
      console.error('Failed to load posts:', error);
    }
  };



  const getTotalDonations = async (campaignId) => {
    // Call the Solidity function to get donators' info
    const [addresses, amounts, comments] = await CrowdFunding.call('getDonators', [campaignId]);
    // Initialize the total donations counter
    let totalDonations = 0;
  
    // Loop through the donation amounts to sum them up
    for (let i = 0; i < amounts.length; i++) {
        // Convert each donation to a bigger unit if necessary (multiply by 1e6)
        totalDonations += HexToInteger(amounts[i]._hex)*1e6;
    }
  
    // Return the total donations converted to a number to avoid floating point precision issues
    return totalDonations;
};

  const LoadMoreUserCampaigns = async (address, startIndex, endIndex) => { // Load 8 campaigns at a time
    let fetchedCampaigns = []; // Array to store fetched campaigns with their donation sums
  
    try {
      // Fetch the total number of campaigns available
      const totalCampaigns = await CrowdFunding.call('numberOfCampaigns');
      const lastPossibleIndex = totalCampaigns;
  
      // Determine the upper limit for the loop
      const upperLimit = Math.min(endIndex, lastPossibleIndex);
  
      // Loop from the current index to the upper limit
      for (let index = startIndex; index <= upperLimit; index++) {
        const campaign = await CrowdFunding.call('campaigns', [index]);
        if (campaign.owner === address) { // Check if the campaign's owner matches the given address
          const totalDonations = await getTotalDonations(index); // Fetch and sum donations for the current campaign
  
          // Add fetched campaign to the array with its total donations
          fetchedCampaigns.push({
            campaign,
            index,
            parsedCampaign: parsedCampaign(campaign, index),
            totalDonations
          });
        }
      }
  
      // Sort campaigns by total donations in descending order
      fetchedCampaigns.sort((a, b) => b.totalDonations - a.totalDonations);
  
      return fetchedCampaigns; // Return the array or handle it as needed
    } catch (error) {
      // Handle any errors that occur during the fetch
      console.error('Failed to load campaigns:', error);
    }
  };
  

  const publishPost = async (form) => {
    try {
    const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
    const gasPrice = await provider.getGasPrice();
    
    const transaction = prepareContractCall({
      contract:Blog1,
      method: "function postBlog(string memory category, string memory headline,string memory summary,string memory text1, string memory text2,string memory imageUrl1, string memory imageUrl2, string memory imageUrl3, string memory writerName)",
      params: [form.Category,form.title,form.summary,form.paragraph1,form.paragraph2, form.Image1LinkFromPinata,form.Image2LinkFromPinata,form.Image3LinkFromPinata,form.Writer],      value: 0,
      gasPrice: gasPrice,
    });
    sendTransaction(transaction);
    return true;
    }
    catch (error) {
      console.log("Must be connected and have the fee in the wallet: ",error);
      return false;
    }
}
    


const setApproval = async (amount) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
    const gasPrice = await provider.getGasPrice();

    const transaction = prepareContractCall({
      contract:USDTForFundraising,
      method: "function approve(address spender, uint256 amount) returns (bool)",
      params: [import.meta.env.VITE_CROWDFUNDING, amount],
      value: 0,
      gasPrice:gasPrice,
    });
    sendTransaction(transaction);
    return true;
  } catch (error) {
    console.log("Must be connected and have the amount in the wallet", error);
    return false;
  }
};

const setApprovalReward = async (amount,addressOfReward) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
    const gasPrice = await provider.getGasPrice();
    const RewardContract = await getContract({
      client:client,
      chain:{
        id:8453,
        rpc:POLYRPC,
      },
      address: addressOfReward,
    });
    const transaction = prepareContractCall({
      contract:RewardContract,
      method: "function approve(address spender, uint256 amount) returns (bool)",
      params: [import.meta.env.VITE_CROWDFUNDING, amount],
      value: 0,
      gasPrice:gasPrice,
    });
    sendTransaction(transaction);
    return true;
  } catch (error) {
    console.log("Must be connected and have the amount in the wallet", error);
    console.log(error);
    return false;
  }
};

const getRewardPrice = async (Id) => {
  const data = await CrowdFunding.call('priceRewardOfCampaign',[Id]);
  return data;
}

const getSymbol = async (Id) => {
  const data = await CrowdFunding.call('rewardName',[Id]);
  return data;
}

const getRewardAddress = async (Id) => {
  const data = await CrowdFunding.call('campaignRewards',[Id]);
  return data[0];
}


const approveCoinsForSmartContract = async (amount,supersmartcontract) => {
  try {
  const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
  const gasPrice = await provider.getGasPrice();
  const transaction = prepareContractCall({
    contract:Token1,
    method: "function approve(address spender, uint256 amount) returns (bool)",
    params: [supersmartcontract, amount*1e6],
    value: 0,
    gasPrice:gasPrice,
  });
  sendTransaction(transaction);
  }
  catch (error) {
    console.log("Must be connected and have the amount in the wallet: ",error);
  }
}

// const getStoreDetails = async (urlPath) => {
//   try {
//     const { data } = useReadContract({
//     contract:Stores,
//     method: "function getStoreByURLPath(string _urlPath) view returns ((string urlPath, address smartContractAddress, string picture, bool isPromoted, bool hidden, string name, string description, string category, uint256 creationDate, string contactInfo, address storeOwner))",
//     params: [urlPath],
//   });
//   console.log(data);
//   return data;
//   }
//   catch (error) {
//     console.log("Error: ",error);
//   }
// }

const getStoreDetails = async (urlPath) => {
  try {
    const data = await storeRegistery.call("getStoreByURLPath",[urlPath]);
  return data;
  }
  catch (error) {
    console.log("Error: ",error);
  }
}

const getVotingDetails = async (urlPath) => {
  try {
    const data = await storeRegistery.call("getStoreVotingSystem",[urlPath]);
  return data;
  }
  catch (error) {
    console.log("Error: ",error);
  }
}

const addStoreDetails = async (form) => {

  try {
    const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
    const gasPrice = await provider.getGasPrice();
    const transaction = prepareContractCall({
      contract:Stores,
      method: "function registerStore(string _urlPath, address _smartContractAddress, string _picture, string _name, string _description, string _category, string _contactInfo, uint256 _receiptId, string _city, address _votingSystemAddress, address _ERCUltra)", 
      params: [form._urlPath, form._smartContractAddress, form._picture, form._name, form._description, form._category, form._contactInfo,Number(form._receiptId)+1,form._city,form.voting,form.ercultra], 
      gasPrice:gasPrice,
    });
    sendTransaction(transaction);
    return true;
    }
    catch (error) {
      console.log("Must be connected and have the fee in the wallet: ",error);
      return false;
    }

}

const addOfficialStoreDetails = async (form) => {

  try {
    const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
    const gasPrice = await provider.getGasPrice();
    
    const transaction = prepareContractCall({
      contract:Stores,
      method: "function setOfficialStore(string _urlPath, address _smartContractAddress, string _picture, string _name, string _description, string _category, string _contactInfo, string _city, address _votingSystemAddress, address _ERCUltra)", 
      params: [form._urlPath, form._smartContractAddress, form._picture, form._name, form._description, form._category, form._contactInfo, form._city,form.voting,form.ercultra],
      gasPrice:gasPrice,
    });
    sendTransaction(transaction);
    return true;
    }
    catch (error) {
      console.log("Must be connected and have the fee in the wallet: ",error);
      return false;
    }

}

const editOfficialStoreDetails = async (form) => {

  try {
    const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
    const gasPrice = await provider.getGasPrice();
    
    const transaction = prepareContractCall({
      contract:Stores,
      method: "function editOfficialStore(string _urlPath, address _smartContractAddress, string _picture, string _name, string _description, string _category, string _contactInfo, string _city, address _votingSystemAddress, address _ERCUltra)", 
      params: [form._urlPath, form._smartContractAddress, form._picture, form._name, form._description, form._category, form._contactInfo, form._city, form.voting, form.ercultra],
      gasPrice:gasPrice,
    });
    sendTransaction(transaction);
    return true;
    }
    catch (error) {
      console.log("Must be connected and have the fee in the wallet: ",error);
      return false;
    }

}

const editStoreDetails = async (form) => {

  try {
    const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
    const gasPrice = await provider.getGasPrice();
    
    const transaction = prepareContractCall({
      contract:Stores,
      method: "function editStore(string _urlPath, string _picture, string _name, string _description, string _category, string _contactInfo, address _storeOwner, string _city)", 
      params: [form._urlPath, form._picture, form._name, form._description, form._category, form._contactInfo, form._storeOwner,form._city],
      gasPrice:gasPrice,
    });
    sendTransaction(transaction);
    return true;
    }
    catch (error) {
      console.log("Must be connected and have the fee in the wallet: ",error);
      return false;
    }

}

const getOfficialStoreDetails = async () => {
    
    const data = await storeRegistery.call("officialStore");
    return data;

}

const getAllStoreOwners = async () => {

    
    const data = await storeRegistery.call("getVisibleStoreOwners");
    return data;

}

const getNewStores = async () => {
  try {
    
    const data = await storeRegistery.call("getRecentStores");
    return data;
    }
    catch (error) {
      console.log("Must be connected and have the fee in the wallet: ",error);
      return false;
    }
}

const getAllStores = async () => {

  try {
    
    const data = await storeRegistery.call("getAllStores");
    return data;
    }
    catch (error) {
      console.log("Must be connected and have the fee in the wallet: ",error);
      return false;
    }

}

const getPromotedStores = async () => {

  try {
    
    const data = await storeRegistery.call("getPromotedStores");
    return data;
    }
    catch (error) {
      console.log("Must be connected and have the fee in the wallet: ",error);
      return false;
    }

}



const approveCoinsForSmartContractUSDT = async (amount,supersmartcontract) => {
  try {
  const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
  const gasPrice = await provider.getGasPrice();
  const transaction = prepareContractCall({
    contract:USDT1,
    method: "function approve(address spender, uint256 amount) returns (bool)",
    params: [supersmartcontract, amount],
    value: 0,
    gasPrice: gasPrice,
  });
  sendTransaction(transaction);
  //const data = await USDT.call("approve", [supersmartcontract, amount*1e6], { gasPrice: gasPrice, gasLimit:500000000});
}
catch(error) {
  console.log(error);
}
}

const approveCoinsForSmartContractDeAl = async (amount,supersmartcontract) => {
  try {
  const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
  const gasPrice = await provider.getGasPrice();
  const transaction = prepareContractCall({
    contract:DEALContract,
    method: "function approve(address spender, uint256 amount) returns (bool)",
    params: [supersmartcontract, amount],
    value: 0,
    gasPrice: gasPrice,
  });
  sendTransaction(transaction);
  //const data = await USDT.call("approve", [supersmartcontract, amount*1e6], { gasPrice: gasPrice, gasLimit:500000000});
}
catch(error) {
  console.log(error);
}
}


const setCost = async (newCost) => {
  try {
  const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
  const gasPrice = await provider.getGasPrice();
  const transaction = prepareContractCall({
    contract:CrowdFunding1,
    method: "function setCost(uint256 _costInNormalNumber)",
    params: [newCost*1e6],
    value: 0,
    gasPrice:gasPrice,
  });
  sendTransaction(transaction);
  //const data = await CrowdFunding.call("setCost", [newCost], { gasPrice: gasPrice, gasLimit:500000000});



  }
  catch (error) {
    console.log("Must be connected and have the fee in the wallet: ",error);
  }
}

const setDiscountRate = async (newDiscountRate) => {
  try {
  const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
  const gasPrice = await provider.getGasPrice();
  const transaction = prepareContractCall({
    contract:CrowdFunding1,
    method: "function setDiscountRate(uint256 _precenetage)",
    params: [newDiscountRate],
    value: 0,
    gasPrice:gasPrice,
  });
  sendTransaction(transaction);
  //const data = await CrowdFunding.call("setDiscountRate", [newDiscountRate], { gasPrice: gasPrice, gasLimit:500000000});
  }
  catch (error) {
    console.log("Must be connected and have the fee in the wallet: ",error);
  }
}

const editPost = async (form) => {
  try {
  const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
  const gasPrice = await provider.getGasPrice();
  const transaction = prepareContractCall({
    contract:Blog1,
    method: "function editBlogPost(uint256 postId, string memory newHeadline, string memory newSummary, string memory newText1, string memory newText2, string memory newImageUrls1, string memory newImageUrls2, string memory newImageUrls3, string memory newWriterName)",
    params: [ethers.BigNumber.from(form.postId),form.title,form.summary,form.paragraph1,form.paragraph2,form.Image1LinkFromPinata,form.Image2LinkFromPinata,form.Image3LinkFromPinata,form.Writer],
    value: 0,
    gasPrice:gasPrice,
  });
  sendTransaction(transaction);
  //const data = await Blog.call("editBlogPost", [ethers.BigNumber.from(form.postId),form.title,form.summary,form.paragraph1,form.paragraph2,form.Image1LinkFromPinata,form.Image2LinkFromPinata,form.Image3LinkFromPinata,form.Writer], { gasPrice: gasPrice, gasLimit:500000000});
  return true;
  }
  catch (error) {
    console.log("Must be connected and have the fee in the wallet: ", error);
    return false;
  }
}

const publishEditedCampaign = async (campaignId,title,description,video,profile) => {
  try {
  const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
  const gasPrice = await provider.getGasPrice();

  const transaction = prepareContractCall({
    contract:CrowdFunding1,
    method: "function editCampaign(uint256 _campaignId , string memory _title, string memory _description, string memory _videoLinkFromPinata, string memory _profilePic) returns (uint256)",
    params: [campaignId, title , description , video, profile],
    value: 0,
    gasPrice:gasPrice,
  });
  sendTransaction(transaction);


  //const data = await CrowdFunding.call("editCampaign", [campaignId, title , description , video, profile], { gasPrice: gasPrice, gasLimit:500000000});
  return true;
  }
  catch (error) {
    console.log(error);
    return false;
  }
}


  const Verification = async (CampaignIndex,Comment) => {
    const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
    const gasPrice = await provider.getGasPrice();
    const transaction = prepareContractCall({
      contract:CrowdFunding1,
      method: "function verifyCampaign(uint256 _id,string memory _websiteComment)",
      params: [CampaignIndex,Comment],
      value: 0,
      gasPrice:gasPrice,
    });
    sendTransaction(transaction);
    //const isVIP = await CrowdFunding.call('verifyCampaign',[CampaignIndex,Comment], {gasPrice:gasPrice, gasLimit:500000000});
  }

  const unVerification = async (CampaignIndex) => {
    const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
    const gasPrice = await provider.getGasPrice();
    const transaction = prepareContractCall({
      contract:CrowdFunding1,
      method: "function closeCampaign(uint256 _id)",
      params: [CampaignIndex],
      value: 0,
      gasPrice:gasPrice,
    });
    sendTransaction(transaction);
    //const isVIP = await CrowdFunding.call('closeCampaign',[CampaignIndex], {gasPrice:gasPrice, gasLimit:500000000});
    //return isVIP;
  }

  const stopCampaign = async (CampaignIndex) => {
    const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
    const gasPrice = await provider.getGasPrice();

    const transaction = prepareContractCall({
      contract:CrowdFunding1,
      method: "function stopCampaignByMod(uint256 _campaignId)",
      params: [CampaignIndex],
      value: 0,
      gasPrice:gasPrice,
    });
    sendTransaction(transaction);

    //const isVIP = await CrowdFunding.call('stopCampaignByMod',[CampaignIndex], {gasPrice:gasPrice, gasLimit:500000000});
    //return isVIP;
  }

  const getPrice = async () => {
    const price = await CrowdFunding.call('getPrice');
    return price;
  }

  const getTotal = async () => {
    const total = await CrowdFunding.call('returnTotal');
    return HexToInteger(total._hex);

  }

  const addModeratorToCampaignContract = async (moderatorAddress) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
      const gasPrice = await provider.getGasPrice();

      const transaction = prepareContractCall({
        contract:CrowdFunding1,
        method: "function addModerator(address _moderator)",
        params: [moderatorAddress],
        value: 0,
        gasPrice:gasPrice,
      });
      sendTransaction(transaction);

      //const data = await CrowdFunding.call("addModerator", [moderatorAddress], { gasPrice: gasPrice, gasLimit:500000000});
    }
    catch (error) {
      console.log("Must be connected and have the fee in the wallet: ",error);
    }
  }


  const addModeratorToBlogContract = async (moderatorAddress) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
      const gasPrice = await provider.getGasPrice();
      
      const transaction = prepareContractCall({
        contract:Blog1,
        method: "function addModerator(address _moderator)",
        params: [moderatorAddress],
        value: 0,
        gasPrice:gasPrice,
      });
      sendTransaction(transaction);
      //const data = await Blog.call("addModerator", [moderatorAddress], { gasPrice: gasPrice, gasLimit:500000000});
    }
    catch (error) {
      console.log("Must be connected and have the fee in the wallet: ", error);
    }
  }

  const RemoveModeratorCampaignContract = async (moderatorAddress) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
      const gasPrice = await provider.getGasPrice();

      const transaction = prepareContractCall({
        contract:CrowdFunding1,
        method: "function removeModerator(address _moderator)",
        params: [moderatorAddress],
        value: 0,
        gasPrice:gasPrice,
      });
      sendTransaction(transaction);

      //const data = await CrowdFunding.call("removeModerator", [moderatorAddress], { gasPrice: gasPrice, gasLimit:500000000});
    }
    catch (error) {
      console.log("Must be connected and have the fee in the wallet: ",error);
    }
  }

  const RemoveModeratorBlogContract = async (moderatorAddress) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
      const gasPrice = await provider.getGasPrice();
      const transaction = prepareContractCall({
        contract:Blog1,
        method: "function removeModerator(address _moderator)",
        params: [moderatorAddress],
        value: 0,
        gasPrice:gasPrice,
      });
      sendTransaction(transaction);

      //const data = await Blog.call("removeModerator", [moderatorAddress], { gasPrice: gasPrice, gasLimit:500000000});
    }
    catch (error) {
      console.log("Must be connected and have the fee in the wallet: ",error);
    }
  }


  const HexToInteger = ( hexValue ) => {
    const number = new BigNumber(hexValue, 16); // Convert from hex (base 16) to BigNumber
    const intValue = number.toNumber(); // Convert BigNumber to a regular number
    return intValue;
  };

  const getCustomer = async (address) => {
    const customer = await CrowdFunding.call('customers',[address]);

    return {
      customerName: customer.customerName,
      customerEmail: customer.email,
      customerPhoneNum: customer.phoneNum,
    };
  }

  const getCampaigns = async () => {
    const campaigns = await CrowdFunding.call('getCampaigns');
    
    const parsedCampaigns = await campaigns.map((campaign, i) => {
      let totalInvested =  getToalInvested(i);
        return {
            phoneNumber: campaign.phoneNumber,
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: campaign.target,
            endDate: campaign.endDate.toNumber(),
            videoLinkFromPinata: campaign.videoLinkFromPinata,
            typeOfCampaign: campaign.typeOfCampaign,
            pId: i,   // Keep the original index from the smart contract
            iscashedout: campaign.cashedOut,
            websiteComment: campaign.websiteComment,
            isCheckedByWebsite: campaign.isCheckedByWebsite,
            profilePic: campaign.profilePic,
            totalInvested: totalInvested,
            ownerName: campaign.ownerName,

        };
    });
  

    return parsedCampaigns;  // Filter out any null values (deleted campaigns)
}


const Featured = async () => {
  const campaigns = await getCampaigns();
  const featuredCampaigns = campaigns.filter(campaign =>
    campaign.websiteComment && (campaign.websiteComment.includes("featured") || campaign.websiteComment.includes("Featured")))
  return featuredCampaigns;
}

  const getToalInvested = async (campaignId) => {
    const investments = await getDonations(campaignId);
    return investments[3];
  }

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);

    return filteredCampaigns;
  }

  const report = async (pId, amount, comment) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
      const gasPrice = await provider.getGasPrice();

      const transaction = prepareContractCall({
        contract:CrowdFunding1,
        method: "function reportCampaign(uint256 _campaignId, string memory _reason)",
        params: [pId, comment],
        value: 0,
        gasPrice:gasPrice,
      });
      sendTransaction(transaction);

        //const data = await CrowdFunding.call('reportCampaign', [pId, comment], { gasPrice: gasPrice, gasLimit:500000000});
        return true;
    } catch (error) {
        console.log("Must be connected and have the fee in the wallet and put 5 USDT in the amount field: ",error);
        return false;
    }
  }

  const getThisCampaign = async (campaignId) => {
    // Call the smart contract to fetch the campaign details by ID
    const campaign = await CrowdFunding.call('getCampaign', [campaignId]);
    const donations = await CrowdFunding.call('getDonators', [campaignId]);
    if(donations[4] == 0) {
      return {
        phoneNumber: campaign[0],
        owner: campaign[1],  // Address of the owner
        title: campaign[2],  // Title of the campaign
        description: campaign[3],  // Description of the campaign
        target: HexToInteger(campaign[4]._hex),  // Convert the target amount for readability
        endDate: campaign[5],  // Convert blockchain timestamp to JavaScript Date
        profilePhoto: campaign[6],  // URL or hash of the profile photo
        videoLinkFromPinata: campaign[7],  // Hash of the video from Pinata
        category: campaign[8],  // Type/category of the campaign
        pId: campaignId,  // The campaign ID
        iscashedout: campaign[9],  // Boolean flag for cashed out
        isCheckedByWebsite: campaign[10],  // Boolean flag for verification
        websiteComment: campaign[11],  // Comments from the website
        investors: null,  // Array of donators' addresses
        investments: null,  // Array of donation amounts
        comments: null,  // Array of comments from donators
        totalInvested: 0,  // Total amount invested in the campaign
        minimum: campaign[12]
      }
    }
    else {
    return {
        phoneNumber: campaign[0],
        owner: campaign[1],  // Address of the owner
        title: campaign[2],  // Title of the campaign
        description: campaign[3],  // Description of the campaign
        target:HexToInteger(campaign[4]._hex),  // Convert the target amount for readability
        endDate: campaign[5],  // Convert blockchain timestamp to JavaScript Date
        profilePhoto: campaign[6],  // URL or hash of the profile photo
        videoLinkFromPinata: campaign[7],  // Hash of the video from Pinata
        category: campaign[8],  // Type/category of the campaign
        pId: campaignId,  // The campaign ID
        iscashedout: campaign[9],  // Boolean flag for cashed out
        isCheckedByWebsite: campaign[10],  // Boolean flag for verification
        websiteComment: campaign[11],  // Comments from the website
        investors: donations[0],  // Array of donators' addresses
        invetments: donations[1],  // Array of donation amounts
        comments: donations[2],  // Array of comments from donators
        totalInvested: donations[3],  // Total amount invested in the campaign
    };
  }
}


  const PayForWorker = async (workerAddress, amount) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
      const gasPrice = await provider.getGasPrice();
      const data = await CrowdFunding.call('payForWorker', [workerAddress,amount], { gasPrice: gasPrice, gasLimit:500000000});
      return data;
    } catch (error) {
      console.log("Must be connected and have the amount in the wallet");
    }
  }

  const emailUsAboutTerms = async () => {
    const emailRecipient = "support@ultrashop.tech"; // Change to the desired email recipient
    const subject = `I Have A Question About The Terms`;
    const body = `Hello, I have a question about the terms. My question is:`;

    // Construct the mailto link
    const mailtoLink = `mailto:${emailRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open the mail client
    window.location.href = mailtoLink;
  }

  const ReportCampaign = async (id) => {
    const emailRecipient = "support@ultrashop.tech"; // Change to the desired email recipient
    const subject = `I want to report a campaign`;
    const body = `Hello, I want to report a campaign:\n The campaign ID is ${id}\n Reason:\n\n\nMy Details Are:\n
    Name:
    Phone:(+1)
    `;

    // Construct the mailto link
    const mailtoLink = `mailto:${emailRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open the mail client
    window.location.href = mailtoLink;
  }

  const Deposit = async (amount) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
      const gasPrice = await provider.getGasPrice();
      const data = await CrowdFunding.call('deposit', [amount*1e6], { gasPrice: gasPrice, gasLimit:500000000});
      return data;
    } catch (error) {
      console.log("Must be connected and have the fee in the wallet");
    }
  }

  const emailUsAboutPrivacyPolicy = async () => {
    const emailRecipient = "support@ultrashop.tech"; // Change to the desired email recipient
    const subject = `I Have A Question About The Privacy Policy`;
    const body = `Hello, I have a question about the privacy policy. My question is:`;

    // Construct the mailto link
    const mailtoLink = `mailto:${emailRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open the mail client
    window.location.href = mailtoLink;
  }

  const contactUsEmail = async () => {
    const emailRecipient = "support@ultrashop.tech"
    const subject = `I Have A Question About UltimateDeal.net`;
    const body = `Hello, I have a question about UltimateDeal.net. My question is:`;

    // Construct the mailto link
    const mailtoLink = `mailto:${emailRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open the mail client
    window.location.href = mailtoLink;
  }

  const LandingPageContactUs = async () => {
    const emailRecipient = "support@ultrashop.tech"; // Change to the desired email recipient
    const subject = `I Have A Question About Becoming VIP Member`;
    const body = `Hello, I have a question about the VIP membership. My question is:`;

    // Construct the mailto link
    const mailtoLink = `mailto:${emailRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open the mail client
    window.location.href = mailtoLink;
  }

  const emailUsAbout = async () => {
    const emailRecipient = "support@ultrashop.tech"; // Change to the desired email recipient
    const subject = `I Have A Question About UltraShop`;
    const body = `I have a question about UltraShop My question is:`;

    // Construct the mailto link
    const mailtoLink = `mailto:${emailRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open the mail client
    window.location.href = mailtoLink;
  }

  const getSearchedCampaigns = async (searchTerm, startIndex, lastIndex) => {
    const allCampaigns = await LoadMoreCampaigns(startIndex, lastIndex);
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filteredCampaigns = allCampaigns.filter((campaign) => {
      return (campaign.parsedCampaign.title && campaign.parsedCampaign.title.toLowerCase().includes(lowerCaseSearchTerm)) ||
             (campaign.parsedCampaign.description && campaign.parsedCampaign.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
             (campaign.parsedCampaign.typeOfCampaign && campaign.parsedCampaign.typeOfCampaign.toLowerCase().includes(lowerCaseSearchTerm));
  });

    return filteredCampaigns;
};





  const withdrawDonationAfterEndTime = async (pId) => {
    try {
    const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
    const gasPrice = await provider.getGasPrice();

    const transaction = prepareContractCall({
      contract:CrowdFunding1,
      method: "function withdrawCampaign(uint256 _id)",
      params: [pId],
      value: 0,
      gasPrice:gasPrice,
    });
    sendTransaction(transaction);

    //const data = await CrowdFunding.call('withdrawCampaign', [pId], {gasPrice: gasPrice, gasLimit:500000000});
    return data;
    }
    catch (error) {
      console.log("Must be connected and have the fee in the wallet: ",error);
    }
  }


  const donate = async (pId, comment, amount,profilePic,name) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
      const gasPrice = await provider.getGasPrice();

      const transaction = prepareContractCall({
        contract:CrowdFunding1,
        method: "function donateToCampaign(uint256 _id, string memory _comment,uint256 amount,string memory _profilePic, string memory _name)",
        params: [pId, comment,amount,profilePic,name],
        value: 0,
        gasPrice:gasPrice,
      });
      sendTransaction(transaction);

      //const data = await CrowdFunding.call('donateToCampaign', [pId, comment,amount,profilePic,name], {gasPrice: gasPrice, gasLimit:500000000});
      return true;
    } catch (error) {
      console.log("Must be connected and have the fee in the wallet and put atleast 5 USDT in the amount field: ",error);
      return false;
    }
  }

  const getDonations = async (pId) => {
    const invetments = await CrowdFunding.call('getDonators', [pId]);
    return {
      addresses: invetments[0],
      amounts: invetments[1],
      comments: invetments[2],
      totalDonations: invetments[3],
      names: invetments[4],
      pics: invetments[5],
    };
  }


  const parsedPost = (BlogPost, i) => {
    return {
        dateTimestamp: BlogPost[1],
        text1: BlogPost[3][0],
        text2: BlogPost[3][1],
        imageUrls1: BlogPost[4][0],
        imageUrls2: BlogPost[4][1],
        imageUrls3: BlogPost[4][2],
        summary: BlogPost[2],
        headline: BlogPost[0],
        comments: BlogPost[5],
        writerName: BlogPost[6],
        pId: i,
    };
}

  const getAllBlogPosts = async () => {
    const BlogPosts = await Blog.call('getAllPosts');
    
    const parsedBlog = await BlogPosts.map((BlogPost, i) => {
        return {
            category: BlogPost.category,
            dateTimestamp: BlogPost.dateTimestamp,
            visible: BlogPost.visible,
            text1: BlogPost.text[0],
            text2: BlogPost.text[1],
            imageUrls1: BlogPost.imageUrls[0],
            imageUrls2: BlogPost.imageUrls[1],
            imageUrls3: BlogPost.imageUrls[2],
            summary: BlogPost.summary,
            headline: BlogPost.headline,
            writerName: BlogPost.writerName,
            pId: i,
        };
    });
  
    return parsedBlog.filter(BlogPost => BlogPost.visible !== false);  // Filter out any null values (deleted campaigns)
  }

  const getBlogPost = async (postId) => {
    const post = await Blog.call('getBlogPost',[postId]);
        return {
            dateTimestamp: post[1],
            category: post[1],
            isVisible: post[2],
            text1: post[3][0],
            text2: post[3][1],
            imageUrls1: post[4][0],
            imageUrls2: post[4][1],
            imageUrls3: post[4][2],
            summary: post[2],
            headline: post[0],
            writerName: post[6],
            commentsWithLikes: post[5],
            pId: postId,
        };
  }

  const refreshPage = () => {
    window.location.href = window.location.href;
  };

  const getComments = async (CommentWithLikes) => {

    const parsedComments = await CommentWithLikes.map((CommentWithLikes, i) => {
      return {
        commentId: i,
        isVisible: CommentWithLikes[i][0],
        commenter: CommentWithLikes[i][1],
        commentText: CommentWithLikes[i][2],
        likes: CommentWithLikes[i][3],
      };
    });

    return parsedComments.filter(CommentsWithLikes => CommentsWithLikes.isVisible === false); 
  }


  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp));
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

const formatDate2 = (timestamp) => {
  const date = new Date(Number(timestamp));
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 7).toString().padStart(2, '0'); // Months are zero-indexed
  const year = (date.getFullYear()+53).toString().padStart(2, '0');;
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function hexToTimestamp(hexString) {
  const str = hexString.toString();
  let cleanHexString;

  // Check if the string starts with '0x' and remove it
  if (str.startsWith("0x")) {
      cleanHexString = str.substring(2);
  } else {
      cleanHexString = str;
  }

  // Convert the cleaned hexadecimal string to a decimal number (base 10)
  const decimal = parseInt(cleanHexString, 16);

  // Create a new Date object using the decimal number as the Unix timestamp
  const date = formatDate(decimal * 1000);

  // Return the date as a locale-specific string
  return date.toLocaleString();
}  


const commentToBlogPost = async (pId,form) => {
  try {
  const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
  const gasPrice = await provider.getGasPrice();

  const transaction = prepareContractCall({
    contract:Blog1,
    method: "function commentOnBlog(uint256 postId, string commenterName, string commentText)",
    params: [pId, form.commenter ,form.comment],
    value: 0,
    gasPrice:gasPrice,
  });
  await sendTransaction(transaction);
  await refreshPage();
  return true;
  }
  catch (error) {
    console.log("Must be connected and have the fee in the wallet: ", error);
    return false;
  }
}

const likeComment = async (pId, commentId) => {
  try {
  const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
  const gasPrice = await provider.getGasPrice();

  const transaction = prepareContractCall({
    contract:Blog1,
    method: "function likeComment(uint256 postId, uint256 commentId)",
    params: [pId, commentId],
    value: 0,
    gasPrice:gasPrice,
  });
  sendTransaction(transaction);
  }
  catch (error) {
    console.log("Must be connected and have the fee in the wallet: ", error);
  }
}

const checkIfEncrypted = async (urlPath) => {
  const data = await storeRegistery.call('getStoreVotingSystem', [urlPath]);
  return data[5];
}


const encrypt = async (data, address1, address2) => {
  if (!address1 || !address2) {
    throw new Error('Data and both addresses are required for encryption');
  }

  if (!data) {
    data = "No Message!"
  }

  if (!isValidEthereumAddress(address1) || !isValidEthereumAddress(address2)) {
    throw new Error('Invalid Ethereum address format');
  }

  const response = await fetchWithConfig('/api/encrypt', {
    data,
    address1,
    address2,
    type: "default",
  });

  return response.encryptedData;
};

const login = async (address,password) => {

  if (!isValidEthereumAddress(address)) {
    throw new Error('Invalid Ethereum address format');
  }

  const response = await fetchWithConfig('/api/verify-password', {
    address,
    password,
  });

  return response.valid;
};

const getPass = async (address) => {

  if (!isValidEthereumAddress(address)) {
    throw new Error('Invalid Ethereum address format');
  }

  const response = await fetchWithConfig('/api/register-address', {
    address,
  });

  return response.password;
};

const decryptData = async (encryptedData,secretKey,address1,address2) => {
  try {
    const nonKey = await secretKey;
    if(nonKey=='') {
      return encryptedData;
    }

    const t = await generateKey(address1.toLowerCase(),address2.toLowerCase(),"");
    const rawData = CryptoJS.enc.Base64.parse(encryptedData).toString(CryptoJS.enc.Utf8);
    const bytes = CryptoJS.AES.decrypt(rawData, t);
    const originalData = bytes.toString(CryptoJS.enc.Utf8);
    return originalData.toString();
  } catch (e) {
    console.error('Error during decryption: ' + e);
    return '';
  }
};

const isValidEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const decrypt = async (encryptedData, ENC, address1, address2, type = 'default', password) => {
  try {
    if (!encryptedData) {
      throw new Error('Encrypted data is required for decryption');
    }

    // Only validate addresses if not IPFS type
    if (type !== 'ipfs') {
      if (!address1 || !address2) {
        throw new Error('Both addresses are required for decryption');
      }

      if (!isValidEthereumAddress(address1) || !isValidEthereumAddress(address2)) {
        throw new Error('Invalid Ethereum address format');
      }
    }

    const response = await fetchWithConfig('/api/decrypt', {
      encryptedData,
      ENC,
      address1,
      address2,
      type,
      password
    });

    return response.decryptedData;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw error; // Re-throw the error instead of returning empty string
  }
};



const addANewCustomer = async (customerName, customerEmail, customerPhoneNum) => {
  try {
  const secretKey = import.meta.env.VITE_SECRET_KEY_ENCRYPTION
  const encryptedName = encryptData(customerName,secretKey);
  const encryptedEmail = encryptData(customerEmail,secretKey);
  const encryptedPhoneNum = encryptData(customerPhoneNum,secretKey);
  const provider = new ethers.providers.JsonRpcProvider(POLYRPC,Base);
  const gasPrice = await provider.getGasPrice();

  const transaction = prepareContractCall({
    contract:CrowdFunding1,
    method: "function addCustomer(string memory email, string memory phoneNum, string memory customerName)",
    params: [encryptedEmail,encryptedPhoneNum,encryptedName],
    value: 0,
    gasPrice:gasPrice,
  });
  sendTransaction(transaction);
}
catch (error) {
  console.log ("Kindly contact support, error: ",error);
}
  //const data = CrowdFunding.call("addCustomer",[encryptedEmail,encryptedPhoneNum,encryptedName],{gasPrice:gasPrice, gasLimit:500000000})
// queueId is a reference to the transaction queued by Engine.
};



const encryptData = (data,secretKey) => {
  const encryptedData = CryptoJS.AES.encrypt(data, secretKey).toString();
  // Convert to Base64 to change the format
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encryptedData));
};

const Decryption = (encryptedData, secretKey) => {
  try {
    // First convert from Base64 back to original encrypted string
    const parsedData = CryptoJS.enc.Base64.parse(encryptedData).toString(CryptoJS.enc.Utf8);
    
    // Decrypt the data using AES and the secret key
    const decryptedBytes = CryptoJS.AES.decrypt(parsedData, secretKey);
    
    // Convert the decrypted bytes back to string
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};


async function getDiscountRatePrencentage () {
  try{
    const discountRatePrencentage = await CrowdFunding.call('discountRate');
    return Number(discountRatePrencentage);
  }
  catch(error) {
    return 0;
  }
}

  return (
    <StateContext.Provider
      value={{
        Blog1, 
        address,
        editPost,
        commentToBlogPost,
        likeComment,
        connect,
        hexToTimestamp,
        getAllBlogPosts,
        getBlogPost,
        getComments,
        formatDate,
        formatDate2,
        setTerm,
        withdrawDonationAfterEndTime,
        createCampaign: publishCampaign,
        createPost: publishPost,
        editCampaign: publishEditedCampaign,
        getCampaigns,
        generateSecretKey,
        getUserCampaigns,
        getSearchedCampaigns,
        donate,
        getDonations,
        report,
        emailUsAboutTerms,
        emailUsAbout,
        getThisCampaign,
        refreshPage,
        getPrice,
        HexToInteger,
        addANewCustomer,
        decryptData,
        getDiscountRatePrencentage,
        LandingPageContactUs,
        Verification,
        unVerification,
        stopCampaign,
        getCustomer,
        isconnected,
        setDiscountRate,
        setCost,
        emailUsAboutPrivacyPolicy,
        Blog,
        CrowdFunding,
        getTotal,
        Decryption,
        addModeratorToBlogContract,
        addModeratorToCampaignContract,
        PayForWorker,
        RemoveModeratorBlogContract,
        RemoveModeratorCampaignContract,
        setApproval,
        approveCoinsForSmartContract,
        Deposit,
        encrypt,
        approveCoinsForSmartContractUSDT,
        LoadMoreCampaigns,
        getTotalDonations,
        LoadMoreUserCampaigns,
        LoadMorePosts,
        lastPostIndex,
        PokerLobby,
        Featured,
        contactUsEmail,
        postsLength,
        encryptData,
        contractOfNFT,
        USDT1,
        Stores,
        getStoreDetails,
        addStoreDetails,
        addOfficialStoreDetails,
        editOfficialStoreDetails,
        getOfficialStoreDetails,
        getNewStores,
        getAllStores,
        getPromotedStores,
        storeRegistery,
        getAllStoreOwners,
        Blockchain,
        TrueBlockchain,
        DEAL,
        DEALContract,
        USDTForFundraising,
        CrowdFunding1,
        editStoreDetails,
        ReportCampaign,
        setApprovalReward,
        getVotingDetails,
        getRewardPrice,
        getSymbol,
        generateKey,
        getRewardAddress,
        checkIfEncrypted,
        approveCoinsForSmartContractDeAl,
        ethAddressToBinaryKey,
        encryptIPFS,
        decryptIPFS,
        formatText,
        decrypt,
        Shop,
        login,
        getPass
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext);
