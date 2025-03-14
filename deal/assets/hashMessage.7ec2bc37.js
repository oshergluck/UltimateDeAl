import{he as e,hf as a,fW as i,fD as o}from"./index.a890a1de.js";const f=`Ethereum Signed Message:
`;function h(t,n){const r=(()=>typeof t=="string"?e(t):t.raw instanceof Uint8Array?t.raw:a(t.raw))(),s=e(`${f}${r.length}`);return i(o([s,r]),n)}export{h as hashMessage};
