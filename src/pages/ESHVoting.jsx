import React, { useState, useEffect } from 'react';
import { useContract } from '@thirdweb-dev/react';
import { useStateContext } from '../context';
import { TransactionButton } from 'thirdweb/react';
import { prepareContractCall, createThirdwebClient, getContract } from 'thirdweb';

const ESHVoting = () => {
  const { storeRegistery, HexToInteger } = useStateContext();
  const StoreURL = window.location.pathname.split('/')[2];
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
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
          const defaultSize = fontSizes[defaultFontSizeIndex-3];
  
          switch (style) {
              case '~':
                  element = <span key={index} className={`text-[#FFDD00] text-${defaultSize}`}>{element}</span>;
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
  
  

  const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
  const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`;
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: ''
  });

  const client = createThirdwebClient({
    clientId: import.meta.env.VITE_THIRDWEB_CLIENT
  });
  const [votingAddress, setVotingAddress] = useState('');
  const { contract: votingContract } = useContract(votingAddress);
  const { contract: tokenContract } = useContract("YOUR_TOKEN_ADDRESS");

  const votingContract1 = getContract({
    client: client,
    chain: {
      id: 8453,
      rpc: POLYRPC,
    },
    address: votingAddress,
  });

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const proposalCount = await votingContract.call('proposalCount');
      // Convert proposalCount from BigNumber if necessary
      const countValue = proposalCount._hex ? Number(proposalCount.toString()) : Number(proposalCount);
      const startIndex = Math.max(countValue - 10 - (page * 10), 0);
      const endIndex = Math.max(countValue - (page * 10), 0);
      
      const proposalPromises = [];
      for (let i = startIndex; i < endIndex; i++) {
        proposalPromises.push(votingContract.call('getProposal', [i + 1]));
      }
      
      const fetchedProposals = await Promise.all(proposalPromises);
      const formattedProposals = await Promise.all(
        fetchedProposals.map(async (p, index) => {
          const [passed, percentage] = await votingContract.call('getProposalResult', [startIndex + index + 1]);
          
          // Convert BigNumber values to regular numbers
          const votesFor = p[3]._hex ? HexToInteger(p[3]._hex) : Number(p[3].toString());
          const votesAgainst = p[4]._hex ? HexToInteger(p[4]._hex) : Number(p[4].toString());
          const endTime = p[5]._hex ? HexToInteger(p[5]._hex) : Number(p[5].toString());
          
          return {
            id: p[0]._hex ? HexToInteger(p[0]._hex) : Number(p[0].toString()),
            title: p[1],
            description: p[2],
            votesFor,
            votesAgainst,
            endTime,
            executed: p[6],
            passed,
            // Ensure percentage is a number
            percentage: typeof percentage === 'object' ? Number(percentage.toString()) : Number(percentage)
          };
        })
      );
      
      setProposals(formattedProposals);
      setHasMore(startIndex > 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0,0);
    const getVotingAddress = async () => {
      const data = await storeRegistery.call('getStoreVotingSystem', [StoreURL]);
      setVotingAddress(data.votingSystemAddress);
    };
    if (storeRegistery) {
      getVotingAddress();
    }
    if (votingContract) {
      fetchProposals();
    }
  }, [votingContract, page,storeRegistery]);

  const formatTime = (timestamp) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const handleCreateProposal = async () => {
    if (!newProposal.title || !newProposal.description) return;
    
    const tx = await prepareContractCall({
      contract: votingContract1,
      method: "function createProposal(string title, string description) returns (uint256)",
      params: [newProposal.title, newProposal.description],
    });
    return tx;
  };

  return (
    <div className="rounded-[15px] min-h-screen linear-gradient text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{StoreURL} Voting System</h1>
        
        {/* Create Proposal Form */}
        <div className="linear-gradient1 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create New Proposal</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Proposal Title"
              className="w-full p-2 bg-gray-700 rounded"
              value={newProposal.title}
              onChange={(e) => setNewProposal(prev => ({...prev, title: e.target.value}))}
            />
            <textarea
              placeholder="Proposal Description"
              className="w-full p-2 bg-gray-700 rounded h-24"
              value={newProposal.description}
              onChange={(e) => setNewProposal(prev => ({...prev, description: e.target.value}))}
            />
            <TransactionButton
    className={"!bg-[#FFDD00] !mr-[10px] !hover:bg-orange-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out"}
    transaction={async () => { 
      const tx = prepareContractCall({
        contract: votingContract1,
      method: "function createProposal(string title, string description) returns (uint256)",
      params: [newProposal.title, newProposal.description],
      });
      return tx;    
    }}
    onTransactionSent={(result) => {
      console.log("Transaction submitted", result.transactionHash);
    }}
    onTransactionConfirmed={(receipt) => {
      setNewProposal({ title: '', description: '' });
                fetchProposals();
      console.log("Transaction confirmed", receipt.transactionHash);
    }}
    onError={(error) => {
      console.error("Transaction error", error);
    }}
    >
    Create proposal
    </TransactionButton>
          </div>
        </div>

        {/* Proposals List */}
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="space-y-4">
            {[...proposals].reverse().map((proposal) => (
              <div key={proposal.id} className={`bg-gray-600 overflow-auto touch-auto rounded-lg p-6 ${proposal.percentage >= 50 ? ('!bg-green-500'):('')}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{proposal.title}</h3>
                    <span className={`${proposal.percentage >= 50 ? ('text-white mt-2'):('text-gray-400 mt-2')}`}>{renderDescriptionWithBreaks(proposal.description)}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded ${
                      proposal.endTime > Date.now() / 1000 
                        ? 'bg-green-600'
                        : 'bg-red-600'
                    }`}>
                      {proposal.endTime > Date.now() / 1000 ? 'Active' : 'Ended'}
                    </span>
                  </div>
                </div>
                
                <div className={`grid grid-cols-2 gap-4 mb-4`}>
                  <div>
                    <p className={`${proposal.percentage >= 50 ? ('text-white'):('text-gray-400')}`}>For: {proposal.votesFor / 1e18} Shares</p>
                    <p className={`${proposal.percentage >= 50 ? ('text-white'):('text-gray-400')}`}>Against: {proposal.votesAgainst / 1e18} Shares</p>
                  </div>
                  <div className="text-right">
                    <p className={`${proposal.percentage >= 50 ? ('text-white'):('text-gray-400')}`}>End Time: {formatTime(proposal.endTime)}</p>
                    <p className={`${proposal.percentage >= 50 ? ('text-white'):('text-gray-400')}`}>Approval: {proposal.percentage}%</p>
                  </div>
                </div>

                {proposal.endTime > Date.now() / 1000 && (
                  <div className="flex gap-4">
                    <TransactionButton
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex-1"
                      transaction={async () => {
                        const tx = await prepareContractCall({
                          contract: votingContract1,
                          method: "function castVote(uint256 proposalId, bool support) external",
                          params: [proposal.id, false],
                        });
                        return tx;
                      }}
                      onTransactionConfirmed={fetchProposals}
                    >
                      Vote Against
                    </TransactionButton>
                    <TransactionButton
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex-1"
                      transaction={async () => {
                        const tx = await prepareContractCall({
                          contract: votingContract1,
                          method: "function castVote(uint256 proposalId, bool support) external",
                          params: [proposal.id, true],
                        });
                        return tx;
                      }}
                      onTransactionConfirmed={fetchProposals}
                    >
                      Vote For
                    </TransactionButton>
                    
                  </div>
                )}
              </div>
            ))}
            
            {hasMore && (
              <button
                className="w-full linear-gradient1 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={() => setPage(prev => prev + 1)}
              >
                Show More
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ESHVoting;