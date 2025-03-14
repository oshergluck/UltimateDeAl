import{cK as w,cI as j,y as k,cL as t,cM as h,cN as c,cU as m,ga as J,cT as $,gb as Q,c$ as q,cV as T,gc as Y,dA as X,cP as Z,gd as ee,cR as S,d6 as C,d0 as F,ge as te,gf as ne,gg as oe,g0 as A,g8 as ae,cY as x,gh as W,gi as ie,gj as P,gk as re,gl as le,gm as se,d5 as ce,d2 as de,gn as ue,go as ge,g7 as he,d7 as me,gp as pe,gq as fe,gr as ye}from"./index.a890a1de.js";function we({countryCode:e,setCountryCode:n}){const r=w.exports.useRef(null),{data:i}=j({queryKey:["supported-sms-countries"],queryFn:async()=>{const{supportedSmsCountries:a}=await k(()=>import("./supported-sms-countries.838e9a92.js"),[]);return a}}),d=i??[{countryIsoCode:"US",countryName:"United States",phoneNumberCode:1}];return t(h,{children:c(xe,{ref:r,name:"countries",id:"countries",value:e,onChange:a=>{n(a.target.value)},style:{paddingLeft:m.md,paddingRight:"0"},children:[t(H,{style:{display:"none"},value:e,children:e}),d.map(a=>c(H,{value:`${a.countryIsoCode} +${a.phoneNumberCode}`,children:[a.countryName," +",a.phoneNumberCode," "]},a.countryIsoCode))]})})}const H=J(()=>{const e=$();return{color:e.colors.primaryText,background:e.colors.modalBg,transition:"background 0.3s ease","&:hover":{background:e.colors.tertiaryBg}}}),xe=Q(()=>{const e=$();return{fontSize:q.sm,display:"block",padding:m.sm,boxSizing:"border-box",outline:"none",border:"none",borderRadius:T.lg,color:e.colors.primaryText,WebkitAppearance:"none",appearance:"none",cursor:"pointer",background:"transparent","&::placeholder":{color:e.colors.secondaryText},"&[disabled]":{cursor:"not-allowed"},minWidth:"0px",maxWidth:"90px",textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap"}});function V(e){const[n,r]=w.exports.useState("US +1"),[i,d]=w.exports.useState(""),[a,l]=w.exports.useState(),[u,_]=w.exports.useState(!1),s=()=>{_(!0),!(!i||!!a)&&e.onSelect(e.format==="phone"?`+${n.split("+")[1]}${i}`:i)},p=u&&!!a||!i&&!!e.emptyErrorMessage&&u;return c("div",{style:{width:"100%"},children:[c(Y,{style:{position:"relative",display:"flex",flexDirection:"row"},"data-error":p,children:[e.format==="phone"&&t(we,{countryCode:n,setCountryCode:r}),t(X,{tabIndex:-1,placeholder:e.placeholder,style:{flexGrow:1,padding:`${m.md} ${e.format==="phone"?0:m.md}`},variant:"transparent",type:e.type,name:e.name,value:i,onChange:f=>{d(f.target.value),e.errorMessage?l(e.errorMessage(f.target.value)):l(void 0)},onKeyDown:f=>{f.key==="Enter"&&s()}}),t(Z,{onClick:s,style:{padding:m.md,borderRadius:`0 ${T.lg} ${T.lg} 0`},children:t(ee,{width:S.md,height:S.md})})]}),u&&a&&c(h,{children:[t(C,{y:"xs"}),t(F,{color:"danger",size:"sm",children:a})]}),!(u&&a)&&!i&&e.emptyErrorMessage&&u&&c(h,{children:[t(C,{y:"xs"}),t(F,{color:"danger",size:"sm",children:e.emptyErrorMessage})]})]})}function Se(e){switch(e){case"google":return"Sign In - Google Accounts";default:return`Sign In - ${e.slice(0,1).toUpperCase()}${e.slice(1)}`}}function be(e){switch(e){case"facebook":return{width:715,height:555};default:return{width:350,height:500}}}function Ie(e,n){const{height:r,width:i}=be(e),d=(window.innerHeight-r)/2,a=(window.innerWidth-i)/2,l=window.open("",void 0,`width=${i}, height=${r}, top=${d}, left=${a}`);if(l){const u=Se(e);l.document.title=u,l.document.body.innerHTML=ke,l.document.body.style.background=n.colors.modalBg,l.document.body.style.color=n.colors.accentText}return l&&window.addEventListener("beforeunload",()=>{l?.close()}),l}const ke=`
<svg class="loader" viewBox="0 0 50 50">
  <circle
    cx="25"
    cy="25"
    r="20"
    fill="none"
    stroke="currentColor"
    stroke-width="4"
  />
</svg>

<style>
  body,
  html {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loader {
    width: 50px;
    height: 50px;
    animation: spin 2s linear infinite;
  }

  .loader circle {
    animation: loading 1.5s linear infinite;
  }

  @keyframes loading {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
</style>
`,ve={google:te,apple:ne,facebook:oe};function Ee(e){return/^\S+@\S+\.\S+$/.test(e.replace(/\+/g,""))}const Ce=["email","phone","google","apple","facebook","passkey"],_e=e=>{const n=e.locale,{chain:r,client:i,connectModal:d}=A(),{wallet:a}=e,l=ae(),u=$(),_={google:n.signInWithGoogle,facebook:n.signInWithFacebook,apple:n.signInWithApple},s=e.wallet.getConfig(),p=s?.auth?.options||Ce,f=p.includes("passkey"),M=p.indexOf("email"),v=M!==-1,O=p.indexOf("phone"),b=O!==-1,[y,U]=w.exports.useState(()=>v&&b?M<O?"email":"phone":v?"email":b?"phone":"none"),B=y==="email"?n.emailPlaceholder:n.phonePlaceholder,R=y==="email"?n.emailRequired:n.phoneRequired;let E="text";y==="email"?E="email":y==="phone"&&(E="tel");const L=p.filter(o=>o==="google"||o==="apple"||o==="facebook"),z=L.length>0,K=async o=>{try{const g=Ie(o,u);if(!g)throw new Error("Failed to open login window");const D=a.connect({chain:r,client:i,strategy:o,openedWindow:g,closeOpenedWindow:G=>{G.close()}});await ue(o,ge),l({socialLogin:{type:o,connectionPromise:D}}),e.select()}catch(g){console.error(`Error sign in with ${o}`,g)}};function N(){l({passkeyLogin:!0}),e.select()}const I=L.length>1;return s?.metadata?.image&&(!s.metadata.image.height||!s.metadata.image.width)&&console.warn("Image is not properly configured. Please set height and width.",s.metadata.image),c(x,{flex:"column",gap:"md",style:{position:"relative"},children:[s?.metadata?.image&&t(x,{flex:"row",center:"both",children:t(W,{loading:"eager",client:i,style:{maxHeight:"100px",maxWidth:"300px"},src:s.metadata.image.src,alt:s.metadata.image.alt,width:Math.min(s.metadata.image.width??300,300)?.toString(),height:Math.min(s.metadata.image.height??100,100)?.toString()})}),z&&t(x,{flex:I?"row":"column",center:"x",gap:"sm",style:{justifyContent:"space-between"},children:L.map(o=>{const g=I?S.lg:S.md;return c(Le,{"aria-label":`Login with ${o}`,"data-variant":I?"icon":"full",variant:"outline",fullWidth:!I,onClick:()=>{K(o)},children:[t(W,{src:ve[o],width:g,height:g,client:i}),!I&&_[o]]},o)})}),d.size==="wide"&&z&&(v||b)&&t(ie,{text:n.or}),v&&t(h,{children:y==="email"?t(V,{type:E,onSelect:o=>{l({emailLogin:o}),e.select()},placeholder:B,name:"email",errorMessage:o=>{if(!Ee(o.toLowerCase()))return n.invalidEmail},emptyErrorMessage:R,submitButtonText:n.submitEmail}):t(P,{client:i,icon:re,onClick:()=>{U("email")},title:"Email address"})}),b&&t(h,{children:y==="phone"?t(V,{format:"phone",type:E,onSelect:o=>{l({phoneLogin:o.replace(/[-\(\) ]/g,"")}),e.select()},placeholder:B,name:"phone",errorMessage:o=>{const g=o.replace(/[-\(\) ]/g,"");if(!/^[0-9]+$/.test(g)&&b)return n.invalidPhone},emptyErrorMessage:R,submitButtonText:n.submitEmail}):t(P,{client:i,icon:le,onClick:()=>{U("phone")},title:"Phone number"})}),f&&t(h,{children:t(P,{client:i,icon:se,onClick:()=>{N()},title:"Passkey"})})]})};function We(e){const n=e.locale.emailLoginScreen,{connectModal:r,client:i}=A(),d=r.size==="compact",{initialScreen:a,screen:l}=he(),u=l===e.wallet&&a===e.wallet?void 0:e.goBack;return c(x,{fullHeight:!0,flex:"column",p:"lg",animate:"fadein",style:{minHeight:"250px"},children:[d?c(h,{children:[t(me,{onBack:u,title:c(h,{children:[r.titleIcon?t(W,{src:r.titleIcon,width:S.md,height:S.md,client:i}):null,t(pe,{children:r.title??n.title})]})}),t(C,{y:"lg"})]}):null,t(x,{expand:!0,flex:"column",center:"y",p:d?void 0:"lg",children:t(_e,{...e})}),d&&(r.showThirdwebBranding!==!1||r.termsOfServiceUrl||r.privacyPolicyUrl)&&t(C,{y:"xl"}),c(x,{flex:"column",gap:"lg",children:[t(fe,{termsOfServiceUrl:r.termsOfServiceUrl,privacyPolicyUrl:r.privacyPolicyUrl}),r.showThirdwebBranding!==!1&&t(ye,{})]})]})}const Le=ce(de)({"&[data-variant='full']":{display:"flex",justifyContent:"flex-start",padding:m.md,gap:m.md,fontSize:q.md,fontWeight:500,transition:"background-color 0.2s ease","&:active":{boxShadow:"none"}},"&[data-variant='icon']":{padding:m.sm,flexGrow:1}});async function Pe(e){switch(e){case"es_ES":return(await k(()=>import("./es.e7e368dd.js"),[])).default;case"ja_JP":return(await k(()=>import("./ja.6b51353b.js"),[])).default;case"tl_PH":return(await k(()=>import("./tl.9f9b8895.js"),[])).default;default:return(await k(()=>import("./en.4ccffe9e.js"),[])).default}}function $e(){const e=A().locale;return j({queryKey:["inAppWalletLocale",e],queryFn:()=>Pe(e),refetchOnMount:!1,refetchOnWindowFocus:!1})}export{_e as I,We as a,Ie as o,$e as u};
