import{e3 as pe,fp as Y,f7 as fe,fq as le,fe as D,fr as me,fs as H,ft as Z,fu as b,f8 as ye,fv as I,fw as he,fx as J,fy as K,fz as Q,fA as ge,fB as Ae,fC as G,fa as we,e0 as ve,e1 as be,fD as L,f9 as X,fE as xe,d_ as Te,fF as C,fG as v,ee as Pe,dW as ee,fj as _e,fH as h,fI as De,fJ as _,fK as Ge,fL as te,cG as ne,fM as Ee,fN as A,fO as Oe,dZ as ae,fk as Ie,fP as U,fQ as Le,fR as Ce,fS as Ue,fT as Fe,fU as Me,fV as Se,fW as T,fX as B,fY as Re,y as g,d$ as se,dV as He,fi as V}from"./index.a890a1de.js";import{t as Be}from"./toRlp.583474b7.js";class Ve extends pe{constructor(n){super(`Filter type "${n}" is not supported.`),Object.defineProperty(this,"name",{enumerable:!0,configurable:!0,writable:!0,value:"FilterTypeNotSupportedError"})}}const F=Y;function $e(t){const{abi:n,args:e=[],name:a}=t,s=fe(a,{strict:!1}),r=n.filter(o=>s?o.type==="function"?le(o)===a:o.type==="event"?F(o)===a:!1:"name"in o&&o.name===a);if(r.length===0)return;if(r.length===1)return r[0];let i;for(const o of r){if(!("inputs"in o))continue;if(!e||e.length===0){if(!o.inputs||o.inputs.length===0)return o;continue}if(!o.inputs||o.inputs.length===0||o.inputs.length!==e.length)continue;if(e.every((d,p)=>{const u="inputs"in o&&o.inputs[p];return u?E(d,u):!1})){if(i&&"inputs"in i&&i.inputs){const d=re(o.inputs,i.inputs,e);if(d)throw new me({abiItem:o,type:d[0]},{abiItem:i,type:d[1]})}i=o}}return i||r[0]}function E(t,n){const e=typeof t,a=n.type;switch(a){case"address":return D(t,{strict:!1});case"bool":return e==="boolean";case"function":return e==="string";case"string":return e==="string";default:return a==="tuple"&&"components"in n?Object.values(n.components).every((s,r)=>E(Object.values(t)[r],s)):/^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(a)?e==="number"||e==="bigint":/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(a)?e==="string"||t instanceof Uint8Array:/[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(a)?Array.isArray(t)&&t.every(s=>E(s,{...n,type:a.replace(/(\[[0-9]{0,}\])$/,"")})):!1}}function re(t,n,e){for(const a in t){const s=t[a],r=n[a];if(s.type==="tuple"&&r.type==="tuple"&&"components"in s&&"components"in r)return re(s.components,r.components,e[a]);const i=[s.type,r.type];if((()=>i.includes("address")&&i.includes("bytes20")?!0:i.includes("address")&&i.includes("string")?D(e[a],{strict:!1}):i.includes("address")&&i.includes("bytes")?D(e[a],{strict:!1}):!1)())return i}}const $="/docs/contract/encodeEventTopics";function Ne(t){const{abi:n,eventName:e,args:a}=t;let s=n[0];if(e){const c=$e({abi:n,name:e});if(!c)throw new H(e,{docsPath:$});s=c}if(s.type!=="event")throw new H(void 0,{docsPath:$});const r=Z(s),i=F(r);let o=[];if(a&&"inputs"in s){const c=s.inputs?.filter(p=>"indexed"in p&&p.indexed),d=Array.isArray(a)?a:Object.values(a).length>0?c?.map(p=>a[p.name])??[]:[];d.length>0&&(o=c?.map((p,u)=>Array.isArray(d[u])?d[u].map((f,y)=>N({param:p,value:d[u][y]})):d[u]?N({param:p,value:d[u]}):null)??[])}return[i,...o]}function N({param:t,value:n}){if(t.type==="string"||t.type==="bytes")return b(ye(n));if(t.type==="tuple"||t.type.match(/^(.*)\[(\d+)?\]$/))throw new Ve(t.type);return I([t],[n])}const k="/docs/contract/decodeEventLog";function ke(t){const{abi:n,data:e,strict:a,topics:s}=t,r=a??!0,[i,...o]=s;if(!i)throw new he({docsPath:k});const c=n.find(l=>l.type==="event"&&i===F(Z(l)));if(!(c&&"name"in c)||c.type!=="event")throw new J(i,{docsPath:k});const{name:d,inputs:p}=c,u=p?.some(l=>!("name"in l&&l.name));let f=u?[]:{};const y=p.filter(l=>"indexed"in l&&l.indexed);for(let l=0;l<y.length;l++){const w=y[l],R=o[l];if(!R)throw new K({abiItem:c,param:w});f[u?l:w.name||l]=je({param:w,value:R})}const m=p.filter(l=>!("indexed"in l&&l.indexed));if(m.length>0){if(e&&e!=="0x")try{const l=Q(m,e);if(l)if(u)f=[...f,...l];else for(let w=0;w<m.length;w++)f[m[w].name]=l[w]}catch(l){if(r)throw l instanceof ge||l instanceof Ae?new G({abiItem:c,data:e,params:m,size:we(e)}):l}else if(r)throw new G({abiItem:c,data:"0x",params:m,size:0})}return{eventName:d,args:Object.values(f).length>0?f:void 0}}function je({param:t,value:n}){return t.type==="string"||t.type==="bytes"||t.type==="tuple"||t.type.match(/^(.*)\[(\d+)?\]$/)?n:(Q([t],n)||[])[0]}function ze({abi:t,eventName:n,logs:e,strict:a=!0}){return e.map(s=>{try{const r=ke({...s,abi:t,strict:a});return n&&!n.includes(r.eventName)?null:{...r,...s}}catch(r){let i,o;if(r instanceof J)return null;if(r instanceof G||r instanceof K){if(a)return null;i=r.abiItem.name,o=r.abiItem.inputs?.some(c=>!("name"in c&&c.name))}return{...s,args:o?[]:{},eventName:i}}}).filter(Boolean)}function We(t){const{domain:n={},message:e,primaryType:a}=t,s={EIP712Domain:ve({domain:n}),...t.types};be({domain:n,message:e,primaryType:a,types:s});const r=["0x1901"];return n&&r.push(qe({domain:n,types:s})),a!=="EIP712Domain"&&r.push(ie({data:e,primaryType:a,types:s})),b(L(r))}function qe({domain:t,types:n}){return ie({data:t,primaryType:"EIP712Domain",types:n})}function ie({data:t,primaryType:n,types:e}){const a=oe({data:t,primaryType:n,types:e});return b(a)}function oe({data:t,primaryType:n,types:e}){const a=[{type:"bytes32"}],s=[Ye({primaryType:n,types:e})];for(const r of e[n]){const[i,o]=ue({types:e,name:r.name,type:r.type,value:t[r.name]});a.push(i),s.push(o)}return I(a,s)}function Ye({primaryType:t,types:n}){const e=X(Ze({primaryType:t,types:n}));return b(e)}function Ze({primaryType:t,types:n}){let e="";const a=ce({primaryType:t,types:n});a.delete(t);const s=[t,...Array.from(a).sort()];for(const r of s)e+=`${r}(${n[r].map(({name:i,type:o})=>`${o} ${i}`).join(",")})`;return e}function ce({primaryType:t,types:n},e=new Set){const s=t.match(/^\w*/u)?.[0];if(e.has(s)||n[s]===void 0)return e;e.add(s);for(const r of n[s])ce({primaryType:r.type,types:n},e);return e}function ue({types:t,name:n,type:e,value:a}){if(t[e]!==void 0)return[{type:"bytes32"},b(oe({data:a,primaryType:e,types:t}))];if(e==="bytes")return a=`0x${(a.length%2?"0":"")+a.slice(2)}`,[{type:"bytes32"},b(a)];if(e==="string")return[{type:"bytes32"},b(X(a))];if(e.lastIndexOf("]")===e.length-1){const s=e.slice(0,e.lastIndexOf("[")),r=a.map(i=>ue({name:n,type:s,types:t,value:i}));return[{type:"bytes32"},b(I(r.map(([i])=>i),r.map(([,i])=>i)))]}return[{type:e},a]}function Je(t){return!!(t&&typeof t=="object"&&"type"in t&&t.type==="event")}function Ke(t){const{signature:n}=t;let e;return Je(n)?e=n:e=xe(n),{abiEvent:e,hash:Y(e),topics:Ne({abi:[e],args:t.filters})}}function Qe(t){const{logs:n,events:e,strict:a}=t;return ze({logs:n,abi:e.map(s=>s.abiEvent),strict:a})}function Xe(t){return`0x${t.reduce((n,e)=>n+e.replace("0x",""),"")}`}function P(t){if(["string","number"].includes(typeof t)&&!Number.isInteger(Number(t)))throw new Error(`Expected value to be an integer to convert to a bigint, got ${t} of type ${typeof t}`);return t instanceof Uint8Array?BigInt(Te(t)):BigInt(t)}const de=50000n,et=t=>{const n=tt(t);return{domain:{name:"zkSync",version:"2",chainId:t.chainId},types:{Transaction:[{name:"txType",type:"uint256"},{name:"from",type:"uint256"},{name:"to",type:"uint256"},{name:"gasLimit",type:"uint256"},{name:"gasPerPubdataByteLimit",type:"uint256"},{name:"maxFeePerGas",type:"uint256"},{name:"maxPriorityFeePerGas",type:"uint256"},{name:"paymaster",type:"uint256"},{name:"nonce",type:"uint256"},{name:"value",type:"uint256"},{name:"data",type:"bytes"},{name:"factoryDeps",type:"bytes32[]"},{name:"paymasterInput",type:"bytes"}]},primaryType:"Transaction",message:n}};function tt(t){const{gas:n,nonce:e,to:a,from:s,value:r,maxFeePerGas:i,maxPriorityFeePerGas:o,paymaster:c,paymasterInput:d,gasPerPubdata:p,data:u}=t;return{txType:113n,from:BigInt(s),to:a?BigInt(a):0n,gasLimit:n??0n,gasPerPubdataByteLimit:p??de,maxFeePerGas:i??0n,maxPriorityFeePerGas:o??0n,paymaster:c?BigInt(c):0n,nonce:e?BigInt(e):0n,value:r??0n,data:u||"0x0",factoryDeps:[],paymasterInput:d||"0x"}}async function nt(t){const{account:n,eip712Transaction:e,chainId:a}=t,s=et(e),r=await n.signTypedData({...s});return st({...e,chainId:a,customSignature:r})}async function at(t){const{account:n,transaction:e}=t;let[a,s,r,i,o,c,d]=await Promise.all([C(e),v(e.to),v(e.value),v(e.gas),v(e.maxFeePerGas),v(e.maxPriorityFeePerGas),v(e.eip712).then(u=>u?.gasPerPubdata)]);if(!i||!o||!c){const f=await Pe(e)({method:"zks_estimateFee",params:[{from:n.address,to:s,data:a,value:r?ee(r):void 0}]});i=P(f.gas_limit),o=P(f.max_fee_per_gas)*2n,c=P(f.max_priority_fee_per_gas)||1n,d=P(f.gas_per_pubdata_limit)}return{...await _e({transaction:{...e,gas:i,maxFeePerGas:o,maxPriorityFeePerGas:c},from:n.address}),...e.eip712,gasPerPubdata:d,from:n.address}}function st(t){const{chainId:n,gas:e,nonce:a,to:s,from:r,value:i,maxFeePerGas:o,maxPriorityFeePerGas:c,customSignature:d,factoryDeps:p,paymaster:u,paymasterInput:f,gasPerPubdata:y,data:m}=t,l=[a?h(a):"0x",c?h(c):"0x",o?h(o):"0x",e?h(e):"0x",s??"0x",i?h(i):"0x",m??"0x0",h(n),h(""),h(""),h(n),r??"0x",y?h(y):h(de),p??[],d??"0x",u&&f?[u,f]:[]];return Xe(["0x71",Be(l)])}function rt(t={}){return Ke({signature:"event UserOperationRevertReason(bytes32 indexed userOpHash, address indexed sender, uint256 nonce, bytes revertReason)",filters:t})}const it=()=>{const t=BigInt(Math.floor(Math.random()*4294967296)),n=BigInt(Math.floor(Math.random()*4294967296)),e=BigInt(Math.floor(Math.random()*4294967296)),a=BigInt(Math.floor(Math.random()*4294967296)),s=BigInt(Math.floor(Math.random()*4294967296)),r=BigInt(Math.floor(Math.random()*4294967296));return t<<BigInt(160)|n<<BigInt(128)|e<<BigInt(96)|a<<BigInt(64)|s<<BigInt(32)|r},ot=()=>BigInt(L([ee(it()),"0x0000000000000000"]));function M(t){return Object.fromEntries(Object.entries(t).map(([n,e])=>[n,De(e)?e:h(e)]))}function ct(t){return t.id===324||t.id===300||t.id===302}async function ut(t){return x({...t,operation:"eth_sendUserOperation",params:[M(t.userOp),t.options.overrides?.entrypointAddress??_]})}async function j(t){const n=await x({...t,operation:"eth_estimateUserOperationGas",params:[M(t.userOp),t.options.overrides?.entrypointAddress??_]});return{preVerificationGas:A(n.preVerificationGas),verificationGas:A(n.verificationGas),verificationGasLimit:A(n.verificationGasLimit),callGasLimit:A(n.callGasLimit)+Oe}}async function dt(t){const n=await x({...t,operation:"thirdweb_getUserOperationGasPrice",params:[]});return{maxPriorityFeePerGas:A(n.maxPriorityFeePerGas),maxFeePerGas:A(n.maxFeePerGas)}}async function pt(t){const n=await x({...t,operation:"eth_getUserOperationReceipt",params:[t.userOpHash]});if(!!n){if(n.success===!1){const a=Qe({events:[rt()],logs:n.logs})[0]?.args?.revertReason;if(!a)throw new Error(`UserOp failed at txHash: ${n.transactionHash}`);const s=Ge({data:a});throw new Error(`UserOp failed with reason: '${s.args.join(",")}' at txHash: ${n.transactionHash}`)}return n.receipt}}async function ft(t){const n=await x({options:t.options,operation:"zk_paymasterData",params:[t.transaction]});return{paymaster:n.paymaster,paymasterInput:n.paymasterInput}}async function lt(t){return{transactionHash:(await x({options:t.options,operation:"zk_broadcastTransaction",params:[{...t.transaction,signedTransaction:t.signedTransaction}]})).transactionHash}}async function x(t){const{options:n,operation:e,params:a}=t,s=n.overrides?.bundlerUrl??te(n.chain),i=await ne(n.client)(s,{method:"POST",headers:{"Content-Type":"application/json"},body:Ee({jsonrpc:"2.0",id:1,method:e,params:a})}),o=await i.json();if(!i.ok||o.error){let c=o.error||i.statusText;typeof c=="object"&&(c=JSON.stringify(c));const d=o.code||"UNKNOWN";throw new Error(`${e} error: ${c}
Status: ${i.status}
Code: ${d}`)}return o.result}async function mt(t,n){if(n.overrides?.predictAddress)return n.overrides.predictAddress(t);if(n.overrides?.accountAddress)return n.overrides.accountAddress;const e=n.personalAccountAddress;if(!e)throw new Error("Account address is required to predict the smart wallet address.");const a=ae(n.overrides?.accountSalt??"");return Ie({contract:t,method:"function getAddress(address, bytes) returns (address)",params:[e,a]})}function yt(t){const{factoryContract:n,options:e}=t;return e.overrides?.createAccount?e.overrides.createAccount(n):U({contract:n,method:"function createAccount(address, bytes) returns (address)",params:[e.personalAccount.address,ae(e.overrides?.accountSalt??"")]})}function ht(t){const{accountContract:n,options:e,transaction:a}=t;return e.overrides?.execute?e.overrides.execute(n,a):U({contract:n,method:"function execute(address, uint256, bytes)",params:[a.to||"",a.value||0n,a.data||"0x"]})}function gt(t){const{accountContract:n,options:e,transactions:a}=t;return e.overrides?.executeBatch?e.overrides.executeBatch(n,a):U({contract:n,method:"function executeBatch(address[], uint256[], bytes[])",params:[a.map(s=>s.to||""),a.map(s=>s.value||0n),a.map(s=>s.data||"0x")]})}async function z(t){const{userOp:n,options:e}=t;if(e.overrides?.paymaster)return e.overrides?.paymaster(n);const a={"Content-Type":"application/json"},s=e.client,r=Le(e.chain),i=e.overrides?.entrypointAddress??_,c=await ne(s)(r,{method:"POST",headers:a,body:JSON.stringify({jsonrpc:"2.0",id:1,method:"pm_sponsorUserOperation",params:[M(n),i]})}),d=await c.json();if(!c.ok){const u=d.error||c.statusText,f=d.code||"UNKNOWN";throw new Error(`Paymaster error: ${u}
Status: ${c.status}
Code: ${f}`)}if(d.result)return typeof d.result=="string"?{paymasterAndData:d.result}:{paymasterAndData:d.result.paymasterAndData,verificationGasLimit:d.result.verificationGasLimit?A(d.result.verificationGasLimit):void 0,preVerificationGas:d.result.preVerificationGas?A(d.result.preVerificationGas):void 0,callGasLimit:d.result.callGasLimit?A(d.result.callGasLimit):void 0};const p=d.error?.message||d.error||c.statusText||"unknown error";throw new Error(`Paymaster error from ${r}: ${p}`)}async function At(t){const{executeTx:n,options:e}=t,s=await Ce(e.accountContract)?"0x":await vt(e),r=await C(n);let{maxFeePerGas:i,maxPriorityFeePerGas:o}=n;const c=e.overrides?.bundlerUrl??te(e.chain);if(Ue(c)){const u=await dt({options:e});i=u.maxFeePerGas,o=u.maxPriorityFeePerGas}else{const[u,f]=await Promise.all([v(i),v(o)]);if(u&&f)i=u,o=f;else{const y=await Fe(e.client,e.chain);o=f??y.maxPriorityFeePerGas??0n,i=u??y.maxFeePerGas??0n}}const d=ot(),p={sender:e.accountContract.address,nonce:d,initCode:s,callData:r,maxFeePerGas:i,maxPriorityFeePerGas:o,callGasLimit:0n,verificationGasLimit:0n,preVerificationGas:0n,paymasterAndData:"0x",signature:Me};if(e.sponsorGas){const u=await z({userOp:p,options:e}),f=u.paymasterAndData;if(f&&f!=="0x"&&(p.paymasterAndData=f),u.callGasLimit&&u.verificationGasLimit&&u.preVerificationGas)p.callGasLimit=u.callGasLimit,p.verificationGasLimit=u.verificationGasLimit,p.preVerificationGas=u.preVerificationGas;else{const y=await j({userOp:p,options:e});if(p.callGasLimit=y.callGasLimit,p.verificationGasLimit=y.verificationGasLimit,p.preVerificationGas=y.preVerificationGas,f&&f!=="0x"){const m=await z({userOp:p,options:e});m.paymasterAndData&&m.paymasterAndData!=="0x"&&(p.paymasterAndData=m.paymasterAndData)}}}else{const u=await j({userOp:p,options:e});p.callGasLimit=u.callGasLimit,p.verificationGasLimit=u.verificationGasLimit,p.preVerificationGas=u.preVerificationGas}return{...p,signature:"0x"}}async function wt(t){const{userOp:n,options:e}=t,a=bt({userOp:n,entryPoint:e.overrides?.entrypointAddress||_,chainId:e.chain.id});if(e.personalAccount.signMessage){const s=await e.personalAccount.signMessage({message:{raw:Se(a)}});return{...n,signature:s}}throw new Error("signMessage not implemented in signingAccount")}async function vt(t){const{factoryContract:n}=t,e=yt({factoryContract:n,options:t});return L([n.address,await C(e)])}function bt(t){const{userOp:n,entryPoint:e,chainId:a}=t,s=T(n.initCode),r=T(n.callData),i=T(n.paymasterAndData),o=B([{type:"address"},{type:"uint256"},{type:"bytes32"},{type:"bytes32"},{type:"uint256"},{type:"uint256"},{type:"uint256"},{type:"uint256"},{type:"uint256"},{type:"bytes32"}],[n.sender,n.nonce,s,r,n.callGasLimit,n.verificationGasLimit,n.preVerificationGas,n.maxFeePerGas,n.maxPriorityFeePerGas,i]),c=B([{type:"bytes32"},{type:"address"},{type:"uint256"}],[T(o),e,BigInt(a)]);return T(c)}function xt(t){return t.id==="smart"}const S=new WeakMap,O=new WeakMap;async function Tt(t,n,e){const{personalAccount:a,client:s,chain:r}=n;if(!a)throw new Error("Personal wallet does not have an account");const i=e,o=i.factoryAddress??Re,c=r??i.chain,d="gasless"in i?i.gasless:i.sponsorGas;if(ct(c))return[Dt({creationOptions:e,connectionOptions:n,chain:c,sponsorGas:d}),c];const p=V({client:s,address:o,chain:c}),u=await mt(p,{personalAccountAddress:a.address,...i}).then(m=>m).catch(m=>{throw new Error(`Failed to get account address with factory contract ${p.address} on chain ID ${c.id}. Are you on the right chain?`,{cause:m})}),f=V({client:s,address:u,chain:c}),y=await _t({...i,chain:c,sponsorGas:d,personalAccount:a,accountContract:f,factoryContract:p,client:s});return S.set(a,t),O.set(t,a),[y,c]}async function Pt(t){const n=O.get(t);n&&(S.delete(n),O.delete(t))}async function _t(t){const{accountContract:n}=t,e={address:n.address,async sendTransaction(a){const s=ht({accountContract:n,options:t,transaction:a});return q({executeTx:s,options:t})},async sendBatchTransaction(a){const s=gt({accountContract:n,options:t,transactions:a});return q({executeTx:s,options:t})},async signMessage({message:a}){const[{isContractDeployed:s},{readContract:r},{encodeAbiParameters:i},{hashMessage:o},{checkContractWalletSignature:c}]=await Promise.all([g(()=>import("./index.a890a1de.js").then(m=>m.ht),["assets/index.a890a1de.js","assets/index.999128e1.css"]),g(()=>import("./index.a890a1de.js").then(m=>m.hq),["assets/index.a890a1de.js","assets/index.999128e1.css"]),g(()=>import("./index.a890a1de.js").then(m=>m.hp),["assets/index.a890a1de.js","assets/index.999128e1.css"]),g(()=>import("./hashMessage.7ec2bc37.js"),["assets/hashMessage.7ec2bc37.js","assets/index.a890a1de.js","assets/index.999128e1.css"]),g(()=>import("./checkContractWalletSignature.e9675de9.js"),["assets/checkContractWalletSignature.e9675de9.js","assets/isValidSignature.9423c56d.js","assets/index.a890a1de.js","assets/index.999128e1.css"])]);await s(n)||(console.log("Account contract not deployed yet. Deploying account before signing message"),await W({options:t,account:e,accountContract:n}));const p=o(a);let u=!1;try{await r({contract:n,method:"function getMessageHash(bytes32 _hash) public view returns (bytes32)",params:[p]}),u=!0}catch{}let f;if(u){const m=i([{type:"bytes32"}],[p]);f=await t.personalAccount.signTypedData({domain:{name:"Account",version:"1",chainId:t.chain.id,verifyingContract:n.address},primaryType:"AccountMessage",types:{AccountMessage:[{name:"message",type:"bytes"}]},message:{message:m}})}else f=await t.personalAccount.signMessage({message:a});if(await c({contract:n,message:a,signature:f}))return f;throw new Error("Unable to verify signature on smart account, please make sure the smart account is deployed and the signature is valid.")},async signTypedData(a){const s=se(a),[{isContractDeployed:r},{readContract:i},{encodeAbiParameters:o},{checkContractWalletSignedTypedData:c}]=await Promise.all([g(()=>import("./index.a890a1de.js").then(l=>l.ht),["assets/index.a890a1de.js","assets/index.999128e1.css"]),g(()=>import("./index.a890a1de.js").then(l=>l.hq),["assets/index.a890a1de.js","assets/index.999128e1.css"]),g(()=>import("./index.a890a1de.js").then(l=>l.hp),["assets/index.a890a1de.js","assets/index.999128e1.css"]),g(()=>import("./checkContractWalletSignedTypedData.dbe3b26d.js"),["assets/checkContractWalletSignedTypedData.dbe3b26d.js","assets/isValidSignature.9423c56d.js","assets/index.a890a1de.js","assets/index.999128e1.css","assets/toRlp.583474b7.js"])]);if(s.domain?.verifyingContract?.toLowerCase()===n.address?.toLowerCase())return t.personalAccount.signTypedData(s);await r(n)||(console.log("Account contract not deployed yet. Deploying account before signing message"),await W({options:t,account:e,accountContract:n}));const u=We(s);let f=!1;try{await i({contract:n,method:"function getMessageHash(bytes32 _hash) public view returns (bytes32)",params:[u]}),f=!0}catch{}let y;if(f){const l=o([{type:"bytes32"}],[u]);y=await t.personalAccount.signTypedData({domain:{name:"Account",version:"1",chainId:t.chain.id,verifyingContract:n.address},primaryType:"AccountMessage",types:{AccountMessage:[{name:"message",type:"bytes"}]},message:{message:l}})}else y=await t.personalAccount.signTypedData(s);if(await c({contract:n,data:s,signature:y}))return y;throw new Error("Unable to verify signature on smart account, please make sure the smart account is deployed and the signature is valid.")},async onTransactionRequested(a){return t.personalAccount.onTransactionRequested?.(a)}};return e}function Dt(t){const{creationOptions:n,connectionOptions:e,chain:a}=t,s={address:e.personalAccount.address,async sendTransaction(r){const i={data:r.data,to:r.to??void 0,value:r.value??0n,chain:He(r.chainId),client:e.client};let o=await at({account:s,transaction:i});if(t.sponsorGas){const p=await ft({options:{client:e.client,overrides:n.overrides,chain:a},transaction:o});o={...o,...p}}const c=await nt({account:s,chainId:a.id,eip712Transaction:o});return{transactionHash:(await lt({options:{client:e.client,overrides:n.overrides,chain:a},transaction:o,signedTransaction:c})).transactionHash,client:e.client,chain:a}},async signMessage({message:r}){return e.personalAccount.signMessage({message:r})},async signTypedData(r){const i=se(r);return e.personalAccount.signTypedData(i)},async onTransactionRequested(r){return e.personalAccount.onTransactionRequested?.(r)}};return s}async function W(t){const{options:n,account:e,accountContract:a}=t,[{sendTransaction:s},{prepareTransaction:r}]=await Promise.all([g(()=>import("./index.a890a1de.js").then(c=>c.hs),["assets/index.a890a1de.js","assets/index.999128e1.css"]),g(()=>import("./index.a890a1de.js").then(c=>c.ho),["assets/index.a890a1de.js","assets/index.999128e1.css"])]),i=r({client:n.client,chain:n.chain,to:a.address,value:0n,gas:50000n});return await s({transaction:i,account:e})}async function q(t){const{executeTx:n,options:e}=t,a=await At({executeTx:n,options:e}),s=await wt({options:e,userOp:a}),r=await ut({options:e,userOp:s}),i=await Gt({options:e,userOpHash:r});return{client:e.client,chain:e.chain,transactionHash:i.transactionHash}}async function Gt(t){const{options:n,userOpHash:e}=t,a=12e4,s=1e3,r=Date.now()+a;for(;Date.now()<r;){const i=await pt({options:n,userOpHash:e});if(i)return i;await new Promise(o=>setTimeout(o,s))}throw new Error("Timeout waiting for userOp to be mined")}const It=Object.freeze(Object.defineProperty({__proto__:null,isSmartWallet:xt,personalAccountToSmartAccountMap:S,connectSmartWallet:Tt,disconnectSmartWallet:Pt},Symbol.toStringTag,{value:"Module"}));export{We as h,It as i};
