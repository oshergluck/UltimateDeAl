import{fi as w,fk as y,fM as h,hd as p}from"./index.a890a1de.js";async function f({account:t,serializableTransaction:e,transaction:n,gasless:r}){const a=w({address:r.relayerForwarderAddress,chain:n.chain,client:n.client}),s=await y({contract:a,method:"function getNonce(address) view returns (uint256)",params:[t.address]}),[o,i]=await(async()=>{if(!e.to)throw new Error("engine transactions must have a 'to' address");if(!e.gas)throw new Error("engine transactions must have a 'gas' value");if(!e.data)throw new Error("engine transactions must have a 'data' value");if(r.experimentalChainlessSupport){const d={from:t.address,to:e.to,value:0n,gas:e.gas,nonce:s,data:e.data,chainid:BigInt(n.chain.id)};return[await t.signTypedData({domain:{name:"GSNv2 Forwarder",version:"0.0.1",verifyingContract:a.address},message:d,primaryType:"ForwardRequest",types:{ForwardRequest:l}}),d]}const c={from:t.address,to:e.to,value:0n,gas:e.gas,nonce:s,data:e.data};return[await t.signTypedData({domain:{name:r.domainName??"GSNv2 Forwarder",version:r.domainVersion??"0.0.1",chainId:n.chain.id,verifyingContract:a.address},message:c,primaryType:"ForwardRequest",types:{ForwardRequest:g}}),c]})();return{message:i,signature:o,messageType:"forward"}}const g=[{name:"from",type:"address"},{name:"to",type:"address"},{name:"value",type:"uint256"},{name:"gas",type:"uint256"},{name:"nonce",type:"uint256"},{name:"data",type:"bytes"}],l=[{name:"from",type:"address"},{name:"to",type:"address"},{name:"value",type:"uint256"},{name:"gas",type:"uint256"},{name:"nonce",type:"uint256"},{name:"data",type:"bytes"},{name:"chainid",type:"uint256"}];async function E(t){const{message:e,messageType:n,signature:r}=await f(t),a=await fetch(t.gasless.relayerUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:h({request:e,type:n,signature:r,forwarderAddress:t.gasless.relayerForwarderAddress})});if(!a.ok)throw new Error(`Failed to send transaction: ${await a.text()}`);const s=await a.json();if(!s.result)throw new Error(`Relay transaction failed: ${s.message}`);const o=s.result.queueId,i=6e4,u=1e3,c=Date.now()+i;for(;Date.now()<c;){const d=await v({options:t,queueId:o});if(d)return{transactionHash:d.transactionHash,chain:t.transaction.chain,client:t.transaction.client};await new Promise(m=>setTimeout(m,u))}throw new Error(`Failed to find relayed transaction after ${i}ms`)}async function v(t){const{options:e,queueId:n}=t,r=e.gasless.relayerUrl.split("/relayer/")[0],a=await fetch(`${r}/transaction/status/${n}`,{method:"GET"}),s=await a.json();if(!a.ok)return null;const o=s.result;if(!o)return null;switch(o.status){case"errored":throw new Error(`Transaction errored with reason: ${o.errorMessage}`);case"cancelled":throw new Error("Transaction execution cancelled.");case"mined":return await p({client:e.transaction.client,chain:e.transaction.chain,transactionHash:o.transactionHash});default:return null}}export{l as ChainAwareForwardRequest,g as ForwardRequest,f as prepareEngineTransaction,E as relayEngineTransaction};
