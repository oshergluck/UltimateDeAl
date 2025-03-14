import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useContract, useContractRead, useContractWrite } from '@thirdweb-dev/react';
import { Base } from "@thirdweb-dev/chains";
import { createThirdwebClient, prepareContractCall, getContract } from "thirdweb";
import { useSendTransaction, TransactionButton } from 'thirdweb/react';
import { CustomButton, Loader } from '../components';

const LuckMachine = () => {
    const navigate = useNavigate();
    const {refreshPage} = useStateContext();
    const client = createThirdwebClient({clientId: import.meta.env.VITE_THIRDWEB_CLIENT});
    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
    const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`;

    const [isLoading, setIsLoading] = useState(false);
    const [ticketsOwned, setTicketsOwned] = useState(0);
    const [participantsCount, setParticipantsCount] = useState(0);
    const [registrationCost, setRegistrationCost] = useState(0);
    const [totalDeposited, setTotalDeposited] = useState(0);
    const [ticketsToBuy, setTicketsToBuy] = useState();

    const { address } = useStateContext();

    const { contract: luckMachineContract } = useContract(import.meta.env.VITE_LUCKDEAL);
    const luckMachineContract2 = getContract({
        client: client,
        chain: {
            id: 8453,
            rpc: POLYRPC,
        },
        address: import.meta.env.VITE_LUCKDEAL,
    });

    const storeContract = getContract({
        client: client,
        chain: {
            id: 8453,
            rpc: POLYRPC,
        },
        address: 0x84C24D63b8Ac5520fED9ee5729368204932b76B7,
    });

    useEffect(() => {
        async function fetchData() {
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
        }

        fetchData();
    }, [luckMachineContract, address]);

    const handleTicketChange = (e) => {
        setTicketsToBuy(Math.max(1, parseInt(e.target.value) || 1));
    };

    return (
        <div className="container linear-gradient1 rounded-[15px] mx-auto p-8 mt-[35px]">
            {isLoading && <Loader />}
            <h1 className="text-center font-bold text-[#ff9900] drop-shadow-md pb-[25px] sm:text-[50px] text-[30px]">Luck Machine</h1>
            {address ? (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-lg shadow-lg text-black w-full md:w-1/4">
                            <h2 className="text-2xl font-bold mb-2">Ticket Cost</h2>
                            <p className="text-3xl font-semibold">{registrationCost} DeAl</p>
                        </div>
                        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-6 rounded-lg shadow-lg text-white w-full md:w-1/4">
                            <h2 className="text-2xl font-bold mb-2">Total Deposited</h2>
                            <p className="text-3xl font-semibold">{totalDeposited} DeAl</p>
                        </div>
                        <div className="bg-gradient-to-r from-green-400 to-teal-500 p-6 rounded-lg shadow-lg text-white w-full md:w-1/4">
                            <h2 className="text-2xl font-bold mb-2">Participants</h2>
                            <p className="text-3xl font-semibold">{participantsCount}</p>
                        </div>
                        <div className={`p-6 rounded-lg shadow-lg text-white w-full md:w-1/4 ${ticketsOwned>1 ?('bg-gradient-to-r from-gray-400 to-gray-600'):('bg-gradient-to-r from-purple-400 to-pink-500')}`}>
                            <h2 className="text-2xl font-bold mb-2">Your Tickets</h2>
                            <p className="text-3xl font-semibold">{ticketsOwned}</p>
                        </div>
                    </div>

                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#00FFFF] mb-4">Try Your Luck!</h2>
                        <p className="text-xl text-white mb-8">Buy tickets for a chance to win big!</p>
                        <div className="mb-4">
                            <label htmlFor="ticketsToBuy" className="text-white mr-2">Number of tickets:</label>
                            <input
                                type="number"
                                id="ticketsToBuy"
                                value={ticketsToBuy}
                                onChange={handleTicketChange}
                                className="bg-gray-700 text-white px-2 py-1 rounded"
                            />
                        </div>
                        <TransactionButton
                            disabled={ticketsToBuy<1}
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
                        <br />
                        <TransactionButton
                            transaction={() => {
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
                              refreshPage();
                                console.log("Transaction confirmed", receipt.transactionHash);
                            }}
                            onError={(error) => {
                                console.error("Transaction error", error);
                            }}
                        >
                            Buy Tickets
                        </TransactionButton>
                    </div>

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
                <>
                    <h2 className='text-[18px] text-[#00FFFF] font-bold'>First Login...</h2>
                </>
            )}
        </div>
    );
}

export default LuckMachine;