import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import {useSigner, ThirdwebProvider ,en,ThirdwebSDKProvider,
  // import the wallets you want
  metamaskWallet,
  coinbaseWallet,
  ConnectWallet,
  phantomWallet,
  localWallet,
  embeddedWallet,
  safeWallet,
  rainbowWallet,
  zerionWallet,
  bloctoWallet,
  smartWallet,
  frameWallet,

} from '@thirdweb-dev/react';
import { ThirdwebProvider as ThirdwebProviderV5 } from "thirdweb/react";
import { Base } from "@thirdweb-dev/chains";
import {ethers} from 'ethers';

import { StateContextProvider } from './context';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

const english = en({
  connectWallet: {
    confirmInWallet: "Confirm in your wallet",
  },
  wallets: {
    coinbaseWallet: {
      connectionScreen: {
        inProgress: "Awaiting Confirmation",
        instruction: "Accept connection request in your MetaMask wallet",
        confirmInWallet: "Confirm in your wallet",
      },
      getStartedLink: "https://ultrashop.tech",
      getStartedScreen: {
        instruction: "Accept connection request in your MetaMask wallet",
    },
    scanScreen: {
        instruction: "Accept connection request in your MetaMask wallet",
    },
    },
  },
});

root.render(
    <ThirdwebSDKProvider
    clientId={import.meta.env.VITE_THIRDWEB_CLIENT}
    authConfig={{
      // Set this to your domain to prevent phishing attacks
      domain: "https://www.ultrashop.tech",
      // The URL of your Auth API
    }}
    >
      <ThirdwebProvider
      activeChain={8453}
      locale={english}
      clientId={import.meta.env.VITE_THIRDWEB_CLIENT}
      supportedWallets={[
          embeddedWallet(),
          coinbaseWallet(),
          localWallet(),
          metamaskWallet({recommended:true}),
          safeWallet(),
          rainbowWallet(),
          frameWallet(),
      ]}
      >
        <ThirdwebProviderV5
          clientId={import.meta.env.VITE_THIRDWEB_CLIENT}
        >
      <Router>
        <StateContextProvider>
          <App />
        </StateContextProvider>
      </Router>
      </ThirdwebProviderV5>
      </ThirdwebProvider>
    </ThirdwebSDKProvider>
)