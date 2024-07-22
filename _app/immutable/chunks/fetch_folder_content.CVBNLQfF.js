import{A as s}from"./app.config.BO6XNHuD.js";async function l(r,a=!1){var o=s+"/climate/get_content?type="+r;a&&(o+="&convertable=true");const t=await fetch(o,{method:"GET"});let e=[];if(!t.ok){var n=await t.text();throw new Error(`${t.status} ${t.statusText}
Reason: ${n}`)}return e=await t.json(),e.content.sort(),e}export{l as _};
