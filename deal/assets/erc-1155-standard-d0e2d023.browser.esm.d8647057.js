import{a7 as s}from"./index.a890a1de.js";import{E as i}from"./erc-1155-c458d8f7.browser.esm.69f2720a.js";class h{get chainId(){return this._chainId}constructor(r,t,e){this.contractWrapper=r,this.storage=t,this.erc1155=new i(this.contractWrapper,this.storage,e),this._chainId=e}onNetworkUpdated(r){this.contractWrapper.updateSignerOrProvider(r)}getAddress(){return this.contractWrapper.address}async get(r){return this.erc1155.get(r)}async totalSupply(r){return this.erc1155.totalSupply(r)}async balanceOf(r,t){return this.erc1155.balanceOf(r,t)}async balance(r){return this.erc1155.balance(r)}async isApproved(r,t){return this.erc1155.isApproved(r,t)}transfer=s((()=>{var r=this;return async function(t,e,a){let n=arguments.length>3&&arguments[3]!==void 0?arguments[3]:[0];return r.erc1155.transfer.prepare(t,e,a,n)}})());transferBatch=s((()=>{var r=this;return async function(t,e,a,n){let c=arguments.length>4&&arguments[4]!==void 0?arguments[4]:[0];return r.erc1155.transferBatch.prepare(t,e,a,n,c)}})());setApprovalForAll=s(async(r,t)=>this.erc1155.setApprovalForAll.prepare(r,t));airdrop=s((()=>{var r=this;return async function(t,e,a){let n=arguments.length>3&&arguments[3]!==void 0?arguments[3]:[0];return r.erc1155.airdrop.prepare(t,e,a,n)}})())}export{h as S};
