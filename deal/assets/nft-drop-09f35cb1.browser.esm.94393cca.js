import{D as i}from"./QueryParams-1a366d99.browser.esm.b689a7c0.js";import{et as h,aN as u,ae as d,eG as g,aO as f,bF as C,B as o,b2 as y,A as w,a7 as n,aa as p}from"./index.a890a1de.js";import{a as W,b as A,G as T,C as b}from"./contract-appuri-5179a994.browser.esm.c8757e2e.js";import{C as S}from"./contract-interceptor-d7b164a7.browser.esm.b65ebba9.js";import{C as E,D as R,a as N}from"./contract-owner-acb6dbd4.browser.esm.9c46ab5d.js";import{C as k}from"./contract-platform-fee-1b7488fe.browser.esm.17f43390.js";import{C as v}from"./contract-roles-96577e74.browser.esm.2ca5c113.js";import{C as F}from"./contract-sales-eafd7bcb.browser.esm.30a70f96.js";import{D as I}from"./drop-claim-conditions-1d735fac.browser.esm.e65778c2.js";import{S as O}from"./erc-721-standard-c3e8d5c6.browser.esm.9326ee5c.js";import{P as U}from"./thirdweb-checkout-f66628dc.browser.esm.83f8e9c7.js";import"./setErc20Allowance-204eaca5.browser.esm.52b9c268.js";import"./index.244ea9bd.js";import"./treeify.2855ae70.js";import"./assertEnabled-e1dff38a.browser.esm.4361dd7c.js";import"./erc-721-2f25ddb1.browser.esm.ad9a4fcd.js";class m extends O{static contractRoles=h;constructor(t,r,a){let e=arguments.length>3&&arguments[3]!==void 0?arguments[3]:{},s=arguments.length>4?arguments[4]:void 0,c=arguments.length>5?arguments[5]:void 0,l=arguments.length>6&&arguments[6]!==void 0?arguments[6]:new u(t,r,s,e,a);super(l,a,c),this.abi=d.parse(s||[]),this.metadata=new W(this.contractWrapper,g,this.storage),this.app=new A(this.contractWrapper,this.metadata,this.storage),this.roles=new v(this.contractWrapper,m.contractRoles),this.royalties=new E(this.contractWrapper,this.metadata),this.sales=new F(this.contractWrapper),this.claimConditions=new I(this.contractWrapper,this.metadata,this.storage),this.encoder=new f(this.contractWrapper),this.estimator=new T(this.contractWrapper),this.events=new b(this.contractWrapper),this.platformFees=new k(this.contractWrapper),this.revealer=new R(this.contractWrapper,this.storage,C.name,()=>this.erc721.nextTokenIdToMint()),this.interceptor=new S(this.contractWrapper),this.owner=new N(this.contractWrapper),this.checkout=new U(this.contractWrapper)}onNetworkUpdated(t){this.contractWrapper.updateSignerOrProvider(t)}getAddress(){return this.contractWrapper.address}async totalSupply(){const[t,r]=await Promise.all([this.totalClaimedSupply(),this.totalUnclaimedSupply()]);return t.add(r)}async getAllClaimed(t){const r=o.from(t?.start||0).toNumber(),a=o.from(t?.count||i).toNumber(),e=Math.min((await this.contractWrapper.read("nextTokenIdToClaim",[])).toNumber(),r+a);return await Promise.all(Array.from(Array(e).keys()).map(s=>this.get(s.toString())))}async getAllUnclaimed(t){const r=o.from(t?.start||0).toNumber(),a=o.from(t?.count||i).toNumber(),e=o.from(Math.max((await this.contractWrapper.read("nextTokenIdToClaim",[])).toNumber(),r)),s=o.from(Math.min((await this.contractWrapper.read("nextTokenIdToMint",[])).toNumber(),e.toNumber()+a));return await Promise.all(Array.from(Array(s.sub(e).toNumber()).keys()).map(c=>this.erc721.getTokenMetadata(e.add(c).toString())))}async totalClaimedSupply(){return this.erc721.totalClaimedSupply()}async totalUnclaimedSupply(){return this.erc721.totalUnclaimedSupply()}async isTransferRestricted(){return!await this.contractWrapper.read("hasRole",[y("transfer"),w])}createBatch=n(async(t,r)=>this.erc721.lazyMint.prepare(t,r));async getClaimTransaction(t,r){let a=arguments.length>2&&arguments[2]!==void 0?arguments[2]:!0;return this.erc721.getClaimTransaction(t,r,{checkERC20Allowance:a})}claimTo=n((()=>{var t=this;return async function(r,a){let e=arguments.length>2&&arguments[2]!==void 0?arguments[2]:!0;return t.erc721.claimTo.prepare(r,a,{checkERC20Allowance:e})}})());claim=n((()=>{var t=this;return async function(r){let a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return t.claimTo.prepare(await t.contractWrapper.getSignerAddress(),r,a)}})());burn=n(async t=>this.erc721.burn.prepare(t));async get(t){return this.erc721.get(t)}async ownerOf(t){return this.erc721.ownerOf(t)}async balanceOf(t){return this.erc721.balanceOf(t)}async balance(){return this.erc721.balance()}async isApproved(t,r){return this.erc721.isApproved(t,r)}transfer=n(async(t,r)=>this.erc721.transfer.prepare(t,r));setApprovalForAll=n(async(t,r)=>this.erc721.setApprovalForAll.prepare(t,r));setApprovalForToken=n(async(t,r)=>p.fromContractWrapper({contractWrapper:this.contractWrapper,method:"approve",args:[t,r]}));async prepare(t,r,a){return p.fromContractWrapper({contractWrapper:this.contractWrapper,method:t,args:r,overrides:a})}async call(t,r,a){return this.contractWrapper.call(t,r,a)}}export{m as NFTDrop};
