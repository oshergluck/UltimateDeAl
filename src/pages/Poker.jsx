import { useContract, useContractRead, useContractWrite, Web3Button } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import styled from 'styled-components';

const tokenAddress = "0x231aaC71b05e8D5C12AE7a03148a3c2BBBa66530";

const Container = styled.div`
  background: rgba(25, 25, 35, 0.95);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 2rem auto;
  color: white;
`;

const GameCard = styled.div`
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-3px);
  }
`;

export default function PokerLobby() {
  const { contract: pokerContract } = useContract("0x3CaD9b38D7E585A70A9Fa1d9F857068BDF6a5e0D");
  const { contract: tokenContract } = useContract(tokenAddress);
  
  const { data: games = [] } = useContractRead(pokerContract, "getAllActiveGames");
  const { data: balance } = useContractRead(tokenContract, "balanceOf", [address]);

  const { mutateAsync: createGame } = useContractWrite(pokerContract, "createGame");
  const { mutateAsync: joinGame } = useContractWrite(pokerContract, "joinGame");

  return (
    <Container>
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

      <h2>Active Tables</h2>
      {games.map((game) => (
        <GameCard key={game.id}>
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
        </GameCard>
      ))}
    </Container>
  );
}