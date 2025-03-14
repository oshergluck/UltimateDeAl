import{eO as h,aN as l,ae as u,eP as g,aO as d,aw as s,b2 as f,A as C,a7 as e,aa as c}from"./index.a890a1de.js";import{a as w,b as W,G as y,C as T}from"./contract-appuri-5179a994.browser.esm.c8757e2e.js";import{C as R}from"./contract-interceptor-d7b164a7.browser.esm.b65ebba9.js";import{C as A}from"./contract-platform-fee-1b7488fe.browser.esm.17f43390.js";import{C as b}from"./contract-roles-96577e74.browser.esm.2ca5c113.js";import{C as O}from"./contract-sales-eafd7bcb.browser.esm.30a70f96.js";import{D as E}from"./drop-claim-conditions-1d735fac.browser.esm.e65778c2.js";import{S}from"./erc-20-standard-7a0d0c3e.browser.esm.146319ae.js";import"./index.244ea9bd.js";import"./treeify.2855ae70.js";import"./assertEnabled-e1dff38a.browser.esm.4361dd7c.js";import"./setErc20Allowance-204eaca5.browser.esm.52b9c268.js";import"./erc-20-ec03f6d3.browser.esm.5d5c4b0e.js";class i extends S{static contractRoles=h;constructor(t,r,a){let n=arguments.length>3&&arguments[3]!==void 0?arguments[3]:{},o=arguments.length>4?arguments[4]:void 0,p=arguments.length>5?arguments[5]:void 0,m=arguments.length>6&&arguments[6]!==void 0?arguments[6]:new l(t,r,o,n,a);super(m,a,p),this.abi=u.parse(o||[]),this.metadata=new w(this.contractWrapper,g,this.storage),this.app=new W(this.contractWrapper,this.metadata,this.storage),this.roles=new b(this.contractWrapper,i.contractRoles),this.encoder=new d(this.contractWrapper),this.estimator=new y(this.contractWrapper),this.events=new T(this.contractWrapper),this.sales=new O(this.contractWrapper),this.platformFees=new A(this.contractWrapper),this.interceptor=new R(this.contractWrapper),this.claimConditions=new E(this.contractWrapper,this.metadata,this.storage)}async getVoteBalance(){return await this.getVoteBalanceOf(await this.contractWrapper.getSignerAddress())}async getVoteBalanceOf(t){return await this.erc20.getValue(await this.contractWrapper.read("getVotes",[await s(t)]))}async getDelegation(){return await this.getDelegationOf(await this.contractWrapper.getSignerAddress())}async getDelegationOf(t){return await this.contractWrapper.read("delegates",[await s(t)])}async isTransferRestricted(){return!await this.contractWrapper.read("hasRole",[f("transfer"),C])}claim=e((()=>{var t=this;return async function(r){let a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return t.claimTo.prepare(await t.contractWrapper.getSignerAddress(),r,a)}})());claimTo=e((()=>{var t=this;return async function(r,a){let n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:!0;return t.erc20.claimTo.prepare(r,a,{checkERC20Allowance:n})}})());delegateTo=e(async t=>c.fromContractWrapper({contractWrapper:this.contractWrapper,method:"delegate",args:[await s(t)]}));burnTokens=e(async t=>this.erc20.burn.prepare(t));burnFrom=e(async(t,r)=>this.erc20.burnFrom.prepare(t,r));async prepare(t,r,a){return c.fromContractWrapper({contractWrapper:this.contractWrapper,method:t,args:r,overrides:a})}async call(t,r,a){return this.contractWrapper.call(t,r,a)}}export{i as TokenDrop};
