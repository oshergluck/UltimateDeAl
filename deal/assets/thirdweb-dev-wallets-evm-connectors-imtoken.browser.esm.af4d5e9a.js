import{InjectedConnector as r}from"./thirdweb-dev-wallets-evm-connectors-injected.browser.esm.0de1dfa5.js";import{ce as i}from"./index.a890a1de.js";class u extends r{constructor(o){const t={...{name:"imToken",getProvider(){function e(n){if(!!n?.isImToken)return n}if(i(globalThis.window))return globalThis.window.ethereum?.providers?globalThis.window.ethereum.providers.find(e):e(globalThis.window.ethereum)}},...o.options};super({chains:o.chains,options:t,connectorStorage:o.connectorStorage})}}export{u as ImTokenConnector};
