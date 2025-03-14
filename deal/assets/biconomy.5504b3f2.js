import{fi as w,fk as y,hc as p,fv as u,fW as m,fM as i,fI as l}from"./index.a890a1de.js";const c=0n;async function g({account:a,serializableTransaction:n,transaction:s,gasless:e}){const o=w({address:e.relayerForwarderAddress,chain:s.chain,client:s.client}),r=await y({contract:o,method:"function getNonce(address,uint256) view returns (uint256)",params:[a.address,c]}),d=Math.floor(Date.now()/1e3)+(e.deadlineSeconds??3600),t={from:a.address,to:n.to,token:p,txGas:n.gas,tokenGasPrice:0n,batchId:c,batchNonce:r,deadline:d,data:n.data};if(!t.to)throw new Error("Cannot send a transaction without a `to` address");if(!t.txGas)throw new Error("Cannot send a transaction without a `gas` value");if(!t.data)throw new Error("Cannot send a transaction without a `data` value");const h=u([{type:"address"},{type:"address"},{type:"address"},{type:"uint256"},{type:"uint256"},{type:"uint256"},{type:"uint256"},{type:"bytes32"}],[t.from,t.to,t.token,t.txGas,t.tokenGasPrice,t.batchId,t.batchNonce,m(t.data)]),f=await a.signMessage({message:h});return[t,f]}async function k(a){const[n,s]=await g(a),e=await fetch("https://api.biconomy.io/api/v2/meta-tx/native",{method:"POST",body:i({apiId:a.gasless.apiId,params:[n,s],from:n.from,to:n.to,gasLimit:n.txGas}),headers:{"x-api-key":a.gasless.apiKey,"Content-Type":"application/json;charset=utf-8"}});if(!e.ok)throw e.body?.cancel(),new Error(`Failed to send transaction: ${await e.text()}`);const o=await e.json(),r=o.txHash;if(l(r))return{transactionHash:r,chain:a.transaction.chain,client:a.transaction.client};throw new Error(`Failed to send transaction: ${i(o)}`)}export{g as prepareBiconomyTransaction,k as relayBiconomyTransaction};
