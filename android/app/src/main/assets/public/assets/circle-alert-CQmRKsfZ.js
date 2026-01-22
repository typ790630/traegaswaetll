import{z as a,D as u,c as $}from"./index-DiZJZs_I.js";class f extends a{constructor({value:t}){super(`Number \`${t}\` is not a valid decimal number.`,{name:"InvalidDecimalNumberError"})}}function g(n,t){if(!/^(-?)([0-9]*)\.?([0-9]*)$/.test(n))throw new f({value:n});let[r,e="0"]=n.split(".");const s=r.startsWith("-");if(s&&(r=r.slice(1)),e=e.replace(/(0+)$/,""),t===0)Math.round(+`.${e}`)===1&&(r=`${BigInt(r)+1n}`),e="";else if(e.length>t){const[i,o,l]=[e.slice(0,t-1),e.slice(t-1,t),e.slice(t)],c=Math.round(+`${o}.${l}`);c>9?e=`${BigInt(i)+BigInt(1)}0`.padStart(i.length+1,"0"):e=`${i}${c}`,e.length>t&&(e=e.slice(1),r=`${BigInt(r)+1n}`),e=e.slice(0,t)}else e=e.padEnd(t,"0");return BigInt(`${s?"-":""}${r}${e}`)}function y(n,t="wei"){return g(n,u[t])}/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],I=$("circle-alert",h);export{I as C,y as p};
