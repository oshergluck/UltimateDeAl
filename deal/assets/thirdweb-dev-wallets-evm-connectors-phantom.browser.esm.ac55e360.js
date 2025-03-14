import{_ as h,c3 as d,cb as u,c6 as a,g as m,cc as p,cg as l}from"./index.a890a1de.js";import{InjectedConnector as w}from"./thirdweb-dev-wallets-evm-connectors-injected.browser.esm.0de1dfa5.js";class I extends w{constructor(t){const n={...{name:"Phantom",shimDisconnect:!0,shimChainChangedDisconnect:!0,getProvider:l},...t.options};super({chains:t.chains,options:n,connectorStorage:t.connectorStorage}),h(this,"id",d.phantom),this._UNSTABLE_shimOnConnectSelectAccount=n.UNSTABLE_shimOnConnectSelectAccount}async connect(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};try{const e=await this.getProvider();if(!e)throw new u;this.setupListeners(),this.emit("message",{type:"connecting"});let n=null;if(this._UNSTABLE_shimOnConnectSelectAccount&&this.options?.shimDisconnect&&!Boolean(this.connectorStorage.getItem(this.shimDisconnectKey))&&(n=await this.getAccount().catch(()=>null),!!n))try{await e.request({method:"wallet_requestPermissions",params:[{eth_accounts:{}}]})}catch(r){if(this.isUserRejectedRequestError(r))throw new a(r)}if(!n){const s=await e.request({method:"eth_requestAccounts"});n=m(s[0])}let o=await this.getChainId(),i=this.isChainUnsupported(o);if(t.chainId&&o!==t.chainId)try{await this.switchChain(t.chainId),o=t.chainId,i=this.isChainUnsupported(t.chainId)}catch(s){console.error(`Could not switch to chain id : ${t.chainId}`,s)}this.options?.shimDisconnect&&await this.connectorStorage.setItem(this.shimDisconnectKey,"true");const c={chain:{id:o,unsupported:i},provider:e,account:n};return this.emit("connect",c),c}catch(e){throw this.isUserRejectedRequestError(e)?new a(e):e.code===-32002?new p(e):e}}async switchAccount(){await(await this.getProvider()).request({method:"wallet_requestPermissions",params:[{eth_accounts:{}}]})}}export{I as PhantomConnector};
